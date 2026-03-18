/* ═══════════════════════════════════════
   GLOW NOTES — watch.js
   Watch mode overlay + bokeh engine
═══════════════════════════════════════ */

const GlowWatch = (() => {
  let watchReel = null;
  let watchStep = 0;
  let watchAutoTimer = null;
  let bokehRAF = null;
  let bokehRunning = false;
  let bokehParticles = [];
  const WATCH_AUTO_MS = 5500;

  // ── BOKEH ─────────────────────────────────────────────
  const bokehCanvas = document.getElementById('bokehCanvas');
  const bokehCtx = bokehCanvas.getContext('2d');

  function makeBokeh() {
    const warm = Math.random();
    return {
      x: Math.random() * bokehCanvas.width,
      y: Math.random() * bokehCanvas.height,
      r: Math.random() * 34 + 10,
      h: warm < 0.55 ? 26 + Math.random() * 24 : 43 + Math.random() * 18, // amber / gold
      s: 65 + Math.random() * 35,
      l: 48 + Math.random() * 32,
      alpha: Math.random() * 0.11 + 0.022,
      vx: (Math.random() - 0.5) * 0.16,
      vy: (Math.random() - 0.5) * 0.11 - 0.055,
      pulse: Math.random() * Math.PI * 2,
      ps: 0.006 + Math.random() * 0.011
    };
  }

  function initBokeh() {
    bokehCanvas.width = window.innerWidth;
    bokehCanvas.height = window.innerHeight;
    const n = Math.min(42, Math.floor(window.innerWidth * window.innerHeight / 19000));
    bokehParticles = Array.from({ length: n }, makeBokeh);
  }

  function drawBokeh() {
    bokehCtx.clearRect(0, 0, bokehCanvas.width, bokehCanvas.height);
    bokehParticles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.pulse += p.ps;
      if (p.y < -70 || p.x < -70 || p.x > bokehCanvas.width + 70) {
        p.x = Math.random() * bokehCanvas.width;
        p.y = bokehCanvas.height + 20;
      }
      const a = p.alpha * (0.45 + 0.55 * Math.sin(p.pulse));
      const g = bokehCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, `hsla(${p.h},${p.s}%,${p.l}%,${a})`);
      g.addColorStop(0.4, `hsla(${p.h},${p.s}%,${p.l}%,${a * 0.55})`);
      g.addColorStop(1, `hsla(${p.h},${p.s}%,${p.l}%,0)`);
      bokehCtx.beginPath();
      bokehCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      bokehCtx.fillStyle = g;
      bokehCtx.fill();
    });
    if (bokehRunning) bokehRAF = requestAnimationFrame(drawBokeh);
  }

  function startBokeh() {
    initBokeh(); bokehRunning = true;
    bokehRAF = requestAnimationFrame(drawBokeh);
  }

  function stopBokeh() {
    bokehRunning = false;
    cancelAnimationFrame(bokehRAF);
    bokehCtx.clearRect(0, 0, bokehCanvas.width, bokehCanvas.height);
  }

  // ── WATCH STEPS ───────────────────────────────────────
  function showStep(step) {
    clearTimeout(watchAutoTimer);
    const reel = watchReel; if (!reel) return;
    const totalBody = reel.body.length;
    const hasSig = !!(reel.signature);
    const total = totalBody + (hasSig ? 1 : 0);

    // Update progress pips
    document.querySelectorAll('.watch-pip').forEach((p, i) => {
      p.classList.remove('done', 'cur');
      if (i < step) p.classList.add('done');
      else if (i === step) p.classList.add('cur');
    });

    const $tag = document.getElementById('watchTag');
    const $title = document.getElementById('watchTitle');
    const $div = document.getElementById('watchDivider');
    const $para = document.getElementById('watchParagraph');
    const $sig = document.getElementById('watchSignature');

    if (step === 0) {
      [$tag, $title, $div, $para, $sig].forEach(el => el.classList.remove('vis'));
      $para.innerHTML = ''; $sig.innerHTML = '';
      setTimeout(() => $tag.classList.add('vis'), 150);
      setTimeout(() => { $title.innerHTML = reel.title; $title.classList.add('vis'); }, 700);
      setTimeout(() => $div.classList.add('vis'), 1300);
      setTimeout(() => {
        $para.innerHTML = reel.body[0]; $para.classList.add('vis');
        showHint(); scheduleAuto();
      }, 1700);
    } else if (step < totalBody) {
      $para.classList.remove('vis');
      setTimeout(() => {
        $para.innerHTML = reel.body[step]; $para.classList.add('vis');
        showHint(); scheduleAuto();
      }, 700);
    } else if (step === totalBody && hasSig) {
      $para.classList.remove('vis');
      setTimeout(() => {
        $para.innerHTML = '';
        $sig.textContent = reel.signature; $sig.classList.add('vis');
        showHint(true); scheduleAuto(true);
      }, 700);
    } else {
      showEnd(); return;
    }
    watchStep = step;
  }

  function scheduleAuto(isLast = false) {
    clearTimeout(watchAutoTimer);
    watchAutoTimer = setTimeout(() => advance(), isLast ? 7000 : WATCH_AUTO_MS);
  }

  function showHint(isLast = false) {
    const h = document.getElementById('watchHint');
    h.textContent = isLast ? 'Tap to finish' : 'Tap to continue';
    h.classList.add('vis');
    clearTimeout(showHint._t);
    showHint._t = setTimeout(() => h.classList.remove('vis'), 2800);
  }

  function advance() {
    clearTimeout(watchAutoTimer);
    const reel = watchReel; if (!reel) return;
    const total = reel.body.length + (reel.signature ? 1 : 0);
    if (watchStep + 1 >= total) { showEnd(); return; }
    showStep(watchStep + 1);
  }

  function showEnd() {
    clearTimeout(watchAutoTimer);
    document.getElementById('watchEndSig').textContent = watchReel.signature || '';
    document.getElementById('watchEnd').classList.add('vis');
    document.getElementById('watchHint').classList.remove('vis');
  }

  function tapHandler(e) {
    if (e.target.closest('.watch-close') || e.target.closest('.watch-end') || e.target.closest('.watch-mute')) return;
    advance();
  }

  // ── MUTE BUTTON ───────────────────────────────────────
  function updateMuteBtn() {
    const btn = document.getElementById('watchMuteBtn');
    if (!btn) return;
    btn.textContent = GlowAudio.getMuted() ? '🔇' : '🔊';
    btn.title = GlowAudio.getMuted() ? 'Unmute' : 'Mute';
  }

  // ── PUBLIC ────────────────────────────────────────────
  function start(reel) {
    watchReel = reel; watchStep = 0;
    document.getElementById('watchEnd').classList.remove('vis');
    document.getElementById('watchOverlay').classList.add('active');

    // Build progress pips
    const total = reel.body.length + (reel.signature ? 1 : 0);
    const prog = document.getElementById('watchProgress');
    prog.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const p = document.createElement('div'); p.className = 'watch-pip'; prog.appendChild(p);
    }

    document.getElementById('watchTagText').textContent = reel.tag;
    updateMuteBtn();

    // Start visuals + audio
    startBokeh();
    GlowAudio.play(reel.mood || 'hopeful');

    document.getElementById('watchOverlay').addEventListener('click', tapHandler);
    setTimeout(() => showStep(0), 400);
  }

  function close() {
    clearTimeout(watchAutoTimer);
    document.getElementById('watchOverlay').classList.remove('active');
    document.getElementById('watchOverlay').removeEventListener('click', tapHandler);
    stopBokeh();
    GlowAudio.stop();

    // Reset all animated elements
    ['watchTag','watchTitle','watchDivider','watchParagraph','watchSignature'].forEach(id => {
      document.getElementById(id).classList.remove('vis');
    });
    document.getElementById('watchEnd').classList.remove('vis');

    // Reset toggle on current reel
    const t = document.getElementById('toggle-' + (window.GlowFeed ? GlowFeed.getCurrentIndex() : 0));
    if (t) {
      t.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      t.querySelector('.toggle-btn:first-child').classList.add('active');
    }
  }

  function replay() {
    document.getElementById('watchEnd').classList.remove('vis');
    ['watchTag','watchTitle','watchDivider','watchParagraph','watchSignature'].forEach(id => {
      document.getElementById(id).classList.remove('vis');
    });
    watchStep = 0;
    GlowAudio.stop(false);
    setTimeout(() => {
      GlowAudio.play(watchReel.mood || 'hopeful');
      showStep(0);
    }, 300);
  }

  function handleMute() {
    const nowMuted = GlowAudio.toggleMute();
    updateMuteBtn();
    GlowApp.showToast(nowMuted ? 'Music muted' : 'Music on');
  }

  // Resize handler
  window.addEventListener('resize', () => {
    if (bokehRunning) { bokehCanvas.width = window.innerWidth; bokehCanvas.height = window.innerHeight; }
  });

  return { start, close, replay, handleMute };
})();
