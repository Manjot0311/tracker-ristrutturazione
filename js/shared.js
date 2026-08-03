/* ═══════════════════════════════════════════════════════════════════════
   SHARED.JS — Layer dati e funzioni comuni per index / spese / anagrafiche
   Storage: localStorage (condiviso tra le pagine, stessa origine)
   ═══════════════════════════════════════════════════════════════════════ */

const OLD_KEY        = 'tracker_ristrutturazione_v3'; // vecchio tracker a pagina unica
const KEY_DITTE      = 'trk_ditte_v1';
const KEY_ABITAZIONI = 'trk_abitazioni_v1';
const KEY_CATEGORIE  = 'trk_categorie_v1';
const KEY_SPESE      = 'trk_spese_v4';
const KEY_MIGRATED   = 'trk_migrated_v1';

const UNIT_LABELS = { pt: 'Casa Piano Terra', p1: 'Casa Piano Primo', com: 'Parti Comuni' };
const CARD_COLORS = ['#2D5A3D','#1A3A6E','#7A4A1E','#6B3FA0','#A0522D','#2E7A6E','#8B3A5A','#4A5568'];
const DEFAULT_CATEGORIE = [
  'Permessi','Demolizioni','Struttura / muratura','Impianto elettrico','Impianto idraulico',
  'Impianto riscaldamento','Infissi / serramenti','Pavimenti / rivestimenti','Intonaci / pitture',
  'Cucina / bagno','Arredi','Altro'
];

function colorForId(id, list) {
  const idx = Math.max(0, list.findIndex(x => x.id === id));
  return CARD_COLORS[idx % CARD_COLORS.length];
}

/* ── Icone SVG minimali (nessuna emoji) ──────────────────────────────────
   Tutte disegnate su viewBox 0 0 24 24, tratto sottile, currentColor. */
const ICON_EDIT     = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3.5a2.1 2.1 0 0 1 3 3L8 18.5 3.5 20 5 15.5 17 3.5Z"/></svg>`;
const ICON_DELETE   = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m3 0-.8 12.1a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9L6 7"/><path d="M10 11v6M14 11v6"/></svg>`;
const ICON_WARNING  = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5 21.5 20h-19L12 3.5Z"/><path d="M12 9.5v4.2"/><circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none"/></svg>`;
const ICON_INFO     = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.6" r="0.9" fill="currentColor" stroke="none"/></svg>`;
const ICON_BACKUP   = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 15v3.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V15"/></svg>`;
const ICON_CHART    = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M12 20V4M20 20v-7"/></svg>`;
const ICON_BUILDING = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="11" height="18" rx="1"/><path d="M9 3v18M7 7h1M7 11h1M7 15h1M11 7h1M11 11h1M11 15h1"/><path d="M15 10h4a1 1 0 0 1 1 1v10h-5"/></svg>`;
const ICON_HOME     = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.5V19a1 1 0 0 0 1 1H10v-5a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v5h3.5a1 1 0 0 0 1-1V9.5"/></svg>`;
const ICON_PHONE    = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 4.5 4.6 1.5 1.5 0 0 1 6 3Z"/></svg>`;
const ICON_MAIL     = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5.5" width="17" height="13" rx="1.5"/><path d="m4.5 7 7.5 6 7.5-6"/></svg>`;
const ICON_SEARCH   = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.5-4.5"/></svg>`;
const ICON_CHEVRON  = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 9.5 5 5 5-5"/></svg>`;
const ICON_TAG      = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 3h6a2 2 0 0 1 2 2v6l-9.5 9.5a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L11 3Z"/><circle cx="15" cy="8" r="1.4" fill="currentColor" stroke="none"/></svg>`;
const ICON_CLOSE    = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6 6 18"/></svg>`;
const ICON_UPLOAD    = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3m0 0 4 4m-4-4-4 4"/><path d="M4 15v3.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V15"/></svg>`;

/* ── Generic storage helpers ─────────────────────────────────────────── */
function loadArr(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch (e) { return []; }
}
function saveArr(key, arr) { localStorage.setItem(key, JSON.stringify(arr)); }
function generateId() {
  return (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/* ── Migrazione automatica dal vecchio tracker (v3, unità fisse pt/p1/com) ──
   Alla prima apertura di una qualsiasi delle pagine, se troviamo i vecchi
   dati e non abbiamo ancora migrato, creiamo 3 abitazioni corrispondenti alle
   vecchie unità e agganciamo ogni spesa alla relativa abitazione. */
function runMigrationIfNeeded() {
  if (localStorage.getItem(KEY_MIGRATED)) return null;
  let old = [];
  try { old = JSON.parse(localStorage.getItem(OLD_KEY)) || []; } catch (e) { old = []; }

  if (!old.length) { localStorage.setItem(KEY_MIGRATED, '1'); return null; }

  const abitazioni = loadArr(KEY_ABITAZIONI);
  const unitMap = {};
  ['pt', 'p1', 'com'].forEach(u => {
    let existing = abitazioni.find(a => a._legacyUnit === u);
    if (!existing) {
      existing = { id: generateId(), nome: UNIT_LABELS[u], indirizzo: '', foglio: '', particella: '', subalterno: '', note: '', _legacyUnit: u };
      abitazioni.push(existing);
    }
    unitMap[u] = existing.id;
  });
  saveArr(KEY_ABITAZIONI, abitazioni);

  const spese = loadArr(KEY_SPESE);
  const existingIds = new Set(spese.map(s => s.id));
  let imported = 0;
  old.forEach(d => {
    if (existingIds.has(d.id)) return;
    spese.push({
      id: d.id || generateId(),
      data: d.data || '',
      desc: d.desc || '',
      categoria: d.categoria || { main: '', sub: '' },
      abitazioneId: unitMap[d.unita] || '',
      ditta: d.fornitore || '',
      importo: d.importo || 0,
      importoPagato: d.importoPagato || 0,
      dataPagamento: d.dataPagamento || '',
      note: d.note || ''
    });
    imported++;
  });
  saveArr(KEY_SPESE, spese);
  localStorage.setItem(KEY_MIGRATED, '1');
  return { imported, totalOld: old.length };
}

/* ── Ditte ────────────────────────────────────────────────────────────── */
function getDitte() { return loadArr(KEY_DITTE); }
function saveDitte(arr) { saveArr(KEY_DITTE, arr); }
function upsertDitta(entry) {
  const arr = getDitte();
  const i = arr.findIndex(x => x.id === entry.id);
  if (i >= 0) arr[i] = entry; else arr.push(entry);
  saveDitte(arr);
}
function deleteDitta(id) { saveDitte(getDitte().filter(x => x.id !== id)); }

/* ── Abitazioni ───────────────────────────────────────────────────────── */
function getAbitazioni() { return loadArr(KEY_ABITAZIONI); }
function saveAbitazioni(arr) { saveArr(KEY_ABITAZIONI, arr); }
function upsertAbitazione(entry) {
  const arr = getAbitazioni();
  const i = arr.findIndex(x => x.id === entry.id);
  if (i >= 0) arr[i] = entry; else arr.push(entry);
  saveAbitazioni(arr);
}
function deleteAbitazione(id) { saveAbitazioni(getAbitazioni().filter(x => x.id !== id)); }
function abitazioneLabel(id) {
  const a = getAbitazioni().find(x => x.id === id);
  return a ? a.nome : '—';
}

/* ── Categorie ────────────────────────────────────────────────────────── *
   Salvate come { id, nome }. Le spese continuano a referenziare la categoria
   per NOME (come già avviene per la ditta), così restano intatte anche se
   la categoria viene poi rinominata o rimossa dall'anagrafica. */
function getCategorie() {
  if (localStorage.getItem(KEY_CATEGORIE) === null) {
    saveArr(KEY_CATEGORIE, DEFAULT_CATEGORIE.map(nome => ({ id: generateId(), nome })));
  }
  return loadArr(KEY_CATEGORIE);
}
function saveCategorie(arr) { saveArr(KEY_CATEGORIE, arr); }
function upsertCategoria(entry) {
  const arr = getCategorie();
  const i = arr.findIndex(x => x.id === entry.id);
  if (i >= 0) arr[i] = entry; else arr.push(entry);
  saveCategorie(arr);
}
function deleteCategoria(id) { saveCategorie(getCategorie().filter(x => x.id !== id)); }

/* ── Spese ────────────────────────────────────────────────────────────── */
function getSpese() { return loadArr(KEY_SPESE); }
function saveSpese(arr) { saveArr(KEY_SPESE, arr); }
function upsertSpesa(entry) {
  const arr = getSpese();
  const i = arr.findIndex(x => x.id === entry.id);
  if (i >= 0) arr[i] = entry; else arr.push(entry);
  saveSpese(arr);
}
function deleteSpesa(id) { saveSpese(getSpese().filter(x => x.id !== id)); }

/* ── Calcoli condivisi ────────────────────────────────────────────────── */
function calcStato(importo, pagato) {
  if (!importo || importo <= 0) return 'previsto';
  if (!pagato || pagato <= 0) return 'previsto';
  if (pagato >= importo) return 'pagato';
  return 'confermato';
}

function calcTotals(spese) {
  const r = { previsto: 0, confermato: 0, pagato: 0, totale: 0, totalePagato: 0, perAbitazione: {} };
  spese.forEach(d => {
    const imp = d.importo || 0, pag = d.importoPagato || 0;
    r.totale += imp; r.totalePagato += pag;
    if (!r.perAbitazione[d.abitazioneId]) r.perAbitazione[d.abitazioneId] = { importo: 0, pagato: 0, voci: 0 };
    r.perAbitazione[d.abitazioneId].importo += imp;
    r.perAbitazione[d.abitazioneId].pagato += pag;
    r.perAbitazione[d.abitazioneId].voci++;
    const s = calcStato(imp, pag);
    if (s === 'previsto') r.previsto += imp; else if (s === 'confermato') r.confermato += imp; else r.pagato += imp;
  });
  return r;
}

function calcByCategory(spese) {
  const r = {};
  spese.forEach(d => {
    const k = d.categoria?.main || 'Altro';
    if (!r[k]) r[k] = { importo: 0, pagato: 0, voci: 0 };
    r[k].importo += d.importo || 0; r[k].pagato += d.importoPagato || 0; r[k].voci++;
  });
  return r;
}

function calcTopDitte(spese) {
  const s = {};
  spese.forEach(d => { if (!d.ditta) return; s[d.ditta] = (s[d.ditta] || 0) + (d.importo || 0); });
  return Object.entries(s).map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total).slice(0, 5);
}

function checkAlerts(spese) {
  const al = [];
  const noD = spese.filter(d => !d.ditta);
  if (noD.length) al.push({ title: 'Spese senza ditta', message: `${noD.length} voce${noD.length > 1 ? 'i' : ''} senza ditta assegnata.` });
  const noA = spese.filter(d => !d.abitazioneId);
  if (noA.length) al.push({ title: 'Spese senza abitazione', message: `${noA.length} voce${noA.length > 1 ? 'i' : ''} non collegata/e a un\u2019abitazione.` });
  const thr = new Date(); thr.setMonth(thr.getMonth() - 3);
  const old = spese.filter(d => calcStato(d.importo, d.importoPagato) === 'previsto' && d.data && new Date(d.data) < thr);
  if (old.length) al.push({ title: 'Spese previste non aggiornate', message: `${old.length} voce${old.length > 1 ? 'i' : ''} rimane "Previsto" da oltre 3 mesi.` });
  return al;
}

/* ── Formattatori ─────────────────────────────────────────────────────── */
function fmt(n) { return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0); }
function fmtE(n) { return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0); }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

/* ── UI comune: toast, dropdown, nav attiva ──────────────────────────── */
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._hideTimer);
  t._hideTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

function toggleDropdown(id) {
  const el = document.getElementById(id);
  const wasOpen = el.classList.contains('open');
  document.querySelectorAll('.custom-select.open').forEach(e => e.classList.remove('open'));
  if (!wasOpen) el.classList.add('open');
}
document.addEventListener('click', e => {
  if (!e.target.closest('.custom-select')) {
    document.querySelectorAll('.custom-select.open').forEach(el => el.classList.remove('open'));
  }
});

/* Confronta solo il nome file finale (basename) sia del path corrente sia
   di ogni href del menu, così funziona indipendentemente dal fatto che la
   pagina sia in root (index.html) o in /pages/ (es. ../index.html, spese.html). */
function markActiveNav() {
  const currentFile = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.topnav a').forEach(a => {
    const hrefFile = (a.getAttribute('href') || '').split('/').pop();
    a.classList.toggle('active', hrefFile === currentFile);
  });
}

/* ── Backup JSON (export / import manuale) ───────────────────────────── */
function exportBackupJSON() {
  const payload = {
    exportedAt: new Date().toISOString(),
    ditte: getDitte(),
    abitazioni: getAbitazioni(),
    spese: getSpese()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `backup_ristrutturazione_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  showToast('Backup esportato');
}

function importBackupJSON(file, onDone) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(reader.result);
      const ditte = Array.isArray(payload.ditte) ? payload.ditte : [];
      const abitazioni = Array.isArray(payload.abitazioni) ? payload.abitazioni : [];
      const spese = Array.isArray(payload.spese) ? payload.spese : [];

      const dArr = getDitte(); const dIds = new Set(dArr.map(x => x.id));
      ditte.forEach(x => { if (!dIds.has(x.id)) dArr.push(x); }); saveDitte(dArr);

      const aArr = getAbitazioni(); const aIds = new Set(aArr.map(x => x.id));
      abitazioni.forEach(x => { if (!aIds.has(x.id)) aArr.push(x); }); saveAbitazioni(aArr);

      const sArr = getSpese(); const sIds = new Set(sArr.map(x => x.id));
      let added = 0;
      spese.forEach(x => { if (!sIds.has(x.id)) { sArr.push(x); added++; } }); saveSpese(sArr);

      onDone(null, { added, ditte: ditte.length, abitazioni: abitazioni.length });
    } catch (e) {
      onDone(e);
    }
  };
  reader.readAsText(file);
}

document.addEventListener('DOMContentLoaded', markActiveNav);
