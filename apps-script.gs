/**
 * La Fusée : réception des réponses du questionnaire de feedback.
 * À coller dans Extensions > Apps Script d'un Google Sheet.
 *
 * Chaque répondant a une seule ligne dans l'onglet « Réponses ».
 * Elle est créée dès la première étape franchie (statut « partiel »),
 * puis mise à jour jusqu'à l'envoi final (statut « complet »).
 */
const ONGLET = 'Réponses';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents);
    const sh = onglet_();

    // En-têtes : on ajoute les nouvelles colonnes au besoin, sans jamais réordonner
    const entetes = sh.getLastColumn()
      ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].filter(String)
      : [];
    ['recu_le', 'maj_le'].concat(Object.keys(data)).forEach(function (k) {
      if (entetes.indexOf(k) === -1) entetes.push(k);
    });
    sh.getRange(1, 1, 1, entetes.length).setValues([entetes]).setFontWeight('bold');
    sh.setFrozenRows(1);

    // Ligne existante pour ce répondant ?
    const colId = entetes.indexOf('id') + 1;
    let rang = 0;
    if (data.id && sh.getLastRow() > 1) {
      const trouve = sh.getRange(2, colId, sh.getLastRow() - 1, 1)
        .createTextFinder(String(data.id)).matchEntireCell(true).findNext();
      if (trouve) rang = trouve.getRow();
    }

    let existante = null;
    if (rang) {
      existante = sh.getRange(rang, 1, 1, entetes.length).getValues()[0];
      // Une réponse partielle arrivée en retard n'écrase jamais une réponse complète
      if (existante[entetes.indexOf('statut')] === 'complet' && data.statut !== 'complet') {
        return ok_();
      }
    }

    const maintenant = new Date();
    const ligne = entetes.map(function (k, i) {
      if (k === 'recu_le') return existante && existante[i] ? existante[i] : maintenant;
      if (k === 'maj_le') return maintenant;
      if (!(k in data)) return existante ? existante[i] : '';
      const v = data[k] == null ? '' : String(data[k]);
      return /^[=+\-@]/.test(v) ? "'" + v : v; // évite l'injection de formules
    });

    if (rang) sh.getRange(rang, 1, 1, ligne.length).setValues([ligne]);
    else sh.appendRow(ligne);

    CacheService.getScriptCache().remove('complets');
    return ok_();
  } finally {
    lock.releaseLock();
  }
}

/** Compteur affiché sur l'accueil : ?action=compte renvoie le nombre de réponses complètes. */
function doGet(e) {
  if (!e || !e.parameter || e.parameter.action !== 'compte') return ok_();
  const cache = CacheService.getScriptCache();
  let n = cache.get('complets');
  if (n === null) {
    const sh = onglet_();
    const entetes = sh.getLastColumn() ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] : [];
    const col = entetes.indexOf('statut') + 1;
    n = 0;
    if (col && sh.getLastRow() > 1) {
      n = sh.getRange(2, col, sh.getLastRow() - 1, 1).getValues()
        .filter(function (r) { return r[0] === 'complet'; }).length;
    }
    cache.put('complets', String(n), 300);
  }
  return ContentService.createTextOutput(JSON.stringify({ complets: Number(n) }))
    .setMimeType(ContentService.MimeType.JSON);
}

function onglet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(ONGLET) || ss.insertSheet(ONGLET);
}

function ok_() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
