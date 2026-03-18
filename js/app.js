/* ═══════════════════════════════════════
   GLOW NOTES — app.js
   Core: init, login, storage, screens, particles
═══════════════════════════════════════ */

const GlowApp = (() => {
  const FORMSPREE_URL = 'https://formspree.io/f/xyknbaoe';
  const EMAILJS_SERVICE = 'service_bw0teoh';
  const EMAILJS_TEMPLATE = 'template_ge7eydo';
  const EMAILJS_PUBLIC_KEY = 'V4yyR5SPdGIJ6zL29';

  let currentUser = null;
  let userReels = [];

  // ── EMAILJS ───────────────────────────────────────────
  function initEmailJS() {
    if (typeof emailjs !== 'undefined') {
      try { emailjs.init(EMAILJS_PUBLIC_KEY); } catch(e) {}
    }
  }

  // ── STORAGE ───────────────────────────────────────────
  function saveUser() { try { localStorage.setItem('glow-user', JSON.stringify(currentUser)); } catch(e) {} }
  function loadUser() {
    try { const r = localStorage.getItem('glow-user'); if (r) { currentUser = JSON.parse(r); return true; } } catch(e) {}
    return false;
  }
  function saveReels() { try { localStorage.setItem('glow-my-reels', JSON.stringify(userReels)); } catch(e) {} }
  function loadReels() { try { const r = localStorage.getItem('glow-my-reels'); if (r) userReels = JSON.parse(r); } catch(e) {} }

  function addUserReel(reel) { userReels.push(reel); saveReels(); }
  function getCurrentUser() { return currentUser; }
  function getUserReels() { return userReels; }

  // ── NETWORK ───────────────────────────────────────────
  async function submitToFormspree(data) {
    try {
      await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch(e) {}
  }

  async function sendConfirmationEmail(fromName, fromEmail, toName, reelUrl) {
    try {
      initEmailJS();
      if (typeof emailjs === 'undefined') return false;
      await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
        from_name: fromName, to_name: toName,
        reel_url: reelUrl, to_email: fromEmail, reply_to: fromEmail
      });
      return true;
    } catch(e) { return false; }
  }

  // ── SCREENS ───────────────────────────────────────────
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const sc = document.getElementById(id);
    if (sc) sc.classList.add('active');
    if (id === 'feedScreen') GlowFeed.build();
    else if (id === 'myReelsScreen') GlowCreate.buildMyReels();
  }

  // ── LOGIN ─────────────────────────────────────────────
  async function handleLogin() {
    const name = document.getElementById('loginName').value.trim();
    const email = document.getElementById('loginEmail').value.trim();
    const loc = document.getElementById('loginLocation').value.trim();
    if (!name) { showToast('Please enter your name'); return; }
    if (!email || !email.includes('@')) { showToast('Please enter a valid email'); return; }

    const btn = document.getElementById('loginBtn');
    btn.disabled = true; btn.textContent = 'Entering\u2026';
    currentUser = { name, email, location: loc || '', joinedAt: new Date().toISOString() };
    saveUser();

    await submitToFormspree({ _subject: 'New Glow Notes Signup', name, email, location: loc, joined: currentUser.joinedAt });

    btn.textContent = 'Enter the Glow'; btn.disabled = false;
    showScreen('feedScreen');
    document.getElementById('userGreeting').textContent = name;
    showToast('Welcome, ' + name + ' \u2728');
  }

  // ── TOAST ─────────────────────────────────────────────
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }

  // ── PARTICLES ─────────────────────────────────────────
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }

  function makeParticle() {
    return {
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      size: Math.random() * 2.5 + 0.5,
      speedY: -(Math.random() * 0.3 + 0.1), speedX: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.5 + 0.1,
      pulse: Math.random() * Math.PI * 2, pulseSpeed: Math.random() * 0.02 + 0.005
    };
  }

  function initParticles() {
    particles = Array.from({ length: Math.min(50, Math.floor(window.innerWidth * window.innerHeight / 18000)) }, makeParticle);
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.speedX; p.y += p.speedY; p.pulse += p.pulseSpeed;
      if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
      const o = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212,165,90,${o})`; ctx.fill();
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212,165,90,${o * 0.15})`; ctx.fill();
    });
    requestAnimationFrame(drawParticles);
  }

  // ── INIT ──────────────────────────────────────────────
  function hideLoader() { const l = document.getElementById('loader'); if (l) l.classList.add('hidden'); }

  function init() {
    resizeCanvas(); initParticles(); drawParticles();
    window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

    try {
      const hasUser = loadUser();
      loadReels();
      initEmailJS();
      setTimeout(() => {
        hideLoader();
        if (hasUser && currentUser) {
          showScreen('feedScreen');
          showToast('Welcome back, ' + currentUser.name + ' \u2728');
        } else {
          showScreen('loginScreen');
        }
      }, 800);
    } catch(e) {
      hideLoader(); showScreen('loginScreen');
    }
  }

  // Hard failsafe
  setTimeout(() => { hideLoader(); }, 2000);

  return {
    init, handleLogin, showScreen, showToast,
    getCurrentUser, getUserReels, addUserReel,
    submitToFormspree, sendConfirmationEmail
  };
})();

// Boot
document.addEventListener('DOMContentLoaded', () => GlowApp.init());
