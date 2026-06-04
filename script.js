/* ==========================================
   CekMotorAPP - script.js
   Semua logika aplikasi + localStorage
========================================== */

'use strict';

// ==================== KONSTANTA & DATA DEFAULT ====================

const ADMIN_CREDENTIALS = { email: 'admin@cekmotorapp.com', password: 'admin123' };

const TIPS = [
  'Ganti oli mesin setiap 2.000–3.000 km atau minimal 3 bulan sekali agar mesin tetap prima.',
  'Periksa tekanan ban setiap 2 minggu. Ban depan idealnya 29–33 psi, ban belakang 33–36 psi.',
  'Bersihkan rantai motor setiap 500–1.000 km dan lumasi dengan chain lube.',
  'Cek kondisi aki setiap 6 bulan. Aki lemah bisa menyebabkan motor susah starter.',
  'Periksa kampas rem secara berkala, jangan tunggu sampai bunyi decit keras.',
  'Lampu motor wajib dihidupkan siang hari untuk keselamatan berkendara.',
  'Hindari membawa beban berlebih, batas normal motor matic adalah 150 kg (pengemudi + penumpang + barang).',
  'Cuci motor minimal seminggu sekali, terutama bagian bawah dan mesin.',
];

const CHECKLIST_KOMPONEN = [
  { id: 'oli', name: 'Oli Mesin', icon: 'fas fa-oil-can', desc: 'Kondisi & volume oli' },
  { id: 'rem', name: 'Rem', icon: 'fas fa-circle-stop', desc: 'Kampas & minyak rem' },
  { id: 'ban', name: 'Ban', icon: 'fas fa-circle', desc: 'Tekanan & keausan ban' },
  { id: 'lampu', name: 'Lampu', icon: 'fas fa-lightbulb', desc: 'Lampu depan & belakang' },
  { id: 'aki', name: 'Aki', icon: 'fas fa-car-battery', desc: 'Daya & kondisi aki' },
  { id: 'rantai', name: 'Rantai', icon: 'fas fa-link', desc: 'Kekencangan & pelumas' },
  { id: 'mesin', name: 'Mesin', icon: 'fas fa-cogs', desc: 'Suara & performa mesin' },
  { id: 'kelistrikan', name: 'Kelistrikan', icon: 'fas fa-bolt', desc: 'Sistem kelistrikan' },
];

const ESTIMASI_BIAYA_DEFAULT = {
  oli: { nama: 'Ganti Oli Mesin', min: 60000, max: 100000 },
  rem: { nama: 'Servis / Ganti Kampas Rem', min: 30000, max: 80000 },
  ban: { nama: 'Ganti Ban', min: 200000, max: 350000 },
  lampu: { nama: 'Ganti Lampu', min: 25000, max: 75000 },
  aki: { nama: 'Ganti / Servis Aki', min: 50000, max: 150000 },
  rantai: { nama: 'Servis / Ganti Rantai', min: 40000, max: 120000 },
  mesin: { nama: 'Tune Up Mesin', min: 80000, max: 200000 },
  kelistrikan: { nama: 'Servis Kelistrikan', min: 50000, max: 150000 },
};

const BENGKEL_DEFAULT = [
  {
    id: 'b1', nama: 'Bengkel Motor Jaya', tipe: 'resmi',
    alamat: 'Jl. Sudirman No. 45, Jakarta Pusat',
    jarak: '0.8 km', jam: '08:00 - 17:00', rating: 4.8,
    telp: '08123456789', spesialis: 'Honda, Yamaha',
  },
  {
    id: 'b2', nama: 'Bengkel Amanah Motor', tipe: 'umum',
    alamat: 'Jl. Gatot Subroto No. 12, Jakarta Selatan',
    jarak: '1.4 km', jam: '07:00 - 19:00', rating: 4.5,
    telp: '08234567890', spesialis: 'Semua merk motor',
  },
  {
    id: 'b3', nama: 'Bengkel Cepat Servis', tipe: 'umum',
    alamat: 'Jl. Pemuda No. 88, Jakarta Timur',
    jarak: '2.1 km', jam: '08:00 - 20:00', rating: 4.3,
    telp: '08345678901', spesialis: 'Matic & bebek',
  },
  {
    id: 'b4', nama: 'AHASS Jaya Motor', tipe: 'resmi',
    alamat: 'Jl. Raya Bogor No. 200, Jakarta Timur',
    jarak: '2.8 km', jam: '08:00 - 17:00', rating: 4.9,
    telp: '08456789012', spesialis: 'Honda Resmi',
  },
  {
    id: 'b5', nama: 'Yamaha S1 Motor', tipe: 'resmi',
    alamat: 'Jl. Margonda No. 55, Depok',
    jarak: '3.5 km', jam: '08:00 - 17:00', rating: 4.7,
    telp: '08567890123', spesialis: 'Yamaha Resmi',
  },
  {
    id: 'b6', nama: 'Bengkel Maju Bersama', tipe: 'umum',
    alamat: 'Jl. Veteran No. 33, Bekasi',
    jarak: '4.2 km', jam: '07:30 - 18:00', rating: 4.2,
    telp: '08678901234', spesialis: 'Semua merk',
  },
];

// ==================== STATE APP ====================
let currentUser = null;
let currentChecklistData = {};
let tipIndex = 0;
let bengkelFilter = 'all';

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  initDefaultData();
  const loggedUser = JSON.parse(localStorage.getItem('cma_currentUser'));
  if (loggedUser) {
    currentUser = loggedUser;
    showPage('dashboard');
  } else {
    showPage('login');
  }
  renderChecklistGrid();
  setTodayDate();
});

function initDefaultData() {
  if (!localStorage.getItem('cma_bengkel')) {
    localStorage.setItem('cma_bengkel', JSON.stringify(BENGKEL_DEFAULT));
  }
  if (!localStorage.getItem('cma_biaya')) {
    localStorage.setItem('cma_biaya', JSON.stringify(ESTIMASI_BIAYA_DEFAULT));
  }
  if (!localStorage.getItem('cma_users')) {
    const defaultUsers = [{
      id: 'u0',
      nama: 'Admin CekMotorAPP',
      email: 'admin@cekmotorapp.com',
      password: 'admin123',
      role: 'admin',
      createdAt: new Date().toLocaleDateString('id-ID'),
    }];
    localStorage.setItem('cma_users', JSON.stringify(defaultUsers));
  }
}

function setTodayDate() {
  const now = new Date();
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const el = document.getElementById('dashDate');
  if (el) el.textContent = now.toLocaleDateString('id-ID', opts);

  // set default tanggal di form pengingat
  const lastDate = document.getElementById('reminderLastDate');
  const nextDate = document.getElementById('reminderNextDate');
  if (lastDate) lastDate.value = now.toISOString().split('T')[0];
  if (nextDate) {
    const next = new Date(now);
    next.setMonth(next.getMonth() + 3);
    nextDate.value = next.toISOString().split('T')[0];
  }
}

// ==================== PAGE NAVIGATION ====================
function showPage(pageId) {
  const allPages = document.querySelectorAll('.page');
  allPages.forEach(p => p.classList.remove('active'));

  const target = document.getElementById('page-' + pageId);
  if (target) target.classList.add('active');

  const appPages = ['dashboard', 'dataMotor', 'checklistKondisi', 'hasilAnalisis',
    'rekomendasiBengkel', 'pengingatServis', 'riwayatPengecekan', 'adminDashboard'];
  const authPages = ['login', 'register', 'lupaPassword', 'adminLogin'];

  const sidebar = document.getElementById('sidebar');
  const topbar = document.getElementById('topbar');

  if (appPages.includes(pageId)) {
    sidebar.classList.remove('hidden');
    topbar.classList.remove('hidden');
    if (window.innerWidth <= 768) {
      sidebar.classList.add('hidden');
    }
  } else {
    sidebar.classList.add('hidden');
    topbar.classList.add('hidden');
  }

  // Update active nav
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navMap = {
    dashboard: 0, dataMotor: 1, checklistKondisi: 2,
    hasilAnalisis: 3, rekomendasiBengkel: 4, pengingatServis: 5, riwayatPengecekan: 6,
  };
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  if (navMap[pageId] !== undefined && navItems[navMap[pageId]]) {
    navItems[navMap[pageId]].classList.add('active');
  }

  // Load page-specific data
  switch (pageId) {
    case 'dashboard': loadDashboard(); break;
    case 'dataMotor': loadMotorList(); break;
    case 'checklistKondisi': loadChecklistPage(); break;
    case 'hasilAnalisis': setTimeout(loadHasilPage, 50); break;
    case 'rekomendasiBengkel': loadBengkel(); break;
    case 'pengingatServis': loadReminders(); break;
    case 'riwayatPengecekan': loadHistory(); break;
    case 'adminDashboard': loadAdminDashboard(); break;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== SIDEBAR TOGGLE ====================
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.toggle('hidden');
  overlay.classList.toggle('hidden');
}

// ==================== TOAST ====================
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const icons = { success: 'fas fa-check-circle', error: 'fas fa-times-circle', info: 'fas fa-info-circle', warning: 'fas fa-exclamation-triangle' };
  toast.innerHTML = `<i class="${icons[type]}"></i> ${message}`;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// ==================== AUTH HELPERS ====================
function togglePassword(id) {
  const input = document.getElementById(id);
  input.type = input.type === 'password' ? 'text' : 'password';
}

function getUsers() { return JSON.parse(localStorage.getItem('cma_users') || '[]'); }
function saveUsers(users) { localStorage.setItem('cma_users', JSON.stringify(users)); }

// ==================== LOGIN ====================
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPassword').value;

  if (!email || !pass) { showToast('Email dan password wajib diisi!', 'error'); return; }

  // Check admin
  if (email === ADMIN_CREDENTIALS.email && pass === ADMIN_CREDENTIALS.password) {
    currentUser = { id: 'admin', nama: 'Admin', email: email, role: 'admin' };
    localStorage.setItem('cma_currentUser', JSON.stringify(currentUser));
    updateUIUser();
    showToast('Selamat datang, Admin!');
    showPage('adminDashboard');
    return;
  }

  const users = getUsers();
  const user = users.find(u => (u.email === email || u.nama === email) && u.password === pass);
  if (!user) { showToast('Email/username atau password salah!', 'error'); return; }

  currentUser = user;
  localStorage.setItem('cma_currentUser', JSON.stringify(currentUser));
  updateUIUser();
  showToast(`Selamat datang, ${user.nama}!`);
  showPage('dashboard');
}

// ==================== REGISTER ====================
function handleRegister(e) {
  e.preventDefault();
  const nama = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass = document.getElementById('regPassword').value;
  const confirm = document.getElementById('regConfirm').value;
  const agree = document.getElementById('regAgree').checked;

  if (!nama || !email || !pass || !confirm) { showToast('Semua field wajib diisi!', 'error'); return; }
  if (pass.length < 6) { showToast('Password minimal 6 karakter!', 'error'); return; }
  if (pass !== confirm) { showToast('Password dan konfirmasi password tidak sama!', 'error'); return; }
  if (!agree) { showToast('Anda harus menyetujui syarat & ketentuan!', 'error'); return; }

  const users = getUsers();
  if (users.find(u => u.email === email)) { showToast('Email sudah terdaftar!', 'error'); return; }

  const newUser = {
    id: 'u' + Date.now(),
    nama, email, password: pass, role: 'user',
    createdAt: new Date().toLocaleDateString('id-ID'),
  };
  users.push(newUser);
  saveUsers(users);
  showToast('Pendaftaran berhasil! Silakan login.', 'success');
  document.getElementById('registerForm').reset();
  setTimeout(() => showPage('login'), 1200);
}

// ==================== FORGOT PASSWORD ====================
function handleForgotPassword(e) {
  e.preventDefault();
  const email = document.getElementById('forgotEmail').value.trim();
  const users = getUsers();
  if (!users.find(u => u.email === email)) {
    showToast('Email tidak ditemukan!', 'error'); return;
  }
  showToast('Link reset password telah dikirim ke email Anda!', 'info');
  setTimeout(() => showPage('login'), 2000);
}

// ==================== ADMIN LOGIN ====================
function handleAdminLogin(e) {
  e.preventDefault();
  const email = document.getElementById('adminEmail').value;
  const pass = document.getElementById('adminPassword').value;
  if (email === ADMIN_CREDENTIALS.email && pass === ADMIN_CREDENTIALS.password) {
    currentUser = { id: 'admin', nama: 'Admin', email, role: 'admin' };
    localStorage.setItem('cma_currentUser', JSON.stringify(currentUser));
    updateUIUser();
    showToast('Login admin berhasil!');
    showPage('adminDashboard');
  } else {
    showToast('Kredensial admin salah!', 'error');
  }
}

// ==================== LOGOUT ====================
function logout() {
  if (!confirm('Apakah Anda yakin ingin keluar?')) return;
  currentUser = null;
  localStorage.removeItem('cma_currentUser');
  showToast('Anda telah logout.', 'info');
  showPage('login');
}

function adminLogout() { logout(); }

function updateUIUser() {
  if (!currentUser) return;
  const initial = currentUser.nama.charAt(0).toUpperCase();
  const sidebarUser = document.getElementById('sidebarUsername');
  const sidebarRole = document.getElementById('sidebarRole');
  const sidebarAv = document.getElementById('sidebarAvatar');
  const topbarAv = document.getElementById('topbarAvatar');
  if (sidebarUser) sidebarUser.textContent = currentUser.nama;
  if (sidebarRole) sidebarRole.textContent = currentUser.role === 'admin' ? 'Administrator' : 'Pengguna';
  if (sidebarAv) sidebarAv.textContent = initial;
  if (topbarAv) topbarAv.textContent = initial;
}

// ==================== DASHBOARD ====================
function loadDashboard() {
  updateUIUser();
  const greeting = document.getElementById('dashGreeting');
  if (greeting && currentUser) greeting.textContent = `Halo, ${currentUser.nama}! 👋`;

  const motors = getMotors();
  const history = getHistory();
  const reminders = getReminders();

  setEl('statMotorCount', motors.length);
  setEl('statCheckCount', history.length);
  setEl('statReminderCount', reminders.length);

  // Next service
  const upcoming = reminders.filter(r => {
    const d = new Date(r.nextDate);
    return d >= new Date();
  }).sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate));

  if (upcoming.length > 0) {
    const next = upcoming[0];
    const d = new Date(next.nextDate);
    setEl('statNextService', d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }));
  } else {
    setEl('statNextService', '-');
  }

  // Last motor status
  const statusEl = document.getElementById('lastMotorStatus');
  if (motors.length === 0) {
    statusEl.innerHTML = `<div class="empty-state"><i class="fas fa-motorcycle fa-3x"></i><p>Belum ada data motor. <a href="#" onclick="showPage('dataMotor')">Tambah motor sekarang</a></p></div>`;
  } else {
    const m = motors[motors.length - 1];
    const lastCheck = history.filter(h => h.motorId === m.id).slice(-1)[0];
    const statusClass = lastCheck ? (lastCheck.status === 'Baik' ? 'status-good' : 'status-danger') : 'status-warning';
    const statusText = lastCheck ? lastCheck.status : 'Belum dicek';
    const statusIcon = lastCheck ? (lastCheck.status === 'Baik' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle') : 'fas fa-question-circle';
    statusEl.innerHTML = `
      <div class="status-card-inner">
        <div class="status-motor-info">
          <div class="status-motor-name">${m.merek} ${m.tipe} ${m.tahun}</div>
          <div class="status-motor-detail"><i class="fas fa-id-card"></i> ${m.nopol} &nbsp;|&nbsp; <i class="fas fa-road"></i> ${Number(m.km).toLocaleString('id-ID')} km</div>
        </div>
        <div class="status-badge ${statusClass}"><i class="${statusIcon}"></i> ${statusText}</div>
        <button class="btn btn-primary btn-sm" onclick="showPage('checklistKondisi')"><i class="fas fa-clipboard-check"></i> Cek Sekarang</button>
      </div>`;
  }

  // Notif badge
  const overdue = reminders.filter(r => new Date(r.nextDate) < new Date());
  setEl('notifBadge', overdue.length || '0');
}

// ==================== DATA MOTOR ====================
function getMotors() {
  const key = `cma_motors_${currentUser?.id}`;
  return JSON.parse(localStorage.getItem(key) || '[]');
}
function saveMotors(motors) {
  localStorage.setItem(`cma_motors_${currentUser?.id}`, JSON.stringify(motors));
}

function saveMotorData(e) {
  e.preventDefault();
  const merek = document.getElementById('motorMerek').value;
  const tipe = document.getElementById('motorTipe').value.trim();
  const tahun = document.getElementById('motorTahun').value;
  const nopol = document.getElementById('motorNopol').value.trim().toUpperCase();
  const km = document.getElementById('motorKm').value;
  const warna = document.getElementById('motorWarna').value.trim();
  const catatan = document.getElementById('motorCatatan').value.trim();

  if (!merek || !tipe || !tahun || !nopol || !km) {
    showToast('Semua field wajib diisi!', 'error'); return;
  }

  const motors = getMotors();
  const existing = motors.findIndex(m => m.nopol === nopol);
  const motorData = {
    id: existing >= 0 ? motors[existing].id : 'motor_' + Date.now(),
    merek, tipe, tahun, nopol, km, warna, catatan,
    savedAt: new Date().toLocaleDateString('id-ID'),
  };

  if (existing >= 0) {
    motors[existing] = motorData;
    showToast('Data motor berhasil diperbarui!', 'success');
  } else {
    motors.push(motorData);
    showToast('Data motor berhasil disimpan!', 'success');
  }
  saveMotors(motors);
  document.getElementById('motorForm').reset();
  loadMotorList();
}

function resetMotorForm() {
  document.getElementById('motorForm').reset();
}

function loadMotorList() {
  const motors = getMotors();
  const container = document.getElementById('motorList');
  if (!container) return;

  if (motors.length === 0) {
    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-motorcycle fa-3x"></i><p>Belum ada data motor yang tersimpan.</p></div>`;
    return;
  }

  container.innerHTML = motors.map(m => `
    <div class="motor-card">
      <div class="motor-card-header">
        <i class="fas fa-motorcycle motor-card-icon"></i>
        <div>
          <div class="motor-card-name">${m.merek} ${m.tipe}</div>
          <div class="motor-card-nopol">${m.nopol}</div>
        </div>
      </div>
      <div class="motor-card-body">
        <div class="motor-detail-row"><span>Tahun</span><span>${m.tahun}</span></div>
        <div class="motor-detail-row"><span>Kilometer</span><span>${Number(m.km).toLocaleString('id-ID')} km</span></div>
        <div class="motor-detail-row"><span>Warna</span><span>${m.warna || '-'}</span></div>
        <div class="motor-detail-row"><span>Disimpan</span><span>${m.savedAt}</span></div>
        ${m.catatan ? `<div class="motor-detail-row"><span>Catatan</span><span style="max-width:180px;text-align:right;font-size:0.8rem">${m.catatan}</span></div>` : ''}
      </div>
      <div class="motor-card-footer">
        <button class="btn btn-outline btn-sm" onclick="editMotor('${m.id}')"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn btn-primary btn-sm" onclick="checkMotor('${m.id}')"><i class="fas fa-search"></i> Cek Motor</button>
        <button class="btn btn-danger btn-sm" onclick="deleteMotor('${m.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function editMotor(id) {
  const motors = getMotors();
  const m = motors.find(x => x.id === id);
  if (!m) return;
  document.getElementById('motorMerek').value = m.merek;
  document.getElementById('motorTipe').value = m.tipe;
  document.getElementById('motorTahun').value = m.tahun;
  document.getElementById('motorNopol').value = m.nopol;
  document.getElementById('motorKm').value = m.km;
  document.getElementById('motorWarna').value = m.warna || '';
  document.getElementById('motorCatatan').value = m.catatan || '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast('Data motor dimuat untuk diedit.', 'info');
}

function checkMotor(id) {
  showPage('checklistKondisi');
  setTimeout(() => {
    const sel = document.getElementById('checkMotorSelect');
    if (sel) sel.value = id;
  }, 200);
}

function deleteMotor(id) {
  if (!confirm('Hapus data motor ini? Riwayat pengecekan terkait juga akan dihapus.')) return;
  const motors = getMotors().filter(m => m.id !== id);
  saveMotors(motors);
  // hapus riwayat terkait
  const history = getHistory().filter(h => h.motorId !== id);
  saveHistory(history);
  showToast('Data motor berhasil dihapus.', 'info');
  loadMotorList();
}

// ==================== CHECKLIST ====================
function renderChecklistGrid() {
  const grid = document.getElementById('checklistGrid');
  if (!grid) return;
  grid.innerHTML = CHECKLIST_KOMPONEN.map(k => `
    <div class="checklist-item" id="item_${k.id}">
      <div class="checklist-item-header">
        <div class="checklist-item-icon"><i class="${k.icon}"></i></div>
        <div>
          <div class="checklist-item-name">${k.name}</div>
          <div class="checklist-item-desc">${k.desc}</div>
        </div>
      </div>
      <div class="condition-buttons">
        <button class="cond-btn good" onclick="setCondition('${k.id}', 'Baik', this)"><i class="fas fa-check"></i> Baik</button>
        <button class="cond-btn check" onclick="setCondition('${k.id}', 'Perlu Dicek', this)"><i class="fas fa-exclamation"></i> Perlu Dicek</button>
        <button class="cond-btn broken" onclick="setCondition('${k.id}', 'Rusak', this)"><i class="fas fa-times"></i> Rusak</button>
      </div>
    </div>
  `).join('');
}

function loadChecklistPage() {
  const sel = document.getElementById('checkMotorSelect');
  if (!sel) return;
  const motors = getMotors();
  sel.innerHTML = '<option value="">-- Pilih Motor --</option>' +
    motors.map(m => `<option value="${m.id}">${m.merek} ${m.tipe} - ${m.nopol}</option>`).join('');

  // Also update reminder motor select
  const remSel = document.getElementById('reminderMotor');
  if (remSel) {
    remSel.innerHTML = '<option value="">-- Pilih Motor --</option>' +
      motors.map(m => `<option value="${m.id}">${m.merek} ${m.tipe} - ${m.nopol}</option>`).join('');
  }
}

function setCondition(id, value, btn) {
  currentChecklistData[id] = value;
  const parent = btn.closest('.condition-buttons');
  parent.querySelectorAll('.cond-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');

  const item = document.getElementById('item_' + id);
  item.style.borderColor = value === 'Baik' ? 'var(--green)' : value === 'Rusak' ? 'var(--red)' : 'var(--yellow)';
}

function resetChecklist() {
  currentChecklistData = {};
  renderChecklistGrid();
  document.getElementById('checkMotorSelect').value = '';
  document.getElementById('checkKm').value = '';
  document.getElementById('checkCatatan').value = '';
  showToast('Checklist direset.', 'info');
}

function analyzeCondition() {
  const motorId = document.getElementById('checkMotorSelect').value;
  const km = document.getElementById('checkKm').value;
  const catatan = document.getElementById('checkCatatan').value;

  if (!motorId) { showToast('Pilih motor terlebih dahulu!', 'error'); return; }

  const unchecked = CHECKLIST_KOMPONEN.filter(k => !currentChecklistData[k.id]);
  if (unchecked.length > 0) {
    showToast(`Pilih kondisi untuk: ${unchecked.map(k => k.name).join(', ')}!`, 'error');
    return;
  }

  const motors = getMotors();
  const motor = motors.find(m => m.id === motorId);

  const baik = Object.values(currentChecklistData).filter(v => v === 'Baik').length;
  const perluDicek = Object.values(currentChecklistData).filter(v => v === 'Perlu Dicek').length;
  const rusak = Object.values(currentChecklistData).filter(v => v === 'Rusak').length;
  const total = CHECKLIST_KOMPONEN.length;
  const score = Math.round((baik / total) * 100);

  const analysisData = {
    motorId, motorName: `${motor.merek} ${motor.tipe} ${motor.tahun}`,
    motorNopol: motor.nopol,
    km: km || motor.km,
    checklist: { ...currentChecklistData },
    catatan,
    baik, perluDicek, rusak, score,
    tanggal: new Date().toLocaleDateString('id-ID'),
    tanggalISO: new Date().toISOString(),
    status: rusak > 0 ? 'Perlu Servis Segera' : perluDicek > 0 ? 'Perlu Perhatian' : 'Kondisi Baik',
  };

  localStorage.setItem('cma_lastAnalysis', JSON.stringify(analysisData));

  // Save to history
  const history = getHistory();
  const bermasalah = CHECKLIST_KOMPONEN.filter(k => currentChecklistData[k.id] !== 'Baik').map(k => k.name);
  history.unshift({
    id: 'h_' + Date.now(),
    motorId, motorName: analysisData.motorName,
    km: analysisData.km,
    tanggal: analysisData.tanggal,
    status: analysisData.status,
    bermasalah: bermasalah,
    score,
    checklist: { ...currentChecklistData },
    catatan,
  });
  saveHistory(history);

  showToast('Analisis selesai!', 'success');
  showPage('hasilAnalisis');
}

// ==================== HASIL ANALISIS ====================
function loadHasilPage() {
  const data = JSON.parse(localStorage.getItem('cma_lastAnalysis'));
  const container = document.getElementById('hasilContent');
  if (!container) return;

  if (!data) {
    container.innerHTML = `<div class="empty-state-center"><i class="fas fa-chart-bar fa-3x"></i><h3>Belum Ada Hasil Analisis</h3><p>Lakukan pengecekan kondisi motor terlebih dahulu</p><button class="btn btn-primary" onclick="showPage('checklistKondisi')"><i class="fas fa-clipboard-check"></i> Mulai Pengecekan</button></div>`;
    return;
  }

  const biaya = JSON.parse(localStorage.getItem('cma_biaya') || '{}');
  const bannerClass = data.rusak > 0 ? 'hasil-servis' : data.perluDicek > 0 ? 'hasil-perhatian' : 'hasil-baik';
  const bannerIcon = data.rusak > 0 ? 'fas fa-exclamation-triangle' : data.perluDicek > 0 ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
  const bannerTitle = data.rusak > 0 ? 'Motor Perlu Servis Segera' : data.perluDicek > 0 ? 'Motor Perlu Perhatian' : 'Motor dalam Kondisi Baik';
  const bannerSub = data.rusak > 0
    ? `${data.rusak} komponen rusak, ${data.perluDicek} perlu dicek. Segera bawa ke bengkel!`
    : data.perluDicek > 0
    ? `${data.perluDicek} komponen perlu pemeriksaan lebih lanjut.`
    : 'Semua komponen dalam kondisi prima. Tetap jaga perawatan rutin!';

  const progressColor = data.score >= 75 ? 'progress-green' : data.score >= 50 ? 'progress-orange' : 'progress-red';

  const komponenHtml = CHECKLIST_KOMPONEN.map(k => {
    const kondisi = data.checklist[k.id] || 'Tidak Dicek';
    const cls = kondisi === 'Baik' ? 'komponen-baik' : kondisi === 'Perlu Dicek' ? 'komponen-check' : 'komponen-rusak';
    return `<div class="komponen-item">
      <div class="komponen-icon"><i class="${k.icon}"></i></div>
      <div class="komponen-name">${k.name}</div>
      <div class="komponen-status ${cls}">${kondisi}</div>
    </div>`;
  }).join('');

  // Biaya & rekomendasi hanya untuk yang bermasalah
  const bermasalah = CHECKLIST_KOMPONEN.filter(k => data.checklist[k.id] !== 'Baik');
  const biayaHtml = bermasalah.length > 0
    ? bermasalah.map(k => {
        const b = biaya[k.id];
        if (!b) return '';
        const priority = data.checklist[k.id] === 'Rusak' ? 'priority-high' : 'priority-medium';
        const priorityText = data.checklist[k.id] === 'Rusak' ? 'Prioritas Tinggi' : 'Sedang';
        return `<div class="biaya-item">
          <div><i class="${k.icon}" style="color:var(--blue);margin-right:8px"></i><span class="biaya-name">${b.nama}</span></div>
          <div style="display:flex;align-items:center;gap:12px">
            <span class="biaya-range">Rp ${b.min.toLocaleString('id-ID')} - Rp ${b.max.toLocaleString('id-ID')}</span>
            <span class="biaya-priority ${priority}">${priorityText}</span>
          </div>
        </div>`;
      }).join('')
    : '<p style="color:var(--gray-500);font-size:0.88rem;padding:12px 0">Tidak ada komponen yang memerlukan biaya servis saat ini.</p>';

  const rekomendasiItems = bermasalah.length === 0
    ? ['Lanjutkan perawatan rutin motor Anda.', 'Ganti oli sesuai jadwal untuk menjaga performa mesin.', 'Pantau tekanan ban secara berkala.']
    : bermasalah.map(k => {
        const recs = {
          oli: 'Segera ganti oli mesin di bengkel terdekat untuk mencegah kerusakan mesin.',
          rem: 'Cek dan ganti kampas rem jika sudah tipis. Jangan tunda demi keselamatan!',
          ban: 'Periksa tekanan dan keausan ban. Ban aus sangat berbahaya saat hujan.',
          lampu: 'Ganti bohlam lampu yang mati. Penerangan baik sangat penting saat berkendara malam.',
          aki: 'Cek tegangan aki. Aki lemah menyebabkan motor susah starter dan gangguan kelistrikan.',
          rantai: 'Lumasi dan kencangkan rantai sesuai spesifikasi pabrikan untuk performa optimal.',
          mesin: 'Lakukan tune up menyeluruh. Mesin bermasalah bisa memperburuk konsumsi BBM.',
          kelistrikan: 'Cek semua koneksi kabel dan sekring. Korsleting listrik sangat berbahaya.',
        };
        return recs[k.id] || `Periksa komponen ${k.name} di bengkel terdekat.`;
      });

  const rekHtml = rekomendasiItems.map(r => `<div class="rekomendasi-item"><i class="fas fa-lightbulb"></i><span class="rekomendasi-text">${r}</span></div>`).join('');

  const totalMinBiaya = bermasalah.reduce((s, k) => s + (biaya[k.id]?.min || 0), 0);
  const totalMaxBiaya = bermasalah.reduce((s, k) => s + (biaya[k.id]?.max || 0), 0);

  container.innerHTML = `
    <div class="hasil-status-banner ${bannerClass}">
      <div class="hasil-icon"><i class="${bannerIcon}"></i></div>
      <div>
        <div class="hasil-title">${bannerTitle}</div>
        <div class="hasil-subtitle">${bannerSub}</div>
        <div style="margin-top:8px;font-size:0.82rem;opacity:0.8">
          <i class="fas fa-motorcycle"></i> ${data.motorName} &nbsp;|&nbsp;
          <i class="fas fa-road"></i> ${Number(data.km).toLocaleString('id-ID')} km &nbsp;|&nbsp;
          <i class="fas fa-calendar"></i> ${data.tanggal}
        </div>
      </div>
      <div class="hasil-score">
        <div class="hasil-score-num">${data.score}%</div>
        <div class="hasil-score-label">Skor Kondisi</div>
        <div class="progress-bar-wrap" style="width:100px;margin-top:6px">
          <div class="progress-bar ${progressColor}" style="width:${data.score}%"></div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><i class="fas fa-list-check"></i> Ringkasan Komponen</div>
      <div class="card-body">
        <div style="display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap">
          <div style="background:var(--green-light);padding:10px 20px;border-radius:var(--radius-sm);text-align:center">
            <div style="font-size:1.5rem;font-weight:800;color:var(--green)">${data.baik}</div>
            <div style="font-size:0.78rem;color:var(--green)">Baik</div>
          </div>
          <div style="background:var(--orange-light);padding:10px 20px;border-radius:var(--radius-sm);text-align:center">
            <div style="font-size:1.5rem;font-weight:800;color:var(--orange)">${data.perluDicek}</div>
            <div style="font-size:0.78rem;color:var(--orange)">Perlu Dicek</div>
          </div>
          <div style="background:var(--red-light);padding:10px 20px;border-radius:var(--radius-sm);text-align:center">
            <div style="font-size:1.5rem;font-weight:800;color:var(--red)">${data.rusak}</div>
            <div style="font-size:0.78rem;color:var(--red)">Rusak</div>
          </div>
        </div>
        <div class="komponen-grid">${komponenHtml}</div>
        ${data.catatan ? `<div style="margin-top:12px;background:var(--gray-50);border-radius:var(--radius-sm);padding:12px 16px;border:1px solid var(--border)"><strong style="font-size:0.85rem"><i class="fas fa-sticky-note" style="color:var(--blue)"></i> Catatan:</strong><p style="font-size:0.85rem;color:var(--gray-600);margin-top:4px">${data.catatan}</p></div>` : ''}
      </div>
    </div>

    ${bermasalah.length > 0 ? `
    <div class="card">
      <div class="card-header"><i class="fas fa-money-bill-wave"></i> Estimasi Biaya Servis</div>
      <div class="card-body">
        <div class="biaya-list">${biayaHtml}</div>
        ${totalMinBiaya > 0 ? `
        <div style="margin-top:16px;background:var(--blue-light);border:1px solid #90caf9;border-radius:var(--radius-sm);padding:14px 18px;display:flex;justify-content:space-between;align-items:center">
          <strong style="color:var(--blue-dark);font-size:0.9rem"><i class="fas fa-calculator"></i> Total Estimasi</strong>
          <strong style="color:var(--blue);font-size:1.05rem">Rp ${totalMinBiaya.toLocaleString('id-ID')} - Rp ${totalMaxBiaya.toLocaleString('id-ID')}</strong>
        </div>` : ''}
      </div>
    </div>
    ` : ''}

    <div class="card">
      <div class="card-header"><i class="fas fa-lightbulb"></i> Rekomendasi Tindakan</div>
      <div class="card-body">
        <div class="rekomendasi-list">${rekHtml}</div>
      </div>
    </div>

    <div class="hasil-actions">
      <button class="btn btn-outline" onclick="showPage('checklistKondisi')"><i class="fas fa-redo"></i> Cek Ulang</button>
      <button class="btn btn-outline" onclick="showPage('riwayatPengecekan')"><i class="fas fa-history"></i> Lihat Riwayat</button>
      <button class="btn btn-primary" onclick="showPage('rekomendasiBengkel')"><i class="fas fa-wrench"></i> Lihat Bengkel Terdekat</button>
    </div>
  `;
}


// ==================== BENGKEL ====================
function loadBengkel() {
  const bengkel = JSON.parse(localStorage.getItem('cma_bengkel') || '[]');
  renderBengkel(bengkel);
}

function renderBengkel(list) {
  const grid = document.getElementById('bengkelGrid');
  if (!grid) return;
  const search = document.getElementById('bengkelSearch')?.value.toLowerCase() || '';
  const filtered = list.filter(b => {
    const matchSearch = !search || b.nama.toLowerCase().includes(search) || b.alamat.toLowerCase().includes(search);
    const matchType = bengkelFilter === 'all' || b.tipe === bengkelFilter;
    return matchSearch && matchType;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-search fa-3x"></i><p>Bengkel tidak ditemukan.</p></div>`;
    return;
  }

  grid.innerHTML = filtered.map(b => {
    const stars = '★'.repeat(Math.floor(b.rating)) + (b.rating % 1 >= 0.5 ? '½' : '');
    const tipeBadge = b.tipe === 'resmi' ? 'Bengkel Resmi' : 'Bengkel Umum';
    return `
    <div class="bengkel-card">
      <div class="bengkel-card-header">
        <div class="bengkel-type-badge">${tipeBadge}</div>
        <div class="bengkel-name">${b.nama}</div>
      </div>
      <div class="bengkel-card-body">
        <div class="bengkel-info-row"><i class="fas fa-map-marker-alt"></i><span>${b.alamat}</span></div>
        <div class="bengkel-info-row"><i class="fas fa-route"></i><span>${b.jarak} dari lokasi Anda</span></div>
        <div class="bengkel-info-row"><i class="fas fa-clock"></i><span>Buka: ${b.jam}</span></div>
        <div class="bengkel-info-row">
          <i class="fas fa-star"></i>
          <div class="bengkel-rating">
            <span class="stars">${stars}</span>
            <span class="rating-num">${b.rating}</span>
            <span style="color:var(--gray-400);font-size:0.8rem">/5.0</span>
          </div>
        </div>
        ${b.spesialis ? `<div class="bengkel-info-row"><i class="fas fa-tools"></i><span>${b.spesialis}</span></div>` : ''}
      </div>
      <div class="bengkel-card-footer">
        <button class="btn btn-outline btn-sm" onclick="bukaMap('${b.nama}')"><i class="fas fa-map"></i> Peta</button>
        <button class="btn btn-primary btn-sm" onclick="hubungiBengkel('${b.telp}', '${b.nama}')"><i class="fas fa-phone"></i> Hubungi</button>
      </div>
    </div>`;
  }).join('');
}

function filterBengkel() {
  const bengkel = JSON.parse(localStorage.getItem('cma_bengkel') || '[]');
  renderBengkel(bengkel);
}

function filterByType(type, btn) {
  bengkelFilter = type;
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  filterBengkel();
}

function bukaMap(nama) {
  alert(`🗺️ Membuka Google Maps untuk:\n"${nama}"\n\n(Fitur ini terhubung ke Google Maps di versi produksi)`);
}

function hubungiBengkel(telp, nama) {
  if (confirm(`Hubungi ${nama} via WhatsApp?\nNomor: ${telp}`)) {
    showToast(`Menghubungi ${nama}...`, 'info');
  }
}

// ==================== PENGINGAT ====================
function getReminders() {
  return JSON.parse(localStorage.getItem(`cma_reminders_${currentUser?.id}`) || '[]');
}
function saveReminders(r) {
  localStorage.setItem(`cma_reminders_${currentUser?.id}`, JSON.stringify(r));
}

function saveReminder(e) {
  e.preventDefault();
  const motorId = document.getElementById('reminderMotor').value;
  const jenis = document.getElementById('reminderJenis').value;
  const lastDate = document.getElementById('reminderLastDate').value;
  const lastKm = document.getElementById('reminderLastKm').value;
  const nextDate = document.getElementById('reminderNextDate').value;
  const nextKm = document.getElementById('reminderNextKm').value;
  const note = document.getElementById('reminderNote').value;

  if (!jenis || !nextDate) { showToast('Jenis pengingat dan tanggal berikutnya wajib diisi!', 'error'); return; }

  const motors = getMotors();
  const motor = motors.find(m => m.id === motorId);
  const reminders = getReminders();

  reminders.unshift({
    id: 'r_' + Date.now(),
    motorId,
    motorName: motor ? `${motor.merek} ${motor.tipe} - ${motor.nopol}` : 'Motor tidak dipilih',
    jenis, lastDate, lastKm, nextDate, nextKm, note,
    createdAt: new Date().toLocaleDateString('id-ID'),
  });
  saveReminders(reminders);
  document.getElementById('reminderForm').reset();
  setTodayDate();
  showToast('Pengingat servis berhasil disimpan!', 'success');
  loadReminders();
}

function loadReminders() {
  const reminderMotorSel = document.getElementById('reminderMotor');
  const motors = getMotors();
  if (reminderMotorSel) {
    reminderMotorSel.innerHTML = '<option value="">-- Pilih Motor --</option>' +
      motors.map(m => `<option value="${m.id}">${m.merek} ${m.tipe} - ${m.nopol}</option>`).join('');
  }

  const reminders = getReminders();
  const container = document.getElementById('reminderList');
  if (!container) return;

  if (reminders.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-bell-slash fa-3x"></i><p>Belum ada pengingat servis. Tambahkan di atas!</p></div>`;
    return;
  }

  const now = new Date();
  container.innerHTML = reminders.map(r => {
    const nextD = new Date(r.nextDate);
    const diffDays = Math.ceil((nextD - now) / (1000 * 60 * 60 * 24));
    let statusClass, statusText, cardClass;
    if (diffDays < 0) {
      statusClass = 'status-overdue'; statusText = `Terlambat ${Math.abs(diffDays)} hari`; cardClass = 'reminder-overdue';
    } else if (diffDays <= 7) {
      statusClass = 'status-soon'; statusText = `${diffDays} hari lagi`; cardClass = 'reminder-soon';
    } else {
      statusClass = 'status-ok'; statusText = `${diffDays} hari lagi`; cardClass = 'reminder-ok';
    }

    const iconMap = { 'Ganti Oli': 'fas fa-oil-can', 'Servis Rutin': 'fas fa-wrench', 'Cek Rem': 'fas fa-circle-stop', 'Cek Ban': 'fas fa-circle', 'Ganti Aki': 'fas fa-car-battery', 'Servis Besar': 'fas fa-tools' };
    const icon = iconMap[r.jenis] || 'fas fa-bell';

    return `
    <div class="reminder-card ${cardClass}">
      <div class="reminder-icon-wrap"><i class="${icon}"></i></div>
      <div class="reminder-info">
        <div class="reminder-jenis">${r.jenis}</div>
        <div class="reminder-motor"><i class="fas fa-motorcycle"></i> ${r.motorName}</div>
        <div class="reminder-detail">
          Jadwal: <strong>${new Date(r.nextDate).toLocaleDateString('id-ID', {day:'numeric',month:'long',year:'numeric'})}</strong>
          ${r.nextKm ? ` &nbsp;|&nbsp; Target: <strong>${Number(r.nextKm).toLocaleString('id-ID')} km</strong>` : ''}
          ${r.note ? `<br><i class="fas fa-sticky-note"></i> ${r.note}` : ''}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
        <span class="reminder-status ${statusClass}">${statusText}</span>
        <button class="btn btn-danger btn-xs" onclick="deleteReminder('${r.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>`;
  }).join('');

  // Update notif badge
  const overdue = reminders.filter(r => new Date(r.nextDate) < now);
  setEl('notifBadge', overdue.length || '0');
}

function deleteReminder(id) {
  if (!confirm('Hapus pengingat ini?')) return;
  const reminders = getReminders().filter(r => r.id !== id);
  saveReminders(reminders);
  showToast('Pengingat dihapus.', 'info');
  loadReminders();
}

// ==================== RIWAYAT ====================
function getHistory() {
  return JSON.parse(localStorage.getItem(`cma_history_${currentUser?.id}`) || '[]');
}
function saveHistory(h) {
  localStorage.setItem(`cma_history_${currentUser?.id}`, JSON.stringify(h));
}

function loadHistory() {
  const history = getHistory();
  const tbody = document.getElementById('historyBody');
  const emptyEl = document.getElementById('historyEmpty');
  const table = document.getElementById('historyTable');
  if (!tbody) return;

  if (history.length === 0) {
    tbody.innerHTML = '';
    if (emptyEl) emptyEl.classList.remove('hidden');
    if (table) table.style.display = 'none';
    return;
  }

  if (emptyEl) emptyEl.classList.add('hidden');
  if (table) table.style.display = '';

  tbody.innerHTML = history.map((h, i) => {
    const badgeClass = h.status === 'Kondisi Baik' ? 'badge-green' : h.status === 'Perlu Perhatian' ? 'badge-orange' : 'badge-red';
    const bermasalahText = h.bermasalah?.length > 0 ? h.bermasalah.slice(0, 3).join(', ') + (h.bermasalah.length > 3 ? '...' : '') : 'Tidak ada';
    return `<tr>
      <td>${i + 1}</td>
      <td>${h.tanggal}</td>
      <td><strong>${h.motorName}</strong></td>
      <td>${Number(h.km).toLocaleString('id-ID')} km</td>
      <td><span class="badge ${badgeClass}">${h.status}</span></td>
      <td style="font-size:0.82rem">${bermasalahText}</td>
      <td>
        <button class="btn btn-outline btn-xs" onclick="showHistoryDetail('${h.id}')"><i class="fas fa-eye"></i></button>
        <button class="btn btn-danger btn-xs" onclick="deleteHistory('${h.id}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`;
  }).join('');
}

function showHistoryDetail(id) {
  const history = getHistory();
  const h = history.find(x => x.id === id);
  if (!h) return;

  const body = document.getElementById('modalDetailBody');
  const badgeClass = h.status === 'Kondisi Baik' ? 'badge-green' : h.status === 'Perlu Perhatian' ? 'badge-orange' : 'badge-red';

  const komponenRows = CHECKLIST_KOMPONEN.map(k => {
    const kondisi = h.checklist?.[k.id] || '-';
    const cls = kondisi === 'Baik' ? 'komponen-baik' : kondisi === 'Perlu Dicek' ? 'komponen-check' : 'komponen-rusak';
    return `<tr><td><i class="${k.icon}"></i> ${k.name}</td><td><span class="komponen-status ${cls}" style="font-size:0.8rem">${kondisi}</span></td></tr>`;
  }).join('');

  body.innerHTML = `
    <div style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <strong style="font-size:1rem">${h.motorName}</strong>
        <span class="badge ${badgeClass}">${h.status}</span>
      </div>
      <div style="display:flex;gap:20px;flex-wrap:wrap;font-size:0.85rem;color:var(--gray-500)">
        <span><i class="fas fa-calendar"></i> ${h.tanggal}</span>
        <span><i class="fas fa-road"></i> ${Number(h.km).toLocaleString('id-ID')} km</span>
        <span><i class="fas fa-star" style="color:var(--yellow)"></i> Skor ${h.score}%</span>
      </div>
    </div>
    <table class="data-table" style="margin-bottom:12px">
      <thead><tr><th>Komponen</th><th>Kondisi</th></tr></thead>
      <tbody>${komponenRows}</tbody>
    </table>
    ${h.catatan ? `<div style="background:var(--gray-50);border-radius:var(--radius-sm);padding:12px;border:1px solid var(--border);font-size:0.85rem"><strong>Catatan:</strong> ${h.catatan}</div>` : ''}
  `;
  document.getElementById('modalDetail').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modalDetail').classList.add('hidden');
}

function deleteHistory(id) {
  if (!confirm('Hapus riwayat pengecekan ini?')) return;
  const history = getHistory().filter(h => h.id !== id);
  saveHistory(history);
  showToast('Riwayat dihapus.', 'info');
  loadHistory();
}

function confirmClearHistory() {
  if (getHistory().length === 0) { showToast('Tidak ada riwayat untuk dihapus.', 'info'); return; }
  if (!confirm('Hapus SEMUA riwayat pengecekan? Tindakan ini tidak dapat dibatalkan!')) return;
  saveHistory([]);
  showToast('Semua riwayat dihapus.', 'info');
  loadHistory();
}

// ==================== ADMIN ====================
function loadAdminDashboard() {
  updateUIUser();
  loadAdminUsers();
  loadAdminMotors();
  loadAdminChecks();
  loadAdminBengkelList();
  loadBiayaEdit();
}

function switchAdminTab(tabName, btn) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  const tabEl = document.getElementById('adminTab-' + tabName);
  if (tabEl) tabEl.classList.add('active');
}

function loadAdminUsers() {
  const users = getUsers();
  const tbody = document.getElementById('adminUsersBody');
  if (!tbody) return;
  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--gray-400)">Tidak ada pengguna terdaftar</td></tr>';
    return;
  }
  tbody.innerHTML = users.map((u, i) => {
    const motorCount = JSON.parse(localStorage.getItem(`cma_motors_${u.id}`) || '[]').length;
    const checkCount = JSON.parse(localStorage.getItem(`cma_history_${u.id}`) || '[]').length;
    return `<tr>
      <td>${i + 1}</td>
      <td><strong>${u.nama}</strong></td>
      <td>${u.email}</td>
      <td>${motorCount}</td>
      <td>${checkCount}</td>
      <td>${u.createdAt || '-'}</td>
    </tr>`;
  }).join('');
}

function loadAdminMotors() {
  const users = getUsers();
  const tbody = document.getElementById('adminMotorsBody');
  if (!tbody) return;
  let rows = '';
  let idx = 1;
  users.forEach(u => {
    const motors = JSON.parse(localStorage.getItem(`cma_motors_${u.id}`) || '[]');
    motors.forEach(m => {
      rows += `<tr>
        <td>${idx++}</td>
        <td>${u.nama}</td>
        <td>${m.merek}</td>
        <td>${m.tipe}</td>
        <td>${m.tahun}</td>
        <td><strong>${m.nopol}</strong></td>
        <td>${Number(m.km).toLocaleString('id-ID')} km</td>
      </tr>`;
    });
  });
  tbody.innerHTML = rows || '<tr><td colspan="7" style="text-align:center;color:var(--gray-400)">Tidak ada data motor</td></tr>';
}

function loadAdminChecks() {
  const users = getUsers();
  const tbody = document.getElementById('adminChecksBody');
  if (!tbody) return;
  let rows = '';
  let idx = 1;
  users.forEach(u => {
    const history = JSON.parse(localStorage.getItem(`cma_history_${u.id}`) || '[]');
    history.forEach(h => {
      const badgeClass = h.status === 'Kondisi Baik' ? 'badge-green' : h.status === 'Perlu Perhatian' ? 'badge-orange' : 'badge-red';
      rows += `<tr>
        <td>${idx++}</td>
        <td>${u.nama}</td>
        <td>${h.motorName}</td>
        <td>${h.tanggal}</td>
        <td><span class="badge ${badgeClass}">${h.status}</span></td>
        <td style="font-size:0.82rem">${h.bermasalah?.join(', ') || '-'}</td>
      </tr>`;
    });
  });
  tbody.innerHTML = rows || '<tr><td colspan="6" style="text-align:center;color:var(--gray-400)">Tidak ada data pengecekan</td></tr>';
}

function loadAdminBengkelList() {
  const bengkel = JSON.parse(localStorage.getItem('cma_bengkel') || '[]');
  const container = document.getElementById('adminBengkelList');
  if (!container) return;
  container.innerHTML = `<table class="data-table"><thead><tr><th>Nama</th><th>Tipe</th><th>Alamat</th><th>Jam</th><th>Rating</th><th>Aksi</th></tr></thead><tbody>` +
    bengkel.map(b => `<tr>
      <td><strong>${b.nama}</strong></td>
      <td><span class="badge ${b.tipe === 'resmi' ? 'badge-blue' : 'badge-orange'}">${b.tipe}</span></td>
      <td style="font-size:0.82rem">${b.alamat}</td>
      <td>${b.jam}</td>
      <td>${b.rating}</td>
      <td><button class="btn btn-danger btn-xs" onclick="deleteBengkel('${b.id}')"><i class="fas fa-trash"></i></button></td>
    </tr>`).join('') +
    '</tbody></table>';
}

function addBengkel(e) {
  e.preventDefault();
  const bengkel = JSON.parse(localStorage.getItem('cma_bengkel') || '[]');
  const newB = {
    id: 'b_' + Date.now(),
    nama: document.getElementById('adminBengkelNama').value,
    tipe: document.getElementById('adminBengkelTipe').value,
    alamat: document.getElementById('adminBengkelAlamat').value,
    jam: document.getElementById('adminBengkelJam').value,
    telp: document.getElementById('adminBengkelTelp').value,
    jarak: document.getElementById('adminBengkelJarak').value || '? km',
    rating: 4.0,
    spesialis: '',
  };
  bengkel.push(newB);
  localStorage.setItem('cma_bengkel', JSON.stringify(bengkel));
  showToast('Bengkel berhasil ditambahkan!', 'success');
  e.target.reset();
  loadAdminBengkelList();
}

function deleteBengkel(id) {
  if (!confirm('Hapus bengkel ini?')) return;
  const bengkel = JSON.parse(localStorage.getItem('cma_bengkel') || '[]').filter(b => b.id !== id);
  localStorage.setItem('cma_bengkel', JSON.stringify(bengkel));
  showToast('Bengkel dihapus.', 'info');
  loadAdminBengkelList();
}

function loadBiayaEdit() {
  const biaya = JSON.parse(localStorage.getItem('cma_biaya') || '{}');
  const container = document.getElementById('biayaEditList');
  if (!container) return;

  container.innerHTML = Object.entries(biaya).map(([key, b]) => `
    <div class="biaya-edit-item">
      <div class="biaya-edit-name"><i class="${CHECKLIST_KOMPONEN.find(k=>k.id===key)?.icon||'fas fa-tools'}" style="color:var(--blue);margin-right:6px"></i>${b.nama}</div>
      <div class="biaya-edit-inputs">
        <span class="biaya-edit-sep">Min:</span>
        <input type="number" value="${b.min}" id="biaya_min_${key}" style="max-width:140px" />
        <span class="biaya-edit-sep">Max:</span>
        <input type="number" value="${b.max}" id="biaya_max_${key}" style="max-width:140px" />
      </div>
      <button class="btn btn-success btn-sm" onclick="saveBiayaItem('${key}')"><i class="fas fa-save"></i> Simpan</button>
    </div>
  `).join('');
}

function saveBiayaItem(key) {
  const biaya = JSON.parse(localStorage.getItem('cma_biaya') || '{}');
  const minVal = parseInt(document.getElementById('biaya_min_' + key).value);
  const maxVal = parseInt(document.getElementById('biaya_max_' + key).value);
  if (isNaN(minVal) || isNaN(maxVal) || minVal < 0 || maxVal < minVal) {
    showToast('Nilai biaya tidak valid!', 'error'); return;
  }
  biaya[key].min = minVal;
  biaya[key].max = maxVal;
  localStorage.setItem('cma_biaya', JSON.stringify(biaya));
  showToast(`Estimasi biaya ${biaya[key].nama} berhasil diperbarui!`, 'success');
}

// ==================== TIPS ====================
function nextTip() {
  tipIndex = (tipIndex + 1) % TIPS.length;
  const el = document.getElementById('tipText');
  if (el) {
    el.style.opacity = 0;
    setTimeout(() => { el.textContent = TIPS[tipIndex]; el.style.opacity = 1; }, 200);
  }
}

// ==================== UTILS ====================
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

