/* ═══════════════════════════════════════
   GLOW NOTES — audio.js
   Generative mood-matched ambient music
   Copyright-free. No network. Pure Web Audio API.
═══════════════════════════════════════ */

const GlowAudio = (() => {
  let ctx = null;
  let masterGain = null;
  let activeNodes = [];
  let isMuted = false;
  let isPlaying = false;
  let fadeTimer = null;

  const MOODS = {
    hopeful: {
      root: 146.83, // D3
      chord: [1, 1.259, 1.498, 2.0, 2.520],
      padDetune: [0, 4, -3, 7, -2],
      pulseRate: 0.18, reverbSize: 3.2, brightness: 0.55,
      padGain: 0.12, shimmerFreq: 880, shimmerGain: 0.04,
      bassNote: 73.42, bellIntervalMin: 4, bellIntervalMax: 9
    },
    strength: {
      root: 164.81, // E3
      chord: [1, 1.189, 1.498, 1.782, 2.0],
      padDetune: [0, -5, 3, -8, 2],
      pulseRate: 0.14, reverbSize: 4.5, brightness: 0.35,
      padGain: 0.14, shimmerFreq: 659, shimmerGain: 0.03,
      bassNote: 82.41, bellIntervalMin: 6, bellIntervalMax: 12
    },
    comfort: {
      root: 130.81, // C3
      chord: [1, 1.189, 1.498, 1.587, 2.0],
      padDetune: [0, 6, -4, 2, -6],
      pulseRate: 0.10, reverbSize: 5.5, brightness: 0.28,
      padGain: 0.11, shimmerFreq: 523, shimmerGain: 0.025,
      bassNote: 65.41, bellIntervalMin: 7, bellIntervalMax: 14
    },
    celebration: {
      root: 196.00, // G3
      chord: [1, 1.259, 1.498, 1.587, 2.0, 2.520],
      padDetune: [0, 3, -2, 5, -1],
      pulseRate: 0.22, reverbSize: 2.8, brightness: 0.65,
      padGain: 0.13, shimmerFreq: 1047, shimmerGain: 0.05,
      bassNote: 98.00, bellIntervalMin: 3, bellIntervalMax: 7
    },
    grief: {
      root: 110.00, // A2
      chord: [1, 1.189, 1.498, 1.782, 2.0],
      padDetune: [0, -6, 4, -2, 8],
      pulseRate: 0.07, reverbSize: 7.0, brightness: 0.18,
      padGain: 0.10, shimmerFreq: 440, shimmerGain: 0.02,
      bassNote: 55.00, bellIntervalMin: 9, bellIntervalMax: 18
    },
    courage: {
      root: 174.61, // F3
      chord: [1, 1.259, 1.498, 1.587, 2.0],
      padDetune: [0, 2, -5, 8, -3],
      pulseRate: 0.20, reverbSize: 3.8, brightness: 0.50,
      padGain: 0.13, shimmerFreq: 698, shimmerGain: 0.04,
      bassNote: 87.31, bellIntervalMin: 4, bellIntervalMax: 10
    }
  };

  function initContext() {
    if (ctx) return true;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.connect(ctx.destination);
      return true;
    } catch(e) { return false; }
  }

  function createReverb(size) {
    const conv = ctx.createConvolver();
    const len = ctx.sampleRate * size;
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
    }
    conv.buffer = buf;
    return conv;
  }

  function makeOsc(freq, type, gainVal) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    g.gain.setValueAtTime(gainVal, ctx.currentTime);
    osc.connect(g); osc.start();
    activeNodes.push(osc, g);
    return { osc, gain: g };
  }

  function makeLFO(rate, depth, target, offset) {
    const lfo = ctx.createOscillator();
    const lg = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(rate, ctx.currentTime);
    lg.gain.setValueAtTime(depth, ctx.currentTime);
    lfo.connect(lg); lg.connect(target);
    lfo.start(ctx.currentTime + (offset || 0));
    activeNodes.push(lfo, lg);
  }

  function makeFilter(type, freq, q) {
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, ctx.currentTime);
    f.Q.setValueAtTime(q || 1, ctx.currentTime);
    activeNodes.push(f);
    return f;
  }

  function buildSoundscape(mood) {
    const cfg = MOODS[mood] || MOODS.hopeful;
    const reverb = createReverb(cfg.reverbSize);
    const dry = ctx.createGain(); dry.gain.setValueAtTime(0.38, ctx.currentTime);
    const wet = ctx.createGain(); wet.gain.setValueAtTime(0.62, ctx.currentTime);
    reverb.connect(wet); wet.connect(masterGain); dry.connect(masterGain);
    activeNodes.push(reverb, dry, wet);

    const lp = makeFilter('lowpass', 750 + cfg.brightness * 1100, 0.8);
    lp.connect(reverb); lp.connect(dry);

    // Pad voices
    cfg.chord.forEach((ratio, i) => {
      const freq = cfg.root * ratio;
      const det = cfg.padDetune[i % cfg.padDetune.length] || 0;
      const pg = cfg.padGain / cfg.chord.length;
      const { gain: g1 } = makeOsc(freq, 'sine', pg);
      const { osc: o2, gain: g2 } = makeOsc(freq * 1.003, 'sine', pg * 0.7);
      o2.detune.setValueAtTime(det, ctx.currentTime);
      makeLFO(cfg.pulseRate + Math.random() * 0.03, pg * 0.3, g1.gain, i * 0.8);
      makeLFO(cfg.pulseRate + Math.random() * 0.02, pg * 0.2, g2.gain, i * 1.1);
      g1.connect(lp); g2.connect(lp);
    });

    // Bass
    const { gain: bg } = makeOsc(cfg.bassNote, 'sine', 0.06);
    const bf = makeFilter('lowpass', 175, 0.6);
    bg.connect(bf); bf.connect(masterGain);
    makeLFO(0.05, 0.01, bg.gain, 0);

    // Shimmer
    const { gain: sg } = makeOsc(cfg.shimmerFreq, 'sine', cfg.shimmerGain);
    const sf = makeFilter('highpass', cfg.shimmerFreq * 0.8, 1.2);
    sg.connect(sf); sf.connect(reverb);
    makeLFO(cfg.pulseRate * 1.7, cfg.shimmerGain * 0.6, sg.gain, 2.0);

    // Noise breath
    try {
      const blen = ctx.sampleRate * 2;
      const nbuf = ctx.createBuffer(1, blen, ctx.sampleRate);
      const nd = nbuf.getChannelData(0);
      for (let i = 0; i < blen; i++) nd[i] = (Math.random() * 2 - 1) * 0.014;
      const noise = ctx.createBufferSource();
      noise.buffer = nbuf; noise.loop = true;
      const nf = makeFilter('bandpass', 380 + cfg.brightness * 550, 0.5);
      const ng = ctx.createGain(); ng.gain.setValueAtTime(0.016, ctx.currentTime);
      noise.connect(nf); nf.connect(ng); ng.connect(reverb); noise.start();
      makeLFO(0.07, 0.007, ng.gain, 1.5);
      activeNodes.push(noise, ng);
    } catch(e) {}

    scheduleBells(cfg, reverb);
  }

  function scheduleBells(cfg, reverb) {
    const notes = cfg.chord.map(r => cfg.root * r * 2);
    let t = ctx.currentTime + 3;

    const next = () => {
      if (!isPlaying) return;
      const note = notes[Math.floor(Math.random() * notes.length)];
      const interval = cfg.bellIntervalMin + Math.random() * (cfg.bellIntervalMax - cfg.bellIntervalMin);

      const bo = ctx.createOscillator(); const bg = ctx.createGain();
      bo.type = 'sine'; bo.frequency.setValueAtTime(note, t);
      bg.gain.setValueAtTime(0, t);
      bg.gain.linearRampToValueAtTime(0.038, t + 0.01);
      bg.gain.exponentialRampToValueAtTime(0.001, t + 3.5);
      bo.connect(bg); bg.connect(reverb); bo.start(t); bo.stop(t + 4);
      activeNodes.push(bo, bg);

      const bo2 = ctx.createOscillator(); const bg2 = ctx.createGain();
      bo2.type = 'sine'; bo2.frequency.setValueAtTime(note * 2.756, t);
      bg2.gain.setValueAtTime(0, t);
      bg2.gain.linearRampToValueAtTime(0.014, t + 0.01);
      bg2.gain.exponentialRampToValueAtTime(0.001, t + 1.8);
      bo2.connect(bg2); bg2.connect(reverb); bo2.start(t); bo2.stop(t + 2);
      activeNodes.push(bo2, bg2);

      t += interval;
      if (isPlaying) setTimeout(next, (interval - 2) * 1000);
    };

    setTimeout(next, 2800);
  }

  function play(mood) {
    if (!initContext()) return;
    if (isPlaying) stop(false);
    if (ctx.state === 'suspended') ctx.resume();
    isPlaying = true;
    buildSoundscape(mood || 'hopeful');
    clearTimeout(fadeTimer);
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(isMuted ? 0 : 1, ctx.currentTime + 3);
  }

  function stop(graceful) {
    isPlaying = false;
    if (!ctx || !masterGain) return;
    if (graceful !== false) {
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
      fadeTimer = setTimeout(killNodes, 2200);
    } else {
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      killNodes();
    }
  }

  function killNodes() {
    activeNodes.forEach(n => { try { if (n.stop) n.stop(); n.disconnect(); } catch(e) {} });
    activeNodes = [];
  }

  function mute() {
    isMuted = true;
    if (!ctx || !masterGain) return;
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
  }

  function unmute() {
    isMuted = false;
    if (!ctx || !masterGain) return;
    if (ctx.state === 'suspended') ctx.resume();
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.5);
  }

  function toggleMute() {
    if (isMuted) { unmute(); return false; }
    else { mute(); return true; }
  }

  return { play, stop, mute, unmute, toggleMute, getMuted: () => isMuted };
})();
