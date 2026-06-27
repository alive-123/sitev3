(function () {
  "use strict";

  const D = window.CAP_DATA;
  const C = window.CAP_CORE;
  const app = document.querySelector("#app");
  const modalRoot = document.querySelector("#modal-root");
  const toastRegion = document.querySelector("#toast-region");
  const charts = new Map();

  const routes = [
    { path: "/today", label: "Aujourd'hui", icon: "sun-medium", group: "main" },
    { path: "/plan", label: "Mon plan", icon: "route", group: "main" },
    { path: "/calendar", label: "Agenda", icon: "calendar-days", group: "main" },
    { path: "/focus", label: "Focus", icon: "timer-reset", group: "main" },
    { path: "/subjects", label: "Matières", icon: "library-big", group: "study" },
    { path: "/cards", label: "Flashcards", icon: "layers-3", group: "study" },
    { path: "/errors", label: "Mes erreurs", icon: "scan-search", group: "study" },
    { path: "/exams", label: "Examens blancs", icon: "file-check-2", group: "study" },
    { path: "/progress", label: "Progression", icon: "chart-no-axes-combined", group: "review" },
    { path: "/review", label: "Bilan", icon: "notebook-tabs", group: "review" },
    { path: "/settings", label: "Réglages", icon: "settings-2", group: "review" },
  ];

  let focusTimer = {
    running: false,
    paused: false,
    duration: 25 * 60,
    remaining: 25 * 60,
    endAt: null,
    interval: null,
    distractions: 0,
    startedAt: null,
  };
  let focusPreset = 25;
  let cardReveal = false;
  let cardCursor = 0;
  let installPrompt = null;

  const esc = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  const icon = (name, size = 18) =>
    `<i data-lucide="${name}" aria-hidden="true" style="width:${size}px;height:${size}px"></i>`;
  const formatDate = (value, options = { day: "numeric", month: "short" }) =>
    new Intl.DateTimeFormat("fr-FR", options).format(new Date(`${value}T12:00:00`));
  const formatLongDate = (value = C.today()) =>
    formatDate(value, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const formatMinutes = (value) => {
    const minutes = Number(value || 0);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? `${hours} h ${rest}` : `${hours} h`;
  };
  const percent = (value) => `${Math.round(Number(value || 0))}%`;

  function path() {
    const hash = location.hash.replace(/^#/, "");
    const candidate = hash.split("?")[0];
    return routes.some((route) => route.path === candidate) ? candidate : "/today";
  }

  function query() {
    const hash = location.hash.replace(/^#/, "");
    return new URLSearchParams(hash.includes("?") ? hash.split("?")[1] : "");
  }

  function go(target) {
    location.hash = target;
  }

  function toast(message, tone = "default") {
    const id = C.uid("toast");
    toastRegion.insertAdjacentHTML(
      "beforeend",
      `<div class="toast ${tone}" id="${id}">${icon(
        tone === "success" ? "circle-check" : tone === "warning" ? "triangle-alert" : "info",
      )}<span>${esc(message)}</span></div>`,
    );
    window.lucide?.createIcons();
    setTimeout(() => document.getElementById(id)?.remove(), 3200);
  }

  function modal(content, options = {}) {
    modalRoot.innerHTML = `
      <div class="modal-backdrop" data-action="close-modal">
        <section class="modal ${options.wide ? "wide" : ""}" role="dialog" aria-modal="true" aria-label="${esc(
          options.label || "Fenêtre",
        )}" data-modal-panel>
          <button class="icon-btn modal-close" type="button" data-action="close-modal" aria-label="Fermer">
            ${icon("x")}
          </button>
          ${content}
        </section>
      </div>`;
    window.lucide?.createIcons();
  }

  function closeModal() {
    modalRoot.innerHTML = "";
  }

  function subjectChip(subjectId, compact = false) {
    const subject = C.subjectById(subjectId);
    if (!subject) return `<span class="chip">Général</span>`;
    return `<span class="subject-chip ${compact ? "compact" : ""}" style="--subject:${subject.color};--subject-soft:${subject.soft}">
      <span class="subject-dot"></span>${compact ? subject.short : esc(subject.name)}
    </span>`;
  }

  function modeLabel(modeId) {
    return D.learningModes.find((mode) => mode.id === modeId)?.label || "Session";
  }

  function progressBar(value, color = "var(--blue)") {
    return `<div class="progress-track" role="progressbar" aria-valuenow="${Math.round(
      value,
    )}" aria-valuemin="0" aria-valuemax="100"><span style="width:${C.clamp(
      value,
      0,
      100,
    )}%;--bar-color:${color}"></span></div>`;
  }

  function emptyState(iconName, title, text, action = "") {
    return `<div class="empty-state">${icon(iconName, 28)}<strong>${esc(title)}</strong><p>${esc(
      text,
    )}</p>${action}</div>`;
  }

  function layout(content, options = {}) {
    const state = C.getState();
    const activePath = path();
    const route = routes.find((item) => item.path === activePath);
    document.documentElement.dataset.theme = state.profile.theme;
    document.documentElement.classList.toggle("reduced-motion", state.profile.reducedMotion);
    document.body.classList.toggle("focus-page", activePath === "/focus");

    const navGroup = (group, title) => `
      <p class="nav-group-title">${title}</p>
      ${routes
        .filter((item) => item.group === group)
        .map(
          (item) => `<a href="#${item.path}" class="nav-link ${
            activePath === item.path ? "active" : ""
          }" aria-current="${activePath === item.path ? "page" : "false"}">
            ${icon(item.icon)}<span>${item.label}</span>
          </a>`,
        )
        .join("")}`;

    app.innerHTML = `
      <div class="app-shell">
        <aside class="sidebar" aria-label="Navigation principale">
          <a href="#/today" class="brand">
            <span class="brand-mark">C</span>
            <span><strong>CAP DAEU</strong><small>Espace d'Elias</small></span>
          </a>
          <nav class="side-nav">
            ${navGroup("main", "Organiser")}
            ${navGroup("study", "Apprendre")}
            ${navGroup("review", "Mesurer")}
          </nav>
          <div class="sidebar-footer">
            <div class="deadline-mini">
              <span>${icon("flag", 16)} Cap octobre</span>
              <strong>${C.daysUntilTarget()} jours</strong>
            </div>
            <button class="btn ghost full" type="button" data-action="quick-add">
              ${icon("plus")} Ajouter
            </button>
          </div>
        </aside>
        <div class="main-column">
          <header class="topbar">
            <div class="topbar-title">
              <button class="icon-btn mobile-menu-btn" type="button" data-action="open-menu" aria-label="Ouvrir le menu">${icon(
                "menu",
              )}</button>
              <div>
                <span class="topbar-kicker">${formatLongDate()}</span>
                <strong>${esc(options.title || route?.label || "CAP DAEU")}</strong>
              </div>
            </div>
            <div class="topbar-actions">
              <button class="icon-btn" type="button" data-action="toggle-theme" aria-label="Changer de thème" title="Changer de thème">${icon(
                state.profile.theme === "dark" ? "sun" : "moon",
              )}</button>
              <button class="btn primary top-focus" type="button" data-go="/focus">${icon(
                "play",
                16,
              )} Commencer</button>
            </div>
          </header>
          <main class="main-content" id="main-content">${content}</main>
        </div>
        <nav class="bottom-nav" aria-label="Navigation mobile">
          ${[
            ["/today", "sun-medium", "Aujourd'hui"],
            ["/calendar", "calendar-days", "Agenda"],
            ["/focus", "play", "Focus"],
            ["/progress", "chart-no-axes-combined", "Progrès"],
            ["/subjects", "grid-2x2", "Plus"],
          ]
            .map(
              ([routePath, routeIcon, label]) =>
                `<a href="#${routePath}" class="${activePath === routePath ? "active" : ""}">${icon(
                  routeIcon,
                )}<span>${label}</span></a>`,
            )
            .join("")}
        </nav>
      </div>`;
    window.lucide?.createIcons();
  }

  function pageHeader(kicker, title, text, actions = "") {
    return `<header class="page-header">
      <div><p class="kicker">${esc(kicker)}</p><h1>${esc(title)}</h1><p>${esc(text)}</p></div>
      ${actions ? `<div class="header-actions">${actions}</div>` : ""}
    </header>`;
  }

  function todayView() {
    const state = C.getState();
    const week = C.weekStats();
    const rec = C.recommend();
    const subjectStats = D.subjects.map((subject) => ({
      ...subject,
      stats: C.subjectStats(subject.id),
    }));
    const dueCards = state.cards.filter((card) => card.due <= C.today()).length;
    const dueErrors = state.errors.filter(
      (error) => error.status !== "mastered" && error.nextReview <= C.today(),
    ).length;
    const todaysItems = state.schedule.filter((item) => item.date === C.today());
    const openTasks = state.tasks.filter((task) => task.date <= C.today() && !task.done);
    const phase = C.currentPhase();
    const tip = D.tips[new Date().getDate() % D.tips.length];

    layout(
      `
      <section class="today-grid">
        <article class="next-action" style="--subject:${rec.subject.color};--subject-soft:${rec.subject.soft}">
          <div class="next-action-top">
            <span class="live-label"><span></span> Ton prochain pas</span>
            ${subjectChip(rec.subject.id)}
          </div>
          <div class="next-action-content">
            <div>
              <p class="kicker">${esc(modeLabel(rec.mode))} · ${rec.minutes} min</p>
              <h1>${esc(rec.topic.name)}</h1>
              <p class="next-objective">${esc(rec.objective)}</p>
            </div>
            <div class="why-box">
              ${icon("sparkles", 20)}
              <div><strong>Pourquoi maintenant ?</strong><span>${esc(rec.reason)}.</span></div>
            </div>
          </div>
          <div class="next-action-footer">
            <button class="btn subject" type="button" data-action="start-recommendation" data-subject="${
              rec.subject.id
            }" data-topic="${rec.topic.id}" data-mode="${rec.mode}" data-minutes="${rec.minutes}">
              ${icon("play", 17)} Démarrer cette séance
            </button>
            <button class="btn ghost" type="button" data-action="energy-choice">${icon(
              "battery-medium",
              17,
            )} Adapter à mon énergie</button>
          </div>
        </article>

        <aside class="momentum-panel">
          <div class="panel-heading"><div><p class="kicker">Cette semaine</p><h2>Ton élan</h2></div><span class="trend up">${icon(
            "trending-up",
            15,
          )} régulier</span></div>
          <div class="momentum-ring" style="--progress:${week.rate * 3.6}deg">
            <div><strong>${Math.round(week.rate)}%</strong><span>${formatMinutes(week.minutes)} / ${formatMinutes(
              week.target,
            )}</span></div>
          </div>
          <div class="momentum-stats">
            <div><span>Série</span><strong>${C.streak()} j</strong></div>
            <div><span>Séances</span><strong>${week.sessions.length}</strong></div>
            <div><span>Plan suivi</span><strong>${week.completionRate}%</strong></div>
          </div>
        </aside>
      </section>

      <section class="metric-strip">
        <article><span class="metric-icon blue">${icon("clock-3")}</span><div><span>Temps total</span><strong>${formatMinutes(
          C.totalMinutes(),
        )}</strong></div></article>
        <article><span class="metric-icon coral">${icon("layers-3")}</span><div><span>À réviser</span><strong>${dueCards} cartes</strong></div></article>
        <article><span class="metric-icon amber">${icon("scan-search")}</span><div><span>Erreurs dues</span><strong>${dueErrors}</strong></div></article>
        <article><span class="metric-icon green">${icon("flag")}</span><div><span>Jusqu'au cap</span><strong>${C.daysUntilTarget()} jours</strong></div></article>
      </section>

      <section class="dashboard-columns">
        <article class="surface">
          <div class="section-heading">
            <div><p class="kicker">Programme du jour</p><h2>Une journée réaliste</h2></div>
            <a href="#/calendar" class="text-link">Agenda ${icon("arrow-right", 15)}</a>
          </div>
          <div class="today-list">
            ${
              todaysItems.length
                ? todaysItems
                    .map((item) => {
                      const topic = C.topicById(item.topic);
                      return `<div class="agenda-row ${item.status}">
                        <button class="check-button" type="button" data-action="toggle-plan" data-id="${
                          item.id
                        }" aria-label="Changer le statut">${icon(
                          item.status === "done" ? "circle-check-big" : "circle",
                          20,
                        )}</button>
                        <div class="agenda-time">${item.minutes}<small>min</small></div>
                        <div class="agenda-row-main">${subjectChip(item.subject, true)}<strong>${esc(
                          topic?.name || item.title,
                        )}</strong><span>${esc(modeLabel(item.mode))}</span></div>
                        <button class="icon-btn" type="button" data-action="start-plan" data-id="${
                          item.id
                        }" aria-label="Démarrer">${icon("play", 17)}</button>
                      </div>`;
                    })
                    .join("")
                : emptyState(
                    "calendar-plus",
                    "Rien de prévu aujourd'hui",
                    "Le copilote peut générer une séance adaptée.",
                    `<button class="btn small" data-action="energy-choice">Choisir une séance</button>`,
                  )
            }
            ${openTasks
              .map(
                (task) => `<div class="agenda-row task-row">
                  <button class="check-button" type="button" data-action="toggle-task" data-id="${
                    task.id
                  }" aria-label="Terminer la tâche">${icon("square", 19)}</button>
                  <div class="agenda-time task">${icon("list-todo", 18)}</div>
                  <div class="agenda-row-main">${subjectChip(task.subject, true)}<strong>${esc(
                    task.title,
                  )}</strong><span>Tâche rapide</span></div>
                </div>`,
              )
              .join("")}
          </div>
        </article>

        <article class="surface chart-surface">
          <div class="section-heading">
            <div><p class="kicker">Rythme</p><h2>7 derniers jours</h2></div>
            <a href="#/progress" class="text-link">Détails ${icon("arrow-right", 15)}</a>
          </div>
          <div class="chart-wrap compact"><canvas id="home-week-chart" aria-label="Temps de travail sur sept jours"></canvas></div>
          <div class="chart-note">${icon("circle-help", 16)} L'objectif est la régularité, pas une semaine parfaite.</div>
        </article>
      </section>

      <section class="section-block">
        <div class="section-heading">
          <div><p class="kicker">Matières</p><h2>Où tu en es vraiment</h2></div>
          <a href="#/subjects" class="text-link">Tous les chapitres ${icon("arrow-right", 15)}</a>
        </div>
        <div class="subject-overview-grid">
          ${subjectStats
            .map(
              (subject) => `<a href="#/subjects?subject=${subject.id}" class="subject-overview" style="--subject:${
                subject.color
              };--subject-soft:${subject.soft}">
                <div class="subject-overview-head"><span class="subject-icon">${icon(
                  subject.icon,
                  20,
                )}</span><span>${subject.short}</span></div>
                <strong>${esc(subject.name)}</strong>
                <div class="subject-level"><b>${subject.stats.mastery}%</b><span>maîtrise</span></div>
                ${progressBar(subject.stats.mastery, subject.color)}
                <small>${formatMinutes(subject.stats.recentMinutes)} sur 28 jours</small>
              </a>`,
            )
            .join("")}
        </div>
      </section>

      <section class="phase-banner" style="--phase:${phase.color}">
        <div><p class="kicker">${phase.label} · jusqu'au ${formatDate(
          phase.end,
        )}</p><h2>${esc(phase.name)}</h2><p>${esc(phase.goal)}</p></div>
        <div class="tip-card">${icon("lightbulb", 20)}<span><strong>Conseil du jour</strong>${esc(
          tip,
        )}</span></div>
        <a href="#/plan" class="btn dark">Voir le plan ${icon("arrow-right", 16)}</a>
      </section>`,
      { title: "Aujourd'hui" },
    );

    requestAnimationFrame(() => renderHomeChart());
  }

  function planView() {
    const state = C.getState();
    const weeks = C.planWeeks();
    const generatedCount = state.schedule.filter(
      (item) => item.source === "generated" && item.date >= C.today(),
    ).length;
    const monthGroups = {};
    state.schedule
      .filter((item) => item.date >= C.today() && item.date <= state.profile.targetDate)
      .forEach((item) => {
        const key = C.monthKey(item.date);
        if (!monthGroups[key]) monthGroups[key] = [];
        monthGroups[key].push(item);
      });

    const phaseWidth = (phase) => {
      const total = C.diffDays(D.phases[0].start, state.profile.targetDate);
      return (C.diffDays(phase.start, phase.end) / total) * 100;
    };

    layout(
      `
      ${pageHeader(
        "Trajectoire",
        "Ton plan jusqu'en octobre",
        "Un plan vivant : il se recalcule à partir de tes séances, de tes erreurs et des chapitres fragiles.",
        `<button class="btn primary" type="button" data-action="generate-plan">${icon(
          "wand-sparkles",
          17,
        )} Générer le plan</button>`,
      )}

      <section class="plan-summary">
        <div class="countdown-panel">
          <span class="eyebrow">Échéance personnelle</span>
          <strong>${C.daysUntilTarget()}</strong>
          <span>jours avant le ${formatDate(state.profile.targetDate, {
            day: "numeric",
            month: "long",
          })}</span>
        </div>
        <div class="plan-principles">
          <div>${icon("calendar-check")}<span><strong>${generatedCount}</strong> séances futures planifiées</span></div>
          <div>${icon("rotate-ccw")}<span><strong>1</strong> séance de rattrapage possible par semaine</span></div>
          <div>${icon("gauge")}<span><strong>${formatMinutes(
            state.profile.weeklyMinutes,
          )}</strong> objectif hebdomadaire</span></div>
        </div>
      </section>

      <section class="surface phase-roadmap">
        <div class="section-heading"><div><p class="kicker">Les 4 phases</p><h2>Monter en puissance sans se brûler</h2></div></div>
        <div class="phase-track">
          ${D.phases
            .map(
              (phase) => `<article class="phase-segment ${
                C.currentPhase().id === phase.id ? "current" : ""
              }" style="--phase:${phase.color};--phase-width:${phaseWidth(phase)}%">
                <span>${phase.label}</span><strong>${esc(phase.name)}</strong><small>${formatDate(
                  phase.start,
                )} → ${formatDate(phase.end)}</small>
              </article>`,
            )
            .join("")}
        </div>
        <div class="phase-details">
          ${D.phases
            .map(
              (phase) => `<div style="--phase:${phase.color}"><span></span><p><strong>${esc(
                phase.name,
              )}</strong>${esc(phase.goal)}</p></div>`,
            )
            .join("")}
        </div>
      </section>

      <section class="section-block">
        <div class="section-heading">
          <div><p class="kicker">Plan d'action</p><h2>Les prochaines semaines</h2></div>
          <div class="segmented" role="group" aria-label="Filtrer le plan">
            <button class="active" type="button" data-plan-filter="all">Tout</button>
            ${D.subjects
              .map(
                (subject) =>
                  `<button type="button" data-plan-filter="${subject.id}">${subject.short}</button>`,
              )
              .join("")}
          </div>
        </div>
        <div class="week-plan-list" id="week-plan-list">
          ${weeks
            .slice(0, 12)
            .map((week, index) => weekCard(week, index === 0))
            .join("")}
        </div>
      </section>

      <section class="surface plan-months">
        <div class="section-heading"><div><p class="kicker">Répartition</p><h2>Charge prévue par mois</h2></div></div>
        <div class="month-load-grid">
          ${Object.entries(monthGroups)
            .map(([month, items]) => {
              const minutes = C.totalMinutes(items);
              return `<article><strong>${formatDate(`${month}-01`, {
                month: "long",
                year: "numeric",
              })}</strong><span>${items.length} séances</span>${progressBar(
                Math.min(100, (minutes / 1000) * 100),
              )}<small>${formatMinutes(minutes)} prévues</small></article>`;
            })
            .join("") || emptyState("route-off", "Plan non généré", "Clique sur « Générer le plan » pour remplir les mois.")}
        </div>
      </section>`,
      { title: "Mon plan" },
    );
  }

  function weekCard(week, open = false) {
    const minutes = C.totalMinutes(week.items);
    const actual = C.totalMinutes(week.sessions);
    const status =
      week.end < C.today() ? "past" : week.start <= C.today() && week.end >= C.today() ? "current" : "future";
    return `<details class="week-card ${status}" ${open || status === "current" ? "open" : ""}>
      <summary>
        <div class="week-date"><span>Semaine du</span><strong>${formatDate(week.start, {
          day: "numeric",
          month: "long",
        })}</strong></div>
        <span class="phase-pill" style="--phase:${week.phase.color}">${esc(week.phase.name)}</span>
        <div class="week-load"><span>${week.items.length} séances</span><strong>${formatMinutes(
          minutes,
        )}</strong></div>
        <div class="week-actual"><span>réalisé</span><strong>${formatMinutes(actual)}</strong></div>
        ${icon("chevron-down")}
      </summary>
      <div class="week-sessions">
        ${
          week.items.length
            ? week.items
                .sort((a, b) => a.date.localeCompare(b.date))
                .map(
                  (item) => `<div class="week-session" data-subject-filter="${item.subject}">
                    <span class="date-tile"><b>${formatDate(item.date, {
                      weekday: "short",
                    })}</b>${formatDate(item.date, { day: "numeric" })}</span>
                    ${subjectChip(item.subject, true)}
                    <div><strong>${esc(C.topicById(item.topic)?.name || item.title)}</strong><span>${esc(
                      modeLabel(item.mode),
                    )} · ${item.minutes} min</span></div>
                    <span class="status-pill ${item.status}">${
                      item.status === "done" ? "Fait" : item.date < C.today() ? "À rattraper" : "Prévu"
                    }</span>
                    <button class="icon-btn" type="button" data-action="edit-plan" data-id="${
                      item.id
                    }" aria-label="Modifier">${icon("ellipsis")}</button>
                  </div>`,
                )
                .join("")
            : emptyState("calendar-x", "Semaine libre", "Aucune séance n'est encore programmée.")
        }
      </div>
    </details>`;
  }

  function calendarView() {
    const state = C.getState();
    const currentView = state.ui.calendarView || "month";
    const cursor = state.ui.calendarCursor || C.monthKey(C.today());
    const [year, month] = cursor.split("-").map(Number);
    const monthDate = `${cursor}-01`;
    const actions = `<button class="btn" type="button" data-action="add-session">${icon(
      "calendar-plus",
      17,
    )} Planifier</button>`;

    layout(
      `
      ${pageHeader(
        "Organisation",
        "Agenda de révision",
        "Visualise la vraie charge, déplace une séance si nécessaire et garde de la place pour la vie réelle.",
        actions,
      )}
      <section class="calendar-toolbar surface">
        <div class="calendar-nav">
          <button class="icon-btn" type="button" data-action="calendar-prev" aria-label="Période précédente">${icon(
            "chevron-left",
          )}</button>
          <button class="btn ghost" type="button" data-action="calendar-today">Aujourd'hui</button>
          <button class="icon-btn" type="button" data-action="calendar-next" aria-label="Période suivante">${icon(
            "chevron-right",
          )}</button>
          <strong>${formatDate(monthDate, { month: "long", year: "numeric" })}</strong>
        </div>
        <div class="segmented" role="group" aria-label="Affichage de l'agenda">
          ${[
            ["month", "Mois"],
            ["week", "Semaine"],
            ["list", "Liste"],
          ]
            .map(
              ([id, label]) =>
                `<button type="button" class="${currentView === id ? "active" : ""}" data-calendar-view="${id}">${label}</button>`,
            )
            .join("")}
        </div>
      </section>
      <section class="calendar-layout">
        <div class="surface calendar-main">
          ${
            currentView === "month"
              ? monthCalendar(year, month)
              : currentView === "week"
                ? weekCalendar(C.mondayOf(C.today()))
                : listCalendar()
          }
        </div>
        <aside class="calendar-side">
          ${calendarQueue()}
        </aside>
      </section>`,
      { title: "Agenda" },
    );
  }

  function monthCalendar(year, month) {
    const first = new Date(year, month - 1, 1, 12);
    const firstDay = (first.getDay() + 6) % 7;
    const gridStart = new Date(year, month - 1, 1 - firstDay, 12);
    const cells = [];
    for (let index = 0; index < 42; index += 1) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      const iso = date.toISOString().slice(0, 10);
      const items = C.getState().schedule.filter((item) => item.date === iso);
      const sessions = C.getState().sessions.filter((item) => item.date === iso);
      cells.push(`<div class="calendar-cell ${date.getMonth() !== month - 1 ? "outside" : ""} ${
        iso === C.today() ? "today" : ""
      }">
        <button class="calendar-date" type="button" data-action="plan-date" data-date="${iso}">${date.getDate()}</button>
        <div class="calendar-events">
          ${items
            .slice(0, 3)
            .map((item) => {
              const subject = C.subjectById(item.subject);
              return `<button class="calendar-event ${item.status}" style="--subject:${
                subject.color
              };--subject-soft:${subject.soft}" type="button" data-action="edit-plan" data-id="${
                item.id
              }"><span>${subject.short}</span>${esc(item.title)}</button>`;
            })
            .join("")}
          ${items.length > 3 ? `<small>+${items.length - 3} autre(s)</small>` : ""}
          ${
            sessions.length
              ? `<span class="done-marker" title="${sessions.length} séance(s) réalisée(s)">${icon(
                  "circle-check",
                  14,
                )}${formatMinutes(C.totalMinutes(sessions))}</span>`
              : ""
          }
        </div>
      </div>`);
    }
    return `<div class="month-calendar">
      ${["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
        .map((day) => `<div class="weekday">${day}</div>`)
        .join("")}
      ${cells.join("")}
    </div>`;
  }

  function weekCalendar(start) {
    const hours = [8, 10, 12, 14, 16, 18, 20];
    const days = Array.from({ length: 7 }, (_, index) => C.addDays(start, index));
    return `<div class="week-calendar">
      <div class="week-grid-header"><span></span>${days
        .map(
          (day) => `<div class="${day === C.today() ? "today" : ""}"><span>${formatDate(day, {
            weekday: "short",
          })}</span><strong>${formatDate(day, { day: "numeric" })}</strong></div>`,
        )
        .join("")}</div>
      <div class="week-grid-body">
        ${hours
          .map(
            (hour) => `<div class="hour-row"><span>${hour} h</span>${days
              .map((day) => {
                const items = C.getState().schedule.filter((item) => item.date === day);
                return `<div class="hour-cell">${hour === 18 ? items.map(calendarBlock).join("") : ""}</div>`;
              })
              .join("")}</div>`,
          )
          .join("")}
      </div>
    </div>`;
  }

  function calendarBlock(item) {
    const subject = C.subjectById(item.subject);
    return `<button class="week-block" style="--subject:${subject.color};--subject-soft:${
      subject.soft
    }" type="button" data-action="edit-plan" data-id="${item.id}">
      <span>${subject.short} · ${item.minutes} min</span><strong>${esc(item.title)}</strong>
    </button>`;
  }

  function listCalendar() {
    const items = C.getState().schedule
      .filter((item) => item.date >= C.today())
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 30);
    const grouped = {};
    items.forEach((item) => {
      if (!grouped[item.date]) grouped[item.date] = [];
      grouped[item.date].push(item);
    });
    return `<div class="calendar-list">${Object.entries(grouped)
      .map(
        ([date, dayItems]) => `<section><div class="calendar-list-date"><strong>${formatDate(date, {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}</strong><span>${dayItems.length} séance(s)</span></div>${dayItems
          .map(
            (item) => `<button type="button" class="list-event" data-action="edit-plan" data-id="${
              item.id
            }">${subjectChip(item.subject, true)}<span><strong>${esc(item.title)}</strong><small>${esc(
              modeLabel(item.mode),
            )} · ${item.minutes} min</small></span>${icon("chevron-right")}</button>`,
          )
          .join("")}</section>`,
      )
      .join("")}</div>`;
  }

  function calendarQueue() {
    const state = C.getState();
    const missed = state.schedule.filter(
      (item) => item.status === "planned" && item.date < C.today(),
    );
    const dueCards = state.cards.filter((card) => card.due <= C.today());
    const dueErrors = state.errors.filter(
      (error) => error.status !== "mastered" && error.nextReview <= C.today(),
    );
    return `<div class="surface queue-panel">
      <div class="section-heading"><div><p class="kicker">À replacer</p><h2>File d'attente</h2></div></div>
      <div class="queue-list">
        ${missed
          .slice(0, 4)
          .map(
            (item) => `<button type="button" data-action="edit-plan" data-id="${
              item.id
            }">${icon("calendar-clock")}<span><strong>${esc(item.title)}</strong><small>Prévu le ${formatDate(
              item.date,
            )}</small></span>${subjectChip(item.subject, true)}</button>`,
          )
          .join("")}
        ${
          missed.length === 0
            ? `<div class="queue-clear">${icon("circle-check-big")}<span><strong>Planning à jour</strong><small>Aucune séance en retard.</small></span></div>`
            : ""
        }
      </div>
    </div>
    <div class="surface review-queue">
      <p class="kicker">Révisions dues</p>
      <a href="#/cards"><span class="metric-icon coral">${icon("layers-3")}</span><span><strong>${
        dueCards.length
      } flashcards</strong><small>Rappel espacé</small></span>${icon("arrow-right")}</a>
      <a href="#/errors"><span class="metric-icon amber">${icon("scan-search")}</span><span><strong>${
        dueErrors.length
      } erreurs</strong><small>À expliquer de nouveau</small></span>${icon("arrow-right")}</a>
    </div>`;
  }

  function focusView() {
    const state = C.getState();
    const params = query();
    const rec = C.recommend();
    const subjectId = params.get("subject") || state.ui.activeSubject || rec.subject.id;
    const subject = C.subjectById(subjectId);
    const topicId = params.get("topic") || rec.topic.id;
    const mode = params.get("mode") || rec.mode;
    const minutes = Number(params.get("minutes") || focusPreset || state.profile.defaultFocus);
    if (!focusTimer.running && !focusTimer.paused) {
      focusPreset = minutes;
      focusTimer.duration = minutes * 60;
      focusTimer.remaining = minutes * 60;
    }

    layout(
      `<section class="focus-layout">
        <div class="focus-main">
          <div class="focus-topline">
            <span class="focus-mode-label">${icon("circle-dot", 15)} Mode concentration</span>
            <button class="icon-btn" type="button" data-action="focus-fullscreen" aria-label="Plein écran">${icon(
              "maximize",
            )}</button>
          </div>
          <div class="focus-context">
            ${subjectChip(subjectId)}
            <select id="focus-topic" aria-label="Chapitre">
              ${subject.topics
                .map(
                  (topic) =>
                    `<option value="${topic.id}" ${topic.id === topicId ? "selected" : ""}>${esc(
                      topic.name,
                    )}</option>`,
                )
                .join("")}
            </select>
            <select id="focus-mode" aria-label="Mode d'étude">
              ${D.learningModes
                .map(
                  (item) =>
                    `<option value="${item.id}" ${item.id === mode ? "selected" : ""}>${esc(
                      item.label,
                    )}</option>`,
                )
                .join("")}
            </select>
          </div>
          <label class="focus-objective-label" for="focus-objective">Objectif de cette séance</label>
          <textarea class="focus-objective" id="focus-objective" rows="2">${esc(
            params.get("objective") || rec.objective,
          )}</textarea>
          <div class="timer-presets" role="group" aria-label="Durée">
            ${[
              [15, "Express"],
              [25, "Pomodoro"],
              [40, "Profond"],
              [50, "Long"],
            ]
              .map(
                ([value, label]) =>
                  `<button type="button" class="${minutes === value ? "active" : ""}" data-focus-preset="${value}" ${
                    focusTimer.running ? "disabled" : ""
                  }><strong>${value}</strong><span>${label}</span></button>`,
              )
              .join("")}
          </div>
          <div class="timer-orbit" style="--timer-progress:${timerProgress()}deg;--subject:${subject.color}">
            <div class="timer-display" id="timer-display">${timerText()}</div>
            <span id="timer-state">${focusTimer.running ? "Concentration en cours" : focusTimer.paused ? "En pause" : "Prêt quand tu l'es"}</span>
          </div>
          <div class="focus-controls">
            ${
              !focusTimer.running
                ? `<button class="btn focus-play" type="button" data-action="focus-start">${icon(
                    focusTimer.paused ? "play" : "play",
                  )}${focusTimer.paused ? "Reprendre" : "Démarrer"}</button>`
                : `<button class="btn focus-pause" type="button" data-action="focus-pause">${icon(
                    "pause",
                  )}Pause</button>`
            }
            <button class="btn ghost" type="button" data-action="focus-finish">${icon(
              "square",
              16,
            )}Terminer</button>
          </div>
          <button class="distraction-button" type="button" data-action="add-distraction">
            ${icon("mouse-pointer-click", 17)} Une distraction <span id="distraction-count">${
              focusTimer.distractions
            }</span>
          </button>
        </div>
        <aside class="focus-side">
          <div class="surface focus-method">
            <p class="kicker">Méthode de séance</p>
            <ol>
              <li><span>1</span><div><strong>Rappelle</strong><p>Écris ce que tu sais sans regarder.</p></div></li>
              <li><span>2</span><div><strong>Travaille</strong><p>Concentre-toi sur un objectif précis.</p></div></li>
              <li><span>3</span><div><strong>Teste</strong><p>Explique ou refais sans le support.</p></div></li>
              <li><span>4</span><div><strong>Trace</strong><p>Note l'erreur ou la prochaine action.</p></div></li>
            </ol>
          </div>
          <div class="surface sound-panel">
            <div><span class="metric-icon green">${icon("bell-ring")}</span><span><strong>Alarme active</strong><small>Son + notification si autorisée</small></span></div>
            <button class="btn small ghost" type="button" data-action="test-alarm">Tester</button>
          </div>
          <div class="surface focus-streak">
            <p class="kicker">Élan actuel</p><strong>${C.streak()} jours</strong><span>Chaque séance compte, même courte.</span>
          </div>
        </aside>
      </section>`,
      { title: "Focus" },
    );
  }

  function subjectsView() {
    const state = C.getState();
    const activeId = query().get("subject") || state.ui.activeSubject || "maths";
    const active = C.subjectById(activeId);
    const stats = C.subjectStats(activeId);
    const recommendedTopic = active.topics
      .slice()
      .sort(
        (a, b) =>
          (state.topicProgress[a.id]?.mastery || 0) - (state.topicProgress[b.id]?.mastery || 0),
      )[0];

    layout(
      `
      ${pageHeader(
        "Programme",
        "Matières et chapitres",
        "Une carte claire de tes acquis, de tes fragilités et du prochain chapitre à travailler.",
      )}
      <div class="subject-tabs" role="tablist">
        ${D.subjects
          .map(
            (subject) => `<a href="#/subjects?subject=${subject.id}" role="tab" aria-selected="${
              subject.id === activeId
            }" class="${subject.id === activeId ? "active" : ""}" style="--subject:${
              subject.color
            };--subject-soft:${subject.soft}">${icon(subject.icon)}<span>${esc(
              subject.name,
            )}</span><strong>${C.subjectStats(subject.id).mastery}%</strong></a>`,
          )
          .join("")}
      </div>
      <section class="subject-detail-head" style="--subject:${active.color};--subject-soft:${
        active.soft
      }">
        <div class="subject-title-block"><span>${icon(active.icon, 28)}</span><div><p class="kicker">${
          active.short
        } · ${active.topics.length} chapitres</p><h1>${esc(active.name)}</h1><p>${esc(
          active.description,
        )}</p></div></div>
        <div class="mastery-dial" style="--value:${stats.mastery * 3.6}deg"><div><strong>${
          stats.mastery
        }%</strong><span>maîtrise globale</span></div></div>
        <div class="subject-detail-actions"><button class="btn subject" data-action="start-topic" data-subject="${
          active.id
        }" data-topic="${recommendedTopic.id}">${icon("play", 17)} Travailler maintenant</button><button class="btn ghost" data-action="add-topic-task" data-subject="${
          active.id
        }">${icon("list-plus", 17)} Ajouter une tâche</button></div>
      </section>
      <section class="metric-strip compact">
        <article><span class="metric-icon blue">${icon("clock")}</span><div><span>28 derniers jours</span><strong>${formatMinutes(
          stats.recentMinutes,
        )}</strong></div></article>
        <article><span class="metric-icon coral">${icon("layers-3")}</span><div><span>Flashcards dues</span><strong>${
          stats.cardsDue
        }</strong></div></article>
        <article><span class="metric-icon amber">${icon("scan-search")}</span><div><span>Erreurs à revoir</span><strong>${
          stats.errorsDue
        }</strong></div></article>
      </section>
      <section class="section-block">
        <div class="section-heading"><div><p class="kicker">Chapitres</p><h2>Carte de maîtrise</h2></div><span class="legend"><i class="low"></i>Fragile <i class="mid"></i>En cours <i class="high"></i>Solide</span></div>
        <div class="topic-list">
          ${active.topics
            .map((topic, index) => {
              const progress = state.topicProgress[topic.id];
              const level =
                progress.mastery < 35 ? "Fragile" : progress.mastery < 70 ? "En cours" : "Solide";
              return `<article class="topic-row">
                <span class="topic-number">${String(index + 1).padStart(2, "0")}</span>
                <div class="topic-main"><strong>${esc(topic.name)}</strong><span>${
                  progress.sessions || 0
                } séance(s) · ${
                  progress.lastStudied ? `vu le ${formatDate(progress.lastStudied)}` : "pas encore travaillé"
                }</span></div>
                <div class="topic-progress"><div><span>${level}</span><strong>${Math.round(
                  progress.mastery,
                )}%</strong></div>${progressBar(progress.mastery, active.color)}</div>
                <div class="confidence" aria-label="Confiance ${progress.confidence} sur 5">${Array.from(
                  { length: 5 },
                  (_, dot) => `<span class="${dot < progress.confidence ? "filled" : ""}"></span>`,
                ).join("")}</div>
                <button class="icon-btn" type="button" data-action="topic-actions" data-subject="${
                  active.id
                }" data-topic="${topic.id}" aria-label="Actions">${icon("ellipsis")}</button>
              </article>`;
            })
            .join("")}
        </div>
      </section>`,
      { title: "Matières" },
    );
  }

  function cardsView() {
    const state = C.getState();
    const due = state.cards.filter((card) => card.due <= C.today());
    if (cardCursor >= due.length) cardCursor = 0;
    const card = due[cardCursor];
    const bySubject = D.subjects.map((subject) => ({
      ...subject,
      count: due.filter((cardItem) => cardItem.subject === subject.id).length,
    }));

    layout(
      `
      ${pageHeader(
        "Mémoire",
        "Flashcards intelligentes",
        "Révise juste avant d'oublier. Les intervalles s'adaptent à chacune de tes réponses.",
        `<button class="btn" type="button" data-action="add-card">${icon("plus", 17)} Nouvelle carte</button>`,
      )}
      <section class="review-dashboard">
        <div class="review-count"><span>À revoir aujourd'hui</span><strong>${due.length}</strong><small>sur ${
          state.cards.length
        } cartes</small></div>
        <div class="review-subjects">${bySubject
          .map(
            (subject) =>
              `<div style="--subject:${subject.color}"><span></span><strong>${subject.count}</strong><small>${subject.short}</small></div>`,
          )
          .join("")}</div>
        <div class="memory-note">${icon("brain")}<span><strong>Rappel actif</strong><small>Essaie de répondre avant de retourner la carte.</small></span></div>
      </section>
      <section class="flashcard-workspace">
        <div class="flashcard-stage">
          ${
            card
              ? `<div class="study-progress"><span>Carte ${cardCursor + 1} sur ${
                  due.length
                }</span>${progressBar((cardCursor / Math.max(1, due.length)) * 100)}</div>
              <button class="flashcard ${cardReveal ? "revealed" : ""}" type="button" data-action="reveal-card">
                <div class="flashcard-face front">${subjectChip(card.subject)}<p>Question</p><strong>${esc(
                  card.front,
                )}</strong><span>${icon("rotate-3d", 17)} Cliquer pour révéler</span></div>
                <div class="flashcard-face back">${subjectChip(card.subject)}<p>Réponse</p><strong>${esc(
                  card.back,
                )}</strong><span>Prochaine révision selon ta réponse</span></div>
              </button>
              <div class="rating-controls ${cardReveal ? "visible" : ""}">
                ${[
                  ["again", "rotate-ccw", "À revoir", "1 jour"],
                  ["hard", "brain-circuit", "Difficile", "~2 jours"],
                  ["good", "thumbs-up", "Bien", `~${Math.max(3, card.interval)} jours`],
                  ["easy", "zap", "Facile", `~${Math.max(4, card.interval * 2)} jours`],
                ]
                  .map(
                    ([value, iconName, label, next]) =>
                      `<button type="button" data-card-rating="${value}">${icon(
                        iconName,
                      )}<strong>${label}</strong><span>${next}</span></button>`,
                  )
                  .join("")}
              </div>`
              : emptyState(
                  "party-popper",
                  "Révisions terminées",
                  "Toutes les cartes prévues aujourd'hui ont été vues. Beau travail.",
                  `<button class="btn primary" data-go="/today">Retour à aujourd'hui</button>`,
                )
          }
        </div>
        <aside class="surface flashcard-insights">
          <p class="kicker">Comment ça marche</p>
          <h2>La bonne carte au bon moment</h2>
          <div class="interval-example"><span>Aujourd'hui</span>${icon("arrow-right")}<span>3 j</span>${icon(
            "arrow-right",
          )}<span>8 j</span>${icon("arrow-right")}<span>21 j</span></div>
          <p>Un souvenir facile revient plus tard. Une carte oubliée revient rapidement.</p>
          <hr />
          <strong>${state.reviews.length} réponses enregistrées</strong>
          <a href="#/progress" class="text-link">Voir les statistiques ${icon("arrow-right", 15)}</a>
        </aside>
      </section>`,
      { title: "Flashcards" },
    );
  }

  function errorsView() {
    const state = C.getState();
    const active = state.errors.filter((error) => error.status !== "mastered");
    const due = active.filter((error) => error.nextReview <= C.today());
    const mastered = state.errors.filter((error) => error.status === "mastered");
    layout(
      `
      ${pageHeader(
        "Apprendre de ses blocages",
        "Carnet d'erreurs",
        "Une erreur n'est pas une note contre toi : c'est une indication précise sur ce qu'il faut retravailler.",
        `<button class="btn primary" type="button" data-action="add-error">${icon(
          "plus",
          17,
        )} Noter une erreur</button>`,
      )}
      <section class="error-hero">
        <div><span class="metric-icon amber">${icon("scan-search", 23)}</span><div><p>À revoir maintenant</p><strong>${
          due.length
        }</strong></div></div>
        <div><span class="metric-icon blue">${icon("brain-circuit", 23)}</span><div><p>En apprentissage</p><strong>${
          active.length
        }</strong></div></div>
        <div><span class="metric-icon green">${icon("badge-check", 23)}</span><div><p>Maîtrisées</p><strong>${
          mastered.length
        }</strong></div></div>
        <p class="error-principle">${icon("quote", 18)} Je cherche la cause, j'écris la correction, puis je refais sans regarder.</p>
      </section>
      <section class="section-block">
        <div class="section-heading"><div><p class="kicker">Priorité</p><h2>Erreurs à expliquer aujourd'hui</h2></div></div>
        <div class="error-grid">
          ${
            due.length
              ? due.map(errorCard).join("")
              : emptyState("badge-check", "Rien d'urgent", "Aucune erreur n'arrive à révision aujourd'hui.")
          }
        </div>
      </section>
      <section class="section-block">
        <div class="section-heading"><div><p class="kicker">Bibliothèque</p><h2>Toutes les erreurs actives</h2></div></div>
        <div class="error-table surface">
          ${active
            .map(
              (error) => `<button type="button" class="error-table-row" data-action="open-error" data-id="${
                error.id
              }">${subjectChip(error.subject, true)}<span><strong>${esc(error.title)}</strong><small>${esc(
                error.context,
              )}</small></span><span class="status-pill ${error.status}">${
                error.status === "learning" ? "En apprentissage" : "À revoir"
              }</span><span>${formatDate(error.nextReview)}</span>${icon("chevron-right")}</button>`,
            )
            .join("")}
        </div>
      </section>`,
      { title: "Mes erreurs" },
    );
  }

  function errorCard(error) {
    return `<article class="error-card">
      <div class="error-card-head">${subjectChip(error.subject)}<span>Révision ${error.reviews + 1}</span></div>
      <h3>${esc(error.title)}</h3>
      <p><strong>Cause identifiée</strong>${esc(error.cause)}</p>
      <div class="correction-box"><strong>${icon("wrench", 16)} Correction</strong><span>${esc(
        error.correction,
      )}</span></div>
      <div class="error-actions"><button class="btn small ghost" data-error-review="again" data-id="${
        error.id
      }">Encore fragile</button><button class="btn small" data-error-review="understood" data-id="${
        error.id
      }">Compris</button><button class="btn small success" data-error-review="mastered" data-id="${
        error.id
      }">${icon("check", 15)} Maîtrisé</button></div>
    </article>`;
  }

  function examsView() {
    const state = C.getState();
    const sorted = state.exams.slice().sort((a, b) => a.date.localeCompare(b.date));
    const average = sorted.length
      ? sorted.reduce((sum, exam) => sum + (exam.score / exam.maxScore) * 20, 0) / sorted.length
      : 0;
    layout(
      `
      ${pageHeader(
        "Conditions réelles",
        "Examens blancs",
        "Mesure ton niveau sous contrainte, puis transforme chaque résultat en plan de correction.",
        `<button class="btn primary" type="button" data-action="add-exam">${icon(
          "plus",
          17,
        )} Ajouter un résultat</button>`,
      )}
      <section class="exam-dashboard">
        <article class="exam-score"><span>Moyenne actuelle</span><strong>${average.toFixed(
          1,
        )}<small>/20</small></strong><p>${sorted.length} épreuve(s) enregistrée(s)</p></article>
        <article class="surface exam-chart-panel"><div class="section-heading"><div><p class="kicker">Évolution</p><h2>Résultats</h2></div></div><div class="chart-wrap compact"><canvas id="exam-chart"></canvas></div></article>
        <article class="surface exam-next"><p class="kicker">Prochaine étape</p><h2>Mini-examen mixte</h2><p>45 minutes, sans support, puis 20 minutes de correction.</p><button class="btn" data-action="start-mock">${icon(
          "timer",
          17,
        )} Préparer l'épreuve</button></article>
      </section>
      <section class="section-block">
        <div class="section-heading"><div><p class="kicker">Historique</p><h2>Résultats et leçons</h2></div></div>
        <div class="exam-list surface">
          ${sorted
            .slice()
            .reverse()
            .map((exam) => {
              const normalized = (exam.score / exam.maxScore) * 20;
              return `<article><div class="exam-date">${formatDate(exam.date, {
                day: "2-digit",
                month: "short",
              })}</div>${subjectChip(exam.subject)}<div><strong>${esc(
                exam.title,
              )}</strong><span>${esc(exam.notes || "Aucune note")}</span></div><strong class="result ${
                normalized >= 10 ? "pass" : ""
              }">${normalized.toFixed(1)}<small>/20</small></strong><button class="icon-btn" data-action="exam-actions" data-id="${
                exam.id
              }">${icon("ellipsis")}</button></article>`;
            })
            .join("")}
        </div>
      </section>
      <section class="exam-protocol surface">
        <div><p class="kicker">Protocole</p><h2>Un examen blanc utile en 4 temps</h2></div>
        ${[
          ["1", "Choisir", "Un sujet et une durée réaliste."],
          ["2", "Faire", "Sans support et avec un chronomètre."],
          ["3", "Corriger", "En distinguant savoir, méthode et attention."],
          ["4", "Replanifier", "Créer une erreur ou une séance ciblée."],
        ]
          .map(
            ([number, title, text]) =>
              `<div><span>${number}</span><p><strong>${title}</strong>${text}</p></div>`,
          )
          .join("")}
      </section>`,
      { title: "Examens blancs" },
    );
    requestAnimationFrame(renderExamChart);
  }

  function progressView() {
    const state = C.getState();
    const week = C.weekStats();
    const subjectData = D.subjects.map((subject) => ({
      ...subject,
      ...C.subjectStats(subject.id),
    }));
    const heatmap = C.activityHeatmap();
    layout(
      `
      ${pageHeader(
        "Mesurer sans se juger",
        "Progression",
        "Des indicateurs pour décider quoi faire ensuite, pas pour culpabiliser.",
      )}
      <section class="metric-strip">
        <article><span class="metric-icon blue">${icon("clock-3")}</span><div><span>Temps cumulé</span><strong>${formatMinutes(
          C.totalMinutes(),
        )}</strong></div></article>
        <article><span class="metric-icon green">${icon("flame")}</span><div><span>Série actuelle</span><strong>${C.streak()} jours</strong></div></article>
        <article><span class="metric-icon coral">${icon("target")}</span><div><span>Objectif semaine</span><strong>${Math.round(
          week.rate,
        )}%</strong></div></article>
        <article><span class="metric-icon amber">${icon("brain")}</span><div><span>Maîtrise moyenne</span><strong>${Math.round(
          subjectData.reduce((sum, subject) => sum + subject.mastery, 0) / subjectData.length,
        )}%</strong></div></article>
      </section>
      <section class="progress-grid">
        <article class="surface chart-panel wide"><div class="section-heading"><div><p class="kicker">8 semaines</p><h2>Temps de travail</h2></div><span class="target-label">Cible ${formatMinutes(
          state.profile.weeklyMinutes,
        )}</span></div><div class="chart-wrap"><canvas id="weekly-chart"></canvas></div></article>
        <article class="surface chart-panel"><div class="section-heading"><div><p class="kicker">Répartition</p><h2>Par matière</h2></div></div><div class="chart-wrap"><canvas id="subject-chart"></canvas></div></article>
      </section>
      <section class="progress-grid second">
        <article class="surface mastery-panel">
          <div class="section-heading"><div><p class="kicker">Compétences</p><h2>Maîtrise par matière</h2></div></div>
          ${subjectData
            .map(
              (subject) => `<div class="mastery-row" style="--subject:${subject.color}"><span>${icon(
                subject.icon,
                18,
              )}${esc(subject.name)}</span>${progressBar(subject.mastery, subject.color)}<strong>${
                subject.mastery
              }%</strong></div>`,
            )
            .join("")}
        </article>
        <article class="surface heatmap-panel">
          <div class="section-heading"><div><p class="kicker">12 semaines</p><h2>Régularité</h2></div></div>
          <div class="heatmap" aria-label="Calendrier d'activité">${heatmap
            .map(
              (day) =>
                `<span class="level-${day.level}" title="${formatDate(day.date, {
                  day: "numeric",
                  month: "long",
                })} : ${day.minutes} min"></span>`,
            )
            .join("")}</div>
          <div class="heatmap-legend"><span>Moins</span><i class="level-0"></i><i class="level-1"></i><i class="level-2"></i><i class="level-3"></i><span>Plus</span></div>
        </article>
      </section>
      <section class="insight-banner">
        ${icon("sparkles", 24)}
        <div><p class="kicker">Lecture du copilote</p><h2>${progressInsight(subjectData, week)}</h2><p>${progressAdvice(
          subjectData,
          week,
        )}</p></div>
        <button class="btn dark" data-go="/review">Faire mon bilan</button>
      </section>`,
      { title: "Progression" },
    );
    requestAnimationFrame(renderProgressCharts);
  }

  function progressInsight(subjectData, week) {
    const strongest = subjectData.slice().sort((a, b) => b.mastery - a.mastery)[0];
    if (week.rate >= 100) return `Objectif atteint, avec ${strongest.name} comme point d'appui.`;
    if (week.rate >= 60) return "Le rythme est installé. Il reste à mieux répartir l'effort.";
    return "La meilleure progression viendra d'une séance courte aujourd'hui.";
  }

  function progressAdvice(subjectData, week) {
    const weakest = subjectData.slice().sort((a, b) => a.mastery - b.mastery)[0];
    if (week.rate >= 100)
      return `Garde un jour léger et utilise la prochaine séance pour ${weakest.name}.`;
    return `Priorité conseillée : ${weakest.name}, puis une révision d'erreur avant d'ajouter de nouvelles notions.`;
  }

  function reviewView() {
    const state = C.getState();
    const latest = state.reflections.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
    const week = C.weekStats();
    const wins = [
      week.sessions.length ? `${week.sessions.length} séances terminées` : "Première séance à lancer",
      `${formatMinutes(week.minutes)} investies cette semaine`,
      `${state.errors.filter((error) => error.status === "mastered").length} erreur(s) maîtrisée(s)`,
    ];
    layout(
      `
      ${pageHeader(
        "Prendre du recul",
        "Bilan hebdomadaire",
        "Cinq minutes pour comprendre la semaine et ajuster la suivante sans repartir de zéro.",
      )}
      <section class="review-layout">
        <form class="surface reflection-form" id="reflection-form">
          <div class="section-heading"><div><p class="kicker">Ma semaine</p><h2>Faire le point</h2></div><span>≈ 5 min</span></div>
          <label>De quoi suis-je fier cette semaine ?
            <textarea name="win" placeholder="Même une petite victoire compte...">${esc(
              latest?.win || "",
            )}</textarea>
          </label>
          <label>Qu'est-ce qui m'a freiné ?
            <textarea name="blocker" placeholder="Temps, énergie, notion difficile, distraction...">${esc(
              latest?.blocker || "",
            )}</textarea>
          </label>
          <label>Ma priorité pour la semaine suivante
            <input name="priority" placeholder="Une priorité claire" value="${esc(
              latest?.priority || "",
            )}" />
          </label>
          <div class="reflection-scales">
            <fieldset><legend>Énergie moyenne</legend>${ratingInputs("energy", latest?.energy || 3)}</fieldset>
            <fieldset><legend>Confiance globale</legend>${ratingInputs(
              "confidence",
              latest?.confidence || 3,
            )}</fieldset>
          </div>
          <button class="btn primary" type="submit">${icon("save", 17)} Enregistrer mon bilan</button>
        </form>
        <aside class="review-side">
          <div class="surface weekly-score">
            <p class="kicker">Résumé automatique</p><div class="score-ring" style="--value:${
              week.rate * 3.6
            }deg"><strong>${Math.round(week.rate)}%</strong></div><span>de l'objectif de temps</span>
          </div>
          <div class="surface wins-panel"><p class="kicker">Ce qui avance</p>${wins
            .map((win) => `<div>${icon("check", 16)}<span>${esc(win)}</span></div>`)
            .join("")}</div>
          <div class="surface next-week-panel"><p class="kicker">Suggestion</p><h3>${esc(
            C.recommend({ ignorePlan: true }).topic.name,
          )}</h3><p>${esc(C.recommend({ ignorePlan: true }).reason)}.</p><button class="btn small" data-go="/plan">Ajuster le plan</button></div>
        </aside>
      </section>`,
      { title: "Bilan" },
    );
  }

  function ratingInputs(name, selected) {
    return Array.from(
      { length: 5 },
      (_, index) =>
        `<label><input type="radio" name="${name}" value="${index + 1}" ${
          Number(selected) === index + 1 ? "checked" : ""
        } /><span>${index + 1}</span></label>`,
    ).join("");
  }

  function settingsView() {
    const state = C.getState();
    layout(
      `
      ${pageHeader(
        "Personnalisation",
        "Réglages",
        "Adapte l'objectif, les durées et l'apparence. Tes données restent enregistrées dans ce navigateur.",
      )}
      <section class="settings-layout">
        <form class="surface settings-form" id="settings-form">
          <div class="settings-section"><span class="settings-icon">${icon(
            "user-round",
          )}</span><div><h2>Profil et objectif</h2><p>Les informations utilisées pour personnaliser le plan.</p></div></div>
          <div class="form-grid">
            <label>Prénom<input name="name" value="${esc(state.profile.name)}" /></label>
            <label>Deadline<input name="targetDate" type="date" value="${esc(
              state.profile.targetDate,
            )}" /></label>
            <label>Objectif hebdomadaire (minutes)<input name="weeklyMinutes" type="number" min="60" max="1200" step="15" value="${
              state.profile.weeklyMinutes
            }" /></label>
            <label>Durée Focus par défaut<input name="defaultFocus" type="number" min="10" max="120" value="${
              state.profile.defaultFocus
            }" /></label>
            <label>Pause par défaut<input name="defaultBreak" type="number" min="2" max="30" value="${
              state.profile.defaultBreak
            }" /></label>
          </div>
          <hr />
          <div class="settings-section"><span class="settings-icon">${icon(
            "palette",
          )}</span><div><h2>Apparence et confort</h2><p>Un espace calme qui reste lisible sur téléphone.</p></div></div>
          <div class="setting-row"><div><strong>Thème sombre</strong><span>Réduit la luminosité de l'interface.</span></div><label class="switch"><input type="checkbox" name="darkTheme" ${
            state.profile.theme === "dark" ? "checked" : ""
          } /><span></span></label></div>
          <div class="setting-row"><div><strong>Réduire les animations</strong><span>Limite les transitions visuelles.</span></div><label class="switch"><input type="checkbox" name="reducedMotion" ${
            state.profile.reducedMotion ? "checked" : ""
          } /><span></span></label></div>
          <div class="form-actions"><button class="btn primary" type="submit">${icon(
            "save",
            17,
          )} Enregistrer</button></div>
        </form>
        <aside class="settings-side">
          <div class="surface">
            <div class="settings-section"><span class="settings-icon green">${icon(
              "bell-ring",
            )}</span><div><h2>Alarmes Focus</h2><p>Notification et son à la fin.</p></div></div>
            <button class="btn full" type="button" data-action="enable-notifications">${icon(
              state.profile.notifications ? "bell-check" : "bell-plus",
              17,
            )}${state.profile.notifications ? "Notifications autorisées" : "Autoriser les notifications"}</button>
          </div>
          <div class="surface">
            <div class="settings-section"><span class="settings-icon blue">${icon(
              "smartphone",
            )}</span><div><h2>Installer l'application</h2><p>Ouvre CAP DAEU comme une vraie app.</p></div></div>
            <button class="btn full" type="button" data-action="install-app">${icon(
              "download",
              17,
            )} Installer sur cet appareil</button>
          </div>
          <div class="surface">
            <div class="settings-section"><span class="settings-icon">${icon(
              "database",
            )}</span><div><h2>Sauvegarde</h2><p>Exporte ou restaure toutes tes données.</p></div></div>
            <div class="stack-actions"><button class="btn full" type="button" data-action="export-data">${icon(
              "download",
              17,
            )} Exporter</button><button class="btn full" type="button" data-action="import-data">${icon(
              "upload",
              17,
            )} Importer</button><button class="btn danger full" type="button" data-action="reset-data">${icon(
              "trash-2",
              17,
            )} Réinitialiser</button></div>
          </div>
        </aside>
      </section>`,
      { title: "Réglages" },
    );
  }

  function render() {
    destroyCharts();
    closeModal();
    const route = path();
    if (route === "/plan") planView();
    else if (route === "/calendar") calendarView();
    else if (route === "/focus") focusView();
    else if (route === "/subjects") subjectsView();
    else if (route === "/cards") cardsView();
    else if (route === "/errors") errorsView();
    else if (route === "/exams") examsView();
    else if (route === "/progress") progressView();
    else if (route === "/review") reviewView();
    else if (route === "/settings") settingsView();
    else todayView();
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function destroyCharts() {
    charts.forEach((chart) => chart.destroy());
    charts.clear();
  }

  function chartColors() {
    const dark = C.getState().profile.theme === "dark";
    return {
      text: dark ? "#b7c0d1" : "#667085",
      grid: dark ? "rgba(255,255,255,.08)" : "rgba(23,34,59,.08)",
      surface: dark ? "#111b30" : "#ffffff",
    };
  }

  function baseChartOptions() {
    const colors = chartColors();
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: C.getState().profile.reducedMotion ? false : { duration: 500 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: colors.surface,
          titleColor: colors.text,
          bodyColor: colors.text,
          borderColor: colors.grid,
          borderWidth: 1,
          padding: 10,
          displayColors: false,
        },
      },
      scales: {
        x: { grid: { display: false }, border: { display: false }, ticks: { color: colors.text } },
        y: {
          beginAtZero: true,
          grid: { color: colors.grid },
          border: { display: false },
          ticks: { color: colors.text, callback: (value) => `${value}m` },
        },
      },
    };
  }

  function renderHomeChart() {
    const canvas = document.getElementById("home-week-chart");
    if (!canvas || !window.Chart) return;
    const series = C.dailySeries(7);
    charts.set(
      "home",
      new Chart(canvas, {
        type: "bar",
        data: {
          labels: series.labels.map((date) => formatDate(date, { weekday: "short" }).replace(".", "")),
          datasets: [
            {
              data: series.values,
              backgroundColor: series.labels.map((date) =>
                date === C.today() ? "#3367d6" : "rgba(51,103,214,.25)",
              ),
              borderRadius: 5,
              borderSkipped: false,
              maxBarThickness: 34,
            },
          ],
        },
        options: baseChartOptions(),
      }),
    );
  }

  function renderExamChart() {
    const canvas = document.getElementById("exam-chart");
    if (!canvas || !window.Chart) return;
    const exams = C.getState().exams.slice().sort((a, b) => a.date.localeCompare(b.date));
    const options = baseChartOptions();
    options.scales.y.max = 20;
    options.scales.y.ticks.callback = (value) => `${value}/20`;
    charts.set(
      "exam",
      new Chart(canvas, {
        type: "line",
        data: {
          labels: exams.map((exam) => formatDate(exam.date)),
          datasets: [
            {
              data: exams.map((exam) => (exam.score / exam.maxScore) * 20),
              borderColor: "#e65f4b",
              backgroundColor: "rgba(230,95,75,.12)",
              fill: true,
              tension: 0.32,
              pointRadius: 4,
              pointBackgroundColor: "#e65f4b",
            },
          ],
        },
        options,
      }),
    );
  }

  function renderProgressCharts() {
    if (!window.Chart) return;
    const weeklyCanvas = document.getElementById("weekly-chart");
    const subjectCanvas = document.getElementById("subject-chart");
    const weekly = C.weeklySeries();
    const state = C.getState();
    if (weeklyCanvas) {
      const options = baseChartOptions();
      charts.set(
        "weekly",
        new Chart(weeklyCanvas, {
          type: "line",
          data: {
            labels: weekly.labels.map((date) => formatDate(date, { day: "numeric", month: "short" })),
            datasets: [
              {
                data: weekly.values,
                borderColor: "#3367d6",
                backgroundColor: "rgba(51,103,214,.10)",
                tension: 0.35,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: "#3367d6",
              },
              {
                data: weekly.values.map(() => state.profile.weeklyMinutes),
                borderColor: "#e0a12a",
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
              },
            ],
          },
          options,
        }),
      );
    }
    if (subjectCanvas) {
      const values = D.subjects.map((subject) =>
        C.totalMinutes(state.sessions.filter((session) => session.subject === subject.id)),
      );
      charts.set(
        "subjects",
        new Chart(subjectCanvas, {
          type: "doughnut",
          data: {
            labels: D.subjects.map((subject) => subject.name),
            datasets: [
              {
                data: values,
                backgroundColor: D.subjects.map((subject) => subject.color),
                borderWidth: 0,
                spacing: 3,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "67%",
            plugins: {
              legend: {
                display: true,
                position: "bottom",
                labels: { color: chartColors().text, usePointStyle: true, boxWidth: 8, padding: 18 },
              },
            },
          },
        }),
      );
    }
  }

  function timerText() {
    const minutes = Math.floor(focusTimer.remaining / 60);
    const seconds = Math.max(0, focusTimer.remaining % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function timerProgress() {
    if (!focusTimer.duration) return 0;
    return (1 - focusTimer.remaining / focusTimer.duration) * 360;
  }

  function updateTimerDisplay() {
    const display = document.getElementById("timer-display");
    const orbit = document.querySelector(".timer-orbit");
    if (display) display.textContent = timerText();
    if (orbit) orbit.style.setProperty("--timer-progress", `${timerProgress()}deg`);
  }

  function startTimer() {
    if (focusTimer.running) return;
    focusTimer.running = true;
    focusTimer.paused = false;
    focusTimer.startedAt ||= Date.now();
    focusTimer.endAt = Date.now() + focusTimer.remaining * 1000;
    clearInterval(focusTimer.interval);
    focusTimer.interval = setInterval(tickTimer, 250);
    tickTimer();
    render();
  }

  function tickTimer() {
    if (!focusTimer.running) return;
    focusTimer.remaining = Math.max(0, Math.ceil((focusTimer.endAt - Date.now()) / 1000));
    updateTimerDisplay();
    if (focusTimer.remaining <= 0) finishTimerNaturally();
  }

  function pauseTimer() {
    if (!focusTimer.running) return;
    tickTimer();
    focusTimer.running = false;
    focusTimer.paused = true;
    clearInterval(focusTimer.interval);
    render();
  }

  function resetTimer() {
    clearInterval(focusTimer.interval);
    focusTimer = {
      running: false,
      paused: false,
      duration: focusPreset * 60,
      remaining: focusPreset * 60,
      endAt: null,
      interval: null,
      distractions: 0,
      startedAt: null,
    };
  }

  function finishTimerNaturally() {
    focusTimer.running = false;
    focusTimer.paused = true;
    focusTimer.remaining = 0;
    clearInterval(focusTimer.interval);
    playAlarm();
    showSystemNotification("Séance terminée", "Reviens noter ce que tu as fait.");
    openSessionRecap(true);
  }

  function playAlarm() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContext();
      [523, 659, 784, 659].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.frequency.value = frequency;
        oscillator.type = "sine";
        gain.gain.setValueAtTime(0.0001, context.currentTime + index * 0.22);
        gain.gain.exponentialRampToValueAtTime(0.16, context.currentTime + index * 0.22 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + index * 0.22 + 0.18);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(context.currentTime + index * 0.22);
        oscillator.stop(context.currentTime + index * 0.22 + 0.2);
      });
    } catch (error) {
      console.warn("Alarme audio indisponible.", error);
    }
  }

  async function showSystemNotification(title, body) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    try {
      const registration = await navigator.serviceWorker?.ready;
      if (registration?.showNotification) {
        await registration.showNotification(title, {
          body,
          icon: "./assets/icon.svg",
          badge: "./assets/icon.svg",
          tag: "cap-daeu-focus",
        });
      } else {
        new Notification(title, { body, icon: "./assets/icon.svg" });
      }
    } catch {
      new Notification(title, { body, icon: "./assets/icon.svg" });
    }
  }

  function openSessionRecap(completed = false) {
    const subjectId = document.getElementById("focus-topic")
      ? C.topicById(document.getElementById("focus-topic").value)?.subject
      : query().get("subject") || C.getState().ui.activeSubject;
    const subject = C.subjectById(subjectId);
    const topicId =
      document.getElementById("focus-topic")?.value || query().get("topic") || subject.topics[0].id;
    const mode = document.getElementById("focus-mode")?.value || query().get("mode") || "exercise";
    const elapsed = Math.max(
      1,
      Math.round((focusTimer.duration - focusTimer.remaining) / 60) || focusPreset,
    );
    const objective = document.getElementById("focus-objective")?.value || "";
    modal(
      `<form id="session-recap-form">
        <p class="kicker">${completed ? "Temps écoulé" : "Fin de séance"}</p>
        <h2>${completed ? "Bravo, bloc terminé." : "Enregistrer cette séance"}</h2>
        <p class="modal-intro">Note juste assez pour que cette séance améliore la prochaine.</p>
        <input type="hidden" name="subject" value="${subjectId}" />
        <input type="hidden" name="topic" value="${topicId}" />
        <input type="hidden" name="mode" value="${mode}" />
        <div class="form-grid"><label>Durée réelle<input name="minutes" type="number" min="1" value="${elapsed}" /></label><label>Date<input name="date" type="date" value="${C.today()}" /></label></div>
        <label>Ce que j'ai fait<input name="note" value="${esc(objective)}" placeholder="Une phrase suffit" /></label>
        <div class="reflection-scales"><fieldset><legend>Concentration</legend>${ratingInputs(
          "focus",
          4,
        )}</fieldset><fieldset><legend>Énergie</legend>${ratingInputs("energy", 3)}</fieldset></div>
        <div class="modal-summary">${subjectChip(subjectId)}<span>${esc(
          C.topicById(topicId)?.name,
        )}</span><span>${modeLabel(mode)}</span></div>
        <div class="modal-actions"><button class="btn ghost" type="button" data-action="close-modal">Annuler</button><button class="btn primary" type="submit">${icon(
          "save",
          17,
        )} Enregistrer</button></div>
      </form>`,
      { label: "Bilan de séance" },
    );
  }

  function energyModal() {
    const options = [
      [1, "Batterie faible", 10, "Une micro-séance pour garder le rythme.", "battery-low"],
      [3, "Énergie normale", 25, "Un bloc ciblé et réaliste.", "battery-medium"],
      [5, "Bonne énergie", 40, "Une séance approfondie avec exercice.", "battery-full"],
    ];
    modal(
      `<p class="kicker">Adapter la séance</p><h2>Quelle est ton énergie ?</h2><p class="modal-intro">Le bon plan est celui que tu peux vraiment commencer.</p><div class="energy-options">${options
        .map(([energy, label, minutes, text, iconName]) => {
          const rec = C.recommend({ energy, available: minutes });
          return `<button type="button" data-energy-start="${energy}" data-subject="${
            rec.subject.id
          }" data-topic="${rec.topic.id}" data-mode="${rec.mode}" data-minutes="${
            rec.minutes
          }">${icon(iconName, 24)}<span><strong>${label}</strong><small>${text}</small><b>${rec.minutes} min · ${
            rec.subject.short
          } · ${esc(rec.topic.name)}</b></span>${icon("arrow-right")}</button>`;
        })
        .join("")}</div>`,
      { label: "Choisir son énergie" },
    );
  }

  function sessionFormModal(date = C.today(), existing = null) {
    const item = existing || {};
    const selectedSubject = item.subject || C.getState().ui.activeSubject;
    const subject = C.subjectById(selectedSubject);
    modal(
      `<form id="plan-session-form">
        <input type="hidden" name="id" value="${esc(item.id || "")}" />
        <p class="kicker">${item.id ? "Modifier" : "Planifier"}</p><h2>${
          item.id ? "Modifier la séance" : "Ajouter une séance"
        }</h2>
        <div class="form-grid"><label>Date<input name="date" type="date" value="${esc(
          item.date || date,
        )}" required /></label><label>Matière<select name="subject" id="plan-subject">${D.subjects
          .map(
            (entry) =>
              `<option value="${entry.id}" ${entry.id === selectedSubject ? "selected" : ""}>${esc(
                entry.name,
              )}</option>`,
          )
          .join("")}</select></label>
          <label>Chapitre<select name="topic" id="plan-topic">${subject.topics
            .map(
              (topic) =>
                `<option value="${topic.id}" ${topic.id === item.topic ? "selected" : ""}>${esc(
                  topic.name,
                )}</option>`,
            )
            .join("")}</select></label>
          <label>Mode<select name="mode">${D.learningModes
            .map(
              (entry) =>
                `<option value="${entry.id}" ${entry.id === item.mode ? "selected" : ""}>${esc(
                  entry.label,
                )}</option>`,
            )
            .join("")}</select></label>
          <label>Durée<input name="minutes" type="number" min="10" max="180" step="5" value="${
            item.minutes || 25
          }" /></label>
        </div>
        <div class="modal-actions">${item.id ? `<button class="btn danger" type="button" data-action="delete-plan" data-id="${item.id}">${icon(
          "trash-2",
          16,
        )} Supprimer</button>` : ""}<span class="spacer"></span><button class="btn ghost" type="button" data-action="close-modal">Annuler</button><button class="btn primary" type="submit">${icon(
          "save",
          17,
        )} Enregistrer</button></div>
      </form>`,
      { label: "Planifier une séance" },
    );
  }

  function addCardModal() {
    modal(
      `<form id="card-form"><p class="kicker">Créer</p><h2>Nouvelle flashcard</h2>
      <label>Matière<select name="subject" id="card-subject">${D.subjects
        .map((subject) => `<option value="${subject.id}">${esc(subject.name)}</option>`)
        .join("")}</select></label>
      <label>Chapitre<select name="topic" id="card-topic">${D.subjects[0].topics
        .map((topic) => `<option value="${topic.id}">${esc(topic.name)}</option>`)
        .join("")}</select></label>
      <label>Question<textarea name="front" required placeholder="Une question précise"></textarea></label>
      <label>Réponse<textarea name="back" required placeholder="Une réponse courte et claire"></textarea></label>
      <div class="modal-actions"><button class="btn ghost" type="button" data-action="close-modal">Annuler</button><button class="btn primary" type="submit">Créer la carte</button></div></form>`,
      { label: "Créer une flashcard" },
    );
  }

  function addErrorModal() {
    modal(
      `<form id="error-form"><p class="kicker">Transformer l'erreur</p><h2>Noter une erreur</h2>
      <div class="form-grid"><label>Matière<select name="subject" id="error-subject">${D.subjects
        .map((subject) => `<option value="${subject.id}">${esc(subject.name)}</option>`)
        .join("")}</select></label><label>Chapitre<select name="topic" id="error-topic">${D.subjects[0].topics
        .map((topic) => `<option value="${topic.id}">${esc(topic.name)}</option>`)
        .join("")}</select></label></div>
      <label>Titre de l'erreur<input name="title" required placeholder="Ex. J'oublie de convertir les minutes" /></label>
      <label>Contexte<input name="context" placeholder="Exercice, chapitre, type de question..." /></label>
      <label>Pourquoi ai-je fait cette erreur ?<textarea name="cause" required></textarea></label>
      <label>Quelle correction appliquer la prochaine fois ?<textarea name="correction" required></textarea></label>
      <div class="modal-actions"><button class="btn ghost" type="button" data-action="close-modal">Annuler</button><button class="btn primary" type="submit">Enregistrer</button></div></form>`,
      { label: "Noter une erreur", wide: true },
    );
  }

  function addExamModal() {
    modal(
      `<form id="exam-form"><p class="kicker">Résultat</p><h2>Ajouter un examen blanc</h2>
      <div class="form-grid"><label>Matière<select name="subject">${D.subjects
        .map((subject) => `<option value="${subject.id}">${esc(subject.name)}</option>`)
        .join("")}</select></label><label>Date<input name="date" type="date" value="${C.today()}" /></label>
      <label>Note obtenue<input name="score" type="number" min="0" max="100" step=".5" value="10" /></label><label>Barème<input name="maxScore" type="number" min="1" max="100" value="20" /></label>
      <label>Durée<input name="minutes" type="number" min="5" max="300" value="45" /></label></div>
      <label>Nom de l'épreuve<input name="title" required placeholder="Mini-test fonctions" /></label>
      <label>Ce que le résultat m'apprend<textarea name="notes"></textarea></label>
      <div class="modal-actions"><button class="btn ghost" type="button" data-action="close-modal">Annuler</button><button class="btn primary" type="submit">Enregistrer</button></div></form>`,
      { label: "Ajouter un examen blanc" },
    );
  }

  function quickAddModal() {
    modal(
      `<p class="kicker">Ajout rapide</p><h2>Que veux-tu ajouter ?</h2><div class="quick-add-grid">
        <button data-action="add-session">${icon("calendar-plus")}<span><strong>Séance</strong><small>Planifier un travail</small></span></button>
        <button data-action="add-card">${icon("layers-3")}<span><strong>Flashcard</strong><small>Mémoriser une notion</small></span></button>
        <button data-action="add-error">${icon("scan-search")}<span><strong>Erreur</strong><small>Créer une révision</small></span></button>
        <button data-action="add-exam">${icon("file-check-2")}<span><strong>Résultat</strong><small>Noter un test</small></span></button>
      </div>`,
      { label: "Ajout rapide" },
    );
  }

  function mobileMenuModal() {
    modal(
      `<p class="kicker">Navigation</p><h2>Tout CAP DAEU</h2><div class="mobile-menu-grid">
        ${routes
          .map(
            (route) =>
              `<a href="#${route.path}" class="${path() === route.path ? "active" : ""}">${icon(
                route.icon,
              )}<span>${route.label}</span></a>`,
          )
          .join("")}
      </div>`,
      { label: "Navigation de l'application" },
    );
  }

  function startRecommendationFrom(element) {
    const params = new URLSearchParams({
      subject: element.dataset.subject,
      topic: element.dataset.topic,
      mode: element.dataset.mode,
      minutes: element.dataset.minutes,
    });
    closeModal();
    go(`/focus?${params}`);
  }

  document.addEventListener("click", async (event) => {
    const target = event.target.closest("button, a");
    if (!target) return;
    if (target.dataset.go) go(target.dataset.go);

    const action = target.dataset.action;
    if (action === "close-modal") {
      if (event.target.closest("[data-modal-panel]") && !target.classList.contains("modal-close")) return;
      closeModal();
    }
    if (action === "toggle-theme") {
      C.update((state) => {
        state.profile.theme = state.profile.theme === "dark" ? "light" : "dark";
      }, "theme");
      render();
    }
    if (action === "open-menu") mobileMenuModal();
    if (action === "quick-add") quickAddModal();
    if (action === "energy-choice") energyModal();
    if (action === "start-recommendation") startRecommendationFrom(target);
    if (target.dataset.energyStart) startRecommendationFrom(target);
    if (action === "start-plan") {
      const item = C.getState().schedule.find((entry) => entry.id === target.dataset.id);
      if (item)
        startRecommendationFrom({
          dataset: {
            subject: item.subject,
            topic: item.topic,
            mode: item.mode,
            minutes: item.minutes,
          },
        });
    }
    if (action === "toggle-plan") {
      C.update((state) => {
        const item = state.schedule.find((entry) => entry.id === target.dataset.id);
        if (item) item.status = item.status === "done" ? "planned" : "done";
      }, "plan-status");
      render();
    }
    if (action === "toggle-task") {
      C.update((state) => {
        const task = state.tasks.find((entry) => entry.id === target.dataset.id);
        if (task) task.done = !task.done;
      }, "task-status");
      render();
    }
    if (action === "generate-plan") {
      C.buildAdaptivePlan({ start: C.today() });
      toast("Plan adaptatif généré jusqu'à ta deadline.", "success");
      render();
    }
    if (target.dataset.planFilter) {
      document.querySelectorAll("[data-plan-filter]").forEach((button) => button.classList.remove("active"));
      target.classList.add("active");
      const filter = target.dataset.planFilter;
      document.querySelectorAll("[data-subject-filter]").forEach((row) => {
        row.hidden = filter !== "all" && row.dataset.subjectFilter !== filter;
      });
    }
    if (action === "calendar-prev" || action === "calendar-next") {
      C.update((state) => {
        const cursor = new Date(`${state.ui.calendarCursor}-01T12:00:00`);
        cursor.setMonth(cursor.getMonth() + (action === "calendar-next" ? 1 : -1));
        state.ui.calendarCursor = cursor.toISOString().slice(0, 7);
      }, "calendar-cursor");
      render();
    }
    if (action === "calendar-today") {
      C.update((state) => {
        state.ui.calendarCursor = C.monthKey(C.today());
      }, "calendar-today");
      render();
    }
    if (target.dataset.calendarView) {
      C.update((state) => {
        state.ui.calendarView = target.dataset.calendarView;
      }, "calendar-view");
      render();
    }
    if (action === "add-session" || action === "plan-date")
      sessionFormModal(target.dataset.date || C.today());
    if (action === "edit-plan") {
      const item = C.getState().schedule.find((entry) => entry.id === target.dataset.id);
      if (item) sessionFormModal(item.date, item);
    }
    if (action === "delete-plan") {
      C.update((state) => {
        state.schedule = state.schedule.filter((entry) => entry.id !== target.dataset.id);
      }, "plan-delete");
      closeModal();
      toast("Séance supprimée.");
      render();
    }
    if (action === "start-topic") {
      const topic = C.topicById(target.dataset.topic);
      startRecommendationFrom({
        dataset: {
          subject: target.dataset.subject,
          topic: target.dataset.topic,
          mode: "exercise",
          minutes: 25,
          objective: topic?.name,
        },
      });
    }
    if (action === "topic-actions") {
      const topic = C.topicById(target.dataset.topic);
      modal(
        `<p class="kicker">Chapitre</p><h2>${esc(topic.name)}</h2><div class="quick-add-grid">
          <button data-energy-start="3" data-subject="${target.dataset.subject}" data-topic="${
            target.dataset.topic
          }" data-mode="exercise" data-minutes="25">${icon(
            "play",
          )}<span><strong>Faire une séance</strong><small>25 minutes d'exercices</small></span></button>
          <button data-action="add-card">${icon(
            "layers-3",
          )}<span><strong>Créer une carte</strong><small>Mémoriser une notion</small></span></button>
          <button data-action="add-error">${icon(
            "scan-search",
          )}<span><strong>Noter une erreur</strong><small>Programmer une correction</small></span></button>
        </div>`,
        { label: "Actions du chapitre" },
      );
    }
    if (action === "add-card") addCardModal();
    if (action === "reveal-card") {
      cardReveal = true;
      target.classList.add("revealed");
      document.querySelector(".rating-controls")?.classList.add("visible");
    }
    if (target.dataset.cardRating) {
      const due = C.getState().cards.filter((card) => card.due <= C.today());
      const card = due[cardCursor];
      if (card) C.reviewCard(card.id, target.dataset.cardRating);
      cardReveal = false;
      toast("Révision enregistrée.", "success");
      render();
    }
    if (action === "add-error") addErrorModal();
    if (target.dataset.errorReview) {
      C.reviewError(target.dataset.id, target.dataset.errorReview);
      toast("L'erreur reviendra au bon moment.", "success");
      render();
    }
    if (action === "open-error") {
      const error = C.getState().errors.find((entry) => entry.id === target.dataset.id);
      if (error)
        modal(
          `<p class="kicker">${esc(C.subjectById(error.subject).name)}</p><h2>${esc(
            error.title,
          )}</h2><p class="modal-intro">${esc(error.context)}</p><div class="error-detail"><div><strong>Cause</strong><p>${esc(
            error.cause,
          )}</p></div><div><strong>Correction</strong><p>${esc(
            error.correction,
          )}</p></div></div><div class="modal-actions"><button class="btn" data-error-review="understood" data-id="${
            error.id
          }">Compris aujourd'hui</button></div>`,
          { label: "Détail de l'erreur" },
        );
    }
    if (action === "add-exam") addExamModal();
    if (action === "start-mock") {
      go("/focus?subject=maths&topic=ma-fonctions&mode=exam&minutes=45");
    }
    if (target.dataset.focusPreset) {
      focusPreset = Number(target.dataset.focusPreset);
      resetTimer();
      render();
    }
    if (action === "focus-start") startTimer();
    if (action === "focus-pause") pauseTimer();
    if (action === "focus-finish") openSessionRecap(false);
    if (action === "add-distraction") {
      focusTimer.distractions += 1;
      const count = document.getElementById("distraction-count");
      if (count) count.textContent = focusTimer.distractions;
      toast("Distraction notée. Reviens simplement à l'objectif.");
    }
    if (action === "test-alarm") {
      playAlarm();
      toast("Voilà le son de fin de séance.");
    }
    if (action === "focus-fullscreen") {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
      else document.exitFullscreen?.();
    }
    if (action === "enable-notifications") {
      if (!("Notification" in window)) return toast("Notifications non prises en charge.", "warning");
      const permission = await Notification.requestPermission();
      C.update((state) => {
        state.profile.notifications = permission === "granted";
      }, "notifications");
      toast(
        permission === "granted" ? "Notifications activées." : "Autorisation non accordée.",
        permission === "granted" ? "success" : "warning",
      );
      render();
    }
    if (action === "install-app") {
      if (installPrompt) {
        installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        if (choice.outcome === "accepted") toast("Installation lancée.", "success");
        installPrompt = null;
      } else {
        modal(
          `<p class="kicker">Installer CAP DAEU</p><h2>Ajouter à l'écran d'accueil</h2><div class="install-steps"><div><span>iPhone / iPad</span><p>Dans Safari, touche Partager puis « Sur l'écran d'accueil ».</p></div><div><span>Android</span><p>Dans Chrome, ouvre le menu puis « Installer l'application ».</p></div><div><span>Ordinateur</span><p>Dans Chrome ou Edge, utilise l'icône d'installation dans la barre d'adresse.</p></div></div>`,
          { label: "Installer l'application" },
        );
      }
    }
    if (action === "export-data") {
      const blob = new Blob([C.exportData()], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cap-daeu-sauvegarde-${C.today()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast("Sauvegarde exportée.", "success");
    }
    if (action === "import-data") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json,.json";
      input.addEventListener("change", async () => {
        try {
          C.importData(await input.files[0].text());
          toast("Sauvegarde restaurée.", "success");
          render();
        } catch {
          toast("Ce fichier n'est pas une sauvegarde CAP DAEU valide.", "warning");
        }
      });
      input.click();
    }
    if (action === "reset-data") {
      modal(
        `<p class="kicker">Zone sensible</p><h2>Réinitialiser toutes les données ?</h2><p class="modal-intro">Les séances, cartes, erreurs et réglages locaux seront remplacés par les données de démonstration.</p><div class="modal-actions"><button class="btn ghost" data-action="close-modal">Annuler</button><button class="btn danger" data-action="confirm-reset">Réinitialiser</button></div>`,
        { label: "Confirmer la réinitialisation" },
      );
    }
    if (action === "confirm-reset") {
      C.reset();
      closeModal();
      toast("Données réinitialisées.");
      render();
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target.id === "plan-subject") {
      const subject = C.subjectById(event.target.value);
      const topicSelect = document.getElementById("plan-topic");
      topicSelect.innerHTML = subject.topics
        .map((topic) => `<option value="${topic.id}">${esc(topic.name)}</option>`)
        .join("");
    }
    if (event.target.id === "card-subject") {
      const subject = C.subjectById(event.target.value);
      document.getElementById("card-topic").innerHTML = subject.topics
        .map((topic) => `<option value="${topic.id}">${esc(topic.name)}</option>`)
        .join("");
    }
    if (event.target.id === "error-subject") {
      const subject = C.subjectById(event.target.value);
      document.getElementById("error-topic").innerHTML = subject.topics
        .map((topic) => `<option value="${topic.id}">${esc(topic.name)}</option>`)
        .join("");
    }
  });

  document.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.target;
    const values = Object.fromEntries(new FormData(form).entries());
    if (form.id === "plan-session-form") {
      C.update((state) => {
        const topic = C.topicById(values.topic);
        const payload = {
          id: values.id || C.uid("plan"),
          date: values.date,
          subject: values.subject,
          topic: values.topic,
          mode: values.mode,
          minutes: Number(values.minutes),
          title: topic?.name || "Session DAEU",
          status: "planned",
          source: values.id ? state.schedule.find((entry) => entry.id === values.id)?.source : "manual",
        };
        const index = state.schedule.findIndex((entry) => entry.id === values.id);
        if (index >= 0) state.schedule[index] = { ...state.schedule[index], ...payload };
        else state.schedule.push(payload);
        state.schedule.sort((a, b) => a.date.localeCompare(b.date));
      }, "plan-save");
      closeModal();
      toast("Séance planifiée.", "success");
      render();
    }
    if (form.id === "session-recap-form") {
      C.recordSession({
        ...values,
        minutes: Number(values.minutes),
        focus: Number(values.focus),
        energy: Number(values.energy),
        distractions: focusTimer.distractions,
      });
      resetTimer();
      closeModal();
      toast("Séance enregistrée. Elle améliore maintenant tes recommandations.", "success");
      go("/today");
    }
    if (form.id === "card-form") {
      C.update((state) => {
        state.cards.push({
          id: C.uid("card"),
          subject: values.subject,
          topic: values.topic,
          front: values.front.trim(),
          back: values.back.trim(),
          interval: 1,
          ease: 2.5,
          repetitions: 0,
          due: C.today(),
        });
      }, "card-add");
      closeModal();
      toast("Flashcard créée.", "success");
      render();
    }
    if (form.id === "error-form") {
      C.update((state) => {
        state.errors.push({
          id: C.uid("error"),
          subject: values.subject,
          topic: values.topic,
          title: values.title.trim(),
          context: values.context.trim(),
          cause: values.cause.trim(),
          correction: values.correction.trim(),
          status: "to_review",
          reviews: 0,
          nextReview: C.today(),
          createdAt: C.today(),
        });
      }, "error-add");
      closeModal();
      toast("Erreur ajoutée à la file de révision.", "success");
      render();
    }
    if (form.id === "exam-form") {
      C.update((state) => {
        state.exams.push({
          id: C.uid("exam"),
          subject: values.subject,
          date: values.date,
          title: values.title.trim(),
          score: Number(values.score),
          maxScore: Number(values.maxScore),
          minutes: Number(values.minutes),
          notes: values.notes.trim(),
        });
      }, "exam-add");
      closeModal();
      toast("Résultat ajouté.", "success");
      render();
    }
    if (form.id === "reflection-form") {
      C.update((state) => {
        state.reflections.push({
          id: C.uid("reflection"),
          date: C.today(),
          week: C.mondayOf(),
          win: values.win.trim(),
          blocker: values.blocker.trim(),
          priority: values.priority.trim(),
          energy: Number(values.energy),
          confidence: Number(values.confidence),
        });
      }, "reflection-add");
      toast("Bilan enregistré. La prochaine semaine part de là.", "success");
      render();
    }
    if (form.id === "settings-form") {
      C.update((state) => {
        state.profile.name = values.name.trim() || "Elias";
        state.profile.targetDate = values.targetDate;
        state.profile.weeklyMinutes = Number(values.weeklyMinutes);
        state.profile.defaultFocus = Number(values.defaultFocus);
        state.profile.defaultBreak = Number(values.defaultBreak);
        state.profile.theme = values.darkTheme ? "dark" : "light";
        state.profile.reducedMotion = Boolean(values.reducedMotion);
      }, "settings-save");
      toast("Réglages enregistrés.", "success");
      render();
    }
  });

  window.addEventListener("hashchange", render);
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && focusTimer.running) tickTimer();
  });

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () =>
      navigator.serviceWorker.register("./sw.js").catch((error) => console.warn(error)),
    );
  }

  render();
})();
