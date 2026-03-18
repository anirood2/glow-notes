/* ═══════════════════════════════════════
   GLOW NOTES — feed.js
   Feed, navigation, swipe, sharing
═══════════════════════════════════════ */

const GlowFeed = (() => {
  let allReels = [];
  let currentIndex = 0;
  let isTransitioning = false;
  let toggleTimers = {};

  // ── BUILD FEED ────────────────────────────────────────
  function build() {
    const userReels = GlowApp.getUserReels();
    allReels = [...DEFAULT_REELS];
    userReels.forEach(r => { if (r.visibility === 'public') allReels.push(r); });

    const track = document.getElementById('reelTrack');
    track.innerHTML = '';
    track.style.transform = 'translateY(0)';
    currentIndex = 0;

    allReels.forEach((reel, i) => {
      const s = document.createElement('section');
      s.className = 'reel' + (i === 0 ? ' active' : '');
      s.dataset.id = reel.id;

      const forLine = reel.forWho
        ? `<div class="reel-meta">For ${reel.forWho}${reel.author ? ' <span>\u00b7</span> by ' + reel.author : ''}</div>`
        : '';
      const aiBadge = reel.aiGenerated
        ? `<div class="reel-meta" style="margin-top:.4rem;"><span style="opacity:.35;font-size:.6rem;letter-spacing:.12em;">\u2728 written by claude</span></div>`
        : '';

      s.innerHTML = `
        <div class="reel-content">
          <div class="reel-tag"><span class="line"></span> ${reel.tag} <span class="line"></span></div>
          <h2 class="reel-title">${reel.title}</h2>
          <div class="reel-divider"></div>
          <div class="reel-body">${reel.body.map(p => '<p>' + p + '</p>').join('')}</div>
          ${reel.signature ? '<div class="reel-signature">' + reel.signature + '</div>' : ''}
          ${forLine}${aiBadge}
        </div>
        <div class="reel-mode-toggle" id="toggle-${i}">
          <button class="toggle-btn active" onclick="GlowFeed.setMode(${i},'read',event)">\uD83D\uDCD6 Read</button>
          <button class="toggle-btn" onclick="GlowFeed.setMode(${i},'watch',event)">\u25B6 Watch</button>
        </div>`;
      track.appendChild(s);
    });

    buildNav();
    updateCounter();
    if (GlowApp.getCurrentUser()) {
      document.getElementById('userGreeting').textContent = GlowApp.getCurrentUser().name;
    }
    scheduleToggle(0);

    const hash = window.location.hash.slice(1);
    if (hash) {
      const idx = allReels.findIndex(r => r.id === hash);
      if (idx > 0) setTimeout(() => goTo(idx), 200);
    }
  }

  // ── NAVIGATION ────────────────────────────────────────
  function buildNav() {
    const nav = document.getElementById('reelNav');
    nav.innerHTML = '';
    allReels.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'nav-dot' + (i === currentIndex ? ' active-dot' : '');
      d.addEventListener('click', () => goTo(i));
      nav.appendChild(d);
    });
  }

  function updateCounter() {
    document.getElementById('reelCounter').textContent = `${currentIndex + 1} / ${allReels.length}`;
  }

  function goTo(index) {
    const reels = document.querySelectorAll('#reelTrack .reel');
    if (isTransitioning || index === currentIndex || index < 0 || index >= reels.length) return;

    isTransitioning = true;
    reels[currentIndex].classList.remove('active');
    resetAnimations(reels[currentIndex]);
    const ot = document.getElementById('toggle-' + currentIndex);
    if (ot) ot.classList.remove('visible');

    currentIndex = index;
    document.getElementById('reelTrack').style.transform = `translateY(-${currentIndex * 100}vh)`;
    document.querySelectorAll('.nav-dot').forEach((d, i) => d.classList.toggle('active-dot', i === currentIndex));
    if (currentIndex > 0) document.getElementById('scrollHint').style.opacity = '0';
    updateCounter();

    setTimeout(() => {
      reels[currentIndex].classList.add('active');
      isTransitioning = false;
      scheduleToggle(currentIndex);
    }, 400);

    history.replaceState(null, '', '#' + allReels[currentIndex].id);
  }

  function resetAnimations(reel) {
    reel.querySelectorAll('.reel-tag,.reel-title,.reel-divider,.reel-body,.reel-signature,.reel-meta').forEach(el => {
      el.style.animation = 'none'; el.offsetHeight; el.style.animation = '';
      el.style.opacity = '0'; el.style.transform = 'translateY(20px)';
    });
  }

  function scheduleToggle(i) {
    clearTimeout(toggleTimers[i]);
    toggleTimers[i] = setTimeout(() => {
      const t = document.getElementById('toggle-' + i);
      if (t) t.classList.add('visible');
    }, 2200);
  }

  function setMode(i, mode, e) {
    e.stopPropagation();
    const t = document.getElementById('toggle-' + i); if (!t) return;
    t.querySelectorAll('.toggle-btn').forEach(b => {
      b.classList.remove('active');
      if ((mode === 'read' && b.textContent.includes('Read')) ||
          (mode === 'watch' && b.textContent.includes('Watch'))) b.classList.add('active');
    });
    if (mode === 'watch') GlowWatch.start(allReels[i]);
  }

  // ── SHARE ─────────────────────────────────────────────
  function shareCurrent() {
    const reel = allReels[currentIndex];
    const url = window.location.origin + window.location.pathname + '#' + reel.id;
    if (navigator.share) {
      navigator.share({ title: 'Glow Notes', text: "Here\u2019s something I wanted to share with you.", url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => GlowApp.showToast('Link copied'));
    }
  }

  // ── SWIPE / WHEEL / KEYS ──────────────────────────────
  let touchStartY = 0, touchStartTime = 0;

  document.addEventListener('touchstart', e => {
    if (!document.getElementById('feedScreen').classList.contains('active')) return;
    touchStartY = e.touches[0].clientY; touchStartTime = Date.now();
  }, { passive: true });

  document.addEventListener('touchend', e => {
    if (!document.getElementById('feedScreen').classList.contains('active')) return;
    const dy = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 50 && (Date.now() - touchStartTime) < 500) {
      dy > 0 ? goTo(currentIndex + 1) : goTo(currentIndex - 1);
    }
  }, { passive: true });

  let wheelTimer;
  document.addEventListener('wheel', e => {
    if (!document.getElementById('feedScreen').classList.contains('active')) return;
    e.preventDefault();
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => {
      e.deltaY > 30 ? goTo(currentIndex + 1) : e.deltaY < -30 ? goTo(currentIndex - 1) : null;
    }, 50);
  }, { passive: false });

  document.addEventListener('keydown', e => {
    if (!document.getElementById('feedScreen').classList.contains('active')) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); goTo(currentIndex + 1); }
    if (e.key === 'ArrowUp') { e.preventDefault(); goTo(currentIndex - 1); }
  });

  function getCurrentIndex() { return currentIndex; }
  function getAllReels() { return allReels; }

  return { build, goTo, setMode, shareCurrent, getCurrentIndex, getAllReels };
})();
