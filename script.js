// ══════════════════════════════════════════════
//  Base de Datos II - UPLA (Drive + Supabase)
// ══════════════════════════════════════════════

// ==================== SUPABASE CONFIG ====================
const SUPABASE_URL = 'https://buqrpqtwzujqgwyzmqri.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JmrFVaGF6-fDZBMstEwjFw_T9-s6hUY';

let supabaseClient = null;

try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase cargado correctamente');
} catch (error) {
    console.error('❌ Error al cargar Supabase:', error);
}
// ========================================================

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

// ── Navegación ──
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

function doLogout() {
  goTo('home');
}

// ── Vista pública ──
function renderWeeks(unit) {
  const c = document.getElementById('weeks-container');
  c.innerHTML = '';

  for (let w = 1; w <= 4; w++) {
    const fs = files[unit][w];

    let fileHTML = fs.length ? fs.map(f => `
      <a href="${f.url}" target="_blank" rel="noopener" class="file-item downloadable">
        <span class="file-icon">📄</span>
        <span class="file-name">${f.name}</span>
        <span class="download-icon">↓</span>
      </a>
    `).join('') : `
      <div class="empty-state">
        <div class="empty-icon">📂</div>
        <p class="empty-text">Aún no hay archivos en esta semana</p>
        <p class="empty-subtext">El docente subirá el material pronto</p>
      </div>
    `;

    c.innerHTML += `
      <div class="week-card">
        <div class="week-num">0${w}</div>
        <h3>Semana ${w}</h3>
        <p>${unitInfo[unit].title}</p>
        <div class="week-files">${fileHTML}</div>
      </div>`;
  }
}

// ── Admin: renderizar semanas ──
function renderAdminWeeks(unit) {
  const c = document.getElementById('admin-weeks-container');
  c.innerHTML = '';

  for (let w = 1; w <= 4; w++) {
    c.innerHTML += `
      <div class="admin-week-card">
        <h4>Semana ${w} <span>U${unit}</span></h4>
        
        <!-- Botón Supabase -->
        <button onclick="uploadToSupabase(${unit}, ${w})" 
                class="btn-add-link" 
                style="background:#22c55e; color:#000; margin-bottom:12px; width:100%; font-weight:600;">
          📤 Subir archivo a Supabase
        </button>

        <!-- Opción Google Drive -->
        <div class="link-form">
          <input type="text" id="name-${unit}-${w}" placeholder="Nombre del archivo" class="link-input">
          <input type="url" id="url-${unit}-${w}" placeholder="Link de Google Drive" class="link-input">
          <button onclick="addLink(${unit}, ${w})" class="btn-add-link">+ Agregar link Drive</button>
        </div>

        <div class="uploaded-list" id="list-${unit}-${w}"></div>
      </div>`;
  }

  for (let w = 1; w <= 4; w++) refreshList(unit, w);
}

// ── Subir a Supabase (CORREGIDO) ──
async function uploadToSupabase(unit, week) {
  if (!supabaseClient) {
    alert("Supabase no se cargó correctamente. Revisa la consola (F12)");
    return;
  }

  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar";

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!confirm(`¿Subir "${file.name}" a Supabase?`)) return;

    try {
      const filePath = `U${unit}/Semana${week}/${Date.now()}-${file.name}`;

      const { error } = await supabaseClient.storage
        .from('materiales')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = supabaseClient.storage
        .from('materiales')
        .getPublicUrl(filePath);

      files[unit][week].push({
        name: file.name,
        url: urlData.publicUrl
      });

      refreshList(unit, week);
      if (currentUnit === unit) renderWeeks(unit);

      alert(`✅ Archivo "${file.name}" subido correctamente a Supabase!`);

    } catch (err) {
      console.error(err);
      alert("Error al subir:\n" + (err.message || err));
    }
  };

  input.click();
}

// ── Agregar link de Drive ──
function addLink(unit, week) {
  const nameEl = document.getElementById(`name-${unit}-${week}`);
  const urlEl = document.getElementById(`url-${unit}-${week}`);
  const name = nameEl.value.trim();
  let url = urlEl.value.trim();

  if (!name || !url) {
    alert("Completa el nombre y el link de Drive");
    return;
  }

  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) url = `https://drive.google.com/file/d/${match[1]}/view`;

  files[unit][week].push({ name, url });
  nameEl.value = '';
  urlEl.value = '';
  refreshList(unit, week);
}

// ── Refrescar lista ──
function refreshList(unit, week) {
  const el = document.getElementById(`list-${unit}-${week}`);
  if (!el) return;

  const fs = files[unit][week];
  el.innerHTML = fs.length ? fs.map((f, i) => `
    <div class="uploaded-item">
      <span style="color:var(--accent);">📄</span>
      <span class="fname">${f.name}</span>
      <button class="del-btn" onclick="deleteFile(${unit},${week},${i})">✕</button>
    </div>
  `).join('') : '';
}

// ── Eliminar archivo ──
function deleteFile(unit, week, idx) {
  if (confirm('¿Eliminar este archivo?')) {
    files[unit][week].splice(idx, 1);
    refreshList(unit, week);
    if (currentUnit === unit) renderWeeks(unit);
  }
}

// ── Contacto ──
function sendContact() {
  alert('¡Mensaje enviado! Nos pondremos en contacto pronto.');
}

// ── Inicialización ──
window.onload = () => {
  selectAdminUnit(1, null);
};
