/* ═══════════════════════════════════════════════════════════════════════
   HOME.JS — Logica specifica della pagina index.html (Home / Recap)
   ═══════════════════════════════════════════════════════════════════════ */

function renderMigrationBanner(result) {
  const el = document.getElementById('migrationBanner');
  if (!result || !result.imported) { el.innerHTML = ''; return; }
  el.innerHTML = `<div class="alert-banner info">
    <div class="alert-icon">${ICON_INFO}</div>
    <div class="alert-content">
      <div class="alert-title">Dati precedenti importati</div>
      <div class="alert-message">${result.imported} spese del vecchio tracker sono state importate automaticamente e collegate a 3 abitazioni create per te (Casa Piano Terra, Casa Piano Primo, Parti Comuni). Puoi modificarle in "Ditte &amp; Abitazioni".</div>
    </div>
  </div>`;
}

function renderSummary() {
  const spese = getSpese();
  const abitazioni = getAbitazioni();
  const totals = calcTotals(spese);

  let html = abitazioni.map(a => {
    const t = totals.perAbitazione[a.id] || { importo: 0, voci: 0 };
    const color = colorForId(a.id, abitazioni);
    return `<div class="s-card" style="--card-color:${color}">
      <div class="s-label">${esc(a.nome)}</div>
      <div class="s-value">${fmt(t.importo)}</div>
      <div class="s-sub">${t.voci} voci</div>
    </div>`;
  }).join('');

  const pctPagato = totals.totale > 0 ? Math.round(totals.totalePagato / totals.totale * 100) : 0;
  html += `<div class="s-card total"><div class="s-label">Totale complessivo</div><div class="s-value">${fmt(totals.totale)}</div><div class="s-sub">${pctPagato}% pagato · ${fmt(totals.totalePagato)}</div></div>`;

  document.getElementById('summaryRow').innerHTML = html || '<div style="color:var(--text-faint);font-size:13px">Nessuna abitazione registrata ancora. Vai su "Ditte &amp; Abitazioni" per aggiungerne una.</div>';

  const alerts = checkAlerts(spese);
  document.getElementById('alertContainer').innerHTML = alerts.length
    ? alerts.map(a => `<div class="alert-banner"><div class="alert-icon">${ICON_WARNING}</div><div class="alert-content"><div class="alert-title">${esc(a.title)}</div><div class="alert-message">${esc(a.message)}</div></div></div>`).join('')
    : '';

  const BAR_COLORS = ['#2D5A3D', '#1A3A6E', '#7A4A1E', '#7A7060', '#4A5568'];
  const catData = calcByCategory(spese);
  const cats = Object.entries(catData).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.importo - a.importo).slice(0, 6);
  const maxImp = cats.length ? cats[0].importo : 1;
  const forn = calcTopDitte(spese);
  const maxForn = forn.length ? forn[0].total : 1;

  document.getElementById('insightContainer').innerHTML = `
    <div class="insight-grid-2">
      <div class="insight-section">
        <div class="insight-title"><span style="vertical-align:-2px;display:inline-block;margin-right:4px">${ICON_CHART}</span>Spese per categoria</div>
        ${cats.length ? cats.map((c, i) => {
          const barPct = Math.round(c.importo / maxImp * 100);
          const totPct = totals.totale > 0 ? Math.round(c.importo / totals.totale * 100) : 0;
          const color = BAR_COLORS[i % BAR_COLORS.length];
          return `<div class="insight-item"><div class="insight-item-header"><div class="insight-label">${i + 1}. ${esc(c.name)}</div><div class="insight-meta"><span class="insight-pct">${totPct}%</span><span class="insight-value">${fmt(c.importo)}</span></div></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:${barPct}%;background:${color}"></div></div></div>`;
        }).join('') : '<div style="color:var(--text-faint);font-size:13px;padding:0.5rem 0">Nessuna voce inserita.</div>'}
      </div>
      <div class="insight-section">
        <div class="insight-title"><span style="vertical-align:-2px;display:inline-block;margin-right:4px">${ICON_BUILDING}</span>Top ditte per importo</div>
        ${forn.length ? forn.map((f, i) => {
          const barPct = Math.round(f.total / maxForn * 100);
          return `<div class="insight-item"><div class="insight-item-header"><div class="insight-label">${i + 1}. ${esc(f.name)}</div><div class="insight-meta"><span class="insight-value">${fmt(f.total)}</span></div></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:${barPct}%;background:#1A3A6E"></div></div></div>`;
        }).join('') : '<div style="color:var(--text-faint);font-size:13px;padding:0.5rem 0">Nessuna ditta assegnata.</div>'}
      </div>
    </div>`;
}

document.addEventListener('DOMContentLoaded', () => {
  const migResult = runMigrationIfNeeded();
  renderMigrationBanner(migResult);
  renderSummary();

  document.getElementById('importFile').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    importBackupJSON(file, (err, info) => {
      if (err) { showToast('File non valido'); return; }
      showToast(`Backup importato: +${info.added} spese`);
      renderSummary();
    });
    e.target.value = '';
  });
});
