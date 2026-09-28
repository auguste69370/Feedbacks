# Questionnaire feedback membres

Un fichier HTML autonome que les membres remplissent seuls. Les réponses arrivent dans un Google Sheet.

## Mise en place (15 minutes, une seule fois)

1. **Créer le Google Sheet.** Crée un nouveau Google Sheet, par exemple « Feedback Campus ».
2. **Ajouter le script.** Dans le Sheet, va dans Extensions > Apps Script. Remplace le contenu par celui de `apps-script.gs`, puis enregistre.
3. **Déployer.** Clique sur Déployer > Nouveau déploiement > type « Application Web ».
   * Exécuter en tant que : **Moi**
   * Qui a accès : **Tout le monde**
   * Autorise l'accès quand Google le demande, puis copie l'URL qui finit par `/exec`.
4. **Brancher le formulaire.** Dans `index.html`, colle l'URL dans la ligne `window.FEEDBACK_ENDPOINT = "";`.
5. **Mettre en ligne.** La façon la plus simple est de glisser le dossier sur https://app.netlify.com/drop (c'est gratuit). Tu peux aussi le mettre sur ton site ou sur GitHub Pages. 
6. **Tester.** Remplis le questionnaire une fois et vérifie que la ligne apparaît dans l'onglet « Réponses ».

Si tu modifies le script plus tard, fais Déployer > Gérer les déploiements > Modifier > Nouvelle version, sinon l'ancienne version reste active.

## Suivre la provenance

Ajoute `?source=` au lien pour savoir d'où viennent les réponses. Ça remplit la colonne `source` :

* `.../?source=circle` pour le post sur le Campus
* `.../?source=courriel` pour la relance par courriel
* `.../?source=dm` pour les messages directs

## Mode test

Tant que `FEEDBACK_ENDPOINT` est vide, rien n'est envoyé. Les réponses s'affichent dans la console du navigateur. C'est pratique pour relire le parcours.

## Attribuer les récompenses

Chaque répondant qui laisse son courriel reçoit le badge « Bâtisseur du Campus » (ses questions passent en priorité) et 200 points pour le classement du prix d'octobre.

1. Dans le Google Sheet, filtre la colonne `recompense_a_attribuer` sur « Oui ». Elle ne vaut « Oui » que pour les réponses complètes, avec un courriel, envoyées avant le 25 octobre.
2. Dans Circle, retrouve le membre avec son courriel, ajoute lui le tag « Bâtisseur du Campus » et ses 200 points.
3. Ajoute une colonne `attribuee` dans le Sheet et coche la quand c'est fait, pour ne rien faire en double.

Le formulaire ne vérifie pas que le courriel correspond à un vrai compte Campus. Si l'adresse est introuvable dans Circle, écris au membre.

## Réponses partielles, date limite et compteur

* **Réponses partielles** : chaque répondant a une seule ligne, créée dès la première étape franchie. La colonne `statut` vaut « partiel » ou « complet », et `derniere_etape` indique où la personne s'est arrêtée. Filtre sur « partiel » pour voir à quelle étape les gens décrochent.
* **Date limite** : après le 25 octobre 2026 à 23 h 59, le questionnaire reste ouvert, mais toutes les mentions de la récompense disparaissent. Pour changer la date, modifie `DEADLINE` dans `index.html`.
* **Compteur** : « Déjà N membres ont répondu » s'affiche sur l'accueil à partir de 10 réponses complètes (réglable avec `COUNTER_MIN`). Il est mis à jour toutes les 5 minutes au maximum.
