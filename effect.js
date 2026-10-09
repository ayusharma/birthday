/**
 * ============================================================================
 * WORLD-CLASS 3D CELEBRATION ENGINE
 * 3D Cosmos Particle Field, Realistic Physics, Candle Dynamics & Personalization
 * ============================================================================
 */

(function () {
  'use strict';

  // --- Exact original heartfelt story lines from repository ---
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

  // --- Global Celebration State ---
  const state = {
    name: 'Amaan',
    birthDate: '',
    customMessage: '',
    age: null,
    zodiac: null,
    isPlayingMusic: false,
    isCandleLit: true,
    isCandleBlown: false,
    storyIndex: 0,
    storyTimer: null,
    isAutoPlaying: false,
    mousePos: { x: 0, y: 0 }
  };

  // --- High-Fidelity Web Audio Sound Synthesizer ---
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, type = 'sine', duration = 0.4, gainLevel = 0.25) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  function playBalloonPopSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {}
  }

  function playCandleWhoosh() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      // White noise puff for realistic breath
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.35);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch (e) {}
  }

  function playRoyalFanfare() {
    const notes = [
      { f: 523.25, d: 0.18 }, // C5
      { f: 659.25, d: 0.18 }, // E5
      { f: 783.99, d: 0.22 }, // G5
      { f: 1046.50, d: 0.6 }  // C6
    ];
    notes.forEach((note, idx) => {
      setTimeout(() => playTone(note.f, 'triangle', note.d, 0.3), idx * 140);
    });
  }

  // --- Astrological Zodiac & Milestone Calculator ---
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

  function calculatePersonalMilestones(dateStr) {
    if (!dateStr) return { age: null, zodiac: null };
    const birth = new Date(dateStr);
    if (isNaN(birth.getTime())) return { age: null, zodiac: null };

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    const zodiac = getAstrologyInfo(birth.getDate(), birth.getMonth() + 1);
    return { age: age > 0 ? age : null, zodiac };
  }

  // --- URL Query Parameter Router ---
  function parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const n = params.get('name');
    const d = params.get('date');
    const m = params.get('msg');

    if (n) state.name = n.trim();
    if (d) state.birthDate = d.trim();
    if (m) state.customMessage = m.trim();

    const { age, zodiac } = calculatePersonalMilestones(state.birthDate);
    state.age = age;
    state.zodiac = zodiac;
  }

  // ==========================================================================
  // REAL 3D COSMOS PARTICLE FIELD CANVAS
  // ==========================================================================
  const cosmosCanvas = document.getElementById('cosmos-canvas');
  const cosmosCtx = cosmosCanvas ? cosmosCanvas.getContext('2d') : null;
  let stars = [];
  const STAR_COUNT = 180;

  function initCosmos() {
    if (!cosmosCanvas || !cosmosCtx) return;
    cosmosCanvas.width = window.innerWidth;
    cosmosCanvas.height = window.innerHeight;
    stars = [];

    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: (Math.random() - 0.5) * cosmosCanvas.width * 2,
        y: (Math.random() - 0.5) * cosmosCanvas.height * 2,
        z: Math.random() * cosmosCanvas.width,
        color: ['#ffd166', '#ff3385', '#06d6a0', '#8338ec', '#ffffff'][Math.floor(Math.random() * 5)],
        size: Math.random() * 2 + 0.8
      });
    }
  }

  function renderCosmos() {
    if (!cosmosCanvas || !cosmosCtx) return;
    cosmosCtx.clearRect(0, 0, cosmosCanvas.width, cosmosCanvas.height);

    const cx = cosmosCanvas.width / 2;
    const cy = cosmosCanvas.height / 2;

    stars.forEach(star => {
      star.z -= 0.6;
      if (star.z <= 0) {
        star.z = cosmosCanvas.width;
        star.x = (Math.random() - 0.5) * cosmosCanvas.width * 2;
        star.y = (Math.random() - 0.5) * cosmosCanvas.height * 2;
      }

      const k = 280 / star.z;
      const px = star.x * k + cx + (state.mousePos.x * 0.04);
      const py = star.y * k + cy + (state.mousePos.y * 0.04);

      if (px >= 0 && px <= cosmosCanvas.width && py >= 0 && py <= cosmosCanvas.height) {
        const alpha = Math.min(1, (1 - star.z / cosmosCanvas.width) * 1.2);
        cosmosCtx.beginPath();
        cosmosCtx.arc(px, py, star.size * k * 0.6, 0, Math.PI * 2);
        cosmosCtx.fillStyle = star.color;
        cosmosCtx.globalAlpha = Math.max(0, alpha);
        cosmosCtx.fill();
      }
    });

    requestAnimationFrame(renderCosmos);
  }

  // Mouse Parallax Listener
  window.addEventListener('mousemove', (e) => {
    state.mousePos.x = e.clientX - window.innerWidth / 2;
    state.mousePos.y = e.clientY - window.innerHeight / 2;
  });

  // ==========================================================================
  // CONFETTI PHYSICS CANNON ENGINE
  // ==========================================================================
  const confettiCanvas = document.getElementById('confetti-canvas');
  const confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
  let confettiParticles = [];
  let confettiRunning = false;

  function resizeConfetti() {
    if (confettiCanvas) {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    }
  }
  window.addEventListener('resize', () => {
    initCosmos();
    resizeConfetti();
  });
  resizeConfetti();

  class ConfettiItem {
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

  function shootConfetti(count = 140, originX, originY) {
    if (!confettiCanvas) return;
    for (let i = 0; i < count; i++) {
      confettiParticles.push(new ConfettiItem(originX, originY));
    }
    if (!confettiRunning) {
      confettiRunning = true;
      requestAnimationFrame(renderConfetti);
    }
  }

  function renderConfetti() {
    if (!confettiCtx) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiParticles = confettiParticles.filter(p => p.opacity > 0 && p.y < confettiCanvas.height + 60);

    confettiParticles.forEach(p => {
      p.update();
      p.draw();
    });

    if (confettiParticles.length > 0) {
      requestAnimationFrame(renderConfetti);
    } else {
      confettiRunning = false;
    }
  }

  // ==========================================================================
  // DYNAMIC 3D FOIL NAME BALLOONS
  // ==========================================================================
  function generateFoilBalloons() {
    const harbor = document.getElementById('balloons-constellation');
    if (!harbor) return;
    harbor.innerHTML = '';

    const nameToRender = state.name.trim().toUpperCase() || 'HBD';
    const chars = nameToRender.split('');

    chars.forEach((char, index) => {
      if (char === ' ') {
        const space = document.createElement('div');
        space.style.width = '24px';
        harbor.appendChild(space);
        return;
      }

      const balloon = document.createElement('div');
      balloon.className = `foil-balloon balloon-foil-${index % 7}`;
      balloon.style.animationDelay = `${(index * 0.22).toFixed(2)}s`;
      balloon.textContent = char;

      const tail = document.createElement('div');
      tail.className = 'balloon-tail';
      balloon.appendChild(tail);

      const string = document.createElement('div');
      string.className = 'silk-string';
      balloon.appendChild(string);

      // Interactive Click to Pop
      balloon.addEventListener('click', (e) => {
        playBalloonPopSound();
        shootConfetti(35, e.clientX, e.clientY);
        balloon.style.transform = 'scale(1.5)';
        balloon.style.opacity = '0';
        setTimeout(() => {
          balloon.style.transform = '';
          balloon.style.opacity = '1';
        }, 3200);
      });

      harbor.appendChild(balloon);
    });
  }

  // ==========================================================================
  // HERO & BADGES DISPLAY
  // ==========================================================================
  function refreshHeroSection() {
    const titleEl = document.getElementById('monumental-name');
    const badgeContainer = document.getElementById('badge-galaxy');

    if (titleEl) {
      titleEl.textContent = state.name;
    }

    if (badgeContainer) {
      badgeContainer.innerHTML = '';

      if (state.age) {
        const agePill = document.createElement('div');
        agePill.className = 'cosmic-badge badge-gold';
        agePill.innerHTML = `🎂 Celebrating ${state.age} Radiant Years`;
        badgeContainer.appendChild(agePill);
      }

      if (state.zodiac) {
        const zodiacPill = document.createElement('div');
        zodiacPill.className = 'cosmic-badge';
        zodiacPill.innerHTML = `⭐ ${state.zodiac.sign} • ${state.zodiac.quote}`;
        badgeContainer.appendChild(zodiacPill);
      }

      const specialPill = document.createElement('div');
      specialPill.className = 'cosmic-badge';
      specialPill.innerHTML = `✨ Made with love for your special day`;
      badgeContainer.appendChild(specialPill);
    }
  }

  // ==========================================================================
  // KINETIC STORYTELLER (DEFAULT ORIGINAL POEM OR CUSTOM MESSAGE)
  // ==========================================================================
  function getActiveStoryLines() {
    // If the user entered a custom message, display their customized lines!
    if (state.customMessage && state.customMessage.trim().length > 0) {
      const userLines = state.customMessage
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);
      if (userLines.length > 0) return userLines;
    }
    // Otherwise: ALWAYS use the classic beloved original poem from the repo!
    return DEFAULT_STORY_MESSAGES.map(line => line.replace('{NAME}', state.name));
  }

  function displayProseLine(index) {
    const lines = getActiveStoryLines();
    const proseBox = document.getElementById('story-kinetic-prose');
    const counterEl = document.getElementById('story-progress-text');

    if (index >= lines.length) index = 0;
    if (index < 0) index = lines.length - 1;
    state.storyIndex = index;

    if (proseBox) {
      proseBox.style.opacity = '0';
      proseBox.style.transform = 'translateY(10px)';
      setTimeout(() => {
        proseBox.innerHTML = lines[index];
        proseBox.style.opacity = '1';
        proseBox.style.transform = 'translateY(0)';
      }, 250);
    }

    if (counterEl) {
      counterEl.textContent = `${index + 1} / ${lines.length}`;
    }
  }

  function startStoryCarousel() {
    clearInterval(state.storyTimer);
    const lines = getActiveStoryLines();
    displayProseLine(state.storyIndex);

    state.storyTimer = setInterval(() => {
      state.storyIndex = (state.storyIndex + 1) % lines.length;
      displayProseLine(state.storyIndex);
      if (state.storyIndex === lines.length - 1) {
        shootConfetti(80);
      }
    }, 4000);
  }

  // ==========================================================================
  // CELEBRATION SEQUENTIAL STEP ACTIONS
  // ==========================================================================
  const stepActions = {
    // Step 1: Turn on Lights
    1: function () {
      const lightsString = document.getElementById('fairy-lights-string');
      if (lightsString) lightsString.classList.add('lights-glow-on');
      playTone(659.25, 'sine', 0.5);
      showToast('💡 Lights are glowing! The magic begins.');
      markActiveDock(1);
      primeNextDock(2);
    },

    // Step 2: Play Background Music
    2: function () {
      const audio = document.getElementById('birthday-song');
      const visualizer = document.getElementById('audio-visualizer-box');
      const btn = document.getElementById('btn-header-music');
      if (audio) {
        audio.play().then(() => {
          state.isPlayingMusic = true;
          if (visualizer) visualizer.classList.remove('meter-paused');
          if (btn) btn.innerHTML = '🔊 Music Playing';
        }).catch(() => {
          state.isPlayingMusic = false;
        });
      }
      playTone(783.99, 'sine', 0.4);
      showToast('🎵 Happy Birthday soundtrack playing!');
      markActiveDock(2);
      primeNextDock(3);
    },

    // Step 3: Fly Balloons
    3: function () {
      const harbor = document.getElementById('balloons-constellation');
      if (harbor) harbor.style.display = 'flex';
      shootConfetti(100);
      playRoyalFanfare();
      showToast(`🎈 Floating balloons for ${state.name}! Click to pop them!`);
      markActiveDock(3);
      primeNextDock(4);
    },

    // Step 4: Bring 3D Cake
    4: function () {
      const cakeCard = document.getElementById('cake-arena-card');
      if (cakeCard) cakeCard.classList.add('card-revealed');
      playTone(880, 'triangle', 0.5);
      showToast('🎂 Here comes the delicious birthday cake!');
      markActiveDock(4);
      primeNextDock(5);
    },

    // Step 5: Light Candle
    5: function () {
      const flame = document.getElementById('candle-flame-real');
      if (flame) {
        flame.classList.remove('flame-extinguished');
        state.isCandleLit = true;
        state.isCandleBlown = false;
      }
      playTone(1046.50, 'sine', 0.5);
      showToast('🕯️ Candle is lit! Make a wish...');
      markActiveDock(5);
      primeNextDock(6);
    },

    // Step 6: Blow Candle
    6: function () {
      const flame = document.getElementById('candle-flame-real');
      const smoke = document.getElementById('realistic-smoke');
      if (flame) {
        flame.classList.add('flame-extinguished');
        state.isCandleBlown = true;
      }
      if (smoke) {
        smoke.classList.add('rising-smoke');
        setTimeout(() => smoke.classList.remove('rising-smoke'), 2200);
      }
      playCandleWhoosh();
      setTimeout(playRoyalFanfare, 200);
      shootConfetti(220);
      showToast(`💨 Flame blown! May all your heartfelt wishes come true, ${state.name}! 🌟`);
      markActiveDock(6);
      primeNextDock(7);
    },

    // Step 7: Open 3D Gift Box
    7: function () {
      const giftCard = document.getElementById('gift-arena-card');
      const giftBox = document.getElementById('gift-3d-box');
      const unveiled = document.getElementById('gift-unveiled-card');
      if (giftCard) giftCard.classList.add('card-revealed');
      if (giftBox) giftBox.classList.add('box-unwrapped');
      if (unveiled) unveiled.classList.add('revealed');
      playRoyalFanfare();
      shootConfetti(120);
      showToast('🎁 Gift box opened! A special surprise revealed.');
      markActiveDock(7);
      primeNextDock(8);
    },

    // Step 8: Read Heartfelt Story
    8: function () {
      const storyCard = document.getElementById('story-cinema-card');
      const polaroid = document.getElementById('polaroid-arena-card');
      if (storyCard) {
        storyCard.classList.add('card-revealed');
        storyCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (polaroid) polaroid.classList.add('card-revealed');
      startStoryCarousel();
      markActiveDock(8);
      showToast('💌 Reading your special birthday message...');
    }
  };

  function markActiveDock(stepNumber) {
    document.querySelectorAll('.step-action-pill').forEach(b => b.classList.remove('step-active', 'step-pulse'));
    const pill = document.getElementById(`step-pill-${stepNumber}`);
    if (pill) pill.classList.add('step-active');
  }

  function primeNextDock(nextStepNumber) {
    const nextPill = document.getElementById(`step-pill-${nextStepNumber}`);
    if (nextPill) nextPill.classList.add('step-pulse');
  }

  // ==========================================================================
  // AUTO-PLAY CINEMATIC SHOW
  // ==========================================================================
  function launchCinematicShow() {
    state.isAutoPlaying = true;
    showToast('🎬 Starting full automated cinematic celebration!');
    const timeline = [400, 3200, 6400, 10000, 13600, 17200, 21000, 25000];

    timeline.forEach((delay, idx) => {
      setTimeout(() => {
        if (state.isAutoPlaying) {
          const stepNum = idx + 1;
          if (stepActions[stepNum]) stepActions[stepNum]();
        }
      }, delay);
    });
  }

  // ==========================================================================
  // TOAST NOTIFICATIONS
  // ==========================================================================
  function showToast(msg) {
    const toast = document.getElementById('cosmic-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('toast-active');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('toast-active');
    }, 3800);
  }

  // ==========================================================================
  // PERSONALIZATION MODAL & SHARING
  // ==========================================================================
  function setupModalAndSharing() {
    const modal = document.getElementById('glass-creator-modal');
    const openBtn = document.getElementById('btn-header-personalize');
    const closeBtn = document.getElementById('modal-close-btn');
    const cancelBtn = document.getElementById('btn-modal-cancel');
    const previewBtn = document.getElementById('btn-modal-preview');
    const copyBtn = document.getElementById('btn-modal-copy-link');
    const waBtn = document.getElementById('btn-modal-whatsapp');

    const nameInput = document.getElementById('modal-input-name');
    const dateInput = document.getElementById('modal-input-date');
    const msgInput = document.getElementById('modal-input-msg');

    function syncFormValues() {
      if (nameInput) nameInput.value = state.name;
      if (dateInput) dateInput.value = state.birthDate;
      if (msgInput) msgInput.value = state.customMessage;
    }

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        syncFormValues();
        if (modal) modal.classList.add('overlay-open');
      });
    }

    function hideModal() {
      if (modal) modal.classList.remove('overlay-open');
    }

    if (closeBtn) closeBtn.addEventListener('click', hideModal);
    if (cancelBtn) cancelBtn.addEventListener('click', hideModal);

    if (previewBtn) {
      previewBtn.addEventListener('click', () => {
        state.name = nameInput.value.trim() || 'Amaan';
        state.birthDate = dateInput.value;
        state.customMessage = msgInput.value.trim();

        const { age, zodiac } = calculatePersonalMilestones(state.birthDate);
        state.age = age;
        state.zodiac = zodiac;

        refreshHeroSection();
        generateFoilBalloons();
        displayProseLine(0);
        hideModal();
        showToast(`✨ Updated celebration for ${state.name}!`);
      });
    }

    function createShareLink() {
      const url = new URL(window.location.origin + window.location.pathname);
      url.searchParams.set('name', nameInput ? nameInput.value.trim() || state.name : state.name);
      if (dateInput && dateInput.value) {
        url.searchParams.set('date', dateInput.value);
      }
      if (msgInput && msgInput.value.trim()) {
        url.searchParams.set('msg', msgInput.value.trim());
      }
      return url.toString();
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const link = createShareLink();
        navigator.clipboard.writeText(link).then(() => {
          showToast('📋 Customized share link copied to clipboard!');
        }).catch(() => {
          prompt('Copy your link:', link);
        });
      });
    }

    if (waBtn) {
      waBtn.addEventListener('click', () => {
        const link = createShareLink();
        const text = encodeURIComponent(`🎉 A magical Happy Birthday celebration created especially for ${state.name}! Open your surprise here: ${link}`);
        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
      });
    }

    // Header Quick Share Link
    const headerShareBtn = document.getElementById('btn-header-share');
    if (headerShareBtn) {
      headerShareBtn.addEventListener('click', () => {
        const currentUrl = window.location.href;
        navigator.clipboard.writeText(currentUrl).then(() => {
          showToast('🔗 Link copied! Send it to your loved one!');
        }).catch(() => {
          prompt('Copy this link:', currentUrl);
        });
      });
    }
  }

  // ==========================================================================
  // INITIALIZATION ON DOM READY
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    parseUrlParams();
    initCosmos();
    renderCosmos();
    refreshHeroSection();
    generateFoilBalloons();
    displayProseLine(0);
    setupModalAndSharing();

    // Attach Step Dock Buttons
    for (let i = 1; i <= 8; i++) {
      const pill = document.getElementById(`step-pill-${i}`);
      if (pill && stepActions[i]) {
        pill.addEventListener('click', () => {
          getAudioContext();
          stepActions[i]();
        });
      }
    }

    // Auto-Play Show Button
    const autoBtn = document.getElementById('btn-auto-cinema-play');
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        getAudioContext();
        launchCinematicShow();
      });
    }

    // Music Header Toggle Button
    const musicBtn = document.getElementById('btn-header-music');
    const audio = document.getElementById('birthday-song');
    const visualizer = document.getElementById('audio-visualizer-box');
    if (musicBtn && audio) {
      musicBtn.addEventListener('click', () => {
        getAudioContext();
        if (audio.paused) {
          audio.play().then(() => {
            state.isPlayingMusic = true;
            musicBtn.innerHTML = '🔊 Music Playing';
            if (visualizer) visualizer.classList.remove('meter-paused');
          });
        } else {
          audio.pause();
          state.isPlayingMusic = false;
          musicBtn.innerHTML = '🔈 Play Music';
          if (visualizer) visualizer.classList.add('meter-paused');
        }
      });
    }

    // Interactive Candle Blow
    const candleAssembly = document.getElementById('candle-assembly');
    if (candleAssembly) {
      candleAssembly.addEventListener('click', () => {
        stepActions[6]();
      });
    }

    // Interactive Gift Box
    const giftBox = document.getElementById('gift-3d-box');
    if (giftBox) {
      giftBox.addEventListener('click', () => {
        stepActions[7]();
      });
    }

    // Story Navigation
    const nextBtn = document.getElementById('story-nav-next');
    const prevBtn = document.getElementById('story-nav-prev');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        clearInterval(state.storyTimer);
        const lines = getActiveStoryLines();
        state.storyIndex = (state.storyIndex + 1) % lines.length;
        displayProseLine(state.storyIndex);
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        clearInterval(state.storyTimer);
        const lines = getActiveStoryLines();
        state.storyIndex = (state.storyIndex - 1 + lines.length) % lines.length;
        displayProseLine(state.storyIndex);
      });
    }

    // Prime first button
    primeNextDock(1);
  });
})();