/* ═══════════════════════════════════════════════════════════════════════
   ANAGRAFICHE.JS — Logica specifica della pagina anagrafiche.html
   ═══════════════════════════════════════════════════════════════════════ */

let editDittaId = null;
let editAbitId = null;
let editCatId = null;

function switchTab(tab) {
  document.getElementById('panelDitte').style.display = tab === 'ditte' ? 'block' : 'none';
  document.getElementById('panelAbitazioni').style.display = tab === 'abitazioni' ? 'block' : 'none';
  document.getElementById('panelCategorie').style.display = tab === 'categorie' ? 'block' : 'none';
  document.getElementById('tabBtnDitte').classList.toggle('active', tab === 'ditte');
  document.getElementById('tabBtnAbit').classList.toggle('active', tab === 'abitazioni');
  document.getElementById('tabBtnCat').classList.toggle('active', tab === 'categorie');
}

/* ── DITTE ── */
function renderDitte() {
  const ditte = getDitte();
  const spese = getSpese();
  document.getElementById('ditteCount').textContent = `${ditte.length} ditt${ditte.length===1?'a':'e'} registrat${ditte.length===1?'a':'e'}`;
  const grid = document.getElementById('ditteGrid');
  const empty = document.getElementById('ditteEmpty');
  if (!ditte.length) { grid.innerHTML=''; empty.style.display='block'; return; }
  empty.style.display='none';
  grid.innerHTML = ditte.map(d => {
    const voci = spese.filter(s => s.ditta === d.nome).length;
    const speso = spese.filter(s => s.ditta === d.nome).reduce((a,s)=>a+(s.importo||0),0);
    return `<div class="reg-card">
      <div class="reg-card-actions">
        <button class="icon-btn edit" onclick="openDittaModal('${d.id}')" title="Modifica">${ICON_EDIT}</button>
        <button class="icon-btn del" onclick="removeDitta('${d.id}')" title="Elimina">${ICON_DELETE}</button>
      </div>
      <div class="reg-card-title">${esc(d.nome)}</div>
      <div class="reg-card-sub">${d.piva?('P.IVA '+esc(d.piva)):''}${d.referente?(' · '+esc(d.referente)):''}</div>
      <div class="reg-card-meta">
        ${d.telefono?('<span class="meta-icon">'+ICON_PHONE+'</span> '+esc(d.telefono)+'<br>'):''}
        ${d.email?('<span class="meta-icon">'+ICON_MAIL+'</span> '+esc(d.email)+'<br>'):''}
        ${voci} spese collegate · ${fmt(speso)}
      </div>
    </div>`;
  }).join('');
}

function openDittaModal(id) {
  editDittaId = id || null;
  document.getElementById('dittaModalTitle').textContent = id ? 'Modifica ditta' : 'Nuova ditta';
  const fields = ['d-nome','d-piva','d-referente','d-telefono','d-email','d-note'];
  if (id) {
    const d = getDitte().find(x=>x.id===id);
    document.getElementById('d-nome').value = d.nome||'';
    document.getElementById('d-piva').value = d.piva||'';
    document.getElementById('d-referente').value = d.referente||'';
    document.getElementById('d-telefono').value = d.telefono||'';
    document.getElementById('d-email').value = d.email||'';
    document.getElementById('d-note').value = d.note||'';
  } else {
    fields.forEach(f=>document.getElementById(f).value='');
  }
  document.getElementById('dittaModalOverlay').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeDittaModal() {
  document.getElementById('dittaModalOverlay').classList.remove('open');
  document.body.style.overflow='';
}
function saveDittaForm() {
  const nome = document.getElementById('d-nome').value.trim();
  if (!nome) { alert('Inserisci la ragione sociale.'); return; }
  const entry = {
    id: editDittaId || generateId(),
    nome,
    piva: document.getElementById('d-piva').value.trim(),
    referente: document.getElementById('d-referente').value.trim(),
    telefono: document.getElementById('d-telefono').value.trim(),
    email: document.getElementById('d-email').value.trim(),
    note: document.getElementById('d-note').value.trim()
  };
  upsertDitta(entry);
  closeDittaModal(); renderDitte();
  showToast(editDittaId ? 'Ditta aggiornata' : 'Ditta aggiunta');
}
function removeDitta(id) {
  const spese = getSpese();
  const d = getDitte().find(x=>x.id===id);
  const usata = d && spese.some(s=>s.ditta===d.nome);
  const msg = usata ? 'Questa ditta è collegata a delle spese esistenti. Eliminarla comunque? Le spese manterranno il nome ma non saranno più collegate all\u2019anagrafica.' : 'Eliminare questa ditta?';
  if (!confirm(msg)) return;
  deleteDitta(id); renderDitte();
  showToast('Ditta eliminata');
}

/* ── ABITAZIONI ── */
function renderAbitazioni() {
  const abit = getAbitazioni();
  const spese = getSpese();
  document.getElementById('abitCount').textContent = `${abit.length} abitazion${abit.length===1?'e':'i'} registrat${abit.length===1?'a':'e'}`;
  const grid = document.getElementById('abitGrid');
  const empty = document.getElementById('abitEmpty');
  if (!abit.length) { grid.innerHTML=''; empty.style.display='block'; return; }
  empty.style.display='none';
  grid.innerHTML = abit.map(a => {
    const voci = spese.filter(s=>s.abitazioneId===a.id);
    const totale = voci.reduce((sum,s)=>sum+(s.importo||0),0);
    const catasto = [a.foglio&&`Fg. ${a.foglio}`, a.particella&&`Part. ${a.particella}`, a.subalterno&&`Sub. ${a.subalterno}`].filter(Boolean).join(' · ');
    return `<div class="reg-card">
      <div class="reg-card-actions">
        <button class="icon-btn edit" onclick="openAbitModal('${a.id}')" title="Modifica">${ICON_EDIT}</button>
        <button class="icon-btn del" onclick="removeAbitazione('${a.id}')" title="Elimina">${ICON_DELETE}</button>
      </div>
      <div class="reg-card-title">${esc(a.nome)}</div>
      <div class="reg-card-sub">${a.indirizzo?esc(a.indirizzo):'Nessun indirizzo indicato'}</div>
      <div class="reg-card-meta">
        ${catasto?(catasto+'<br>'):''}
        ${voci.length} spese collegate · ${fmt(totale)}
      </div>
    </div>`;
  }).join('');
}

function openAbitModal(id) {
  editAbitId = id || null;
  document.getElementById('abitModalTitle').textContent = id ? 'Modifica abitazione' : 'Nuova abitazione';
  const fields = ['a-nome','a-indirizzo','a-foglio','a-particella','a-subalterno','a-note'];
  if (id) {
    const a = getAbitazioni().find(x=>x.id===id);
    document.getElementById('a-nome').value = a.nome||'';
    document.getElementById('a-indirizzo').value = a.indirizzo||'';
    document.getElementById('a-foglio').value = a.foglio||'';
    document.getElementById('a-particella').value = a.particella||'';
    document.getElementById('a-subalterno').value = a.subalterno||'';
    document.getElementById('a-note').value = a.note||'';
  } else {
    fields.forEach(f=>document.getElementById(f).value='');
  }
  document.getElementById('abitModalOverlay').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeAbitModal() {
  document.getElementById('abitModalOverlay').classList.remove('open');
  document.body.style.overflow='';
}
function saveAbitForm() {
  const nome = document.getElementById('a-nome').value.trim();
  if (!nome) { alert('Inserisci un nome/etichetta per l\u2019abitazione.'); return; }
  const entry = {
    id: editAbitId || generateId(),
    nome,
    indirizzo: document.getElementById('a-indirizzo').value.trim(),
    foglio: document.getElementById('a-foglio').value.trim(),
    particella: document.getElementById('a-particella').value.trim(),
    subalterno: document.getElementById('a-subalterno').value.trim(),
    note: document.getElementById('a-note').value.trim()
  };
  upsertAbitazione(entry);
  closeAbitModal(); renderAbitazioni();
  showToast(editAbitId ? 'Abitazione aggiornata' : 'Abitazione aggiunta');
}
function removeAbitazione(id) {
  const spese = getSpese();
  const usata = spese.some(s=>s.abitazioneId===id);
  const msg = usata ? 'Questa abitazione è collegata a delle spese esistenti. Eliminarla comunque? Le spese resteranno ma senza abitazione collegata.' : 'Eliminare questa abitazione?';
  if (!confirm(msg)) return;
  deleteAbitazione(id); renderAbitazioni();
  showToast('Abitazione eliminata');
}

/* ── CATEGORIE ── */
function renderCategorie() {
  const categorie = getCategorie();
  const spese = getSpese();
  const catData = calcByCategory(spese);
  document.getElementById('catCount').textContent = `${categorie.length} categori${categorie.length===1?'a':'e'} registrat${categorie.length===1?'a':'e'}`;
  const grid = document.getElementById('catGrid');
  const empty = document.getElementById('catEmpty');
  if (!categorie.length) { grid.innerHTML=''; empty.style.display='block'; return; }
  empty.style.display='none';
  grid.innerHTML = categorie.map(c => {
    const d = catData[c.nome] || { importo: 0, voci: 0 };
    return `<div class="reg-card">
      <div class="reg-card-actions">
        <button class="icon-btn edit" onclick="openCatModal('${c.id}')" title="Modifica">${ICON_EDIT}</button>
        <button class="icon-btn del" onclick="removeCategoria('${c.id}')" title="Elimina">${ICON_DELETE}</button>
      </div>
      <div class="reg-card-title">${esc(c.nome)}</div>
      <div class="reg-card-meta">${d.voci} spese collegate · ${fmt(d.importo)}</div>
    </div>`;
  }).join('');
}

function openCatModal(id) {
  editCatId = id || null;
  document.getElementById('catModalTitle').textContent = id ? 'Modifica categoria' : 'Nuova categoria';
  document.getElementById('c-nome').value = id ? (getCategorie().find(x=>x.id===id)?.nome || '') : '';
  document.getElementById('catModalOverlay').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeCatModal() {
  document.getElementById('catModalOverlay').classList.remove('open');
  document.body.style.overflow='';
}
function saveCatForm() {
  const nome = document.getElementById('c-nome').value.trim();
  if (!nome) { alert('Inserisci il nome della categoria.'); return; }
  const dup = getCategorie().some(c => c.nome.toLowerCase() === nome.toLowerCase() && c.id !== editCatId);
  if (dup) { alert('Esiste già una categoria con questo nome.'); return; }
  upsertCategoria({ id: editCatId || generateId(), nome });
  closeCatModal(); renderCategorie();
  showToast(editCatId ? 'Categoria aggiornata' : 'Categoria aggiunta');
}
function removeCategoria(id) {
  const spese = getSpese();
  const c = getCategorie().find(x=>x.id===id);
  const usata = c && spese.some(s=>s.categoria?.main===c.nome);
  const msg = usata ? 'Questa categoria è usata in alcune spese. Eliminarla comunque? Le spese manterranno il nome della categoria ma non sarà più selezionabile per le nuove voci.' : 'Eliminare questa categoria?';
  if (!confirm(msg)) return;
  deleteCategoria(id); renderCategorie();
  showToast('Categoria eliminata');
}

document.addEventListener('DOMContentLoaded', () => {
  runMigrationIfNeeded();
  renderDitte();
  renderAbitazioni();
  renderCategorie();
});
