/* ═══════════════════════════════════════
   GLOW NOTES — feed.js
   Landing, tile grid feed, reel view
═══════════════════════════════════════ */

const GlowFeed = (() => {
  let currentReel = null;
  let pillTimer = null;

  // ── LANDING SCREEN ────────────────────────────────────
  function buildLanding() {
    // Header greeting
    const user = GlowApp.getUser();
    if (user) document.getElementById('userGreeting').textContent = user.name;
  }

  // ── TILE GRID FEED ────────────────────────────────────
  function buildFeed() {
    const user = GlowApp.getUser();
    if (user) document.getElementById('userGreeting').textContent = user.name;

    // Merge: user's public reels first (newest), then featured
    const userPublic = GlowApp.getReels().filter(r => r.visibility === 'public').slice().reverse();
    const featured   = getFeaturedReels();

    // Deduplicate by id
    const seen = new Set();
    const reels = [];
    [...userPublic, ...featured].forEach(r => { if (!seen.has(r.id)) { seen.add(r.id); reels.push(r); } });

    const grid = document.getElementById('feedTileGrid');
    grid.innerHTML = '';

    reels.forEach((reel, i) => {
      const tile = document.createElement('div');
      // Make first user reel wide if it exists
      const isWide = i === 0 && userPublic.length > 0;
      tile.className = 'feed-tile' + (isWide ? ' wide' : '') + (reel.aiGenerated ? ' ai-tile' : '');
      tile.onclick = () => openReel(reel);

      const plainTitle = reel.title.replace(/<[^>]+>/g, '');
      const previewText = reel.body[0].replace(/<[^>]+>/g, '');
      const forLabel = reel.forWho ? `<span class="tile-for">For ${reel.forWho}</span>` : '';
      const aiBadge  = reel.aiGenerated ? `<span class="tile-ai-badge">\u2728 AI</span>` : '';

      tile.innerHTML = `
        <div>
          <div class="tile-tag">${reel.tag}</div>
          <div class="tile-title">${plainTitle}</div>
          ${isWide ? '' : `<div class="tile-preview">${previewText}</div>`}
        </div>
        <div class="tile-footer">
          <div class="tile-mood-dot"></div>
          ${forLabel}${aiBadge}
        </div>`;
      grid.appendChild(tile);
    });

    // + New reel CTA tile
    const cta = document.createElement('div');
    cta.className = 'feed-tile feed-new-cta';
    cta.onclick = () => GlowCreate.start();
    cta.innerHTML = `<div class="feed-new-cta-icon">+</div><div class="feed-new-cta-text">Create a reel</div>`;
    grid.appendChild(cta);
  }

  // ── OPEN REEL (full screen view) ──────────────────────
  function openReel(reel) {
    currentReel = reel;

    const inner = document.getElementById('reelViewInner');
    inner.classList.remove('animating');

    const forLine = reel.forWho
      ? `<div class="reel-meta">For ${reel.forWho}${reel.author ? ' <span>\u00b7</span> by ' + reel.author : ''}</div>`
      : '';
    const aiNote = reel.aiGenerated
      ? `<div class="reel-meta" style="margin-top:.4rem;"><span style="opacity:.35;font-size:.6rem;letter-spacing:.12em;">\u2728 written by claude</span></div>`
      : '';

    document.getElementById('reelViewContent').innerHTML = `
      <div class="reel-tag"><span class="line"></span> ${reel.tag} <span class="line"></span></div>
      <h2 class="reel-title">${reel.title}</h2>
      <div class="reel-divider"></div>
      <div class="reel-body">${reel.body.map(p => '<p>' + p + '</p>').join('')}</div>
      ${reel.signature ? '<div class="reel-signature">' + reel.signature + '</div>' : ''}
      ${forLine}${aiNote}
      <div class="reel-share-bar">
        <button class="btn-reel-action" onclick="GlowFeed.shareReel()">Share</button>
        <button class="btn-reel-action" onclick="GlowCreate.start()">+ New Reel</button>
      </div>`;

    // Reset pill
    const pill = document.getElementById('reelModePill');
    pill.classList.remove('visible');
    pill.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
    pill.querySelector('.pill-btn[data-mode="read"]').classList.add('active');

    GlowApp.showScreen('reelViewScreen');

    // Trigger animations after paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        inner.classList.add('animating');
      });
    });

    // Show pill after 1.8s
    clearTimeout(pillTimer);
    pillTimer = setTimeout(() => pill.classList.add('visible'), 1800);
  }

  function closeReel() {
    GlowApp.showScreen('feedScreen');
    const pill = document.getElementById('reelModePill');
    pill.classList.remove('visible');
    clearTimeout(pillTimer);
  }

  function shareReel() {
    if (!currentReel) return;
    const url = window.location.origin + window.location.pathname + '#' + currentReel.id;
    if (navigator.share) {
      navigator.share({ title: 'Glow Notes', text: "Here\u2019s something I wanted to share with you.", url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => GlowApp.showToast('Link copied'));
    }
  }

  // ── READ / WATCH PILL ─────────────────────────────────
  function setMode(mode) {
    const pill = document.getElementById('reelModePill');
    pill.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
    pill.querySelector(`.pill-btn[data-mode="${mode}"]`).classList.add('active');

    if (mode === 'watch' && currentReel) {
      GlowWatch.start(currentReel);
    }
  }

  // Handle deep-link hash on load
  function checkHash() {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    // Check user reels first, then default
    const all = [...GlowApp.getReels(), ...DEFAULT_REELS];
    const reel = all.find(r => r.id === hash);
    if (reel) setTimeout(() => openReel(reel), 300);
  }

  function getCurrentReel() { return currentReel; }

  return { buildLanding, buildFeed, openReel, closeReel, shareReel, setMode, checkHash, getCurrentReel };
})();
