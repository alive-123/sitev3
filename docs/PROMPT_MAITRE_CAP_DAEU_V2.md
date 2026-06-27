# CAP DAEU V2 - Prompt maître et cahier des charges

Version du 27 juin 2026. Ce fichier reprend le contenu du document Word de 45 pages.

## 2. Mode d'emploi de ce document

Transformer une demande très large en une spécification exécutable, testable et transmissible à un agent de développement.

### Décisions et exigences

- Lire les 45 pages avant de modifier l'architecture ou le design.
- Considérer chaque critère d'acceptation comme obligatoire sauf mention explicite de phase ultérieure.
- Conserver la V1 intacte et produire la V2 dans un dossier indépendant.
- Privilégier un produit utilisable à une maquette statique ou à un simple plan.
- Documenter les compromis sans masquer les limites du navigateur ou de GitHub Pages.

### Données et comportement

- Le livrable cible est une application statique compatible GitHub Pages, enrichie par localStorage, un service worker et des bibliothèques locales.
- Le document sert à la fois de prompt maître, de référence produit, de backlog et de grille de recette.

### Critères d'acceptation

- Le développeur peut commencer sans demander de reformuler le besoin.
- Les pages, fonctions, données et tests attendus sont identifiables.
- Une personne non technique peut comprendre ce que la V2 doit permettre.

## 3. Prompt reformulé en une demande professionnelle

Exprimer clairement le projet demandé par Elias sans perdre son ambition ni ses contraintes personnelles.

### Décisions et exigences

- Auditer complètement le site DAEU B existant avant toute conception.
- Étudier les meilleures pratiques de Todoist, Notion Calendar, Anki, Quizlet et Khan Academy.
- Créer une seconde application originale inspirée des forces observées, sans copier l'identité d'un service.
- Implémenter réellement toutes les fonctions prioritaires avec données de démonstration et persistance locale.
- Livrer le code, un README, un ZIP GitHub Pages, un audit comparatif et des tests visuels.

### Données et comportement

- Le produit est personnel, en français, centré sur le DAEU B d'Elias et sa deadline du 31 octobre 2026.
- La V2 doit rester utilisable gratuitement, sans serveur, sans compte et sans base de données distante.

### Critères d'acceptation

- Le résultat est un second site complet et non une modification silencieuse de la V1.
- Le premier écran permet immédiatement de décider puis commencer une séance.
- Le planning couvre plusieurs mois et ne s'arrête pas à une seule semaine.

## 4. Vision produit

Faire de CAP DAEU un copilote de révision qui transforme une intention vague en prochaine action réaliste.

### Décisions et exigences

- Réduire le temps passé à choisir quoi travailler.
- Relier planification, exécution, mémorisation, correction et mesure.
- Valoriser la régularité plutôt que les longues sessions exceptionnelles.
- Faire apparaître une seule recommandation principale sur la vue Aujourd'hui.
- Adapter le travail à l'énergie disponible sans présenter une micro-séance comme un échec.

### Données et comportement

- La boucle produit est : planifier, commencer, enregistrer, mettre à jour la maîtrise, programmer les rappels, recommander.
- Chaque donnée saisie doit améliorer une décision future ou un indicateur compréhensible.

### Critères d'acceptation

- La prochaine action est visible en moins de cinq secondes.
- Une séance terminée influence les recommandations et les statistiques.
- L'application ne donne jamais l'impression d'un tableau de bord décoratif.

## 5. Utilisateur principal et contexte

Concevoir pour Elias, qui révise souvent avec ChatGPT et consulte fréquemment le site depuis son téléphone.

### Décisions et exigences

- Employer un français simple, direct et encourageant sans infantiliser.
- Prévoir des sessions de 10 à 50 minutes et des interruptions possibles.
- Mettre les actions principales à portée du pouce sur mobile.
- Ne pas exiger de compte, de mot de passe ou de configuration technique.
- Permettre l'export des données pour changer d'appareil.

### Données et comportement

- Les matières prioritaires sont le français, les mathématiques, la biologie et la physique.
- La poursuite vers l'informatique est une motivation, pas une fonction à surcharger dans chaque écran.

### Critères d'acceptation

- Le contenu principal apparaît dans le premier écran mobile.
- Le vocabulaire des boutons décrit une action concrète.
- Une période de faible énergie reste compatible avec le plan.

## 6. Audit de la V1

Conserver les bonnes idées du premier site tout en corrigeant ses limites structurelles.

### Décisions et exigences

- Conserver la simplicité du démarrage de session et la sauvegarde locale.
- Remplacer la grande sidebar mobile par une navigation compacte.
- Remplacer le conseil fixe du jour par un moteur qui regarde l'état réel.
- Remplacer l'agenda répétitif par des vues mensuelle, hebdomadaire et liste.
- Remplacer les niveaux statiques par une maîtrise mise à jour après les séances.

### Données et comportement

- La V1 contient déjà dashboard, agenda, sessions, tâches, flashcards, matières et réglages.
- Ses faiblesses sont surtout la profondeur, la durée du planning, l'adaptation et l'ergonomie mobile.

### Critères d'acceptation

- Aucune fonction essentielle de la V1 ne disparaît sans équivalent.
- Les améliorations sont visibles dans les parcours, pas seulement dans le style.
- Le dépôt ou dossier de la V1 reste intact.

## 7. Benchmark des meilleures références

Importer des principes efficaces sans fabriquer un collage incohérent.

### Décisions et exigences

- Todoist inspire la vue Aujourd'hui et la hiérarchie des tâches.
- Notion Calendar inspire la lecture mensuelle et hebdomadaire des engagements.
- Anki inspire le rappel actif et les intervalles de répétition espacée.
- Quizlet inspire les modes de révision et les réponses graduées.
- Khan Academy inspire la notion de maîtrise et de parcours personnalisé.

### Données et comportement

- Chaque inspiration doit être reliée à une fonction CAP DAEU précise.
- Les noms, contenus, couleurs et interactions restent originaux et adaptés au DAEU.

### Critères d'acceptation

- Le produit ne reprend aucune marque ou interface propriétaire.
- Le benchmark figure dans un tableur avec sources.
- La V2 possède une proposition de valeur distincte : la boucle d'étude complète.

## 8. Principes de conception

Éviter que la complexité fonctionnelle ne devienne une complexité d'usage.

### Décisions et exigences

- Une vue répond à une question principale.
- Un bouton principal domine visuellement par écran.
- Les cartes ne servent qu'aux éléments réellement groupés ou répétés.
- Les explications secondaires restent courtes et actionnables.
- Les couleurs codent les matières et les états, pas la décoration.

### Données et comportement

- La palette associe bleu, corail, vert, ambre et violet à des rôles stables.
- Les rayons restent modérés et la mise en page privilégie les bandes, listes et grilles.

### Critères d'acceptation

- Aucune carte n'est imbriquée dans une autre carte décorative.
- Les textes et boutons restent lisibles à 390 pixels.
- L'interface ne dépend pas d'une animation pour être comprise.

## 9. Architecture de l'information

Organiser onze espaces sans perdre l'utilisateur.

### Décisions et exigences

- Groupe Organiser : Aujourd'hui, Mon plan, Agenda et Focus.
- Groupe Apprendre : Matières, Flashcards, Mes erreurs et Examens blancs.
- Groupe Mesurer : Progression, Bilan et Réglages.
- Sur mobile, exposer cinq accès : Aujourd'hui, Agenda, Focus, Progrès et Plus.
- Utiliser des routes hash pour garantir la compatibilité GitHub Pages.

### Données et comportement

- La route par défaut est #/today et chaque vue est directement partageable par son URL.
- Les paramètres de session passent dans la query du hash : matière, chapitre, mode et durée.

### Critères d'acceptation

- Toutes les routes s'ouvrent sans serveur applicatif.
- La navigation active est identifiable visuellement et sémantiquement.
- Le menu mobile donne accès aux onze espaces.

## 10. Modèle de données global

Créer une source de vérité locale cohérente et évolutive.

### Décisions et exigences

- Stocker profil, interface, progression des chapitres, planning, sessions, cartes, erreurs, examens, bilans et tâches.
- Attribuer un identifiant stable à chaque objet.
- Conserver les dates au format ISO YYYY-MM-DD.
- Versionner la structure de sauvegarde.
- Normaliser les anciennes ou données partielles lors du chargement.

### Données et comportement

- Les relations utilisent subject et topic plutôt qu'une duplication complète des libellés.
- Les données de démonstration doivent rester réalistes et toutes les vues doivent fonctionner immédiatement.

### Critères d'acceptation

- Un JSON exporté peut être réimporté sans perte.
- Une sauvegarde illisible ne casse pas l'application.
- Les calculs n'utilisent pas de valeurs magiques dispersées.

## 11. Système visuel

Donner une identité sérieuse, calme et personnelle à CAP DAEU.

### Décisions et exigences

- Utiliser un fond gris très clair, des surfaces blanches et un texte bleu nuit.
- Associer français au corail, maths au bleu, biologie au vert et physique au violet.
- Réserver l'ambre aux alertes et aux éléments à revoir.
- Employer Lucide pour les icônes et Chart.js pour les graphiques.
- Prévoir une vraie palette sombre plutôt qu'une simple inversion.

### Données et comportement

- Les tokens CSS centralisent couleurs, bordures, ombres, rayons, largeur de sidebar et typographie.
- Le logo CAP est original et existe en SVG, 192 px et 512 px.

### Critères d'acceptation

- Le contraste reste suffisant dans les deux thèmes.
- Les icônes ont un sens constant et un libellé accessible si nécessaire.
- Aucune dominante monochrome ne rend l'application monotone.

## 12. Accessibilité et ergonomie mobile

Rendre le produit utilisable au clavier, au toucher et avec des préférences de mouvement réduites.

### Décisions et exigences

- Maintenir des cibles tactiles proches de 40 pixels.
- Fournir aria-label aux boutons uniquement iconiques.
- Afficher un focus visible sur les contrôles.
- Respecter la réduction des animations configurée dans l'application.
- Empêcher tout débordement horizontal au niveau du document.

### Données et comportement

- Le calendrier peut défiler dans son propre conteneur sans élargir la page.
- Les boutons de notation utilisent de vrais inputs radio masqués sans occuper la largeur du viewport.

### Critères d'acceptation

- Les onze vues tiennent dans un viewport de 390 pixels.
- La navigation mobile reste visible sans masquer l'action principale.
- La structure des titres et rôles est lisible dans un snapshot d'accessibilité.

## 13. Vue Aujourd'hui

Faire de la page d'accueil un poste de décision et non une page marketing.

### Décisions et exigences

- Afficher une prochaine action avec matière, chapitre, mode, durée et objectif.
- Expliquer brièvement pourquoi cette action est recommandée.
- Afficher l'élan hebdomadaire, quatre métriques, le programme du jour et les matières.
- Permettre de démarrer en un geste.
- Proposer une adaptation selon l'énergie.

### Données et comportement

- La recommandation vient d'abord du planning du jour, puis du score de besoin.
- Le programme mélange séances planifiées et tâches rapides sans les confondre.

### Critères d'acceptation

- L'action principale est visible sans scroll sur téléphone.
- Les données de la semaine correspondent aux sessions enregistrées.
- La page reste utile même quand aucune séance n'est prévue.

## 14. Moteur de recommandation

Choisir le meilleur prochain chapitre en combinant plusieurs signaux simples et explicables.

### Décisions et exigences

- Donner du poids au manque de maîtrise.
- Ajouter la priorité pédagogique du chapitre.
- Augmenter le score pour les erreurs et cartes dues.
- Tenir compte du temps depuis la dernière étude.
- Réduire le score si le chapitre est déjà prévu très prochainement.

### Données et comportement

- Le mode devient Correction si une erreur est due, Rappel actif si plusieurs cartes sont dues, Comprendre si la maîtrise est très basse, sinon Pratiquer.
- La durée dépend de l'énergie et du temps disponible : environ 10, 25 ou 40 minutes.

### Critères d'acceptation

- La recommandation est déterministe avec le même état.
- La raison affichée correspond aux signaux réellement utilisés.
- Un planning du jour cohérent reste prioritaire.

## 15. Plan long terme

Donner une trajectoire visible de maintenant jusqu'à octobre.

### Décisions et exigences

- Créer quatre phases datées : rythme, bases, entraînement, examens.
- Afficher la deadline, la charge hebdomadaire et les séances futures.
- Permettre une génération complète en un bouton.
- Afficher les semaines sous forme de sections dépliables.
- Filtrer visuellement les séances par matière.

### Données et comportement

- Chaque semaine contient phase, dates, séances prévues, temps prévu et temps réalisé.
- Les séances manuelles ou déjà terminées ne sont jamais supprimées par une régénération.

### Critères d'acceptation

- Le plan généré couvre jusqu'au 31 octobre inclus.
- Les mois montrent un volume de travail progressif.
- La régénération évite les doublons date, matière et chapitre.

## 16. Algorithme de génération du plan

Produire un calendrier crédible avec une charge raisonnable et une alternance des matières.

### Décisions et exigences

- Utiliser cinq jours de travail par semaine par défaut.
- Alterner français, maths, biologie, physique et un second bloc maths.
- Classer les chapitres de chaque matière par besoin.
- Faire évoluer les modes selon la phase.
- Augmenter progressivement la durée vers les examens blancs.

### Données et comportement

- Les séances générées portent source=generated et phase=<id de phase>.
- Les statuts restent planned jusqu'à une session associée ou une action manuelle.

### Critères d'acceptation

- Une génération depuis fin juin crée environ quatre-vingt-dix séances.
- Aucune semaine n'impose les quatre matières le même jour.
- Les dates restent dans la période demandée.

## 17. Agenda mensuel

Voir la charge et les échéances sur un mois sans perdre les détails essentiels.

### Décisions et exigences

- Afficher une grille de six semaines commençant le lundi.
- Différencier les jours extérieurs au mois et le jour courant.
- Afficher jusqu'à trois séances par cellule avec couleur matière.
- Afficher le temps réalisé si une session existe ce jour.
- Ouvrir la modification en touchant une séance.

### Données et comportement

- Le curseur de mois est stocké dans l'état UI.
- Les boutons précédent, aujourd'hui et suivant modifient ce curseur.

### Critères d'acceptation

- Le changement de mois conserve le reste des données.
- Le calendrier défile dans son conteneur sur petit écran.
- Les événements terminés sont visuellement distincts.

## 18. Agenda hebdomadaire et liste

Fournir deux lectures complémentaires : le temps et la prochaine action.

### Décisions et exigences

- La semaine affiche sept colonnes et des lignes horaires.
- La liste groupe les séances par date et les trie chronologiquement.
- Les trois modes d'affichage sont accessibles par un contrôle segmenté.
- La sélection d'une séance ouvre le même formulaire d'édition.
- Une file latérale montre les séances manquées et révisions dues.

### Données et comportement

- calendarView accepte month, week ou list.
- Les sessions en retard sont les éléments planned dont la date précède aujourd'hui.

### Critères d'acceptation

- Le changement de vue est immédiat et persistant.
- La liste reste lisible avec trente événements.
- La file de rattrapage disparaît quand le planning est à jour.

## 19. Mode Focus

Créer une surface calme où le contenu de la séance domine le reste.

### Décisions et exigences

- Afficher matière, chapitre, mode et objectif modifiables.
- Proposer quatre presets : 15, 25, 40 et 50 minutes.
- Afficher un anneau de progression et un temps tabulaire.
- Garder les commandes Démarrer, Pause et Terminer stables.
- Proposer un bouton plein écran et un compteur de distractions.

### Données et comportement

- Le timer conserve duration, remaining, endAt, running, paused et distractions.
- Le temps restant est recalculé depuis endAt pour résister au ralentissement d'un onglet.

### Critères d'acceptation

- Démarrer remplace le bouton par Pause.
- Le layout ne bouge pas quand le texte du timer change.
- L'objectif se replie sur deux lignes sur mobile.

## 20. Alarme et notifications

Prévenir Elias même s'il travaille dans un autre onglet ChatGPT.

### Décisions et exigences

- Jouer une courte séquence sonore générée par Web Audio.
- Demander l'autorisation de notification seulement après une action utilisateur.
- Utiliser le service worker pour une notification persistante si possible.
- Fournir un bouton de test du son.
- Continuer à fonctionner si les notifications sont refusées.

### Données et comportement

- Les notifications exigent HTTPS ou localhost et leur disponibilité varie selon le navigateur.
- Le clic sur la notification ramène vers la route Focus.

### Critères d'acceptation

- La fin du temps ouvre le bilan de séance.
- Le son fonctionne sans fichier audio distant.
- Aucune erreur n'empêche la sauvegarde si l'API est indisponible.

## 21. Bilan de fin de séance

Capturer assez d'information pour améliorer le suivi sans transformer la fin en formulaire pénible.

### Décisions et exigences

- Préremplir matière, chapitre, mode, date et durée réelle.
- Saisir une phrase sur le travail réalisé.
- Noter concentration et énergie de 1 à 5.
- Conserver le nombre de distractions.
- Associer la session à une séance planifiée du même jour.

### Données et comportement

- L'enregistrement crée une session puis met à jour la maîtrise, la dernière étude et le nombre de séances du chapitre.
- La séance planifiée correspondante passe à done.

### Critères d'acceptation

- Une session sauvegardée augmente le temps total.
- Le chapitre ciblé change de maîtrise.
- Le formulaire peut être annulé sans créer de donnée.

## 22. Matières et chapitres

Montrer une carte de compétences plutôt qu'une simple liste de matières.

### Décisions et exigences

- Présenter quatre onglets avec couleur, icône et maîtrise.
- Afficher description, maîtrise globale, temps récent, cartes et erreurs dues.
- Lister six chapitres par matière dans les données de démonstration.
- Afficher statut fragile, en cours ou solide.
- Permettre de lancer une séance depuis un chapitre.

### Données et comportement

- La maîtrise globale est la moyenne des maîtrises des chapitres.
- La confiance 1 à 5 dérive de la maîtrise mais reste stockée pour évoluer.

### Critères d'acceptation

- Le paramètre subject ouvre directement la matière ciblée.
- Les couleurs restent cohérentes dans toutes les vues.
- Les longues listes conservent alignements et lisibilité.

## 23. Flashcards

Créer une expérience de rappel actif rapide, agréable et mesurable.

### Décisions et exigences

- Afficher le nombre de cartes dues par matière.
- Présenter une seule question à la fois.
- Révéler la réponse au clic avec une rotation optionnelle.
- Proposer quatre évaluations : À revoir, Difficile, Bien, Facile.
- Permettre la création d'une carte avec matière, chapitre, question et réponse.

### Données et comportement

- Une carte contient interval, ease, repetitions, due et lastReviewed.
- La file du jour sélectionne toutes les cartes dont due est inférieur ou égal à aujourd'hui.

### Critères d'acceptation

- Une réponse retire la carte de la file du jour.
- La prochaine échéance change selon l'évaluation.
- L'état vide félicite sans bloquer la navigation.

## 24. Algorithme de répétition espacée

Utiliser une adaptation simple inspirée de SM-2 sans prétendre reproduire FSRS.

### Décisions et exigences

- Réinitialiser à un jour après un oubli.
- Utiliser des premiers intervalles de un puis trois jours.
- Multiplier ensuite l'intervalle par un facteur d'aisance.
- Réduire légèrement l'intervalle pour Difficile et l'augmenter pour Facile.
- Maintenir ease au-dessus de 1,3.

### Données et comportement

- Chaque évaluation est enregistrée dans reviews avec carte, note et date.
- Une réponse Bien ou Facile peut produire un petit gain de maîtrise du chapitre.

### Critères d'acceptation

- Les intervalles augmentent après des réponses réussies répétées.
- Un oubli ramène rapidement la carte.
- Les calculs restent stables après export et import.

## 25. Carnet d'erreurs

Transformer chaque erreur importante en objet d'apprentissage révisable.

### Décisions et exigences

- Saisir matière, chapitre, titre, contexte, cause et correction.
- Afficher les erreurs dues en priorité.
- Permettre trois réponses : encore fragile, compris, maîtrisé.
- Reprogrammer automatiquement la prochaine révision.
- Conserver une bibliothèque des erreurs actives.

### Données et comportement

- Les statuts sont to_review, learning et mastered.
- Un résultat compris utilise un intervalle croissant limité ; maîtrisé reporte à trente jours.

### Critères d'acceptation

- Une erreur due apparaît sur Aujourd'hui et dans l'Agenda.
- La réponse choisie modifie statut et date.
- La correction reste visible lors de la révision.

## 26. Examens blancs

Introduire progressivement les conditions réelles et une boucle de correction.

### Décisions et exigences

- Saisir matière, date, titre, note, barème, durée et leçon.
- Normaliser les résultats sur 20.
- Afficher moyenne, courbe et historique.
- Proposer un mini-examen de 45 minutes depuis l'interface.
- Encourager la création d'erreurs et de séances ciblées après correction.

### Données et comportement

- Chaque examen conserve score et maxScore pour respecter le barème d'origine.
- La courbe trie les résultats par date.

### Critères d'acceptation

- Une note sur un autre barème est correctement convertie.
- Le graphique reste lisible avec deux résultats.
- Une liste vide ne produit pas de division par zéro.

## 27. Tableau de progression

Réunir uniquement les indicateurs qui aident à ajuster le travail.

### Décisions et exigences

- Afficher temps cumulé, série, objectif hebdomadaire et maîtrise moyenne.
- Tracer huit semaines de temps avec une ligne cible.
- Afficher la répartition du temps par matière.
- Comparer les maîtrises des quatre matières.
- Afficher une heatmap sur douze semaines.

### Données et comportement

- Les séries journalières et hebdomadaires sont générées même pour les jours à zéro.
- Les graphiques utilisent des plages bornées et des couleurs stables.

### Critères d'acceptation

- Les axes affichent les minutes.
- Les graphiques sont détruits avant un nouveau rendu.
- Les canevas restent non vides sur mobile et ordinateur.

## 28. Bilan hebdomadaire

Créer un rituel de cinq minutes pour ajuster la semaine suivante.

### Décisions et exigences

- Demander une victoire, un frein et une priorité.
- Noter énergie et confiance de 1 à 5.
- Afficher un résumé automatique du temps et des avancées.
- Proposer un chapitre prioritaire.
- Conserver l'historique des réflexions.

### Données et comportement

- Chaque bilan porte une date et le lundi de sa semaine.
- La dernière réponse préremplit le formulaire pour faciliter une mise à jour.

### Critères d'acceptation

- Les radios masquées n'élargissent pas la page.
- L'enregistrement déclenche une confirmation.
- Le bilan reste utile avec zéro séance.

## 29. Persistance locale

Garantir une expérience personnelle sans infrastructure serveur.

### Décisions et exigences

- Sauvegarder tout l'état dans localStorage après chaque modification.
- Utiliser une clé dédiée à la V2.
- Fusionner les réglages manquants avec les valeurs par défaut.
- Fournir une réinitialisation confirmée.
- Ne jamais envoyer les données vers un service externe.

### Données et comportement

- Les bibliothèques Chart.js et Lucide sont locales mais ne reçoivent aucune donnée personnelle.
- Les graphiques sont calculés dans le navigateur.

### Critères d'acceptation

- Un rechargement conserve le plan généré.
- Deux origines différentes possèdent des données séparées.
- La réinitialisation restaure les données de démonstration.

## 30. Export, import et changement d'appareil

Compense l'absence de compte en donnant le contrôle du fichier de sauvegarde.

### Décisions et exigences

- Exporter un JSON daté contenant métadonnées et état.
- Importer un fichier JSON sélectionné par l'utilisateur.
- Accepter un ancien format contenant directement l'état.
- Afficher une erreur claire si le fichier est invalide.
- Recalculer les vues immédiatement après import.

### Données et comportement

- Le JSON ne contient ni mot de passe ni jeton.
- Le nom proposé est cap-daeu-sauvegarde-YYYY-MM-DD.json.

### Critères d'acceptation

- Une exportation puis importation conserve tous les objets.
- Un fichier arbitraire ne remplace pas les données.
- Le téléchargement fonctionne sans serveur.

## 31. PWA et fonctionnement hors ligne

Permettre l'installation comme application et l'ouverture après une première visite.

### Décisions et exigences

- Fournir manifest.webmanifest avec nom, icônes, start_url et raccourcis.
- Fournir des icônes PNG 192 et 512 avec purpose maskable.
- Mettre en cache les fichiers de l'application dans un service worker.
- Supprimer les anciennes versions de cache à l'activation.
- Afficher des instructions d'installation lorsque le prompt natif est indisponible.

### Données et comportement

- Le cache inclut HTML, CSS, scripts, bibliothèques, manifeste et icônes.
- La stratégie est cache-first puis réseau avec fallback vers index.html.

### Critères d'acceptation

- Le service worker s'enregistre en HTTPS et sur localhost.
- L'application démarre sur #/today.
- Une nouvelle version utilise un nouveau nom de cache.

## 32. Compatibilité GitHub Pages

Publier la V2 comme second site sans serveur Node en production.

### Décisions et exigences

- Utiliser exclusivement des chemins relatifs.
- Utiliser des routes hash pour éviter les 404 de navigation.
- Fournir un 404.html qui redirige vers l'application.
- Ne dépendre d'aucune variable serveur.
- Décrire le déploiement depuis main et /(root).

### Données et comportement

- server.js sert uniquement au test local sur le port 4174.
- Le dépôt recommandé est cap-daeu-elias, distinct de site-sympa.

### Critères d'acceptation

- L'application fonctionne sous un sous-chemin /nom-du-repo/.
- Les icônes et scripts se chargent sur GitHub Pages.
- Le README donne une URL finale compréhensible.

## 33. Vie privée et sécurité

Rendre explicite le modèle de confiance d'une application personnelle sans backend.

### Décisions et exigences

- Conserver les données dans le navigateur.
- Échapper toutes les valeurs utilisateur injectées dans le HTML.
- Empêcher les chemins sortant du dossier dans le serveur local.
- Ne pas intégrer de scripts analytiques ou publicitaires.
- Prévenir que les données ne se synchronisent pas automatiquement.

### Données et comportement

- Les données saisies peuvent inclure des notes de travail mais ne doivent pas inclure de mot de passe.
- L'export est déclenché explicitement et reste sous contrôle de l'utilisateur.

### Critères d'acceptation

- Une chaîne contenant du HTML s'affiche comme texte.
- Le serveur local refuse un chemin hors racine.
- Aucune requête de données part vers une API tierce.

## 34. Données de démonstration

Montrer immédiatement le potentiel du produit sans forcer Elias à tout remplir.

### Décisions et exigences

- Créer vingt-quatre chapitres répartis sur quatre matières.
- Fournir cinq sessions récentes, six séances de semaine, quatre cartes et deux erreurs.
- Fournir deux examens blancs et deux tâches rapides.
- Utiliser des dates relatives pour rester crédible le jour du test.
- Employer des contenus scolaires plausibles et non des lorem ipsum.

### Données et comportement

- Les chapitres ont maîtrise initiale et priorité pédagogique.
- Les exemples évitent de prétendre être le programme officiel exact d'un établissement.

### Critères d'acceptation

- Toutes les vues sont peuplées au premier lancement.
- La semaine courante montre du temps réalisé.
- Les données peuvent être réinitialisées à tout moment.

## 35. Graphiques et visualisations

Utiliser les graphiques comme preuves et non comme décoration.

### Décisions et exigences

- Utiliser un histogramme pour les sept jours.
- Utiliser une courbe pour les huit semaines et les examens.
- Utiliser un donut pour la répartition par matière.
- Utiliser une grille de cellules pour la heatmap.
- Afficher les unités dans les axes ou libellés.

### Données et comportement

- Les couleurs et textes s'adaptent au thème sombre.
- Les instances Chart sont détruites avant de changer de route.

### Critères d'acceptation

- Aucun graphique ne chevauche un texte.
- Les labels restent lisibles à 390 et 1440 pixels.
- Une série n'utilise pas plusieurs couleurs sans signification.

## 36. Plan de tests fonctionnels

Vérifier les parcours qui peuvent modifier ou perdre des données.

### Décisions et exigences

- Tester les onze routes et la présence de contenu.
- Tester la génération du plan et le nombre de séances créées.
- Tester une révision de flashcard et le changement d'échéance.
- Tester Démarrer puis Pause dans Focus.
- Tester ajout, modification et suppression d'une séance.

### Données et comportement

- Les contrôles utilisent le DOM accessible et des attributs stables.
- Les résultats principaux sont consignés dans le tableur d'audit.

### Critères d'acceptation

- Les tests critiques passent sans modifier la V1.
- Le plan ne crée pas de doublons lors d'un second clic.
- La persistance est vérifiée après rechargement.

## 37. Plan de tests visuels

Détecter les défauts que la validation syntaxique ne peut pas voir.

### Décisions et exigences

- Capturer la vue Aujourd'hui sur ordinateur.
- Capturer Aujourd'hui et Focus sur un viewport de 390 par 844.
- Mesurer scrollWidth et clientWidth sur chaque route.
- Vérifier qu'aucun texte essentiel n'est coupé.
- Vérifier la présence de la barre mobile et l'absence de sidebar.

### Données et comportement

- Les canevas sont contrôlés après chargement des bibliothèques.
- Les défauts de cache sont isolés avec une nouvelle origine locale.

### Critères d'acceptation

- Les onze routes ont scrollWidth égal à clientWidth sur mobile.
- Le premier écran mobile montre l'action recommandée.
- Le timer tient entièrement dans le viewport.

## 38. Qualité du code

Laisser une base compréhensible et modifiable sans outil de build.

### Décisions et exigences

- Séparer données, logique métier, rendu et styles.
- Utiliser des fonctions nommées pour calculs et vues.
- Centraliser les helpers de date, sécurité et formatage.
- Valider les quatre fichiers JavaScript avec node --check.
- Éviter les commentaires qui répètent le code.

### Données et comportement

- data.js expose le référentiel, core.js l'état et les algorithmes, app.js les vues et interactions.
- Les globals sont limités à CAP_DATA et CAP_CORE.

### Critères d'acceptation

- Aucune erreur de syntaxe n'est détectée.
- Le code fonctionne sans npm install.
- Le README explique la structure.

## 39. Livrables attendus

Rassembler tout ce qui permet de tester, comprendre et publier la V2.

### Décisions et exigences

- Dossier complet daeub-elias-cap-v2.
- ZIP prêt pour GitHub Pages.
- README d'installation et publication.
- Cahier des charges DOCX de 40 à 50 pages.
- Tableur d'audit et benchmark avec backlog et matrice de tests.

### Données et comportement

- Les livrables utilisateur restent dans outputs.
- Les scripts de construction et captures de QA restent dans work ou sont supprimés.

### Critères d'acceptation

- Chaque fichier final est non vide et ouvrable.
- Le ZIP contient index.html à sa racine.
- Les liens locaux livrés sont cliquables depuis Codex.

## 40. Déploiement comme second site

Éviter la confusion avec le dépôt site-sympa déjà publié.

### Décisions et exigences

- Créer un nouveau dépôt public nommé cap-daeu-elias.
- Envoyer le contenu dézippé à la racine du dépôt.
- Activer Pages depuis main et /(root).
- Attendre la construction puis ouvrir l'URL publiée.
- Conserver site-sympa comme V1 disponible séparément.

### Données et comportement

- L'URL cible est https://alive-123.github.io/cap-daeu-elias/.
- Les changements futurs nécessitent de remplacer les fichiers puis valider un commit.

### Critères d'acceptation

- Les deux sites ont des URLs différentes.
- La V2 charge ses bibliothèques et icônes.
- L'installation PWA est proposée après publication HTTPS.

## 41. Backlog de phase suivante

Identifier des évolutions possibles sans les confondre avec les fonctions déjà livrées.

### Décisions et exigences

- Ajouter import iCalendar et export d'événements.
- Ajouter recherche globale et palette de commandes.
- Ajouter pièces jointes locales pour copies et exercices.
- Ajouter statistiques de vitesse et précision par type d'exercice.
- Étudier une synchronisation chiffrée optionnelle seulement si nécessaire.

### Données et comportement

- Ces évolutions ne doivent pas alourdir la V2 actuelle.
- Toute fonction réseau future exige un modèle clair de compte, confidentialité et coût.

### Critères d'acceptation

- Les fonctions futures sont séparées du périmètre livré.
- Chaque idée possède un problème utilisateur identifiable.
- La priorité reste la qualité des habitudes d'étude.

## 42. Sources et justification

Ancrer les décisions dans des références officielles et des pratiques reconnues.

### Décisions et exigences

- Citer la documentation Anki sur rappel actif et répétition espacée.
- Citer les modes d'étude et la révision planifiée de Quizlet.
- Citer les vues calendrier de Todoist et Notion Calendar.
- Citer MDN pour Notifications et Service Worker.
- Citer web.dev pour manifeste et installation PWA.

### Données et comportement

- Les URL complètes figurent dans le README, le tableur et la présente page.
- Les sources décrivent des principes ; la conception CAP DAEU reste originale.

### Critères d'acceptation

- Chaque famille de fonction importante a au moins une source.
- Les citations pointent vers la page officielle, pas une recherche.
- Aucun long extrait protégé n'est reproduit.

## 43. Instructions d'implémentation pour Codex

Donner à un agent de code une séquence de travail claire et autonome.

### Décisions et exigences

- Inspecter les fichiers existants et la V1 avant de créer le nouveau dossier.
- Créer les fichiers statiques, les données, le cœur métier, l'interface et la PWA.
- Télécharger localement les versions stables de Chart.js et Lucide.
- Exécuter les contrôles syntaxiques puis lancer un serveur local.
- Tester ordinateur et mobile, corriger, créer le ZIP et les documents.

### Données et comportement

- Le serveur local recommandé utilise le port 4174 pour ne pas entrer en conflit avec la V1.
- Les modifications manuelles passent par un outil de patch et les fichiers générés par des scripts reproductibles.

### Critères d'acceptation

- L'agent ne s'arrête pas après un plan.
- Il explique les blocages réels mais tente d'abord de les résoudre.
- Il ne publie rien sur GitHub sans autorisation explicite.

## 44. Checklist de recette finale

Fournir une dernière vérification binaire avant livraison.

### Décisions et exigences

- Les onze routes s'ouvrent et aucune erreur console n'apparaît.
- Les vues mobile n'ont aucun débordement horizontal.
- Le plan, Focus, flashcards, erreurs, examens, bilans et réglages fonctionnent.
- Les graphiques sont non vides et les thèmes lisibles.
- Manifest, service worker, 404, icônes, README et ZIP sont présents.

### Données et comportement

- La matrice de tests du tableur doit afficher Réussi pour les contrôles exécutés.
- Le DOCX doit être rendu en images et contrôlé visuellement.

### Critères d'acceptation

- Le ZIP s'ouvre avec index.html à la racine.
- La documentation compte entre 40 et 50 pages.
- Le serveur local reste accessible à l'URL communiquée.

## 45. Prompt maître final à réutiliser

Fournir une version compacte mais complète pouvant être donnée à Codex pour recréer ou faire évoluer le projet.

### Décisions et exigences

- Crée une application web PWA appelée CAP DAEU pour Elias, séparée du site existant.
- Implémente onze vues : Aujourd'hui, Plan, Agenda, Focus, Matières, Flashcards, Erreurs, Examens, Progression, Bilan et Réglages.
- Relie les vues par une source de vérité locale et un moteur de recommandation explicable.
- Génère un plan jusqu'au 31 octobre 2026 et adapte les séances à l'énergie, aux erreurs, aux cartes dues et à la maîtrise.
- Utilise un design mobile d'abord, calme, accessible, multi-couleurs et compatible GitHub Pages.

### Données et comportement

- Ajoute données de démonstration, localStorage versionné, export/import JSON, Chart.js local, Lucide local, manifeste, service worker, alarmes et notifications.
- Teste réellement chaque route, le planning, le timer, les flashcards, le responsive 390 px et les graphiques avant de livrer.

### Critères d'acceptation

- Ne rends pas seulement un plan ou une maquette : code, lance, teste et corrige l'application.
- Ne modifie pas la V1 et livre un ZIP prêt à déposer dans un nouveau dépôt GitHub Pages.
- Livre aussi README, audit comparatif, backlog, matrice de tests et cahier des charges.

## Sources principales

- Anki : https://docs.ankiweb.net/background.html
- Quizlet : https://quizlet.com/ca/features/studymodes
- Quizlet, répétition espacée : https://quizlet.com/se/features/spaced-repetition
- Todoist : https://www.todoist.com/teams
- Notion Calendar : https://www.notion.com/fr/product/calendar
- Chart.js : https://www.chartjs.org/docs/latest/
- Lucide : https://lucide.dev/
- Notifications MDN : https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API
- Service Worker MDN : https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- Installation PWA : https://web.dev/learn/pwa/installation
- Manifeste PWA : https://web.dev/learn/pwa/web-app-manifest
