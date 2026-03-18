/* ═══════════════════════════════════════
   GLOW NOTES — create.js
   Create flow, Claude AI, My Reels
═══════════════════════════════════════ */

const GlowCreate = (() => {
  let state = {};
  let pendingReel = null;

  const GEN_PHRASES = [
    'Reading what you shared...',
    'Finding the right words...',
    'Writing something just for them...',
    'Almost ready...'
  ];

  // ── CLAUDE AI ─────────────────────────────────────────
  async function callClaude(forWho, why, mood, senderName) {

    const moodNotes = {
      hopeful:     'The person needs to feel like something good is possible. Not empty optimism. Real, grounded hope rooted in what they have already shown about themselves.',
      strength:    'The person needs to feel their own strength reflected back at them. Acknowledge what it has cost them to keep going. Make them feel seen in the fight, not just cheered at from the sidelines.',
      comfort:     'The person is hurting and needs to feel less alone in it. Do not try to fix it or rush them through it. Just be present with them in the difficulty. Meet them exactly where they are.',
      celebration: 'The person has done something worth celebrating. Be specific about what they actually did. Make them feel the full weight of the accomplishment before you move on.',
      grief:       'The person is grieving something real. Do not minimize it. Do not rush them toward silver linings. Sit with them in the loss first. Validate before you uplift.',
      courage:     'The person is on the edge of something and needs a push. Not a pep talk. Something real. Remind them of who they actually are and why you believe they can do this specific thing.'
    };

    const lengthNote = why && why.length > 150
      ? 'Write 5 body paragraphs. The context is rich so use it fully.'
      : 'Write 4 body paragraphs.';

    const system = `You are writing a personal message from one human being to another. This is not a motivational post. This is not a greeting card. This is someone who genuinely cares about another person sitting down to write them something real.

Your job is to write as if you are that caring person. As if you have read everything about what is going on with the recipient and you want them to feel completely seen and loved.

THE MOST IMPORTANT RULE: Use the "why" the sender shared as the heart of this message. The specific things they told you about the recipient's situation should shape the whole message. Not vaguely, not as a template. Actually use the details. Weave them in naturally. A message that could have been written for anyone is a failed message.

VOICE RULES - read these carefully:
- Write like a real human who is emotional about this person. Not like an inspirational account. Not like a therapist. Like a friend who loves them.
- No em dashes. No en dashes. Do not use the dash character at all. Use commas, periods, or just end the sentence.
- No perfectly parallel structures like "You are X. You are Y. You are Z." Real people don't write like that.
- Sentences should breathe differently. Some short. Some longer and more winding. Vary it on purpose.
- Don't open paragraphs with "You". Mix up how sentences start.
- Avoid words that sound like AI: "profound", "tapestry", "journey", "navigate", "testament", "resilience" used as a standalone noun, "unwavering".
- Don't be falsely positive. If the situation is hard, acknowledge that it is hard before you try to lift.
- Say something specific. Something that could only be written for this person given what you know about them.
- Wrap 2 to 4 words or short phrases in *asterisks*. These become golden glowing words in the app. Choose the words that deserve the most weight.

WHAT THIS MESSAGE SHOULD DO:
- Make the recipient feel completely seen in their specific situation
- Make them feel genuinely loved by whoever sent this
- Give them something real to hold onto, not just good feelings
- Sound like it came from a human heart, not a content generator

Mood context for this message: ${moodNotes[mood] || moodNotes.hopeful}
${senderName ? 'The sender\'s name is ' + senderName + '.' : ''}
${lengthNote}

Respond with valid JSON only. No markdown. No explanation. Exactly this format:
{"tag":"short evocative label 4 to 6 words","title":"beautiful title personal to this situation","body":["paragraph one","paragraph two","paragraph three","paragraph four"],"signature":"one closing sentence that feels like a real goodbye"}`;

    const userMsg = `Who this is for: ${forWho || 'someone who needs this'}
Mood: ${mood}
${why ? "Here is what is going on with them, and why the sender wants to write this:\n" + why : "No specific context was provided. Write something that feels universal but still deeply personal."}`;

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

    // Post-process: strip any dashes that snuck through
    function cleanAndGlowify(text) {
      return text
        .replace(/ \u2014 /g, ', ')   // em dash with spaces
        .replace(/\u2014/g, ', ')      // em dash without spaces
        .replace(/ \u2013 /g, ', ')    // en dash with spaces
        .replace(/\u2013/g, ', ')      // en dash without spaces
        .replace(/\*(.+?)\*/g, "<span class='glow-word'>$1</span>");
    }

    return {
      id: 'reel-' + Date.now(),
      tag: parsed.tag,
      title: cleanAndGlowify(parsed.title),
      body: parsed.body.map(p => cleanAndGlowify(p)),
      signature: cleanAndGlowify(parsed.signature),
      mood,
      visibility: state.visibility,
      author: GlowApp.getUser() ? GlowApp.getUser().name : 'Anonymous',
      forWho, why,
      aiGenerated: true,
      createdAt: new Date().toISOString()
    };
  }

  function fallbackReel() {
    const matching = DEFAULT_REELS.filter(r => r.mood === (state.mood || 'hopeful'));
    const base = matching[Math.floor(Math.random() * matching.length)] || DEFAULT_REELS[0];
    return {
      ...base,
      id: 'reel-' + Date.now(),
      forWho: state.forWho,
      author: GlowApp.getUser()?.name || 'Anonymous',
      visibility: state.visibility,
      aiGenerated: false,
      createdAt: new Date().toISOString()
    };
  }

  function customReel() {
    const body = state.message.split(/\n\n+/).filter(p => p.trim()).map(p =>
      p.trim()
        .replace(/ \u2014 /g, ', ').replace(/\u2014/g, ', ')
        .replace(/ \u2013 /g, ', ').replace(/\u2013/g, ', ')
        .replace(/\*(.+?)\*/g, "<span class='glow-word'>$1</span>")
    );
    const titleHTML = state.title
      .replace(/ \u2014 /g, ', ').replace(/\u2014/g, ', ')
      .replace(/\*(.+?)\*/g, "<span class='glow-word'>$1</span>");
    const id = state.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'reel-' + Date.now();
    const tags = { hopeful:'A Message of Hope', strength:'Inner Strength', comfort:'Comfort and Care', celebration:'Celebration', grief:'On Healing', courage:'On Courage' };
    return {
      id, title: titleHTML,
      tag: tags[state.mood] || 'A Personal Note',
      body, signature: state.signature || '',
      mood: state.mood,
      visibility: state.visibility,
      author: GlowApp.getUser()?.name || 'Anonymous',
      forWho: state.forWho,
      why: state.why,
      createdAt: new Date().toISOString()
    };
  }

  // ── FLOW ──────────────────────────────────────────────
  function start() {
    state = { forWho:'', why:'', mood:'', messageType:'', visibility:'public', title:'', message:'', signature:'' };
    document.querySelectorAll('#createScreen .step').forEach(s => s.classList.remove('active-step'));
    document.querySelector('#createScreen .step[data-step="1"]').classList.add('active-step');
    ['createFor','createWhy','createTitle','createMessage','createSignature'].forEach(id => {
      document.getElementById(id).value = '';
    });
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
    el.classList.add('selected');
    state.mood = el.dataset.mood;
    document.getElementById('moodNext').disabled = false;
  }

  function selectMessageType(el) {
    document.querySelectorAll('.choice-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    state.messageType = el.dataset.choice;
    document.getElementById('customMessageArea').style.display = el.dataset.choice === 'custom' ? 'block' : 'none';
    document.getElementById('msgNext').disabled = false;
  }

  function selectVisibility(el) {
    document.querySelectorAll('.vis-option').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    state.visibility = el.dataset.vis;
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
      gs.textContent = 'Writing something just for them';
      const timer = setInterval(() => {
        pi = (pi + 1) % GEN_PHRASES.length;
        gt.textContent = GEN_PHRASES[pi];
      }, 2200);

      try {
        const reel = await callClaude(
          state.forWho, state.why, state.mood,
          GlowApp.getUser()?.name || ''
        );
        clearInterval(timer);
        genEl.classList.remove('show');
        showPreview(reel);
      } catch(err) {
        clearInterval(timer);
        console.error('Generation failed:', err);
        gt.textContent = 'Using our library...';
        setTimeout(() => {
          genEl.classList.remove('show');
          showPreview(fallbackReel());
        }, 900);
      }
    } else {
      setTimeout(() => {
        genEl.classList.remove('show');
        showPreview(customReel());
      }, 1200);
    }
  }

  // ── PREVIEW ───────────────────────────────────────────
  function showPreview(reel) {
    pendingReel = reel;
    const fl = reel.forWho
      ? `<div class="reel-meta" style="opacity:.5;margin-top:1.5rem;">For ${reel.forWho} by ${reel.author}</div>`
      : '';
    const badge = reel.aiGenerated
      ? `<div style="margin-top:.6rem;font-family:'Cormorant Garamond',serif;font-size:.6rem;letter-spacing:.12em;color:var(--gold);opacity:.4;">written with care</div>`
      : '';
    document.getElementById('previewContent').innerHTML = `
      <div class="reel-tag" style="opacity:1;transform:none;"><span class="line"></span> ${reel.tag} <span class="line"></span></div>
      <h2 class="reel-title" style="opacity:1;transform:none;">${reel.title}</h2>
      <div class="reel-divider" style="opacity:1;"></div>
      <div class="reel-body" style="opacity:1;transform:none;">${reel.body.map(p => '<p>' + p + '</p>').join('')}</div>
      ${reel.signature ? '<div class="reel-signature" style="opacity:1;transform:none;">' + reel.signature + '</div>' : ''}
      ${fl}${badge}`;
    document.querySelector('.preview-label').textContent = 'Preview Your Reel';
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
    btn.disabled = true;
    btn.textContent = 'Publishing...';

    GlowApp.addReel(pendingReel);
    const url = window.location.origin + window.location.pathname + '#' + pendingReel.id;

    await GlowApp.postForm({
      _subject: 'New Reel: ' + pendingReel.title.replace(/<[^>]+>/g, ''),
      creator_name:  GlowApp.getUser()?.name  || 'Anon',
      creator_email: GlowApp.getUser()?.email || '',
      reel_for:      pendingReel.forWho,
      reel_mood:     pendingReel.mood,
      reel_why:      pendingReel.why || '',
      ai_generated:  pendingReel.aiGenerated || false,
      reel_url:      url
    });

    const user = GlowApp.getUser();
    if (user?.email) {
      const ok = await GlowApp.sendEmail(user.name, user.email, pendingReel.forWho || 'someone special', url);
      GlowApp.showToast(ok ? 'Reel published and confirmation sent' : 'Reel published');
    } else {
      GlowApp.showToast('Reel published');
    }

    btn.disabled = false;
    btn.textContent = 'Publish';
    const saved = pendingReel;
    pendingReel = null;
    GlowFeed.openReel(saved);
  }

  // ── MY REELS ──────────────────────────────────────────
  function buildMyReels() {
    const reels = GlowApp.getReels();
    const header = document.getElementById('myReelsHeader');
    header.innerHTML = `
      <div class="my-reels-title">My Reels</div>
      <div class="my-reels-sub">${reels.length} reel${reels.length !== 1 ? 's' : ''} created</div>`;

    const grid = document.getElementById('myReelsGrid');
    const empty = document.getElementById('myReelsEmpty');

    if (reels.length === 0) {
      grid.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';
    grid.innerHTML = '';

    reels.slice().reverse().forEach(reel => {
      const t    = reel.title.replace(/<[^>]+>/g, '');
      const vis  = reel.visibility === 'public' ? 'Public' : 'Private';
      const date = new Date(reel.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const tile = document.createElement('div');
      tile.className = 'feed-tile' + (reel.aiGenerated ? ' ai-tile' : '');
      tile.onclick = () => GlowFeed.openReel(reel);
      tile.innerHTML = `
        <div>
          <div class="tile-tag">${reel.tag}</div>
          <div class="tile-title">${t}</div>
          ${reel.forWho ? '<div style="font-size:.65rem;color:var(--gold-light);opacity:.6;margin-top:4px;">For ' + reel.forWho + '</div>' : ''}
        </div>
        <div class="tile-footer">
          <span style="font-size:.6rem;opacity:.4;">${vis} · ${date}</span>
        </div>`;
      grid.appendChild(tile);
    });
  }

  return {
    start, cancel, nextStep, prevStep,
    selectMood, selectMessageType, selectVisibility,
    generate, backToEdit, publish, buildMyReels
  };
})();
