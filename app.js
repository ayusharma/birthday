/**
 * ============================================================================
 * PROGRESSIVE STEP-BY-STEP BIRTHDAY FLOW
 * Next / Previous Stage Navigation, Interactive 3D Elements & Story Reader
 * ============================================================================
 */

(function () {
  'use strict';

  // --- Exact classic original poem from repository ---
  const DEFAULT_STORY_MESSAGES = [
    "Today is...",
    "as beautiful as other days",
    "but you realize",
    "another year has gone",
    "in a blink of the eyes",
    "however...",
    "Do you know..?",
    "today is just special",
    "so special to you",
    "that's why",
    "Let's make it...",
    "the best celebration ever",
    "and let me share...",
    "a piece of happiness to you",
    "I made all this...",
    "as a birthday present to you",
    "thanks for being there",
    "thanks for the friendship we made",
    "thanks for everything",
    "I wish you all the best",
    "May your life be at ease",
    "May all your wishes come true",
    "Remember",
    "your ambitions",
    "you live as a free bird...",
    "flying in the blue sky",
    "Now things are different...",
    "real story of your life",
    "is just about to begin",
    "indeed..",
    "but...",
    "don't worry",
    "because...",
    "God has your back",
    "and",
    "this year will be better",
    "and I hope",
    "you'll find...",
    "happiness along the way",
    "keep your spirit up",
    "enjoy every single moment...",
    "that you experience today",
    "fill it with your most beautiful smile",
    "and make it the best memory..",
    "lastly...",
    "I'd like to wish you one more time",
    "a very happy birthday {NAME}! ✨💖🎉"
  ];

  const PRESET_MEMORIES = [
    { id: 1, src: 'bd1.jpg', title: 'Candlelight Cake', defaultCaption: 'Best moments with you ❤️' },
    { id: 2, src: 'bd2.jpg', title: 'Sparkler Night', defaultCaption: 'Glowing with joy & laughter ✨' },
    { id: 3, src: 'bd3.jpg', title: 'Party Confetti', defaultCaption: 'Celebrate every single second 🥂' },
    { id: 4, src: 'bd4.jpg', title: 'Celebration Feast', defaultCaption: 'Wishing you all the happiness 🎂' },
    { id: 5, src: 'bd5.jpg', title: 'Cherished Memories', defaultCaption: 'Forever grateful for you 🌟' }
  ];

  // --- Zero-Persistence Security & Privacy Wipe ---
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (e) {}

  let customSongBlobUrl = null;
  window.addEventListener('beforeunload', () => {
    if (customSongBlobUrl) {
      try { URL.revokeObjectURL(customSongBlobUrl); } catch(e) {}
      customSongBlobUrl = null;
    }
  });

  // --- State ---
  const state = {
    name: 'Friend', // Clean generic default; customized only via valid 24h link or active session
    birthDate: '',
    customMessage: '',
    useCustomMessage: false,
    backgroundTheme: 'potter', // 'potter' (Hogwarts 3D Default) or 'festive' (3D Balloons)
    photos: [
      { id: 1, src: 'bd1.jpg', caption: 'Best moments with you ❤️' },
      { id: 2, src: 'bd2.jpg', caption: 'Glowing with joy & laughter ✨' },
      { id: 3, src: 'bd3.jpg', caption: 'Celebrate every single second 🥂' },
      { id: 4, src: 'bd4.jpg', caption: 'Wishing you all the happiness 🎂' }
    ],
    activePhotoIndex: 0,
    photoCaption: 'Best moments with you ❤️',
    currentStage: 1, // 1: Name, 2: Balloons, 3: Cake, 4: Gift, 5: Story
    storyIndex: 0,
    isPlayingMusic: false,
    isCandleBlown: false,
    mousePos: { x: 0, y: 0 },
    is24hExpired: false,
    expirationTime: null,
    isPreviewMode: false,
    isViewOnly: false // View-only mode for shared link recipients
  };

  // --- Web Audio Synthesizer ---
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playTone(freq, type = 'sine', duration = 0.4, gain = 0.25) {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      g.gain.setValueAtTime(gain, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }

  function playSpellSound() {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const notes = [587.33, 739.99, 880.00, 1174.66, 1479.98, 1760.00];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          playTone(freq, 'sine', 0.45, 0.2);
          playTone(freq * 1.5, 'triangle', 0.2, 0.08);
        }, idx * 65);
      });
    } catch (e) {}
  }

  // Synthesized Hedwig's Theme melody (looping Web Audio)
  let hedwigMelodyInterval = null;
  let isHedwigMelodyPlaying = false;

  function playHedwigMelody(noteType, noteDur, noteGain) {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = noteType || 'sine';
      return { osc, g, ctx };
    } catch (e) { return null; }
  }

  function startSynthHedwigTheme() {
    if (isHedwigMelodyPlaying) return;
    isHedwigMelodyPlaying = true;
    // Hedwig's Theme - Iconic notes (B4, E5, G5, F#5, E5, B5, A5, F#5, E5, G5, F#5, D#5, F5, B4)
    const hedwigNotes = [
      { freq: 493.88, dur: 0.38 }, // B4
      { freq: 659.25, dur: 0.55 }, // E5
      { freq: 783.99, dur: 0.25 }, // G5
      { freq: 739.99, dur: 0.38 }, // F#5
      { freq: 659.25, dur: 0.7 },  // E5
      { freq: 987.77, dur: 0.38 }, // B5
      { freq: 880.00, dur: 0.9 },  // A5
      { freq: 739.99, dur: 0.9 },  // F#5 (hold)
      // Second phrase
      { freq: 659.25, dur: 0.55 }, // E5
      { freq: 783.99, dur: 0.25 }, // G5
      { freq: 739.99, dur: 0.38 }, // F#5
      { freq: 622.25, dur: 0.7 },  // D#5
      { freq: 698.46, dur: 0.38 }, // F5
      { freq: 493.88, dur: 1.1 },  // B4 (hold)
      // Rest
      { freq: 0, dur: 0.6 },
    ];
    let noteIdx = 0;
    function playNextNote() {
      if (!isHedwigMelodyPlaying) return;
      const note = hedwigNotes[noteIdx % hedwigNotes.length];
      noteIdx++;
      if (note.freq > 0) {
        playTone(note.freq, 'sine', note.dur * 0.9, 0.22);
        playTone(note.freq * 2, 'triangle', note.dur * 0.5, 0.06);
      }
      hedwigMelodyInterval = setTimeout(playNextNote, note.dur * 1000);
    }
    playNextNote();
  }

  function stopSynthHedwigTheme() {
    isHedwigMelodyPlaying = false;
    if (hedwigMelodyInterval) {
      clearTimeout(hedwigMelodyInterval);
      hedwigMelodyInterval = null;
    }
  }

  function playOwlHootSound() {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const t = ctx.currentTime;
      // Soft fluty owl hoot (Hedwig call)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(370, t);
      osc1.frequency.linearRampToValueAtTime(440, t + 0.12);
      osc1.frequency.exponentialRampToValueAtTime(350, t + 0.42);

      osc2.frequency.setValueAtTime(740, t);
      osc2.frequency.exponentialRampToValueAtTime(700, t + 0.42);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.46);
      osc2.stop(t + 0.46);

      setTimeout(() => {
        try {
          const t2 = ctx.currentTime;
          const oscB = ctx.createOscillator();
          const gainB = ctx.createGain();
          oscB.type = 'sine';
          oscB.frequency.setValueAtTime(390, t2);
          oscB.frequency.exponentialRampToValueAtTime(330, t2 + 0.35);
          gainB.gain.setValueAtTime(0.18, t2);
          gainB.gain.exponentialRampToValueAtTime(0.001, t2 + 0.35);
          oscB.connect(gainB);
          gainB.connect(ctx.destination);
          oscB.start(t2);
          oscB.stop(t2 + 0.36);
        } catch(e) {}
      }, 160);
    } catch (e) {}
  }

  let isHedwigTransitioning = false;
  function triggerHedwigNextTransition(targetStage) {
    if (isHedwigTransitioning) return;
    
    // If not in Potter theme, transition directly
    if (state.backgroundTheme !== 'potter') {
      goToStage(targetStage);
      return;
    }

    isHedwigTransitioning = true;
    const overlay = document.getElementById('hedwig-transition-overlay');
    playOwlHootSound();

    if (overlay) {
      overlay.classList.add('hedwig-active');
    }

    // At peak flight swoop (approx 480ms), switch stage smoothly
    setTimeout(() => {
      goToStage(targetStage);
      launchConfetti(45);
    }, 480);

    // End transition
    setTimeout(() => {
      if (overlay) overlay.classList.remove('hedwig-active');
      isHedwigTransitioning = false;
    }, 1250);
  }

  function playPopSound() {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const t = ctx.currentTime;

      // 1. Sharp white-noise rupture crack (latex explosion transient)
      const bufferSize = Math.floor(ctx.sampleRate * 0.045);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.007));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(3600, t);
      noiseFilter.frequency.exponentialRampToValueAtTime(350, t + 0.045);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.85, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.045);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(t);

      // 2. Punchy air pressure release wave (sub-bass drop)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, t);
      osc.frequency.exponentialRampToValueAtTime(32, t + 0.12);
      oscGain.gain.setValueAtTime(0.65, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.14);

      // 3. High rubber slap ring
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snapOsc.type = 'sawtooth';
      snapOsc.frequency.setValueAtTime(820, t);
      snapOsc.frequency.exponentialRampToValueAtTime(90, t + 0.06);
      snapGain.gain.setValueAtTime(0.3, t);
      snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      snapOsc.connect(snapGain);
      snapGain.connect(ctx.destination);
      snapOsc.start(t);
      snapOsc.stop(t + 0.07);
    } catch (e) {}
  }

  function playCameraShutterSound() {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      playTone(850, 'triangle', 0.08, 0.2);
      setTimeout(() => playTone(1200, 'sine', 0.1, 0.22), 80);
    } catch (e) {}
  }

  function playCheerFanfare() {
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      setTimeout(() => playTone(freq, 'triangle', 0.25, 0.3), idx * 130);
    });
  }

  // --- URL Parser & Milestones ---
  function getAstrologyInfo(day, month) {
    const signs = [
      { sign: 'Capricorn ♑', quote: 'Ambitious, wise & dependable' },
      { sign: 'Aquarius ♒', quote: 'Visionary, free-spirited & brilliant' },
      { sign: 'Pisces ♓', quote: 'Intuitive, artistic & compassionate' },
      { sign: 'Aries ♈', quote: 'Bold, radiant & inspiring leader' },
      { sign: 'Taurus ♉', quote: 'Loyal, grounded & true-hearted' },
      { sign: 'Gemini ♊', quote: 'Charming, vibrant & wonderfully witty' },
      { sign: 'Cancer ♋', quote: 'Deeply caring, loving & golden' },
      { sign: 'Leo ♌', quote: 'Radiant, magnetic & full of life' },
      { sign: 'Virgo ♍', quote: 'Thoughtful, graceful & shining' },
      { sign: 'Libra ♎', quote: 'Charming, harmonious & elegant' },
      { sign: 'Scorpio ♏', quote: 'Passionate, magnetic & profound' },
      { sign: 'Sagittarius ♐', quote: 'Adventurous, generous & joyful' }
    ];
    const cutoff = [19, 18, 20, 19, 20, 20, 22, 22, 22, 22, 21, 21];
    const index = (day <= cutoff[month - 1]) ? (month - 1) : (month % 12);
    return signs[index];
  }

  // --- Security: Anti-Tamper Checksum, Sanitization & Word Limiters ---
  function generateSecurityHash(str, timestamp) {
    let hash = 0x811c9dc5;
    const combined = `${str || ''}_HogwartsSec2026_${timestamp || ''}`;
    for (let i = 0; i < combined.length; i++) {
      hash ^= combined.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(36);
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function sanitizeText(val, maxLen = 120) {
    if (!val) return '';
    // Strip HTML tags, script protocols, event handlers
    let clean = String(val)
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
    return clean.slice(0, maxLen);
  }

  function countWords(str) {
    if (!str || !str.trim()) return 0;
    return str.trim().split(/\s+/).length;
  }

  function limitWords(str, maxWords) {
    if (!str || !str.trim()) return '';
    const words = str.trim().split(/\s+/);
    if (words.length <= maxWords) return str.trim();
    return words.slice(0, maxWords).join(' ');
  }

  function parseParameters() {
    const params = new URLSearchParams(window.location.search);
    const n = params.get('name');
    const d = params.get('date');
    const m = params.get('msg');
    const p = params.get('p');
    const cap = params.get('cap');
    const exp = params.get('exp');
    const sig = params.get('sig');
    const preview = params.get('preview') || params.get('view');

    // Strict 24-Hour Expiration & Tamper-Proof Check
    if (exp) {
      const expTime = parseInt(exp, 10);
      const now = Date.now();
      const maxAllowedFuture = now + 24 * 60 * 60 * 1000 + 10 * 60 * 1000; // 24h + 10m drift allowance

      const isForgedFuture = (!isNaN(expTime) && expTime > maxAllowedFuture);
      const isPast = (!isNaN(expTime) && now > expTime);
      const expectedSig = (n && sig) ? generateSecurityHash(n, exp) : null;
      const isTampered = (sig && expectedSig && sig !== expectedSig);

      if (isNaN(expTime) || isPast || isForgedFuture || isTampered) {
        state.is24hExpired = true;
        // Zero-data security: Wipe personal data so expired links never reveal private messages
        state.name = 'Friend';
        state.customMessage = '';
        state.useCustomMessage = false;
        return;
      } else {
        state.expirationTime = expTime;
        const hoursLeft = Math.max(1, Math.round((expTime - now) / (1000 * 60 * 60)));
        setTimeout(() => {
          showToast(`⏳ Special 24-Hour Celebration Link • Valid for ~${hoursLeft}h!`);
        }, 900);
      }
    }

    // Name: Strict max 30 chars, max 4 words (e.g. "Amaan Asif Mulani")
    if (n) {
      const cleanName = sanitizeText(n, 30);
      state.name = limitWords(cleanName, 4) || 'Friend';
    }

    if (d) {
      const cleanDate = sanitizeText(d, 12);
      if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
        state.birthDate = cleanDate;
      }
    }

    // Custom Message: Strict max 350 chars, max 50 words
    if (m && m.trim().length > 0) {
      const cleanMsg = sanitizeText(m, 350);
      state.customMessage = limitWords(cleanMsg, 50);
      state.useCustomMessage = true;
    }

    // Polaroid Caption: Strict max 50 chars
    if (cap) {
      state.photoCaption = sanitizeText(cap, 50);
      state.photos.forEach(photo => photo.caption = state.photoCaption);
    }

    // Parse photos from URL preset ids if provided (e.g. p=1,2,3,4)
    if (p) {
      const ids = p.split(',').map(s => parseInt(s.trim(), 10)).filter(id => !isNaN(id));
      if (ids.length >= 2) {
        state.photos = ids.slice(0, 5).map(id => {
          const match = PRESET_MEMORIES.find(pm => pm.id === id);
          return match ? { id: match.id, src: match.src, caption: state.photoCaption || match.defaultCaption } : null;
        }).filter(Boolean);
      }
    }

    // Recipient View-Only Mode: prevent editing
    if (preview === '1') {
      state.isPreviewMode = true;
      state.isViewOnly = true;
    }

    // Background Theme Parameter (Defaults to 'potter')
    const th = params.get('theme');
    if (th === 'festive') {
      state.backgroundTheme = 'festive';
    } else {
      state.backgroundTheme = 'potter';
    }
  }

  // --- Harry Potter Enchanted World Canvas Engine ---
  let potterCtx = null;
  let isPotterInitialized = false;
  let potterCandles = [];
  let broomRiders = [];
  let goldenSnitch = null;
  let snowyOwl = null;
  let flyingLetters = [];
  let wandSparks = [];
  let wandShockwaves = [];
  let patronusWisps = [];
  let lakeMistPuffs = [];
  let potterStars = [];

  function switchBackgroundTheme(newTheme, showToastNotice = false) {
    state.backgroundTheme = (newTheme === 'festive') ? 'festive' : 'potter';
    const isPotter = (state.backgroundTheme === 'potter');

    document.body.classList.toggle('theme-potter', isPotter);
    document.body.classList.toggle('theme-festive', !isPotter);

    const toggleIcon = document.getElementById('theme-toggle-icon');
    const toggleLabel = document.getElementById('theme-toggle-label');
    if (toggleIcon) toggleIcon.textContent = isPotter ? '⚡' : '🎈';
    if (toggleLabel) toggleLabel.textContent = isPotter ? 'Hogwarts 3D' : 'Festive 3D';

    const cardPotter = document.getElementById('theme-card-potter');
    const cardFestive = document.getElementById('theme-card-festive');
    if (cardPotter) {
      cardPotter.classList.toggle('active', isPotter);
      const rP = cardPotter.querySelector('input[type="radio"]');
      if (rP) rP.checked = isPotter;
    }
    if (cardFestive) {
      cardFestive.classList.toggle('active', !isPotter);
      const rF = cardFestive.querySelector('input[type="radio"]');
      if (rF) rF.checked = !isPotter;
    }

    document.querySelectorAll('.btn-owl-badge').forEach(b => {
      b.style.display = isPotter ? 'inline-block' : 'none';
    });

    if (isPotter) {
      playSpellSound();
      if (!isPotterInitialized) {
        initPotterCosmos();
      }
      if (showToastNotice) {
        showToast('⚡ Hogwarts 3D Theme Activated: Floating Candles, Snitch & Broomstick Riders!');
      }
    } else {
      playTone(523.25, 'triangle', 0.25, 0.2);
      setTimeout(() => playTone(659.25, 'sine', 0.25, 0.2), 100);
      launchConfetti(45);
      if (showToastNotice) {
        showToast('🎈 Festive 3D Balloons & Confetti Theme Activated!');
      }
    }
  }

  function initPotterCosmos() {
    const pCanvas = document.getElementById('potter-canvas');
    if (!pCanvas) return;
    potterCtx = pCanvas.getContext('2d');
    if (!potterCtx) return;

    pCanvas.width = window.innerWidth;
    pCanvas.height = window.innerHeight;

    // 1. 30 Great Hall Floating Candles with Photorealistic 3D Depth & Beeswax Detail
    potterCandles = [];
    const waxTones = [
      { base: '#fefce8', shadow: '#ca8a04', rim: '#fef08a' },
      { base: '#fffbeb', shadow: '#b45309', rim: '#fde68a' },
      { base: '#fef3c7', shadow: '#92400e', rim: '#fef9c3' }
    ];
    for (let i = 0; i < 30; i++) {
      const z = 140 + Math.random() * 520;
      potterCandles.push({
        x: (Math.random() - 0.5) * window.innerWidth * 1.35,
        baseY: -window.innerHeight * 0.48 + Math.random() * (window.innerHeight * 0.8),
        z: z,
        height: 42 + Math.random() * 45,
        width: 10 + Math.random() * 5,
        swaySpeed: 0.008 + Math.random() * 0.012,
        swayAmp: 14 + Math.random() * 16,
        swayXSpeed: 0.006 + Math.random() * 0.01,
        swayXAmp: 6 + Math.random() * 10,
        phase: Math.random() * Math.PI * 2,
        flameFlicker: Math.random() * Math.PI * 2,
        flameSpeed: 0.07 + Math.random() * 0.05,
        waxTone: waxTones[i % waxTones.length],
        drips: [
          { side: -1, yPct: 0.18 + Math.random() * 0.15, len: 8 + Math.random() * 12, w: 2.2 },
          { side: 1, yPct: 0.28 + Math.random() * 0.2, len: 12 + Math.random() * 16, w: 2.6 },
          { side: -1, yPct: 0.52 + Math.random() * 0.18, len: 6 + Math.random() * 8, w: 1.8 }
        ]
      });
    }
    // Sort candles by z once so we don't re-sort every frame
    potterCandles.sort((a, b) => b.z - a.z);

    // 2. Iconic Quidditch Champions & Legendary Wizards (Harry, Ron, Hermione, Dumbledore & Draco)
    broomRiders = [
      {
        id: 1,
        name: 'Harry Potter',
        character: 'harry',
        broomType: 'nimbus2000',
        house: 'Gryffindor',
        robeColorDark: '#7f1d1d',
        robeColorLight: '#dc2626',
        trimColor: '#fbbf24',
        hairColor: '#09090b',
        skinColor: '#fed7aa',
        hasGlasses: true,
        reachArm: true, // Reaching for Golden Snitch
        t: 0.1,
        speed: 0.0036,
        baseAltitude: window.innerHeight * 0.18,
        diveAmp: 95,
        swoopFreq: 1.8,
        bankFactor: 0.52,
        facing: 1,
        x: -240,
        y: window.innerHeight * 0.18,
        z: 180,
        pitch: 0,
        roll: 0,
        cloakWave: 0,
        heroPassTimer: 0,
        trail: []
      },
      {
        id: 2,
        name: 'Ron Weasley',
        character: 'ron',
        broomType: 'cleansweep',
        house: 'Gryffindor',
        robeColorDark: '#831843', // Maroon 'R' initial jumper
        robeColorLight: '#b91c1c',
        trimColor: '#fbbf24',
        hairColor: '#ea580c', // Bright fiery Weasley red
        skinColor: '#fed7aa',
        hasGlasses: false,
        reachArm: false,
        t: 2.1,
        speed: 0.0033,
        baseAltitude: window.innerHeight * 0.28,
        diveAmp: 85,
        swoopFreq: 1.6,
        bankFactor: 0.46,
        facing: 1,
        x: -420,
        y: window.innerHeight * 0.28,
        z: 200,
        pitch: 0,
        roll: 0,
        cloakWave: 1.2,
        heroPassTimer: 0,
        trail: []
      },
      {
        id: 3,
        name: 'Hermione Granger',
        character: 'hermione',
        broomType: 'hermioneBroom',
        house: 'Gryffindor',
        robeColorDark: '#7f1d1d',
        robeColorLight: '#dc2626',
        trimColor: '#fbbf24',
        hairColor: '#78350f', // Bushy honey-brown waves
        skinColor: '#fed7aa',
        hasGlasses: false,
        reachArm: false,
        t: 1.5,
        speed: 0.0032,
        baseAltitude: window.innerHeight * 0.23,
        diveAmp: 80,
        swoopFreq: 1.9,
        bankFactor: 0.44,
        facing: 1,
        x: -180,
        y: window.innerHeight * 0.23,
        z: 190,
        pitch: 0,
        roll: 0,
        cloakWave: 2.8,
        heroPassTimer: 0,
        trail: []
      },
      {
        id: 4,
        name: 'Albus Dumbledore',
        character: 'dumbledore',
        broomType: 'elderWand',
        house: 'Hogwarts',
        robeColorDark: '#3b0764', // Regal deep purple
        robeColorLight: '#7c3aed',
        trimColor: '#fde047',
        hairColor: '#f8fafc', // Flowing silver-white beard & hair
        skinColor: '#ffedd5',
        hasGlasses: true, // Half-moon spectacles
        reachArm: false,
        t: 4.2,
        speed: 0.0024,
        baseAltitude: window.innerHeight * 0.14,
        diveAmp: 60,
        swoopFreq: 1.2,
        bankFactor: 0.32,
        facing: -1,
        x: window.innerWidth + 240,
        y: window.innerHeight * 0.14,
        z: 195,
        pitch: 0,
        roll: 0,
        cloakWave: 4.5,
        heroPassTimer: 0,
        trail: []
      },
      {
        id: 5,
        name: 'Draco Malfoy',
        character: 'draco',
        broomType: 'nimbus2001',
        house: 'Slytherin',
        robeColorDark: '#064e3b',
        robeColorLight: '#059669',
        trimColor: '#e2e8f0',
        hairColor: '#fef08a', // Sleek platinum blonde
        skinColor: '#ffedd5',
        hasGlasses: false,
        reachArm: false,
        t: 3.2,
        speed: 0.0038,
        baseAltitude: window.innerHeight * 0.32,
        diveAmp: 92,
        swoopFreq: 1.6,
        bankFactor: 0.48,
        facing: -1,
        x: window.innerWidth + 320,
        y: window.innerHeight * 0.32,
        z: 205,
        pitch: 0,
        roll: 0,
        cloakWave: 1.8,
        heroPassTimer: 0,
        trail: []
      }
    ];

    // 3. Hedwig the Snowy Owl (Movie Realistic Flight)
    snowyOwl = {
      x: -180,
      y: window.innerHeight * 0.24,
      baseY: window.innerHeight * 0.24,
      z: 290,
      vx: 1.65,
      flapPhase: 0,
      glideTimer: 0,
      isGliding: false,
      wingAngle: 0,
      trail: []
    };

    // 4. The Golden Snitch (Hypersonic VFX & Reactive Evasive AI - Canon 2-Wing)
    goldenSnitch = {
      x: window.innerWidth * 0.22,
      y: window.innerHeight * 0.16,
      targetX: window.innerWidth * 0.28,
      targetY: window.innerHeight * 0.14,
      vx: 0,
      vy: 0,
      radius: 9.5,
      wingFlap: 0,
      spinAngle: 0,
      isEvading: false,
      stateTimer: 0,
      sparkTrail: []
    };
    window.__goldenSnitch = goldenSnitch;

    // 5. Flying Hogwarts Acceptance Letters with Red Wax Seals
    flyingLetters = [];
    for (let l = 0; l < 12; l++) {
      flyingLetters.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight * 0.85,
        z: 210 + Math.random() * 410,
        vx: 0.65 + Math.random() * 0.75,
        vy: (Math.random() - 0.5) * 0.35,
        rot: (Math.random() - 0.5) * 0.35,
        rotSpeed: (Math.random() - 0.5) * 0.012,
        swayPhase: Math.random() * Math.PI * 2
      });
    }

    // 6. Silver Patronus Ethereal Wisps
    patronusWisps = [];
    for (let w = 0; w < 3; w++) {
      patronusWisps.push({
        x: Math.random() * window.innerWidth,
        y: window.innerHeight * 0.15 + Math.random() * (window.innerHeight * 0.35),
        vx: 0.45 + Math.random() * 0.4,
        amp: 28 + Math.random() * 20,
        freq: 0.008 + Math.random() * 0.008,
        phase: Math.random() * Math.PI * 2,
        length: 140 + Math.random() * 120,
        alpha: 0.35 + Math.random() * 0.25
      });
    }

    // 7. Volumetric Lake Mist Puffs
    lakeMistPuffs = [];
    for (let m = 0; m < 14; m++) {
      lakeMistPuffs.push({
        x: Math.random() * window.innerWidth * 1.2 - window.innerWidth * 0.1,
        y: window.innerHeight * 0.84 + Math.random() * (window.innerHeight * 0.14),
        radius: 65 + Math.random() * 85,
        vx: 0.2 + Math.random() * 0.25,
        alpha: 0.12 + Math.random() * 0.14,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }

    // 8. Enchanted Night Stars
    potterStars = [];
    for (let s = 0; s < 90; s++) {
      potterStars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight * 0.72,
        r: Math.random() * 1.9 + 0.6,
        alpha: Math.random() * 0.75 + 0.25,
        twinkleSpeed: 0.018 + Math.random() * 0.035,
        phase: Math.random() * Math.PI * 2
      });
    }

    // Canvas click interaction: cast spells or trigger wizard hero passes
    pCanvas.addEventListener('click', (e) => {
      const rect = pCanvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      let clickedRider = null;
      for (const r of broomRiders) {
        const dist = Math.hypot(clickX - r.x, clickY - r.y);
        if (dist < 110) {
          clickedRider = r;
          break;
        }
      }

      if (clickedRider) {
        clickedRider.heroPassTimer = 110;
        castPotterSpellburst(clickedRider.x, clickedRider.y);
        if (clickedRider.character === 'harry') {
          showToast('⚡ Harry Potter: "Accio Firebolt! Got the Snitch!"');
        } else if (clickedRider.character === 'ron') {
          showToast('🦁 Ron Weasley: "Bloody brilliant flying!"');
        } else if (clickedRider.character === 'hermione') {
          showToast('✨ Hermione Granger: "Lumos Maxima!"');
        } else if (clickedRider.character === 'dumbledore') {
          showToast('🌟 Albus Dumbledore: "Happiness can be found in the darkest of times..."');
        } else if (clickedRider.character === 'draco') {
          showToast('🐍 Draco Malfoy: "My father will hear about this!"');
        }
      } else {
        castPotterSpellburst(clickX, clickY);
      }
    });

    isPotterInitialized = true;
  }

  function triggerHeroFlyby(characterName) {
    if (state.backgroundTheme !== 'potter') {
      switchBackgroundTheme('potter', false);
    }
    const rider = broomRiders.find(r => r.character === characterName);
    if (!rider) return;

    rider.heroPassTimer = 150;
    rider.z = 130;
    if (rider.facing === 1) {
      rider.x = -160;
    } else {
      rider.x = window.innerWidth + 160;
    }
    castPotterSpellburst(window.innerWidth / 2, window.innerHeight * 0.22);
    if (characterName === 'harry') {
      showToast('⚡ Harry Potter swooping in on his Nimbus 2000!');
    } else if (characterName === 'ron') {
      showToast('🦁 Ron Weasley soaring past in his maroon "R" jumper!');
    } else if (characterName === 'hermione') {
      showToast('✨ Hermione Granger casting Lumos with her Time-Turner!');
    } else if (characterName === 'dumbledore') {
      showToast('🌟 Albus Dumbledore soaring with the Elder Wand!');
    }
  }
  window.triggerHeroFlyby = triggerHeroFlyby;

  function castPotterSpellburst(x, y) {
    playSpellSound();
    // Expanding magical shockwave
    wandShockwaves.push({
      x, y,
      radius: 6,
      maxRadius: 120 + Math.random() * 50,
      speed: 6.5,
      alpha: 1,
      color: '#fef08a'
    });

    // 42 brilliant sparkling stardust embers
    const colors = ['#fde047', '#ffd166', '#38bdf8', '#c084fc', '#ffffff', '#fb7185', '#6ee7b7'];
    for (let i = 0; i < 42; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.8 + Math.random() * 8.8;
      wandSparks.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        gravity: 0.12,
        drag: 0.962,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.018 + Math.random() * 0.022,
        size: Math.random() * 3.6 + 1.8
      });
    }
  }

  let potterTick = 0;
  function renderPotterCosmos() {
    const pCanvas = document.getElementById('potter-canvas');
    if (!pCanvas || !potterCtx) return;

    if (state.backgroundTheme !== 'potter') {
      requestAnimationFrame(renderPotterCosmos);
      return;
    }

    potterTick += 0.016;
    potterCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);

    const cx = pCanvas.width / 2;
    const cy = pCanvas.height / 2;
    const mouseGlobalX = cx + state.mousePos.x;
    const mouseGlobalY = cy + state.mousePos.y;

    // --- A. Twinkling Night Stars ---
    potterStars.forEach(st => {
      const a = st.alpha * (0.6 + 0.4 * Math.sin(potterTick * 2 * Math.PI * st.twinkleSpeed + st.phase));
      potterCtx.save();
      potterCtx.globalAlpha = Math.max(0, Math.min(1, a));
      potterCtx.fillStyle = '#fef9c3';
      potterCtx.beginPath();
      potterCtx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      potterCtx.fill();
      potterCtx.restore();
    });

    // --- B. Silver Patronus Ethereal Wisps in Night Sky ---
    patronusWisps.forEach(w => {
      w.x += w.vx;
      if (w.x - w.length > pCanvas.width + 50) {
        w.x = -w.length - 50;
        w.y = pCanvas.height * 0.12 + Math.random() * (pCanvas.height * 0.35);
      }
      const grad = potterCtx.createLinearGradient(w.x - w.length, w.y, w.x, w.y);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.6, `rgba(186, 230, 253, ${w.alpha * 0.7})`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${w.alpha})`);

      // Ethereal patronus outer halo wisp
      potterCtx.save();
      potterCtx.strokeStyle = `rgba(186, 230, 253, ${w.alpha * 0.35})`;
      potterCtx.lineWidth = 7;
      potterCtx.lineCap = 'round';
      potterCtx.beginPath();
      for (let s = 0; s <= 20; s++) {
        const segX = w.x - (w.length * (1 - s / 20));
        const segY = w.y + Math.sin(potterTick * 2 + segX * w.freq + w.phase) * w.amp;
        if (s === 0) potterCtx.moveTo(segX, segY);
        else potterCtx.lineTo(segX, segY);
      }
      potterCtx.stroke();

      // Sharp luminous core
      potterCtx.strokeStyle = grad;
      potterCtx.lineWidth = 3;
      potterCtx.stroke();
      potterCtx.restore();
    });

    // --- C. Volumetric Rolling Lake Mist (Bottom Atmosphere) ---
    lakeMistPuffs.forEach(m => {
      m.x += m.vx;
      if (m.x - m.radius > pCanvas.width + 40) {
        m.x = -m.radius - 40;
      }
      const pulse = 1 + Math.sin(potterTick * 1.5 + m.pulsePhase) * 0.08;
      const r = m.radius * pulse;
      const mistGrad = potterCtx.createRadialGradient(m.x, m.y, 0, m.x, m.y, r);
      mistGrad.addColorStop(0, `rgba(147, 197, 253, ${m.alpha})`);
      mistGrad.addColorStop(0.5, `rgba(96, 165, 250, ${m.alpha * 0.45})`);
      mistGrad.addColorStop(1, 'transparent');

      potterCtx.save();
      potterCtx.fillStyle = mistGrad;
      potterCtx.beginPath();
      potterCtx.arc(m.x, m.y, r, 0, Math.PI * 2);
      potterCtx.fill();
      potterCtx.restore();
    });

    // --- D. Great Hall Floating Candles with Photorealistic 3D Depth & Living Flames ---
    potterCandles.forEach(c => {
      const swayY = Math.sin(potterTick * 2 * Math.PI * c.swaySpeed + c.phase) * c.swayAmp;
      const swayX = Math.sin(potterTick * 2 * Math.PI * c.swayXSpeed + c.phase) * c.swayXAmp;
      const k = 380 / c.z;
      const px = cx + (c.x + swayX + state.mousePos.x * 0.07) * k;
      const py = cy + (c.baseY + swayY + state.mousePos.y * 0.07) * k;
      const cw = c.width * k;
      const ch = c.height * k;

      if (px > -70 && px < pCanvas.width + 70 && py > -100 && py < pCanvas.height + 100) {
        potterCtx.save();
        const baseAlpha = Math.min(0.96, 480 / c.z);
        potterCtx.globalAlpha = baseAlpha;

        c.flameFlicker += c.flameSpeed;
        const draftNoise = Math.sin(potterTick * 4.2 + c.phase) * 0.15;
        const flameNoise = Math.sin(c.flameFlicker) * 0.12 + Math.cos(c.flameFlicker * 2.3) * 0.06;
        const flW = (cw * 0.72) * (1 + flameNoise);
        const flH = (cw * 1.85) * (1 - flameNoise * 0.45);
        const flY = py - 7 * k;

        // 1. Ambient Flame Light Aura (Refined Medium Soft Glow)
        const glowRad = flW * 3.0;
        const ambientGlow = potterCtx.createRadialGradient(px, flY - flH * 0.4, 0, px, flY - flH * 0.4, glowRad);
        ambientGlow.addColorStop(0, 'rgba(255, 215, 115, 0.32)');
        ambientGlow.addColorStop(0.4, 'rgba(245, 158, 11, 0.12)');
        ambientGlow.addColorStop(0.8, 'rgba(217, 119, 6, 0.04)');
        ambientGlow.addColorStop(1, 'transparent');
        potterCtx.fillStyle = ambientGlow;
        potterCtx.beginPath();
        potterCtx.arc(px, flY - flH * 0.4, glowRad, 0, Math.PI * 2);
        potterCtx.fill();

        // 2. Optical Bokeh Disc for Distant Candles (Refined Medium Soft Bokeh)
        if (c.z > 450) {
          const bokehDisc = potterCtx.createRadialGradient(px, flY - flH * 0.5, 0, px, flY - flH * 0.5, flW * 1.8);
          bokehDisc.addColorStop(0, 'rgba(254, 240, 138, 0.22)');
          bokehDisc.addColorStop(0.8, 'rgba(245, 158, 11, 0.08)');
          bokehDisc.addColorStop(1, 'transparent');
          potterCtx.fillStyle = bokehDisc;
          potterCtx.beginPath();
          potterCtx.arc(px, flY - flH * 0.5, flW * 1.8, 0, Math.PI * 2);
          potterCtx.fill();
        }

        // 3. Cylindrical Candle Body with Subsurface Scattering Glow
        const waxGrad = potterCtx.createLinearGradient(px - cw / 2, py, px + cw / 2, py);
        waxGrad.addColorStop(0, c.waxTone.shadow);
        waxGrad.addColorStop(0.25, c.waxTone.base);
        waxGrad.addColorStop(0.65, '#ffffff');
        waxGrad.addColorStop(0.9, c.waxTone.rim);
        waxGrad.addColorStop(1, c.waxTone.shadow);

        potterCtx.fillStyle = waxGrad;
        potterCtx.beginPath();
        if (potterCtx.roundRect) {
          potterCtx.roundRect(px - cw / 2, py, cw, ch, [2 * k, 2 * k, 4 * k, 4 * k]);
        } else {
          potterCtx.rect(px - cw / 2, py, cw, ch);
        }
        potterCtx.fill();

        // Subsurface scattering warm pool near the top
        const sssGrad = potterCtx.createRadialGradient(px, py + 4 * k, 0, px, py + 4 * k, cw * 0.9);
        sssGrad.addColorStop(0, 'rgba(253, 224, 71, 0.55)');
        sssGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.25)');
        sssGrad.addColorStop(1, 'transparent');
        potterCtx.fillStyle = sssGrad;
        potterCtx.fillRect(px - cw / 2, py, cw, ch * 0.35);

        // Molten wax basin crater at candle top
        potterCtx.fillStyle = '#fef9c3';
        potterCtx.beginPath();
        potterCtx.ellipse(px, py, cw * 0.48, 2.5 * k, 0, 0, Math.PI * 2);
        potterCtx.fill();

        // Natural dripping wax beads
        c.drips.forEach(dr => {
          const dx = px + (dr.side * cw * 0.42);
          const dy = py + (ch * dr.yPct);
          const dw = dr.w * k;
          const dl = dr.len * k;
          potterCtx.fillStyle = '#ffffff';
          potterCtx.beginPath();
          potterCtx.moveTo(dx - dw * 0.5, dy);
          potterCtx.lineTo(dx + dw * 0.5, dy);
          potterCtx.lineTo(dx + dw * 0.6, dy + dl);
          potterCtx.arc(dx, dy + dl, dw * 0.85, 0, Math.PI);
          potterCtx.closePath();
          potterCtx.fill();
        });

        // Carbonized wick with glowing ember tip
        potterCtx.strokeStyle = '#18181b';
        potterCtx.lineWidth = Math.max(1.2, 1.6 * k);
        potterCtx.beginPath();
        potterCtx.moveTo(px, py);
        potterCtx.quadraticCurveTo(px + draftNoise * 2, py - 3 * k, px + draftNoise * 3, py - 6 * k);
        potterCtx.stroke();

        // Glowing ember tip
        potterCtx.fillStyle = '#ef4444';
        potterCtx.beginPath();
        potterCtx.arc(px + draftNoise * 3, py - 6 * k, 1.2 * k, 0, Math.PI * 2);
        potterCtx.fill();

        // 4-Tier Living Candle Flame
        const tipX = px + draftNoise * 5 * k;
        const tipY = flY - flH;
        const baseY = flY;

        // Tier A: Outer Amber Mantle
        const flameGradOuter = potterCtx.createRadialGradient(
          px, flY - flH * 0.4, flW * 0.15,
          px, flY - flH * 0.5, flH
        );
        flameGradOuter.addColorStop(0, '#ffffff');
        flameGradOuter.addColorStop(0.2, '#fef08a');
        flameGradOuter.addColorStop(0.65, '#f59e0b');
        flameGradOuter.addColorStop(0.9, 'rgba(234, 88, 12, 0.7)');
        flameGradOuter.addColorStop(1, 'transparent');

        potterCtx.fillStyle = flameGradOuter;
        potterCtx.beginPath();
        potterCtx.moveTo(tipX, tipY);
        potterCtx.bezierCurveTo(px + flW * 0.95, flY - flH * 0.65, px + flW * 0.95, baseY, px, baseY);
        potterCtx.bezierCurveTo(px - flW * 0.95, baseY, px - flW * 0.95, flY - flH * 0.65, tipX, tipY);
        potterCtx.fill();

        // Tier B: Intense White-Hot Core
        const coreW = flW * 0.45;
        const coreH = flH * 0.65;
        potterCtx.fillStyle = '#ffffff';
        potterCtx.beginPath();
        potterCtx.moveTo(px + draftNoise * 2.5 * k, flY - coreH);
        potterCtx.bezierCurveTo(px + coreW, flY - coreH * 0.5, px + coreW, flY, px, flY);
        potterCtx.bezierCurveTo(px - coreW, flY, px - coreW, flY - coreH * 0.5, px + draftNoise * 2.5 * k, flY - coreH);
        potterCtx.fill();

        // Tier C: Deep Blue Anchor at Wick Base
        const blueGrad = potterCtx.createRadialGradient(px, flY, 0, px, flY, cw * 0.5);
        blueGrad.addColorStop(0, 'rgba(59, 130, 246, 0.75)');
        blueGrad.addColorStop(0.7, 'rgba(37, 99, 235, 0.4)');
        blueGrad.addColorStop(1, 'transparent');
        potterCtx.fillStyle = blueGrad;
        potterCtx.beginPath();
        potterCtx.ellipse(px, flY, cw * 0.45, 3 * k, 0, 0, Math.PI * 2);
        potterCtx.fill();

        potterCtx.restore();
      }
    });

    // --- E. Flying Hogwarts Acceptance Letters ---
    flyingLetters.forEach(lt => {
      lt.x += lt.vx;
      lt.y += lt.vy + Math.sin(potterTick * 2 + lt.swayPhase) * 0.45;
      lt.rot += lt.rotSpeed;

      if (lt.x > pCanvas.width + 120) {
        lt.x = -120;
        lt.y = Math.random() * pCanvas.height * 0.85;
      }

      const k = 380 / lt.z;
      const lw = 30 * k;
      const lh = 19 * k;

      potterCtx.save();
      potterCtx.translate(lt.x, lt.y);
      potterCtx.rotate(lt.rot);
      potterCtx.globalAlpha = Math.min(0.88, 430 / lt.z);

      // Aged Parchment Envelope
      const envGrad = potterCtx.createLinearGradient(-lw / 2, -lh / 2, lw / 2, lh / 2);
      envGrad.addColorStop(0, '#fef3c7');
      envGrad.addColorStop(0.7, '#fde68a');
      envGrad.addColorStop(1, '#ca8a04');

      potterCtx.fillStyle = envGrad;
      potterCtx.strokeStyle = 'rgba(161, 98, 7, 0.7)';
      potterCtx.lineWidth = 1;
      potterCtx.fillRect(-lw / 2, -lh / 2, lw, lh);
      potterCtx.strokeRect(-lw / 2, -lh / 2, lw, lh);

      // Flap crease
      potterCtx.beginPath();
      potterCtx.moveTo(-lw / 2, -lh / 2);
      potterCtx.lineTo(0, 2 * k);
      potterCtx.lineTo(lw / 2, -lh / 2);
      potterCtx.stroke();

      // Blood-Red Hogwarts Wax Seal
      const sealGrad = potterCtx.createRadialGradient(-1 * k, 1 * k, 0, 0, 2 * k, 4.5 * k);
      sealGrad.addColorStop(0, '#ef4444');
      sealGrad.addColorStop(0.7, '#991b1b');
      sealGrad.addColorStop(1, '#450a0a');
      potterCtx.fillStyle = sealGrad;
      potterCtx.beginPath();
      potterCtx.arc(0, 2 * k, 4.2 * k, 0, Math.PI * 2);
      potterCtx.fill();

      // Golden Crest Initial
      potterCtx.fillStyle = '#fbbf24';
      potterCtx.font = `bold ${Math.max(4, 5 * k)}px serif`;
      potterCtx.textAlign = 'center';
      potterCtx.textBaseline = 'middle';
      potterCtx.fillText('H', 0, 2.2 * k);

      potterCtx.restore();
    });

    // --- F. 4 Quidditch Champions (Movie-Grade Dynamic Aerobatics) ---
    broomRiders.forEach(r => {
      r.t += r.speed;
      r.cloakWave += 0.22;

      // 3D Swooping Trajectory
      if (r.facing === 1) {
        r.x += 2.8;
        if (r.x > pCanvas.width + 260) {
          r.x = -260;
          r.baseAltitude = pCanvas.height * (0.14 + Math.random() * 0.22);
          r.z = 180 + Math.random() * 40;
        }
      } else {
        r.x -= 2.8;
        if (r.x < -260) {
          r.x = pCanvas.width + 260;
          r.baseAltitude = pCanvas.height * (0.14 + Math.random() * 0.22);
          r.z = 180 + Math.random() * 40;
        }
      }

      // Smooth diving & climbing sine oscillation
      const swoopY = Math.sin(r.t * r.swoopFreq * 2) * r.diveAmp;
      r.y = r.baseAltitude + swoopY;
      const vy = Math.cos(r.t * r.swoopFreq * 2) * (r.diveAmp * r.swoopFreq * 0.035);
      const vx = (r.facing === 1) ? 2.8 : -2.8;

      r.pitch = Math.atan2(vy, Math.abs(vx));
      r.roll = Math.sin(r.t * r.swoopFreq * 2) * r.bankFactor;

      // Hero pass boost if triggered
      if (r.heroPassTimer > 0) {
        r.heroPassTimer--;
        r.z = Math.max(120, r.z - 2);
      }

      const mobileFactor = (window.innerWidth < 768) ? 0.8 : 1.0;
      const k = (380 / r.z) * 1.10 * mobileFactor;

      // Dual-Tier Comet Particle Wake
      const tailOffset = (r.facing === 1) ? -42 * k : 42 * k;
      const tailX = r.x + tailOffset;
      const tailY = r.y + 2 * k;

      // Thrust Sparks
      for (let sp = 0; sp < 2; sp++) {
        r.trail.push({
          x: tailX + (Math.random() - 0.5) * 6 * k,
          y: tailY + (Math.random() - 0.5) * 6 * k,
          vx: -vx * 0.45 + (Math.random() - 0.5) * 1.8,
          vy: -vy * 0.35 + (Math.random() - 0.5) * 1.8 - 0.4,
          color: (Math.random() > 0.4) ? '#ffd166' : r.trimColor,
          alpha: 1,
          size: (Math.random() * 3.2 + 1.6) * k,
          type: 'spark'
        });
      }

      // Magical Ion Smoke Ribbon
      if (Math.random() > 0.35) {
        r.trail.push({
          x: tailX,
          y: tailY,
          vx: -vx * 0.15,
          vy: -0.2,
          color: r.robeColorLight,
          alpha: 0.75,
          size: (Math.random() * 6 + 4) * k,
          type: 'smoke'
        });
      }

      // Update & Draw Particle Trail
      r.trail.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= (p.type === 'spark') ? 0.026 : 0.016;
        if (p.type === 'smoke') p.size += 0.35;
      });
      r.trail = r.trail.filter(p => p.alpha > 0);

      r.trail.forEach(p => {
        potterCtx.save();
        // Soft aura glow
        potterCtx.globalAlpha = p.alpha * 0.35;
        potterCtx.fillStyle = p.color;
        potterCtx.beginPath();
        potterCtx.arc(p.x, p.y, p.size * 1.7, 0, Math.PI * 2);
        potterCtx.fill();
        // Crisp core
        potterCtx.globalAlpha = p.alpha;
        potterCtx.fillStyle = (p.type === 'spark') ? '#ffffff' : p.color;
        potterCtx.beginPath();
        potterCtx.arc(p.x, p.y, (p.type === 'spark') ? p.size * 0.65 : p.size, 0, Math.PI * 2);
        potterCtx.fill();
        potterCtx.restore();
      });

      // --- Draw Quidditch Champion Rider ---
      potterCtx.save();
      potterCtx.translate(r.x, r.y);
      potterCtx.scale(r.facing * k, k);
      potterCtx.rotate(r.pitch + r.roll * 0.35);

      // 1. Cinematic Movie Brooms (Nimbus 2000, Nimbus 2001, Cleansweep & Phoenix Flight)
      if (r.broomType === 'nimbus2000') {
        // --- NIMBUS 2000 (Harry Potter's Racing Broom) ---
        // Rich Polished Mahogany Handle with Swept Aerodynamic S-Curve
        const mahogGrad = potterCtx.createLinearGradient(-55, -2, 50, 2);
        mahogGrad.addColorStop(0, '#2e1005');
        mahogGrad.addColorStop(0.2, '#6c2808');
        mahogGrad.addColorStop(0.5, '#9a3412');
        mahogGrad.addColorStop(0.8, '#78350f');
        mahogGrad.addColorStop(1, '#3b1204');

        potterCtx.strokeStyle = mahogGrad;
        potterCtx.lineWidth = 4.4;
        potterCtx.lineCap = 'round';
        potterCtx.beginPath();
        potterCtx.moveTo(-52, 3);
        potterCtx.quadraticCurveTo(-10, -2, 15, -4);
        potterCtx.quadraticCurveTo(32, -6, 48, -3);
        potterCtx.stroke();

        // Warm Golden Specular Luster Highlight
        potterCtx.strokeStyle = 'rgba(254, 240, 138, 0.65)';
        potterCtx.lineWidth = 1.3;
        potterCtx.beginPath();
        potterCtx.moveTo(-45, 1.6);
        potterCtx.quadraticCurveTo(15, -4.8, 42, -3.8);
        potterCtx.stroke();

        // Authentic Movie Gold Cursive "Nimbus 2000" Lettering
        potterCtx.save();
        potterCtx.fillStyle = '#fde047';
        potterCtx.font = 'italic bold 3.8px "Times New Roman", serif';
        potterCtx.textAlign = 'center';
        potterCtx.translate(14, -6.6);
        potterCtx.rotate(-0.06);
        potterCtx.fillText('Nimbus 2000', 0, 0);
        potterCtx.restore();

        // Polished Gold Collar Bands
        [-32, -10, 26, 42].forEach(bx => {
          potterCtx.fillStyle = '#facc15';
          potterCtx.fillRect(bx - 1.5, -3, 3, 5.5);
        });

        // Articulated Gold Foot Stirrups with Pedals
        potterCtx.strokeStyle = '#facc15';
        potterCtx.lineWidth = 2;
        potterCtx.beginPath();
        potterCtx.moveTo(-10, 2);
        potterCtx.lineTo(-10, 16);
        potterCtx.lineTo(-3, 16);
        potterCtx.stroke();

        // Tail Twig Bundle (Neatly trimmed birch twigs bound with gold wire)
        const twigGrad = potterCtx.createLinearGradient(-40, 2, -90, 5);
        twigGrad.addColorStop(0, '#572609');
        twigGrad.addColorStop(0.5, '#3b1805');
        twigGrad.addColorStop(1, '#1f0d02');
        potterCtx.fillStyle = twigGrad;
        potterCtx.beginPath();
        potterCtx.moveTo(-38, 1);
        potterCtx.bezierCurveTo(-55, -9, -82, -15, -90, -6);
        potterCtx.bezierCurveTo(-96, 6, -90, 19, -66, 16);
        potterCtx.bezierCurveTo(-50, 13, -40, 8, -38, 4);
        potterCtx.closePath();
        potterCtx.fill();

        // Twig brush lines
        potterCtx.strokeStyle = '#7c2d12';
        potterCtx.lineWidth = 0.9;
        for (let tw = 0; tw < 5; tw++) {
          potterCtx.beginPath();
          potterCtx.moveTo(-40, 2 + tw * 1.1);
          potterCtx.quadraticCurveTo(-65, -7 + tw * 4.8, -88, -4 + tw * 3.6);
          potterCtx.stroke();
        }

        // Gold Wire Coils Binding the Tail
        potterCtx.strokeStyle = '#facc15';
        potterCtx.lineWidth = 2.4;
        [-42, -47].forEach(wx => {
          potterCtx.beginPath();
          potterCtx.moveTo(wx, -2);
          potterCtx.lineTo(wx + 2, 7);
          potterCtx.stroke();
        });

      } else if (r.broomType === 'nimbus2001') {
        // --- NIMBUS 2001 (Draco Malfoy & Slytherin Team Racing Broom) ---
        // Sleek High-Tech Metallic Obsidian Black Handle
        const obsGrad = potterCtx.createLinearGradient(-55, -2, 50, 2);
        obsGrad.addColorStop(0, '#09090b');
        obsGrad.addColorStop(0.25, '#18181b');
        obsGrad.addColorStop(0.65, '#27272a');
        obsGrad.addColorStop(0.85, '#3f3f46');
        obsGrad.addColorStop(1, '#09090b');

        potterCtx.strokeStyle = obsGrad;
        potterCtx.lineWidth = 4.4;
        potterCtx.lineCap = 'round';
        potterCtx.beginPath();
        potterCtx.moveTo(-52, 3);
        potterCtx.quadraticCurveTo(-10, -2, 15, -4);
        potterCtx.quadraticCurveTo(32, -6, 48, -3);
        potterCtx.stroke();

        // High-Gloss Chrome Mirror Streak
        potterCtx.strokeStyle = 'rgba(241, 245, 249, 0.92)';
        potterCtx.lineWidth = 1.3;
        potterCtx.beginPath();
        potterCtx.moveTo(-45, 1.6);
        potterCtx.quadraticCurveTo(15, -4.8, 42, -3.8);
        potterCtx.stroke();

        // Crisp Silver Cursive "Nimbus 2001" Lettering
        potterCtx.save();
        potterCtx.fillStyle = '#f8fafc';
        potterCtx.font = 'italic bold 3.8px "Times New Roman", serif';
        potterCtx.textAlign = 'center';
        potterCtx.translate(14, -6.6);
        potterCtx.rotate(-0.06);
        potterCtx.fillText('Nimbus 2001', 0, 0);
        potterCtx.restore();

        // Polished Chrome Silver Collars
        [-32, -10, 26, 42].forEach(bx => {
          potterCtx.fillStyle = '#e2e8f0';
          potterCtx.fillRect(bx - 1.5, -3, 3, 5.5);
        });

        // Polished Chrome Silver Stirrups
        potterCtx.strokeStyle = '#e2e8f0';
        potterCtx.lineWidth = 2;
        potterCtx.beginPath();
        potterCtx.moveTo(-10, 2);
        potterCtx.lineTo(-10, 16);
        potterCtx.lineTo(-3, 16);
        potterCtx.stroke();

        // Jet-Black Lacquered Aerodynamic Twigs
        const darkTwig = potterCtx.createLinearGradient(-40, 2, -90, 5);
        darkTwig.addColorStop(0, '#18181b');
        darkTwig.addColorStop(0.5, '#09090b');
        darkTwig.addColorStop(1, '#000000');
        potterCtx.fillStyle = darkTwig;
        potterCtx.beginPath();
        potterCtx.moveTo(-38, 1);
        potterCtx.bezierCurveTo(-55, -9, -82, -15, -90, -6);
        potterCtx.bezierCurveTo(-96, 6, -90, 19, -66, 16);
        potterCtx.bezierCurveTo(-50, 13, -40, 8, -38, 4);
        potterCtx.closePath();
        potterCtx.fill();

        // Chrome Silver Bands Binding the Twigs
        potterCtx.strokeStyle = '#e2e8f0';
        potterCtx.lineWidth = 2.4;
        [-42, -47].forEach(wx => {
          potterCtx.beginPath();
          potterCtx.moveTo(wx, -2);
          potterCtx.lineTo(wx + 2, 7);
          potterCtx.stroke();
        });

      } else {
        // --- Cleansweep / School Broom / Enchanted Astral Mount ---
        const woodGrad = potterCtx.createLinearGradient(-55, -2, 50, 2);
        woodGrad.addColorStop(0, '#451a03');
        woodGrad.addColorStop(0.4, '#78350f');
        woodGrad.addColorStop(0.7, '#b45309');
        woodGrad.addColorStop(1, '#78350f');

        potterCtx.strokeStyle = woodGrad;
        potterCtx.lineWidth = 4.2;
        potterCtx.lineCap = 'round';
        potterCtx.beginPath();
        potterCtx.moveTo(-52, 3);
        potterCtx.quadraticCurveTo(0, -1, 48, -4);
        potterCtx.stroke();

        // Brass collars
        [-32, -10, 18, 38].forEach(bx => {
          potterCtx.fillStyle = '#fde047';
          potterCtx.fillRect(bx - 1.5, -2.5, 3, 5);
        });

        // Foot stirrups
        potterCtx.strokeStyle = '#facc15';
        potterCtx.lineWidth = 2;
        potterCtx.beginPath();
        potterCtx.moveTo(-10, 2);
        potterCtx.lineTo(-10, 15);
        potterCtx.lineTo(-4, 15);
        potterCtx.stroke();

        // Twig Bundle
        const twigGrad = potterCtx.createLinearGradient(-40, 2, -88, 5);
        twigGrad.addColorStop(0, '#78350f');
        twigGrad.addColorStop(0.5, '#451a03');
        twigGrad.addColorStop(1, '#291102');
        potterCtx.fillStyle = twigGrad;
        potterCtx.beginPath();
        potterCtx.moveTo(-38, 1);
        potterCtx.bezierCurveTo(-55, -8, -80, -14, -88, -6);
        potterCtx.bezierCurveTo(-94, 6, -88, 18, -65, 15);
        potterCtx.bezierCurveTo(-50, 12, -40, 8, -38, 4);
        potterCtx.closePath();
        potterCtx.fill();

        // Twine bindings
        potterCtx.strokeStyle = '#facc15';
        potterCtx.lineWidth = 2.4;
        [-42, -47].forEach(wx => {
          potterCtx.beginPath();
          potterCtx.moveTo(wx, -1);
          potterCtx.lineTo(wx + 2, 6);
          potterCtx.stroke();
        });
      }

      // --- Cinematic Optical Bloom Thruster Core (Movie VFX Light Flare) ---
      potterCtx.save();
      potterCtx.globalCompositeOperation = 'lighter';
      const bloomRGB = (r.broomType === 'nimbus2001') ? '16, 185, 129' :   // Emerald for Draco
                       (r.character === 'dumbledore') ? '168, 85, 247' :   // Celestial Purple for Dumbledore
                       (r.character === 'hermione') ? '56, 189, 248' :     // Starlight Blue for Hermione
                       (r.character === 'ron') ? '249, 115, 22' :          // Warm Orange for Ron
                       '251, 191, 36';                                     // Golden Amber for Harry Nimbus 2000

      // Outer volumetric optical bloom flare (Refined Medium Cinematic Flare)
      const flareGrad = potterCtx.createRadialGradient(-60, 2, 1, -60, 2, 18);
      flareGrad.addColorStop(0, `rgba(${bloomRGB}, 0.45)`);
      flareGrad.addColorStop(0.4, `rgba(${bloomRGB}, 0.16)`);
      flareGrad.addColorStop(1, 'transparent');
      potterCtx.fillStyle = flareGrad;
      potterCtx.beginPath();
      potterCtx.arc(-60, 2, 18, 0, Math.PI * 2);
      potterCtx.fill();

      // Optical thruster center (Refined Medium White Core)
      const coreGrad = potterCtx.createRadialGradient(-60, 2, 0.5, -60, 2, 6);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.45, `rgba(${bloomRGB}, 0.6)`);
      coreGrad.addColorStop(1, 'transparent');
      potterCtx.fillStyle = coreGrad;
      potterCtx.beginPath();
      potterCtx.arc(-60, 2, 6, 0, Math.PI * 2);
      potterCtx.fill();
      potterCtx.restore();

      // 2. Rider Anatomy (Aerodynamic Speed Tuck & Costume)
      potterCtx.fillStyle = '#1c1917';
      potterCtx.beginPath();
      potterCtx.moveTo(-16, 3);
      potterCtx.lineTo(-8, 15);
      potterCtx.lineTo(-2, 15);
      potterCtx.lineTo(-4, 11);
      potterCtx.lineTo(-11, 2);
      potterCtx.closePath();
      potterCtx.fill();

      potterCtx.fillStyle = '#27272a';
      potterCtx.beginPath();
      potterCtx.ellipse(-14, 2, 8, 4.5, -0.2, 0, Math.PI * 2);
      potterCtx.fill();

      // Forward-leaning torso & robe
      potterCtx.fillStyle = r.robeColorDark;
      potterCtx.beginPath();
      potterCtx.ellipse(-2, -9, 13, 7.5, -0.42, 0, Math.PI * 2);
      potterCtx.fill();

      // Leather Quidditch chest guard (or Ron's knitted sweater)
      if (r.character === 'ron') {
        // Ron's hand-knitted maroon 'R' initial jumper
        potterCtx.fillStyle = '#831843';
        potterCtx.beginPath();
        potterCtx.ellipse(0, -9, 9, 6.5, -0.42, 0, Math.PI * 2);
        potterCtx.fill();
        potterCtx.fillStyle = '#fde047';
        potterCtx.font = 'bold 5px sans-serif';
        potterCtx.textAlign = 'center';
        potterCtx.fillText('R', 0, -7.5);
      } else {
        potterCtx.fillStyle = (r.character === 'dumbledore') ? '#581c87' : '#573016';
        potterCtx.beginPath();
        potterCtx.ellipse(0, -9, 9, 6.5, -0.42, 0, Math.PI * 2);
        potterCtx.fill();
      }

      // House Crest
      potterCtx.fillStyle = r.trimColor;
      potterCtx.beginPath();
      potterCtx.arc(3, -10, 2.5, 0, Math.PI * 2);
      potterCtx.fill();

      // Dynamic Billowing Quidditch Robe (Traveling harmonic wave)
      const w1 = Math.sin(r.cloakWave) * 9;
      const w2 = Math.sin(r.cloakWave - 1.2) * 13;
      const w3 = Math.sin(r.cloakWave - 2.4) * 16;
      const w4 = Math.cos(r.cloakWave * 1.4) * 6;

      // Outer cape shadow layer
      potterCtx.fillStyle = r.robeColorDark;
      potterCtx.beginPath();
      potterCtx.moveTo(-6, -14);
      potterCtx.bezierCurveTo(-26, -20 + w1, -50, -18 + w2, -72, -10 + w3);
      potterCtx.lineTo(-64, 4 + w3);
      potterCtx.bezierCurveTo(-46, -2 + w2, -28, -2 + w1, -10, -2);
      potterCtx.closePath();
      potterCtx.fill();

      // Satin sheen layer
      const robeGrad = potterCtx.createLinearGradient(-6, -16, -72, -8);
      robeGrad.addColorStop(0, r.robeColorLight);
      robeGrad.addColorStop(0.5, r.robeColorDark);
      robeGrad.addColorStop(1, r.robeColorLight);

      potterCtx.fillStyle = robeGrad;
      potterCtx.beginPath();
      potterCtx.moveTo(-4, -13);
      potterCtx.bezierCurveTo(-24, -18 + w1, -48, -15 + w2, -68, -8 + w3);
      potterCtx.lineTo(-62, 1 + w3);
      potterCtx.bezierCurveTo(-44, -5 + w2, -26, -4 + w1, -8, -4);
      potterCtx.closePath();
      potterCtx.fill();

      // Satin gold/trim border on cloak edge
      potterCtx.strokeStyle = r.trimColor;
      potterCtx.lineWidth = 1.8;
      potterCtx.beginPath();
      potterCtx.moveTo(-4, -13);
      potterCtx.bezierCurveTo(-24, -18 + w1, -48, -15 + w2, -68, -8 + w3);
      potterCtx.stroke();

      // House Scarf fluttering in slipstream
      potterCtx.strokeStyle = r.robeColorLight;
      potterCtx.lineWidth = 3;
      potterCtx.beginPath();
      potterCtx.moveTo(4, -15);
      potterCtx.quadraticCurveTo(-14, -20 + w4, -36, -16 + w1);
      potterCtx.stroke();

      potterCtx.strokeStyle = r.trimColor;
      potterCtx.lineWidth = 2.2;
      potterCtx.beginPath();
      potterCtx.moveTo(2, -14);
      potterCtx.quadraticCurveTo(-16, -18 + w4, -34, -14 + w1);
      potterCtx.stroke();

      // Arms & Quidditch Gauntlets
      potterCtx.strokeStyle = '#573016';
      potterCtx.lineWidth = 3.8;
      potterCtx.lineCap = 'round';
      potterCtx.beginPath();
      potterCtx.moveTo(0, -9);
      potterCtx.lineTo(6, -4);
      potterCtx.lineTo(12, -2);
      potterCtx.stroke();

      potterCtx.fillStyle = '#78350f';
      potterCtx.beginPath();
      potterCtx.arc(12, -2, 2.8, 0, Math.PI * 2);
      potterCtx.fill();

      // Forward Arm: Reaching for Snitch or Gripping Broom or Wand
      if (r.reachArm) {
        potterCtx.strokeStyle = '#573016';
        potterCtx.lineWidth = 3.6;
        potterCtx.beginPath();
        potterCtx.moveTo(4, -11);
        potterCtx.lineTo(22, -15);
        potterCtx.lineTo(38, -19);
        potterCtx.stroke();

        potterCtx.fillStyle = '#fed7aa';
        potterCtx.beginPath();
        potterCtx.arc(39, -19, 2.2, 0, Math.PI * 2);
        potterCtx.fill();

        potterCtx.strokeStyle = '#fed7aa';
        potterCtx.lineWidth = 1.2;
        potterCtx.beginPath();
        potterCtx.moveTo(39, -19);
        potterCtx.lineTo(44, -21);
        potterCtx.moveTo(39, -18);
        potterCtx.lineTo(44, -18);
        potterCtx.stroke();
      } else {
        potterCtx.strokeStyle = '#573016';
        potterCtx.lineWidth = 3.4;
        potterCtx.beginPath();
        potterCtx.moveTo(4, -10);
        potterCtx.lineTo(18, -8);
        potterCtx.lineTo(28, -6);
        potterCtx.stroke();

        potterCtx.fillStyle = '#78350f';
        potterCtx.beginPath();
        potterCtx.arc(28, -6, 2.8, 0, Math.PI * 2);
        potterCtx.fill();
      }

      // --- 3. MOVIE-ACCURATE CHARACTER FACES (Harry, Ron, Hermione, Dumbledore, Draco) ---
      if (r.character === 'harry') {
        // ==================== HARRY POTTER (Daniel Radcliffe Movie Likeness) ====================
        // Anatomically Contoured English Profile & Skin Tone Gradient
        const skinGrad = potterCtx.createLinearGradient(6, -28, 18, -16);
        skinGrad.addColorStop(0, '#ffedd5');
        skinGrad.addColorStop(0.45, '#fed7aa');
        skinGrad.addColorStop(0.85, '#fecdd3'); // Subtle cheek blush
        skinGrad.addColorStop(1, '#fde68a');
        potterCtx.fillStyle = skinGrad;
        potterCtx.beginPath();
        potterCtx.moveTo(6, -28); // Cranium
        potterCtx.bezierCurveTo(12, -30, 16.5, -27, 16.0, -24.5); // Forehead to brow
        potterCtx.lineTo(19.2, -21.4); // Straight British nose bridge to tip
        potterCtx.lineTo(17.2, -20.4); // Philtrum
        potterCtx.lineTo(17.8, -18.6); // Lips in focused concentration
        potterCtx.lineTo(16.4, -16.2); // Squared boyish chin
        potterCtx.quadraticCurveTo(8.5, -14.4, 6.2, -19.5); // Defined jawline to ear
        potterCtx.closePath();
        potterCtx.fill();

        // Realistic Ear with Cartilage Detail
        potterCtx.fillStyle = '#fed7aa';
        potterCtx.beginPath();
        potterCtx.ellipse(5.2, -21.2, 2.2, 3.2, 0.15, 0, Math.PI * 2);
        potterCtx.fill();
        potterCtx.strokeStyle = '#f59e0b';
        potterCtx.lineWidth = 0.8;
        potterCtx.beginPath();
        potterCtx.arc(5.2, -21.5, 1.4, Math.PI * 0.5, Math.PI * 1.8);
        potterCtx.stroke();

        // Iconic Razor-Sharp Crimson Lightning Bolt Scar (Visible through parted fringe)
        potterCtx.save();
        potterCtx.strokeStyle = '#dc2626';
        potterCtx.lineWidth = 1.35;
        potterCtx.lineJoin = 'miter';
        potterCtx.lineCap = 'round';
        potterCtx.beginPath();
        potterCtx.moveTo(13.6, -28.2);
        potterCtx.lineTo(15.5, -25.8);
        potterCtx.lineTo(14.3, -25.8);
        potterCtx.lineTo(16.5, -23.6);
        potterCtx.stroke();
        // Crimson magical luminescence
        potterCtx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
        potterCtx.lineWidth = 3.0;
        potterCtx.stroke();
        potterCtx.restore();

        // Round Wire-Rim Spectacles (Movie-Accurate Black Wire & Glazed Glass)
        potterCtx.save();
        // Glass lens reflection glaze
        potterCtx.fillStyle = 'rgba(224, 242, 254, 0.38)';
        potterCtx.beginPath();
        potterCtx.arc(14.8, -22.4, 3.4, 0, Math.PI * 2);
        potterCtx.fill();
        // Dark wire frame
        potterCtx.strokeStyle = '#18181b';
        potterCtx.lineWidth = 1.25;
        potterCtx.stroke();
        // Nose bridge connecting lenses
        potterCtx.beginPath();
        potterCtx.moveTo(18.2, -22.6);
        potterCtx.lineTo(17.4, -22.4);
        potterCtx.stroke();
        // Side temple wire going straight to ear
        potterCtx.beginPath();
        potterCtx.moveTo(11.4, -22.6);
        potterCtx.lineTo(5.2, -21.8);
        potterCtx.stroke();
        // Specular glint highlight on upper glass
        potterCtx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        potterCtx.lineWidth = 1.0;
        potterCtx.beginPath();
        potterCtx.moveTo(13.5, -24.5);
        potterCtx.lineTo(15.8, -22.2);
        potterCtx.stroke();
        potterCtx.restore();

        // Lily's Piercing Emerald Green Eye & Seeker Brow
        potterCtx.fillStyle = '#ffffff';
        potterCtx.beginPath();
        potterCtx.ellipse(15.2, -22.4, 1.8, 1.2, 0.1, 0, Math.PI * 2);
        potterCtx.fill();
        // Deep Emerald Iris
        potterCtx.fillStyle = '#16a34a';
        potterCtx.beginPath();
        potterCtx.arc(15.4, -22.4, 1.1, 0, Math.PI * 2);
        potterCtx.fill();
        // Black Pupil
        potterCtx.fillStyle = '#09090b';
        potterCtx.beginPath();
        potterCtx.arc(15.5, -22.4, 0.6, 0, Math.PI * 2);
        potterCtx.fill();
        // Crisp White Catchlight
        potterCtx.fillStyle = '#ffffff';
        potterCtx.beginPath();
        potterCtx.arc(15.7, -22.8, 0.35, 0, Math.PI * 2);
        potterCtx.fill();
        // Determined Seeker Eyebrow
        potterCtx.strokeStyle = '#09090b';
        potterCtx.lineWidth = 1.4;
        potterCtx.beginPath();
        potterCtx.moveTo(13.2, -24.8);
        potterCtx.lineTo(16.8, -24.2);
        potterCtx.stroke();

        // Tousled Rebellious Jet-Black Hair (Daniel Radcliffe Cut with Scar Parting)
        potterCtx.fillStyle = '#09090b';
        potterCtx.beginPath();
        potterCtx.moveTo(4, -25);
        potterCtx.bezierCurveTo(3, -33, 14, -34, 16.5, -28.5); // Crown
        potterCtx.bezierCurveTo(14, -27, 12, -25, 10, -26); // Parting revealing scar!
        potterCtx.bezierCurveTo(8, -27, 5, -25, 4, -25);
        potterCtx.closePath();
        potterCtx.fill();

        // Windblown textured locks trailing in aerodynamic wake
        potterCtx.fillStyle = '#18181b';
        potterCtx.beginPath();
        potterCtx.moveTo(5, -28);
        potterCtx.quadraticCurveTo(-6, -33, -16, -27 + w4);
        potterCtx.lineTo(-12, -23 + w4);
        potterCtx.quadraticCurveTo(-4, -27, 3, -24);
        potterCtx.closePath();
        potterCtx.fill();

        // Individual textured spiky tufts
        potterCtx.strokeStyle = '#09090b';
        potterCtx.lineWidth = 2.2;
        potterCtx.beginPath();
        potterCtx.moveTo(8, -31);
        potterCtx.quadraticCurveTo(-2, -35, -14, -29 + w4);
        potterCtx.moveTo(6, -27);
        potterCtx.quadraticCurveTo(-3, -30, -15, -23 + w4);
        potterCtx.moveTo(12, -30);
        potterCtx.quadraticCurveTo(6, -33, -4, -32 + w4);
        potterCtx.stroke();

        // Charcoal highlight sheen on hair crown
        potterCtx.strokeStyle = '#3f3f46';
        potterCtx.lineWidth = 1.1;
        potterCtx.beginPath();
        potterCtx.moveTo(9, -30.5);
        potterCtx.quadraticCurveTo(0, -33, -10, -28 + w4);
        potterCtx.stroke();

      } else if (r.character === 'ron') {
        // ==================== RON WEASLEY (Rupert Grint Movie Likeness) ====================
        // Warm Boyish Contours & Soft Jaw
        const ronSkinGrad = potterCtx.createLinearGradient(6, -28, 18, -16);
        ronSkinGrad.addColorStop(0, '#ffedd5');
        ronSkinGrad.addColorStop(0.4, '#fed7aa');
        ronSkinGrad.addColorStop(1, '#fecdd3'); // Rosy boyish warmth
        potterCtx.fillStyle = ronSkinGrad;
        potterCtx.beginPath();
        potterCtx.moveTo(6, -28);
        potterCtx.bezierCurveTo(12, -30, 16.5, -27, 16.0, -24.2); // Forehead
        potterCtx.lineTo(19.2, -21.4); // Boyish nose with slight upturn
        potterCtx.lineTo(17.2, -20.4); // Philtrum
        potterCtx.lineTo(18.2, -18.4); // Expressive open mouth
        potterCtx.lineTo(16.6, -16.2); // Rounded chin
        potterCtx.quadraticCurveTo(8.5, -14.2, 6.2, -19.5); // Soft jawline
        potterCtx.closePath();
        potterCtx.fill();

        // Ear
        potterCtx.fillStyle = '#fed7aa';
        potterCtx.beginPath();
        potterCtx.ellipse(5.5, -21.2, 2.3, 3.2, 0.15, 0, Math.PI * 2);
        potterCtx.fill();

        // Authentic Constellation of Warm Freckles Across Nose & Cheeks
        potterCtx.fillStyle = '#9a3412';
        [[13.2, -21.8], [14.5, -20.8], [15.8, -21.6], [14.0, -19.8], [15.2, -19.2], [16.5, -20.4], [13.0, -19.4], [14.8, -18.5], [16.0, -19.4]].forEach(([fx, fy]) => {
          potterCtx.beginPath();
          potterCtx.arc(fx, fy, 0.65, 0, Math.PI * 2);
          potterCtx.fill();
        });

        // Fiery Carrot-Red Hair (Weasley Signature)
        const ronHairGrad = potterCtx.createLinearGradient(4, -32, 17, -22);
        ronHairGrad.addColorStop(0, '#ea580c'); // Vibrant ginger
        ronHairGrad.addColorStop(0.6, '#f97316'); // Bright fiery copper
        ronHairGrad.addColorStop(1, '#c2410c'); // Deep auburn
        potterCtx.fillStyle = ronHairGrad;
        potterCtx.beginPath();
        potterCtx.moveTo(5, -25);
        potterCtx.bezierCurveTo(3, -33, 14, -34, 17, -27); // Floppy bangs
        potterCtx.bezierCurveTo(15, -24, 11, -23, 8, -24);
        potterCtx.closePath();
        potterCtx.fill();

        // Windblown ginger mane fluttering back
        potterCtx.fillStyle = '#ea580c';
        potterCtx.beginPath();
        potterCtx.moveTo(5, -28);
        potterCtx.quadraticCurveTo(-6, -32, -18, -25 + w4);
        potterCtx.lineTo(-13, -21 + w4);
        potterCtx.quadraticCurveTo(-3, -26, 3, -23);
        potterCtx.closePath();
        potterCtx.fill();

        // Unruly cowlicks and spiky tufts
        potterCtx.strokeStyle = '#f97316';
        potterCtx.lineWidth = 2.2;
        potterCtx.beginPath();
        potterCtx.moveTo(8, -31);
        potterCtx.quadraticCurveTo(-2, -35, -15, -27 + w4);
        potterCtx.moveTo(6, -26);
        potterCtx.quadraticCurveTo(-4, -28, -14, -20 + w4);
        potterCtx.stroke();

        // Golden-orange rim highlights
        potterCtx.strokeStyle = '#fdba74';
        potterCtx.lineWidth = 1.1;
        potterCtx.beginPath();
        potterCtx.moveTo(10, -31.5);
        potterCtx.quadraticCurveTo(0, -34, -10, -29 + w4);
        potterCtx.stroke();

        // Bright Sky-Blue Eye & Expressive Face
        potterCtx.fillStyle = '#ffffff';
        potterCtx.beginPath();
        potterCtx.ellipse(15.2, -22.4, 1.8, 1.3, 0.1, 0, Math.PI * 2);
        potterCtx.fill();
        // Clear Sky-Blue Iris
        potterCtx.fillStyle = '#0284c7';
        potterCtx.beginPath();
        potterCtx.arc(15.4, -22.4, 1.15, 0, Math.PI * 2);
        potterCtx.fill();
        // Pupil & Glint
        potterCtx.fillStyle = '#09090b';
        potterCtx.beginPath();
        potterCtx.arc(15.5, -22.4, 0.6, 0, Math.PI * 2);
        potterCtx.fill();
        potterCtx.fillStyle = '#ffffff';
        potterCtx.beginPath();
        potterCtx.arc(15.7, -22.8, 0.35, 0, Math.PI * 2);
        potterCtx.fill();
        // Raised ginger eyebrow
        potterCtx.strokeStyle = '#c2410c';
        potterCtx.lineWidth = 1.4;
        potterCtx.beginPath();
        potterCtx.moveTo(13.2, -25.2);
        potterCtx.lineTo(16.8, -24.4);
        potterCtx.stroke();
        // Open shouting mouth
        potterCtx.fillStyle = '#991b1b';
        potterCtx.beginPath();
        potterCtx.ellipse(17.4, -18.6, 1.3, 0.8, -0.2, 0, Math.PI * 2);
        potterCtx.fill();

      } else if (r.character === 'hermione') {
        // ==================== HERMIONE GRANGER (Emma Watson Movie Likeness) ====================
        // Delicate, Refined Feminine Profile
        const herSkinGrad = potterCtx.createLinearGradient(6, -28, 18, -16);
        herSkinGrad.addColorStop(0, '#fff1f2');
        herSkinGrad.addColorStop(0.5, '#fed7aa');
        herSkinGrad.addColorStop(1, '#fbcfe8'); // Rosy blush
        potterCtx.fillStyle = herSkinGrad;
        potterCtx.beginPath();
        potterCtx.moveTo(6, -28);
        potterCtx.bezierCurveTo(12, -30, 16.5, -27, 16.0, -24.2); // Smooth forehead
        potterCtx.lineTo(19.0, -21.8); // Slender straight nose
        potterCtx.lineTo(17.2, -20.8); // Philtrum
        potterCtx.lineTo(18.0, -19.2); // Rose lips
        potterCtx.lineTo(16.5, -16.8); // Delicate tapered chin
        potterCtx.quadraticCurveTo(8.5, -15.0, 6.2, -19.5); // Graceful jawline
        potterCtx.closePath();
        potterCtx.fill();

        // Rosy Lips
        potterCtx.fillStyle = '#e11d48';
        potterCtx.beginPath();
        potterCtx.ellipse(17.6, -19.2, 1.2, 0.6, -0.1, 0, Math.PI * 2);
        potterCtx.fill();

        // Ear & Golden Stud Earring
        potterCtx.fillStyle = '#fed7aa';
        potterCtx.beginPath();
        potterCtx.ellipse(5.5, -21.2, 2.0, 2.8, 0.15, 0, Math.PI * 2);
        potterCtx.fill();
        potterCtx.fillStyle = '#fbbf24';
        potterCtx.beginPath();
        potterCtx.arc(5.4, -20.2, 0.6, 0, Math.PI * 2);
        potterCtx.fill();

        // Bushy Honey-Brown / Chestnut Waves (Her Signature Cascading Mane!)
        // Deep chestnut base volume
        potterCtx.fillStyle = '#451a03';
        potterCtx.beginPath();
        potterCtx.moveTo(5, -26);
        potterCtx.bezierCurveTo(3, -33, 13, -34, 16.5, -27);
        potterCtx.bezierCurveTo(13, -24, 8, -23, 6, -25);
        potterCtx.closePath();
        potterCtx.fill();

        // Billowing wave layer 1 (Mid-body volume)
        const curlGrad1 = potterCtx.createLinearGradient(4, -28, -42, -18);
        curlGrad1.addColorStop(0, '#78350f');
        curlGrad1.addColorStop(0.5, '#92400e');
        curlGrad1.addColorStop(1, '#b45309');
        potterCtx.fillStyle = curlGrad1;
        potterCtx.beginPath();
        potterCtx.moveTo(5, -27);
        potterCtx.bezierCurveTo(-12, -33 + w1, -26, -28 + w2, -44, -25 + w3);
        potterCtx.lineTo(-38, -17 + w3);
        potterCtx.bezierCurveTo(-22, -21 + w2, -8, -21 + w1, 3, -20);
        potterCtx.closePath();
        potterCtx.fill();

        // Billowing wave layer 2 (Cascading lower curls)
        potterCtx.fillStyle = '#92400e';
        potterCtx.beginPath();
        potterCtx.moveTo(3, -22);
        potterCtx.bezierCurveTo(-10, -25 + w2, -24, -20 + w3, -42, -18 + w4);
        potterCtx.lineTo(-36, -11 + w4);
        potterCtx.bezierCurveTo(-20, -14 + w3, -7, -15 + w2, 2, -16);
        potterCtx.closePath();
        potterCtx.fill();

        // Textured ribbon strands & honey-caramel highlights
        potterCtx.strokeStyle = '#d97706';
        potterCtx.lineWidth = 1.6;
        potterCtx.beginPath();
        potterCtx.moveTo(7, -30);
        potterCtx.bezierCurveTo(-8, -33 + w1, -22, -28 + w2, -40, -24 + w3);
        potterCtx.moveTo(5, -25);
        potterCtx.bezierCurveTo(-9, -29 + w1, -23, -23 + w2, -39, -19 + w3);
        potterCtx.moveTo(4, -21);
        potterCtx.bezierCurveTo(-8, -24 + w2, -21, -18 + w3, -37, -15 + w4);
        potterCtx.stroke();

        // Top golden ringlet highlights
        potterCtx.strokeStyle = '#fde68a';
        potterCtx.lineWidth = 0.9;
        potterCtx.beginPath();
        potterCtx.moveTo(9, -31);
        potterCtx.bezierCurveTo(-4, -33 + w1, -16, -29 + w2, -32, -25 + w3);
        potterCtx.stroke();

        // Warm Hazel-Brown Eyes & Intelligent Concentration
        potterCtx.fillStyle = '#ffffff';
        potterCtx.beginPath();
        potterCtx.ellipse(15.2, -22.4, 1.8, 1.25, 0.1, 0, Math.PI * 2);
        potterCtx.fill();
        // Hazel Iris
        potterCtx.fillStyle = '#78350f';
        potterCtx.beginPath();
        potterCtx.arc(15.4, -22.4, 1.15, 0, Math.PI * 2);
        potterCtx.fill();
        // Eyelashes & Pupil
        potterCtx.fillStyle = '#1c1917';
        potterCtx.beginPath();
        potterCtx.arc(15.5, -22.4, 0.55, 0, Math.PI * 2);
        potterCtx.fill();
        // Delicate Eyelash wing
        potterCtx.strokeStyle = '#1c1917';
        potterCtx.lineWidth = 0.9;
        potterCtx.beginPath();
        potterCtx.moveTo(13.6, -23.2);
        potterCtx.lineTo(16.8, -23.0);
        potterCtx.stroke();
        // Catchlight
        potterCtx.fillStyle = '#ffffff';
        potterCtx.beginPath();
        potterCtx.arc(15.7, -22.8, 0.35, 0, Math.PI * 2);
        potterCtx.fill();
        // Refined arched eyebrow
        potterCtx.strokeStyle = '#451a03';
        potterCtx.lineWidth = 1.2;
        potterCtx.beginPath();
        potterCtx.moveTo(13.2, -24.8);
        potterCtx.quadraticCurveTo(15.2, -25.6, 17.0, -24.2);
        potterCtx.stroke();

        // Golden Time-Turner Pendant (Spinning concentric rings & miniature hourglass)
        potterCtx.strokeStyle = '#fbbf24';
        potterCtx.lineWidth = 0.9;
        potterCtx.beginPath();
        potterCtx.moveTo(4, -15);
        potterCtx.quadraticCurveTo(5, -11, 7, -13);
        potterCtx.stroke();
        // Outer gold ring
        potterCtx.strokeStyle = '#f59e0b';
        potterCtx.lineWidth = 1.0;
        potterCtx.beginPath();
        potterCtx.arc(7, -13, 2.4, 0, Math.PI * 2);
        potterCtx.stroke();
        // Inner gold ring
        potterCtx.strokeStyle = '#fbbf24';
        potterCtx.lineWidth = 0.8;
        potterCtx.beginPath();
        potterCtx.arc(7, -13, 1.5, 0, Math.PI * 2);
        potterCtx.stroke();
        // Miniature hourglass sand core
        potterCtx.fillStyle = '#fef08a';
        potterCtx.beginPath();
        potterCtx.arc(7, -13, 0.8, 0, Math.PI * 2);
        potterCtx.fill();

        // Vine-wood Wand with Lumos Maxima Starburst Flare
        potterCtx.strokeStyle = '#78350f';
        potterCtx.lineWidth = 1.6;
        potterCtx.beginPath();
        potterCtx.moveTo(28, -6);
        potterCtx.lineTo(46, -11);
        potterCtx.stroke();

        // Lumos Maxima tip spark
        potterCtx.save();
        potterCtx.globalCompositeOperation = 'lighter';
        potterCtx.fillStyle = '#38bdf8';
        potterCtx.beginPath();
        potterCtx.arc(46, -11, 4.5, 0, Math.PI * 2);
        potterCtx.fill();
        potterCtx.fillStyle = '#ffffff';
        potterCtx.beginPath();
        potterCtx.arc(46, -11, 2.2, 0, Math.PI * 2);
        potterCtx.fill();
        potterCtx.restore();

      } else if (r.character === 'dumbledore') {
        // ==================== ALBUS DUMBLEDORE (Richard Harris / Gambon Likeness) ====================
        // Dignified Elder Profile with Crooked Nose Bridge (Canon!)
        const dumSkinGrad = potterCtx.createLinearGradient(5, -28, 18, -16);
        dumSkinGrad.addColorStop(0, '#fff7ed');
        dumSkinGrad.addColorStop(0.5, '#fed7aa');
        dumSkinGrad.addColorStop(1, '#ffedd5');
        potterCtx.fillStyle = dumSkinGrad;
        potterCtx.beginPath();
        potterCtx.moveTo(5, -28);
        potterCtx.bezierCurveTo(11, -30, 16, -27, 15.5, -24.2); // Brow
        potterCtx.lineTo(17.5, -23.2); // Crooked nose bridge bend
        potterCtx.lineTo(20.5, -21.2); // Aquiline nose tip
        potterCtx.lineTo(18.0, -20.0); // Base of nose
        potterCtx.lineTo(17.0, -17.0); // Chin
        potterCtx.quadraticCurveTo(8.0, -14.8, 5.5, -19.5); // Jaw
        potterCtx.closePath();
        potterCtx.fill();

        // Ear
        potterCtx.fillStyle = '#fed7aa';
        potterCtx.beginPath();
        potterCtx.ellipse(5.2, -21.2, 2.3, 3.4, 0.15, 0, Math.PI * 2);
        potterCtx.fill();

        // Magnificent Waist-Length Cascading Silver-White Beard
        const beardGrad = potterCtx.createLinearGradient(16, -17, -26, 16);
        beardGrad.addColorStop(0, '#ffffff');
        beardGrad.addColorStop(0.35, '#f8fafc');
        beardGrad.addColorStop(0.7, '#e2e8f0');
        beardGrad.addColorStop(1, '#cbd5e1');
        potterCtx.fillStyle = beardGrad;
        potterCtx.beginPath();
        potterCtx.moveTo(17.5, -19.5); // Upper mustache line
        potterCtx.bezierCurveTo(22, -14, 20, 0, 14, 12);
        potterCtx.bezierCurveTo(6, 18, -6, 20 + w1, -18, 14 + w2);
        potterCtx.bezierCurveTo(-26, 6 + w2, -22, -6 + w1, -12, -14);
        potterCtx.bezierCurveTo(-2, -17, 8, -17, 14, -18.5);
        potterCtx.closePath();
        potterCtx.fill();

        // Silver beard hair strands
        potterCtx.strokeStyle = '#ffffff';
        potterCtx.lineWidth = 1.4;
        potterCtx.beginPath();
        potterCtx.moveTo(16, -16);
        potterCtx.bezierCurveTo(18, -8, 14, 6, 8, 14);
        potterCtx.moveTo(12, -15);
        potterCtx.bezierCurveTo(10, -5, 4, 8, -4, 16 + w1);
        potterCtx.moveTo(8, -15);
        potterCtx.bezierCurveTo(2, -7, -8, 4, -14, 12 + w2);
        potterCtx.stroke();

        // Authentic Silver Beard-Ring / Buckle (Movie Canon Tie!)
        potterCtx.fillStyle = '#e2e8f0';
        potterCtx.fillRect(6, 4, 4.5, 3.5);
        potterCtx.strokeStyle = '#94a3b8';
        potterCtx.lineWidth = 0.8;
        potterCtx.strokeRect(6, 4, 4.5, 3.5);

        // Grand Silver Mustache
        potterCtx.fillStyle = '#f8fafc';
        potterCtx.beginPath();
        potterCtx.ellipse(16.5, -18.2, 4.4, 2.0, 0.15, 0, Math.PI * 2);
        potterCtx.fill();

        // Flowing silver-white hair spilling beneath his hat
        potterCtx.strokeStyle = '#f1f5f9';
        potterCtx.lineWidth = 3.6;
        potterCtx.beginPath();
        potterCtx.moveTo(6, -26);
        potterCtx.bezierCurveTo(-8, -30 + w1, -24, -24 + w2, -42, -18 + w3);
        potterCtx.stroke();

        // Golden Half-Moon Spectacles Perched on Crooked Nose
        potterCtx.save();
        // Half-moon curved lens glaze
        potterCtx.fillStyle = 'rgba(254, 240, 138, 0.35)';
        potterCtx.beginPath();
        potterCtx.arc(16.2, -21.4, 3.0, 0, Math.PI); // Half-moon crescent!
        potterCtx.closePath();
        potterCtx.fill();
        // Gold Half-Moon Wire Frame
        potterCtx.strokeStyle = '#fbbf24';
        potterCtx.lineWidth = 1.1;
        potterCtx.beginPath();
        potterCtx.moveTo(13.2, -21.4);
        potterCtx.lineTo(19.2, -21.4); // Flat top wire
        potterCtx.arc(16.2, -21.4, 3.0, 0, Math.PI); // Curved bottom wire
        potterCtx.stroke();
        // Gold temple chain extending to ear
        potterCtx.beginPath();
        potterCtx.moveTo(13.2, -21.4);
        potterCtx.quadraticCurveTo(8.5, -20.5, 5.2, -21.5);
        potterCtx.stroke();
        // Specular crystal glint
        potterCtx.fillStyle = '#ffffff';
        potterCtx.beginPath();
        potterCtx.arc(17.4, -20.2, 0.6, 0, Math.PI * 2);
        potterCtx.fill();
        potterCtx.restore();

        // Wise Twinkling Cerulean Blue Eye with 4-Point Star Twinkle
        potterCtx.fillStyle = '#ffffff';
        potterCtx.beginPath();
        potterCtx.ellipse(15.2, -22.6, 1.8, 1.2, 0.1, 0, Math.PI * 2);
        potterCtx.fill();
        potterCtx.fillStyle = '#0284c7';
        potterCtx.beginPath();
        potterCtx.arc(15.4, -22.6, 1.1, 0, Math.PI * 2);
        potterCtx.fill();
        potterCtx.fillStyle = '#09090b';
        potterCtx.beginPath();
        potterCtx.arc(15.5, -22.6, 0.55, 0, Math.PI * 2);
        potterCtx.fill();
        // Signature Dumbledore Star Twinkle!
        potterCtx.save();
        potterCtx.strokeStyle = '#ffffff';
        potterCtx.lineWidth = 0.9;
        potterCtx.beginPath();
        potterCtx.moveTo(15.5, -23.5);
        potterCtx.lineTo(15.5, -21.7);
        potterCtx.moveTo(14.6, -22.6);
        potterCtx.lineTo(16.4, -22.6);
        potterCtx.stroke();
        potterCtx.restore();
        // Bushy white arched eyebrow
        potterCtx.strokeStyle = '#f8fafc';
        potterCtx.lineWidth = 1.6;
        potterCtx.beginPath();
        potterCtx.moveTo(13.2, -25.4);
        potterCtx.quadraticCurveTo(15.2, -26.2, 17.2, -24.6);
        potterCtx.stroke();

        // Midnight-Purple Velvet Wizard Hat with Gold Stars & Moons
        potterCtx.fillStyle = '#3b0764';
        potterCtx.beginPath();
        potterCtx.ellipse(9, -27, 12, 3.6, 0.1, 0, Math.PI * 2);
        potterCtx.fill();
        potterCtx.strokeStyle = '#fde047';
        potterCtx.lineWidth = 0.9;
        potterCtx.stroke();
        // Cone
        potterCtx.fillStyle = '#2e1065';
        potterCtx.beginPath();
        potterCtx.moveTo(3, -28);
        potterCtx.quadraticCurveTo(-6, -42, -22, -44 + w1 * 0.4);
        potterCtx.quadraticCurveTo(-6, -34, 16, -27);
        potterCtx.closePath();
        potterCtx.fill();
        // Gold Astrological Embellishments
        potterCtx.fillStyle = '#fbbf24';
        potterCtx.font = 'bold 5.5px sans-serif';
        potterCtx.fillText('★', 7, -31);
        potterCtx.fillText('☽', -2, -35);
        potterCtx.fillText('★', -12, -39);

        // The Elder Wand (Deathstick with 6 Carved Nodules)
        potterCtx.strokeStyle = '#573016';
        potterCtx.lineWidth = 2.2;
        potterCtx.beginPath();
        potterCtx.moveTo(26, -8);
        potterCtx.lineTo(46, -26);
        potterCtx.stroke();
        // 6 Carved Elderberry Nodes
        [1, 2, 3, 4, 5].forEach(i => {
          potterCtx.fillStyle = '#3b1805';
          potterCtx.beginPath();
          potterCtx.arc(26 + i * 3.8, -8 - i * 3.4, 1.7, 0, Math.PI * 2);
          potterCtx.fill();
        });
        // Phoenix Starlight Flare
        potterCtx.save();
        potterCtx.globalCompositeOperation = 'lighter';
        potterCtx.fillStyle = '#c084fc';
        potterCtx.beginPath();
        potterCtx.arc(46, -26, 7.5, 0, Math.PI * 2);
        potterCtx.fill();
        potterCtx.fillStyle = '#fde047';
        potterCtx.beginPath();
        potterCtx.arc(46, -26, 3.5, 0, Math.PI * 2);
        potterCtx.fill();
        potterCtx.restore();

      } else if (r.character === 'draco') {
        // ==================== DRACO MALFOY (Tom Felton Movie Likeness) ====================
        // Sharp Patrician Profile & Pale Complexion
        const drcSkinGrad = potterCtx.createLinearGradient(6, -28, 18, -16);
        drcSkinGrad.addColorStop(0, '#ffffff');
        drcSkinGrad.addColorStop(0.5, '#fff1f2'); // Pale aristocratic skin
        drcSkinGrad.addColorStop(1, '#ffedd5');
        potterCtx.fillStyle = drcSkinGrad;
        potterCtx.beginPath();
        potterCtx.moveTo(6, -28);
        potterCtx.bezierCurveTo(12, -30, 16.5, -27, 16.0, -24.2); // Forehead
        potterCtx.lineTo(19.2, -21.6); // Sharp straight nose
        potterCtx.lineTo(17.2, -20.6); // Philtrum
        potterCtx.lineTo(17.8, -19.0); // Sneering smirk lips
        potterCtx.lineTo(16.2, -16.4); // Sharp pointed chin
        potterCtx.quadraticCurveTo(8.5, -14.6, 6.2, -19.5); // Angular jaw
        potterCtx.closePath();
        potterCtx.fill();

        // Ear
        potterCtx.fillStyle = '#fff1f2';
        potterCtx.beginPath();
        potterCtx.ellipse(5.5, -21.2, 2.1, 3.0, 0.15, 0, Math.PI * 2);
        potterCtx.fill();

        // Sleek Platinum-Blonde Swept-Back Hair (Immaculate Razor Finish)
        const dracHairGrad = potterCtx.createLinearGradient(4, -32, 17, -22);
        dracHairGrad.addColorStop(0, '#ffffff');
        dracHairGrad.addColorStop(0.4, '#fef9c3');
        dracHairGrad.addColorStop(0.8, '#fef08a');
        dracHairGrad.addColorStop(1, '#fde047');
        potterCtx.fillStyle = dracHairGrad;
        potterCtx.beginPath();
        potterCtx.moveTo(5, -25);
        potterCtx.bezierCurveTo(3, -33, 14, -34, 17, -27);
        potterCtx.bezierCurveTo(14, -25, 9, -24, 6, -25);
        potterCtx.closePath();
        potterCtx.fill();

        // Slicked-back locks
        potterCtx.fillStyle = '#fef9c3';
        potterCtx.beginPath();
        potterCtx.moveTo(5, -28);
        potterCtx.quadraticCurveTo(-6, -31, -16, -25 + w4);
        potterCtx.lineTo(-12, -21 + w4);
        potterCtx.quadraticCurveTo(-3, -26, 3, -24);
        potterCtx.closePath();
        potterCtx.fill();

        potterCtx.strokeStyle = '#ffffff';
        potterCtx.lineWidth = 1.3;
        potterCtx.beginPath();
        potterCtx.moveTo(8, -31);
        potterCtx.quadraticCurveTo(-2, -34, -13, -27 + w4);
        potterCtx.stroke();

        // Cold Slate-Grey Eye & Supercilious Sneer
        potterCtx.fillStyle = '#ffffff';
        potterCtx.beginPath();
        potterCtx.ellipse(15.2, -22.4, 1.8, 1.2, 0.1, 0, Math.PI * 2);
        potterCtx.fill();
        // Slate-Grey Iris
        potterCtx.fillStyle = '#64748b';
        potterCtx.beginPath();
        potterCtx.arc(15.4, -22.4, 1.1, 0, Math.PI * 2);
        potterCtx.fill();
        potterCtx.fillStyle = '#18181b';
        potterCtx.beginPath();
        potterCtx.arc(15.5, -22.4, 0.55, 0, Math.PI * 2);
        potterCtx.fill();
        potterCtx.fillStyle = '#ffffff';
        potterCtx.beginPath();
        potterCtx.arc(15.7, -22.8, 0.35, 0, Math.PI * 2);
        potterCtx.fill();
        // Arched Haughty Brow
        potterCtx.strokeStyle = '#a1a1aa';
        potterCtx.lineWidth = 1.3;
        potterCtx.beginPath();
        potterCtx.moveTo(13.2, -24.8);
        potterCtx.quadraticCurveTo(15.2, -26.0, 17.2, -24.6);
        potterCtx.stroke();
        // Sneer smirk
        potterCtx.strokeStyle = '#991b1b';
        potterCtx.lineWidth = 0.9;
        potterCtx.beginPath();
        potterCtx.moveTo(16.5, -18.8);
        potterCtx.lineTo(18.0, -19.4);
        potterCtx.stroke();
      }

      potterCtx.restore();

      // --- Interactive Hover / Hero Focus Badge in Screen Coordinates ---
      const riderScreenX = r.x;
      const riderScreenY = r.y;
      const distToCursor = Math.hypot(riderScreenX - mouseGlobalX, riderScreenY - mouseGlobalY);
      const isRiderHovered = (distToCursor < 95 * k);

      if (isRiderHovered || r.heroPassTimer > 0) {
        potterCtx.save();
        potterCtx.font = '600 12px "Outfit", sans-serif';
        const labelText = (r.character === 'harry') ? '⚡ Harry Potter (Nimbus 2000)' :
                          (r.character === 'ron') ? '🦁 Ron Weasley (Cleansweep)' :
                          (r.character === 'hermione') ? '✨ Hermione Granger (Time-Turner & Lumos)' :
                          (r.character === 'dumbledore') ? '🌟 Albus Dumbledore (The Elder Wand)' :
                          '🐍 Draco Malfoy (Nimbus 2001)';
        const textWidth = potterCtx.measureText(labelText).width;
        const badgeW = textWidth + 24;
        const badgeH = 26;
        const badgeX = riderScreenX - badgeW / 2;
        const badgeY = riderScreenY - 48 * k;

        // Frosted glass tag background
        potterCtx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        potterCtx.beginPath();
        if (typeof potterCtx.roundRect === 'function') {
          potterCtx.roundRect(badgeX, badgeY, badgeW, badgeH, 13);
        } else {
          potterCtx.rect(badgeX, badgeY, badgeW, badgeH);
        }
        potterCtx.fill();

        // Border in character trim color
        potterCtx.strokeStyle = r.trimColor;
        potterCtx.lineWidth = 1.6;
        potterCtx.beginPath();
        if (typeof potterCtx.roundRect === 'function') {
          potterCtx.roundRect(badgeX, badgeY, badgeW, badgeH, 13);
        } else {
          potterCtx.rect(badgeX, badgeY, badgeW, badgeH);
        }
        potterCtx.stroke();

        // Glowing text
        potterCtx.fillStyle = '#ffffff';
        potterCtx.textAlign = 'center';
        potterCtx.textBaseline = 'middle';
        potterCtx.fillText(labelText, riderScreenX, badgeY + badgeH / 2);
        potterCtx.restore();
      }
    });

    // --- G. Hedwig the Snowy Owl (Movie-Realistic Flight) ---
    if (snowyOwl) {
      snowyOwl.x += snowyOwl.vx;
      if (snowyOwl.x > pCanvas.width + 180) {
        snowyOwl.x = -180;
        snowyOwl.baseY = pCanvas.height * (0.16 + Math.random() * 0.28);
      }

      // Flapping & Gliding cycle
      snowyOwl.glideTimer++;
      if (snowyOwl.glideTimer > 60) {
        snowyOwl.isGliding = !snowyOwl.isGliding;
        snowyOwl.glideTimer = 0;
      }

      if (snowyOwl.isGliding) {
        snowyOwl.wingAngle = 0.08 + Math.sin(potterTick * 2) * 0.05;
        snowyOwl.y = snowyOwl.baseY + Math.sin(potterTick * 1.5) * 8;
      } else {
        snowyOwl.flapPhase += 0.14;
        snowyOwl.wingAngle = Math.sin(snowyOwl.flapPhase) * 0.72;
        snowyOwl.y = snowyOwl.baseY + Math.sin(snowyOwl.flapPhase) * 6;
      }

      const ok = 380 / snowyOwl.z;

      // Drifting feather dust
      if (Math.random() > 0.6) {
        snowyOwl.trail.push({
          x: snowyOwl.x - 20 * ok,
          y: snowyOwl.y + 6 * ok,
          vx: -0.6 + (Math.random() - 0.5) * 0.6,
          vy: 0.4 + Math.random() * 0.5,
          alpha: 0.9,
          size: Math.random() * 2.2 + 1.2
        });
      }

      snowyOwl.trail.forEach(f => {
        f.x += f.vx;
        f.y += f.vy;
        f.alpha -= 0.02;
      });
      snowyOwl.trail = snowyOwl.trail.filter(f => f.alpha > 0);

      snowyOwl.trail.forEach(f => {
        potterCtx.save();
        potterCtx.globalAlpha = f.alpha * 0.35;
        potterCtx.fillStyle = '#bae6fd';
        potterCtx.beginPath();
        potterCtx.arc(f.x, f.y, f.size * 1.8, 0, Math.PI * 2);
        potterCtx.fill();
        potterCtx.globalAlpha = f.alpha;
        potterCtx.fillStyle = '#ffffff';
        potterCtx.beginPath();
        potterCtx.arc(f.x, f.y, f.size * 0.7, 0, Math.PI * 2);
        potterCtx.fill();
        potterCtx.restore();
      });

      // Draw Hedwig Sprite
      potterCtx.save();
      potterCtx.translate(snowyOwl.x, snowyOwl.y);
      potterCtx.scale(ok, ok);

      // Tail feathers
      potterCtx.fillStyle = '#f8fafc';
      potterCtx.beginPath();
      potterCtx.moveTo(-22, 2);
      potterCtx.lineTo(-38, 5);
      potterCtx.lineTo(-36, 12);
      potterCtx.lineTo(-20, 7);
      potterCtx.closePath();
      potterCtx.fill();

      // Snowy white body with slate stippling
      const bodyGrad = potterCtx.createRadialGradient(-5, 0, 2, -5, 0, 24);
      bodyGrad.addColorStop(0, '#ffffff');
      bodyGrad.addColorStop(0.7, '#f1f5f9');
      bodyGrad.addColorStop(1, '#cbd5e1');

      potterCtx.fillStyle = bodyGrad;
      potterCtx.beginPath();
      potterCtx.ellipse(-5, 0, 22, 12, -0.15, 0, Math.PI * 2);
      potterCtx.fill();

      // Charcoal feather speckles
      potterCtx.fillStyle = '#475569';
      [[-12, -4], [-8, 2], [-14, 3], [-4, -3], [-10, -1]].forEach(([fx, fy]) => {
        potterCtx.fillRect(fx, fy, 2.2, 1.2);
      });

      // Head
      potterCtx.fillStyle = '#ffffff';
      potterCtx.beginPath();
      potterCtx.arc(14, -4, 9.5, 0, Math.PI * 2);
      potterCtx.fill();

      // Golden owl eyes & pupil
      potterCtx.fillStyle = '#f59e0b';
      potterCtx.beginPath();
      potterCtx.arc(18, -5, 3.2, 0, Math.PI * 2);
      potterCtx.fill();

      potterCtx.fillStyle = '#09090b';
      potterCtx.beginPath();
      potterCtx.arc(19, -5, 1.8, 0, Math.PI * 2);
      potterCtx.fill();

      // Curved beak
      potterCtx.fillStyle = '#1e293b';
      potterCtx.beginPath();
      potterCtx.moveTo(22, -4);
      potterCtx.lineTo(26, -2);
      potterCtx.lineTo(22, 0);
      potterCtx.closePath();
      potterCtx.fill();

      // Left Wing (Articulated primary & secondary flight feathers)
      potterCtx.save();
      potterCtx.translate(-4, -5);
      potterCtx.rotate(snowyOwl.wingAngle);

      potterCtx.fillStyle = '#f8fafc';
      potterCtx.strokeStyle = '#e2e8f0';
      potterCtx.lineWidth = 1;
      potterCtx.beginPath();
      potterCtx.moveTo(0, 0);
      potterCtx.quadraticCurveTo(-15, -35, -30, -52);
      // 5 slotted primary flight feather finger tips
      potterCtx.lineTo(-24, -46);
      potterCtx.lineTo(-18, -42);
      potterCtx.lineTo(-12, -36);
      potterCtx.lineTo(-6, -28);
      potterCtx.quadraticCurveTo(-2, -12, 12, -2);
      potterCtx.closePath();
      potterCtx.fill();
      potterCtx.stroke();
      potterCtx.restore();

      // Right Wing
      potterCtx.save();
      potterCtx.translate(2, -3);
      potterCtx.rotate(snowyOwl.wingAngle * 0.95);

      potterCtx.fillStyle = '#ffffff';
      potterCtx.strokeStyle = '#e2e8f0';
      potterCtx.lineWidth = 1;
      potterCtx.beginPath();
      potterCtx.moveTo(0, 0);
      potterCtx.quadraticCurveTo(-10, -32, -24, -48);
      potterCtx.lineTo(-19, -42);
      potterCtx.lineTo(-14, -38);
      potterCtx.lineTo(-8, -32);
      potterCtx.lineTo(-3, -24);
      potterCtx.quadraticCurveTo(4, -10, 16, 0);
      potterCtx.closePath();
      potterCtx.fill();
      potterCtx.stroke();
      potterCtx.restore();

      // Talons clutching sealed Hogwarts letter
      potterCtx.fillStyle = '#ca8a04';
      potterCtx.fillRect(4, 8, 4, 3);

      // Letter
      potterCtx.fillStyle = '#fef3c7';
      potterCtx.strokeStyle = '#b45309';
      potterCtx.lineWidth = 0.8;
      potterCtx.fillRect(0, 10, 14, 9);
      potterCtx.strokeRect(0, 10, 14, 9);

      // Red seal
      potterCtx.fillStyle = '#991b1b';
      potterCtx.beginPath();
      potterCtx.arc(7, 14.5, 2.5, 0, Math.PI * 2);
      potterCtx.fill();

      potterCtx.restore();
    }

    // --- H. The Golden Snitch (3D Metallic Mirror Shading & Reactive Evasive AI) ---
    if (goldenSnitch) {
      goldenSnitch.wingFlap += 1.45; // ~55Hz high-frequency vibration
      goldenSnitch.spinAngle += 0.05;
      goldenSnitch.stateTimer++;

      // Evasive Reactive AI: Startles and dodges away if user cursor / wand approaches!
      const snitchGlobalX = goldenSnitch.x;
      const snitchGlobalY = goldenSnitch.y;
      const mouseGlobalX = cx + state.mousePos.x;
      const mouseGlobalY = cy + state.mousePos.y;
      const distToMouse = Math.hypot(snitchGlobalX - mouseGlobalX, snitchGlobalY - mouseGlobalY);

      if (distToMouse < 175) {
        // Hypersonic evasive reaction!
        const evadeAngle = Math.atan2(snitchGlobalY - mouseGlobalY, snitchGlobalX - mouseGlobalX);
        goldenSnitch.vx = Math.cos(evadeAngle) * 9.5;
        goldenSnitch.vy = Math.sin(evadeAngle) * 9.5;
        goldenSnitch.isEvading = true;

        // Golden spark burst upon dodge
        for (let sp = 0; sp < 4; sp++) {
          goldenSnitch.sparkTrail.push({
            x: goldenSnitch.x,
            y: goldenSnitch.y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            alpha: 1,
            size: Math.random() * 3 + 1.5,
            color: '#fef08a'
          });
        }
      } else {
        goldenSnitch.isEvading = false;
        if (goldenSnitch.stateTimer > 85) {
          goldenSnitch.stateTimer = 0;
          // Pick a random visible open sky waypoint (Upper sky, Left turrets, Right full moon, or Bottom lake)
          const zones = [
            { x: 80 + Math.random() * (pCanvas.width - 160), y: 35 + Math.random() * 80 }, // Upper sky
            { x: 50 + Math.random() * 200, y: 80 + Math.random() * (pCanvas.height * 0.6) }, // Left castle sky
            { x: pCanvas.width - 250 + Math.random() * 190, y: 70 + Math.random() * (pCanvas.height * 0.55) }, // Right moon sky
            { x: 120 + Math.random() * (pCanvas.width - 240), y: pCanvas.height * 0.74 + Math.random() * (pCanvas.height * 0.16) } // Lower lake atmosphere
          ];
          const chosen = zones[Math.floor(Math.random() * zones.length)];
          goldenSnitch.targetX = chosen.x;
          goldenSnitch.targetY = chosen.y;
        }
        // Smooth hover pursuit
        goldenSnitch.vx += (goldenSnitch.targetX - goldenSnitch.x) * 0.0035;
        goldenSnitch.vy += (goldenSnitch.targetY - goldenSnitch.y) * 0.0035;
        goldenSnitch.vx *= 0.94;
        goldenSnitch.vy *= 0.94;
      }

      goldenSnitch.x += goldenSnitch.vx;
      goldenSnitch.y += goldenSnitch.vy;

      // Micro-jitter of hovering insectoid machine
      const jitterX = Math.sin(potterTick * 28) * 1.5;
      const jitterY = Math.cos(potterTick * 32) * 1.5;
      const drawSnitchX = goldenSnitch.x + jitterX;
      const drawSnitchY = goldenSnitch.y + jitterY;

      // Golden ion wake trail
      goldenSnitch.sparkTrail.push({
        x: drawSnitchX,
        y: drawSnitchY,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        alpha: 1,
        size: Math.random() * 2.8 + 1.4,
        color: '#facc15'
      });

      goldenSnitch.sparkTrail.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.038;
      });
      goldenSnitch.sparkTrail = goldenSnitch.sparkTrail.filter(p => p.alpha > 0);

      // Golden stardust wake trail (high performance layered glow)
      goldenSnitch.sparkTrail.forEach(p => {
        potterCtx.save();
        potterCtx.globalAlpha = p.alpha * 0.35;
        potterCtx.fillStyle = '#fde047';
        potterCtx.beginPath();
        potterCtx.arc(p.x, p.y, p.size * 1.9, 0, Math.PI * 2);
        potterCtx.fill();
        potterCtx.globalAlpha = p.alpha;
        potterCtx.fillStyle = '#ffffff';
        potterCtx.beginPath();
        potterCtx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
        potterCtx.fill();
        potterCtx.restore();
      });

      // --- Draw Movie-Accurate Golden Snitch (Canon 2-Wing Silver Quill & 3D Gold Sphere) ---
      potterCtx.save();
      potterCtx.translate(drawSnitchX, drawSnitchY);

      const rad = goldenSnitch.radius;
      // High-frequency hummingbird flutter oscillation
      const flap = Math.sin(goldenSnitch.wingFlap);
      const flapCos = Math.cos(goldenSnitch.wingFlap);
      const wingAngle = flap * 0.44;
      const tipFlex = -flapCos * 0.18;

      // Soft High-Speed Motion-Blur Feather Shimmer (Hummingbird Optical Effect)
      potterCtx.save();
      potterCtx.globalAlpha = 0.14;
      [-1, 1].forEach(side => {
        [-0.24, 0.24].forEach(blurOffset => {
          potterCtx.save();
          potterCtx.translate(side * (rad - 1.2), 0);
          potterCtx.rotate(side * (wingAngle + blurOffset));
          potterCtx.fillStyle = 'rgba(254, 240, 138, 0.45)';
          potterCtx.beginPath();
          potterCtx.moveTo(0, 0);
          potterCtx.bezierCurveTo(side * 14, -8, side * 28, -12, side * 40, -8);
          potterCtx.bezierCurveTo(side * 34, 4, side * 18, 5, 0, 0);
          potterCtx.fill();
          potterCtx.restore();
        });
      });
      potterCtx.restore();

      // EXACTLY TWO Canon Movie Wings (Left Wing: side = -1, Right Wing: side = 1)
      [-1, 1].forEach(side => {
        potterCtx.save();
        potterCtx.translate(side * (rad - 1.2), 0);
        potterCtx.rotate(side * wingAngle);

        const wingLength = 42;
        const wingTipY = -9 + tipFlex * 22;

        // Wing Blade Gradient (Luminous gossamer silver-gold film)
        const wingGrad = potterCtx.createLinearGradient(0, -6, side * wingLength, 4);
        wingGrad.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
        wingGrad.addColorStop(0.25, 'rgba(254, 249, 195, 0.82)');
        wingGrad.addColorStop(0.65, 'rgba(250, 204, 21, 0.58)');
        wingGrad.addColorStop(1, 'rgba(253, 224, 71, 0.32)');

        potterCtx.fillStyle = wingGrad;
        potterCtx.strokeStyle = 'rgba(254, 240, 138, 0.9)';
        potterCtx.lineWidth = 1.1;

        // Elegant movie feather outline:
        // Leading edge sweeps outward & curves slightly upward at the tip
        potterCtx.beginPath();
        potterCtx.moveTo(0, 0);
        potterCtx.bezierCurveTo(side * 14, -8, side * 28, -13, side * wingLength, wingTipY);
        // Tapered feather tip & scalloped trailing edge
        potterCtx.bezierCurveTo(side * (wingLength - 6), wingTipY + 7, side * 26, 7, side * 12, 4);
        potterCtx.quadraticCurveTo(side * 4, 1.5, 0, 0);
        potterCtx.fill();
        potterCtx.stroke();

        // Movie Quill / Rachis (Central feather spine running from hinge to tip)
        potterCtx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
        potterCtx.lineWidth = 1.2;
        potterCtx.beginPath();
        potterCtx.moveTo(0, 0);
        potterCtx.quadraticCurveTo(side * 20, -6, side * (wingLength - 2), wingTipY + 1);
        potterCtx.stroke();

        // Delicate Filigree Feather Barbs / Veins branching along trailing edge
        potterCtx.strokeStyle = 'rgba(234, 179, 8, 0.65)';
        potterCtx.lineWidth = 0.75;
        for (let b = 1; b <= 5; b++) {
          const t = b / 6.2;
          const qx = side * (wingLength * t);
          const qy = wingTipY * t;
          potterCtx.beginPath();
          potterCtx.moveTo(qx, qy);
          potterCtx.lineTo(qx - side * 2.8, qy + (4.5 + b * 0.7));
          potterCtx.stroke();
        }

        potterCtx.restore();
      });

      // Ambient Golden Light Halo
      const auraGrad = potterCtx.createRadialGradient(0, 0, rad * 0.4, 0, 0, rad * 2.5);
      auraGrad.addColorStop(0, 'rgba(253, 224, 71, 0.45)');
      auraGrad.addColorStop(0.55, 'rgba(234, 179, 8, 0.18)');
      auraGrad.addColorStop(1, 'transparent');
      potterCtx.fillStyle = auraGrad;
      potterCtx.beginPath();
      potterCtx.arc(0, 0, rad * 2.5, 0, Math.PI * 2);
      potterCtx.fill();

      // 3D Polished Gold Sphere (Walnut-sized movie prop)
      const snitchGrad = potterCtx.createRadialGradient(-rad * 0.35, -rad * 0.35, 0.5, 0, 0, rad);
      snitchGrad.addColorStop(0, '#ffffff');
      snitchGrad.addColorStop(0.18, '#fef08a');
      snitchGrad.addColorStop(0.52, '#eab308');
      snitchGrad.addColorStop(0.82, '#a16207');
      snitchGrad.addColorStop(1, '#451a03');

      potterCtx.fillStyle = snitchGrad;
      potterCtx.beginPath();
      potterCtx.arc(0, 0, rad, 0, Math.PI * 2);
      potterCtx.fill();

      // Movie Prop Curved Seams ("I open at the close")
      potterCtx.strokeStyle = 'rgba(69, 26, 3, 0.85)';
      potterCtx.lineWidth = 1.0;
      potterCtx.beginPath();
      potterCtx.ellipse(0, 0, rad * 0.95, rad * 0.36, goldenSnitch.spinAngle, 0, Math.PI * 2);
      potterCtx.stroke();

      potterCtx.beginPath();
      potterCtx.arc(0, -rad * 0.32, rad * 0.52, 0.2, Math.PI - 0.2);
      potterCtx.arc(0, rad * 0.32, rad * 0.52, Math.PI + 0.2, -0.2);
      potterCtx.stroke();

      // Gold seam specular reflection
      potterCtx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
      potterCtx.lineWidth = 0.6;
      potterCtx.beginPath();
      potterCtx.arc(0, -rad * 0.32 - 0.5, rad * 0.52, 0.3, Math.PI - 0.3);
      potterCtx.stroke();

      // Wing Root Swivel Sockets (Lateral hinge rivets on the ball)
      [-1, 1].forEach(side => {
        potterCtx.fillStyle = '#78350f';
        potterCtx.beginPath();
        potterCtx.arc(side * (rad - 1.2), 0, 2.2, 0, Math.PI * 2);
        potterCtx.fill();
        potterCtx.fillStyle = '#fef08a';
        potterCtx.beginPath();
        potterCtx.arc(side * (rad - 1.2), -0.4, 1.1, 0, Math.PI * 2);
        potterCtx.fill();
      });

      // Starburst Specular Highlight (High-gloss metallic glint)
      const glintX = -rad * 0.34;
      const glintY = -rad * 0.34;
      potterCtx.fillStyle = '#ffffff';
      potterCtx.beginPath();
      potterCtx.arc(glintX, glintY, 1.8, 0, Math.PI * 2);
      potterCtx.fill();

      // 4-point micro glint star
      potterCtx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      potterCtx.lineWidth = 0.8;
      potterCtx.beginPath();
      potterCtx.moveTo(glintX - 3.5, glintY);
      potterCtx.lineTo(glintX + 3.5, glintY);
      potterCtx.moveTo(glintX, glintY - 3.5);
      potterCtx.lineTo(glintX, glintY + 3.5);
      potterCtx.stroke();

      potterCtx.restore();
    }

    // --- I. Expanding Wand Shockwaves ("Lumos Maxima") ---
    wandShockwaves.forEach(sw => {
      sw.radius += sw.speed;
      sw.alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);

      potterCtx.save();
      // Outer luminous shockwave aura
      potterCtx.globalAlpha = sw.alpha * 0.35;
      potterCtx.strokeStyle = sw.color;
      potterCtx.lineWidth = 6;
      potterCtx.beginPath();
      potterCtx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      potterCtx.stroke();
      // Crisp inner ring
      potterCtx.globalAlpha = sw.alpha;
      potterCtx.lineWidth = 2;
      potterCtx.beginPath();
      potterCtx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      potterCtx.stroke();
      potterCtx.restore();
    });
    wandShockwaves = wandShockwaves.filter(sw => sw.alpha > 0);

    // --- J. Wand Sparks & Stardust Particles ---
    wandSparks.forEach(sp => {
      sp.x += sp.vx;
      sp.y += sp.vy;
      if (sp.gravity) sp.vy += sp.gravity;
      if (sp.drag) { sp.vx *= sp.drag; sp.vy *= sp.drag; }
      sp.alpha -= (sp.decay || 0.032);
    });
    wandSparks = wandSparks.filter(sp => sp.alpha > 0);

    wandSparks.forEach(sp => {
      potterCtx.save();
      // Soft outer glow halo
      potterCtx.globalAlpha = sp.alpha * 0.35;
      potterCtx.fillStyle = sp.color;
      potterCtx.beginPath();
      potterCtx.arc(sp.x, sp.y, sp.size * 1.8, 0, Math.PI * 2);
      potterCtx.fill();
      // Bright core spark
      potterCtx.globalAlpha = sp.alpha;
      potterCtx.fillStyle = '#ffffff';
      potterCtx.beginPath();
      potterCtx.arc(sp.x, sp.y, sp.size * 0.65, 0, Math.PI * 2);
      potterCtx.fill();
      potterCtx.restore();
    });

    // --- K. Interactive Lumos Wand Tip Orb at Cursor Position ---
    const mx = cx + state.mousePos.x;
    const my = cy + state.mousePos.y;
    if (mx > 0 && mx < pCanvas.width && my > 0 && my < pCanvas.height) {
      potterCtx.save();
      const lumosPulse = 1 + Math.sin(potterTick * 8) * 0.18;
      const lumosGrad = potterCtx.createRadialGradient(mx, my, 0, mx, my, 18 * lumosPulse);
      lumosGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      lumosGrad.addColorStop(0.35, 'rgba(254, 240, 138, 0.6)');
      lumosGrad.addColorStop(0.7, 'rgba(245, 158, 11, 0.2)');
      lumosGrad.addColorStop(1, 'transparent');

      potterCtx.fillStyle = lumosGrad;
      potterCtx.beginPath();
      potterCtx.arc(mx, my, 18 * lumosPulse, 0, Math.PI * 2);
      potterCtx.fill();
      potterCtx.restore();
    }

    requestAnimationFrame(renderPotterCosmos);
  }

  // --- 3D Birthday Theme Background Scene (Three.js WebGL + Smooth 2D Fallback) ---
  const cosmosCanvas = document.getElementById('cosmos-canvas');
  let cosmosCtx = null;

  let threeScene = null;
  let threeCamera = null;
  let threeRenderer = null;
  let balloons3D = [];
  let giftBoxes3D = [];
  let confettiFlakes3D = [];
  let stars3D = null;
  let lightRose = null;
  let lightCyan = null;
  let lightGold = null;
  let isThreeInitialized = false;

  function initThreeCosmos() {
    if (!cosmosCanvas || typeof THREE === 'undefined') return false;
    try {
      threeScene = new THREE.Scene();
      threeCamera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 2000);
      threeCamera.position.z = 450;

      threeRenderer = new THREE.WebGLRenderer({
        canvas: cosmosCanvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      threeRenderer.setSize(window.innerWidth, window.innerHeight);
      threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      // 1. Atmospheric Festive Lighting
      const ambientLight = new THREE.AmbientLight(0x2d174d, 1.4);
      threeScene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xfff5e1, 1.35);
      dirLight.position.set(160, 320, 220);
      threeScene.add(dirLight);

      lightRose = new THREE.PointLight(0xff3385, 3.2, 750);
      lightCyan = new THREE.PointLight(0x06d6a0, 2.6, 700);
      lightGold = new THREE.PointLight(0xffd166, 3.8, 800);
      threeScene.add(lightRose, lightCyan, lightGold);

      // 2. 3D Realistic Birthday Balloons
      const balloonColors = [
        0xffd166, // Champagne Gold
        0xff3385, // Vibrant Rose
        0x8338ec, // Royal Amethyst
        0x06d6a0, // Mint Turquoise
        0xfb5607, // Sunburst Orange
        0x3a86ff, // Sapphire Blue
        0xff70a6, // Blush Pink
        0xffffff  // Diamond White
      ];

      balloons3D = [];
      const balloonBodyGeo = new THREE.SphereGeometry(1, 28, 24);
      const balloonKnotGeo = new THREE.ConeGeometry(3.5, 6, 14);

      for (let i = 0; i < 22; i++) {
        const group = new THREE.Group();
        const col = balloonColors[i % balloonColors.length];
        const mat = new THREE.MeshPhongMaterial({
          color: col,
          specular: 0xffffff,
          shininess: 95,
          transparent: true,
          opacity: 0.88
        });

        // Main balloon body (realistic oval shape)
        const radius = 18 + Math.random() * 9;
        const meshBody = new THREE.Mesh(balloonBodyGeo, mat);
        meshBody.scale.set(radius, radius * 1.28, radius);
        group.add(meshBody);

        // Knot at bottom
        const knotMat = new THREE.MeshPhongMaterial({ color: col, shininess: 60 });
        const meshKnot = new THREE.Mesh(balloonKnotGeo, knotMat);
        meshKnot.rotation.x = Math.PI;
        meshKnot.position.y = -radius * 1.25;
        group.add(meshKnot);

        // Swaying silk string
        const stringPoints = [];
        const segs = 8;
        const stringLen = 70 + Math.random() * 25;
        for (let s = 0; s <= segs; s++) {
          const t = s / segs;
          stringPoints.push(new THREE.Vector3(
            Math.sin(s * 1.2) * 4,
            -radius * 1.25 - (t * stringLen),
            Math.cos(s * 1.2) * 3
          ));
        }
        const stringGeo = new THREE.BufferGeometry().setFromPoints(stringPoints);
        const stringMat = new THREE.LineBasicMaterial({
          color: 0xffeccc,
          transparent: true,
          opacity: 0.55
        });
        const line = new THREE.Line(stringGeo, stringMat);
        group.add(line);

        // Multi-Directional Placement across 3D space (coming from left, right, or bottom)
        const dirType = (i % 3 === 0) ? 'left' : ((i % 3 === 1) ? 'right' : 'bottom');
        let startX, startY, vx, vy;
        if (dirType === 'left') {
          startX = -window.innerWidth * 0.65 - Math.random() * 200;
          startY = -250 + Math.random() * 550;
          vx = 0.55 + Math.random() * 0.85;
          vy = 0.35 + Math.random() * 0.55;
        } else if (dirType === 'right') {
          startX = window.innerWidth * 0.65 + Math.random() * 200;
          startY = -250 + Math.random() * 550;
          vx = -(0.55 + Math.random() * 0.85);
          vy = 0.35 + Math.random() * 0.55;
        } else {
          startX = (Math.random() - 0.5) * (window.innerWidth * 0.9);
          startY = -420 + Math.random() * 400;
          vx = (Math.random() - 0.5) * 0.3;
          vy = 0.5 + Math.random() * 0.6;
        }

        const startZ = -380 + Math.random() * 450;
        group.position.set(startX, startY, startZ);

        balloons3D.push({
          group,
          radius,
          dirType,
          vx,
          vy,
          swayFreq: 0.015 + Math.random() * 0.02,
          swayAmp: 16 + Math.random() * 26,
          phase: Math.random() * Math.PI * 2,
          rotSpeedX: (Math.random() - 0.5) * 0.008,
          rotSpeedZ: (Math.random() - 0.5) * 0.008
        });

        threeScene.add(group);
      }

      // 3. 3D Floating Miniature Gift Boxes in Depth
      giftBoxes3D = [];
      const boxGeo = new THREE.BoxGeometry(22, 22, 22);
      const ribbonBand1Geo = new THREE.BoxGeometry(22.6, 22.6, 4.5);
      const ribbonBand2Geo = new THREE.BoxGeometry(4.5, 22.6, 22.6);
      const ribbonMat = new THREE.MeshPhongMaterial({
        color: 0xffd166,
        specular: 0xffffff,
        shininess: 100
      });

      for (let g = 0; g < 9; g++) {
        const giftGrp = new THREE.Group();
        const boxCol = balloonColors[(g * 2 + 1) % balloonColors.length];
        const boxMat = new THREE.MeshPhongMaterial({
          color: boxCol,
          specular: 0xffffff,
          shininess: 75
        });

        const mainCube = new THREE.Mesh(boxGeo, boxMat);
        const band1 = new THREE.Mesh(ribbonBand1Geo, ribbonMat);
        const band2 = new THREE.Mesh(ribbonBand2Geo, ribbonMat);
        giftGrp.add(mainCube, band1, band2);

        const gx = (Math.random() - 0.5) * (window.innerWidth * 0.85);
        const gy = (Math.random() - 0.5) * 600;
        const gz = -420 + Math.random() * 320;
        giftGrp.position.set(gx, gy, gz);

        giftBoxes3D.push({
          group: giftGrp,
          rotX: (Math.random() - 0.5) * 0.015,
          rotY: (Math.random() - 0.5) * 0.02,
          rotZ: (Math.random() - 0.5) * 0.01,
          baseY: gy,
          phase: Math.random() * Math.PI * 2
        });

        threeScene.add(giftGrp);
      }

      // 4. 3D Tumbling Birthday Confetti & Holographic Flakes
      confettiFlakes3D = [];
      const flakeGeo = new THREE.PlaneGeometry(8, 14);
      const flakeColors = [0xffd166, 0xff3385, 0x06d6a0, 0x8338ec, 0xfb5607, 0x3a86ff, 0xffffff];

      for (let c = 0; c < 110; c++) {
        const fMat = new THREE.MeshPhongMaterial({
          color: flakeColors[c % flakeColors.length],
          side: THREE.DoubleSide,
          specular: 0xffffff,
          shininess: 95,
          transparent: true,
          opacity: 0.85
        });
        const flake = new THREE.Mesh(flakeGeo, fMat);
        flake.position.set(
          (Math.random() - 0.5) * (window.innerWidth * 1.1),
          (Math.random() - 0.5) * 800,
          -350 + Math.random() * 450
        );

        confettiFlakes3D.push({
          mesh: flake,
          vy: 0.45 + Math.random() * 0.85,
          vx: (Math.random() - 0.5) * 0.35,
          vrx: (Math.random() - 0.5) * 0.045,
          vry: (Math.random() - 0.5) * 0.05,
          vrz: (Math.random() - 0.5) * 0.04
        });

        threeScene.add(flake);
      }

      // 5. 3D Sparkling Starfield
      const starGeo = new THREE.BufferGeometry();
      const starCount = 300;
      const starPositions = new Float32Array(starCount * 3);
      for (let s = 0; s < starCount * 3; s += 3) {
        starPositions[s] = (Math.random() - 0.5) * 1600;
        starPositions[s + 1] = (Math.random() - 0.5) * 1100;
        starPositions[s + 2] = -500 + Math.random() * 700;
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      const starMat = new THREE.PointsMaterial({
        color: 0xfff6cf,
        size: 3.2,
        transparent: true,
        opacity: 0.8
      });
      stars3D = new THREE.Points(starGeo, starMat);
      threeScene.add(stars3D);

      isThreeInitialized = true;
      return true;
    } catch (err) {
      console.warn('Three.js initialization failed, falling back to 2D Canvas:', err);
      isThreeInitialized = false;
      return false;
    }
  }

  let threeClock = 0;
  function renderThreeCosmos() {
    if (!isThreeInitialized || !threeRenderer) return;

    // Strictly render festive 3D elements ONLY when festive theme is active!
    if (state.backgroundTheme !== 'festive') {
      requestAnimationFrame(renderThreeCosmos);
      return;
    }

    threeClock += 0.016;

    // 1. Camera 3D Parallax towards mouse
    const targetCamX = state.mousePos.x * 0.22;
    const targetCamY = -state.mousePos.y * 0.22;
    threeCamera.position.x += (targetCamX - threeCamera.position.x) * 0.045;
    threeCamera.position.y += (targetCamY - threeCamera.position.y) * 0.045;
    threeCamera.lookAt(0, 0, 0);

    // 2. Dynamic Point Lights Orbit
    if (lightRose) {
      lightRose.position.x = Math.sin(threeClock * 0.8) * 240;
      lightRose.position.y = Math.cos(threeClock * 0.6) * 180;
    }
    if (lightCyan) {
      lightCyan.position.x = Math.cos(threeClock * 0.7) * 220;
      lightCyan.position.y = Math.sin(threeClock * 0.9) * 190;
    }
    if (lightGold) {
      lightGold.position.x = state.mousePos.x * 0.35;
      lightGold.position.y = -state.mousePos.y * 0.35 + 40;
    }

    // 3. Balloons Float & Harmonic Sway Across Multiple Directions
    balloons3D.forEach(b => {
      b.group.position.y += b.vy;
      b.group.position.x += b.vx;
      b.group.position.x += Math.sin(threeClock * 2 * Math.PI * b.swayFreq + b.phase) * 0.45;
      b.group.rotation.x += b.rotSpeedX;
      b.group.rotation.z += b.rotSpeedZ;

      // Wrap around screen edges depending on trajectory
      const maxW = window.innerWidth * 0.7;
      if (b.group.position.y > 450 || b.group.position.x > maxW + 120 || b.group.position.x < -maxW - 120) {
        if (b.dirType === 'left') {
          b.group.position.x = -maxW - 80;
          b.group.position.y = -350 + Math.random() * 500;
        } else if (b.dirType === 'right') {
          b.group.position.x = maxW + 80;
          b.group.position.y = -350 + Math.random() * 500;
        } else {
          b.group.position.y = -450;
          b.group.position.x = (Math.random() - 0.5) * (window.innerWidth * 0.9);
        }
      }
    });

    // 4. Gift Boxes Tumbling
    giftBoxes3D.forEach(g => {
      g.group.rotation.x += g.rotX;
      g.group.rotation.y += g.rotY;
      g.group.rotation.z += g.rotZ;
      g.group.position.y = g.baseY + Math.sin(threeClock * 1.5 + g.phase) * 18;
    });

    // 5. Confetti Tumbling & Falling
    confettiFlakes3D.forEach(f => {
      f.mesh.position.y -= f.vy;
      f.mesh.position.x += f.vx;
      f.mesh.rotation.x += f.vrx;
      f.mesh.rotation.y += f.vry;
      f.mesh.rotation.z += f.vrz;

      if (f.mesh.position.y < -420) {
        f.mesh.position.y = 420;
        f.mesh.position.x = (Math.random() - 0.5) * (window.innerWidth * 1.1);
      }
    });

    // 6. Stars Shimmer
    if (stars3D) {
      stars3D.rotation.y = threeClock * 0.015;
    }

    threeRenderer.render(threeScene, threeCamera);
    requestAnimationFrame(renderThreeCosmos);
  }

  // --- Fallback 2D Cosmos System (True 3D Perspective Birthday Scene) ---
  let particles3D = [];
  let balloonsFallback = [];
  let confettiFallback = [];
  let giftsFallback = [];

  function initCosmos() {
    if (!cosmosCanvas || isThreeInitialized) return;
    if (!cosmosCtx) cosmosCtx = cosmosCanvas.getContext('2d');
    if (!cosmosCtx) return;
    cosmosCanvas.width = window.innerWidth;
    cosmosCanvas.height = window.innerHeight;

    particles3D = [];
    balloonsFallback = [];
    confettiFallback = [];
    giftsFallback = [];

    const colors = ['#ffd166', '#ff3385', '#06d6a0', '#8338ec', '#ff70a6', '#ffffff', '#fb5607', '#3a86ff'];

    // 1. 3D Perspective Floating Balloons entering from multiple directions (left, right, bottom)
    for (let b = 0; b < 18; b++) {
      const mode = (b % 3 === 0) ? 'left' : ((b % 3 === 1) ? 'right' : 'bottom');
      let sx, sy, svx, svy;
      if (mode === 'left') {
        sx = -window.innerWidth * 0.8 - Math.random() * 200;
        sy = (Math.random() - 0.5) * window.innerHeight * 1.4;
        svx = 0.75 + Math.random() * 0.85;
        svy = 0.35 + Math.random() * 0.45;
      } else if (mode === 'right') {
        sx = window.innerWidth * 0.8 + Math.random() * 200;
        sy = (Math.random() - 0.5) * window.innerHeight * 1.4;
        svx = -(0.75 + Math.random() * 0.85);
        svy = 0.35 + Math.random() * 0.45;
      } else {
        sx = (Math.random() - 0.5) * window.innerWidth * 1.4;
        sy = window.innerHeight * 0.7 + Math.random() * 300;
        svx = (Math.random() - 0.5) * 0.25;
        svy = 0.55 + Math.random() * 0.65;
      }

      balloonsFallback.push({
        mode,
        x: sx,
        y: sy,
        z: 220 + Math.random() * 450,
        radius: 20 + Math.random() * 12,
        color: colors[b % colors.length],
        vx: svx,
        vy: svy,
        swaySpeed: 0.015 + Math.random() * 0.02,
        swayAmp: 18 + Math.random() * 20,
        phase: Math.random() * Math.PI * 2
      });
    }

    // 2. 3D Perspective Tumbling Confetti Ribbons
    for (let c = 0; c < 45; c++) {
      confettiFallback.push({
        x: (Math.random() - 0.5) * window.innerWidth * 1.4,
        y: (Math.random() - 0.5) * window.innerHeight * 1.6,
        z: 200 + Math.random() * 500,
        w: 12 + Math.random() * 8,
        h: 6 + Math.random() * 6,
        color: colors[c % colors.length],
        vy: 0.6 + Math.random() * 0.8,
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        vRotX: (Math.random() - 0.5) * 0.06,
        vRotY: (Math.random() - 0.5) * 0.08
      });
    }

    // 3. 3D Rotating Mini Gift Boxes
    for (let g = 0; g < 6; g++) {
      giftsFallback.push({
        x: (Math.random() - 0.5) * window.innerWidth * 1.2,
        y: (Math.random() - 0.5) * window.innerHeight * 1.4,
        z: 320 + Math.random() * 400,
        size: 18 + Math.random() * 8,
        color: colors[(g * 2 + 1) % colors.length],
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.02,
        floatY: 0.2 + Math.random() * 0.2
      });
    }

    // 4. Sparkling Stars & Hearts
    const types = ['star', 'sparkle', 'heart'];
    for (let i = 0; i < 110; i++) {
      particles3D.push({
        x: (Math.random() - 0.5) * cosmosCanvas.width * 2.2,
        y: (Math.random() - 0.5) * cosmosCanvas.height * 2.2,
        z: Math.random() * cosmosCanvas.width,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: types[Math.floor(Math.random() * types.length)],
        size: Math.random() * 2.5 + 1.2,
        rot: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 2
      });
    }
  }

  function drawHeartParticle(c, x, y, size, color, alpha) {
    c.save();
    c.translate(x, y);
    c.scale(size * 0.15, size * 0.15);
    c.globalAlpha = alpha;
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(0, 0);
    c.bezierCurveTo(-5, -5, -10, 0, 0, 10);
    c.bezierCurveTo(10, 0, 5, -5, 0, 0);
    c.fill();
    c.restore();
  }

  function drawSparkleParticle(c, x, y, size, color, alpha, rot) {
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    c.globalAlpha = alpha;
    c.fillStyle = color;
    c.beginPath();
    for (let i = 0; i < 4; i++) {
      c.lineTo(Math.cos((i * 90 * Math.PI) / 180) * size * 2.5, Math.sin((i * 90 * Math.PI) / 180) * size * 2.5);
      c.lineTo(Math.cos(((i * 90 + 45) * Math.PI) / 180) * size * 0.6, Math.sin(((i * 90 + 45) * Math.PI) / 180) * size * 0.6);
    }
    c.closePath();
    c.fill();
    c.restore();
  }

  let cosmosTick = 0;
  function renderCosmos() {
    if (!cosmosCanvas || !cosmosCtx || isThreeInitialized) return;

    // Strictly render festive 2D elements ONLY when festive theme is active!
    if (state.backgroundTheme !== 'festive') {
      requestAnimationFrame(renderCosmos);
      return;
    }

    cosmosCtx.clearRect(0, 0, cosmosCanvas.width, cosmosCanvas.height);
    cosmosTick += 0.016;

    const cx = cosmosCanvas.width / 2;
    const cy = cosmosCanvas.height / 2;

    // --- 1. Draw 3D Balloons with Multi-Directional Trajectories ---
    balloonsFallback.forEach(b => {
      b.y -= b.vy;
      b.x += b.vx;
      const swayX = Math.sin(cosmosTick * 2 * Math.PI * b.swaySpeed + b.phase) * b.swayAmp;

      // Wrap around when exiting visible bounds
      const halfW = window.innerWidth * 0.85;
      if (b.y < -cosmosCanvas.height - 80 || b.x > halfW + 160 || b.x < -halfW - 160) {
        if (b.mode === 'left') {
          b.x = -halfW - 120;
          b.y = (Math.random() - 0.2) * cosmosCanvas.height;
        } else if (b.mode === 'right') {
          b.x = halfW + 120;
          b.y = (Math.random() - 0.2) * cosmosCanvas.height;
        } else {
          b.y = cosmosCanvas.height + 120;
          b.x = (Math.random() - 0.5) * window.innerWidth * 1.4;
        }
      }

      const k = 380 / b.z;
      const bx = cx + (b.x + swayX + state.mousePos.x * 0.12) * k;
      const by = cy + (b.y + state.mousePos.y * 0.12) * k;
      const br = b.radius * k;

      if (bx > -100 && bx < cosmosCanvas.width + 100 && by > -150 && by < cosmosCanvas.height + 150) {
        cosmosCtx.save();
        cosmosCtx.globalAlpha = Math.min(0.85, 420 / b.z);

        // Dangling silky string
        cosmosCtx.strokeStyle = 'rgba(255, 236, 204, 0.45)';
        cosmosCtx.lineWidth = Math.max(1, 1.5 * k);
        cosmosCtx.beginPath();
        cosmosCtx.moveTo(bx, by + br * 1.25);
        cosmosCtx.bezierCurveTo(
          bx + Math.sin(cosmosTick * 3 + b.phase) * 12 * k,
          by + br * 2.2,
          bx - Math.sin(cosmosTick * 3 + b.phase) * 8 * k,
          by + br * 3.5,
          bx + 2,
          by + br * 4.6
        );
        cosmosCtx.stroke();

        // 3D Metallic Balloon Sphere
        const grad = cosmosCtx.createRadialGradient(
          bx - br * 0.35, by - br * 0.35, br * 0.1,
          bx, by, br * 1.15
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, b.color);
        grad.addColorStop(1, '#110822');

        cosmosCtx.fillStyle = grad;
        cosmosCtx.beginPath();
        cosmosCtx.save();
        cosmosCtx.translate(bx, by);
        cosmosCtx.scale(1, 1.25);
        cosmosCtx.arc(0, 0, br, 0, Math.PI * 2);
        cosmosCtx.restore();
        cosmosCtx.fill();

        // Tied knot
        cosmosCtx.fillStyle = b.color;
        cosmosCtx.beginPath();
        cosmosCtx.moveTo(bx - br * 0.18, by + br * 1.24);
        cosmosCtx.lineTo(bx + br * 0.18, by + br * 1.24);
        cosmosCtx.lineTo(bx, by + br * 1.38);
        cosmosCtx.closePath();
        cosmosCtx.fill();

        cosmosCtx.restore();
      }
    });

    // --- 2. Draw 3D Tumbling Confetti ---
    confettiFallback.forEach(cf => {
      cf.y += cf.vy;
      cf.rotX += cf.vRotX;
      cf.rotY += cf.vRotY;
      if (cf.y > cosmosCanvas.height) {
        cf.y = -cosmosCanvas.height;
        cf.x = (Math.random() - 0.5) * window.innerWidth * 1.4;
      }

      const k = 380 / cf.z;
      const px = cx + (cf.x + state.mousePos.x * 0.08) * k;
      const py = cy + (cf.y + state.mousePos.y * 0.08) * k;

      if (px > 0 && px < cosmosCanvas.width && py > 0 && py < cosmosCanvas.height) {
        cosmosCtx.save();
        cosmosCtx.translate(px, py);
        cosmosCtx.scale(Math.cos(cf.rotX), Math.sin(cf.rotY));
        cosmosCtx.fillStyle = cf.color;
        cosmosCtx.globalAlpha = Math.min(0.8, 380 / cf.z);
        cosmosCtx.fillRect(-cf.w * k * 0.5, -cf.h * k * 0.5, cf.w * k, cf.h * k);
        cosmosCtx.restore();
      }
    });

    // --- 3. Draw 3D Mini Gift Boxes ---
    giftsFallback.forEach(g => {
      g.y += g.floatY;
      g.rot += g.vRot;
      if (g.y > cosmosCanvas.height) {
        g.y = -cosmosCanvas.height;
        g.x = (Math.random() - 0.5) * window.innerWidth * 1.2;
      }

      const k = 380 / g.z;
      const gx = cx + (g.x + state.mousePos.x * 0.06) * k;
      const gy = cy + (g.y + state.mousePos.y * 0.06) * k;
      const sz = g.size * k;

      if (gx > 0 && gx < cosmosCanvas.width && gy > 0 && gy < cosmosCanvas.height) {
        cosmosCtx.save();
        cosmosCtx.translate(gx, gy);
        cosmosCtx.rotate(g.rot);
        cosmosCtx.globalAlpha = Math.min(0.7, 360 / g.z);

        // Cube body
        cosmosCtx.fillStyle = g.color;
        cosmosCtx.fillRect(-sz / 2, -sz / 2, sz, sz);

        // Gold Ribbon cross
        cosmosCtx.fillStyle = '#ffd166';
        cosmosCtx.fillRect(-sz * 0.12, -sz / 2, sz * 0.24, sz);
        cosmosCtx.fillRect(-sz / 2, -sz * 0.12, sz, sz * 0.24);

        // Bow top
        cosmosCtx.beginPath();
        cosmosCtx.arc(0, -sz * 0.55, sz * 0.18, 0, Math.PI * 2);
        cosmosCtx.fill();

        cosmosCtx.restore();
      }
    });

    // --- 4. Draw Stars & Sparkles ---
    particles3D.forEach(p => {
      p.z -= 0.65;
      p.rot += p.vRot;
      if (p.z <= 0) {
        p.z = cosmosCanvas.width;
        p.x = (Math.random() - 0.5) * cosmosCanvas.width * 2.2;
        p.y = (Math.random() - 0.5) * cosmosCanvas.height * 2.2;
      }
      const k = 280 / p.z;
      const px = p.x * k + cx + (state.mousePos.x * 0.04);
      const py = p.y * k + cy + (state.mousePos.y * 0.04);

      if (px >= 0 && px <= cosmosCanvas.width && py >= 0 && py <= cosmosCanvas.height) {
        const alpha = Math.min(1, (1 - p.z / cosmosCanvas.width) * 1.3);
        if (p.type === 'heart') {
          drawHeartParticle(cosmosCtx, px, py, p.size * k * 0.5, p.color, alpha);
        } else if (p.type === 'sparkle') {
          drawSparkleParticle(cosmosCtx, px, py, p.size * k * 0.4, p.color, alpha, p.rot);
        } else {
          cosmosCtx.beginPath();
          cosmosCtx.arc(px, py, p.size * k * 0.5, 0, Math.PI * 2);
          cosmosCtx.fillStyle = p.color;
          cosmosCtx.globalAlpha = Math.max(0, alpha);
          cosmosCtx.fill();
        }
      }
    });

    requestAnimationFrame(renderCosmos);
  }

  window.addEventListener('mousemove', (e) => {
    state.mousePos.x = e.clientX - window.innerWidth / 2;
    state.mousePos.y = e.clientY - window.innerHeight / 2;

    if (state.backgroundTheme === 'potter' && wandSparks.length < 40) {
      const colors = ['#ffd166', '#fde047', '#38bdf8', '#c084fc', '#ffffff'];
      for (let i = 0; i < 2; i++) {
        wandSparks.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 2.8,
          vy: (Math.random() - 0.5) * 2.8 - 0.6,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          size: Math.random() * 2.5 + 1.2
        });
      }
    }
  });

  // Interactive Wand Click Spellburst (Lumos Maxima / Stardust Burst)
  window.addEventListener('click', (e) => {
    if (state.backgroundTheme === 'potter') {
      if (!e.target.closest('input, textarea, select')) {
        castPotterSpellburst(e.clientX, e.clientY);
      }
    }
  });

  // Touch move support for wand sparks on mobile
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches.length > 0) {
      const t = e.touches[0];
      state.mousePos.x = t.clientX - window.innerWidth / 2;
      state.mousePos.y = t.clientY - window.innerHeight / 2;

      if (state.backgroundTheme === 'potter' && wandSparks.length < 35) {
        wandSparks.push({
          x: t.clientX,
          y: t.clientY,
          vx: (Math.random() - 0.5) * 2.4,
          vy: (Math.random() - 0.5) * 2.4 - 0.8,
          color: '#ffd166',
          alpha: 1,
          size: Math.random() * 3 + 1.5
        });
      }
    }
  }, { passive: true });

  // --- Confetti Cannon System ---
  const confettiCanvas = document.getElementById('confetti-canvas');
  const confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
  let confettiItems = [];
  let confettiActive = false;

  function resizeCanvases() {
    const pCanvas = document.getElementById('potter-canvas');
    if (pCanvas) {
      pCanvas.width = window.innerWidth;
      pCanvas.height = window.innerHeight;
    }
    if (confettiCanvas) {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    }
    if (isThreeInitialized && threeRenderer && threeCamera) {
      threeCamera.aspect = window.innerWidth / window.innerHeight;
      threeCamera.updateProjectionMatrix();
      threeRenderer.setSize(window.innerWidth, window.innerHeight);
    } else {
      initCosmos();
    }
  }
  window.addEventListener('resize', resizeCanvases);
  resizeCanvases();

  class ConfettiPiece {
    constructor(startX, startY) {
      this.x = startX !== undefined ? startX : Math.random() * confettiCanvas.width;
      this.y = startY !== undefined ? startY : -15;
      this.w = Math.random() * 10 + 6;
      this.h = Math.random() * 6 + 4;
      this.vx = (Math.random() - 0.5) * 8;
      this.vy = startY !== undefined ? -(Math.random() * 8 + 4) : (Math.random() * 4 + 2);
      this.gravity = 0.22;
      this.rotation = Math.random() * 360;
      this.vRot = (Math.random() - 0.5) * 12;
      const palette = ['#ffd166', '#ff3385', '#8338ec', '#06d6a0', '#3a86ff', '#fb5607', '#ffffff'];
      this.color = palette[Math.floor(Math.random() * palette.length)];
      this.opacity = 1;
      this.decay = Math.random() * 0.006 + 0.003;
    }
    update() {
      this.x += this.vx;
      this.vy += this.gravity;
      this.y += this.vy;
      this.rotation += this.vRot;
      this.opacity -= this.decay;
    }
    draw() {
      if (!confettiCtx) return;
      confettiCtx.save();
      confettiCtx.translate(this.x, this.y);
      confettiCtx.rotate((this.rotation * Math.PI) / 180);
      confettiCtx.globalAlpha = Math.max(0, this.opacity);
      confettiCtx.fillStyle = this.color;
      confettiCtx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
      confettiCtx.restore();
    }
  }

  function launchConfetti(count = 120, x, y) {
    if (!confettiCanvas) return;
    for (let i = 0; i < count; i++) {
      confettiItems.push(new ConfettiPiece(x, y));
    }
    if (!confettiActive) {
      confettiActive = true;
      requestAnimationFrame(loopConfetti);
    }
  }

  function loopConfetti() {
    if (!confettiCtx) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiItems = confettiItems.filter(p => p.opacity > 0 && p.y < confettiCanvas.height + 60);
    confettiItems.forEach(p => { p.update(); p.draw(); });
    if (confettiItems.length > 0) {
      requestAnimationFrame(loopConfetti);
    } else {
      confettiActive = false;
    }
  }

  // --- Realistic Balloon Rupture Explosion Physics ---
  function burstFoilBalloon(balloon, clientX, clientY) {
    if (balloon.classList.contains('balloon-popped')) return;

    playPopSound();

    const rect = balloon.getBoundingClientRect();
    const cx = clientX !== undefined ? clientX : (rect.left + rect.width / 2);
    const cy = clientY !== undefined ? clientY : (rect.top + rect.height / 2);

    // 1. Shockwave blast ring
    const ring = document.createElement('div');
    ring.className = 'balloon-shockwave';
    ring.style.left = `${cx}px`;
    ring.style.top = `${cy}px`;
    ring.style.width = `${rect.width}px`;
    ring.style.height = `${rect.height}px`;
    document.body.appendChild(ring);
    setTimeout(() => ring.remove(), 520);

    // 2. 14 torn rubber fragments radiating outwards with velocity & gravity
    const bg = window.getComputedStyle(balloon).background;
    const numShards = 14;
    for (let i = 0; i < numShards; i++) {
      const shard = document.createElement('div');
      shard.className = 'rubber-shard';
      const angle = (i / numShards) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
      const dist = 75 + Math.random() * 95;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist + (35 + Math.random() * 45); // gravity drop
      const rot = (Math.random() - 0.5) * 480;
      const w = 12 + Math.random() * 16;
      const h = 8 + Math.random() * 12;

      shard.style.setProperty('--tx', `${tx}px`);
      shard.style.setProperty('--ty', `${ty}px`);
      shard.style.setProperty('--rot', `${rot}deg`);
      shard.style.left = `${cx - w / 2}px`;
      shard.style.top = `${cy - h / 2}px`;
      shard.style.width = `${w}px`;
      shard.style.height = `${h}px`;
      if (bg) shard.style.background = bg;
      shard.style.borderRadius = `${30 + Math.random() * 50}% ${20 + Math.random() * 60}% ${40 + Math.random() * 40}% ${20 + Math.random() * 60}%`;
      shard.style.boxShadow = `0 3px 8px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.7)`;

      document.body.appendChild(shard);
      setTimeout(() => shard.remove(), 700);
    }

    // 3. Erupting confetti & sparkles directly from puncture point
    launchConfetti(45, cx, cy);

    // 4. Hide balloon instantly
    balloon.classList.add('balloon-popped');
    balloon.classList.remove('balloon-inflating');

    // 5. Re-inflate after 3.2 seconds with smooth puff
    setTimeout(() => {
      balloon.classList.remove('balloon-popped');
      balloon.classList.add('balloon-inflating');
      playTone(440, 'sine', 0.1, 0.1);
      setTimeout(() => {
        balloon.classList.remove('balloon-inflating');
      }, 820);
    }, 3200);
  }

  // --- Dynamic Balloons Builder ---
  function buildBalloons() {
    const rack = document.getElementById('balloons-constellation');
    if (!rack) return;
    rack.innerHTML = '';

    const letters = (state.name.trim().toUpperCase() || 'HBD').split('');
    letters.forEach((char, idx) => {
      if (char === ' ') {
        const space = document.createElement('div');
        space.style.width = '24px';
        rack.appendChild(space);
        return;
      }

      const balloon = document.createElement('div');
      balloon.className = `foil-balloon balloon-foil-${idx % 7}`;
      balloon.style.animationDelay = `${(idx * 0.2).toFixed(2)}s`;
      balloon.textContent = char;
      balloon.title = `📍 Needle Pin ready! Click to pop "${char}"!`;

      const tail = document.createElement('div');
      tail.className = 'balloon-tail';
      balloon.appendChild(tail);

      const string = document.createElement('div');
      string.className = 'silk-string';
      balloon.appendChild(string);

      balloon.addEventListener('click', (e) => {
        burstFoilBalloon(balloon, e.clientX, e.clientY);
      });

      rack.appendChild(balloon);
    });
  }

  // --- Update Text & Milestones ---
  function updatePresentationText() {
    const nameHero = document.getElementById('monumental-name');
    const milestoneStrip = document.getElementById('milestone-strip');

    if (nameHero) {
      nameHero.textContent = state.name;
    }

    if (milestoneStrip) {
      milestoneStrip.innerHTML = '';

      if (state.birthDate) {
        const birth = new Date(state.birthDate);
        if (!isNaN(birth.getTime())) {
          const today = new Date();
          let age = today.getFullYear() - birth.getFullYear();
          const m = today.getMonth() - birth.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

          if (age > 0) {
            const agePill = document.createElement('div');
            agePill.className = 'milestone-pill gold';
            agePill.innerHTML = `🎂 Celebrating ${age} Beautiful Years`;
            milestoneStrip.appendChild(agePill);
          }

          const zodiac = getAstrologyInfo(birth.getDate(), birth.getMonth() + 1);
          if (zodiac) {
            const zodiacPill = document.createElement('div');
            zodiacPill.className = 'milestone-pill';
            zodiacPill.innerHTML = `⭐ ${zodiac.sign} • ${zodiac.quote}`;
            milestoneStrip.appendChild(zodiacPill);
          }
        }
      }

      const warmPill = document.createElement('div');
      warmPill.className = 'milestone-pill';
      warmPill.innerHTML = `✨ Today is all about celebrating you!`;
      milestoneStrip.appendChild(warmPill);
    }
  }

  // --- Story Lines Provider ---
  function getActiveStory() {
    if (state.useCustomMessage && state.customMessage.trim().length > 0) {
      const customLines = state.customMessage
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);
      if (customLines.length > 0) return customLines;
    }
    // Default: The beloved classic poem from the repository!
    return DEFAULT_STORY_MESSAGES.map(line => line.replace('{NAME}', state.name));
  }

  function showStoryLine(index) {
    const lines = getActiveStory();
    if (index >= lines.length) index = 0;
    if (index < 0) index = lines.length - 1;
    state.storyIndex = index;

    const proseBox = document.getElementById('story-kinetic-prose');
    const counterEl = document.getElementById('story-line-counter');

    if (proseBox) {
      proseBox.style.opacity = '0';
      proseBox.style.transform = 'translateY(8px)';
      setTimeout(() => {
        proseBox.innerHTML = lines[index];
        proseBox.style.opacity = '1';
        proseBox.style.transform = 'translateY(0)';
      }, 200);
    }

    if (counterEl) {
      counterEl.textContent = `Message ${index + 1} of ${lines.length}`;
    }

    if (index === lines.length - 1) {
      launchConfetti(80);
      playCheerFanfare();
    }
  }

  // --- Story Cinema Auto-Advancing Messages ---
  let storyAutoTimer = null;
  let isStoryAutoPlaying = true;

  function startStoryAutoAdvance() {
    stopStoryAutoAdvance();
    isStoryAutoPlaying = true;
    updateAutoPlayButtonState();
    storyAutoTimer = setInterval(() => {
      const lines = getActiveStory();
      if (state.storyIndex >= lines.length - 1) {
        stopStoryAutoAdvance();
        launchConfetti(160);
        playCheerFanfare();
        showToast(`🎉 Happy Birthday, ${state.name}! The celebration continues! 💖`);
        return;
      }
      showStoryLine(state.storyIndex + 1);
    }, 3200);
  }

  function stopStoryAutoAdvance() {
    if (storyAutoTimer) {
      clearInterval(storyAutoTimer);
      storyAutoTimer = null;
    }
    isStoryAutoPlaying = false;
    updateAutoPlayButtonState();
  }

  function toggleStoryAutoAdvance() {
    if (isStoryAutoPlaying) {
      stopStoryAutoAdvance();
      showToast('⏸️ Story auto-play paused');
    } else {
      startStoryAutoAdvance();
      showToast('▶️ Resuming story auto-play');
    }
  }

  function updateAutoPlayButtonState() {
    const btn = document.getElementById('btn-story-autoplay');
    if (!btn) return;
    if (isStoryAutoPlaying) {
      btn.innerHTML = '⏸️ Auto-Playing';
      btn.classList.add('btn-gold');
      btn.classList.remove('btn-glass');
    } else {
      btn.innerHTML = '▶️ Resume Auto-Play';
      btn.classList.add('btn-glass');
      btn.classList.remove('btn-gold');
    }
  }

  // --- Stage Transition Controller ---
  function goToStage(stageNum) {
    if (stageNum < 1) stageNum = 1;
    if (stageNum > 5) stageNum = 5;
    state.currentStage = stageNum;

    // Toggle active scene
    document.querySelectorAll('.stage-scene').forEach(sc => sc.classList.remove('scene-active'));
    const targetScene = document.getElementById(`stage-scene-${stageNum}`);
    if (targetScene) targetScene.classList.add('scene-active');

    // Update Top Breadcrumb Stepper
    document.querySelectorAll('.step-indicator').forEach(ind => {
      const step = parseInt(ind.getAttribute('data-step'), 10);
      ind.classList.remove('active', 'completed');
      if (step === stageNum) ind.classList.add('active');
      else if (step < stageNum) ind.classList.add('completed');
    });

    // Specific Stage Actions
    if (stageNum === 1) {
      const lightsContainer = document.getElementById('lights-system-container');
      if (lightsContainer) lightsContainer.classList.add('lights-glow-on');
      resetAllGifts();
      stopStoryAutoAdvance();
    } else if (stageNum === 2) {
      buildBalloons();
      launchConfetti(40);
      stopStoryAutoAdvance();
    } else if (stageNum === 3) {
      playTone(659.25, 'triangle', 0.4);
      stopStoryAutoAdvance();
    } else if (stageNum === 4) {
      playTone(783.99, 'sine', 0.4);
      stopStoryAutoAdvance();
    } else if (stageNum === 5) {
      showStoryLine(state.storyIndex);
      startStoryAutoAdvance();
    }

    // Smooth scroll into stage
    const stageView = document.getElementById('stage-viewport');
    if (stageView) stageView.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // --- Toast Notification ---
  function showToast(msg) {
    const toast = document.getElementById('cosmic-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('toast-active');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('toast-active');
    }, 3200);
  }

  // --- Real-Time Microphone Blow Detection ---
  let micStream = null;
  let micAnalyser = null;
  let isListeningMic = false;
  let blowFrameCount = 0;

  async function startMicBlowDetection() {
    if (state.isCandleBlown) return;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast('Microphone not supported on this browser/device');
        return;
      }
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const ctx = getAudioCtx();
      if (!ctx) return;
      const source = ctx.createMediaStreamSource(micStream);
      micAnalyser = ctx.createAnalyser();
      micAnalyser.fftSize = 256;
      source.connect(micAnalyser);
      isListeningMic = true;

      const micPill = document.getElementById('mic-status-pill');
      if (micPill) {
        micPill.classList.add('listening');
        micPill.innerHTML = `<span>🎤 Listening... Blow gently into your mic!</span> <span class="mic-level-meter"><span class="mic-level-fill" id="mic-level-fill"></span></span>`;
      }
      showToast('🎤 Mic active! Blow into your microphone to blow out the flame!');
      pollMicLevels();
    } catch (err) {
      console.warn('Microphone permission or error:', err);
      showToast('Microphone not enabled. You can still click or tap to blow the candle!');
    }
  }

  function pollMicLevels() {
    if (!isListeningMic || state.isCandleBlown || !micAnalyser) return;
    const data = new Uint8Array(micAnalyser.frequencyBinCount);
    micAnalyser.getByteFrequencyData(data);

    // Low frequencies (50-250Hz) represent turbulent breath wind noise
    let lowEnergy = 0;
    const sampleBins = 14;
    for (let i = 0; i < sampleBins; i++) {
      lowEnergy += data[i];
    }
    const avgLow = lowEnergy / sampleBins;

    // Update fill meter
    const fillEl = document.getElementById('mic-level-fill');
    if (fillEl) {
      const pct = Math.min(100, Math.round((avgLow / 90) * 100));
      fillEl.style.width = pct + '%';
    }

    if (avgLow > 55) {
      blowFrameCount++;
      if (blowFrameCount >= 3) {
        blowCandle();
        stopMicBlowDetection();
        return;
      }
    } else {
      blowFrameCount = Math.max(0, blowFrameCount - 1);
    }

    requestAnimationFrame(pollMicLevels);
  }

  function stopMicBlowDetection() {
    isListeningMic = false;
    if (micStream) {
      micStream.getTracks().forEach(track => track.stop());
      micStream = null;
    }
    const micPill = document.getElementById('mic-status-pill');
    if (micPill) {
      micPill.classList.remove('listening');
      micPill.innerHTML = `<span>✨ Candle blown! Wishes on their way!</span>`;
    }
  }

  // --- Candle Blow Action ---
  function blowCandle() {
    const flame = document.getElementById('candle-flame-real');
    const smoke = document.getElementById('realistic-smoke');
    if (flame) flame.classList.add('flame-extinguished');
    if (smoke) {
      smoke.classList.add('rising-smoke');
      setTimeout(() => smoke.classList.remove('rising-smoke'), 2200);
    }
    state.isCandleBlown = true;
    stopMicBlowDetection();
    playTone(300, 'sine', 0.3);
    setTimeout(playCheerFanfare, 200);
    launchConfetti(180);
    showToast(`🌟 Flame blown! May your dreams come true, ${state.name}!`);
  }

  // --- Gift Box Open Actions (3 Distinct 3D Surprise Boxes) ---
  function openSingleGift(boxNum) {
    const box = document.getElementById(`gift-box-${boxNum}`);
    const card = document.getElementById(`gift-pop-card-${boxNum}`);
    if (box) box.classList.add('box-unwrapped');
    if (card) card.classList.add('revealed');

    if (boxNum === 1) {
      playTone(523.25, 'triangle', 0.35, 0.3);
      setTimeout(() => playTone(659.25, 'sine', 0.3, 0.25), 120);
      launchConfetti(45);
      showToast('🦁 Gryffindor House Box opened! Pure courage & boundless joy to you!');
    } else if (boxNum === 2) {
      playCheerFanfare();
      launchConfetti(65);
      showToast('🐍 Slytherin House Box opened! Cherishing our legendary memories ❤️');
    } else if (boxNum === 3) {
      playTone(783.99, 'triangle', 0.35, 0.3);
      setTimeout(() => playTone(1046.50, 'sine', 0.4, 0.3), 150);
      launchConfetti(55);
      showToast('🦡 Hufflepuff House Box unlocked! May loyalty & golden wishes guide you! 🌟');
    }
  }

  function openAllGifts() {
    [1, 2, 3].forEach((num, idx) => {
      setTimeout(() => {
        openSingleGift(num);
      }, idx * 280);
    });
    setTimeout(() => {
      launchConfetti(120);
      showToast('🎁 All surprise gifts unwrapped! Wishing you the best year ahead!');
    }, 950);
  }

  function resetAllGifts() {
    [1, 2, 3].forEach(num => {
      const box = document.getElementById(`gift-box-${num}`);
      const card = document.getElementById(`gift-pop-card-${num}`);
      if (box) box.classList.remove('box-unwrapped');
      if (card) card.classList.remove('revealed');
    });
  }

  function openGiftBox() {
    openAllGifts();
  }

  // --- 3D Stacked Polaroid Deck (3 to 5 Photos) ---
  let isFlickingCard = false;

  function renderPolaroidDeck() {
    const deck = document.getElementById('polaroid-deck');
    const hint = document.getElementById('polaroid-stack-hint');
    if (!deck) return;
    deck.innerHTML = '';

    const total = state.photos.length;
    state.photos.forEach((photo, idx) => {
      const card = document.createElement('div');
      card.className = `polaroid-card stack-pos-${idx}`;
      card.dataset.index = idx;

      const imgBox = document.createElement('div');
      imgBox.className = 'polaroid-img-box';
      const img = document.createElement('img');
      img.className = 'polaroid-photo';
      img.src = photo.src;
      img.alt = `Birthday Memory ${idx + 1}`;
      img.loading = 'lazy';
      imgBox.appendChild(img);

      const cap = document.createElement('div');
      cap.className = 'polaroid-caption';
      cap.textContent = photo.caption || state.photoCaption;

      card.appendChild(imgBox);
      card.appendChild(cap);
      deck.appendChild(card);
    });

    if (hint) {
      hint.textContent = `📸 Photo ${state.activePhotoIndex + 1} of ${total} • Click to flip!`;
    }
  }

  function flipNextPolaroid() {
    if (isFlickingCard || state.photos.length <= 1) return;
    const deck = document.getElementById('polaroid-deck');
    if (!deck) return;
    const topCard = deck.querySelector('.stack-pos-0');
    if (!topCard) return;

    isFlickingCard = true;
    playCameraShutterSound();
    launchConfetti(25);

    topCard.classList.add('card-flicking');

    setTimeout(() => {
      // Rotate photos array: move top card to end of deck
      const firstPhoto = state.photos.shift();
      state.photos.push(firstPhoto);
      state.activePhotoIndex = (state.activePhotoIndex + 1) % state.photos.length;

      renderPolaroidDeck();
      isFlickingCard = false;
    }, 450);
  }

  // --- Setup Modal & 24-Hour Link Generator ---
  function setupModal() {
    const modal = document.getElementById('glass-creator-modal');
    const openBtn = document.getElementById('btn-header-personalize');
    const closeBtn = document.getElementById('modal-close-btn');
    const cancelBtn = document.getElementById('btn-modal-cancel');
    const saveBtn = document.getElementById('btn-modal-save');
    const previewBtn = document.getElementById('btn-modal-preview');
    const copyBtn = document.getElementById('btn-modal-copy-link');
    const waBtn = document.getElementById('btn-modal-whatsapp');

    const nameIn = document.getElementById('modal-input-name');
    const dateIn = document.getElementById('modal-input-date');
    const msgIn = document.getElementById('modal-input-msg');
    const captionIn = document.getElementById('modal-input-caption');
    const thumbsRow = document.getElementById('preset-thumbs-row');
    const photoUpload = document.getElementById('modal-photo-upload');
    const resetPhotosBtn = document.getElementById('btn-reset-preset-photos');

    const counterName = document.getElementById('counter-name');
    const counterCaption = document.getElementById('counter-caption');
    const counterMsg = document.getElementById('counter-msg');

    // Security: Recipient View-Only Mode Locking
    if (state.isViewOnly && openBtn) {
      openBtn.innerHTML = `<span>🔒 Gift for ${escapeHTML(state.name)}</span>`;
      openBtn.title = 'This celebration was created for you (Read-Only Mode)';
      openBtn.classList.remove('btn-primary');
      openBtn.classList.add('btn-glass');
      openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showToast(`🔒 This celebration is locked in read-only mode for ${escapeHTML(state.name)}!`);
      });
      return; // Do not bind modal open events for recipients
    }

    const hintName = document.getElementById('hint-name-limit');
    const hintMsg = document.getElementById('hint-msg-limit');

    // Real-Time Word & Character Counter Updates
    function updateCounters() {
      if (nameIn && counterName) {
        const words = countWords(nameIn.value);
        const chars = nameIn.value.length;
        counterName.textContent = `${words}/4 words • ${chars}/30 chars`;
        counterName.classList.toggle('limit-near', words === 3 || chars >= 24);
        counterName.classList.toggle('limit-reached', words >= 4 || chars >= 30);
        if (hintName) {
          if (words >= 4) {
            hintName.textContent = `🛑 Maximum Word Limit Reached: 4/4 words (30 chars max)`;
            hintName.classList.add('warn');
          } else {
            const wordsLeft = 4 - words;
            hintName.textContent = `⚡ Live Word Limit: ${wordsLeft} word${wordsLeft === 1 ? '' : 's'} remaining (max 4 words)`;
            hintName.classList.remove('warn');
          }
        }
      }
      if (captionIn && counterCaption) {
        const chars = captionIn.value.length;
        counterCaption.textContent = `${chars}/50 chars`;
        counterCaption.classList.toggle('limit-near', chars >= 40);
        counterCaption.classList.toggle('limit-reached', chars >= 50);
      }
      if (msgIn && counterMsg) {
        const words = countWords(msgIn.value);
        const chars = msgIn.value.length;
        counterMsg.textContent = `${words}/50 words • ${chars}/350 chars`;
        counterMsg.classList.toggle('limit-near', words >= 42 || chars >= 300);
        counterMsg.classList.toggle('limit-reached', words >= 50 || chars >= 350);
        if (hintMsg) {
          if (words >= 50) {
            hintMsg.textContent = `🛑 Maximum Word Limit Reached: 50/50 words (350 chars max)`;
            hintMsg.classList.add('warn');
          } else {
            const wordsLeft = 50 - words;
            hintMsg.textContent = `⚡ Live Word Limit: ${wordsLeft} word${wordsLeft === 1 ? '' : 's'} remaining (max 50 words)`;
            hintMsg.classList.remove('warn');
          }
        }
      }
    }

    if (nameIn) {
      nameIn.addEventListener('input', () => {
        // Enforce max 4 words
        const words = nameIn.value.trim().split(/\s+/);
        if (words.length > 4) {
          nameIn.value = words.slice(0, 4).join(' ');
          showToast('⚠️ Maximum 4 words allowed for birthday name!');
        }
        updateCounters();
      });
    }

    if (captionIn) {
      captionIn.addEventListener('input', updateCounters);
    }

    if (msgIn) {
      msgIn.addEventListener('input', () => {
        // Enforce max 50 words
        const words = msgIn.value.trim().split(/\s+/);
        if (words.length > 50) {
          msgIn.value = words.slice(0, 50).join(' ');
          showToast('⚠️ Maximum 50 words allowed for custom message!');
        }
        updateCounters();
      });
    }

    function renderPresetThumbs() {
      if (!thumbsRow) return;
      thumbsRow.innerHTML = '';
      PRESET_MEMORIES.forEach(preset => {
        const isSelected = state.photos.some(p => p.id === preset.id);
        const chip = document.createElement('div');
        chip.className = `preset-thumb-chip ${isSelected ? 'selected' : ''}`;
        chip.title = `${preset.title} (Click to toggle)`;

        const img = document.createElement('img');
        img.src = preset.src;
        img.alt = preset.title;
        chip.appendChild(img);

        if (isSelected) {
          const check = document.createElement('div');
          check.className = 'chip-check';
          check.textContent = '✓';
          chip.appendChild(check);
        }

        chip.addEventListener('click', () => {
          const currentlySelected = state.photos.some(p => p.id === preset.id);
          if (currentlySelected) {
            if (state.photos.length <= 3) {
              showToast('⚠️ Please keep at least 3 photos in your 3D stack!');
              return;
            }
            state.photos = state.photos.filter(p => p.id !== preset.id);
          } else {
            if (state.photos.length >= 5) {
              showToast('⚠️ Maximum 5 photos allowed in the 3D stack!');
              return;
            }
            state.photos.push({
              id: preset.id,
              src: preset.src,
              caption: (captionIn ? captionIn.value.trim() : state.photoCaption) || preset.defaultCaption
            });
          }
          state.activePhotoIndex = 0;
          renderPresetThumbs();
          renderPolaroidDeck();
        });

        thumbsRow.appendChild(chip);
      });
    }

    // Security: Secure photo upload with MIME whitelist & size checking
    if (photoUpload) {
      photoUpload.addEventListener('change', (e) => {
        const rawFiles = Array.from(e.target.files);
        if (rawFiles.length === 0) return;

        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        const validFiles = [];

        for (const file of rawFiles) {
          if (!allowedMimes.includes(file.type)) {
            showToast(`🛡️ Security Warning: "${escapeHTML(file.name)}" rejected! Only safe JPG, PNG, WEBP, and GIF images are permitted.`);
            continue;
          }
          if (file.size > 5 * 1024 * 1024) {
            showToast(`⚠️ File too large: "${escapeHTML(file.name)}" exceeds 5 MB limit.`);
            continue;
          }
          validFiles.push(file);
        }

        const filesToLoad = validFiles.slice(0, 5);
        if (filesToLoad.length === 0) {
          photoUpload.value = '';
          return;
        }

        const customPhotos = [];
        let loaded = 0;
        filesToLoad.forEach((file, idx) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            customPhotos.push({
              id: 100 + idx,
              src: ev.target.result,
              caption: captionIn ? sanitizeText(captionIn.value.trim(), 50) : state.photoCaption
            });
            loaded++;
            if (loaded === filesToLoad.length) {
              state.photos = customPhotos;
              state.activePhotoIndex = 0;
              renderPresetThumbs();
              renderPolaroidDeck();
              showToast(`📸 Loaded ${customPhotos.length} safe memory photo${customPhotos.length > 1 ? 's' : ''}!`);
            }
          };
          reader.readAsDataURL(file);
        });
        photoUpload.value = '';
      });
    }

    if (resetPhotosBtn) {
      resetPhotosBtn.addEventListener('click', () => {
        state.photos = [
          { id: 1, src: 'bd1.jpg', caption: state.photoCaption },
          { id: 2, src: 'bd2.jpg', caption: state.photoCaption },
          { id: 3, src: 'bd3.jpg', caption: state.photoCaption },
          { id: 4, src: 'bd4.jpg', caption: state.photoCaption }
        ];
        state.activePhotoIndex = 0;
        renderPresetThumbs();
        renderPolaroidDeck();
        showToast('↺ Reset to 4 default celebration memories!');
      });
    }

    function populateModal() {
      if (nameIn) nameIn.value = (state.name === 'Friend' ? '' : state.name);
      if (dateIn) dateIn.value = state.birthDate;
      if (msgIn) msgIn.value = state.customMessage;
      if (captionIn) captionIn.value = state.photoCaption;
      updateCounters();
      renderPresetThumbs();

      // Sync active theme state in modal
      const isPotter = (state.backgroundTheme === 'potter');
      const cardP = document.getElementById('theme-card-potter');
      const cardF = document.getElementById('theme-card-festive');
      if (cardP) {
        cardP.classList.toggle('active', isPotter);
        const rP = cardP.querySelector('input[type="radio"]');
        if (rP) rP.checked = isPotter;
      }
      if (cardF) {
        cardF.classList.toggle('active', !isPotter);
        const rF = cardF.querySelector('input[type="radio"]');
        if (rF) rF.checked = !isPotter;
      }
    }

    // Modal theme card click listeners
    const modalThemeCardPotter = document.getElementById('theme-card-potter');
    const modalThemeCardFestive = document.getElementById('theme-card-festive');
    if (modalThemeCardPotter) {
      modalThemeCardPotter.addEventListener('click', () => {
        switchBackgroundTheme('potter', false);
      });
    }
    if (modalThemeCardFestive) {
      modalThemeCardFestive.addEventListener('click', () => {
        switchBackgroundTheme('festive', false);
      });
    }

    function saveModalData() {
      const rawName = nameIn ? nameIn.value.trim() : '';
      state.name = limitWords(sanitizeText(rawName, 30), 4) || 'Friend';
      state.birthDate = dateIn ? sanitizeText(dateIn.value, 12) : '';
      const rawMsg = msgIn ? msgIn.value.trim() : '';
      state.customMessage = limitWords(sanitizeText(rawMsg, 350), 50);
      state.useCustomMessage = state.customMessage.length > 0;
      if (captionIn) {
        state.photoCaption = sanitizeText(captionIn.value.trim(), 50) || 'Best moments with you ❤️';
        state.photos.forEach(p => p.caption = state.photoCaption);
      }

      const selectedRadio = document.querySelector('input[name="modal-bg-theme"]:checked');
      if (selectedRadio) {
        switchBackgroundTheme(selectedRadio.value, false);
      }

      updatePresentationText();
      buildBalloons();
      renderPolaroidDeck();
      showStoryLine(0);
    }

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        populateModal();
        if (modal) {
          modal.classList.add('overlay-open');
          const scrollBody = modal.querySelector('.modal-body-scroll');
          if (scrollBody) scrollBody.scrollTop = 0;
        }
      });
    }

    function hideModal() {
      if (modal) modal.classList.remove('overlay-open');
    }

    if (closeBtn) closeBtn.addEventListener('click', hideModal);
    if (cancelBtn) cancelBtn.addEventListener('click', hideModal);

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        saveModalData();
        hideModal();
        showToast(`💾 Saved! Celebration updated for ${escapeHTML(state.name)}! 🎉`);
      });
    }

    if (previewBtn) {
      previewBtn.addEventListener('click', () => {
        saveModalData();
        hideModal();
        goToStage(1);
        showToast(`✨ Previewing celebration for ${escapeHTML(state.name)}!`);
      });
    }

    function build24hShareURL() {
      const url = new URL(window.location.origin + window.location.pathname);
      const curName = nameIn ? (limitWords(sanitizeText(nameIn.value.trim(), 30), 4) || state.name) : state.name;
      url.searchParams.set('name', curName);

      const curDate = dateIn ? sanitizeText(dateIn.value, 12) : state.birthDate;
      if (curDate) url.searchParams.set('date', curDate);

      const curMsg = msgIn ? limitWords(sanitizeText(msgIn.value.trim(), 350), 50) : state.customMessage;
      if (curMsg) url.searchParams.set('msg', curMsg);

      // Preserve photos if using preset IDs
      const presetIds = state.photos.map(p => p.id).filter(id => id && id <= 5);
      if (presetIds.length >= 2) {
        url.searchParams.set('p', presetIds.join(','));
      }

      const curCap = captionIn ? sanitizeText(captionIn.value.trim(), 50) : state.photoCaption;
      if (curCap && curCap !== 'Best moments with you ❤️') {
        url.searchParams.set('cap', curCap);
      }

      // STRICT 24-HOUR EXPIRATION TIMESTAMP
      const expTime = Date.now() + 24 * 60 * 60 * 1000;
      url.searchParams.set('exp', expTime.toString());

      // ANTI-TAMPER DIGITAL CHECKSUM
      const sig = generateSecurityHash(curName, expTime.toString());
      url.searchParams.set('sig', sig);

      // RECIPIENT VIEW-ONLY LOCKED MODE (prevents editing by receiver)
      url.searchParams.set('preview', '1');

      // Theme preference persistence
      url.searchParams.set('theme', state.backgroundTheme || 'potter');

      return url.toString();
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const link = build24hShareURL();
        navigator.clipboard.writeText(link).then(() => {
          showToast('⏳ 24-Hour Birthday Link copied! Valid for 24h & locked from editing.');
        }).catch(() => {
          prompt('Copy your 24-hour celebration link:', link);
        });
      });
    }

    if (waBtn) {
      waBtn.addEventListener('click', () => {
        const link = build24hShareURL();
        const curName = nameIn ? (limitWords(sanitizeText(nameIn.value.trim(), 30), 4) || state.name) : state.name;
        const text = encodeURIComponent(`🎉 A magical Happy Birthday celebration created for ${curName}! ✨ Open your surprise (locked preview • valid for 24 hours): ${link}`);
        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
      });
    }

    // Header Quick Share (also generates fresh 24h link)
    const headerShare = document.getElementById('btn-header-share');
    if (headerShare) {
      headerShare.addEventListener('click', () => {
        const link = build24hShareURL();
        navigator.clipboard.writeText(link).then(() => {
          showToast('⏳ 24-Hour Birthday Link copied to clipboard!');
        }).catch(() => {
          prompt('Copy this 24-hour link:', link);
        });
      });
    }
  }

  // --- DOM Ready Initializer ---
  document.addEventListener('DOMContentLoaded', () => {
    parseParameters();

    // 1. Initialize Harry Potter World Canvas Engine
    initPotterCosmos();
    renderPotterCosmos();

    // 2. Initialize Festive 3D Birthday WebGL Scene (with automatic 2D fallback)
    if (!initThreeCosmos()) {
      initCosmos();
      renderCosmos();
    } else {
      renderThreeCosmos();
    }

    // 3. Strictly activate chosen theme (potter by default)
    switchBackgroundTheme(state.backgroundTheme || 'potter', false);
    window.scrollTo(0, 0);

    updatePresentationText();
    buildBalloons();
    renderPolaroidDeck();
    setupModal();
    resetAllGifts(); // Ensure all boxes start completely closed

    // Header 3D Background Theme Switcher
    const headerThemeToggle = document.getElementById('btn-theme-toggle');
    if (headerThemeToggle) {
      headerThemeToggle.addEventListener('click', () => {
        getAudioCtx();
        const nextTheme = (state.backgroundTheme === 'potter') ? 'festive' : 'potter';
        switchBackgroundTheme(nextTheme, true);
      });
    }

    // Check 24-Hour Expiration
    if (state.is24hExpired) {
      const expiredOverlay = document.getElementById('expired-link-overlay');
      if (expiredOverlay) expiredOverlay.classList.add('overlay-open');
    }

    const unlockReplayBtn = document.getElementById('btn-unlock-replay');
    const createFreshBtn = document.getElementById('btn-create-fresh');
    if (unlockReplayBtn) {
      unlockReplayBtn.addEventListener('click', () => {
        const expiredOverlay = document.getElementById('expired-link-overlay');
        if (expiredOverlay) expiredOverlay.classList.remove('overlay-open');
        showToast('✨ Replay unlocked! Enjoy the celebration!');
      });
    }
    if (createFreshBtn) {
      createFreshBtn.addEventListener('click', () => {
        const expiredOverlay = document.getElementById('expired-link-overlay');
        if (expiredOverlay) expiredOverlay.classList.remove('overlay-open');
        try {
          window.history.replaceState({}, '', window.location.pathname);
        } catch(e) {}
        state.name = 'Friend';
        state.customMessage = '';
        state.useCustomMessage = false;
        state.isViewOnly = false;
        state.is24hExpired = false;
        updatePresentationText();
        buildBalloons();
        showStoryLine(0);
        const modal = document.getElementById('glass-creator-modal');
        if (modal) modal.classList.add('overlay-open');
      });
    }

    // Polaroid Stack Click Flip
    const polaroidContainer = document.getElementById('polaroid-stack-container');
    if (polaroidContainer) {
      polaroidContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        flipNextPolaroid();
      });
    }

    // Breadcrumb Steppers Click
    document.querySelectorAll('.step-indicator').forEach(ind => {
      ind.addEventListener('click', () => {
        getAudioCtx();
        const step = parseInt(ind.getAttribute('data-step'), 10);
        goToStage(step);
      });
    });

    // Navigation Buttons between Stages (Hedwig Owl flies across screen to change stage!)
    document.querySelectorAll('[data-next-stage]').forEach(btn => {
      btn.addEventListener('click', () => {
        getAudioCtx();
        const target = parseInt(btn.getAttribute('data-next-stage'), 10);
        if (state.backgroundTheme === 'potter') {
          triggerHedwigNextTransition(target);
        } else {
          goToStage(target);
        }
      });
    });

    document.querySelectorAll('[data-prev-stage]').forEach(btn => {
      btn.addEventListener('click', () => {
        getAudioCtx();
        const target = parseInt(btn.getAttribute('data-prev-stage'), 10);
        goToStage(target);
      });
    });

    // Candle Actions
    const candleBlowBtn = document.getElementById('btn-blow-candle');
    const candleAssembly = document.getElementById('candle-assembly');
    const micPill = document.getElementById('mic-status-pill');
    const micBtn = document.getElementById('btn-enable-mic');
    if (candleBlowBtn) candleBlowBtn.addEventListener('click', blowCandle);
    if (candleAssembly) candleAssembly.addEventListener('click', blowCandle);
    if (micPill) micPill.addEventListener('click', startMicBlowDetection);
    if (micBtn) micBtn.addEventListener('click', startMicBlowDetection);

    // Gift Actions (3 Distinct 3D Boxes + Open All)
    const box1 = document.getElementById('gift-box-1');
    const box2 = document.getElementById('gift-box-2');
    const box3 = document.getElementById('gift-box-3');
    const openAllGiftsBtn = document.getElementById('btn-open-all-gifts');

    const item1 = document.getElementById('gift-item-1');
    const item2 = document.getElementById('gift-item-2');
    const item3 = document.getElementById('gift-item-3');
    if (item1) item1.addEventListener('click', (e) => { if (!e.target.closest('.gift-pop-card')) openSingleGift(1); });
    if (item2) item2.addEventListener('click', (e) => { if (!e.target.closest('.gift-pop-card')) openSingleGift(2); });
    if (item3) item3.addEventListener('click', (e) => { if (!e.target.closest('.gift-pop-card')) openSingleGift(3); });

    if (box1) box1.addEventListener('click', (e) => { e.stopPropagation(); openSingleGift(1); });
    if (box2) box2.addEventListener('click', (e) => { e.stopPropagation(); openSingleGift(2); });
    if (box3) box3.addEventListener('click', (e) => { e.stopPropagation(); openSingleGift(3); });
    if (openAllGiftsBtn) openAllGiftsBtn.addEventListener('click', openAllGifts);

    const resetAllGiftsBtn = document.getElementById('btn-reset-all-gifts');
    if (resetAllGiftsBtn) {
      resetAllGiftsBtn.addEventListener('click', () => {
        resetAllGifts();
        showToast('↺ All boxes closed! Click any gift box to open its surprise.');
      });
    }

    // Also clicking anywhere on the gift item cards or polaroid triggers sparkles
    const card1 = document.getElementById('gift-pop-card-1');
    const card3 = document.getElementById('gift-pop-card-3');
    if (card1) card1.addEventListener('click', () => { launchConfetti(35); playTone(523.25, 'triangle', 0.2); });
    if (card3) card3.addEventListener('click', () => { launchConfetti(35); playTone(783.99, 'triangle', 0.2); });

    // Legacy fallback
    const legacyGiftBox = document.getElementById('gift-3d-box');
    const legacyGiftOpenBtn = document.getElementById('btn-open-gift');
    if (legacyGiftBox) legacyGiftBox.addEventListener('click', openAllGifts);
    if (legacyGiftOpenBtn) legacyGiftOpenBtn.addEventListener('click', openAllGifts);

    // Story Auto-Play toggle button
    const autoPlayBtn = document.getElementById('btn-story-autoplay');
    if (autoPlayBtn) {
      autoPlayBtn.addEventListener('click', () => {
        getAudioCtx();
        toggleStoryAutoAdvance();
      });
    }

    // Story Navigation (Previous Line / Next Line)
    const storyNext = document.getElementById('story-nav-next');
    const storyPrev = document.getElementById('story-nav-prev');
    if (storyNext) {
      storyNext.addEventListener('click', () => {
        getAudioCtx();
        playTone(600, 'sine', 0.15, 0.15);
        showStoryLine(state.storyIndex + 1);
        if (isStoryAutoPlaying) startStoryAutoAdvance();
      });
    }
    if (storyPrev) {
      storyPrev.addEventListener('click', () => {
        getAudioCtx();
        playTone(500, 'sine', 0.15, 0.15);
        showStoryLine(state.storyIndex - 1);
        if (isStoryAutoPlaying) startStoryAutoAdvance();
      });
    }

    // Story Message Choice Toggle: Default vs Custom
    const btnChoiceDefault = document.getElementById('toggle-poem-default');
    const btnChoiceCustom = document.getElementById('toggle-poem-custom');
    if (btnChoiceDefault) {
      btnChoiceDefault.addEventListener('click', () => {
        state.useCustomMessage = false;
        btnChoiceDefault.classList.add('active');
        if (btnChoiceCustom) btnChoiceCustom.classList.remove('active');
        showStoryLine(0);
        if (isStoryAutoPlaying) startStoryAutoAdvance();
        showToast('✨ Reading the classic heartfelt poem dedicated to ' + state.name);
      });
    }
    if (btnChoiceCustom) {
      btnChoiceCustom.addEventListener('click', () => {
        state.useCustomMessage = true;
        btnChoiceCustom.classList.add('active');
        if (btnChoiceDefault) btnChoiceDefault.classList.remove('active');
        if (!state.customMessage) {
          const customPrompt = prompt('Enter your custom message (or press OK to customize via Personalize):', 'You are the most wonderful person in the world!');
          if (customPrompt) state.customMessage = customPrompt;
        }
        showStoryLine(0);
        if (isStoryAutoPlaying) startStoryAutoAdvance();
        showToast('✍️ Showing custom message');
      });
    }

    // Header Music Toggle & Music Source Selection
    const musicBtn = document.getElementById('btn-header-music');
    const musicLabel = document.getElementById('music-btn-label');
    const meter = document.getElementById('audio-visualizer-box');
    const musicDropdownPanel = document.getElementById('music-dropdown-panel');
    const musicDropdownArrow = document.getElementById('music-dropdown-arrow');
    const customSongUpload = document.getElementById('custom-song-upload');

    // Music sources
    const audioDefault = document.getElementById('birthday-song');
    const audioHP = document.getElementById('hp-birthday-song');
    const audioCustom = document.getElementById('custom-song');
    let activeAudio = audioDefault;
    let activeMusicSource = 'default'; // 'default', 'hp', 'custom'
    let musicDropdownOpen = false;
    let usingHedwigSynth = false;

    function stopAllAudio() {
      [audioDefault, audioHP, audioCustom].forEach(a => {
        if (a) { a.pause(); a.currentTime = 0; }
      });
      stopSynthHedwigTheme();
      usingHedwigSynth = false;
      state.isPlayingMusic = false;
      if (musicLabel) musicLabel.textContent = 'Play Music';
      if (meter) meter.classList.add('meter-paused');
    }

    function playActiveAudio() {
      if (activeMusicSource === 'hp' && usingHedwigSynth) {
        // Use synthesized Hedwig's Theme
        getAudioCtx();
        startSynthHedwigTheme();
        state.isPlayingMusic = true;
        if (musicLabel) musicLabel.textContent = 'Playing';
        if (meter) meter.classList.remove('meter-paused');
        return;
      }
      if (!activeAudio) return;
      activeAudio.play().then(() => {
        state.isPlayingMusic = true;
        if (musicLabel) musicLabel.textContent = 'Playing';
        if (meter) meter.classList.remove('meter-paused');
      }).catch(() => {
        // If HP audio fails (file missing), fall back to synth
        if (activeMusicSource === 'hp') {
          usingHedwigSynth = true;
          getAudioCtx();
          startSynthHedwigTheme();
          state.isPlayingMusic = true;
          if (musicLabel) musicLabel.textContent = 'Playing';
          if (meter) meter.classList.remove('meter-paused');
          showToast('⚡ Playing synthesized Hedwig\'s Theme!');
        } else {
          showToast('⚠️ Could not play audio. Try clicking again.');
        }
      });
    }

    function selectMusicSource(source) {
      const wasPlaying = state.isPlayingMusic;
      stopAllAudio();
      activeMusicSource = source;

      // Update active option styling
      document.querySelectorAll('.music-option').forEach(opt => opt.classList.remove('active'));

      if (source === 'default') {
        activeAudio = audioDefault;
        usingHedwigSynth = false;
        document.getElementById('music-opt-default')?.classList.add('active');
      } else if (source === 'hp') {
        activeAudio = audioHP;
        usingHedwigSynth = true;
        document.getElementById('music-opt-hp')?.classList.add('active');
      } else if (source === 'custom') {
        activeAudio = audioCustom;
        usingHedwigSynth = false;
        document.getElementById('music-opt-custom')?.classList.add('active');
      }

      if (wasPlaying) {
        playActiveAudio();
      }

      closeMusicDropdown();
    }

    function toggleMusicDropdown(e) {
      e.stopPropagation();
      musicDropdownOpen = !musicDropdownOpen;
      if (musicDropdownPanel) musicDropdownPanel.classList.toggle('panel-open', musicDropdownOpen);
      if (musicDropdownArrow) musicDropdownArrow.classList.toggle('open', musicDropdownOpen);
    }

    function closeMusicDropdown() {
      musicDropdownOpen = false;
      if (musicDropdownPanel) musicDropdownPanel.classList.remove('panel-open');
      if (musicDropdownArrow) musicDropdownArrow.classList.remove('open');
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (musicDropdownOpen && !e.target.closest('#music-dropdown-panel') && !e.target.closest('#music-dropdown-arrow')) {
        closeMusicDropdown();
      }
    });

    // Dropdown arrow click to open/close
    if (musicDropdownArrow) {
      musicDropdownArrow.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMusicDropdown(e);
      });
    }

    // Main music button: play/pause toggle
    if (musicBtn) {
      musicBtn.addEventListener('click', (e) => {
        // Don't toggle if clicking the dropdown arrow
        if (e.target.closest('.music-dropdown-arrow')) return;
        getAudioCtx();
        if (state.isPlayingMusic) {
          stopAllAudio();
        } else {
          playActiveAudio();
        }
      });
    }

    // Music source option clicks
    const optDefault = document.getElementById('music-opt-default');
    const optHP = document.getElementById('music-opt-hp');
    const optCustom = document.getElementById('music-opt-custom');

    if (optDefault) {
      optDefault.addEventListener('click', (e) => {
        e.stopPropagation();
        getAudioCtx();
        selectMusicSource('default');
        showToast('🎂 Playing Happy Birthday song!');
      });
    }

    if (optHP) {
      optHP.addEventListener('click', (e) => {
        e.stopPropagation();
        getAudioCtx();
        selectMusicSource('hp');
        showToast('⚡ Playing Hedwig\'s Theme (Harry Potter)!');
      });
    }

    if (optCustom) {
      optCustom.addEventListener('click', (e) => {
        e.stopPropagation();
        // Trigger file upload
        if (customSongUpload) customSongUpload.click();
      });
    }

    if (customSongUpload) {
      customSongUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Security: Audio MIME whitelist check
        const allowedAudioMimes = [
          'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/x-wav',
          'audio/ogg', 'audio/aac', 'audio/m4a', 'audio/x-m4a'
        ];
        const isAudioType = allowedAudioMimes.includes(file.type) || file.type.startsWith('audio/');
        if (!isAudioType) {
          showToast('🛡️ Security Warning: Only safe audio files (MP3, WAV, AAC, OGG, M4A) are permitted!');
          customSongUpload.value = '';
          return;
        }

        // Security: 15 MB file size limit
        const maxAudioBytes = 15 * 1024 * 1024;
        if (file.size > maxAudioBytes) {
          showToast('⚠️ Audio file too large: Maximum allowed size is 15 MB.');
          customSongUpload.value = '';
          return;
        }

        // Single Song Rule: Revoke previous blob URL to prevent memory leaks
        if (customSongBlobUrl) {
          try { URL.revokeObjectURL(customSongBlobUrl); } catch(err) {}
          customSongBlobUrl = null;
        }

        try {
          const url = URL.createObjectURL(file);
          customSongBlobUrl = url;
          if (audioCustom) {
            audioCustom.src = url;
            audioCustom.load();
          }

          const cleanName = sanitizeText(file.name, 28) || 'Custom Audio';
          const statusEl = document.getElementById('music-custom-status');
          const nameEl = document.getElementById('custom-song-name');
          if (statusEl) statusEl.style.display = 'block';
          if (nameEl) nameEl.textContent = cleanName;

          getAudioCtx();
          selectMusicSource('custom');
          showToast(`🎵 1 Custom song active: ${cleanName}`);
        } catch (err) {
          console.error('Audio load error:', err);
          showToast('⚠️ Could not load audio file safely.');
        }
        customSongUpload.value = '';
      });
    }

    // Auto-select HP music when Potter theme is active on first load
    if (state.backgroundTheme === 'potter' && audioHP) {
      selectMusicSource('hp');
    }

    // Start on Stage 1
    goToStage(1);
  });
})();
