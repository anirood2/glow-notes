/* ═══════════════════════════════════════
   GLOW NOTES — create.js
   Create flow + Claude AI generation
═══════════════════════════════════════ */

const GlowCreate = (() => {
  let state = {};
  let pendingReel = null;

  const GEN_PHRASES = [
    'Reading what you shared\u2026',
    'Finding the right words\u2026',
    'Writing something just for them\u2026',
    'Almost there\u2026'
  ];

  // ── MOOD SYSTEM PROMPT ────────────────────────────────
  const MOOD_GUIDES = {
    hopeful:     'hopeful, forward-looking, warm \u2014 like a sunrise. Focus on possibility, on what is still ahead, on the green shoots already visible.',
    strength:    'empowering, grounded, real \u2014 like a mentor who has seen hard things and come through. Focus on the resilience already demonstrated and what it reveals about who this person is.',
    comfort:     'gentle, soft, accepting \u2014 like a close friend who just shows up and sits with you. Focus on meeting them exactly where they are, not where they should be.',
    celebration: 'joyful, proud, specific \u2014 like a toast at the best kind of party. Focus on what they actually achieved and who they had to become to get there.',
    grief:       'tender, honest, patient \u2014 like someone who has sat with grief before and knows it can\u2019t be rushed. Focus on validating the pain without trying to fix it.',
    courage:     'activating, believing, clear \u2014 like a coach who has seen you practice and knows you\u2019re ready. Focus on the specific step in front of them and why they can take it.'
  };

  async function generateWithClaude(forWho, why, mood, senderName) {
    const lengthGuide = why && why.length > 200
      ? 'Write 5\u20136 body paragraphs since the context is rich and detailed.'
      : 'Write 4\u20135 body paragraphs.';

    const systemPrompt = `You are the emotional intelligence behind Glow Notes \u2014 a platform that creates deeply personal, moving messages for people who need to feel seen, loved, and uplifted.

Your job is to write a reel: a structured, cinematic personal message displayed one paragraph at a time on a mobile app with a candlelight aesthetic. It must feel like it was written by someone who genuinely knows this person and cares about them \u2014 not a greeting card, not a therapist, not a robot.

TONE HIERARCHY (apply in this order):
1. Warm and personal \u2014 like a close friend who truly sees them
2. Grounded and real \u2014 honest, not fluffy, not toxic positivity
3. Poetic when the moment calls for it \u2014 lyrical and moving, but always earned

RULES:
- Use the "why" as your creative brief. Weave specific emotional truths from it into the message without quoting it back verbatim.
- Reference the recipient\u2019s name (${forWho || 'the recipient'}) naturally \u2014 not in every paragraph, but meaningfully.
- The message should trigger genuine feeling. It should make someone stop scrolling.
- Avoid hollow clich\u00e9s: "you\u2019ve got this", "chin up", "everything happens for a reason". Write something that feels true.
- Avoid toxic positivity. Don\u2019t minimize the hard thing. Acknowledge it, then lift.
- Wrap 2\u20134 emotionally significant words or phrases in *asterisks* \u2014 these become golden glowing words in the UI.
- ${lengthGuide}
- Write a short, poetic closing signature (1 sentence maximum).
- The tag is a short evocative label (4\u20136 words max).
- The title should be beautiful, memorable, and feel personal to this situation.

Mood guide for this reel: ${MOOD_GUIDES[mood] || MOOD_GUIDES.hopeful}
Sender\u2019s name: ${senderName || 'anonymous'}

Respond ONLY with valid JSON. No markdown. No preamble. Format exactly:
{
  "tag": "short evocative label",
  "title": "beautiful title here",
  "body": ["paragraph one", "paragraph two", "paragraph three", "paragraph four"],
  "signature": "one line closing"
}`;

    const userMessage = `Create a Glow Notes reel:

Recipient: ${forWho || 'Someone who needs this'}
Mood: ${mood}
${why ? `Context \u2014 what\u2019s going on with them:\n${why}` : 'No specific context \u2014 write something universally meaningful.'}
${senderName ? `From: ${senderName}` : ''}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }]
      })
    });

    const data = await response.json();
    const raw = data.content?.[0]?.text || '';
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    function glowify(text) {
      return text.replace(/\*(.+?)\*/g, "<span class='glow-word'>$1</span>");
    }

    return {
      id: 'reel-' + Date.now(),
      tag: parsed.tag,
      title: glowify(parsed.title),
      body: parsed.body.map(p => glowify(p)),
      signature: parsed.signature,
      mood,
      visibility: state.visibility,
      author: GlowApp.getCurrentUser() ? GlowApp.getCurrentUser().name : 'Anonymous',
      forWho,
      why,
      aiGenerated: true,
      createdAt: new Date().toISOString()
    };
  }

  function buildFallbackReel() {
    const mood = state.mood || 'hopeful';
    const matching = DEFAULT_REELS.filter(r => r.mood === mood);
    const base = matching[Math.floor(Math.random() * matching.length)] || DEFAULT_REELS[0];
    return {
      ...base,
      id: 'reel-' + Date.now(),
      forWho: state.forWho,
      author: GlowApp.getCurrentUser() ? GlowApp.getCurrentUser().name : 'Anonymous',
      visibility: state.visibility,
      aiGenerated: false,
      createdAt: new Date().toISOString()
    };
  }

  function buildCustomReel() {
    const paragraphs = state.message.split(/\n\n+/).filter(p => p.trim());
    const body = paragraphs.map(p => p.trim().replace(/\*(.+?)\*/g, "<span class='glow-word'>$1</span>"));
    const titleHTML = state.title.replace(/\*(.+?)\*/g, "<span class='glow-word'>$1</span>");
    const id = state.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'reel-' + Date.now();
    const moodTags = { hopeful:'A Message of Hope', strength:'Inner Strength', comfort:'Comfort & Care', celebration:'Celebration', grief:'On Healing', courage:'On Courage' };
    return {
      id, title: titleHTML,
      tag: moodTags[state.mood] || 'A Personal Note',
      body, signature: state.signature || '',
      mood: state.mood,
      visibility: state.visibility,
      author: GlowApp.getCurrentUser() ? GlowApp.getCurrentUser().name : 'Anonymous',
      forWho: state.forWho, why: state.why,
      createdAt: new Date().toISOString()
    };
  }

  // ── FLOW CONTROLS ─────────────────────────────────────
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
    if (n === 3) state.why = document.getElementById('createWhy').value.trim();
    if (n === 5 && state.messageType === 'custom') {
      state.title = document.getElementById('createTitle').value.trim();
      state.message = document.getElementById('createMessage').value.trim();
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
    const genState = document.getElementById('generatingState');
    genState.classList.add('show');

    if (state.messageType === 'ai') {
      let phraseIdx = 0;
      const genText = document.getElementById('genText');
      const genStatus = document.getElementById('genStatus');
      genText.textContent = GEN_PHRASES[0];
      genStatus.textContent = 'Claude is writing something just for them';
      const phraseTimer = setInterval(() => {
        phraseIdx = (phraseIdx + 1) % GEN_PHRASES.length;
        genText.textContent = GEN_PHRASES[phraseIdx];
      }, 2200);

      try {
        const reel = await generateWithClaude(
          state.forWho, state.why, state.mood,
          GlowApp.getCurrentUser() ? GlowApp.getCurrentUser().name : ''
        );
        clearInterval(phraseTimer);
        genState.classList.remove('show');
        showPreview(reel);
      } catch (err) {
        clearInterval(phraseTimer);
        console.error('Claude generation failed:', err);
        document.getElementById('genText').textContent = 'Using our library instead\u2026';
        setTimeout(() => {
          genState.classList.remove('show');
          showPreview(buildFallbackReel());
        }, 1000);
      }
    } else {
      setTimeout(() => {
        genState.classList.remove('show');
        showPreview(buildCustomReel());
      }, 1200);
    }
  }

  // ── PREVIEW ───────────────────────────────────────────
  function showPreview(reel) {
    pendingReel = reel;
    const fl = reel.forWho ? `<div class="reel-meta" style="opacity:.5;margin-top:2rem;">For ${reel.forWho} <span>\u00b7</span> by ${reel.author}</div>` : '';
    const badge = reel.aiGenerated ? `<div style="margin-top:.8rem;font-family:'Cormorant Garamond',serif;font-size:.6rem;letter-spacing:.12em;color:var(--gold);opacity:.4;">\u2728 written by claude</div>` : '';
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
    const pubBtn = document.querySelector('.preview-actions .btn-next');
    pubBtn.disabled = true; pubBtn.textContent = 'Publishing\u2026';

    GlowApp.addUserReel(pendingReel);
    const reelUrl = window.location.origin + window.location.pathname + '#' + pendingReel.id;

    await GlowApp.submitToFormspree({
      _subject: 'New Reel: ' + pendingReel.title.replace(/<[^>]+>/g, ''),
      creator_name: GlowApp.getCurrentUser() ? GlowApp.getCurrentUser().name : 'Anonymous',
      creator_email: GlowApp.getCurrentUser() ? GlowApp.getCurrentUser().email : '',
      reel_for: pendingReel.forWho,
      reel_mood: pendingReel.mood,
      reel_why: pendingReel.why || '',
      ai_generated: pendingReel.aiGenerated || false,
      reel_url: reelUrl
    });

    const user = GlowApp.getCurrentUser();
    if (user && user.email) {
      const ok = await GlowApp.sendConfirmationEmail(user.name, user.email, pendingReel.forWho || 'someone special', reelUrl);
      GlowApp.showToast(ok ? 'Reel published! Confirmation sent \u2728' : 'Reel published \u2728');
    } else {
      GlowApp.showToast('Reel published \u2728');
    }

    pubBtn.disabled = false; pubBtn.textContent = 'Publish';
    const saved = pendingReel; pendingReel = null;
    GlowApp.showScreen('feedScreen');
    GlowFeed.build();

    if (saved.visibility === 'public') {
      const idx = GlowFeed.getAllReels().findIndex(r => r.id === saved.id);
      if (idx >= 0) setTimeout(() => GlowFeed.goTo(idx), 300);
    }
  }

  // ── MY REELS ──────────────────────────────────────────
  function buildMyReels() {
    const userReels = GlowApp.getUserReels();
    const c = document.getElementById('myReelsList');
    let h = `<div class="my-reels-title">My Reels</div>
      <div class="my-reels-sub">${userReels.length} reel${userReels.length !== 1 ? 's' : ''} created</div>`;

    if (userReels.length === 0) {
      h += `<div class="my-reel-empty">
        <p>You haven\u2019t created any reels yet.</p>
        <button class="btn-primary" onclick="GlowCreate.start()" style="font-size:.8rem;padding:12px 24px;">Create Your First Reel</button>
      </div>`;
    } else {
      userReels.slice().reverse().forEach(reel => {
        const t = reel.title.replace(/<[^>]+>/g, '');
        const v = reel.visibility === 'public' ? '\uD83C\uDF0D Public' : '\uD83D\uDD12 Private';
        const d = new Date(reel.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const badge = reel.aiGenerated ? '<div class="my-reel-badge">\u2728 AI written</div>' : '';
        h += `<div class="my-reel-card" onclick="GlowCreate.viewReel('${reel.id}')">
          ${badge}<h3>${t}</h3>
          ${reel.forWho ? '<div class="card-for">For ' + reel.forWho + '</div>' : ''}
          <div class="card-meta"><span>${v}</span><span>${d}</span></div>
        </div>`;
      });
    }
    c.innerHTML = h;
  }

  function viewReel(id) {
    const userReels = GlowApp.getUserReels();
    const reel = userReels.find(r => r.id === id); if (!reel) return;
    if (reel.visibility === 'public') {
      GlowApp.showScreen('feedScreen');
      const i = GlowFeed.getAllReels().findIndex(r => r.id === id);
      if (i >= 0) setTimeout(() => GlowFeed.goTo(i), 200);
    } else {
      showPreview(reel);
      document.querySelector('.preview-label').textContent = '\uD83D\uDD12 Private Reel';
      document.querySelector('.preview-actions').innerHTML =
        `<button class="btn-step btn-back" onclick="GlowApp.showScreen('myReelsScreen')">Back</button>` +
        `<button class="btn-step btn-next" onclick="GlowCreate.sharePrivate('${id}')">Share Link</button>`;
    }
  }

  function sharePrivate(id) {
    const url = window.location.origin + window.location.pathname + '#' + id;
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => GlowApp.showToast('Link copied'));
  }

  return { start, cancel, nextStep, prevStep, selectMood, selectMessageType, selectVisibility, generate, backToEdit, publish, buildMyReels, viewReel, sharePrivate };
})();
