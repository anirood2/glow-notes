/* ═══════════════════════════════════════
   GLOW NOTES — app.js
   Core: screens, login, storage, particles
═══════════════════════════════════════ */

const GlowApp = (() => {
  const FORMSPREE = 'https://formspree.io/f/xyknbaoe';
  const EJS_SVC   = 'service_bw0teoh';
  const EJS_TPL   = 'template_ge7eydo';
  const EJS_KEY   = 'V4yyR5SPdGIJ6zL29';

  let currentUser = null;
  let userReels   = [];

  // ── EMAILJS ──
  function initEJS() {
    if (typeof emailjs !== 'undefined') try { emailjs.init(EJS_KEY); } catch(e) {}
  }

  // ── STORAGE ──
  function saveUser()  { try { localStorage.setItem('glow-user',  JSON.stringify(currentUser)); } catch(e) {} }
  function saveReels() { try { localStorage.setItem('glow-reels', JSON.stringify(userReels));   } catch(e) {} }

  function loadUser() {
    try { const r = localStorage.getItem('glow-user');  if (r) { currentUser = JSON.parse(r); return true; } } catch(e) {}
    return false;
  }
  function loadReels() {
    try { const r = localStorage.getItem('glow-reels'); if (r) userReels = JSON.parse(r); } catch(e) {}
  }

  function addReel(reel) { userReels.push(reel); saveReels(); }
  function getUser()     { return currentUser; }
  function getReels()    { return userReels; }

  // ── NETWORK ──
  async function postForm(data) {
    try {
      await fetch(FORMSPREE, { method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'}, body: JSON.stringify(data) });
    } catch(e) {}
  }

  async function sendEmail(fromName, fromEmail, toName, url) {
    try {
      initEJS();
      if (typeof emailjs === 'undefined') return false;
      await emailjs.send(EJS_SVC, EJS_TPL, { from_name:fromName, to_name:toName, reel_url:url, to_email:fromEmail, reply_to:fromEmail });
      return true;
    } catch(e) { return false; }
  }

  // ── SCREENS ──
  // Map screen id → setup function called on show
  const screenSetup = {};

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const sc = document.getElementById(id);
    if (sc) sc.classList.add('active');
    if (screenSetup[id]) screenSetup[id]();
  }

  function registerScreen(id, fn) { screenSetup[id] = fn; }

  // ── LOGIN ──
  async function handleLogin() {
    const name  = document.getElementById('loginName').value.trim();
    const email = document.getElementById('loginEmail').value.trim();
    const loc   = document.getElementById('loginLocation').value.trim();
    if (!name)                      { showToast('Please enter your name');  return; }
    if (!email || !email.includes('@')) { showToast('Please enter a valid email'); return; }

    const btn = document.getElementById('loginBtn');
    btn.disabled = true; btn.textContent = 'Entering\u2026';

    currentUser = { name, email, location: loc || '', joinedAt: new Date().toISOString() };
    saveUser();
    await postForm({ _subject:'New Glow Notes Signup', name, email, location:loc, joined:currentUser.joinedAt });

    btn.textContent = 'Enter the Glow'; btn.disabled = false;
    showScreen('landingScreen');
    document.getElementById('userGreeting').textContent = name;
    showToast('Welcome, ' + name + ' \u2728');
  }

  // ── TOAST ──
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2600);
  }

  // ── PARTICLES ──
  const canvas = document.getElementById('particle-canvas');
  const pctx   = canvas.getContext('2d');
  let particles = [];

  function resizeCanvas() { canvas.width = innerWidth; canvas.height = innerHeight; }

  function mkParticle() {
    return {
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      size: Math.random() * 2.5 + 0.5,
      vy: -(Math.random() * 0.3 + 0.1), vx: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.5 + 0.1,
      pulse: Math.random() * Math.PI * 2, ps: Math.random() * 0.02 + 0.005
    };
  }

  function initParticles() {
    particles = Array.from({ length: Math.min(50, Math.floor(innerWidth * innerHeight / 18000)) }, mkParticle);
  }

  function drawParticles() {
    pctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.pulse += p.ps;
      if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
      const o = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));
      pctx.beginPath(); pctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      pctx.fillStyle = `rgba(212,165,90,${o})`; pctx.fill();
      pctx.beginPath(); pctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      pctx.fillStyle = `rgba(212,165,90,${o * 0.15})`; pctx.fill();
    });
    requestAnimationFrame(drawParticles);
  }

  // ── INIT ──
  function hideLoader() { const l = document.getElementById('loader'); if (l) l.classList.add('hidden'); }

  function init() {
    resizeCanvas(); initParticles(); drawParticles();
    window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

    try {
      const hasUser = loadUser(); loadReels(); initEJS();
      setTimeout(() => {
        hideLoader();
        if (hasUser && currentUser) {
          showScreen('landingScreen');
          document.getElementById('userGreeting').textContent = currentUser.name;
          showToast('Welcome back, ' + currentUser.name + ' \u2728');
        } else {
          showScreen('loginScreen');
        }
      }, 900);
    } catch(e) { hideLoader(); showScreen('loginScreen'); }
  }

  // Hard failsafe
  setTimeout(() => hideLoader(), 2200);

  return { init, handleLogin, showScreen, registerScreen, showToast, getUser, getReels, addReel, postForm, sendEmail };
})();
