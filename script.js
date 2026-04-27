// ══════════════════════════════════════════════
//  Sin backend. Los links se guardan en este
//  navegador. Siempre administra desde la
//  misma computadora y todo funciona perfecto.
// ══════════════════════════════════════════════
 
const unitInfo = {
  1: { title: 'Introducción y Fundamentos',  desc: 'Conceptos básicos, historia y tipos de bases de datos.' },
  2: { title: 'Modelado de Datos',           desc: 'Diagramas entidad-relación, normalización y esquemas.' },
  3: { title: 'SQL y Consultas',             desc: 'Lenguaje SQL, DDL, DML, subconsultas y joins.' },
  4: { title: 'Administración y Seguridad',  desc: 'Gestión de usuarios, índices, respaldo y rendimiento.' },
};
 
let currentUnit = 1;
 
// ── Cargar y guardar en localStorage ──
function loadFiles() {
  const saved = localStorage.getItem('bd2_files');
  return saved ? JSON.parse(saved) : {
    1: { 1: [], 2: [], 3: [], 4: [] },
    2: { 1: [], 2: [], 3: [], 4: [] },
    3: { 1: [], 2: [], 3: [], 4: [] },
    4: { 1: [], 2: [], 3: [], 4: [] },
  };
}
 
function saveFiles(files) {
  localStorage.setItem('bd2_files', JSON.stringify(files));
}
 
// ── Navegación ──
function goTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  window.scrollTo(0, 0);
}
 
function goToUnit(num) {
  currentUnit = num;
  document.getElementById('unit-num').textContent  = num;
  document.getElementById('unit-desc').textContent = unitInfo[num].desc;
  renderWeeks(num);
  goTo('unit');
}
 
function scrollToSection(id) {
  goTo('home');
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, 100);
}
 
// ── Modal Login ──
function showLoginModal() {
  document.getElementById('login-modal').style.display = 'flex';
  document.getElementById('modal-user').focus();
}
 
function hideLoginModal() {
  document.getElementById('login-modal').style.display = 'none';
  document.getElementById('modal-user').value        = '';
  document.getElementById('modal-pass').value        = '';
  document.getElementById('modal-err').style.display = 'none';
}
 
function doLoginModal() {
  const u = document.getElementById('modal-user').value.trim();
  const p = document.getElementById('modal-pass').value.trim();
  if (u === 'admin' && p === 'admin') {
    hideLoginModal();
    selectAdminUnit(1, document.querySelector('.admin-unit-tab'));
    goTo('admin');
  } else {
    document.getElementById('modal-err').style.display = 'block';
  }
}
 
function doLogout() { goTo('home'); }
 
// ── Vista pública ──
function renderWeeks(unit) {
  const files = loadFiles();
  const c = document.getElementById('weeks-container');
  c.innerHTML = '';
 
  for (let w = 1; w <= 4; w++) {
    const fs = files[unit][w] || [];
 
    let fileHTML = fs.length
      ? fs.map(f => `
          <a href="${f.url}" target="_blank" rel="noopener" class="file-item downloadable">
            <span class="file-icon">📄</span>
            <span class="file-name">${f.name}</span>
            <span class="download-icon">↓</span>
          </a>`).join('')
      : `<div class="empty-state">
           <div class="empty-icon">📂</div>
           <p class="empty-text">Aún no hay archivos en esta semana</p>
           <p class="empty-subtext">El docente subirá el material pronto</p>
         </div>`;
 
    c.innerHTML += `
      <div class="week-card">
        <div class="week-num">0${w}</div>
        <h3>Semana ${w}</h3>
        <p>${unitInfo[unit].title}</p>
        <div class="week-files">${fileHTML}</div>
      </div>`;
  }
}
 
// ── Admin: seleccionar unidad ──
function selectAdminUnit(num, btn) {
  document.querySelectorAll('.admin-unit-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderAdminWeeks(num);
}
 
// ── Admin: renderizar semanas ──
function renderAdminWeeks(unit) {
  const c = document.getElementById('admin-weeks-container');
  c.innerHTML = '';
 
  for (let w = 1; w <= 4; w++) {
    c.innerHTML += `
      <div class="admin-week-card">
        <h4>Semana ${w} <span>U${unit}</span></h4>
 
        <div class="link-form">
          <input
            type="text"
            id="name-${unit}-${w}"
            placeholder="Nombre (ej: Clase 1 - Introducción.pdf)"
            class="link-input"
          />
          <input
            type="url"
            id="url-${unit}-${w}"
            placeholder="Pega aquí el link de Google Drive"
            class="link-input"
          />
          <button class="btn-add-link" onclick="addLink(${unit}, ${w})">+ Agregar</button>
        </div>
 
        <div class="uploaded-list" id="list-${unit}-${w}"></div>
      </div>`;
  }
 
  for (let w = 1; w <= 4; w++) refreshList(unit, w);
}
 
// ── Agregar link ──
function addLink(unit, week) {
  const nameEl = document.getElementById(`name-${unit}-${week}`);
  const urlEl  = document.getElementById(`url-${unit}-${week}`);
  const name   = nameEl.value.trim();
  let   url    = urlEl.value.trim();
 
  if (!name || !url) {
    alert('Completa el nombre y el link antes de agregar.');
    return;
  }
 
  // Convierte link de Google Drive a link directo de visualización
  url = convertDriveLink(url);
 
  const files = loadFiles();
  if (!files[unit][week]) files[unit][week] = [];
  files[unit][week].push({ name, url });
  saveFiles(files);
 
  nameEl.value = '';
  urlEl.value  = '';
  refreshList(unit, week);
}
 
// Convierte cualquier link de Google Drive a link de vista directa
function convertDriveLink(url) {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return `https://drive.google.com/file/d/${match[1]}/view`;
  }
  return url; // si no es Drive, lo deja igual
}
 
// ── Refrescar lista admin ──
function refreshList(unit, week) {
  const el = document.getElementById(`list-${unit}-${week}`);
  if (!el) return;
  const files = loadFiles();
  const fs = files[unit][week] || [];
  el.innerHTML = fs.length
    ? fs.map((f, i) => `
        <div class="uploaded-item">
          <span style="color:var(--accent);">📄</span>
          <span class="fname">${f.name}</span>
          <button class="del-btn" onclick="deleteFile(${unit},${week},${i})">✕</button>
        </div>`).join('')
    : '';
}
 
// ── Eliminar ──
function deleteFile(unit, week, idx) {
  if (!confirm('¿Eliminar este archivo?')) return;
  const files = loadFiles();
  files[unit][week].splice(idx, 1);
  saveFiles(files);
  refreshList(unit, week);
}
 
// ── Contacto ──
function sendContact() {
  alert('¡Mensaje enviado! Nos pondremos en contacto pronto.');
}
 
// ── Init ──
window.onload = () => {
  selectAdminUnit(1, null);
};
