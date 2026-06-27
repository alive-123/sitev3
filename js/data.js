(function () {
  "use strict";

  const DAY = 86_400_000;
  const iso = (date) => new Date(date).toISOString().slice(0, 10);
  const shiftDate = (days) => iso(Date.now() + days * DAY);

  const subjects = [
    {
      id: "francais",
      name: "Français",
      short: "FR",
      color: "#e65f4b",
      soft: "#fff0ec",
      icon: "book-open-text",
      weeklyTarget: 80,
      description: "Lire avec méthode, argumenter clairement et écrire avec précision.",
      topics: [
        { id: "fr-consigne", name: "Analyser une consigne", mastery: 62, priority: 2 },
        { id: "fr-grammaire", name: "Grammaire et orthographe", mastery: 48, priority: 3 },
        { id: "fr-argumentation", name: "Argumentation", mastery: 36, priority: 5 },
        { id: "fr-resume", name: "Résumé et synthèse", mastery: 31, priority: 5 },
        { id: "fr-commentaire", name: "Commentaire de texte", mastery: 28, priority: 4 },
        { id: "fr-redaction", name: "Rédaction structurée", mastery: 42, priority: 5 },
      ],
    },
    {
      id: "maths",
      name: "Mathématiques",
      short: "MA",
      color: "#3367d6",
      soft: "#edf3ff",
      icon: "sigma",
      weeklyTarget: 100,
      description: "Comprendre les mécanismes, pratiquer souvent et expliquer chaque étape.",
      topics: [
        { id: "ma-calcul", name: "Calcul numérique", mastery: 58, priority: 3 },
        { id: "ma-pourcentages", name: "Proportions et pourcentages", mastery: 46, priority: 4 },
        { id: "ma-equations", name: "Équations et inéquations", mastery: 34, priority: 5 },
        { id: "ma-fonctions", name: "Fonctions et graphiques", mastery: 27, priority: 5 },
        { id: "ma-stats", name: "Statistiques", mastery: 41, priority: 4 },
        { id: "ma-probabilites", name: "Probabilités", mastery: 24, priority: 4 },
      ],
    },
    {
      id: "biologie",
      name: "Biologie",
      short: "BI",
      color: "#258a62",
      soft: "#eaf8f1",
      icon: "dna",
      weeklyTarget: 75,
      description: "Relier les notions, interpréter les documents et employer le bon vocabulaire.",
      topics: [
        { id: "bi-cellule", name: "Cellule et organisation du vivant", mastery: 54, priority: 4 },
        { id: "bi-genetique", name: "ADN et génétique", mastery: 32, priority: 5 },
        { id: "bi-metabolisme", name: "Métabolisme", mastery: 29, priority: 4 },
        { id: "bi-immunite", name: "Immunité", mastery: 38, priority: 4 },
        { id: "bi-corps", name: "Fonctions du corps humain", mastery: 44, priority: 4 },
        { id: "bi-ecologie", name: "Écosystèmes et environnement", mastery: 35, priority: 3 },
      ],
    },
    {
      id: "physique",
      name: "Physique",
      short: "PH",
      color: "#a45aa8",
      soft: "#faeffb",
      icon: "atom",
      weeklyTarget: 75,
      description: "Partir des unités, choisir la formule et contrôler la cohérence du résultat.",
      topics: [
        { id: "ph-unites", name: "Unités et conversions", mastery: 52, priority: 4 },
        { id: "ph-mecanique", name: "Mouvement et forces", mastery: 28, priority: 5 },
        { id: "ph-energie", name: "Énergie et puissance", mastery: 33, priority: 5 },
        { id: "ph-electricite", name: "Électricité", mastery: 25, priority: 5 },
        { id: "ph-ondes", name: "Ondes, son et lumière", mastery: 21, priority: 3 },
        { id: "ph-matiere", name: "Matière et transformations", mastery: 39, priority: 3 },
      ],
    },
  ];

  const phases = [
    {
      id: "routine",
      label: "Phase 1",
      name: "Installer le rythme",
      start: "2026-06-01",
      end: "2026-07-12",
      color: "#3367d6",
      goal: "Travailler régulièrement et diagnostiquer les bases fragiles.",
    },
    {
      id: "bases",
      label: "Phase 2",
      name: "Consolider les bases",
      start: "2026-07-13",
      end: "2026-08-23",
      color: "#258a62",
      goal: "Faire progresser les chapitres prioritaires avec exercices et rappel actif.",
    },
    {
      id: "entrainement",
      label: "Phase 3",
      name: "Passer à l'entraînement",
      start: "2026-08-24",
      end: "2026-09-27",
      color: "#e0a12a",
      goal: "Mélanger les chapitres, travailler sous contrainte et corriger les erreurs.",
    },
    {
      id: "examens",
      label: "Phase 4",
      name: "Se préparer aux épreuves",
      start: "2026-09-28",
      end: "2026-10-31",
      color: "#e65f4b",
      goal: "Examens blancs, corrections ciblées et révisions espacées.",
    },
  ];

  const learningModes = [
    { id: "course", label: "Comprendre", icon: "book-open", multiplier: 1 },
    { id: "exercise", label: "Pratiquer", icon: "pencil-ruler", multiplier: 1.25 },
    { id: "recall", label: "Rappel actif", icon: "brain", multiplier: 1.15 },
    { id: "exam", label: "Mode examen", icon: "timer", multiplier: 1.5 },
    { id: "correction", label: "Corriger", icon: "scan-search", multiplier: 1.3 },
  ];

  const tips = [
    "Commence par écrire ce que tu sais déjà avant d'ouvrir le cours.",
    "Une erreur expliquée vaut mieux que trois exercices faits trop vite.",
    "Après une notion, ferme le support et résume-la avec tes mots.",
    "Si tu bloques plus de cinq minutes, note le blocage puis consulte un indice.",
    "La régularité bat l'intensité : une séance courte compte vraiment.",
    "Termine par une trace : une phrase apprise, une erreur comprise, une prochaine action.",
  ];

  const initialCards = [
    {
      id: "card-vitesse",
      subject: "physique",
      topic: "ph-mecanique",
      front: "Quelle relation relie vitesse, distance et durée ?",
      back: "v = d / t, avec des unités cohérentes.",
      interval: 1,
      ease: 2.5,
      repetitions: 0,
      due: shiftDate(0),
    },
    {
      id: "card-argument",
      subject: "francais",
      topic: "fr-argumentation",
      front: "Quelle différence entre une thèse et un argument ?",
      back: "La thèse est l'idée défendue ; l'argument est une raison qui la soutient.",
      interval: 1,
      ease: 2.5,
      repetitions: 0,
      due: shiftDate(0),
    },
    {
      id: "card-gene",
      subject: "biologie",
      topic: "bi-genetique",
      front: "Qu'est-ce qu'un gène ?",
      back: "Une portion d'ADN portant une information héréditaire.",
      interval: 3,
      ease: 2.55,
      repetitions: 1,
      due: shiftDate(1),
    },
    {
      id: "card-image",
      subject: "maths",
      topic: "ma-fonctions",
      front: "Que représente f(a) ?",
      back: "L'image du nombre a par la fonction f.",
      interval: 2,
      ease: 2.4,
      repetitions: 1,
      due: shiftDate(0),
    },
  ];

  const initialErrors = [
    {
      id: "error-1",
      subject: "maths",
      topic: "ma-equations",
      title: "Changement de signe oublié",
      context: "Équation du premier degré",
      cause: "Je déplace un terme sans appliquer l'opération aux deux membres.",
      correction: "Écrire chaque transformation sur une nouvelle ligne et vérifier en remplaçant x.",
      status: "to_review",
      reviews: 0,
      nextReview: shiftDate(0),
      createdAt: shiftDate(-4),
    },
    {
      id: "error-2",
      subject: "francais",
      topic: "fr-redaction",
      title: "Exemple non relié à l'argument",
      context: "Paragraphe argumenté",
      cause: "Je donne l'exemple mais je n'explique pas ce qu'il prouve.",
      correction: "Ajouter une phrase de liaison : « Cet exemple montre que... »",
      status: "learning",
      reviews: 1,
      nextReview: shiftDate(2),
      createdAt: shiftDate(-7),
    },
  ];

  window.CAP_DATA = {
    DAY,
    subjects,
    phases,
    learningModes,
    tips,
    initialCards,
    initialErrors,
    shiftDate,
    iso,
  };
})();
