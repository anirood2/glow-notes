/* ═══════════════════════════════════════
   GLOW NOTES — create.js
   Create flow, Claude AI, My Reels
═══════════════════════════════════════ */

const GlowCreate = (() => {
  let state = {};
  let pendingReel = null;

  const GEN_PHRASES = [
    'Reading what you shared\u2026',
    'Finding the right words\u2026',
    'Writing something just for them\u2026',
    'Almost ready\u2026'
  ];

  const MOOD_GUIDES = {
    hopeful:     'hopeful, forward-looking, warm \u2014 like a sunrise. Focus on possibility and what is still ahead.',
    strength:    'empowering, grounded, real \u2014 like a mentor who has seen hard things. Focus on resilience already demonstrated.',
    comfort:     'gentle, soft, accepting \u2014 like a close friend who just shows up. Meet them exactly where they are.',
    celebration: 'joyful, proud, specific \u2014 like a toast at the best kind of party. Focus on what they actually achieved.',
    grief:       'tender, honest, patient \u2014 like someone who knows grief can\u2019t be rushed. Validate the pain without trying to fix it.',
    courage:     'activating, believing, clear \u2014 like a coach who knows you\u2019re ready. Focus on the specific step in front of them.'
  };

  // ── CLAUDE AI ─────────────────────────────────────────
  async function callClaude(forWho, why, mood, senderName) {
    const lengthGuide = why && why.length > 200
      ? 'Write 5\u20136 body paragraphs since the context is rich.'
      : 'Write 4\u20135 body paragraphs.';

    const system = `You are the emotional intelligence behind Glow Notes \u2014 a platform creating deeply personal, moving messages for people who need to feel seen, loved, and uplifted.

Write a reel: a structured, cinematic personal message displayed one paragraph at a time on a mobile app. It must feel like it was written by someone who genuinely knows and cares about this person \u2014 not a greeting card.

TONE HIERARCHY:
1. Warm and personal \u2014 like a close friend who truly sees them
2. Grounded and real \u2014 honest, not fluffy, not toxic positivity
3. Poetic when the moment calls for it \u2014 lyrical and moving, but earned

RULES:
- Use the "why" as your creative brief. Weave specific emotional truths from it into the message \u2014 don\u2019t quote it back verbatim.
- Reference the recipient\u2019s name (${forWho || 'the recipient'}) naturally but meaningfully.
- Make it stop-scrolling emotional. It must trigger genuine feeling.
- Avoid hollow clich\u00e9s: "you\u2019ve got this", "chin up", "everything happens for a reason".
- No toxic positivity. Acknowledge the hard thing. Then lift.
- Wrap 2\u20134 emotionally significant words/phrases in *asterisks* \u2014 these become golden glowing words in the UI.
- ${lengthGuide}
- One-sentence poetic closing signature.
- Tag: short evocative label (4\u20136 words max).
- Title: beautiful, memorable, personal to this situation.

Mood: ${MOOD_GUIDES[mood] || MOOD_GUIDES.hopeful}
Sender: ${senderName || 'anonymous'}

Respond ONLY with valid JSON. No markdown. No preamble:
{"tag":"...","title":"...","body":["...","...","...","..."],"signature":"..."}`;

    const userMsg = `Recipient: ${forWho || 'Someone who needs this'}
Mood: ${mood}
${why ? 'Context \u2014 what\u2019s going on:\n' + why : 'No context \u2014 write something universally meaningful.'}
${senderName ? 'From: ' + senderName : ''}`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system,
        messages: [{ role: 'user', content: userMsg }]
      })
    });

    const data = await res.json();
    const raw  = data.content?.[0]?.text || '';
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());

    const glowify = t => t.replace(/\*(.+?)\*/g, "<span class='glow-word'>$1</span>");

    return {
      id: 'reel-' + Date.now(),
      tag: parsed.tag,
      title: glowify(parsed.title),
      body: parsed.body.map(p => glowify(p)),
      signature: parsed.signature,
      mood, visibility: state.visibility,
      author: GlowApp.getUser() ? GlowApp.getUser().name : 'Anonymous',
      forWho, why, aiGenerated: true,
      createdAt: new Date().toISOString()
    };
  }

  function fallbackReel() {
    const matching = DEFAULT_REELS.filter(r => r.mood === (state.mood || 'hopeful'));
    const base = matching[Math.floor(Math.random() * matching.length)] || DEFAULT_REELS[0];
    return { ...base, id: 'reel-' + Date.now(), forWho: state.forWho, author: GlowApp.getUser()?.name || 'Anonymous', visibility: state.visibility, aiGenerated: false, createdAt: new Date().toISOString() };
  }

  function customReel() {
    const body = state.message.split(/\n\n+/).filter(p => p.trim()).map(p => p.trim().replace(/\*(.+?)\*/g, "<span class='glow-word'>$1</span>"));
    const titleHTML = state.title.replace(/\*(.+?)\*/g, "<span class='glow-word'>$1</span>");
    const id = state.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'reel-' + Date.now();
    const tags = { hopeful:'A Message of Hope', strength:'Inner Strength', comfort:'Comfort & Care', celebration:'Celebration', grief:'On Healing', courage:'On Courage' };
    return { id, title: titleHTML, tag: tags[state.mood] || 'A Personal Note', body, signature: state.signature || '', mood: state.mood, visibility: state.visibility, author: GlowApp.getUser()?.name || 'Anonymous', forWho: state.forWho, why: state.why, createdAt: new Date().toISOString() };
  }

  // ── FLOW ──────────────────────────────────────────────
  function start() {
    state = { forWho:'', why:'', mood:'', messageType:'', visibility:'public', title:'', message:'', signature:'' };
    document.querySelectorAll('#createScreen .step').forEach(s => s.classList.remove('active-step'));
    document.querySelector('#createScreen .step[data-step="1"]').classList.add('active-step');
    ['createFor','createWhy','createTitle','createMessage','createSignature'].forEach(id => { document.getElementById(id).value = ''; });
    document.querySelectorAll('.mood-card,.choice-card').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.vis-option').forEach(c => c.classList.remove('selected'));
    document.querySelector('.vis-option[data-vis="public"]').classList.add('selected');
    document.getElementById('customMessageArea').style.display = 'none';
    document.getElementById('moodNext').disabled = true;
    document.getElementById('msgNext').disabled = true;
    document.getElementById('generatingState').classList.remove('show');
    GlowApp.showScreen('createScreen');
  }

  function cancel() { GlowApp.showScreen('feedScreen'); }

  function nextStep(n) {
    if (n === 2) state.forWho = document.getElementById('createFor').value.trim();
    if (n === 3) state.why   = document.getElementById('createWhy').value.trim();
    if (n === 5 && state.messageType === 'custom') {
      state.title     = document.getElementById('createTitle').value.trim();
      state.message   = document.getElementById('createMessage').value.trim();
      state.signature = document.getElementById('createSignature').value.trim();
      if (!state.title || !state.message) { GlowApp.showToast('Please fill in the title and message'); return; }
    }
    document.querySelectorAll('#createScreen .step').forEach(s => s.classList.remove('active-step'));
    const nx = document.querySelector(`#createScreen .step[data-step="${n}"]`);
    if (nx) nx.classList.add('active-step');
  }

  function prevStep(n) {
    document.querySelectorAll('#createScreen .step').forEach(s => s.classList.remove('active-step'));
    const p = document.querySelector(`#createScreen .step[data-step="${n}"]`);
    if (p) p.classList.add('active-step');
  }

  function selectMood(el) {
    document.querySelectorAll('.mood-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected'); state.mood = el.dataset.mood;
    document.getElementById('moodNext').disabled = false;
  }

  function selectMessageType(el) {
    document.querySelectorAll('.choice-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected'); state.messageType = el.dataset.choice;
    document.getElementById('customMessageArea').style.display = el.dataset.choice === 'custom' ? 'block' : 'none';
    document.getElementById('msgNext').disabled = false;
  }

  function selectVisibility(el) {
    document.querySelectorAll('.vis-option').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected'); state.visibility = el.dataset.vis;
  }

  // ── GENERATE ──────────────────────────────────────────
  async function generate() {
    document.querySelectorAll('#createScreen .step').forEach(s => s.classList.remove('active-step'));
    const genEl = document.getElementById('generatingState');
    genEl.classList.add('show');

    if (state.messageType === 'ai') {
      let pi = 0;
      const gt = document.getElementById('genText');
      const gs = document.getElementById('genStatus');
      gt.textContent = GEN_PHRASES[0];
      gs.textContent = 'Claude is writing something just for them';
      const timer = setInterval(() => { pi = (pi + 1) % GEN_PHRASES.length; gt.textContent = GEN_PHRASES[pi]; }, 2200);

      try {
        const reel = await callClaude(state.forWho, state.why, state.mood, GlowApp.getUser()?.name || '');
        clearInterval(timer); genEl.classList.remove('show');
        showPreview(reel);
      } catch(err) {
        clearInterval(timer);
        console.error('Claude failed:', err);
        gt.textContent = 'Using our library\u2026';
        setTimeout(() => { genEl.classList.remove('show'); showPreview(fallbackReel()); }, 900);
      }
    } else {
      setTimeout(() => { genEl.classList.remove('show'); showPreview(customReel()); }, 1200);
    }
  }

  // ── PREVIEW ───────────────────────────────────────────
  function showPreview(reel) {
    pendingReel = reel;
    const fl = reel.forWho ? `<div class="reel-meta" style="opacity:.5;margin-top:1.5rem;">For ${reel.forWho} <span>\u00b7</span> by ${reel.author}</div>` : '';
    const badge = reel.aiGenerated ? `<div style="margin-top:.6rem;font-family:'Cormorant Garamond',serif;font-size:.6rem;letter-spacing:.12em;color:var(--gold);opacity:.4;">\u2728 written by claude</div>` : '';
    document.getElementById('previewContent').innerHTML = `
      <div class="reel-tag" style="opacity:1;transform:none;"><span class="line"></span> ${reel.tag} <span class="line"></span></div>
      <h2 class="reel-title" style="opacity:1;transform:none;">${reel.title}</h2>
      <div class="reel-divider" style="opacity:1;"></div>
      <div class="reel-body" style="opacity:1;transform:none;">${reel.body.map(p => '<p>' + p + '</p>').join('')}</div>
      ${reel.signature ? '<div class="reel-signature" style="opacity:1;transform:none;">' + reel.signature + '</div>' : ''}
      ${fl}${badge}`;
    document.querySelector('.preview-label').textContent = '\u2728 Preview Your Reel';
    document.querySelector('.preview-actions').innerHTML =
      '<button class="btn-step btn-back" onclick="GlowCreate.backToEdit()">Edit</button>' +
      '<button class="btn-step btn-next" onclick="GlowCreate.publish()">Publish</button>';
    GlowApp.showScreen('previewScreen');
  }

  function backToEdit() {
    GlowApp.showScreen('createScreen');
    document.querySelectorAll('#createScreen .step').forEach(s => s.classList.remove('active-step'));
    document.querySelector('#createScreen .step[data-step="4"]').classList.add('active-step');
  }

  // ── PUBLISH ───────────────────────────────────────────
  async function publish() {
    if (!pendingReel) return;
    const btn = document.querySelector('.preview-actions .btn-next');
    btn.disabled = true; btn.textContent = 'Publishing\u2026';

    GlowApp.addReel(pendingReel);
    const url = window.location.origin + window.location.pathname + '#' + pendingReel.id;

    await GlowApp.postForm({ _subject:'New Reel: '+pendingReel.title.replace(/<[^>]+>/g,''), creator_name:GlowApp.getUser()?.name||'Anon', creator_email:GlowApp.getUser()?.email||'', reel_for:pendingReel.forWho, reel_mood:pendingReel.mood, reel_why:pendingReel.why||'', ai_generated:pendingReel.aiGenerated||false, reel_url:url });

    const user = GlowApp.getUser();
    if (user?.email) {
      const ok = await GlowApp.sendEmail(user.name, user.email, pendingReel.forWho || 'someone special', url);
      GlowApp.showToast(ok ? 'Reel published! Confirmation sent \u2728' : 'Reel published \u2728');
    } else { GlowApp.showToast('Reel published \u2728'); }

    btn.disabled = false; btn.textContent = 'Publish';
    const saved = pendingReel; pendingReel = null;

    // Go to reel view directly
    GlowFeed.openReel(saved);
  }

  // ── MY REELS ──────────────────────────────────────────
  function buildMyReels() {
    const reels = GlowApp.getReels();
    const header = document.getElementById('myReelsHeader');
    header.innerHTML = `<div class="my-reels-title">My Reels</div><div class="my-reels-sub">${reels.length} reel${reels.length !== 1 ? 's' : ''} created</div>`;

    const grid = document.getElementById('myReelsGrid');
    if (reels.length === 0) {
      grid.innerHTML = '';
      document.getElementById('myReelsEmpty').style.display = 'block';
      return;
    }
    document.getElementById('myReelsEmpty').style.display = 'none';
    grid.innerHTML = '';

    reels.slice().reverse().forEach(reel => {
      const t    = reel.title.replace(/<[^>]+>/g, '');
      const vis  = reel.visibility === 'public' ? '\uD83C\uDF0D' : '\uD83D\uDD12';
      const date = new Date(reel.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric' });
      const tile = document.createElement('div');
      tile.className = 'feed-tile' + (reel.aiGenerated ? ' ai-tile' : '');
      tile.onclick = () => GlowFeed.openReel(reel);
      tile.innerHTML = `
        <div>
          <div class="tile-tag">${reel.tag}</div>
          <div class="tile-title">${t}</div>
          ${reel.forWho ? '<div class="tile-for" style="font-size:.65rem;color:var(--gold-light);opacity:.6;margin-top:4px;">For ' + reel.forWho + '</div>' : ''}
        </div>
        <div class="tile-footer">
          <span style="font-size:.6rem;opacity:.4;">${vis} ${date}</span>
          ${reel.aiGenerated ? '<span class="tile-ai-badge">\u2728 AI</span>' : ''}
        </div>`;
      grid.appendChild(tile);
    });
  }

  return { start, cancel, nextStep, prevStep, selectMood, selectMessageType, selectVisibility, generate, backToEdit, publish, buildMyReels };
})();
