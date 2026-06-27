# CAP DAEU - Elias

Seconde version indépendante de l'application DAEU B. Le premier site n'est pas modifié.

## Ce que contient la V2

- recommandation quotidienne selon le planning, la maîtrise, les erreurs et les révisions dues ;
- plan adaptatif généré jusqu'au 31 octobre 2026 ;
- agenda mensuel, hebdomadaire et en liste ;
- mode Focus avec Pomodoro, alarme, notification et bilan de séance ;
- progression par matière et par chapitre ;
- flashcards avec répétition espacée ;
- carnet d'erreurs avec rappels ;
- examens blancs et courbe de notes ;
- bilan hebdomadaire ;
- thème sombre, export/import JSON, persistance locale et PWA installable.

## Tester en local

```powershell
node server.js
```

Puis ouvrir `http://localhost:4174`.

## Publier comme second site GitHub Pages

1. Créer un nouveau dépôt public, par exemple `cap-daeu-elias`.
2. Envoyer **le contenu de ce dossier** à la racine du dépôt.
3. Ouvrir `Settings` puis `Pages`.
4. Choisir `Deploy from a branch`, branche `main`, dossier `/(root)`.
5. Enregistrer et attendre la publication.

Le lien sera de la forme :

```text
https://alive-123.github.io/cap-daeu-elias/
```

Les données personnelles restent dans le navigateur avec `localStorage`. Pour changer d'appareil, utiliser Réglages > Exporter puis Importer.

## Structure

```text
index.html
styles.css
js/
  data.js
  core.js
  app.js
vendor/
assets/
manifest.webmanifest
sw.js
404.html
server.js
```

## Documents fournis

- `docs/Cahier_des_charges_Prompt_Maitre_CAP_DAEU_V2_45_pages.docx`
- `docs/PROMPT_MAITRE_CAP_DAEU_V2.md`
- `docs/Audit_Benchmark_CAP_DAEU_V2.xlsx`
- `docs/AUDIT_V1_ET_DECISIONS_V2.md`
- `docs/DEPLOIEMENT_GITHUB_PAGES.md`

## Sources d'inspiration fonctionnelle

- Anki : rappel actif et répétition espacée ;
- Quizlet : modes d'étude et séquences de révision ;
- Todoist : vue Aujourd'hui et planification simple ;
- Notion Calendar : lecture visuelle des échéances ;
- Chart.js : graphiques accessibles et responsives ;
- Lucide : système d'icônes cohérent.

CAP DAEU reste une application personnelle et ne remplace ni le programme officiel de l'établissement ni les conseils d'un enseignant.
