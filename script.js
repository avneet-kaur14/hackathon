/* =============================================
   GRAMSHIKSHA — Gamified Rural Learning
   JavaScript App Logic
============================================= */

// ============================================================
// STATE
// ============================================================
const AppState = {
  portal: 'student',       // 'student' | 'teacher'
  username: '',
  xp: 1250,
  streak: 5,
  darkMode: false,
  sidebarOpen: true
};

// ============================================================
// INIT — runs on page load
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
  createParticles();
  initXPBar();
  animateStatsOnLoad();
  animateProgressBarsOnLoad();
});

// ============================================================
// PARTICLES BACKGROUND
// ============================================================
function createParticles() {
  const container = document.getElementById('particles');
  const colors = ['#FFD700', '#4ECDC4', '#FF6B6B', '#A855F7', '#22C55E'];
  const count = 22;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.classList.add('particle');
    const size = Math.random() * 20 + 6;
    el.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${Math.random() * 18 + 12}s;
      animation-delay: ${Math.random() * 10}s;
    `;
    container.appendChild(el);
  }
}

// ============================================================
// PORTAL SWITCHER (Student / Teacher)
// ============================================================
function switchPortal(type) {
  AppState.portal = type;

  // Update button states
  document.getElementById('studentPortalBtn').classList.toggle('active', type === 'student');
  document.getElementById('teacherPortalBtn').classList.toggle('active', type === 'teacher');

  // Swap card visuals
  const avatarRing  = document.getElementById('avatarRing');
  const cardTitle   = document.getElementById('cardTitle');
  const cardSubtitle = document.getElementById('cardSubtitle');
  const username    = document.getElementById('username');

  if (type === 'student') {
    avatarRing.textContent  = '🎒';
    cardTitle.textContent   = 'Student Login';
    cardSubtitle.textContent = 'Welcome back, learner!';
    username.placeholder    = 'Enter your Roll No. / Username';
    document.body.classList.remove('teacher-mode');
  } else {
    avatarRing.textContent  = '📚';
    cardTitle.textContent   = 'Teacher Login';
    cardSubtitle.textContent = 'Welcome back, Guru Ji! 🙏';
    username.placeholder    = 'Enter your Employee ID';
    document.body.classList.add('teacher-mode');
  }

  // Animate card header
  const header = document.getElementById('cardHeader');
  header.style.animation = 'none';
  void header.offsetWidth; // reflow
  header.style.animation = 'fadeDown 0.4s ease';
}

// ============================================================
// PASSWORD TOGGLE
// ============================================================
function togglePassword() {
  const input = document.getElementById('password');
  input.type = input.type === 'password' ? 'text' : 'password';
}

// ============================================================
// LOGIN HANDLER → transition to Dashboard
// ============================================================
function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const btnText  = document.querySelector('.btn-text');
  const btnLoader = document.querySelector('.btn-loader');
  const loginBtn = document.getElementById('loginBtn');

  if (!username || !password) {
    showToast('⚠️ Please fill in all fields!');
    return;
  }

  // Loading state
  btnText.style.display  = 'none';
  btnLoader.style.display = 'inline';
  loginBtn.disabled = true;

  // Simulate async login (1.5 seconds)
  setTimeout(() => {
    AppState.username = username;

    // Set user info in dashboard
    setupDashboard();

    // Transition pages
    const loginPage = document.getElementById('loginPage');
    const dashPage  = document.getElementById('dashboardPage');

    loginPage.style.animation = 'fadeDown 0.4s ease forwards';
    setTimeout(() => {
      loginPage.classList.remove('active');
      dashPage.classList.add('active');

      // Animate dashboard entrance
      dashPage.style.animation = 'fadeUp 0.5s ease';
      initXPBar();
      animateStatsOnLoad();
      animateProgressBarsOnLoad();

      showToast(`🎉 Welcome, ${username}! Ready to learn?`);
    }, 380);

  }, 1500);
}

// ============================================================
// SETUP DASHBOARD based on logged-in user
// ============================================================
function setupDashboard() {
  const isTeacher = AppState.portal === 'teacher';

  // Sidebar avatar & role
  document.getElementById('sidebarAvatar').textContent = isTeacher ? '📚' : '🎒';
  document.getElementById('sidebarName').textContent   = AppState.username;
  document.getElementById('sidebarRole').textContent   = isTeacher ? 'Teacher' : 'Student';

  // Welcome message
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  document.getElementById('welcomeMsg').textContent   = `${greeting}, ${AppState.username}! 🎉`;
  document.getElementById('welcomeSub').textContent   = isTeacher
    ? 'Your students are waiting. Let's teach great things!'
    : 'Keep up your amazing learning streak!';

  // XP counter
  document.getElementById('xpCount').textContent = AppState.xp;
  document.getElementById('streakCount').textContent = AppState.streak;
  document.getElementById('totalXP').textContent = AppState.xp.toLocaleString();

  // Teacher-specific: update sidebar nav
  if (isTeacher) {
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.textContent.trim().includes('Leaderboard')) {
        item.innerHTML = '<span>📋</span><span>Assignments</span>';
        item.setAttribute('onclick', "showSection('leaderboard', this)");
      }
    });
  }
}

// ============================================================
// XP BAR ANIMATION
// ============================================================
function initXPBar() {
  const xpFill = document.getElementById('xpFill');
  if (!xpFill) return;
  const percent = (AppState.xp % 1000) / 10; // 0–100
  xpFill.style.width = '0%';
  setTimeout(() => { xpFill.style.width = percent + '%'; }, 400);
}

// ============================================================
// STATS COUNTER ANIMATION
// ============================================================
function animateStatsOnLoad() {
  const statValues = document.querySelectorAll('.stat-val');
  statValues.forEach((el) => {
    const raw = el.textContent.replace(/,/g, '').trim();
    const target = parseFloat(raw);
    if (!isNaN(target) && target > 5) {
      animateCounter(el, target);
    }
  });
}

function animateCounter(el, target) {
  const duration = 1200;
  const start = performance.now();
  const isFloat = target % 1 !== 0;

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const value = eased * target;
    el.textContent = isFloat
      ? value.toFixed(1)
      : Math.round(value).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ============================================================
// PROGRESS BAR ANIMATION (on section reveal)
// ============================================================
function animateProgressBarsOnLoad() {
  const bars = document.querySelectorAll('.pbar-fill');
  bars.forEach(bar => {
    const targetW = bar.style.width;
    bar.style.width = '0%';
    setTimeout(() => { bar.style.width = targetW; }, 300);
  });
}

// ============================================================
// SECTION NAVIGATION
// ============================================================
function showSection(sectionId, linkEl) {
  // Hide all sections
  document.querySelectorAll('.dash-section').forEach(s => s.classList.remove('active'));

  // Show target section
  const target = document.getElementById('section-' + sectionId);
  if (target) {
    target.classList.add('active');
    target.style.animation = 'none';
    void target.offsetWidth;
    target.style.animation = 'fadeUp 0.35s ease';
  }

  // Update nav highlight
  if (linkEl) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    linkEl.classList.add('active');
  }

  // Update page title
  const titles = {
    overview: 'Dashboard Overview',
    progress: 'My Progress',
    badges: 'Badges & Achievements',
    courses: 'My Courses',
    leaderboard: 'Class Leaderboard',
    settings: 'Settings'
  };
  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = titles[sectionId] || 'Dashboard';

  // Trigger re-animations per section
  if (sectionId === 'overview') {
    animateProgressBarsOnLoad();
    animateStatsOnLoad();
  }
  if (sectionId === 'badges') {
    animateBadges();
  }

  // On mobile: close sidebar
  if (window.innerWidth < 768) {
    document.getElementById('sidebar').classList.remove('open');
  }
}

// ============================================================
// BADGES POP ANIMATION
// ============================================================
function animateBadges() {
  const badges = document.querySelectorAll('.big-badge');
  badges.forEach((badge, i) => {
    badge.style.animation = 'none';
    void badge.offsetWidth;
    badge.style.animation = `popBadge 0.4s ease ${i * 0.07}s both`;
  });
}

// ============================================================
// SIDEBAR TOGGLE
// ============================================================
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main    = document.querySelector('.main-content');

  if (window.innerWidth < 768) {
    sidebar.classList.toggle('open');
  } else {
    AppState.sidebarOpen = !AppState.sidebarOpen;
    sidebar.classList.toggle('closed', !AppState.sidebarOpen);
    main.classList.toggle('expanded', !AppState.sidebarOpen);
  }
}

// ============================================================
// DARK MODE TOGGLE
// ============================================================
function toggleDark() {
  const toggle = document.getElementById('darkToggle');
  toggle.classList.toggle('on');
  AppState.darkMode = !AppState.darkMode;

  if (AppState.darkMode) {
    document.documentElement.style.setProperty('--bg-primary', '#060d14');
    document.documentElement.style.setProperty('--bg-card', '#0f1923');
    document.documentElement.style.setProperty('--bg-card2', '#131f2b');
  } else {
    document.documentElement.style.setProperty('--bg-primary', '#0f1923');
    document.documentElement.style.setProperty('--bg-card', '#1a2635');
    document.documentElement.style.setProperty('--bg-card2', '#1e2d3e');
  }
}

// ============================================================
// SAVE SETTINGS
// ============================================================
function saveSettings() {
  const name = document.getElementById('dispName').value.trim();
  if (name) {
    AppState.username = name;
    document.getElementById('sidebarName').textContent = name;
    document.getElementById('welcomeMsg').textContent = `Welcome back, ${name}! 🎉`;
  }
  showToast('✅ Settings saved successfully!');
}

// ============================================================
// LOGOUT → back to login
// ============================================================
function logout() {
  const dashPage  = document.getElementById('dashboardPage');
  const loginPage = document.getElementById('loginPage');

  dashPage.style.animation = 'fadeDown 0.35s ease forwards';
  setTimeout(() => {
    dashPage.classList.remove('active');
    loginPage.classList.add('active');
    loginPage.style.animation = 'fadeUp 0.4s ease';

    // Reset form
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';

    const btnText  = document.querySelector('.btn-text');
    const btnLoader = document.querySelector('.btn-loader');
    const loginBtn = document.getElementById('loginBtn');
    btnText.style.display  = 'inline';
    btnLoader.style.display = 'none';
    loginBtn.disabled = false;

    // Reset portal
    switchPortal('student');
    document.body.classList.remove('teacher-mode');

    // Reset sidebar
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector('.nav-item').classList.add('active');
    showSection('overview', document.querySelector('.nav-item'));

  }, 350);
}

// ============================================================
// TOAST NOTIFICATION
// ============================================================
function showToast(message, duration = 3000) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.classList.add('toast');
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// ============================================================
// KEYBOARD SHORTCUT: Enter key on login
// ============================================================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && document.getElementById('loginPage').classList.contains('active')) {
    const form = document.querySelector('.login-form');
    if (form) {
      const event = new Event('submit', { cancelable: true });
      form.dispatchEvent(event);
    }
  }
});

// ============================================================
// DEMO: Simulate gaining XP (fun interaction on badge click)
// ============================================================
document.addEventListener('click', (e) => {
  if (e.target.closest('.badge-chip.earned') || e.target.closest('.big-badge.earned')) {
    const el = e.target.closest('.badge-chip.earned, .big-badge.earned');
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'popBadge 0.4s ease';
    showToast('🏅 Badge unlocked! +50 XP');
    AppState.xp += 50;
    document.getElementById('xpCount').textContent = AppState.xp;
    document.getElementById('totalXP').textContent = AppState.xp.toLocaleString();
    initXPBar();
  }
});

// ============================================================
// RESIZE handler for sidebar
// ============================================================
window.addEventListener('resize', () => {
  const sidebar = document.getElementById('sidebar');
  if (window.innerWidth >= 768) {
    sidebar.classList.remove('open');
    if (AppState.sidebarOpen) sidebar.classList.remove('closed');
  }
});