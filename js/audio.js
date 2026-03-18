/* ═══════════════════════════════════════
   GLOW NOTES — audio.js
   Generative ambient music engine
   Mood-matched, copyright-free, no network
═══════════════════════════════════════ */

const GlowAudio = (() => {
  let ctx = null;
  let masterGain = null;
  let activeNodes = [];
  let isMuted = false;
  let isPlaying = false;
  let fadeTimer = null;

  // ── MOOD CONFIGS ──────────────────────────────────────
  // Each mood has: root note (Hz), chord intervals,
  // pad character, pulse rate, reverb size, brightness
  const MOOD_CONFIGS = {
    hopeful: {
      // Bright major — D major, open and warm
      root: 146.83, // D3
      chord: [1, 1.259, 1.498, 2.0, 2.520], // D F# A D' A'
      padDetune: [0, 4, -3, 7],
      pulseRate: 0.18,
      reverbSize: 3.2,
      brightness: 0.55,
      padGain: 0.12,
      shimmerFreq: 880,
      shimmerGain: 0.04,
      bassNote: 73.42, // D2
      tempo: 72,
      label: 'D major — warm and open'
    },
    strength: {
      // Powerful — E minor, grounded with tension
      root: 164.81, // E3
      chord: [1, 1.189, 1.498, 1.782, 2.0], // E G B D' E'
      padDetune: [0, -5, 3, -8],
      pulseRate: 0.14,
      reverbSize: 4.5,
      brightness: 0.35,
      padGain: 0.14,
      shimmerFreq: 659,
      shimmerGain: 0.03,
      bassNote: 82.41, // E2
      tempo: 60,
      label: 'E minor — grounded power'
    },
    comfort: {
      // Soft — C major with suspended feel
      root: 130.81, // C3
      chord: [1, 1.189, 1.498, 1.587, 2.0], // C Eb G Ab C'
      padDetune: [0, 6, -4, 2],
      pulseRate: 0.10,
      reverbSize: 5.5,
      brightness: 0.28,
      padGain: 0.11,
      shimmerFreq: 523,
      shimmerGain: 0.025,
      bassNote: 65.41, // C2
      tempo: 52,
      label: 'C minor 7 — soft embrace'
    },
    celebration: {
      // Bright and lifted — G major
      root: 196.00, // G3
      chord: [1, 1.259, 1.498, 1.587, 2.0, 2.520], // G B D Eb G' B'
      padDetune: [0, 3, -2, 5],
      pulseRate: 0.22,
      reverbSize: 2.8,
      brightness: 0.65,
      padGain: 0.13,
      shimmerFreq: 1047,
      shimmerGain: 0.05,
      bassNote: 98.00, // G2
      tempo: 88,
      label: 'G major — bright and lifted'
    },
    grief: {
      // Tender — A minor, slow and spacious
      root: 110.00, // A2
      chord: [1, 1.189, 1.498, 1.782, 2.0], // A C E G A'
      padDetune: [0, -6, 4, -2],
      pulseRate: 0.07,
      reverbSize: 7.0,
      brightness: 0.18,
      padGain: 0.10,
      shimmerFreq: 440,
      shimmerGain: 0.02,
      bassNote: 55.00, // A1
      tempo: 44,
      label: 'A minor — tender and spacious'
    },
    courage: {
      // Activating — F major, building energy
      root: 174.61, // F3
      chord: [1, 1.259, 1.498, 1.587, 2.0], // F A C Db F'
      padDetune: [0, 2, -5, 8],
      pulseRate: 0.20,
      reverbSize: 3.8,
      brightness: 0.50,
      padGain: 0.13,
      shimmerFreq: 698,
      shimmerGain: 0.04,
      bassNote: 87.31, // F2
      tempo: 78,
      label: 'F major — activating forward'
    }
  };

  // ── INIT AUDIO CONTEXT ────────────────────────────────
  function initContext() {
    if (ctx) return true;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.connect(ctx.destination);
      return true;
    } catch (e) {
      console.warn('GlowAudio: WebAudio not available', e);
      return false;
    }
  }

  // ── REVERB IMPULSE (convolution simulation) ───────────
  function createReverb(size = 3) {
    const convolver = ctx.createConvolver();
    const rate = ctx.sampleRate;
    const length = rate * size;
    const impulse = ctx.createBuffer(2, length, rate);
    for (let c = 0; c < 2; c++) {
      const data = impulse.getChannelData(c);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
      }
    }
    convolver.buffer = impulse;
    return convolver;
  }

  // ── OSCILLATOR HELPER ─────────────────────────────────
  function makeOsc(freq, type = 'sine', gainVal = 0.1) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    g.gain.setValueAtTime(gainVal, ctx.currentTime);
    osc.connect(g);
    osc.start();
    activeNodes.push(osc, g);
    return { osc, gain: g };
  }

  // ── LFO for slow modulation ───────────────────────────
  function makeLFO(rate, depth, target, offset = 0) {
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(rate, ctx.currentTime);
    lfoGain.gain.setValueAtTime(depth, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(target);
    lfo.start(ctx.currentTime + offset);
    activeNodes.push(lfo, lfoGain);
    return lfo;
  }

  // ── FILTER ────────────────────────────────────────────
  function makeFilter(type, freq, q = 1) {
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, ctx.currentTime);
    f.Q.setValueAtTime(q, ctx.currentTime);
    activeNodes.push(f);
    return f;
  }

  // ── BUILD SOUNDSCAPE ─────────────────────────────────
  function buildSoundscape(mood) {
    const cfg = MOOD_CONFIGS[mood] || MOOD_CONFIGS.hopeful;
    const reverb = createReverb(cfg.reverbSize);
    const dryGain = ctx.createGain();
    const wetGain = ctx.createGain();
    dryGain.gain.setValueAtTime(0.4, ctx.currentTime);
    wetGain.gain.setValueAtTime(0.6, ctx.currentTime);
    reverb.connect(wetGain);
    wetGain.connect(masterGain);
    dryGain.connect(masterGain);
    activeNodes.push(reverb, dryGain, wetGain);

    const lowpass = makeFilter('lowpass', 800 + cfg.brightness * 1200, 0.8);
    lowpass.connect(reverb);
    lowpass.connect(dryGain);

    // ── 1. PAD LAYER — choir of detuned sines ──
    cfg.chord.forEach((ratio, i) => {
      const freq = cfg.root * ratio;
      const detune = (cfg.padDetune[i % cfg.padDetune.length] || 0);
      const padGain = cfg.padGain / cfg.chord.length;

      // Main voice
      const { gain: g1 } = makeOsc(freq, 'sine', padGain);
      // Detuned voice for richness
      const { osc: o2, gain: g2 } = makeOsc(freq * 1.003, 'sine', padGain * 0.7);
      o2.detune.setValueAtTime(detune, ctx.currentTime);

      // Slow volume swell per voice
      makeLFO(cfg.pulseRate + Math.random() * 0.03, padGain * 0.3, g1.gain, i * 0.8);
      makeLFO(cfg.pulseRate + Math.random() * 0.02, padGain * 0.2, g2.gain, i * 1.1);

      g1.connect(lowpass);
      g2.connect(lowpass);
    });

    // ── 2. BASS DRONE — deep warm sub ──
    const bassDrone = makeOsc(cfg.bassNote, 'sine', 0.06);
    const bassFilter = makeFilter('lowpass', 180, 0.6);
    bassDrone.gain.connect(bassFilter);
    bassFilter.connect(masterGain);
    makeLFO(0.05, 0.01, bassDrone.gain.gain, 0);

    // ── 3. SHIMMER LAYER — high harmonic glint ──
    const { osc: shimOsc, gain: shimGain } = makeOsc(cfg.shimmerFreq, 'sine', cfg.shimmerGain);
    const shimFilter = makeFilter('highpass', cfg.shimmerFreq * 0.8, 1.2);
    shimGain.connect(shimFilter);
    shimFilter.connect(reverb);
    makeLFO(cfg.pulseRate * 1.7, cfg.shimmerGain * 0.6, shimGain.gain, 2.0);

    // ── 4. BREATH NOISE — soft air texture ──
    try {
      const bufLen = ctx.sampleRate * 2;
      const noiseBuf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const nd = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) nd[i] = (Math.random() * 2 - 1) * 0.015;
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuf;
      noise.loop = true;
      const noiseFilter = makeFilter('bandpass', 400 + cfg.brightness * 600, 0.5);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.018, ctx.currentTime);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(reverb);
      noise.start();
      makeLFO(0.08, 0.008, noiseGain.gain, 1.5);
      activeNodes.push(noise, noiseFilter, noiseGain);
    } catch(e) {}

    // ── 5. PIANO BELL TONES — occasional gentle plucks ──
    scheduleBellTones(cfg, reverb);
  }

  // ── OCCASIONAL BELL TONES ─────────────────────────────
  function scheduleBellTones(cfg, reverb) {
    const notes = cfg.chord.map(r => cfg.root * r * 2); // Octave up
    let time = ctx.currentTime + 3; // First bell after 3s

    const scheduleNext = () => {
      if (!isPlaying) return;
      const note = notes[Math.floor(Math.random() * notes.length)];
      const interval = 4 + Math.random() * 8; // 4-12s between bells

      // Bell envelope: instant attack, slow decay
      const bellOsc = ctx.createOscillator();
      const bellGain = ctx.createGain();
      bellOsc.type = 'sine';
      bellOsc.frequency.setValueAtTime(note, time);
      bellGain.gain.setValueAtTime(0, time);
      bellGain.gain.linearRampToValueAtTime(0.04, time + 0.01);
      bellGain.gain.exponentialRampToValueAtTime(0.001, time + 3.5);
      bellOsc.connect(bellGain);
      bellGain.connect(reverb);
      bellOsc.start(time);
      bellOsc.stop(time + 4);
      activeNodes.push(bellOsc, bellGain);

      // Harmonic overtone
      const bellOsc2 = ctx.createOscillator();
      const bellGain2 = ctx.createGain();
      bellOsc2.type = 'sine';
      bellOsc2.frequency.setValueAtTime(note * 2.756, time); // Inharmonic partial
      bellGain2.gain.setValueAtTime(0, time);
      bellGain2.gain.linearRampToValueAtTime(0.015, time + 0.01);
      bellGain2.gain.exponentialRampToValueAtTime(0.001, time + 1.8);
      bellOsc2.connect(bellGain2);
      bellGain2.connect(reverb);
      bellOsc2.start(time);
      bellOsc2.stop(time + 2);
      activeNodes.push(bellOsc2, bellGain2);

      time += interval;
      if (isPlaying) {
        setTimeout(scheduleNext, interval * 1000 - 2000);
      }
    };

    setTimeout(scheduleNext, 2800);
  }

  // ── PUBLIC API ────────────────────────────────────────
  function play(mood = 'hopeful') {
    if (!initContext()) return;
    if (isPlaying) stop(false);

    // Resume if suspended (iOS requires user gesture)
    if (ctx.state === 'suspended') ctx.resume();

    isPlaying = true;
    buildSoundscape(mood);

    // Fade in over 3s
    clearTimeout(fadeTimer);
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(isMuted ? 0 : 1, ctx.currentTime + 3);
  }

  function stop(graceful = true) {
    isPlaying = false;
    if (!ctx || !masterGain) return;

    if (graceful) {
      // Fade out over 2s then kill nodes
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
    activeNodes.forEach(n => {
      try {
        if (n.stop) n.stop();
        n.disconnect();
      } catch(e) {}
    });
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

  function getMuted() { return isMuted; }
  function getPlaying() { return isPlaying; }

  return { play, stop, mute, unmute, toggleMute, getMuted, getPlaying };
})();
