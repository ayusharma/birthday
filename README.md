# 🎂 Magical 3D Birthday Celebration ✨

An enchanting, modern, and interactive birthday celebration web application featuring immersive 3D graphics, dynamic themes, soundscapes, and comprehensive security hardening.

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![WebGL / Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)

---

## 🌟 Live Demo

🔗 **Public Live Link**: [https://amaanmulani9-ai.github.io/birthday/](https://amaanmulani9-ai.github.io/birthday/)

---

## ✨ Key Features

### 🌌 1. Dual Immersive 3D Environments
- **⚡ Hogwarts Wizarding World Theme (Default)**:
  - Procedural floating beeswax candles with flickering flames and optical halos.
  - **The Golden Snitch**: Metallic mirror-shaded sphere with hypersonic flight AI, reactive mouse-evasion physics, and shimmering spark trails.
  - **Quidditch Broomstick Flyers**: Autonomous wizard riders soaring across the moonlit sky with dynamic billowing robes.
  - **Hedwig the Snowy Owl**: Graceful parcel delivery animation carrying Hogwarts acceptance letters.
  - Atmospheric Black Lake with specular moonlight reflection, layered rolling mist, and distant Hogwarts castle silhouette.
  - 4 Hogwarts House Palettes (**Gryffindor**, **Slytherin**, **Ravenclaw**, **Hufflepuff**) with magical aura switching.
- **🎈 Festive Celebration Theme**:
  - Realistic multi-colored 3D balloons floating upward with physics-based string wobble.
  - Tumbling confetti cannons with real-time 3D rotation and specular glitter.

### 🎭 2. Step-by-Step Progressive Celebration Experience
1. **Turn On Lights**: Ambient darkness illuminates into warm, inviting celebration glow.
2. **Play Music**: Engaging audio track fades in seamlessly.
3. **Let's Decorate**: Vibrant celebration banners and festive garlands drop into position.
4. **Fly Balloons / Light Candles**: Atmosphere fills with floating celebratory elements.
5. **Cake Cutting**: Interactive birthday cake with animated sparkler candle.
6. **Memory Stack**: Interactive 3D Polaroid photo cards that flip with genuine depth.
7. **Heartfelt Message**: Elegant parchment or envelope unfolds with customized birthday wishes.

### 🔒 3. Enterprise-Grade Security & Privacy Hardening
- **Zero-Persistence Privacy**: Personal data, messages, and uploaded assets are kept solely in volatile memory during the active session. Everything is purged on page reload or close.
- **Cryptographic 24-Hour Expiration**: Shareable preview links utilize HMAC signatures (`sig`) and timestamp validation to prevent tampering and guarantee 24-hour expiration.
- **Recipient View-Only Mode**: Recipients opening a share link experience the celebration in a protected gift mode with personalization inputs safely locked.
- **Strict Content Security Policy (CSP)**: Hardened headers prohibiting external code injection and unauthorized scripts.
- **Upload Hardening**: Enforced MIME-type whitelisting and file size caps (max 5MB for images, max 15MB for custom audio; SVG strictly blocked to neutralize XSS vectors).

### ✍️ 4. Real-Time Word & Character Constraints
- **Birthday Person's Name**: Enforced word limit of **4 words** (maximum 30 characters) with real-time counting and intelligent clamping.
- **Custom Wish Message**: Enforced word limit of **50 words** (maximum 350 characters) with live counter indicators and warning highlights.

---

## 🚀 Getting Started

### Local Setup (Node.js)
```bash
# Clone the repository
git clone https://github.com/amaanmulani9-ai/birthday.git
cd birthday

# Install lightweight dependencies
npm install

# Start local development server
npm run server-node
```
Then open `http://localhost:8081` in your web browser.

### Local Setup (Python)
```bash
# Python 3
python -m http.server 8081
```

---

## 📁 Project Architecture

```
birthday/
├── index.html          # Semantic HTML5 markup, accessible forms & SVG backdrop assets
├── stylesheet.css      # Responsive CSS3 styles, glassmorphism UI & keyframe animations
├── app.js              # WebGL / Canvas2D render loop, state machine & security logic
├── three.min.js        # Three.js 3D library (bundled for offline resilience)
├── package.json        # Project metadata and server scripts
├── bd1.jpg - bd4.jpg   # High-resolution celebration memory presets
└── hbd.mp3             # Default celebratory soundtrack
```

---

## 🛠️ Tech Stack
- **HTML5 & Vanilla CSS3**: Glassmorphism, CSS Custom Properties, and responsive flex/grid layouts.
- **Vanilla JavaScript (ES6+)**: Zero framework dependencies, pure DOM performance.
- **WebGL & Canvas2D**: Three.js particle systems, procedural shading, and physics-based collision/evasion math.
- **Web Audio API**: Low-latency multi-source audio management.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
