/* ═══════════════════════════════════════
   GLOW NOTES — watch.js
   Watch mode overlay + bokeh canvas
═══════════════════════════════════════ */

const GlowWatch = (() => {
  let watchReel  = null;
  let watchStep  = 0;
  let autoTimer  = null;
  let bokehRAF   = null;
  let bokehOn    = false;
  let bokehParts = [];
  const AUTO_MS  = 5500;

  // ── BOKEH ─────────────────────────────────────────────
  const bcan = document.getElementById('bokehCanvas');
  const bctx = bcan.getContext('2d');

  function mkBokeh() {
    const w = Math.random();
    return {
      x: Math.random() * bcan.width, y: Math.random() * bcan.height,
      r: Math.random() * 34 + 10,
      h: w < 0.55 ? 26 + Math.random() * 24 : 43 + Math.random() * 18,
      s: 65 + Math.random() * 35, l: 48 + Math.random() * 32,
      alpha: Math.random() * 0.11 + 0.022,
      vx: (Math.random() - 0.5) * 0.16, vy: (Math.random() - 0.5) * 0.11 - 0.055,
      pulse: Math.random() * Math.PI * 2, ps: 0.006 + Math.random() * 0.011
    };
  }

  function initBokeh() {
    bcan.width = innerWidth; bcan.height = innerHeight;
    const n = Math.min(42, Math.floor(innerWidth * innerHeight / 19000));
    bokehParts = Array.from({ length: n }, mkBokeh);
  }

  function drawBokeh() {
    bctx.clearRect(0, 0, bcan.width, bcan.height);
    bokehParts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.pulse += p.ps;
      if (p.y < -70 || p.x < -70 || p.x > bcan.width + 70) {
        p.x = Math.random() * bcan.width; p.y = bcan.height + 20;
      }
      const a = p.alpha * (0.45 + 0.55 * Math.sin(p.pulse));
      const g = bctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0,   `hsla(${p.h},${p.s}%,${p.l}%,${a})`);
      g.addColorStop(0.4, `hsla(${p.h},${p.s}%,${p.l}%,${a * 0.55})`);
      g.addColorStop(1,   `hsla(${p.h},${p.s}%,${p.l}%,0)`);
      bctx.beginPath(); bctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      bctx.fillStyle = g; bctx.fill();
    });
    if (bokehOn) bokehRAF = requestAnimationFrame(drawBokeh);
  }

  function startBokeh() { initBokeh(); bokehOn = true; bokehRAF = requestAnimationFrame(drawBokeh); }
  function stopBokeh()  { bokehOn = false; cancelAnimationFrame(bokehRAF); bctx.clearRect(0,0,bcan.width,bcan.height); }

  window.addEventListener('resize', () => { if (bokehOn) { bcan.width = innerWidth; bcan.height = innerHeight; } });

  // ── WATCH STEPS ───────────────────────────────────────
  function showStep(step) {
    clearTimeout(autoTimer);
    const reel = watchReel; if (!reel) return;
    const totalBody = reel.body.length;
    const hasSig    = !!(reel.signature);

    // Update pips
    document.querySelectorAll('.watch-pip').forEach((p, i) => {
      p.classList.remove('done', 'cur');
      if (i < step) p.classList.add('done');
      else if (i === step) p.classList.add('cur');
    });

    const $tag  = document.getElementById('watchTag');
    const $ttl  = document.getElementById('watchTitle');
    const $div  = document.getElementById('watchDivider');
    const $para = document.getElementById('watchParagraph');
    const $sig  = document.getElementById('watchSignature');

    if (step === 0) {
      [$tag, $ttl, $div, $para, $sig].forEach(el => el.classList.remove('vis'));
      $para.innerHTML = ''; $sig.innerHTML = '';
      setTimeout(() => $tag.classList.add('vis'), 150);
      setTimeout(() => { $ttl.innerHTML = reel.title; $ttl.classList.add('vis'); }, 700);
      setTimeout(() => $div.classList.add('vis'), 1300);
      setTimeout(() => { $para.innerHTML = reel.body[0]; $para.classList.add('vis'); pulse(); scheduleAuto(); }, 1700);

    } else if (step < totalBody) {
      $para.classList.remove('vis');
      setTimeout(() => { $para.innerHTML = reel.body[step]; $para.classList.add('vis'); pulse(); scheduleAuto(); }, 700);

    } else if (step === totalBody && hasSig) {
      $para.classList.remove('vis');
      setTimeout(() => { $para.innerHTML = ''; $sig.textContent = reel.signature; $sig.classList.add('vis'); pulse(true); scheduleAuto(true); }, 700);

    } else { showEnd(); return; }

    watchStep = step;
  }

  function scheduleAuto(last) {
    clearTimeout(autoTimer);
    autoTimer = setTimeout(() => advance(), last ? 7000 : AUTO_MS);
  }

  function pulse(last) {
    const h = document.getElementById('watchHint');
    h.textContent = last ? 'Tap to finish' : 'Tap to continue';
    h.classList.add('vis');
    clearTimeout(pulse._t);
    pulse._t = setTimeout(() => h.classList.remove('vis'), 2800);
  }

  function advance() {
    clearTimeout(autoTimer);
    if (!watchReel) return;
    const total = watchReel.body.length + (watchReel.signature ? 1 : 0);
    if (watchStep + 1 >= total) { showEnd(); return; }
    showStep(watchStep + 1);
  }

  function showEnd() {
    clearTimeout(autoTimer);
    document.getElementById('watchEndSig').textContent = watchReel.signature || '';
    document.getElementById('watchEnd').classList.add('vis');
    document.getElementById('watchHint').classList.remove('vis');
  }

  function tapHandler(e) {
    if (e.target.closest('.watch-close') || e.target.closest('.watch-end') || e.target.closest('.watch-mute')) return;
    advance();
  }

  function updateMuteBtn() {
    const btn = document.getElementById('watchMuteBtn');
    if (!btn) return;
    btn.textContent = GlowAudio.getMuted() ? '\uD83D\uDD07' : '\uD83D\uDD0A';
  }

  // ── PUBLIC ────────────────────────────────────────────
  function start(reel) {
    watchReel = reel; watchStep = 0;
    document.getElementById('watchEnd').classList.remove('vis');
    document.getElementById('watchOverlay').classList.add('active');

    // Build pips
    const total = reel.body.length + (reel.signature ? 1 : 0);
    const prog  = document.getElementById('watchProgress');
    prog.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const p = document.createElement('div'); p.className = 'watch-pip'; prog.appendChild(p);
    }

    document.getElementById('watchTagText').textContent = reel.tag;
    updateMuteBtn();
    startBokeh();
    GlowAudio.play(reel.mood || 'hopeful');
    document.getElementById('watchOverlay').addEventListener('click', tapHandler);
    setTimeout(() => showStep(0), 400);
  }

  function close() {
    clearTimeout(autoTimer);
    document.getElementById('watchOverlay').classList.remove('active');
    document.getElementById('watchOverlay').removeEventListener('click', tapHandler);
    stopBokeh(); GlowAudio.stop();
    ['watchTag','watchTitle','watchDivider','watchParagraph','watchSignature'].forEach(id => document.getElementById(id).classList.remove('vis'));
    document.getElementById('watchEnd').classList.remove('vis');
    // Reset pill to Read
    const pill = document.getElementById('reelModePill');
    if (pill) {
      pill.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      const readBtn = pill.querySelector('.pill-btn[data-mode="read"]');
      if (readBtn) readBtn.classList.add('active');
    }
    // Re-show nav pill (watch was on top, reel view is still underneath)
    const navPill = document.getElementById('reelNavPill');
    if (navPill) navPill.classList.add('visible');
  }

  function replay() {
    document.getElementById('watchEnd').classList.remove('vis');
    ['watchTag','watchTitle','watchDivider','watchParagraph','watchSignature'].forEach(id => document.getElementById(id).classList.remove('vis'));
    watchStep = 0;
    GlowAudio.stop(false);
    setTimeout(() => { GlowAudio.play(watchReel.mood || 'hopeful'); showStep(0); }, 300);
  }

  function handleMute() {
    const nowMuted = GlowAudio.toggleMute();
    updateMuteBtn();
    GlowApp.showToast(nowMuted ? 'Music muted' : 'Music on');
  }

  return { start, close, replay, handleMute };
})();
