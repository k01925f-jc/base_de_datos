// ── Estado global ──

const unitInfo = {
  1: { title: 'Introducción y Fundamentos', desc: 'Conceptos básicos, historia y tipos de bases de datos.' },
  2: { title: 'Modelado de Datos', desc: 'Diagramas entidad-relación, normalización y esquemas.' },
  3: { title: 'SQL y Consultas', desc: 'Lenguaje SQL, DDL, DML, subconsultas y joins.' },
  4: { title: 'Administración y Seguridad', desc: 'Gestión de usuarios, índices, respaldo y rendimiento.' },
};

// files[unit][week] = [{ name, url }]
const files = {
  1: { 1: [], 2: [], 3: [], 4: [] },
  2: { 1: [], 2: [], 3: [], 4: [] },
  3: { 1: [], 2: [], 3: [], 4: [] },
  4: { 1: [], 2: [], 3: [], 4: [] },
};

let currentUnit = 1;
let currentAdminUnit = 1;

// ── Navegación entre páginas ──
function goTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  window.scrollTo(0, 0);
}

function goToUnit(num) {
  currentUnit = num;
  document.getElementById('unit-num').textContent = num;
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
  document.getElementById('modal-user').value = '';
  document.getElementById('modal-pass').value = '';
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
    const err = document.getElementById('modal-err');
    err.style.display = 'block';
  }
}

// ── Logout ──
function doLogout() {
  goTo('home');
}

// ── Vista pública: semanas con archivos descargables y mensaje bonito ──
function renderWeeks(unit) {
  const c = document.getElementById('weeks-container');
  c.innerHTML = '';

  for (let w = 1; w <= 4; w++) {
    const fs = files[unit][w];

    let fileHTML = '';

    if (fs.length > 0) {
      fileHTML = fs.map(f => `
        <a href="${f.url}" download="${f.name}" class="file-item downloadable">
          <span class="file-icon">📄</span>
          <span class="file-name">${f.name}</span>
          <span class="download-icon">↓</span>
        </a>
      `).join('');
    } else {
      fileHTML = `
        <div class="empty-state">
          <div class="empty-icon">📂</div>
          <p class="empty-text">Aún no hay archivos en esta semana</p>
          <p class="empty-subtext">El docente subirá el material pronto</p>
        </div>
      `;
    }

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
  currentAdminUnit = num;
  document.querySelectorAll('.admin-unit-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderAdminWeeks(num);
}

// ── Admin: renderizar semanas con upload ──
function renderAdminWeeks(unit) {
  const c = document.getElementById('admin-weeks-container');
  c.innerHTML = '';
  for (let w = 1; w <= 4; w++) {
    const id = `upload-${unit}-${w}`;
    c.innerHTML += `
      <div class="admin-week-card">
        <h4>Semana ${w} <span>U${unit}</span></h4>
        <div class="upload-area" onclick="document.getElementById('${id}').click()">
          <div class="up-icon">⬆</div>
          <p>Haz clic para subir un archivo</p>
          <input type="file" id="${id}" multiple onchange="handleUpload(event, ${unit}, ${w})" />
        </div>
        <div class="uploaded-list" id="list-${unit}-${w}"></div>
      </div>`;
  }
  for (let w = 1; w <= 4; w++) {
    refreshList(unit, w);
  }
}

// ── Subir archivo ──
function handleUpload(e, unit, week) {
  const fs = Array.from(e.target.files);
  fs.forEach(f => {
    if (!files[unit][week].find(x => x.name === f.name)) {
      files[unit][week].push({ name: f.name, url: URL.createObjectURL(f) });
    }
  });
  e.target.value = '';
  refreshList(unit, week);
  if (currentUnit === unit) renderWeeks(unit);
}

// ── Actualizar lista de archivos subidos ──
function refreshList(unit, week) {
  const el = document.getElementById(`list-${unit}-${week}`);
  if (!el) return;
  const fs = files[unit][week];
  el.innerHTML = fs.length ? fs.map((f, i) => `
    <div class="uploaded-item">
      <span style="color:var(--accent); font-size:0.85rem;">📄</span>
      <span class="fname">${f.name}</span>
      <button class="del-btn" onclick="deleteFile(${unit},${week},${i})" title="Eliminar">✕</button>
    </div>`).join('') : '';
}

// ── Eliminar archivo ──
function deleteFile(unit, week, idx) {
  files[unit][week].splice(idx, 1);
  refreshList(unit, week);
  if (currentUnit === unit) renderWeeks(unit);
}

// ── Formulario de contacto ──
function sendContact() {
  alert('¡Mensaje enviado! Nos pondremos en contacto pronto.');
}

// ── Inicialización ──
window.onload = () => {
  selectAdminUnit(1, null);
};
