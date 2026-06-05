/* =====================================================
   CekMotorAPP - script.js
   Firebase Firestore + Auth  |  localStorage fallback
===================================================== */

'use strict';

// ==================== FIREBASE CONFIG ====================
// Ganti dengan konfigurasi project Firebase Anda!
// Buat project gratis di: https://console.firebase.google.com
// Aktifkan: Authentication (Email/Password) + Firestore Database
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyACWXuhLA-UDrXfc8G0o0j2gbx_aXRifAQ",
  authDomain: "cekmotorapp.firebaseapp.com",
  databaseURL: "https://cekmotorapp-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cekmotorapp",
  storageBucket: "cekmotorapp.firebasestorage.app",
  messagingSenderId: "872415282316",
  appId: "1:872415282316:web:b0711dd8e4c6f8473f67a9"
};

let fbAuth = null;
let fbDB  = null;
let USE_FIREBASE = false;

function initFirebase() {
  try {
    if (typeof firebase === 'undefined') { updateDbBadge(false); return; }
    firebase.initializeApp(FIREBASE_CONFIG);
    fbAuth = firebase.auth();
    fbDB   = firebase.database();
    USE_FIREBASE = true;
    updateDbBadge(true);
    console.log('✅ Firebase Realtime Database terhubung!');
  } catch(e) {
    console.warn('⚠️ Firebase gagal:', e.message);
    updateDbBadge(false);
  }
}

function updateDbBadge(connected) {
  const el = document.getElementById('dbStatusBadge');
  if (!el) return;
  el.className = 'db-status-badge ' + (connected ? 'db-online' : 'db-offline');
  el.innerHTML = connected
    ? '<i class="fas fa-cloud"></i> Firebase Connected'
    : '<i class="fas fa-hdd"></i> Mode Lokal';
  el.classList.remove('hidden');
}

// ==================== CONSTANTS ====================
const ADMIN_EMAIL = 'admin@cekmotorapp.com';
const ADMIN_PASS  = 'admin123';

const TIPS = [
  'Ganti oli mesin setiap 2.000–3.000 km atau minimal 3 bulan sekali agar mesin tetap prima.',
  'Periksa tekanan ban setiap 2 minggu. Ban depan 29–33 psi, belakang 33–36 psi.',
  'Bersihkan dan lumasi rantai motor setiap 500–1.000 km untuk performa optimal.',
  'Cek kondisi aki setiap 6 bulan. Aki lemah bisa menyebabkan motor susah starter.',
  'Periksa kampas rem secara berkala, jangan tunggu sampai bunyi decit keras.',
  'Lampu motor wajib dihidupkan siang hari untuk keselamatan berkendara.',
  'Hindari membawa beban berlebih, batas normal motor matic 150 kg (pengemudi + penumpang + barang).',
  'Cuci motor minimal seminggu sekali untuk mencegah karat dan menjaga penampilan.',
];

const CHECKLIST_KOMPONEN = [
  { id:'oli',       name:'Oli Mesin',   icon:'fas fa-oil-can',    desc:'Kondisi & volume oli' },
  { id:'rem',       name:'Rem',          icon:'fas fa-circle-stop',desc:'Kampas & minyak rem' },
  { id:'ban',       name:'Ban',          icon:'fas fa-circle',     desc:'Tekanan & keausan ban' },
  { id:'lampu',     name:'Lampu',        icon:'fas fa-lightbulb',  desc:'Lampu depan & belakang' },
  { id:'aki',       name:'Aki',          icon:'fas fa-car-battery',desc:'Daya & kondisi aki' },
  { id:'rantai',    name:'Rantai',       icon:'fas fa-link',       desc:'Kekencangan & pelumas' },
  { id:'mesin',     name:'Mesin',        icon:'fas fa-cogs',       desc:'Suara & performa mesin' },
  { id:'kelistrikan',name:'Kelistrikan',icon:'fas fa-bolt',       desc:'Sistem kelistrikan' },
];

const ESTIMASI_BIAYA_DEFAULT = {
  oli:       { nama:'Ganti Oli Mesin',          min:60000,  max:100000 },
  rem:       { nama:'Servis / Ganti Kampas Rem', min:30000,  max:80000  },
  ban:       { nama:'Ganti Ban',                 min:200000, max:350000 },
  lampu:     { nama:'Ganti Lampu',               min:25000,  max:75000  },
  aki:       { nama:'Ganti / Servis Aki',        min:50000,  max:150000 },
  rantai:    { nama:'Servis / Ganti Rantai',     min:40000,  max:120000 },
  mesin:     { nama:'Tune Up Mesin',             min:80000,  max:200000 },
  kelistrikan:{ nama:'Servis Kelistrikan',        min:50000,  max:150000 },
};

const BENGKEL_DEFAULT = [
  { id:'b1', nama:'AHASS Honda Jaya Motor',  tipe:'resmi', alamat:'Jl. Sudirman No. 45, Jakarta Pusat',    jarak:'0.8 km', jam:'08:00–17:00', rating:4.9, telp:'08123456789', spesialis:'Honda Resmi' },
  { id:'b2', nama:'Bengkel Amanah Motor',    tipe:'umum',  alamat:'Jl. Gatot Subroto No. 12, Jakarta Selatan', jarak:'1.4 km', jam:'07:00–19:00', rating:4.5, telp:'08234567890', spesialis:'Semua merk' },
  { id:'b3', nama:'Bengkel Cepat Servis',    tipe:'umum',  alamat:'Jl. Pemuda No. 88, Jakarta Timur',     jarak:'2.1 km', jam:'08:00–20:00', rating:4.3, telp:'08345678901', spesialis:'Matic & bebek' },
  { id:'b4', nama:'Yamaha S1 Motor',         tipe:'resmi', alamat:'Jl. Margonda No. 55, Depok',           jarak:'2.8 km', jam:'08:00–17:00', rating:4.8, telp:'08456789012', spesialis:'Yamaha Resmi' },
  { id:'b5', nama:'Bengkel Motor Makmur',    tipe:'umum',  alamat:'Jl. Raya Bogor No. 200, Jakarta Timur',jarak:'3.2 km', jam:'07:30–18:00', rating:4.2, telp:'08567890123', spesialis:'Semua merk' },
  { id:'b6', nama:'Kawasaki Authorized',     tipe:'resmi', alamat:'Jl. Veteran No. 33, Bekasi',           jarak:'4.5 km', jam:'08:00–17:00', rating:4.7, telp:'08678901234', spesialis:'Kawasaki Resmi' },
];

// ==================== STATE ====================
let currentUser         = null;
let currentChecklistData= {};
let tipIndex            = 0;
let bengkelFilter       = 'all';

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  initFirebase();
  initDefaultData();
  setTodayDate();
  renderChecklistGrid();

  const saved = localStorage.getItem('cma_currentUser');
  if (saved) {
    currentUser = JSON.parse(saved);
    updateUIUser();
    showPage(currentUser.role === 'admin' ? 'adminDashboard' : 'dashboard');
  } else {
    showPage('login');
  }
});

function initDefaultData() {
  if (!localStorage.getItem('cma_bengkel')) localStorage.setItem('cma_bengkel', JSON.stringify(BENGKEL_DEFAULT));
  if (!localStorage.getItem('cma_biaya'))   localStorage.setItem('cma_biaya',   JSON.stringify(ESTIMASI_BIAYA_DEFAULT));
  if (!localStorage.getItem('cma_users')) {
    localStorage.setItem('cma_users', JSON.stringify([{
      id:'u_admin', nama:'Admin', email:ADMIN_EMAIL, password:ADMIN_PASS,
      role:'admin', createdAt: new Date().toLocaleDateString('id-ID'),
    }]));
  }
}

function setTodayDate() {
  const now  = new Date();
  const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
  setEl('dashDate', now.toLocaleDateString('id-ID', opts));

  const ld = document.getElementById('reminderLastDate');
  const nd = document.getElementById('reminderNextDate');
  if (ld) ld.value = now.toISOString().split('T')[0];
  if (nd) {
    const n = new Date(now); n.setMonth(n.getMonth() + 3);
    nd.value = n.toISOString().split('T')[0];
  }
}

// ==================== LOADING OVERLAY ====================
function showLoading(show, text) {
  const el = document.getElementById('loadingOverlay');
  if (!el) return;
  if (show) {
    el.classList.remove('hidden');
    const t = document.getElementById('loadingText');
    if (t) t.textContent = text || 'Memproses...';
  } else {
    el.classList.add('hidden');
  }
}

// ==================== PAGE NAVIGATION ====================
const AUTH_IDS = ['login','register','lupaPassword','adminLogin'];
const NAV_ORDER = ['dashboard','dataMotor','checklistKondisi','hasilAnalisis',
                   'rekomendasiBengkel','pengingatServis','riwayatPengecekan'];

function showPage(pageId) {
  const authWrapper = document.getElementById('authWrapper');
  const appShell   = document.getElementById('appShell');
  const dbBadge    = document.getElementById('dbStatusBadge');

  if (AUTH_IDS.includes(pageId)) {
    // ---- AUTH MODE ----
    authWrapper.classList.remove('hidden');
    appShell.classList.add('hidden');
    if (dbBadge) dbBadge.classList.add('hidden');
    document.querySelectorAll('.auth-screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById('auth-' + pageId);
    if (target) target.classList.add('active');

  } else {
    // ---- APP MODE ----
    authWrapper.classList.add('hidden');
    appShell.classList.remove('hidden');
    if (dbBadge) dbBadge.classList.remove('hidden');

    // Switch content section
    document.querySelectorAll('.app-section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById('sec-' + pageId);
    if (target) target.classList.add('active');

    // Update active nav button
    document.querySelectorAll('#sidebarNav .nav-item').forEach(n => n.classList.remove('active'));
    const idx = NAV_ORDER.indexOf(pageId);
    const navBtns = document.querySelectorAll('#sidebarNav .nav-item');
    if (idx >= 0 && navBtns[idx]) navBtns[idx].classList.add('active');

    // Mobile: close sidebar after nav
    if (window.innerWidth <= 768) {
      document.getElementById('sidebar').classList.remove('mobile-open');
      document.getElementById('sidebarOverlay').classList.add('hidden');
    }

    // Scroll content area to top
    const ca = document.getElementById('contentArea');
    if (ca) ca.scrollTop = 0;

    // Load page data
    switch(pageId) {
      case 'dashboard':          loadDashboard();       break;
      case 'dataMotor':          loadMotorList();       break;
      case 'checklistKondisi':   loadChecklistPage();   break;
      case 'hasilAnalisis':      loadHasilPage();       break;
      case 'rekomendasiBengkel': loadBengkel();         break;
      case 'pengingatServis':    loadReminders();       break;
      case 'riwayatPengecekan':  loadHistory();         break;
      case 'adminDashboard':     loadAdminDashboard();  break;
    }
  }
}

function toggleSidebar() {
  const s = document.getElementById('sidebar');
  const o = document.getElementById('sidebarOverlay');
  s.classList.toggle('mobile-open');
  o.classList.toggle('hidden');
}

// ==================== TOAST ====================
function showToast(msg, type) {
  type = type || 'success';
  const icons = { success:'fas fa-check-circle', error:'fas fa-times-circle', info:'fas fa-info-circle', warning:'fas fa-exclamation-triangle' };
  const t = document.getElementById('toast');
  t.innerHTML = '<i class="' + icons[type] + '"></i> ' + msg;
  t.className = 'toast ' + type + ' show';
  setTimeout(() => t.classList.remove('show'), 3500);
}

// ==================== AUTH UTILS ====================
function togglePassword(id) {
  const inp = document.getElementById(id);
  inp.type = inp.type === 'password' ? 'text' : 'password';
}
function getLocalUsers() { return JSON.parse(localStorage.getItem('cma_users') || '[]'); }
function saveLocalUsers(u) { localStorage.setItem('cma_users', JSON.stringify(u)); }

// ==================== LOGIN ====================
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPassword').value;
  if (!email || !pass) { showToast('Email dan password wajib diisi!', 'error'); return; }

  // Admin bypass (always local)
  if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
    currentUser = { id:'admin', nama:'Admin', email, role:'admin' };
    localStorage.setItem('cma_currentUser', JSON.stringify(currentUser));
    updateUIUser();
    showToast('Selamat datang, Admin!');
    showPage('adminDashboard');
    return;
  }

  if (USE_FIREBASE) {
    // Firebase Auth login
    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
    showLoading(true, 'Login ke akun Anda...');
    try {
      const cred    = await fbAuth.signInWithEmailAndPassword(email, pass);
      const uid     = cred.user.uid;
      const userSnap = await fbDB.ref('users/' + uid).get();
      currentUser = userSnap.exists()
        ? { id:uid, ...userSnap.val() }
        : { id:uid, nama:email.split('@')[0], email, role:'user' };
      localStorage.setItem('cma_currentUser', JSON.stringify(currentUser));
      await syncFromFirebase();
      updateUIUser();
      showToast('Selamat datang, ' + currentUser.nama + '!');
      showPage('dashboard');
    } catch(err) {
      const msg = {
        'auth/user-not-found':    'Akun tidak ditemukan!',
        'auth/wrong-password':    'Password salah!',
        'auth/invalid-email':     'Format email tidak valid!',
        'auth/invalid-credential':'Email atau password salah!',
        'auth/too-many-requests': 'Terlalu banyak percobaan, coba lagi nanti!',
      };
      showToast(msg[err.code] || 'Login gagal: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Masuk';
      showLoading(false);
    }
  } else {
    // localStorage fallback
    const users = getLocalUsers();
    const user  = users.find(u => (u.email === email || u.nama === email) && u.password === pass);
    if (!user) { showToast('Email atau password salah!', 'error'); return; }
    currentUser = user;
    localStorage.setItem('cma_currentUser', JSON.stringify(currentUser));
    updateUIUser();
    showToast('Selamat datang, ' + user.nama + '!');
    showPage('dashboard');
  }
}

// ==================== REGISTER ====================
async function handleRegister(e) {
  e.preventDefault();
  const nama    = document.getElementById('regName').value.trim();
  const email   = document.getElementById('regEmail').value.trim();
  const pass    = document.getElementById('regPassword').value;
  const confirm = document.getElementById('regConfirm').value;
  const agree   = document.getElementById('regAgree').checked;

  if (!nama || !email || !pass || !confirm) { showToast('Semua field wajib diisi!', 'error'); return; }
  if (pass.length < 6)    { showToast('Password minimal 6 karakter!', 'error'); return; }
  if (pass !== confirm)   { showToast('Password dan konfirmasi tidak sama!', 'error'); return; }
  if (!agree)             { showToast('Setujui syarat & ketentuan terlebih dahulu!', 'error'); return; }

  if (USE_FIREBASE) {
    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mendaftar...';
    showLoading(true, 'Membuat akun Anda...');
    try {
      const cred = await fbAuth.createUserWithEmailAndPassword(email, pass);
      const uid  = cred.user.uid;
      const userData = { nama, email, role:'user', createdAt: new Date().toLocaleDateString('id-ID') };
      await fbDB.ref('users/' + uid).set(userData);
      // Simpan juga ke localStorage users list untuk admin panel
      const localUsers = getLocalUsers();
      localUsers.push({ id:uid, ...userData, password:'' });
      saveLocalUsers(localUsers);
      showToast('Pendaftaran berhasil! Silakan login.', 'success');
      document.getElementById('registerForm').reset();
      setTimeout(() => showPage('login'), 1200);
    } catch(err) {
      const msg = {
        'auth/email-already-in-use':'Email sudah terdaftar!',
        'auth/weak-password':       'Password terlalu lemah (min. 6 karakter)!',
        'auth/invalid-email':       'Format email tidak valid!',
      };
      showToast(msg[err.code] || 'Pendaftaran gagal: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-user-plus"></i> Daftar Sekarang';
      showLoading(false);
    }
  } else {
    // localStorage fallback
    const users = getLocalUsers();
    if (users.find(u => u.email === email)) { showToast('Email sudah terdaftar!', 'error'); return; }
    users.push({ id:'u_'+Date.now(), nama, email, password:pass, role:'user', createdAt: new Date().toLocaleDateString('id-ID') });
    saveLocalUsers(users);
    showToast('Pendaftaran berhasil! Silakan login.', 'success');
    document.getElementById('registerForm').reset();
    setTimeout(() => showPage('login'), 1200);
  }
}

// ==================== FORGOT PASSWORD ====================
async function handleForgotPassword(e) {
  e.preventDefault();
  const email = document.getElementById('forgotEmail').value.trim();
  if (USE_FIREBASE) {
    try {
      await fbAuth.sendPasswordResetEmail(email);
      showToast('Email reset password telah dikirim!', 'success');
    } catch(err) {
      showToast('Email tidak terdaftar!', 'error'); return;
    }
  } else {
    const users = getLocalUsers();
    if (!users.find(u => u.email === email)) { showToast('Email tidak ditemukan!', 'error'); return; }
    showToast('Link reset password telah dikirim ke email Anda!', 'info');
  }
  setTimeout(() => showPage('login'), 2000);
}

// ==================== ADMIN LOGIN ====================
function handleAdminLogin(e) {
  e.preventDefault();
  const email = document.getElementById('adminEmail').value;
  const pass  = document.getElementById('adminPassword').value;
  if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
    currentUser = { id:'admin', nama:'Admin', email, role:'admin' };
    localStorage.setItem('cma_currentUser', JSON.stringify(currentUser));
    updateUIUser();
    showToast('Login admin berhasil!');
    showPage('adminDashboard');
  } else {
    showToast('Kredensial admin salah!', 'error');
  }
}

// ==================== LOGOUT ====================
async function logout() {
  if (!confirm('Apakah Anda yakin ingin keluar?')) return;
  if (USE_FIREBASE && fbAuth.currentUser) {
    try { await fbAuth.signOut(); } catch(e) {}
  }
  currentUser = null;
  localStorage.removeItem('cma_currentUser');
  showToast('Anda telah logout.', 'info');
  showPage('login');
}

function adminLogout() { logout(); }

function updateUIUser() {
  if (!currentUser) return;
  const init = currentUser.nama.charAt(0).toUpperCase();
  setEl('sidebarUsername', currentUser.nama);
  setEl('sidebarRole', currentUser.role === 'admin' ? 'Administrator' : 'Pengguna');
  const sAv = document.getElementById('sidebarAvatar');
  const tAv = document.getElementById('topbarAvatar');
  if (sAv) sAv.textContent = init;
  if (tAv) tAv.textContent = init;
}

// ==================== FIREBASE REALTIME DATABASE SYNC ====================
// Struktur DB: /motors/{uid}/{motorId}, /history/{uid}/{histId}, /reminders/{uid}/{remId}

async function syncFromFirebase() {
  if (!USE_FIREBASE || !currentUser || currentUser.id === 'admin') return;
  try {
    showLoading(true, 'Mengambil data dari cloud...');
    const uid = currentUser.id;

    // Sync motors
    const mSnap = await fbDB.ref('motors/' + uid).get();
    if (mSnap.exists()) {
      const motors = Object.values(mSnap.val());
      localStorage.setItem('cma_motors_' + uid, JSON.stringify(motors));
    }

    // Sync history (urutkan dari terbaru)
    const hSnap = await fbDB.ref('history/' + uid).get();
    if (hSnap.exists()) {
      const history = Object.values(hSnap.val())
        .sort((a, b) => new Date(b.tanggalISO) - new Date(a.tanggalISO));
      localStorage.setItem('cma_history_' + uid, JSON.stringify(history));
    }

    // Sync reminders
    const rSnap = await fbDB.ref('reminders/' + uid).get();
    if (rSnap.exists()) {
      const reminders = Object.values(rSnap.val());
      localStorage.setItem('cma_reminders_' + uid, JSON.stringify(reminders));
    }

    console.log('✅ Data synced from Firebase Realtime DB');
  } catch(e) {
    console.warn('Sync gagal:', e);
  } finally {
    showLoading(false);
  }
}

async function pushMotorsToFirebase(motors) {
  if (!USE_FIREBASE || !currentUser || currentUser.id === 'admin') return;
  try {
    const uid = currentUser.id;
    const obj = {};
    motors.forEach(m => { obj[m.id] = m; });
    await fbDB.ref('motors/' + uid).set(obj);
  } catch(e) { console.warn('Motor sync:', e); }
}

async function pushHistoryItemToFirebase(item) {
  if (!USE_FIREBASE || !currentUser || currentUser.id === 'admin') return;
  try {
    await fbDB.ref('history/' + currentUser.id + '/' + item.id).set(item);
  } catch(e) { console.warn('History sync:', e); }
}

async function deleteHistoryItemFirebase(id) {
  if (!USE_FIREBASE || !currentUser || currentUser.id === 'admin') return;
  try {
    await fbDB.ref('history/' + currentUser.id + '/' + id).remove();
  } catch(e) {}
}

async function pushRemindersToFirebase(reminders) {
  if (!USE_FIREBASE || !currentUser || currentUser.id === 'admin') return;
  try {
    const uid = currentUser.id;
    const obj = {};
    reminders.forEach(r => { obj[r.id] = r; });
    await fbDB.ref('reminders/' + uid).set(obj);
  } catch(e) { console.warn('Reminders sync:', e); }
}

// ==================== DASHBOARD ====================
function loadDashboard() {
  updateUIUser();
  if (currentUser) setEl('dashGreeting', 'Halo, ' + currentUser.nama + '! 👋');

  const motors    = getMotors();
  const history   = getHistory();
  const reminders = getReminders();

  setEl('statMotorCount',    motors.length);
  setEl('statCheckCount',    history.length);
  setEl('statReminderCount', reminders.length);

  const upcoming = reminders
    .filter(r => new Date(r.nextDate) >= new Date())
    .sort((a,b) => new Date(a.nextDate) - new Date(b.nextDate));
  if (upcoming.length) {
    const d = new Date(upcoming[0].nextDate);
    setEl('statNextService', d.toLocaleDateString('id-ID', { day:'numeric', month:'short' }));
  } else setEl('statNextService', '-');

  // Last motor status
  const statusEl = document.getElementById('lastMotorStatus');
  if (motors.length === 0) {
    statusEl.innerHTML = '<div class="empty-state"><i class="fas fa-motorcycle fa-3x"></i><p>Belum ada data motor. <a href="#" onclick="showPage(\'dataMotor\')">Tambah motor sekarang</a></p></div>';
  } else {
    const m         = motors[motors.length - 1];
    const lastCheck = history.filter(h => h.motorId === m.id).slice(-1)[0];
    const cls  = lastCheck ? (lastCheck.status === 'Kondisi Baik' ? 'status-good' : 'status-danger') : 'status-warning';
    const txt  = lastCheck ? lastCheck.status : 'Belum dicek';
    const icon = lastCheck ? (lastCheck.status === 'Kondisi Baik' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle') : 'fas fa-question-circle';
    statusEl.innerHTML = '<div class="status-card-inner"><div class="status-motor-info">' +
      '<div class="status-motor-name">' + m.merek + ' ' + m.tipe + ' ' + m.tahun + '</div>' +
      '<div class="status-motor-detail"><i class="fas fa-id-card"></i> ' + m.nopol +
      ' &nbsp;|&nbsp; <i class="fas fa-road"></i> ' + Number(m.km).toLocaleString('id-ID') + ' km</div></div>' +
      '<div class="status-badge ' + cls + '"><i class="' + icon + '"></i> ' + txt + '</div>' +
      '<button class="btn btn-primary btn-sm" onclick="showPage(\'checklistKondisi\')"><i class="fas fa-clipboard-check"></i> Cek Sekarang</button></div>';
  }

  // Notif badge
  const overdue = reminders.filter(r => new Date(r.nextDate) < new Date());
  setEl('notifBadge', overdue.length || '0');
}

// ==================== DATA MOTOR ====================
function getMotors() {
  return JSON.parse(localStorage.getItem('cma_motors_' + (currentUser?.id)) || '[]');
}
function saveMotors(motors) {
  localStorage.setItem('cma_motors_' + currentUser?.id, JSON.stringify(motors));
  pushMotorsToFirebase(motors); // fire-and-forget
}

function saveMotorData(e) {
  e.preventDefault();
  const merek   = document.getElementById('motorMerek').value;
  const tipe    = document.getElementById('motorTipe').value.trim();
  const tahun   = document.getElementById('motorTahun').value;
  const nopol   = document.getElementById('motorNopol').value.trim().toUpperCase();
  const km      = document.getElementById('motorKm').value;
  const warna   = document.getElementById('motorWarna').value.trim();
  const catatan = document.getElementById('motorCatatan').value.trim();

  if (!merek || !tipe || !tahun || !nopol || !km) { showToast('Semua field wajib diisi!', 'error'); return; }

  const motors   = getMotors();
  const existing = motors.findIndex(m => m.nopol === nopol);
  const data = { id: existing >= 0 ? motors[existing].id : 'motor_'+Date.now(), merek, tipe, tahun, nopol, km, warna, catatan, savedAt: new Date().toLocaleDateString('id-ID') };

  if (existing >= 0) { motors[existing] = data; showToast('Data motor berhasil diperbarui!'); }
  else               { motors.push(data); showToast('Data motor berhasil disimpan!'); }

  saveMotors(motors);
  document.getElementById('motorForm').reset();
  loadMotorList();
}

function resetMotorForm() { document.getElementById('motorForm').reset(); }

function loadMotorList() {
  const motors = getMotors();
  const c = document.getElementById('motorList');
  if (!c) return;
  if (motors.length === 0) {
    c.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-motorcycle fa-3x"></i><p>Belum ada data motor tersimpan.</p></div>'; return;
  }
  c.innerHTML = motors.map(m => '<div class="motor-card">' +
    '<div class="motor-card-header"><i class="fas fa-motorcycle motor-card-icon"></i>' +
    '<div><div class="motor-card-name">' + m.merek + ' ' + m.tipe + '</div>' +
    '<div class="motor-card-nopol">' + m.nopol + '</div></div></div>' +
    '<div class="motor-card-body">' +
    '<div class="motor-detail-row"><span>Tahun</span><span>' + m.tahun + '</span></div>' +
    '<div class="motor-detail-row"><span>Kilometer</span><span>' + Number(m.km).toLocaleString('id-ID') + ' km</span></div>' +
    '<div class="motor-detail-row"><span>Warna</span><span>' + (m.warna||'-') + '</span></div>' +
    '<div class="motor-detail-row"><span>Disimpan</span><span>' + m.savedAt + '</span></div>' +
    (m.catatan ? '<div class="motor-detail-row"><span>Catatan</span><span style="max-width:180px;text-align:right;font-size:0.8rem">' + m.catatan + '</span></div>' : '') +
    '</div><div class="motor-card-footer">' +
    '<button class="btn btn-outline btn-sm" onclick="editMotor(\'' + m.id + '\')"><i class="fas fa-edit"></i> Edit</button>' +
    '<button class="btn btn-primary btn-sm" onclick="checkMotor(\'' + m.id + '\')"><i class="fas fa-search"></i> Cek</button>' +
    '<button class="btn btn-danger btn-sm" onclick="deleteMotor(\'' + m.id + '\')"><i class="fas fa-trash"></i></button>' +
    '</div></div>').join('');
}

function editMotor(id) {
  const m = getMotors().find(x => x.id === id); if (!m) return;
  document.getElementById('motorMerek').value   = m.merek;
  document.getElementById('motorTipe').value    = m.tipe;
  document.getElementById('motorTahun').value   = m.tahun;
  document.getElementById('motorNopol').value   = m.nopol;
  document.getElementById('motorKm').value      = m.km;
  document.getElementById('motorWarna').value   = m.warna || '';
  document.getElementById('motorCatatan').value = m.catatan || '';
  window.scrollTo({ top:0, behavior:'smooth' });
  showToast('Data motor dimuat untuk diedit.', 'info');
}

function checkMotor(id) {
  showPage('checklistKondisi');
  setTimeout(() => { const s = document.getElementById('checkMotorSelect'); if(s) s.value = id; }, 200);
}

function deleteMotor(id) {
  if (!confirm('Hapus data motor ini?')) return;
  saveMotors(getMotors().filter(m => m.id !== id));
  saveHistory(getHistory().filter(h => h.motorId !== id));
  showToast('Data motor berhasil dihapus.', 'info');
  loadMotorList();
}

// ==================== CHECKLIST ====================
function renderChecklistGrid() {
  const g = document.getElementById('checklistGrid'); if (!g) return;
  g.innerHTML = CHECKLIST_KOMPONEN.map(k =>
    '<div class="checklist-item" id="item_' + k.id + '">' +
    '<div class="checklist-item-header">' +
    '<div class="checklist-item-icon"><i class="' + k.icon + '"></i></div>' +
    '<div><div class="checklist-item-name">' + k.name + '</div>' +
    '<div class="checklist-item-desc">' + k.desc + '</div></div></div>' +
    '<div class="condition-buttons">' +
    '<button class="cond-btn good"    onclick="setCondition(\'' + k.id + '\',\'Baik\',this)"><i class="fas fa-check"></i> Baik</button>' +
    '<button class="cond-btn check"   onclick="setCondition(\'' + k.id + '\',\'Perlu Dicek\',this)"><i class="fas fa-exclamation"></i> Perlu Dicek</button>' +
    '<button class="cond-btn broken"  onclick="setCondition(\'' + k.id + '\',\'Rusak\',this)"><i class="fas fa-times"></i> Rusak</button>' +
    '</div></div>'
  ).join('');
}

function loadChecklistPage() {
  populateMotorSelects();
}

function populateMotorSelects() {
  const motors = getMotors();
  const opts   = '<option value="">-- Pilih Motor --</option>' +
    motors.map(m => '<option value="' + m.id + '">' + m.merek + ' ' + m.tipe + ' - ' + m.nopol + '</option>').join('');
  const ids = ['checkMotorSelect','reminderMotor'];
  ids.forEach(id => { const s = document.getElementById(id); if(s) s.innerHTML = opts; });
}

function setCondition(id, val, btn) {
  currentChecklistData[id] = val;
  const p = btn.closest('.condition-buttons');
  p.querySelectorAll('.cond-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  const item = document.getElementById('item_' + id);
  item.style.borderColor = val === 'Baik' ? 'var(--green)' : val === 'Rusak' ? 'var(--red)' : 'var(--yellow)';
}

function resetChecklist() {
  currentChecklistData = {};
  renderChecklistGrid();
  const ids = ['checkMotorSelect','checkKm','checkCatatan'];
  ids.forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
  showToast('Checklist direset.', 'info');
}

function analyzeCondition() {
  const motorId = document.getElementById('checkMotorSelect').value;
  const km      = document.getElementById('checkKm').value;
  const catatan = document.getElementById('checkCatatan').value;

  if (!motorId) { showToast('Pilih motor terlebih dahulu!', 'error'); return; }

  const unchecked = CHECKLIST_KOMPONEN.filter(k => !currentChecklistData[k.id]);
  if (unchecked.length) { showToast('Pilih kondisi untuk: ' + unchecked.map(k => k.name).join(', ') + '!', 'error'); return; }

  const motor      = getMotors().find(m => m.id === motorId);
  const baik       = Object.values(currentChecklistData).filter(v => v === 'Baik').length;
  const perluDicek = Object.values(currentChecklistData).filter(v => v === 'Perlu Dicek').length;
  const rusak      = Object.values(currentChecklistData).filter(v => v === 'Rusak').length;
  const score      = Math.round((baik / CHECKLIST_KOMPONEN.length) * 100);

  const data = {
    motorId, motorName: motor.merek + ' ' + motor.tipe + ' ' + motor.tahun,
    motorNopol: motor.nopol, km: km || motor.km,
    checklist: { ...currentChecklistData }, catatan,
    baik, perluDicek, rusak, score,
    tanggal:    new Date().toLocaleDateString('id-ID'),
    tanggalISO: new Date().toISOString(),
    status: rusak > 0 ? 'Perlu Servis Segera' : perluDicek > 0 ? 'Perlu Perhatian' : 'Kondisi Baik',
  };
  localStorage.setItem('cma_lastAnalysis', JSON.stringify(data));

  const bermasalah = CHECKLIST_KOMPONEN.filter(k => currentChecklistData[k.id] !== 'Baik').map(k => k.name);
  const histItem   = { id:'h_'+Date.now(), motorId, motorName:data.motorName, km:data.km, tanggal:data.tanggal, tanggalISO:data.tanggalISO, status:data.status, bermasalah, score, checklist: { ...currentChecklistData }, catatan };
  const history    = getHistory();
  history.unshift(histItem);
  saveHistory(history);
  pushHistoryItemToFirebase(histItem); // fire-and-forget

  showToast('Analisis selesai!', 'success');
  showPage('hasilAnalisis');
}

// ==================== HASIL ANALISIS ====================
function loadHasilPage() {
  const data = JSON.parse(localStorage.getItem('cma_lastAnalysis'));
  const c    = document.getElementById('hasilContent');
  if (!c) return;

  if (!data) {
    c.innerHTML = '<div class="empty-state-center"><i class="fas fa-chart-bar fa-3x"></i><h3>Belum Ada Hasil Analisis</h3><p>Lakukan pengecekan kondisi motor terlebih dahulu</p><button class="btn btn-primary" onclick="showPage(\'checklistKondisi\')"><i class="fas fa-clipboard-check"></i> Mulai Pengecekan</button></div>';
    return;
  }

  const biaya        = JSON.parse(localStorage.getItem('cma_biaya') || '{}');
  const bannerClass  = data.rusak > 0 ? 'hasil-servis' : data.perluDicek > 0 ? 'hasil-perhatian' : 'hasil-baik';
  const bannerIcon   = data.rusak > 0 ? 'fas fa-exclamation-triangle' : data.perluDicek > 0 ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
  const bannerTitle  = data.rusak > 0 ? 'Motor Perlu Servis Segera' : data.perluDicek > 0 ? 'Motor Perlu Perhatian' : 'Motor dalam Kondisi Baik';
  const bannerSub    = data.rusak > 0 ? data.rusak + ' komponen rusak. Segera bawa ke bengkel!' : data.perluDicek > 0 ? data.perluDicek + ' komponen perlu pemeriksaan lebih lanjut.' : 'Semua komponen prima. Tetap jaga perawatan rutin!';
  const progColor    = data.score >= 75 ? 'progress-green' : data.score >= 50 ? 'progress-orange' : 'progress-red';

  const komponenHtml = CHECKLIST_KOMPONEN.map(k => {
    const kondisi = data.checklist[k.id] || '-';
    const cls = kondisi === 'Baik' ? 'komponen-baik' : kondisi === 'Perlu Dicek' ? 'komponen-check' : 'komponen-rusak';
    return '<div class="komponen-item"><div class="komponen-icon"><i class="' + k.icon + '"></i></div>' +
           '<div class="komponen-name">' + k.name + '</div>' +
           '<div class="komponen-status ' + cls + '">' + kondisi + '</div></div>';
  }).join('');

  const bermasalah = CHECKLIST_KOMPONEN.filter(k => data.checklist[k.id] !== 'Baik');
  let totalMin = 0, totalMax = 0;
  const biayaHtml = bermasalah.length
    ? bermasalah.map(k => {
        const b  = biaya[k.id]; if (!b) return '';
        const pr = data.checklist[k.id] === 'Rusak' ? 'priority-high' : 'priority-medium';
        const pt = data.checklist[k.id] === 'Rusak' ? 'Prioritas Tinggi' : 'Sedang';
        totalMin += b.min; totalMax += b.max;
        return '<div class="biaya-item"><div><i class="' + k.icon + '" style="color:var(--blue);margin-right:8px"></i><span class="biaya-name">' + b.nama + '</span></div>' +
               '<div style="display:flex;align-items:center;gap:12px"><span class="biaya-range">Rp ' + b.min.toLocaleString('id-ID') + ' – Rp ' + b.max.toLocaleString('id-ID') + '</span>' +
               '<span class="biaya-priority ' + pr + '">' + pt + '</span></div></div>';
      }).join('')
    : '<p style="color:var(--gray-500);font-size:0.88rem;padding:12px 0">Tidak ada komponen yang memerlukan biaya servis.</p>';

  const rekItems = bermasalah.length === 0
    ? ['Lanjutkan perawatan rutin motor Anda.','Ganti oli sesuai jadwal untuk menjaga performa mesin.','Pantau tekanan ban secara berkala.']
    : bermasalah.map(k => ({
        oli:'Segera ganti oli mesin untuk mencegah kerusakan lebih lanjut.',
        rem:'Cek dan ganti kampas rem jika sudah tipis. Demi keselamatan!',
        ban:'Periksa tekanan dan keausan ban. Ban aus sangat berbahaya saat hujan.',
        lampu:'Ganti bohlam lampu yang mati untuk visibilitas berkendara malam.',
        aki:'Cek tegangan aki. Aki lemah menyebabkan motor susah starter.',
        rantai:'Lumasi dan kencangkan rantai sesuai spesifikasi pabrikan.',
        mesin:'Lakukan tune up menyeluruh agar performa mesin tetap optimal.',
        kelistrikan:'Cek koneksi kabel dan sekring. Korsleting listrik sangat berbahaya.',
      }[k.id] || 'Periksa komponen ' + k.name + ' di bengkel terdekat.'));

  const rekHtml = rekItems.map(r =>
    '<div class="rekomendasi-item"><i class="fas fa-lightbulb"></i><span class="rekomendasi-text">' + r + '</span></div>'
  ).join('');

  c.innerHTML =
    '<div class="hasil-status-banner ' + bannerClass + '">' +
    '<div class="hasil-icon"><i class="' + bannerIcon + '"></i></div>' +
    '<div><div class="hasil-title">' + bannerTitle + '</div><div class="hasil-subtitle">' + bannerSub + '</div>' +
    '<div style="margin-top:8px;font-size:0.82rem;opacity:0.8"><i class="fas fa-motorcycle"></i> ' + data.motorName +
    ' &nbsp;|&nbsp; <i class="fas fa-road"></i> ' + Number(data.km).toLocaleString('id-ID') + ' km' +
    ' &nbsp;|&nbsp; <i class="fas fa-calendar"></i> ' + data.tanggal + '</div></div>' +
    '<div class="hasil-score"><div class="hasil-score-num">' + data.score + '%</div><div class="hasil-score-label">Skor Kondisi</div>' +
    '<div class="progress-bar-wrap" style="width:100px;margin-top:6px"><div class="progress-bar ' + progColor + '" style="width:' + data.score + '%"></div></div></div></div>' +

    '<div class="card"><div class="card-header"><i class="fas fa-list-check"></i> Ringkasan Komponen</div><div class="card-body">' +
    '<div style="display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap">' +
    '<div style="background:var(--green-light);padding:10px 20px;border-radius:var(--radius-sm);text-align:center"><div style="font-size:1.5rem;font-weight:800;color:var(--green)">' + data.baik + '</div><div style="font-size:0.78rem;color:var(--green)">Baik</div></div>' +
    '<div style="background:var(--orange-light);padding:10px 20px;border-radius:var(--radius-sm);text-align:center"><div style="font-size:1.5rem;font-weight:800;color:var(--orange)">' + data.perluDicek + '</div><div style="font-size:0.78rem;color:var(--orange)">Perlu Dicek</div></div>' +
    '<div style="background:var(--red-light);padding:10px 20px;border-radius:var(--radius-sm);text-align:center"><div style="font-size:1.5rem;font-weight:800;color:var(--red)">' + data.rusak + '</div><div style="font-size:0.78rem;color:var(--red)">Rusak</div></div></div>' +
    '<div class="komponen-grid">' + komponenHtml + '</div>' +
    (data.catatan ? '<div style="margin-top:12px;background:var(--gray-50);border-radius:var(--radius-sm);padding:12px 16px;border:1px solid var(--border)"><strong style="font-size:0.85rem"><i class="fas fa-sticky-note" style="color:var(--blue)"></i> Catatan:</strong><p style="font-size:0.85rem;color:var(--gray-600);margin-top:4px">' + data.catatan + '</p></div>' : '') +
    '</div></div>' +

    (bermasalah.length > 0 ?
    '<div class="card"><div class="card-header"><i class="fas fa-money-bill-wave"></i> Estimasi Biaya Servis</div><div class="card-body">' +
    '<div class="biaya-list">' + biayaHtml + '</div>' +
    (totalMin > 0 ? '<div style="margin-top:16px;background:var(--blue-light);border:1px solid #90caf9;border-radius:var(--radius-sm);padding:14px 18px;display:flex;justify-content:space-between;align-items:center"><strong style="color:var(--blue-dark);font-size:0.9rem"><i class="fas fa-calculator"></i> Total Estimasi</strong><strong style="color:var(--blue);font-size:1.05rem">Rp ' + totalMin.toLocaleString('id-ID') + ' – Rp ' + totalMax.toLocaleString('id-ID') + '</strong></div>' : '') +
    '</div></div>' : '') +

    '<div class="card"><div class="card-header"><i class="fas fa-lightbulb"></i> Rekomendasi Tindakan</div>' +
    '<div class="card-body"><div class="rekomendasi-list">' + rekHtml + '</div></div></div>' +

    '<div class="hasil-actions">' +
    '<button class="btn btn-outline" onclick="showPage(\'checklistKondisi\')"><i class="fas fa-redo"></i> Cek Ulang</button>' +
    '<button class="btn btn-outline" onclick="showPage(\'riwayatPengecekan\')"><i class="fas fa-history"></i> Lihat Riwayat</button>' +
    '<button class="btn btn-primary" onclick="showPage(\'rekomendasiBengkel\')"><i class="fas fa-wrench"></i> Lihat Bengkel Terdekat</button>' +
    '</div>';
}

// ==================== BENGKEL ====================
function loadBengkel() {
  renderBengkel();
}

function renderBengkel() {
  const all    = JSON.parse(localStorage.getItem('cma_bengkel') || '[]');
  const search = (document.getElementById('bengkelSearch')?.value || '').toLowerCase();
  const list   = all.filter(b => {
    const matchSearch = !search || b.nama.toLowerCase().includes(search) || b.alamat.toLowerCase().includes(search);
    const matchType   = bengkelFilter === 'all' || b.tipe === bengkelFilter;
    return matchSearch && matchType;
  });

  const g = document.getElementById('bengkelGrid'); if (!g) return;
  if (!list.length) { g.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-search fa-3x"></i><p>Bengkel tidak ditemukan.</p></div>'; return; }

  g.innerHTML = list.map(b => {
    const stars = '★'.repeat(Math.floor(b.rating)) + (b.rating % 1 >= 0.5 ? '½' : '');
    return '<div class="bengkel-card">' +
      '<div class="bengkel-card-header"><div class="bengkel-type-badge">' + (b.tipe==='resmi'?'Bengkel Resmi':'Bengkel Umum') + '</div>' +
      '<div class="bengkel-name">' + b.nama + '</div></div>' +
      '<div class="bengkel-card-body">' +
      '<div class="bengkel-info-row"><i class="fas fa-map-marker-alt"></i><span>' + b.alamat + '</span></div>' +
      '<div class="bengkel-info-row"><i class="fas fa-route"></i><span>' + b.jarak + ' dari lokasi Anda</span></div>' +
      '<div class="bengkel-info-row"><i class="fas fa-clock"></i><span>Buka: ' + b.jam + '</span></div>' +
      '<div class="bengkel-info-row"><i class="fas fa-star"></i><div class="bengkel-rating"><span class="stars">' + stars + '</span><span class="rating-num">' + b.rating + '</span><span style="color:var(--gray-400);font-size:0.8rem">/5.0</span></div></div>' +
      (b.spesialis ? '<div class="bengkel-info-row"><i class="fas fa-tools"></i><span>' + b.spesialis + '</span></div>' : '') +
      '</div><div class="bengkel-card-footer">' +
      '<button class="btn btn-outline btn-sm" onclick="bukaMap(\'' + b.nama + '\')"><i class="fas fa-map"></i> Peta</button>' +
      '<button class="btn btn-primary btn-sm" onclick="hubungiBengkel(\'' + b.telp + '\',\'' + b.nama + '\')"><i class="fas fa-phone"></i> Hubungi</button>' +
      '</div></div>';
  }).join('');
}

function filterBengkel() { renderBengkel(); }
function filterByType(type, btn) {
  bengkelFilter = type;
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderBengkel();
}
function bukaMap(nama) { alert('🗺️ Membuka Google Maps untuk:\n"' + nama + '"\n\n(Terhubung ke Google Maps di versi produksi)'); }
function hubungiBengkel(telp, nama) { if (confirm('Hubungi ' + nama + ' via WhatsApp?\nNomor: ' + telp)) showToast('Menghubungi ' + nama + '...', 'info'); }

// ==================== PENGINGAT ====================
function getReminders() { return JSON.parse(localStorage.getItem('cma_reminders_' + currentUser?.id) || '[]'); }
function saveReminders(r) {
  localStorage.setItem('cma_reminders_' + currentUser?.id, JSON.stringify(r));
  pushRemindersToFirebase(r);
}

function saveReminder(e) {
  e.preventDefault();
  const motorId  = document.getElementById('reminderMotor').value;
  const jenis    = document.getElementById('reminderJenis').value;
  const lastDate = document.getElementById('reminderLastDate').value;
  const lastKm   = document.getElementById('reminderLastKm').value;
  const nextDate = document.getElementById('reminderNextDate').value;
  const nextKm   = document.getElementById('reminderNextKm').value;
  const note     = document.getElementById('reminderNote').value;

  if (!jenis || !nextDate) { showToast('Jenis pengingat dan tanggal berikutnya wajib diisi!', 'error'); return; }

  const motor = getMotors().find(m => m.id === motorId);
  const r     = getReminders();
  r.unshift({ id:'r_'+Date.now(), motorId, motorName: motor ? motor.merek+' '+motor.tipe+' - '+motor.nopol : 'Motor tidak dipilih', jenis, lastDate, lastKm, nextDate, nextKm, note, createdAt: new Date().toLocaleDateString('id-ID') });
  saveReminders(r);
  document.getElementById('reminderForm').reset();
  setTodayDate();
  showToast('Pengingat servis berhasil disimpan!', 'success');
  loadReminders();
}

function loadReminders() {
  populateMotorSelects();
  const reminders = getReminders();
  const c         = document.getElementById('reminderList'); if (!c) return;

  if (!reminders.length) { c.innerHTML = '<div class="empty-state"><i class="fas fa-bell-slash fa-3x"></i><p>Belum ada pengingat servis.</p></div>'; return; }

  const now = new Date();
  c.innerHTML = reminders.map(r => {
    const diff = Math.ceil((new Date(r.nextDate) - now) / 86400000);
    const [sCls, sTxt, cCls] = diff < 0
      ? ['status-overdue','Terlambat '+Math.abs(diff)+' hari','reminder-overdue']
      : diff <= 7
      ? ['status-soon',diff+' hari lagi','reminder-soon']
      : ['status-ok',diff+' hari lagi','reminder-ok'];
    const iconMap = { 'Ganti Oli':'fas fa-oil-can','Servis Rutin':'fas fa-wrench','Cek Rem':'fas fa-circle-stop','Cek Ban':'fas fa-circle','Ganti Aki':'fas fa-car-battery','Servis Besar':'fas fa-tools' };
    const icon = iconMap[r.jenis] || 'fas fa-bell';
    return '<div class="reminder-card ' + cCls + '">' +
      '<div class="reminder-icon-wrap"><i class="' + icon + '"></i></div>' +
      '<div class="reminder-info"><div class="reminder-jenis">' + r.jenis + '</div>' +
      '<div class="reminder-motor"><i class="fas fa-motorcycle"></i> ' + r.motorName + '</div>' +
      '<div class="reminder-detail">Jadwal: <strong>' + new Date(r.nextDate).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}) + '</strong>' +
      (r.nextKm ? ' &nbsp;|&nbsp; Target: <strong>' + Number(r.nextKm).toLocaleString('id-ID') + ' km</strong>' : '') +
      (r.note ? '<br><i class="fas fa-sticky-note"></i> ' + r.note : '') + '</div></div>' +
      '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">' +
      '<span class="reminder-status ' + sCls + '">' + sTxt + '</span>' +
      '<button class="btn btn-danger btn-xs" onclick="deleteReminder(\'' + r.id + '\')"><i class="fas fa-trash"></i></button></div></div>';
  }).join('');

  const overdue = reminders.filter(r => new Date(r.nextDate) < now);
  setEl('notifBadge', overdue.length || '0');
}

function deleteReminder(id) {
  if (!confirm('Hapus pengingat ini?')) return;
  saveReminders(getReminders().filter(r => r.id !== id));
  showToast('Pengingat dihapus.', 'info');
  loadReminders();
}

// ==================== RIWAYAT ====================
function getHistory() { return JSON.parse(localStorage.getItem('cma_history_' + currentUser?.id) || '[]'); }
function saveHistory(h) { localStorage.setItem('cma_history_' + currentUser?.id, JSON.stringify(h)); }

function loadHistory() {
  const history = getHistory();
  const tbody   = document.getElementById('historyBody');
  const empty   = document.getElementById('historyEmpty');
  const table   = document.getElementById('historyTable');
  if (!tbody) return;

  if (!history.length) {
    tbody.innerHTML = '';
    empty?.classList.remove('hidden');
    if (table) table.style.display = 'none';
    return;
  }
  empty?.classList.add('hidden');
  if (table) table.style.display = '';

  tbody.innerHTML = history.map((h, i) => {
    const bc  = h.status === 'Kondisi Baik' ? 'badge-green' : h.status === 'Perlu Perhatian' ? 'badge-orange' : 'badge-red';
    const bmt = h.bermasalah?.length ? h.bermasalah.slice(0,3).join(', ') + (h.bermasalah.length>3?'...':'') : 'Tidak ada';
    return '<tr><td>' + (i+1) + '</td><td>' + h.tanggal + '</td><td><strong>' + h.motorName + '</strong></td>' +
      '<td>' + Number(h.km).toLocaleString('id-ID') + ' km</td>' +
      '<td><span class="badge ' + bc + '">' + h.status + '</span></td>' +
      '<td style="font-size:0.82rem">' + bmt + '</td>' +
      '<td><button class="btn btn-outline btn-xs" onclick="showHistoryDetail(\'' + h.id + '\')"><i class="fas fa-eye"></i></button> ' +
      '<button class="btn btn-danger btn-xs" onclick="deleteHistory(\'' + h.id + '\')"><i class="fas fa-trash"></i></button></td></tr>';
  }).join('');
}

function showHistoryDetail(id) {
  const h = getHistory().find(x => x.id === id); if (!h) return;
  const bc    = h.status === 'Kondisi Baik' ? 'badge-green' : h.status === 'Perlu Perhatian' ? 'badge-orange' : 'badge-red';
  const rows  = CHECKLIST_KOMPONEN.map(k => {
    const kondisi = h.checklist?.[k.id] || '-';
    const cls = kondisi === 'Baik' ? 'komponen-baik' : kondisi === 'Perlu Dicek' ? 'komponen-check' : 'komponen-rusak';
    return '<tr><td><i class="' + k.icon + '"></i> ' + k.name + '</td><td><span class="komponen-status ' + cls + '" style="font-size:0.8rem">' + kondisi + '</span></td></tr>';
  }).join('');

  document.getElementById('modalDetailBody').innerHTML =
    '<div style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><strong style="font-size:1rem">' + h.motorName + '</strong><span class="badge ' + bc + '">' + h.status + '</span></div>' +
    '<div style="display:flex;gap:20px;flex-wrap:wrap;font-size:0.85rem;color:var(--gray-500)"><span><i class="fas fa-calendar"></i> ' + h.tanggal + '</span><span><i class="fas fa-road"></i> ' + Number(h.km).toLocaleString('id-ID') + ' km</span><span><i class="fas fa-star" style="color:var(--yellow)"></i> Skor ' + h.score + '%</span></div></div>' +
    '<table class="data-table" style="margin-bottom:12px"><thead><tr><th>Komponen</th><th>Kondisi</th></tr></thead><tbody>' + rows + '</tbody></table>' +
    (h.catatan ? '<div style="background:var(--gray-50);border-radius:var(--radius-sm);padding:12px;border:1px solid var(--border);font-size:0.85rem"><strong>Catatan:</strong> ' + h.catatan + '</div>' : '');
  document.getElementById('modalDetail').classList.remove('hidden');
}

function closeModal() { document.getElementById('modalDetail').classList.add('hidden'); }

function deleteHistory(id) {
  if (!confirm('Hapus riwayat pengecekan ini?')) return;
  saveHistory(getHistory().filter(h => h.id !== id));
  deleteHistoryItemFirebase(id);
  showToast('Riwayat dihapus.', 'info');
  loadHistory();
}

function confirmClearHistory() {
  if (!getHistory().length) { showToast('Tidak ada riwayat untuk dihapus.', 'info'); return; }
  if (!confirm('Hapus SEMUA riwayat pengecekan? Tidak bisa dibatalkan!')) return;
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

function switchAdminTab(tab, btn) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('adminTab-'+tab)?.classList.add('active');
}

function loadAdminUsers() {
  const tbody = document.getElementById('adminUsersBody'); if (!tbody) return;
  const users = getLocalUsers();
  tbody.innerHTML = users.length
    ? users.map((u, i) => '<tr><td>' + (i+1) + '</td><td><strong>' + u.nama + '</strong></td><td>' + u.email + '</td>' +
        '<td>' + JSON.parse(localStorage.getItem('cma_motors_'+u.id)||'[]').length + '</td>' +
        '<td>' + JSON.parse(localStorage.getItem('cma_history_'+u.id)||'[]').length + '</td>' +
        '<td>' + (u.createdAt||'-') + '</td></tr>').join('')
    : '<tr><td colspan="6" style="text-align:center;color:var(--gray-400)">Tidak ada pengguna</td></tr>';
}

function loadAdminMotors() {
  const tbody = document.getElementById('adminMotorsBody'); if (!tbody) return;
  let rows = '', idx = 1;
  getLocalUsers().forEach(u => {
    JSON.parse(localStorage.getItem('cma_motors_'+u.id)||'[]').forEach(m => {
      rows += '<tr><td>' + idx++ + '</td><td>' + u.nama + '</td><td>' + m.merek + '</td><td>' + m.tipe + '</td><td>' + m.tahun + '</td><td><strong>' + m.nopol + '</strong></td><td>' + Number(m.km).toLocaleString('id-ID') + ' km</td></tr>';
    });
  });
  tbody.innerHTML = rows || '<tr><td colspan="7" style="text-align:center;color:var(--gray-400)">Tidak ada data motor</td></tr>';
}

function loadAdminChecks() {
  const tbody = document.getElementById('adminChecksBody'); if (!tbody) return;
  let rows = '', idx = 1;
  getLocalUsers().forEach(u => {
    JSON.parse(localStorage.getItem('cma_history_'+u.id)||'[]').forEach(h => {
      const bc = h.status==='Kondisi Baik'?'badge-green':h.status==='Perlu Perhatian'?'badge-orange':'badge-red';
      rows += '<tr><td>' + idx++ + '</td><td>' + u.nama + '</td><td>' + h.motorName + '</td><td>' + h.tanggal + '</td><td><span class="badge ' + bc + '">' + h.status + '</span></td><td style="font-size:0.82rem">' + (h.bermasalah?.join(', ')||'-') + '</td></tr>';
    });
  });
  tbody.innerHTML = rows || '<tr><td colspan="6" style="text-align:center;color:var(--gray-400)">Tidak ada data pengecekan</td></tr>';
}

function loadAdminBengkelList() {
  const c = document.getElementById('adminBengkelList'); if (!c) return;
  const b = JSON.parse(localStorage.getItem('cma_bengkel')||'[]');
  c.innerHTML = '<table class="data-table"><thead><tr><th>Nama</th><th>Tipe</th><th>Alamat</th><th>Jam</th><th>Rating</th><th>Aksi</th></tr></thead><tbody>' +
    b.map(x => '<tr><td><strong>' + x.nama + '</strong></td><td><span class="badge ' + (x.tipe==='resmi'?'badge-blue':'badge-orange') + '">' + x.tipe + '</span></td><td style="font-size:0.82rem">' + x.alamat + '</td><td>' + x.jam + '</td><td>' + x.rating + '</td><td><button class="btn btn-danger btn-xs" onclick="deleteBengkel(\'' + x.id + '\')"><i class="fas fa-trash"></i></button></td></tr>').join('') +
    '</tbody></table>';
}

function addBengkel(e) {
  e.preventDefault();
  const b = JSON.parse(localStorage.getItem('cma_bengkel')||'[]');
  b.push({ id:'b_'+Date.now(), nama:document.getElementById('adminBengkelNama').value, tipe:document.getElementById('adminBengkelTipe').value, alamat:document.getElementById('adminBengkelAlamat').value, jam:document.getElementById('adminBengkelJam').value, telp:document.getElementById('adminBengkelTelp').value, jarak:document.getElementById('adminBengkelJarak').value||'? km', rating:4.0, spesialis:'' });
  localStorage.setItem('cma_bengkel', JSON.stringify(b));
  showToast('Bengkel berhasil ditambahkan!', 'success');
  e.target.reset();
  loadAdminBengkelList();
}

function deleteBengkel(id) {
  if (!confirm('Hapus bengkel ini?')) return;
  localStorage.setItem('cma_bengkel', JSON.stringify(JSON.parse(localStorage.getItem('cma_bengkel')||'[]').filter(b => b.id !== id)));
  showToast('Bengkel dihapus.', 'info');
  loadAdminBengkelList();
}

function loadBiayaEdit() {
  const c = document.getElementById('biayaEditList'); if (!c) return;
  const biaya = JSON.parse(localStorage.getItem('cma_biaya')||'{}');
  c.innerHTML = Object.entries(biaya).map(([key, b]) =>
    '<div class="biaya-edit-item">' +
    '<div class="biaya-edit-name"><i class="' + (CHECKLIST_KOMPONEN.find(k=>k.id===key)?.icon||'fas fa-tools') + '" style="color:var(--blue);margin-right:6px"></i>' + b.nama + '</div>' +
    '<div class="biaya-edit-inputs"><span class="biaya-edit-sep">Min:</span><input type="number" value="' + b.min + '" id="biaya_min_' + key + '" style="max-width:140px" /><span class="biaya-edit-sep">Max:</span><input type="number" value="' + b.max + '" id="biaya_max_' + key + '" style="max-width:140px" /></div>' +
    '<button class="btn btn-success btn-sm" onclick="saveBiayaItem(\'' + key + '\')"><i class="fas fa-save"></i> Simpan</button></div>'
  ).join('');
}

function saveBiayaItem(key) {
  const biaya = JSON.parse(localStorage.getItem('cma_biaya')||'{}');
  const min   = parseInt(document.getElementById('biaya_min_'+key).value);
  const max   = parseInt(document.getElementById('biaya_max_'+key).value);
  if (isNaN(min)||isNaN(max)||min<0||max<min) { showToast('Nilai biaya tidak valid!', 'error'); return; }
  biaya[key].min = min; biaya[key].max = max;
  localStorage.setItem('cma_biaya', JSON.stringify(biaya));
  showToast('Estimasi biaya ' + biaya[key].nama + ' berhasil diperbarui!', 'success');
}

// ==================== TIPS ====================
function nextTip() {
  tipIndex = (tipIndex + 1) % TIPS.length;
  const el = document.getElementById('tipText');
  if (!el) return;
  el.style.opacity = 0;
  setTimeout(() => { el.textContent = TIPS[tipIndex]; el.style.opacity = 1; }, 200);
}

// ==================== UTILS ====================
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
