(function () {
  "use strict";

  const D = window.CAP_DATA;
  const STORAGE_KEY = "cap-daeu-elias-v2";
  const VERSION = 2;

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const uid = (prefix = "item") =>
    `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const today = () => new Date().toISOString().slice(0, 10);
  const dateAtNoon = (value) => new Date(`${value}T12:00:00`);
  const addDays = (value, amount) => {
    const date = dateAtNoon(value);
    date.setDate(date.getDate() + amount);
    return date.toISOString().slice(0, 10);
  };
  const diffDays = (from, to) =>
    Math.ceil((dateAtNoon(to).getTime() - dateAtNoon(from).getTime()) / D.DAY);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
  const subjectById = (id) => D.subjects.find((subject) => subject.id === id);
  const topicById = (id) => {
    for (const subject of D.subjects) {
      const topic = subject.topics.find((item) => item.id === id);
      if (topic) return { ...topic, subject: subject.id };
    }
    return null;
  };

  function mondayOf(value = today()) {
    const date = dateAtNoon(value);
    const day = date.getDay() || 7;
    date.setDate(date.getDate() - day + 1);
    return date.toISOString().slice(0, 10);
  }

  function monthKey(value) {
    return String(value).slice(0, 7);
  }

  function seedSchedule() {
    const monday = mondayOf();
    const pattern = [
      ["francais", "fr-argumentation", 0, 25, "exercise"],
      ["maths", "ma-equations", 1, 30, "exercise"],
      ["biologie", "bi-genetique", 2, 25, "recall"],
      ["physique", "ph-mecanique", 3, 30, "course"],
      ["francais", "fr-resume", 4, 25, "exercise"],
      ["maths", "ma-fonctions", 5, 40, "exercise"],
    ];

    return pattern.map(([subject, topic, day, minutes, mode], index) => ({
      id: `plan-demo-${index}`,
      date: addDays(monday, day),
      subject,
      topic,
      mode,
      minutes,
      title: topicById(topic)?.name || "Session DAEU",
      status: day < diffDays(monday, today()) ? "done" : "planned",
      source: "demo",
    }));
  }

  function seedSessions() {
    return [
      {
        id: "session-demo-1",
        date: addDays(today(), -8),
        subject: "francais",
        topic: "fr-argumentation",
        mode: "course",
        minutes: 22,
        focus: 3,
        energy: 3,
        note: "Structure thèse, argument, exemple.",
      },
      {
        id: "session-demo-2",
        date: addDays(today(), -6),
        subject: "maths",
        topic: "ma-equations",
        mode: "exercise",
        minutes: 31,
        focus: 4,
        energy: 3,
        note: "5 équations, une erreur de signe.",
      },
      {
        id: "session-demo-3",
        date: addDays(today(), -4),
        subject: "biologie",
        topic: "bi-cellule",
        mode: "recall",
        minutes: 24,
        focus: 4,
        energy: 4,
        note: "Schéma de cellule refait de mémoire.",
      },
      {
        id: "session-demo-4",
        date: addDays(today(), -2),
        subject: "physique",
        topic: "ph-unites",
        mode: "exercise",
        minutes: 28,
        focus: 3,
        energy: 2,
        note: "Conversions mieux comprises.",
      },
      {
        id: "session-demo-5",
        date: addDays(today(), -1),
        subject: "maths",
        topic: "ma-equations",
        mode: "correction",
        minutes: 18,
        focus: 5,
        energy: 3,
        note: "Correction et vérification des solutions.",
      },
    ];
  }

  function seedExams() {
    return [
      {
        id: "exam-demo-1",
        date: addDays(today(), -18),
        subject: "francais",
        title: "Mini-épreuve argumentation",
        score: 9,
        maxScore: 20,
        minutes: 45,
        notes: "Plan correct, exemples à mieux expliquer.",
      },
      {
        id: "exam-demo-2",
        date: addDays(today(), -10),
        subject: "maths",
        title: "Test bases algébriques",
        score: 11,
        maxScore: 20,
        minutes: 40,
        notes: "Progrès sur les équations.",
      },
    ];
  }

  function makeSeed() {
    return {
      version: VERSION,
      profile: {
        name: "Elias",
        targetDate: "2026-10-31",
        weeklyMinutes: 330,
        defaultFocus: 25,
        defaultBreak: 5,
        theme: "light",
        reducedMotion: false,
        compactMode: false,
        notifications: false,
      },
      ui: {
        calendarView: "month",
        calendarCursor: monthKey(today()),
        activeSubject: "maths",
        onboardingDone: true,
      },
      topicProgress: Object.fromEntries(
        D.subjects.flatMap((subject) =>
          subject.topics.map((topic) => [
            topic.id,
            {
              mastery: topic.mastery,
              confidence: Math.round(topic.mastery / 20),
              lastStudied: null,
              sessions: 0,
            },
          ]),
        ),
      ),
      schedule: seedSchedule(),
      sessions: seedSessions(),
      cards: clone(D.initialCards),
      errors: clone(D.initialErrors),
      exams: seedExams(),
      reviews: [],
      achievements: [],
      reflections: [],
      tasks: [
        {
          id: "task-demo-1",
          title: "Revoir l'erreur de signe",
          subject: "maths",
          topic: "ma-equations",
          date: today(),
          done: false,
          priority: 4,
        },
        {
          id: "task-demo-2",
          title: "Faire 6 flashcards",
          subject: "biologie",
          topic: "bi-genetique",
          date: today(),
          done: false,
          priority: 3,
        },
      ],
    };
  }

  function normalize(raw) {
    const seed = makeSeed();
    if (!raw || typeof raw !== "object") return seed;
    const merged = {
      ...seed,
      ...raw,
      profile: { ...seed.profile, ...(raw.profile || {}) },
      ui: { ...seed.ui, ...(raw.ui || {}) },
      topicProgress: { ...seed.topicProgress, ...(raw.topicProgress || {}) },
    };
    ["schedule", "sessions", "cards", "errors", "exams", "reviews", "reflections", "tasks"].forEach(
      (key) => {
        if (!Array.isArray(merged[key])) merged[key] = seed[key];
      },
    );
    merged.version = VERSION;
    return merged;
  }

  function load() {
    try {
      return normalize(JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"));
    } catch (error) {
      console.warn("CAP DAEU: sauvegarde illisible, données de démonstration utilisées.", error);
      return makeSeed();
    }
  }

  let state = load();
  const listeners = new Set();

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function emit(reason = "update") {
    save();
    listeners.forEach((listener) => listener(state, reason));
  }

  function update(mutator, reason) {
    mutator(state);
    emit(reason);
    return state;
  }

  function replace(nextState, reason = "replace") {
    state = normalize(nextState);
    emit(reason);
    return state;
  }

  function reset() {
    state = makeSeed();
    emit("reset");
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function getState() {
    return state;
  }

  function sessionsBetween(start, end) {
    return state.sessions.filter((session) => session.date >= start && session.date <= end);
  }

  function scheduleBetween(start, end) {
    return state.schedule.filter((item) => item.date >= start && item.date <= end);
  }

  function totalMinutes(items = state.sessions) {
    return items.reduce((sum, item) => sum + Number(item.minutes || 0), 0);
  }

  function weekStats(date = today()) {
    const start = mondayOf(date);
    const end = addDays(start, 6);
    const sessions = sessionsBetween(start, end);
    const planned = scheduleBetween(start, end);
    const completedPlanned = planned.filter((item) => item.status === "done").length;
    const minutes = totalMinutes(sessions);
    return {
      start,
      end,
      sessions,
      planned,
      minutes,
      target: Number(state.profile.weeklyMinutes || 0),
      rate: clamp((minutes / Math.max(1, state.profile.weeklyMinutes)) * 100, 0, 100),
      completionRate: planned.length ? Math.round((completedPlanned / planned.length) * 100) : 0,
    };
  }

  function streak() {
    const dates = new Set(state.sessions.map((session) => session.date));
    let cursor = today();
    if (!dates.has(cursor)) cursor = addDays(cursor, -1);
    let count = 0;
    while (dates.has(cursor)) {
      count += 1;
      cursor = addDays(cursor, -1);
    }
    return count;
  }

  function subjectStats(subjectId) {
    const subject = subjectById(subjectId);
    const topicValues = subject.topics.map((topic) => state.topicProgress[topic.id]?.mastery || 0);
    const mastery = Math.round(topicValues.reduce((sum, value) => sum + value, 0) / topicValues.length);
    const sessions = state.sessions.filter((session) => session.subject === subjectId);
    const recentStart = addDays(today(), -27);
    const recentMinutes = totalMinutes(sessions.filter((session) => session.date >= recentStart));
    const errorsDue = state.errors.filter(
      (error) =>
        error.subject === subjectId && error.status !== "mastered" && error.nextReview <= today(),
    ).length;
    const cardsDue = state.cards.filter(
      (card) => card.subject === subjectId && card.due <= today(),
    ).length;
    return { mastery, sessions: sessions.length, recentMinutes, errorsDue, cardsDue };
  }

  function topicNeedScore(subjectId, topic) {
    const progress = state.topicProgress[topic.id] || {};
    const masteryGap = 100 - Number(progress.mastery || 0);
    const priority = Number(topic.priority || 3) * 10;
    const errors = state.errors.filter(
      (error) => error.topic === topic.id && error.status !== "mastered",
    );
    const dueErrors = errors.filter((error) => error.nextReview <= today()).length;
    const dueCards = state.cards.filter(
      (card) => card.topic === topic.id && card.due <= today(),
    ).length;
    const lastGap = progress.lastStudied ? clamp(diffDays(progress.lastStudied, today()), 0, 30) : 20;
    const plannedSoon = state.schedule.some(
      (item) =>
        item.topic === topic.id &&
        item.status === "planned" &&
        item.date >= today() &&
        item.date <= addDays(today(), 2),
    );
    return masteryGap * 0.52 + priority + dueErrors * 16 + dueCards * 4 + lastGap - (plannedSoon ? 14 : 0);
  }

  function recommend(options = {}) {
    const energy = clamp(options.energy || 3, 1, 5);
    const available = clamp(options.available || state.profile.defaultFocus || 25, 10, 120);
    const todaysPlan = state.schedule
      .filter((item) => item.date === today() && item.status === "planned")
      .sort((a, b) => Number(b.minutes) - Number(a.minutes));

    let candidate;
    let origin = "adaptive";

    if (todaysPlan.length && !options.ignorePlan) {
      const item = todaysPlan[0];
      const topic = topicById(item.topic);
      candidate = { subjectId: item.subject, topic, plan: item };
      origin = "planned";
    } else {
      const ranked = D.subjects.flatMap((subject) =>
        subject.topics.map((topic) => ({
          subjectId: subject.id,
          topic: { ...topic, subject: subject.id },
          score: topicNeedScore(subject.id, topic),
        })),
      );
      ranked.sort((a, b) => b.score - a.score);
      candidate = ranked[0];
    }

    const progress = state.topicProgress[candidate.topic.id] || {};
    const dueError = state.errors.find(
      (error) =>
        error.topic === candidate.topic.id &&
        error.status !== "mastered" &&
        error.nextReview <= today(),
    );
    const dueCards = state.cards.filter(
      (card) => card.topic === candidate.topic.id && card.due <= today(),
    ).length;
    const minutes = Math.min(available, energy <= 2 ? 15 : energy === 3 ? 25 : 40);
    let mode = "exercise";
    if (dueError) mode = "correction";
    else if (dueCards >= 2) mode = "recall";
    else if ((progress.mastery || 0) < 30) mode = "course";

    const reasons = [];
    if (origin === "planned") reasons.push("prévue aujourd'hui");
    if ((progress.mastery || 0) < 40) reasons.push("niveau encore fragile");
    if (dueError) reasons.push("une erreur arrive à révision");
    if (dueCards) reasons.push(`${dueCards} carte${dueCards > 1 ? "s" : ""} à revoir`);
    if (!progress.lastStudied) reasons.push("chapitre peu travaillé");

    return {
      subject: subjectById(candidate.subjectId),
      topic: candidate.topic,
      mode,
      minutes,
      energy,
      origin,
      reason: reasons.slice(0, 2).join(" et ") || "meilleur rapport priorité/progression",
      objective:
        mode === "correction"
          ? `Comprendre puis refaire l'erreur : ${dueError?.title || candidate.topic.name}`
          : mode === "recall"
            ? `Restituer sans support les idées clés de ${candidate.topic.name}`
            : mode === "course"
              ? `Comprendre les bases de ${candidate.topic.name} et les résumer`
              : `Résoudre une série courte sur ${candidate.topic.name}`,
    };
  }

  function daysUntilTarget() {
    return Math.max(0, diffDays(today(), state.profile.targetDate));
  }

  function currentPhase(value = today()) {
    return (
      D.phases.find((phase) => value >= phase.start && value <= phase.end) ||
      (value < D.phases[0].start ? D.phases[0] : D.phases[D.phases.length - 1])
    );
  }

  function planWeeks(start = mondayOf(), end = state.profile.targetDate) {
    const weeks = [];
    let cursor = mondayOf(start);
    while (cursor <= end) {
      weeks.push({
        start: cursor,
        end: addDays(cursor, 6),
        phase: currentPhase(cursor),
        items: scheduleBetween(cursor, addDays(cursor, 6)),
        sessions: sessionsBetween(cursor, addDays(cursor, 6)),
      });
      cursor = addDays(cursor, 7);
    }
    return weeks;
  }

  function buildAdaptivePlan(options = {}) {
    const start = options.start || mondayOf();
    const end = options.end || state.profile.targetDate;
    const days = options.days || [1, 2, 3, 4, 6];
    const replaceGenerated = options.replaceGenerated !== false;
    const generated = [];
    let week = mondayOf(start);

    const topicQueues = Object.fromEntries(
      D.subjects.map((subject) => [
        subject.id,
        subject.topics
          .slice()
          .sort((a, b) => topicNeedScore(subject.id, b) - topicNeedScore(subject.id, a)),
      ]),
    );
    const subjectPattern = ["francais", "maths", "biologie", "physique", "maths"];
    let subjectOffset = 0;

    while (week <= end) {
      const phase = currentPhase(week);
      days.forEach((dayIndex, index) => {
        const date = addDays(week, dayIndex - 1);
        if (date < start || date > end) return;
        const subjectId = subjectPattern[(index + subjectOffset) % subjectPattern.length];
        const queue = topicQueues[subjectId];
        const topic = queue[(Math.floor(diffDays(start, date) / 7) + index) % queue.length];
        const mode =
          phase.id === "routine"
            ? index % 2
              ? "exercise"
              : "course"
            : phase.id === "bases"
              ? index === 4
                ? "recall"
                : "exercise"
              : phase.id === "entrainement"
                ? index === 4
                  ? "exam"
                  : "exercise"
                : index % 2
                  ? "correction"
                  : "exam";
        const minutes = phase.id === "examens" ? 45 : phase.id === "entrainement" ? 35 : 25;
        generated.push({
          id: uid("plan"),
          date,
          subject: subjectId,
          topic: topic.id,
          mode,
          minutes,
          title: topic.name,
          status: "planned",
          source: "generated",
          phase: phase.id,
        });
      });
      subjectOffset = (subjectOffset + 1) % subjectPattern.length;
      week = addDays(week, 7);
    }

    update((draft) => {
      if (replaceGenerated) {
        draft.schedule = draft.schedule.filter(
          (item) =>
            item.source !== "generated" ||
            item.status === "done" ||
            item.date < start ||
            item.date > end,
        );
      }
      const existingKeys = new Set(
        draft.schedule.map((item) => `${item.date}|${item.subject}|${item.topic}`),
      );
      generated.forEach((item) => {
        const key = `${item.date}|${item.subject}|${item.topic}`;
        if (!existingKeys.has(key)) {
          draft.schedule.push(item);
          existingKeys.add(key);
        }
      });
      draft.schedule.sort((a, b) => a.date.localeCompare(b.date));
    }, "plan-generated");

    return generated;
  }

  function recordSession(payload) {
    const minutes = Math.max(1, Math.round(Number(payload.minutes || 0)));
    const session = {
      id: uid("session"),
      date: payload.date || today(),
      subject: payload.subject,
      topic: payload.topic,
      mode: payload.mode || "exercise",
      minutes,
      focus: clamp(payload.focus || 3, 1, 5),
      energy: clamp(payload.energy || 3, 1, 5),
      note: String(payload.note || "").trim(),
      distractions: Number(payload.distractions || 0),
      createdAt: new Date().toISOString(),
    };

    update((draft) => {
      draft.sessions.push(session);
      const progress = draft.topicProgress[session.topic];
      if (progress) {
        const mode = D.learningModes.find((item) => item.id === session.mode);
        const gain = clamp(
          (minutes / 25) * (mode?.multiplier || 1) * (0.75 + session.focus * 0.1),
          0.5,
          5,
        );
        progress.mastery = clamp(progress.mastery + gain, 0, 100);
        progress.confidence = clamp(Math.round(progress.mastery / 20), 1, 5);
        progress.lastStudied = session.date;
        progress.sessions = Number(progress.sessions || 0) + 1;
      }
      const planned = draft.schedule.find(
        (item) =>
          item.date === session.date &&
          item.subject === session.subject &&
          item.status === "planned",
      );
      if (planned) planned.status = "done";
    }, "session-recorded");

    return session;
  }

  function reviewCard(cardId, rating) {
    update((draft) => {
      const card = draft.cards.find((item) => item.id === cardId);
      if (!card) return;
      const quality = { again: 1, hard: 3, good: 4, easy: 5 }[rating] || 3;
      let interval = Number(card.interval || 1);
      let repetitions = Number(card.repetitions || 0);
      let ease = Number(card.ease || 2.5);

      if (quality < 3) {
        repetitions = 0;
        interval = 1;
      } else {
        if (repetitions === 0) interval = 1;
        else if (repetitions === 1) interval = 3;
        else interval = Math.max(1, Math.round(interval * ease));
        repetitions += 1;
      }

      ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
      if (rating === "hard") interval = Math.max(1, Math.round(interval * 0.8));
      if (rating === "easy") interval = Math.max(2, Math.round(interval * 1.3));

      card.interval = interval;
      card.repetitions = repetitions;
      card.ease = Number(ease.toFixed(2));
      card.due = addDays(today(), interval);
      card.lastReviewed = today();
      draft.reviews.push({
        id: uid("review"),
        cardId,
        rating,
        date: new Date().toISOString(),
      });

      const progress = draft.topicProgress[card.topic];
      if (progress && quality >= 4) progress.mastery = clamp(progress.mastery + 0.35, 0, 100);
    }, "card-reviewed");
  }

  function reviewError(errorId, result) {
    update((draft) => {
      const error = draft.errors.find((item) => item.id === errorId);
      if (!error) return;
      error.reviews = Number(error.reviews || 0) + 1;
      error.lastReview = today();
      if (result === "mastered") {
        error.status = "mastered";
        error.nextReview = addDays(today(), 30);
      } else if (result === "understood") {
        error.status = "learning";
        error.nextReview = addDays(today(), Math.min(14, 2 ** error.reviews));
      } else {
        error.status = "to_review";
        error.nextReview = addDays(today(), 1);
      }
    }, "error-reviewed");
  }

  function dailySeries(days = 14) {
    const labels = [];
    const values = [];
    for (let index = days - 1; index >= 0; index -= 1) {
      const date = addDays(today(), -index);
      labels.push(date);
      values.push(totalMinutes(state.sessions.filter((session) => session.date === date)));
    }
    return { labels, values };
  }

  function weeklySeries(weeks = 8) {
    const labels = [];
    const values = [];
    for (let index = weeks - 1; index >= 0; index -= 1) {
      const start = addDays(mondayOf(), -index * 7);
      labels.push(start);
      values.push(totalMinutes(sessionsBetween(start, addDays(start, 6))));
    }
    return { labels, values };
  }

  function activityHeatmap(days = 84) {
    const result = [];
    for (let index = days - 1; index >= 0; index -= 1) {
      const date = addDays(today(), -index);
      const minutes = totalMinutes(state.sessions.filter((session) => session.date === date));
      result.push({ date, minutes, level: minutes === 0 ? 0 : minutes < 20 ? 1 : minutes < 40 ? 2 : 3 });
    }
    return result;
  }

  function exportData() {
    return JSON.stringify(
      {
        app: "CAP DAEU",
        exportedAt: new Date().toISOString(),
        data: state,
      },
      null,
      2,
    );
  }

  function importData(text) {
    const parsed = JSON.parse(text);
    return replace(parsed.data || parsed, "import");
  }

  window.CAP_CORE = {
    STORAGE_KEY,
    VERSION,
    addDays,
    buildAdaptivePlan,
    clamp,
    currentPhase,
    dailySeries,
    daysUntilTarget,
    diffDays,
    exportData,
    getState,
    importData,
    load,
    mondayOf,
    monthKey,
    planWeeks,
    recommend,
    recordSession,
    replace,
    reset,
    reviewCard,
    reviewError,
    scheduleBetween,
    sessionsBetween,
    streak,
    subjectById,
    subjectStats,
    subscribe,
    topicById,
    totalMinutes,
    update,
    weekStats,
    weeklySeries,
    activityHeatmap,
    today,
    uid,
  };
})();
