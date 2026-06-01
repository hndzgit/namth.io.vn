/* -------------------------------------------------------------
   SYSTEM PRELOADER & INITIALIZATION
------------------------------------------------------------- */
let isEntering = false;
let enterStartTime = 0;
let hasEntered = false;
let currentLanguage = 'en';
try {
  currentLanguage = localStorage.getItem('nh-portfolio-lang') || 'en';
} catch (e) {
  console.warn("localStorage language is not accessible:", e);
}
let isFullyLoaded = false;
if (document.readyState === 'complete') {
  isFullyLoaded = true;
} else {
  window.addEventListener('load', () => {
    isFullyLoaded = true;
  });
}

let currentTheme = 'dark';
try {
  currentTheme = localStorage.getItem('nh-portfolio-theme') || 'dark';
} catch (e) {
  console.warn("localStorage is not accessible:", e);
}

// Global Tab Inactivity Monitor & Animation Frame Handles
let isTabActive = true;
let cursorAnimId = null;
let glowsAnimId = null;
let threeAnimId = null;

document.addEventListener('visibilitychange', () => {
  isTabActive = !document.hidden;
  if (isTabActive) {
    // Resume loops if they are not active
    if (!cursorAnimId && window.innerWidth >= 1024) cursorAnimId = requestAnimationFrame(updateCursor);
    if (!glowsAnimId && window.innerWidth >= 768) glowsAnimId = requestAnimationFrame(updateGlows);
    if (!threeAnimId && typeof THREE !== 'undefined' && renderer && scene) threeAnimId = requestAnimationFrame(animateThreeBg);
  } else {
    // Cancel all animation frames to achieve 0.0% background CPU consumption
    if (cursorAnimId) { cancelAnimationFrame(cursorAnimId); cursorAnimId = null; }
    if (glowsAnimId) { cancelAnimationFrame(glowsAnimId); glowsAnimId = null; }
    if (threeAnimId) { cancelAnimationFrame(threeAnimId); threeAnimId = null; }
  }
});

/* -------------------------------------------------------------
   GEMINI API KEY CONFIGURATION
------------------------------------------------------------- */
const GEMINI_API_KEY = "AIzaSyAI7m_vxSo92BEvJZz8gEyd59Y22aTh8I4"; // Paste your official Gemini API key here to unlock live AI chatbot capabilities

// Apply stored theme immediately on parse to avoid layout flash
if (currentTheme === 'light') {
  document.documentElement.setAttribute('data-theme', 'light');
}

console.log("Active Main JS v20 loaded");
const preloader = document.getElementById('preloader');
const preloaderBar = document.getElementById('preloader-bar');
const enterBtn = document.getElementById('enter-btn');
const enterSub = document.getElementById('enter-sub');
const statusElement = document.getElementById('preloader-status');

// Append rotating HUD circles to background
function initHUDBg() {
  const c1 = document.createElement('div');
  c1.className = 'hud-circle hud-circle-1';
  const c2 = document.createElement('div');
  c2.className = 'hud-circle hud-circle-2';
  document.body.appendChild(c1);
  document.body.appendChild(c2);
}
initHUDBg();

// Initialize preloader matrix canvas
function initPreloaderMatrix() {
  const canvas = document.getElementById('preloader-matrix-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
  
  window.addEventListener('resize', () => {
    if (preloader.style.display === 'none') return;
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
  
  const columns = Math.floor(width / 20) + 1;
  const yPositions = Array(columns).fill(0);
  const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&?<>_[]{}';
  
  function draw() {
    if (preloader.style.display === 'none') return;
    
    ctx.fillStyle = 'rgba(3, 3, 5, 0.12)';
    ctx.fillRect(0, 0, width, height);
    
    ctx.font = '10px monospace';
    
    for (let i = 0; i < yPositions.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const x = i * 20;
      const y = yPositions[i];
      
      ctx.fillStyle = i % 2 === 0 ? '#c1ff12' : '#f76cfe';
      ctx.fillText(char, x, y);
      
      if (y > 100 + Math.random() * 10000) {
        yPositions[i] = 0;
      } else {
        yPositions[i] += 12;
      }
    }
  }
  
  const interval = setInterval(draw, 33);
  
  const checkInterval = setInterval(() => {
    if (preloader.style.display === 'none') {
      clearInterval(interval);
      clearInterval(checkInterval);
    }
  }, 1000);
}
initPreloaderMatrix();

const loadingStatuses = [
  { en: "ESTABLISHING SECURE GATEWAY...", vi: "ĐANG KẾT NỐI CỔNG BẢO MẬT..." },
  { en: "INITIALIZING CORE ALGORITHMS...", vi: "KHỞI TẠO HỆ THỐNG LÕI..." },
  { en: "SYNCHRONIZING NEURAL WORKSPACE...", vi: "ĐỒNG BỘ MÔ HÌNH HỌC SÂU AI..." },
  { en: "BUILDING THREE.JS WebGL WORLD...", vi: "THIẾT LẬP KHÔNG GIAN WEBGL 3D..." },
  { en: "PORTAL GATEWAY ACCESS READY.", vi: "CỔNG LIÊN KẾT ĐÃ SẴN SÀNG." }
];

let currentStatusIndex = 0;

function runPreloaderSteps() {
  if (currentStatusIndex >= loadingStatuses.length) {
    triggerLoaderComplete();
    return;
  }
  
  const status = loadingStatuses[currentStatusIndex];
  const textToShow = currentLanguage === 'vi' ? status.vi : status.en;
  
  // Animate status bar progress
  const progress = ((currentStatusIndex + 1) / loadingStatuses.length) * 100;
  preloaderBar.style.width = `${progress}%`;
  
  // Draw SVG logo outer circle progress
  const outerCircle = document.querySelector('.preloader-logo-svg .logo-outer-circle');
  if (outerCircle) {
    const circumference = 2 * Math.PI * 42; // ~263.89
    const offset = circumference - (progress / 100) * circumference;
    outerCircle.style.strokeDashoffset = offset;
  }
  
  // Trigger scramble decrypt on preloader status text
  statusElement.classList.add('decrypting');
  scrambleTextElement(statusElement, textToShow, () => {
    statusElement.classList.remove('decrypting');
    currentStatusIndex++;
    
    // Scale transition delay down dynamically if resources are already cached/loaded
    const delay = isFullyLoaded ? 100 : 850;
    setTimeout(runPreloaderSteps, delay);
  });
}

function scrambleTextElement(element, finalString, callback) {
  const scrambleChars = '01#@$%&?<>_/[]{}—=+*^';
  let ticks = 0;
  
  // Stagger and speed up scramble sweeps dynamically
  const durationTicks = isFullyLoaded ? 6 : 16;
  const intervalDelay = isFullyLoaded ? 15 : 40;
  
  const interval = setInterval(() => {
    let result = '';
    const progress = ticks / durationTicks;
    
    for (let i = 0; i < finalString.length; i++) {
      if (finalString[i] === ' ') {
        result += ' ';
        continue;
      }
      
      if (i / finalString.length < progress) {
        result += finalString[i];
      } else {
        result += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
      }
    }
    
    element.innerText = result;
    ticks++;
    
    if (ticks > durationTicks) {
      clearInterval(interval);
      element.innerText = finalString;
      if (callback) callback();
    }
  }, intervalDelay);
}

// Start preloader steps
setTimeout(runPreloaderSteps, 300);

function triggerLoaderComplete() {
  preloaderBar.style.width = '100%';
  statusElement.style.opacity = '0.5';
  
  enterBtn.classList.remove('btn-hidden');
  enterBtn.classList.add('btn-visible');
  enterSub.classList.add('visible');
}

enterBtn.addEventListener('click', () => {
  // Fade out preloader panel smoothly
  preloader.classList.add('fade-out');
  
  // Start WebGL camera fly-in zoom effect
  isEntering = true;
  hasEntered = true;
  enterStartTime = Date.now();
  
  // Trigger WebGL particle splash explosion!
  createParticleBurst();
  
  setTimeout(() => {
    preloader.style.display = 'none';
  }, 1200);

  // Trigger Hero reveals sequentially with staggered laser decrypt letters
  setTimeout(() => {
    const heroReveals = document.querySelectorAll('#hero .reveal-clip, #hero .reveal-fade-up');
    heroReveals.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('revealed');
        if (el.classList.contains('reveal-clip')) {
          scrambleDecrypt(el);
        }
      }, index * 180);
    });
    
    // Animate expanding neon divider line
    const divider = document.querySelector('.hero-divider-line');
    if (divider) divider.classList.add('revealed');
  }, 400);
});

function scrambleDecrypt(element) {
  if (element.dataset.decrypted === 'true') return;
  element.dataset.decrypted = 'true';
  
  const originalText = element.innerText;
  element.innerHTML = '';
  
  const spans = [];
  for (let i = 0; i < originalText.length; i++) {
    const span = document.createElement('span');
    span.className = 'scramble-char-span';
    span.style.display = 'inline-block';
    span.innerText = originalText[i] === ' ' ? '\u00A0' : originalText[i];
    element.appendChild(span);
    spans.push(span);
  }
  
  // Append follow cursor block
  const cursorSpan = document.createElement('span');
  cursorSpan.className = 'scramble-cursor';
  cursorSpan.innerText = '█';
  element.appendChild(cursorSpan);
  
  const scrambleChars = '01#@$%&?<>_/[]{}—=+*^';
  let activeDecryptCount = 0;
  
  spans.forEach((span, idx) => {
    if (originalText[idx] === ' ') {
      // Immediately reveal space
      setTimeout(() => {
        span.classList.add('revealed');
      }, idx * 45);
      return;
    }
    
    let ticks = 0;
    const maxTicks = 10 + idx * 3; // Staggered decrypting duration per letter
    
    // Stagger start slightly to align with the sweeping cursor
    setTimeout(() => {
      const interval = setInterval(() => {
        // Trigger 3D fold-up reveal
        span.classList.add('revealed');
        
        if (ticks >= maxTicks) {
          clearInterval(interval);
          span.innerText = originalText[idx];
          span.classList.remove('decrypting');
          span.classList.add('decrypted');
          
          activeDecryptCount++;
          // Move cursor forward in front of next letter
          const nextLetter = spans[idx + 1];
          if (nextLetter) {
            element.insertBefore(cursorSpan, nextLetter.nextSibling);
          } else {
            // Remove cursor at end of line
            cursorSpan.remove();
          }
        } else {
          span.innerText = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          span.classList.add('decrypting');
          ticks++;
          
          // Position cursor right next to current scrambling letter
          element.insertBefore(cursorSpan, span.nextSibling);
        }
      }, 30);
    }, idx * 45);
  });
}

// Old 2D canvas sphere replaced by unified Three.js WebGL canvas system

/* -------------------------------------------------------------
   CUSTOM LERP-BASED CURSOR TRACKING
------------------------------------------------------------- */
const cursor = document.querySelector('.custom-cursor');
const cursorDot = document.querySelector('.cursor-dot');
const cursorCircle = document.querySelector('.cursor-circle');

let cursorX = 0, cursorY = 0; // Target coordinates
let dotX = 0, dotY = 0;       // Dot current coordinates
let circX = 0, circY = 0;     // Circle current coordinates

let glowX1 = window.innerWidth / 2, glowY1 = window.innerHeight / 2;
let targetGlowX1 = glowX1, targetGlowY1 = glowY1;

let glowX2 = window.innerWidth / 2, glowY2 = window.innerHeight / 2;
let targetGlowX2 = glowX2, targetGlowY2 = glowY2;

let glowX3 = window.innerWidth / 2, glowY3 = window.innerHeight / 2;
let targetGlowX3 = glowX3, targetGlowY3 = glowY3;

// Handle cursor tracking
window.addEventListener('mousemove', (e) => {
  cursorX = e.clientX;
  cursorY = e.clientY;
  
  targetGlowX1 = e.clientX;
  targetGlowY1 = e.clientY;
  targetGlowX2 = window.innerWidth - e.clientX;
  targetGlowY2 = window.innerHeight - e.clientY;
  targetGlowX3 = (e.clientX + window.innerWidth / 2) % window.innerWidth;
  targetGlowY3 = (e.clientY + window.innerHeight / 2) % window.innerHeight;
  
  // Make cursor visible on first mousemove
  if (cursor.style.display !== 'block' && window.innerWidth >= 1024) {
    cursor.style.display = 'block';
  }
});

function updateCursor() {
  if (!isTabActive || window.innerWidth < 1024) {
    cursorAnimId = null;
    return;
  }
  // Lerp equation: current = current + (target - current) * factor
  dotX += (cursorX - dotX) * 0.35;
  dotY += (cursorY - dotY) * 0.35;
  
  circX += (cursorX - circX) * 0.12;
  circY += (cursorY - circY) * 0.12;
  
  cursorDot.style.left = `${dotX}px`;
  cursorDot.style.top = `${dotY}px`;
  
  cursorCircle.style.left = `${circX}px`;
  cursorCircle.style.top = `${circY}px`;
  
  cursorAnimId = requestAnimationFrame(updateCursor);
}
cursorAnimId = requestAnimationFrame(updateCursor);

function updateGlows() {
  if (!isTabActive || window.innerWidth < 768) {
    glowsAnimId = null;
    return;
  }
  glowX1 += (targetGlowX1 - glowX1) * 0.035; // Soft fluid drift
  glowY1 += (targetGlowY1 - glowY1) * 0.035;
  
  glowX2 += (targetGlowX2 - glowX2) * 0.025;
  glowY2 += (targetGlowY2 - glowY2) * 0.025;
  
  glowX3 += (targetGlowX3 - glowX3) * 0.02; // Slower differential motion
  glowY3 += (targetGlowY3 - glowY3) * 0.02;
  
  // Directly move elements using hardware-accelerated GPU translate3d (Eliminates CSS variable layout reflows!)
  if (glow1) glow1.style.transform = `translate3d(${glowX1 - 400}px, ${glowY1 - 400}px, 0)`;
  if (glow2) glow2.style.transform = `translate3d(${glowX2 - 450}px, ${glowY2 - 450}px, 0)`;
  if (glow3) glow3.style.transform = `translate3d(${glowX3 - 425}px, ${glowY3 - 425}px, 0)`;
  
  glowsAnimId = requestAnimationFrame(updateGlows);
}
glowsAnimId = requestAnimationFrame(updateGlows);

// Add Click interactions to Cursor
window.addEventListener('mousedown', () => cursor.classList.add('clicked'));
window.addEventListener('mouseup', () => cursor.classList.remove('clicked'));

// Add Hover target listeners dynamically
function bindCursorHovers() {
  const hoverElements = document.querySelectorAll('.hover-target, a, button, input, textarea');
  hoverElements.forEach(el => {
    // Only bind once
    if (el.dataset.cursorBound) return;
    el.dataset.cursorBound = 'true';

    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hovered');
    });
    
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovered');
    });
  });
}
bindCursorHovers();

// Re-bind hover elements when DOM changes (like language changes)
const observer = new MutationObserver(() => {
  bindCursorHovers();
});
observer.observe(document.body, { childList: true, subtree: true });

/* -------------------------------------------------------------
   THREE.JS 3D WEBGL INTERACTIVE MORPHING BACKGROUND
------------------------------------------------------------- */
const webglCanvas = document.getElementById('webgl-canvas');
const glow1 = document.querySelector('.glow-blob-1');
const glow2 = document.querySelector('.glow-blob-2');
const glow3 = document.querySelector('.glow-blob-3');

let scene, camera, renderer, starfield, ambientLight, dirLight;
let heroGroup, sphereMesh, sphereWire, ring1, ring2, satellite;
let aboutMesh, aboutPoints, projectsMesh, contactMesh;
let heroMaterial, ring1Material, ring2Material, satelliteMaterial;
let aboutMaterial, projectsMaterial, contactMaterial;
let lightLime, lightMagenta, lightCyan;

let scrollPercent = 0;
let docHeight = 0;
let sectionPositions = [];
let targetCamX = 0;
let targetCamY = 0;

// WebGL Lighting Smooth Transitions (Sáng / Tối dần)
let targetAmbientColor = null;
let targetDirIntensity = 2.0;

// Nebulas and explosions
let nebulaGroup, nebulaMeshs = [];
let particleBurstGroup = null;
let particleBurstStartTime = 0;
let particleBurstParticles = [];

// Constellation settings
let constellationLines, constellationPoints;
let constellationNodes = [];
const constellationNodeCount = 45; // Sweet spot for performance and visual density

const starCount = 600;

function createParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.25, 'rgba(255, 255, 255, 0.85)');
  grad.addColorStop(0.55, 'rgba(255, 255, 255, 0.2)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(16, 16, 16, 0, Math.PI * 2);
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
}

function hexToRgbA(hex, alpha) {
  let c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
  }
  return 'rgba(255, 255, 255, ' + alpha + ')';
}

function createGlowTexture(color, opacity) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, hexToRgbA(color, opacity));
  grad.addColorStop(0.5, hexToRgbA(color, opacity * 0.4));
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(64, 64, 64, 0, Math.PI * 2);
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
}

function createGradientEnvMap() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = '#020205';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const grad1 = ctx.createRadialGradient(100, 80, 0, 100, 80, 150);
  grad1.addColorStop(0, 'rgba(193, 255, 18, 0.85)'); // Lime
  grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad1;
  ctx.beginPath();
  ctx.arc(100, 80, 150, 0, Math.PI * 2);
  ctx.fill();
  
  const grad2 = ctx.createRadialGradient(400, 180, 0, 400, 180, 180);
  grad2.addColorStop(0, 'rgba(247, 108, 254, 0.85)'); // Magenta
  grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad2;
  ctx.beginPath();
  ctx.arc(400, 180, 180, 0, Math.PI * 2);
  ctx.fill();
  
  const grad3 = ctx.createRadialGradient(250, 120, 0, 250, 120, 120);
  grad3.addColorStop(0, 'rgba(0, 240, 255, 0.8)'); // Cyan
  grad3.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad3;
  ctx.beginPath();
  ctx.arc(250, 120, 120, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return texture;
}

function createParticleBurst() {
  if (typeof THREE === 'undefined' || !scene) return;
  try {
    particleBurstGroup = new THREE.Group();
    const burstCount = 500;
    const burstGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(burstCount * 3);
    const colors = new Float32Array(burstCount * 3);
    
    const colorsPalette = [
      new THREE.Color('#c1ff12'), // Lime
      new THREE.Color('#f76cfe'), // Magenta
      new THREE.Color('#00f0ff')  // Cyan
    ];
    
    for (let i = 0; i < burstCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 50;
      
      const col = colorsPalette[Math.floor(Math.random() * colorsPalette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
      
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const speed = 2.0 + Math.random() * 5.0;
      
      particleBurstParticles.push({
        vx: Math.sin(phi) * Math.cos(theta) * speed,
        vy: Math.sin(phi) * Math.sin(theta) * speed,
        vz: Math.cos(phi) * speed - 1.0,
        decay: 0.95 + Math.random() * 0.03,
        opacity: 1.0
      });
    }
    
    burstGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    burstGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const burstMat = new THREE.PointsMaterial({
      size: 3.5,
      map: createParticleTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    const points = new THREE.Points(burstGeo, burstMat);
    particleBurstGroup.add(points);
    scene.add(particleBurstGroup);
    
    particleBurstStartTime = Date.now();
  } catch (e) {
    console.warn("Failed to create particle burst:", e);
  }
}

function initThreeBg() {
  scene = new THREE.Scene();
  
  // Set up camera with 60 deg field of view
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 550; // Starts zoomed out for intro Zoom splash
  
  renderer = new THREE.WebGLRenderer({
    canvas: webglCanvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  // 1. Compile Procedural Environment Map (For ultra-realistic Web3 metallic reflections)
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const envTexture = createGradientEnvMap();
  const envMap = pmremGenerator.fromEquirectangular(envTexture).texture;
  scene.environment = envMap;
  envTexture.dispose();
  pmremGenerator.dispose();

  // 2. Lights Environment (For realistic glass, chrome, and highlights reflections)
  ambientLight = new THREE.AmbientLight(0x06060c);
  scene.add(ambientLight);
  
  // Set initial target states for lerping
  targetAmbientColor = new THREE.Color(currentTheme === 'light' ? 0xeef0f6 : 0x06060c);
  targetDirIntensity = currentTheme === 'light' ? 3.0 : 2.0;
  ambientLight.color.copy(targetAmbientColor);
  
  lightLime = new THREE.PointLight(0xc1ff12, 10, 350);
  scene.add(lightLime);
  
  lightMagenta = new THREE.PointLight(0xf76cfe, 10, 350);
  scene.add(lightMagenta);
  
  lightCyan = new THREE.PointLight(0x00f0ff, 8, 350);
  scene.add(lightCyan);
  
  dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
  dirLight.position.set(0, 10, 10);
  scene.add(dirLight);
  
  // 3. Background Starfield (Constant Galaxy Backdrop with Mobile Optimization)
  const isMobile = window.innerWidth < 768;
  const currentStarCount = isMobile ? 200 : starCount;
  
  const starGeometry = new THREE.BufferGeometry();
  const starPositions = new Float32Array(currentStarCount * 3);
  const starColors = new Float32Array(currentStarCount * 3);
  
  const colors = [
    new THREE.Color('#c1ff12'), // lime
    new THREE.Color('#f76cfe'), // magenta
    new THREE.Color('#00f0ff'), // cyan
    new THREE.Color('#ffffff')  // white
  ];
  
  for (let i = 0; i < currentStarCount; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 600;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 500;
    starPositions[i * 3 + 2] = (Math.random() - 0.5) * 400;
    
    let col = colors[3]; // white
    if (Math.random() < 0.25) col = colors[2]; // cyan
    else if (Math.random() < 0.1) col = colors[1]; // magenta
    else if (Math.random() < 0.05) col = colors[0]; // lime
    
    starColors[i * 3] = col.r * 0.38; // Dim background stars
    starColors[i * 3 + 1] = col.g * 0.38;
    starColors[i * 3 + 2] = col.b * 0.38;
  }
  
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
  
  const starMaterial = new THREE.PointsMaterial({
    size: isMobile ? 1.4 : 0.9,
    map: createParticleTexture(),
    vertexColors: true,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  
  starfield = new THREE.Points(starGeometry, starMaterial);
  scene.add(starfield);

  // 3b. Interstellar Nebula Dust Clouds (Creates deep visual space parallax layers)
  nebulaGroup = new THREE.Group();
  scene.add(nebulaGroup);
  
  const nebulaColors = [
    { color: '#c1ff12', x: -150, y: 80, z: -180, scale: 280, opacity: 0.05 },  // Lime
    { color: '#f76cfe', x: 180, y: -100, z: -150, scale: 320, opacity: 0.04 }, // Magenta
    { color: '#00f0ff', x: -80, y: -120, z: -120, scale: 260, opacity: 0.06 }, // Cyan
    { color: '#f76cfe', x: 50, y: 150, z: -200, scale: 300, opacity: 0.04 }    // Magenta
  ];
  
  nebulaColors.forEach(cfg => {
    const tex = createGlowTexture(cfg.color, 1.0);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: cfg.opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const geo = new THREE.PlaneGeometry(1, 1);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(cfg.x, cfg.y, cfg.z);
    mesh.scale.setScalar(cfg.scale);
    mesh.userData = { rotSpeed: 0.02 + Math.random() * 0.03 };
    nebulaGroup.add(mesh);
    nebulaMeshs.push(mesh);
  });

  // 3c. Interactive AI Constellation Network (Dynamic connection lines)
  constellationNodes = [];
  const nodeCount = isMobile ? 15 : constellationNodeCount;
  const constGeo = new THREE.BufferGeometry();
  const constPositions = new Float32Array(nodeCount * 3);
  
  for (let i = 0; i < nodeCount; i++) {
    const x = (Math.random() - 0.5) * 350;
    const y = (Math.random() - 0.5) * 280;
    const z = (Math.random() - 0.5) * 250 - 50;
    
    constPositions[i * 3] = x;
    constPositions[i * 3 + 1] = y;
    constPositions[i * 3 + 2] = z;
    
    constellationNodes.push({
      x: x, y: y, z: z,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      vz: (Math.random() - 0.5) * 0.25
    });
  }
  
  constGeo.setAttribute('position', new THREE.BufferAttribute(constPositions, 3));
  
  const constMat = new THREE.PointsMaterial({
    size: 2.5,
    color: 0x00f0ff, // cyan nodes
    map: createParticleTexture(),
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  
  constellationPoints = new THREE.Points(constGeo, constMat);
  scene.add(constellationPoints);
  
  // Set up LineSegments for connections
  const lineGeo = new THREE.BufferGeometry();
  const maxLineVertices = nodeCount * nodeCount * 2;
  const linePositions = new Float32Array(maxLineVertices * 3);
  const lineColors = new Float32Array(maxLineVertices * 3);
  
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
  
  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    linewidth: 1
  });
  
  constellationLines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(constellationLines);

  // 5. Materials for 3D Geometries (Tối ưu hóa cực cao sang MeshStandardMaterial)
  heroMaterial = new THREE.MeshStandardMaterial({
    color: 0x0c0c10,
    roughness: 0.1,
    metalness: 0.8, // Tạo độ bóng cao
    transparent: true,
    opacity: 0.65,
    flatShading: true // Tinh thể pha lê sắc cạnh
  });
  
  ring1Material = new THREE.MeshBasicMaterial({
    color: 0xc1ff12, // Lime green
    wireframe: true,
    transparent: true,
    opacity: 0.45
  });
  
  ring2Material = new THREE.MeshBasicMaterial({
    color: 0xf76cfe, // Magenta
    wireframe: true,
    transparent: true,
    opacity: 0.35
  });
  
  satelliteMaterial = new THREE.MeshBasicMaterial({
    color: 0x00f0ff, // Cyan
    transparent: true,
    opacity: 0.75
  });
  
  aboutMaterial = new THREE.MeshBasicMaterial({
    color: 0xf76cfe, // Magenta
    wireframe: true,
    transparent: true,
    opacity: 0
  });
  
  projectsMaterial = new THREE.MeshStandardMaterial({
    color: 0x030308,
    metalness: 0.95, // Phản chiếu kim loại lỏng (Chrome)
    roughness: 0.1,
    transparent: true,
    opacity: 0,
    flatShading: true
  });
  
  contactMaterial = new THREE.MeshStandardMaterial({
    color: 0x121218,
    metalness: 0.2,
    roughness: 0.1,
    transparent: true,
    opacity: 0,
    flatShading: true
  });
  
  // 6. Hero Planetary Group (Glass Sphere + Glowing Core + Dual Saturn Rings + Satellite)
  heroGroup = new THREE.Group();
  
  const sphereGeo = new THREE.IcosahedronGeometry(45, 2);
  sphereMesh = new THREE.Mesh(sphereGeo, heroMaterial);
  heroGroup.add(sphereMesh);
  
  // Add inner glowing wireframe overlay inside the glass sphere
  const sphereWireGeo = new THREE.IcosahedronGeometry(44.8, 2);
  const sphereWireMat = new THREE.MeshBasicMaterial({
    color: 0xc1ff12,
    wireframe: true,
    transparent: true,
    opacity: 0.15
  });
  sphereWire = new THREE.Mesh(sphereWireGeo, sphereWireMat);
  heroGroup.add(sphereWire);

  // Add inner glowing plasma core
  const coreGeo = new THREE.SphereGeometry(15, 16, 16);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xf76cfe, // Magenta core
    transparent: true,
    opacity: 0.6
  });
  const sphereCore = new THREE.Mesh(coreGeo, coreMat);
  heroGroup.add(sphereCore);
  
  // Outer orbiting Saturn Rings
  const ring1Geo = new THREE.TorusGeometry(68, 0.8, 8, 64);
  ring1 = new THREE.Mesh(ring1Geo, ring1Material);
  ring1.rotation.x = Math.PI / 2.2;
  ring1.rotation.y = Math.PI / 12;
  heroGroup.add(ring1);
  
  const ring2Geo = new THREE.TorusGeometry(82, 0.5, 8, 64);
  ring2 = new THREE.Mesh(ring2Geo, ring2Material);
  ring2.rotation.x = Math.PI / 1.8;
  ring2.rotation.y = -Math.PI / 8;
  heroGroup.add(ring2);
  
  // Orbiting satellite sphere
  const satelliteGeo = new THREE.SphereGeometry(3.5, 16, 16);
  satellite = new THREE.Mesh(satelliteGeo, satelliteMaterial);
  heroGroup.add(satellite);
  
  // Position to the right on desktop, center on mobile
  heroGroup.position.set(window.innerWidth < 768 ? 0 : 50, 0, 0);
  heroGroup.scale.setScalar(0.001); // Zoom in on Enter click
  scene.add(heroGroup);
  
  // 7. About mesh (Undulating Plane Grid Landscape with Point Vertices)
  const planeGeo = new THREE.PlaneGeometry(450, 450, 24, 24);
  aboutMesh = new THREE.Mesh(planeGeo, aboutMaterial);
  aboutMesh.rotation.x = -Math.PI / 2.3;
  aboutMesh.position.set(0, -90, -40);
  scene.add(aboutMesh);
  
  // Add glowing vertex nodes to wave terrain
  const pointsMat = new THREE.PointsMaterial({
    color: 0xc1ff12, // Lime green nodes
    size: 2.0,
    transparent: true,
    opacity: 0
  });
  aboutPoints = new THREE.Points(planeGeo, pointsMat);
  aboutPoints.rotation.x = aboutMesh.rotation.x;
  aboutPoints.position.set(0, -90, -40);
  scene.add(aboutPoints);
  
  // Save original plane vertices Z positions for wave calculations
  aboutMesh.userData.originalZ = new Float32Array(planeGeo.attributes.position.count);
  const zAttr = planeGeo.attributes.position;
  for (let i = 0; i < zAttr.count; i++) {
    aboutMesh.userData.originalZ[i] = zAttr.getZ(i);
  }
  
  // 8. Projects mesh (Faceted liquid chrome Torus Knot)
  const knotGeo = new THREE.TorusKnotGeometry(32, 8, 80, 12);
  projectsMesh = new THREE.Mesh(knotGeo, projectsMaterial);
  projectsMesh.position.set(window.innerWidth < 768 ? 0 : -50, 0, 0);
  scene.add(projectsMesh);

  // Cache original vertices of projectsMesh Torus Knot for fluid morph animation
  projectsMesh.userData.originalPos = projectsMesh.geometry.attributes.position.clone();
  
  // 9. Contact mesh (3D Diamond Icosahedron)
  const diamondGeo = new THREE.IcosahedronGeometry(38, 1);
  contactMesh = new THREE.Mesh(diamondGeo, contactMaterial);
  contactMesh.position.set(0, 0, 0);
  scene.add(contactMesh);

  // Add inner glowing wireframe crystal core inside Diamond
  const innerDiamondGeo = new THREE.IcosahedronGeometry(20, 1);
  const innerDiamondMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    wireframe: true,
    transparent: true,
    opacity: 0.25
  });
  const innerDiamond = new THREE.Mesh(innerDiamondGeo, innerDiamondMat);
  contactMesh.add(innerDiamond);
  
  // Listeners
  window.addEventListener('resize', onWebglResize);
  window.addEventListener('scroll', onWebglScroll);
  window.addEventListener('mousemove', onWebglMouseMove);
  
  // Set initial theme for Three.js WebGL lighting reflections
  if (currentTheme === 'light' && scene && renderer) {
    updateThreeTheme('light');
  }

  threeAnimId = requestAnimationFrame(animateThreeBg);
}

function onWebglResize() {
  if (typeof THREE === 'undefined' || !camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  camera.position.z = window.innerWidth < 768 ? 260 : 210;
  
  // Re-adjust horizontal positioning for columns
  if (heroGroup) heroGroup.position.x = window.innerWidth < 768 ? 0 : 50;
  if (projectsMesh) projectsMesh.position.x = window.innerWidth < 768 ? 0 : -50;
}

function onWebglScroll() {
  if (docHeight > 0) {
    scrollPercent = window.scrollY / docHeight;
  }
}

function onWebglMouseMove(e) {
  targetCamX = (e.clientX - window.innerWidth / 2) * 0.08;
  targetCamY = -(e.clientY - window.innerHeight / 2) * 0.08;
}

function animateThreeBg() {
  if (typeof THREE === 'undefined' || !renderer || !scene) return;
  if (!isTabActive) {
    threeAnimId = null;
    return;
  }
  threeAnimId = requestAnimationFrame(animateThreeBg);
  
  // Smooth WebGL lighting transitions (sáng tối dần)
  if (ambientLight && targetAmbientColor) {
    ambientLight.color.lerp(targetAmbientColor, 0.05); // Smoothly blend light color
  }
  if (dirLight) {
    dirLight.intensity += (targetDirIntensity - dirLight.intensity) * 0.05; // Smoothly blend light intensity
  }
  
  const time = Date.now() * 0.0012;
  
  // Dynamic Point Lights orbits (Casts changing neon reflections on glass & chrome)
  lightLime.position.x = Math.sin(time * 0.7) * 140;
  lightLime.position.y = Math.cos(time * 0.5) * 140;
  lightLime.position.z = Math.sin(time * 0.3) * 60 + 50;
  
  lightMagenta.position.x = -Math.sin(time * 0.5) * 140;
  lightMagenta.position.y = -Math.cos(time * 0.7) * 140;
  lightMagenta.position.z = Math.cos(time * 0.3) * 60 + 50;
  
  lightCyan.position.x = Math.cos(time * 0.4) * 120;
  lightCyan.position.y = Math.sin(time * 0.6) * 120;
  
  // Constant Starfield Drift (Xoay bằng phần cứng GPU - Tiêu hao 0% CPU thay cho vòng lặp 2,000 sao)
  starfield.rotation.y += 0.0003;
  starfield.rotation.x += 0.0001;

  // Rotate nebula layers slowly for organic gaseous drift
  nebulaMeshs.forEach(mesh => {
    mesh.rotation.z += mesh.userData.rotSpeed * 0.02;
  });

  // 1b. Constellation nodes movement & line connections
  if (constellationPoints && constellationLines) {
    const pointsAttr = constellationPoints.geometry.attributes.position;
    const pts = pointsAttr.array;
    const isMobile = window.innerWidth < 768;
    const nodeCount = isMobile ? 15 : constellationNodeCount;
    
    // Update node positions with velocity
    for (let i = 0; i < nodeCount; i++) {
      const node = constellationNodes[i];
      node.x += node.vx;
      node.y += node.vy;
      node.z += node.vz;
      
      // Boundaries bounce
      if (Math.abs(node.x) > 200) node.vx *= -1;
      if (Math.abs(node.y) > 150) node.vy *= -1;
      if (node.z > 100 || node.z < -200) node.vz *= -1;
      
      pts[i * 3] = node.x;
      pts[i * 3 + 1] = node.y;
      pts[i * 3 + 2] = node.z;
    }
    pointsAttr.needsUpdate = true;
    
    // Re-calculate connection lines
    const lineAttr = constellationLines.geometry.attributes.position;
    const linePos = lineAttr.array;
    const colorAttr = constellationLines.geometry.attributes.color;
    const lineCol = colorAttr.array;
    
    let vertexIdx = 0;
    const maxDist = 65;
    
    // Palette for lines based on which nodes are connecting
    const colorLime = new THREE.Color('#c1ff12');
    const colorCyan = new THREE.Color('#00f0ff');
    const colorMagenta = new THREE.Color('#f76cfe');
    
    for (let i = 0; i < nodeCount; i++) {
      const n1 = constellationNodes[i];
      for (let j = i + 1; j < nodeCount; j++) {
        const n2 = constellationNodes[j];
        
        const dx = n1.x - n2.x;
        const dy = n1.y - n2.y;
        const dz = n1.z - n2.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (dist < maxDist) {
          // Draw line segment between n1 and n2
          linePos[vertexIdx * 3] = n1.x;
          linePos[vertexIdx * 3 + 1] = n1.y;
          linePos[vertexIdx * 3 + 2] = n1.z;
          
          linePos[(vertexIdx + 1) * 3] = n2.x;
          linePos[(vertexIdx + 1) * 3 + 1] = n2.y;
          linePos[(vertexIdx + 1) * 3 + 2] = n2.z;
          
          // Interpolate alpha based on proximity
          const alpha = (1.0 - dist / maxDist) * 0.45 * (isMobile ? 0.3 : 1.0);
          
          // Dynamic gradient color along the line based on positions
          let baseCol = colorCyan;
          if (n1.x < -50) baseCol = colorLime;
          else if (n1.x > 50) baseCol = colorMagenta;
          
          lineCol[vertexIdx * 3] = baseCol.r * alpha;
          lineCol[vertexIdx * 3 + 1] = baseCol.g * alpha;
          lineCol[vertexIdx * 3 + 2] = baseCol.b * alpha;
          
          lineCol[(vertexIdx + 1) * 3] = baseCol.r * alpha;
          lineCol[(vertexIdx + 1) * 3 + 1] = baseCol.g * alpha;
          lineCol[(vertexIdx + 1) * 3 + 2] = baseCol.b * alpha;
          
          vertexIdx += 2;
        }
      }
    }
    
    // Reset remaining elements in the line arrays to 0 to prevent ghost lines
    const totalVertices = linePos.length;
    for (let k = vertexIdx; k < totalVertices / 2; k++) {
      linePos[k * 3] = 0;
      linePos[k * 3 + 1] = 0;
      linePos[k * 3 + 2] = 0;
      lineCol[k * 3] = 0;
      lineCol[k * 3 + 1] = 0;
      lineCol[k * 3 + 2] = 0;
    }
    
    lineAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
    
    constellationLines.geometry.setDrawRange(0, vertexIdx);
  }

  // Particle Splash Explosion Update
  if (particleBurstGroup) {
    const elapsed = Date.now() - particleBurstStartTime;
    if (elapsed > 2000) {
      scene.remove(particleBurstGroup);
      particleBurstGroup = null;
      particleBurstParticles = [];
    } else {
      const posAttr = particleBurstGroup.children[0].geometry.attributes.position;
      const positions = posAttr.array;
      const mat = particleBurstGroup.children[0].material;
      
      for (let i = 0; i < particleBurstParticles.length; i++) {
        const p = particleBurstParticles[i];
        positions[i * 3] += p.vx;
        positions[i * 3 + 1] += p.vy;
        positions[i * 3 + 2] += p.vz;
        
        p.vx *= p.decay;
        p.vy *= p.decay;
        p.vz *= p.decay;
      }
      posAttr.needsUpdate = true;
      mat.opacity = 1.0 - (elapsed / 2000);
    }
  }
  
  // Easing function for smooth organic entry
  const easeOutCubic = x => 1 - Math.pow(1 - x, 3);
  
  // Zoom fly-in transitions
  if (isEntering) {
    const elapsed = (Date.now() - enterStartTime) / 2000; // 2 seconds zoom splash
    if (elapsed < 1.0) {
      const t = easeOutCubic(elapsed);
      camera.position.z = 550 - (550 - (window.innerWidth < 768 ? 260 : 210)) * t;
      heroGroup.scale.setScalar(t);
      heroGroup.rotation.y = t * Math.PI * 2;
    } else {
      isEntering = false;
      camera.position.z = window.innerWidth < 768 ? 260 : 210;
      heroGroup.scale.setScalar(1.0);
    }
  } else if (!hasEntered) {
    camera.position.z = 550;
    heroGroup.scale.setScalar(0.001);
  } else {
    camera.position.z = window.innerWidth < 768 ? 260 : 210;
  }
  
  // Camera smooth parallax lerp
  camera.position.x += (targetCamX - camera.position.x) * 0.05;
  camera.position.y += (targetCamY - camera.position.y) * 0.05;
  camera.lookAt(scene.position);
  
  // Constant rotation of active 3D meshes
  sphereMesh.rotation.y += 0.002;
  sphereMesh.rotation.x += 0.0008;
  sphereWire.rotation.y -= 0.004;
  
  ring1.rotation.z -= 0.0015;
  ring2.rotation.z += 0.001;
  
  // Orbiting satellite calculations
  satellite.position.x = Math.cos(time * 1.5) * 72;
  satellite.position.z = Math.sin(time * 1.5) * 72;
  satellite.position.y = Math.sin(time) * 15;
  
  projectsMesh.rotation.y += 0.004;
  projectsMesh.rotation.z += 0.0015;
 
  // Projects Mesh Liquid Wobble (Chỉ chạy khi hiển thị & chạy trên máy tính để tránh nóng điện thoại)
  if (projectsMesh && projectsMaterial.opacity > 0.01 && window.innerWidth >= 1024) {
    const posAttr = projectsMesh.geometry.attributes.position;
    const orig = projectsMesh.userData.originalPos;
    for (let i = 0; i < posAttr.count; i++) {
      const x = orig.getX(i);
      const y = orig.getY(i);
      const z = orig.getZ(i);
      const offset = Math.sin(x * 0.06 + time * 1.8) * Math.cos(y * 0.06 + time * 1.8) * 1.8;
      posAttr.setXYZ(i, x + offset, y + offset, z + offset);
    }
    posAttr.needsUpdate = true;
  }
  
  contactMesh.rotation.y += 0.003;
  contactMesh.rotation.x += 0.0015;
 
  // Inner crystal core rotation
  if (contactMesh && contactMesh.children.length > 0) {
    const innerDiamond = contactMesh.children[0];
    innerDiamond.rotation.y -= 0.006;
    innerDiamond.rotation.x -= 0.003;
  }
  
  // 1. Plane wave terrain calculations (Chỉ tính toán và cập nhật khi đang cuộn đến phần Giới thiệu để tối ưu pin)
  if (aboutMesh && aboutMaterial && aboutMaterial.opacity > 0.01) {
    const planePos = aboutMesh.geometry.attributes.position;
    const originalZ = aboutMesh.userData.originalZ;
    for (let i = 0; i < planePos.count; i++) {
      const u = planePos.getX(i);
      const v = planePos.getY(i);
      const zVal = Math.sin(u * 0.025 + time) * Math.cos(v * 0.025 + time) * 16 + originalZ[i];
      planePos.setZ(i, zVal);
    }
    planePos.needsUpdate = true;
    aboutMesh.rotation.z = time * 0.05;
    
    // Keep points geometry in sync
    aboutPoints.geometry.attributes.position.copy(planePos);
    aboutPoints.geometry.attributes.position.needsUpdate = true;
    aboutPoints.rotation.z = aboutMesh.rotation.z;
  } else if (aboutMesh) {
    aboutMesh.rotation.z = time * 0.05;
    if (aboutPoints) aboutPoints.rotation.z = aboutMesh.rotation.z;
  }
  
  // 2. Opacity interpolations based on scroll progressz;
  
  // 2. Opacity interpolations based on scroll progress
  let opacityHero = 0;
  let opacityAbout = 0;
  let opacityProjects = 0;
  let opacityContact = 0;
  
  if (scrollPercent <= 0.33) {
    const t = scrollPercent / 0.33;
    opacityHero = 1 - t;
    opacityAbout = t;
  } else if (scrollPercent <= 0.66) {
    const t = (scrollPercent - 0.33) / 0.33;
    opacityAbout = 1 - t;
    opacityProjects = t;
  } else {
    const t = Math.min(1.0, (scrollPercent - 0.66) / 0.34);
    opacityProjects = 1 - t;
    opacityContact = t;
  }
  
  // Apply opacity with damping
  heroMaterial.opacity += (opacityHero * 0.55 - heroMaterial.opacity) * 0.1;
  ring1Material.opacity += (opacityHero * 0.45 - ring1Material.opacity) * 0.1;
  ring2Material.opacity += (opacityHero * 0.35 - ring2Material.opacity) * 0.1;
  satelliteMaterial.opacity += (opacityHero * 0.75 - satelliteMaterial.opacity) * 0.1;
  
  aboutMaterial.opacity += (opacityAbout * 0.38 - aboutMaterial.opacity) * 0.1;
  aboutPoints.material.opacity += (opacityAbout * 0.70 - aboutPoints.material.opacity) * 0.1;
  
  projectsMaterial.opacity += (opacityProjects * 0.60 - projectsMaterial.opacity) * 0.1;
  contactMaterial.opacity += (opacityContact * 0.65 - contactMaterial.opacity) * 0.1;
  
  // Apply visual coordinate transformations (slides/scales) as we scroll
  heroGroup.position.y = -scrollPercent * 140;
  
  // Smoothly scale active objects down to 0.001 when inactive to achieve morphing entry/exit and avoid clipping
  if (heroGroup && !isEntering) {
    const targetScale = Math.max(0.001, opacityHero);
    heroGroup.scale.setScalar(targetScale);
  }
  
  const targetAboutY = -90 + (1 - opacityAbout) * -90;
  aboutMesh.position.y += (targetAboutY - aboutMesh.position.y) * 0.1;
  aboutPoints.position.y = aboutMesh.position.y;
  
  if (aboutMesh) {
    const targetScale = Math.max(0.001, opacityAbout);
    aboutMesh.scale.setScalar(targetScale);
    if (aboutPoints) aboutPoints.scale.setScalar(targetScale);
  }
  
  projectsMesh.position.y += ((1 - opacityProjects) * 100 - projectsMesh.position.y) * 0.1;
  if (projectsMesh) {
    const targetScale = Math.max(0.001, opacityProjects);
    projectsMesh.scale.setScalar(targetScale);
  }
  
  if (contactMesh) {
    const targetScale = Math.max(0.001, opacityContact);
    contactMesh.scale.setScalar(targetScale * (0.4 + opacityContact * 0.6));
  }
  
  renderer.render(scene, camera);
}

// Start Three WebGL Background
try {
  initThreeBg();
} catch (e) {
  console.error("WebGL/Three.js initialization failed:", e);
  if (webglCanvas) {
    webglCanvas.style.display = 'none';
  }
}

/* -------------------------------------------------------------
   3D TILT & FLASHLIGHT CARD EFFECTS
------------------------------------------------------------- */
function bind3DTilts() {
  const cards = document.querySelectorAll('.project-card, .timeline-card, .skills-card, .contact-form');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Update mouse coordinate styles for spotlight glow
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
      
      // Calculate 3D tilt relative offsets
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      const dx = x - xc;
      const dy = y - yc;
      
      // Max rotation of 5 degrees
      const tiltX = -(dy / yc) * 5;
      const tiltY = (dx / xc) * 5;
      
      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.015, 1.015, 1.015)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  });
}
bind3DTilts();

/* -------------------------------------------------------------
   DYNAMIC TRANSLATION INTERFACE (EN / VI)
------------------------------------------------------------- */
const langToggle = document.getElementById('lang-toggle');

function translatePage(lang) {
  currentLanguage = lang;
  
  // Set Lang attribute on root HTML
  document.documentElement.lang = lang;

  // Translate all marked elements
  const translateElements = document.querySelectorAll('[data-en]');
  translateElements.forEach(el => {
    const text = el.getAttribute(`data-${lang}`);
    if (text) {
      el.textContent = text;
    }
  });

  // Re-prepare split character elements for typography animations
  prepareSplitTexts();

  // Style lang switch representations
  if (lang === 'vi') {
    langToggle.innerHTML = '<span class="lang-inactive">EN</span><span class="lang-divider">/</span><span class="lang-active">VI</span>';
  } else {
    langToggle.innerHTML = '<span class="lang-active">EN</span><span class="lang-divider">/</span><span class="lang-inactive">VI</span>';
  }
  
  // Save language selection to localStorage
  try {
    localStorage.setItem('nh-portfolio-lang', lang);
  } catch (e) {
    console.warn("localStorage is not writable:", e);
  }
}

langToggle.addEventListener('click', () => {
  const nextLang = currentLanguage === 'en' ? 'vi' : 'en';
  translatePage(nextLang);
});

// Run initial translation synchronization on page load
translatePage(currentLanguage);



/* -------------------------------------------------------------
   ACTIVE NAVBAR ITEM TRACKING ON SCROLL (Throttled & Cached)
------------------------------------------------------------- */
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');
const scrollDownIndicator = document.querySelector('.scroll-down-indicator');

// Cache offset top & heights to prevent layout thrashing (Forced Reflow) on scroll
function cacheSectionPositions() {
  docHeight = document.documentElement.scrollHeight - window.innerHeight;
  sectionPositions = Array.from(sections).map(sec => {
    const topVal = sec.offsetTop;
    const heightVal = sec.offsetHeight;
    return {
      id: sec.getAttribute('id'),
      top: topVal - 150,
      bottom: topVal - 150 + heightVal
    };
  });
}

// Build initial cache and bind refresh hooks
window.addEventListener('DOMContentLoaded', cacheSectionPositions);
window.addEventListener('load', cacheSectionPositions);
window.addEventListener('resize', cacheSectionPositions);

// Recalculate if page dynamically changes size (e.g. accordion expansions)
const heightMutationObserver = new MutationObserver(cacheSectionPositions);
heightMutationObserver.observe(document.body, { childList: true, subtree: true });

// Run initial cache compile immediately
cacheSectionPositions();

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  let currentActive = 'hero';
  
  // High-performance numerical search in RAM (0% DOM Queries!)
  for (let i = 0; i < sectionPositions.length; i++) {
    const pos = sectionPositions[i];
    if (scrollY >= pos.top && scrollY < pos.bottom) {
      currentActive = pos.id;
      break;
    }
  }

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentActive}`) {
      link.classList.add('active');
    }
  });

  // Fade out scroll indicator on scroll down
  if (scrollDownIndicator) {
    if (scrollY > 80) {
      scrollDownIndicator.classList.add('hidden');
    } else {
      scrollDownIndicator.classList.remove('hidden');
    }
    
    // Fade out scroll indicator near the footer to prevent layout clash
    const footerThreshold = docHeight - 140;
    if (scrollY >= footerThreshold) {
      scrollDownIndicator.classList.add('hidden');
    }
  }
});

/* -------------------------------------------------------------
   CONTACT FORM HANDLER
------------------------------------------------------------- */
const contactForm = document.getElementById('contact-form');
const formFeedback = document.getElementById('form-feedback');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;
  
  formFeedback.innerText = currentLanguage === 'en' ? 'TRANSMITTING DATA...' : 'ĐANG TRUYỀN DỮ LIỆU...';
  formFeedback.className = 'form-feedback space-mono';

  // Simulate network dispatch delay
  setTimeout(() => {
    // Validate simple parameters
    if (name && email && message) {
      formFeedback.innerText = currentLanguage === 'en' ? 'TRANSMISSION SUCCESSFUL.' : 'TRUYỀN TẢI THÀNH CÔNG.';
      formFeedback.classList.add('success');
      
      // Clean form parameters
      contactForm.reset();
    } else {
      formFeedback.innerText = currentLanguage === 'en' ? 'TRANSMISSION ERROR. FILL CORE DATA.' : 'LỖI TRUYỀN TẢI. CẦN NHẬP ĐỦ THÔNG TIN.';
      formFeedback.classList.add('error');
    }
  }, 1200);
});

/* -------------------------------------------------------------
   MATRIX TEXT SCRAMBLER DECRYPTION FX
------------------------------------------------------------- */
function scrambleElement(element) {
  // Avoid scrambling spans directly if parent contains split structures
  if (element.querySelector('.char-span')) return;
  if (element.dataset.scrambling === 'true') return;
  element.dataset.scrambling = 'true';
  
  const originalText = element.innerText;
  const scrambleChars = '01#@$%&?<>_/[]{}—=+*^';
  const duration = 600; // Duration of hover scramble effect
  const frameRate = 30;
  const totalFrames = (duration / 1000) * frameRate;
  let currentFrame = 0;
  
  const interval = setInterval(() => {
    let currentText = '';
    const progress = currentFrame / totalFrames;
    
    for (let i = 0; i < originalText.length; i++) {
      if (originalText[i] === ' ') {
        currentText += ' ';
        continue;
      }
      
      if (i / originalText.length < progress) {
        currentText += originalText[i];
      } else {
        const char = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        currentText += `<span class="scramble-char">${char}</span>`;
      }
    }
    
    element.innerHTML = currentText;
    currentFrame++;
    
    if (currentFrame > totalFrames) {
      clearInterval(interval);
      element.innerText = originalText;
      element.dataset.scrambling = 'false';
    }
  }, 1000 / frameRate);
}



/* -------------------------------------------------------------
   SPLIT CHARACTER TYPOGRAPHY SYSTEM
------------------------------------------------------------- */
function prepareSplitTexts() {
  // Target headings, descriptions, and list elements to split letters
  const splitTargets = document.querySelectorAll(
    '.hero-desc, .about-heading, .about-text, .section-subtitle, .contact-callout, .contact-description'
  );
  
  splitTargets.forEach(el => {
    const text = el.innerText;
    el.innerHTML = '';
    
    // Split text into words, then characters
    const words = text.split(' ');
    let charIdx = 0;
    
    // Detect if parent or the element itself is already revealed to skip animation transition
    const isAlreadyRevealed = el.classList.contains('revealed') || el.closest('.revealed');
    
    words.forEach((word, wordIdx) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'word-span-wrapper';
      wordSpan.style.display = 'inline-block';
      wordSpan.style.whiteSpace = 'nowrap';
      
      for (let i = 0; i < word.length; i++) {
        const charSpanWrapper = document.createElement('span');
        charSpanWrapper.className = 'char-span-wrapper';
        
        const charSpan = document.createElement('span');
        charSpan.className = 'char-span';
        if (isAlreadyRevealed) {
          charSpan.classList.add('instant');
        }
        charSpan.innerText = word[i];
        
        // Stagger letters individually only if not already revealed
        if (!isAlreadyRevealed) {
          charSpan.style.transitionDelay = `${charIdx * 0.015}s`;
        }
        
        charSpanWrapper.appendChild(charSpan);
        wordSpan.appendChild(charSpanWrapper);
        charIdx++;
      }
      
      el.appendChild(wordSpan);
      
      // Append white space between words
      if (wordIdx < words.length - 1) {
        el.appendChild(document.createTextNode(' '));
      }
    });
  });
}
// Pre-load split layout templates
prepareSplitTexts();

/* -------------------------------------------------------------
   VIEWPORT SCROLL REVEAL (INTERSECTION OBSERVER)
------------------------------------------------------------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      
      revealObserver.unobserve(entry.target); // Trigger only once
    }
  });
}, {
  threshold: 0.08,
  rootMargin: '0px 0px -50px 0px'
});

// Observe all dynamic reveals except the Hero section which reveals manually on Preloader hide
document.querySelectorAll(
  'section:not(#hero) .reveal-clip, section:not(#hero) .reveal-fade-up, .skills-card.reveal-fade-up'
).forEach(el => {
  revealObserver.observe(el);
});

// Theme Toggle supporting logic & WebGL live updating functions
function createLightGradientEnvMap() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  // Fill background with off-white/platinum
  ctx.fillStyle = '#f5f6fa';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Vibrant gradients for light mode reflection
  const grad1 = ctx.createRadialGradient(100, 80, 0, 100, 80, 150);
  grad1.addColorStop(0, 'rgba(120, 255, 0, 0.55)'); // Bright lime
  grad1.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = grad1;
  ctx.beginPath();
  ctx.arc(100, 80, 150, 0, Math.PI * 2);
  ctx.fill();
  
  const grad2 = ctx.createRadialGradient(400, 180, 0, 400, 180, 180);
  grad2.addColorStop(0, 'rgba(247, 50, 254, 0.55)'); // Hot magenta
  grad2.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = grad2;
  ctx.beginPath();
  ctx.arc(400, 180, 180, 0, Math.PI * 2);
  ctx.fill();
  
  const grad3 = ctx.createRadialGradient(250, 120, 0, 250, 120, 120);
  grad3.addColorStop(0, 'rgba(0, 200, 255, 0.5)'); // Bright cyan
  grad3.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = grad3;
  ctx.beginPath();
  ctx.arc(250, 120, 120, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return texture;
}

function updateThreeTheme(theme) {
  if (typeof THREE === 'undefined' || !renderer || !scene) return;
  if (theme === 'light') {
    // Generate light-theme gradient environment map
    const lightEnvTexture = createLightGradientEnvMap();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envMap = pmremGenerator.fromEquirectangular(lightEnvTexture).texture;
    scene.environment = envMap;
    lightEnvTexture.dispose();
    pmremGenerator.dispose();
    
    // Set target lights for smooth transition (sáng tối dần)
    if (targetAmbientColor) targetAmbientColor.setHex(0xeef0f6);
    targetDirIntensity = 3.0;
    
    updateStarColors('light');
  } else {
    // Generate dark-theme gradient environment map
    const darkEnvTexture = createGradientEnvMap();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envMap = pmremGenerator.fromEquirectangular(darkEnvTexture).texture;
    scene.environment = envMap;
    darkEnvTexture.dispose();
    pmremGenerator.dispose();
    
    // Set target lights for smooth transition (sáng tối dần)
    if (targetAmbientColor) targetAmbientColor.setHex(0x06060c);
    targetDirIntensity = 2.0;
    
    updateStarColors('dark');
  }
}

function updateStarColors(theme) {
  if (typeof THREE === 'undefined' || !starfield) return;
  const colorsAttr = starfield.geometry.attributes.color;
  const colors = colorsAttr.array;
  
  const colorsPaletteDark = [
    new THREE.Color('#c1ff12'), // lime
    new THREE.Color('#f76cfe'), // magenta
    new THREE.Color('#00f0ff'), // cyan
    new THREE.Color('#ffffff')  // white
  ];
  
  const colorsPaletteLight = [
    new THREE.Color('#6ba400'), // Darker lime
    new THREE.Color('#a81ebf'), // Darker magenta
    new THREE.Color('#008fa3'), // Darker cyan
    new THREE.Color('#030305')  // Deep dark
  ];
  
  const palette = theme === 'light' ? colorsPaletteLight : colorsPaletteDark;
  
  for (let i = 0; i < starCount; i++) {
    let col = palette[3]; // default
    if (Math.random() < 0.25) col = palette[2];
    else if (Math.random() < 0.1) col = palette[1];
    else if (Math.random() < 0.05) col = palette[0];
    
    const factor = theme === 'light' ? 0.45 : 0.38;
    colors[i * 3] = col.r * factor;
    colors[i * 3 + 1] = col.g * factor;
    colors[i * 3 + 2] = col.b * factor;
  }
  colorsAttr.needsUpdate = true;
}

// Theme Toggle Logic
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    try {
      localStorage.setItem('nh-portfolio-theme', nextTheme);
    } catch (e) {
      console.warn("localStorage is not writable:", e);
    }
    currentTheme = nextTheme;
    
    if (scene && renderer) {
      updateThreeTheme(nextTheme);
    }
  });
}

/* -------------------------------------------------------------
   INTERACTIVE SKILL TAGS KNOWLEDGE BASE
------------------------------------------------------------- */
const techDatabase = {
  "C#.NET Core": {
    category: "Backend Development",
    expertise: "Enterprise Systems",
    en: "An open-source, high-performance backend framework used to construct secure transactional systems, scalable enterprise microservices, and robust REST APIs with clean dependency injection patterns.",
    vi: "Khung phát triển mã nguồn mở hiệu năng cao dùng để xây dựng hệ thống giao dịch bảo mật, các kiến trúc microservices doanh nghiệp và các cổng REST API tin cậy kết hợp mô hình Dependency Injection.",
    docs: "https://learn.microsoft.com/en-us/dotnet/core/",
    download: "https://dotnet.microsoft.com/download"
  },
  "Java": {
    category: "Backend Development",
    expertise: "Distributed Architectures",
    en: "A robust, object-oriented language popular for building secure cross-platform enterprise software, multi-tier transactional backends, and modular server architectures (Spring Boot).",
    vi: "Ngôn ngữ hướng đối tượng mạnh mẽ chuyên dụng cho xây dựng phần mềm doanh nghiệp đa nền tảng bảo mật cao, hệ thống xử lý giao dịch nhiều lớp và kiến trúc máy chủ mô-đun (Spring Boot).",
    docs: "https://docs.oracle.com/en/java/",
    download: "https://www.oracle.com/java/technologies/downloads/"
  },
  "RESTful APIs": {
    category: "Backend Architecture",
    expertise: "Distributed Communication",
    en: "An architectural style for distributed hypermedia systems used to design clean web service interfaces with strict JSON payloads and standardized token auth protocols (JWT/OAuth2).",
    vi: "Mô hình kiến trúc cho hệ thống phân tán được dùng để thiết kế các cổng giao tiếp dịch vụ web chuẩn hóa, truyền tải dữ liệu JSON và xác thực qua giao thức Token (JWT/OAuth2).",
    docs: "https://restfulapi.net/",
    download: "https://restfulapi.net/"
  },
  "Angular SSR": {
    category: "Frontend Client",
    expertise: "Performance Optimization",
    en: "A comprehensive frontend framework that utilizes Server-Side Rendering (SSR) to compile client views on the server, drastically optimizing first load speeds and SEO indexing.",
    vi: "Khung phát triển giao diện hoàn chỉnh tích hợp cơ chế kết xuất phía máy chủ (SSR) giúp dựng trước trang web từ server, tối ưu hóa tốc độ tải trang đầu tiên và cải thiện chỉ số tìm kiếm SEO.",
    docs: "https://angular.dev/guide/ssr",
    download: "https://angular.dev/"
  },
  "Bootstrap": {
    category: "Frontend Client",
    expertise: "Responsive Layouts",
    en: "A popular open-source utility toolkit used to assemble fluid grid structures and mobile-first responsive interfaces with standardized component models.",
    vi: "Bộ công cụ mã nguồn mở phổ biến dùng để thiết kế bố cục dạng lưới linh hoạt và các giao diện responsive tương thích hoàn hảo trên mọi kích thước màn hình di động.",
    docs: "https://getbootstrap.com/docs/5.3/getting-started/introduction/",
    download: "https://getbootstrap.com/"
  },
  "TailwindCSS": {
    category: "Frontend Client",
    expertise: "Modern UI Design",
    en: "A utility-first CSS framework designed to construct highly customizable responsive styles, bespoke design tokens, and high-fidelity interactive elements without leaving the HTML markup.",
    vi: "Khung thiết kế CSS dạng utility-first giúp tùy biến giao diện nhanh chóng, xây dựng các token thiết kế riêng biệt và các thành phần tương tác cao cấp trực tiếp trong mã nguồn HTML.",
    docs: "https://tailwindcss.com/docs",
    download: "https://tailwindcss.com/"
  },
  "Git & GitHub Flow": {
    category: "Version Control",
    expertise: "DevOps & Collaboration",
    en: "A distributed version control network and branch management strategy used to coordinate source files, track code revisions, and automate continuous peer review processes.",
    vi: "Mạng lưới quản lý phiên bản phân tán và quy trình phân nhánh giúp quản lý tệp tin nguồn, theo dõi lịch sử chỉnh sửa mã nguồn và tự động hóa đánh giá đóng góp code.",
    docs: "https://docs.github.com/en",
    download: "https://git-scm.com/downloads"
  },
  "Oracle Database": {
    category: "Database Engines",
    expertise: "Enterprise OLTP",
    en: "A premium multi-model relational database management system designed for heavy transaction processing, complex PL/SQL scripting, and large-scale enterprise data warehousing.",
    vi: "Hệ quản trị cơ sở dữ liệu quan hệ cao cấp thiết kế cho xử lý các giao dịch lớn, lập trình PL/SQL chuyên sâu và lưu trữ kho dữ liệu doanh nghiệp quy mô lớn.",
    docs: "https://docs.oracle.com/en/database/oracle/oracle-database/",
    download: "https://www.oracle.com/database/technologies/"
  },
  "SQL Server": {
    category: "Database Engines",
    expertise: "Transactional Systems",
    en: "A robust enterprise relational database engine engineered by Microsoft, supporting secure relational transactions (ACID), advanced T-SQL structures, and active server clusters.",
    vi: "Hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ của Microsoft, hỗ trợ xử lý giao dịch an toàn (ACID), các cấu trúc T-SQL nâng cao và liên kết cụm máy chủ hoạt động liên tục.",
    docs: "https://learn.microsoft.com/en-us/sql/sql-server/",
    download: "https://www.microsoft.com/sql-server/sql-server-downloads"
  },
  "NoSQL Database": {
    category: "Database Engines",
    expertise: "Big Data & Schemaless",
    en: "A non-relational database structure optimized for handling unstructured big data, dynamic schemas, horizontal scale, and distributed key-value/document datasets (e.g. MongoDB).",
    vi: "Kiến trúc dữ liệu phi quan hệ được tối ưu hóa để quản lý dữ liệu lớn phi cấu trúc, sơ đồ dữ liệu động, mở rộng theo chiều ngang và lưu trữ dạng tài liệu (như MongoDB).",
    docs: "https://www.mongodb.com/docs/",
    download: "https://www.mongodb.com/try/download/community"
  },
  "Redis Cache": {
    category: "Caching System",
    expertise: "In-Memory Speed",
    en: "An open-source, in-memory key-value data structure store used to cache highly frequent queries, store user session tokens, and optimize query roundtrip performance.",
    vi: "Hệ thống lưu trữ cấu trúc dữ liệu in-memory dạng key-value dùng để làm bộ nhớ đệm cho các truy vấn lặp lại nhiều lần, quản lý Session Token và tối ưu tốc độ phản hồi.",
    docs: "https://redis.io/docs/latest/",
    download: "https://redis.io/downloads/"
  },
  "Elasticsearch": {
    category: "Search Engine",
    expertise: "Full-Text Analytics",
    en: "A distributed, JSON-based search and analytics engine used to perform lightning-fast full-text fuzzy searching, real-time logging discovery, and complex analytical filtering.",
    vi: "Hệ thống phân tích và tìm kiếm phân tán dựa trên định dạng JSON dùng để thực hiện các truy vấn tìm kiếm mờ (Fuzzy) siêu tốc, phân tích log thời gian thực và lọc dữ liệu.",
    docs: "https://www.elastic.co/docs",
    download: "https://www.elastic.co/downloads/elasticsearch"
  },
  "Docker": {
    category: "DevOps & Containers",
    expertise: "Microservice Packaging",
    en: "An open platform for developing, shipping, and running applications inside isolated containers, standardizing execution packages, and eliminating local deployment issues.",
    vi: "Nền tảng mở để phát triển và vận hành ứng dụng trong các container cô lập, chuẩn hóa gói thực thi phần mềm và loại bỏ hoàn toàn các lỗi khác biệt môi trường.",
    docs: "https://docs.docker.com/",
    download: "https://www.docker.com/products/docker-desktop/"
  },
  "Kubernetes": {
    category: "DevOps & Orchestration",
    expertise: "Cluster Scale",
    en: "An open-source container orchestration engine used to automate declarative deployment configurations, handle scaling, monitor health, and coordinate server pods.",
    vi: "Hệ thống điều phối container mã nguồn mở giúp tự động hóa triển khai cấu hình, quản lý tải mở rộng, giám sát trạng thái và điều hành các nhóm máy chủ (pod).",
    docs: "https://kubernetes.io/docs/home/",
    download: "https://kubernetes.io/releases/"
  },
  "CI/CD Pipelines": {
    category: "Automation Systems",
    expertise: "Continuous Integration",
    en: "An automated software integration strategy that triggers dynamic unit test suits, code analysis checkers, and pushes validated container packages to staging environments.",
    vi: "Quy trình tự động hóa tích hợp phần mềm giúp kích hoạt các bộ kiểm thử tự động, phân tích mã nguồn và tự động triển khai phần mềm an toàn lên máy chủ đích.",
    docs: "https://docs.github.com/en/actions/automating-builds-and-tests/about-continuous-integration",
    download: "https://github.com/features/actions"
  },
  "Redis Caching": {
    category: "Optimization Strategy",
    expertise: "Query Acceleration",
    en: "High-performance data storage methods optimized for in-memory acceleration, managing invalidation mechanisms, sliding TTL timeouts, and read-through caching structures.",
    vi: "Phương thức lưu trữ dữ liệu hiệu năng cao tối ưu tốc độ truy xuất in-memory, quản lý cơ chế giải phóng bộ đệm tự động, giới hạn thời gian TTL và cấu hình cache read-through.",
    docs: "https://redis.io/docs/latest/develop/use/",
    download: "https://redis.io/downloads/"
  },
  "Load Balancing": {
    category: "Infrastructure",
    expertise: "Traffic Distribution",
    en: "High-efficiency network proxy routing used to distribute incoming client traffic across multiple backend nodes, securing high availability and horizontal scaling.",
    vi: "Giải pháp điều phối lưu lượng mạng giúp phân bổ yêu cầu truy cập của người dùng đến nhiều máy chủ dịch vụ khác nhau, nâng cao tính sẵn sàng và khả năng mở rộng.",
    docs: "https://docs.nginx.com/nginx/admin-guide/load-balancer/",
    download: "https://nginx.org/en/download.html"
  },
  "Database Tuning": {
    category: "Optimization Strategy",
    expertise: "Query Execution Plans",
    en: "Advanced database server refactoring strategies designed to partition large datasets, rewrite slow relational procedures, optimize execution plans, and tune connection pools.",
    vi: "Các chiến lược tối ưu hóa cơ sở dữ liệu chuyên sâu giúp phân vùng dữ liệu lớn, tinh chỉnh các thủ tục quan hệ chậm, tối ưu hóa sơ đồ thực thi và kết nối hồ chứa (Pool).",
    docs: "https://learn.microsoft.com/en-us/sql/relational-databases/performance/tune-database",
    download: "https://learn.microsoft.com/en-us/sql/tools/sql-server-profiler-utility"
  },
  "PyTorch": {
    category: "Artificial Intelligence",
    expertise: "Deep Learning Research",
    en: "A flexible deep learning tensor library used to program neural network topologies (CNNs, Transformers), validate dataset features, and build dynamic execution graphs.",
    vi: "Thư viện học sâu linh hoạt dạng tensor dùng để lập trình kiến trúc mạng nơ-ron học sâu (CNN, Transformer), đánh giá dữ liệu và xây dựng đồ thị tính toán động.",
    docs: "https://pytorch.org/docs/stable/index.html",
    download: "https://pytorch.org/get-started/locally/"
  },
  "TensorFlow": {
    category: "Artificial Intelligence",
    expertise: "Model Deployment",
    en: "An end-to-end open-source machine learning ecosystem optimized to deploy deep neural networks, exports production-ready formats, and compile mobile TFLite graphs.",
    vi: "Hệ sinh thái học máy mã nguồn mở toàn diện được tối ưu hóa để triển khai mạng nơ-ron học sâu, xuất bản trọng số sản phẩm và biên dịch mô hình dạng TFLite cho di động.",
    docs: "https://www.tensorflow.org/api_docs",
    download: "https://www.tensorflow.org/install"
  },
  "Model Training": {
    category: "Artificial Intelligence",
    expertise: "Training Supervision",
    en: "Supervised algorithmic training processes designed to tune network weights, optimize loss computations, manage custom checkpoints, and distribute workloads across GPUs.",
    vi: "Quy trình huấn luyện mô hình có giám sát dùng để tinh chỉnh trọng số mạng nơ-ron, tối ưu hóa các hàm loss, quản lý tệp lưu giữ và phân bổ tài nguyên tính toán GPU.",
    docs: "https://developers.google.com/machine-learning/crash-course",
    download: "https://colab.research.google.com/"
  },
  "Optimization": {
    category: "Artificial Intelligence",
    expertise: "Inference Optimization",
    en: "Post-training neural network compression methods used to quantize weights, prune connections, and optimize models to run fast on resource-constrained devices.",
    vi: "Phương pháp nén mô hình mạng nơ-ron sau huấn luyện dùng để lượng tử hóa trọng số, cắt tỉa kết nối dư thừa và tối ưu hóa để chạy siêu tốc trên phần cứng biên hạn chế.",
    docs: "https://www.tensorflow.org/model_optimization",
    download: "https://github.com/tensorflow/model-optimization"
  },
  "Object Detection": {
    category: "Computer Vision",
    expertise: "Real-time Detection",
    en: "Deep computer vision models (e.g. YOLO, SSD) configured to identify spatial coordinates of specific targets, localize boxes, and label categories in real-time video streams.",
    vi: "Các mô hình thị giác máy tính học sâu (như YOLO, SSD) dùng để nhận diện tọa độ không gian của vật thể, khoanh vùng khung giới hạn và gán nhãn trong luồng video.",
    docs: "https://docs.ultralytics.com/",
    download: "https://github.com/ultralytics/ultralytics"
  },
  "Computer Vision": {
    category: "Computer Vision",
    expertise: "Image Analytics",
    en: "Algorithmic image transformation frameworks used to process matrix pixel values, filter noise gradients, compute features, and convert spatial color representations (OpenCV).",
    vi: "Hệ thống biến đổi hình ảnh thuật toán dùng để xử lý ma trận điểm ảnh pixel, khử nhiễu đồ thị, trích xuất đặc trưng và chuyển đổi không gian màu sắc (OpenCV).",
    docs: "https://docs.opencv.org/4.x/",
    download: "https://opencv.org/releases/"
  },
  "Text Analysis": {
    category: "Natural Language",
    expertise: "Semantic Discovery",
    en: "Natural language processing pipelines optimized to tokenize textual feeds, extract semantic features, compute classification vectors, and analyze sentiment values.",
    vi: "Chuỗi xử lý ngôn ngữ tự nhiên tối ưu để tách từ khóa văn bản (tokenization), trích xuất đặc trưng ngữ nghĩa, tính toán vector phân loại và phân tích cảm xúc.",
    docs: "https://www.nltk.org/",
    download: "https://www.nltk.org/install.html"
  },
  "NLP & LLMs": {
    category: "Natural Language",
    expertise: "Generative Systems",
    en: "Generative generative model configurations designed to query semantic databases, connect dense vector indexes (Chroma/Pinecone), and execute Retrieval-Augmented Generation (RAG).",
    vi: "Các cấu trúc mô hình ngôn ngữ lớn tạo sinh được thiết kế để truy vấn cơ sở dữ liệu ngữ nghĩa, kết nối vector index (Chroma/Pinecone) và vận hành cơ chế RAG.",
    docs: "https://python.langchain.com/docs/introduction/",
    download: "https://github.com/langchain-ai/langchain"
  },
  "LLM APIs": {
    category: "AI Integration",
    expertise: "Cognitive Automation",
    en: "Cognitive generative model integration services designed to construct system prompt templates, manage context memories, parse outputs, and parse AI representations.",
    vi: "Dịch vụ tích hợp mô hình tạo sinh trí tuệ nhân tạo được thiết kế để xây dựng Prompt hệ thống, quản lý bộ nhớ ngữ cảnh, phân tích dữ liệu trả về và đồng bộ hóa Agent.",
    docs: "https://ai.google.dev/gemini-api/docs",
    download: "https://github.com/google-gemini/generative-ai-js"
  },
  "AI Agents": {
    category: "AI Integration",
    expertise: "Autonomous Workflows",
    en: "Autonomous multi-agent system workflows designed to link language reasoning layers with external functional tool executors, config memory states, and iterate feedback loops.",
    vi: "Hệ thống quy trình đa tác vụ Agent tự hành thiết kế để kết nối khả năng lập luận của mô hình ngôn ngữ với các công cụ hành động ngoại vi và cấu hình bộ nhớ.",
    docs: "https://python.langchain.com/docs/tutorials/agents/",
    download: "https://github.com/langchain-ai/langchain"
  }
};

/* -------------------------------------------------------------
   INTERACTIVE SKILL TAGS INFO MODAL
------------------------------------------------------------- */
const techModal = document.getElementById('tech-modal');
const modalTitle = document.getElementById('tech-modal-title');
const modalDescription = document.getElementById('tech-modal-description');
const modalCategory = document.getElementById('tech-modal-category');
const modalExpertise = document.getElementById('tech-modal-expertise');
const modalDocLink = document.getElementById('tech-modal-doc-link');
const modalDownloadLink = document.getElementById('tech-modal-download-link');
const modalClose = document.querySelector('.tech-modal-close');
const modalOverlay = document.querySelector('.tech-modal-overlay');

// Open modal on tag click
document.body.addEventListener('click', (e) => {
  const skillTag = e.target.closest('.skill-tag');
  if (!skillTag) return;
  
  const tagName = skillTag.querySelector('.tag-name').innerText.trim();
  const techData = techDatabase[tagName];
  
  if (techData) {
    modalTitle.innerText = tagName;
    modalCategory.innerText = techData.category.toUpperCase();
    modalExpertise.innerText = techData.expertise.toUpperCase();
    
    // Set bilingual descriptions
    modalDescription.innerText = currentLanguage === 'vi' ? techData.vi : techData.en;
    
    // Set dynamic button translation values
    const docTextSpan = modalDocLink.querySelector('.btn-text');
    const downloadTextSpan = modalDownloadLink.querySelector('.btn-text');
    if (docTextSpan) {
      docTextSpan.innerText = currentLanguage === 'vi' ? docTextSpan.dataset.vi : docTextSpan.dataset.en;
    }
    if (downloadTextSpan) {
      downloadTextSpan.innerText = currentLanguage === 'vi' ? downloadTextSpan.dataset.vi : downloadTextSpan.dataset.en;
    }
    
    modalDocLink.href = techData.docs;
    modalDownloadLink.href = techData.download;
    
    // Add active animation trigger class
    techModal.style.display = 'flex';
    setTimeout(() => {
      techModal.classList.add('active');
    }, 10);
  }
});

// Close modal function
function closeTechModal() {
  if (!techModal) return;
  techModal.classList.remove('active');
  setTimeout(() => {
    techModal.style.display = 'none';
  }, 400);
}

if (modalClose) {
  modalClose.addEventListener('click', closeTechModal);
}
if (modalOverlay) {
  modalOverlay.addEventListener('click', closeTechModal);
}
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && techModal && techModal.classList.contains('active')) {
    closeTechModal();
  }
});

// Hook into translation runner to refresh open modal descriptions and AI Chatbot elements
const originalTranslatePage = translatePage;
translatePage = function(lang) {
  originalTranslatePage(lang);
  if (techModal && techModal.classList.contains('active')) {
    const activeTagName = modalTitle.innerText.trim();
    const techData = techDatabase[activeTagName];
    if (techData) {
      modalDescription.innerText = lang === 'vi' ? techData.vi : techData.en;
      
      const docTextSpan = modalDocLink.querySelector('.btn-text');
      const downloadTextSpan = modalDownloadLink.querySelector('.btn-text');
      if (docTextSpan) {
        docTextSpan.innerText = lang === 'vi' ? docTextSpan.dataset.vi : docTextSpan.dataset.en;
      }
      if (downloadTextSpan) {
        downloadTextSpan.innerText = lang === 'vi' ? downloadTextSpan.dataset.vi : downloadTextSpan.dataset.en;
      }
    }
  }
  
  // Translate AI Chat elements dynamically
  const triggerText = document.querySelector('.ai-chat-trigger-text');
  if (triggerText) {
    triggerText.innerText = lang === 'vi' ? triggerText.dataset.vi : triggerText.dataset.en;
  }
  const greetingMessage = document.querySelector('.bot-message .ai-message-content');
  if (greetingMessage) {
    greetingMessage.innerText = lang === 'vi' ? greetingMessage.dataset.vi : greetingMessage.dataset.en;
  }
  const chips = document.querySelectorAll('.ai-suggestion-chip');
  chips.forEach(chip => {
    chip.innerText = lang === 'vi' ? chip.dataset.vi : chip.dataset.en;
  });
  const chatInput = document.getElementById('ai-chat-input');
  if (chatInput) {
    chatInput.placeholder = lang === 'vi' ? 'Nhập tin nhắn...' : 'Type message...';
  }
};

/* -------------------------------------------------------------
   AI CHAT ASSISTANT CONVERSATIONAL LOGIC
------------------------------------------------------------- */
const chatTrigger = document.getElementById('ai-chat-trigger');
const chatWindow = document.getElementById('ai-chat-window');
const chatClose = document.getElementById('ai-chat-close');
const chatMessages = document.getElementById('ai-chat-messages');
const chatInput = document.getElementById('ai-chat-input');
const chatForm = document.getElementById('ai-chat-form');

// Toggle chat window open/close
if (chatTrigger) {
  chatTrigger.addEventListener('click', () => {
    chatWindow.style.display = 'flex';
    setTimeout(() => {
      chatWindow.classList.toggle('active');
    }, 10);
  });
}

if (chatClose) {
  chatClose.addEventListener('click', () => {
    chatWindow.classList.remove('active');
    setTimeout(() => {
      chatWindow.style.display = 'none';
    }, 400);
  });
}

// Append new message bubble
function appendMessage(sender, text, isGreeting = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `ai-message ${sender}-message`;
  
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const meta = document.createElement('div');
  meta.className = 'ai-message-meta space-mono';
  meta.innerText = sender === 'bot' ? `BOT // SYSTEM_OK` : `USER // ${time}`;
  
  const content = document.createElement('div');
  content.className = 'ai-message-content';
  content.innerText = text;
  
  messageDiv.appendChild(meta);
  messageDiv.appendChild(content);
  chatMessages.appendChild(messageDiv);
  
  // Auto-scroll physics
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Suggestion chip bindings
document.addEventListener('click', (e) => {
  const chip = e.target.closest('.ai-suggestion-chip');
  if (!chip) return;
  
  const text = currentLanguage === 'vi' ? chip.dataset.vi : chip.dataset.en;
  handleUserSubmit(text);
});

// Direct form submission
if (chatForm) {
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    
    chatInput.value = '';
    handleUserSubmit(text);
  });
}

// Local smart keyword matcher (Fallback keyless mode)
function queryLocalIntent(text) {
  const query = text.toLowerCase();
  
  // 1. Skills intent
  if (query.includes('skill') || query.includes('kỹ năng') || query.includes('công nghệ') || query.includes('học gì') || query.includes('biết gì')) {
    return {
      en: "I have engineered strong capabilities in AI & Full-Stack Development:\n\n- **Artificial Intelligence**: PyTorch, TensorFlow, Computer Vision, YOLO Object Detection, Text Analysis, NLP & LLMs, Autonomous AI Agents.\n- **Backend Development**: C#.NET Core, Java, Spring Boot, RESTful APIs, microservices architectures.\n- **Frontend Client**: Angular SSR, Bootstrap, TailwindCSS.\n- **DevOps & Data**: Oracle Database, SQL Server, MongoDB NoSQL, Redis Cache, Elasticsearch, Docker containers, Kubernetes orchestrator, GitLab CI/CD automation pipelines.",
      vi: "Tôi sở hữu kinh nghiệm thực tế về AI & Lập trình Full-Stack:\n\n- **Trí tuệ nhân tạo**: PyTorch, TensorFlow, Thị giác máy tính, YOLO Object Detection, Phân tích văn bản, NLP & LLMs, Tác tử AI tự hành (AI Agents).\n- **Lập trình ứng dụng (Backend)**: C#.NET Core, Java, Spring Boot, RESTful APIs, kiến trúc microservices.\n- **Giao diện người dùng (Frontend)**: Angular SSR, Bootstrap, TailwindCSS.\n- **Dữ liệu & DevOps**: Cơ sở dữ liệu Oracle, SQL Server, MongoDB NoSQL, Redis Cache, Elasticsearch, Docker container, Kubernetes, GitLab CI/CD pipelines."
    };
  }
  
  // 2. Contact intent
  if (query.includes('contact') || query.includes('liên hệ') || query.includes('email') || query.includes('sđt') || query.includes('điện thoại') || query.includes('mạng xã hội') || query.includes('github')) {
    return {
      en: "You can connect and collaborate with me directly via:\n\n- **Email**: namhoai.ai@gmail.com\n- **Location**: Hanoi, Vietnam\n- **GitHub**: github.com/hndzgit\n\nFeel free to submit a quick message via the Contact Form at the bottom of the page!",
      vi: "Bạn có thể kết nối và hợp tác với tôi nhanh chóng qua các cổng sau:\n\n- **Email**: namhoai.ai@gmail.com\n- **Vị trí**: Hà Nội, Việt Nam\n- **GitHub**: github.com/hndzgit\n\nBạn cũng có thể gửi lời nhắn trực tiếp qua Biểu mẫu liên hệ (Contact Form) ở cuối trang này nhé!"
    };
  }
  
  // 3. Experience intent
  if (query.includes('experience') || query.includes('kinh nghiệm') || query.includes('lịch sử') || query.includes('timeline') || query.includes('quá trình') || query.includes('học ở đâu') || query.includes('trường nào')) {
    return {
      en: "My academic and industrial experience timeline:\n\n- **2022 — Mid 2025**: AI Student (High School) & Tech Enthusiast. Researched basic artificial intelligence, mathematical algos, neural networks, and self-studied Python, JavaScript, and databases.\n- **Mid 2025 — Present**: AI University Student & Enterprise Developer. Pursuing my university degree in AI while building high-performance automation gateways, full-stack microservices, and secure databases in real corporate environments.",
      vi: "Hành trình chuyên môn của tôi:\n\n- **2022 — Giữa 2025**: Học sinh đam mê Tin học & AI. Tập trung nghiên cứu nền tảng AI, tư duy thuật toán, mô hình học máy, mạng nơ-ron cơ bản, tự học lập trình Python, JavaScript và cơ sở dữ liệu.\n- **Giữa 2025 — Hiện tại**: Sinh viên & Lập trình viên AI doanh nghiệp. Theo học Đại học chuyên ngành Trí tuệ Nhân tạo song song làm việc thực tế tại doanh nghiệp, thiết kế cổng tự động hóa, microservices full-stack và cơ sở dữ liệu tin cậy."
    };
  }
  
  // 4. Projects intent
  if (query.includes('project') || query.includes('dự án') || query.includes('sản phẩm') || query.includes('làm gì') || query.includes('banking') || query.includes('data warehouse')) {
    return {
      en: "I have engineered several high-performance enterprise systems:\n\n1. **Enterprise Banking Microservices** (Spring Boot, .NET Core microservices, JWT/OAuth2 secure transaction gateway).\n2. **Real-Time Data Warehouse Pipeline** (Automated ETL, corporate Data Lake, dynamic Power BI dashboards).\n3. **DevOps CI/CD Cloud Gateway** (Docker packaging, Kubernetes clusters, GitLab CI/CD zero-downtime updates).\n\nBrowse my Projects section on this page to view comprehensive descriptions!",
      vi: "Tôi đã phát triển nhiều sản phẩm và hệ thống doanh nghiệp tiêu biểu:\n\n1. **Microservices Ngân hàng Doanh nghiệp** (Spring Boot, .NET Core microservices, cổng xác thực giao dịch JWT/OAuth2).\n2. **Luồng phân tích Data Warehouse Real-Time** (ETL tự động, Data Lake tập trung, báo cáo phân tích Power BI trực quan).\n3. **Hạ tầng tự động hóa DevOps CI/CD** (Đóng gói container Docker, cụm điều phối Kubernetes, luồng tích hợp GitLab CI/CD).\n\nBạn có thể đọc chi tiết các tính năng tại mục Dự Án trên trang nhé!"
    };
  }
  
  // 5. Biography intent
  if (query.includes('introduce') || query.includes('giới thiệu') || query.includes('who is') || query.includes('là ai') || query.includes('hoài nam') || query.includes('nam hoài')) {
    return {
      en: "I am a dedicated **AI Engineer & Full-Stack Developer** based in Hanoi, Vietnam. I view technology as a medium for cognitive automation, combining self-taught AI research foundations with deep academic university studies and hands-on enterprise execution. I design solutions that adapt, think, and perform at scale.",
      vi: "Tôi là một **Kỹ sư AI & Lập trình viên Full-Stack** tại Hà Nội, Việt Nam. Tôi định nghĩa công nghệ là công cụ tự động hóa nhận thức, kết hợp xuất sắc nền tảng tự học AI thời học sinh cùng chương trình đại học hiện tại và thực tế doanh nghiệp để kiến tạo các sản phẩm bền bỉ, thích ứng ở quy mô lớn."
    };
  }
  
  // 6. Default fallback
  return null;
}

// Live Gemini API Web Client
async function callGeminiAPI(userMessage) {
  const systemPrompt = `You are the professional, friendly, and highly intelligent AI Portfolio Assistant representing Nam Hoai. Nam Hoai's portfolio site domain is: namth.id.vn.
Here are the official verified facts about Nam Hoai:
- Role: AI Engineer & Full-Stack Developer based in Hanoi, Vietnam.
- Core philosophy: Views technology as a medium for cognitive automation.
- Current Status (Mid 2025 - Present): University Student majoring in Artificial Intelligence while concurrently working as an Enterprise Developer building robust software integrations.
- Past Status (2022 - Mid 2025): Dedicated AI-focused High School Student. Self-taught core algorithms, machine learning, neural networks, Python, JS, and databases.
- Skills: C#.NET Core, Java, Spring Boot, RESTful APIs, Angular SSR, Bootstrap, TailwindCSS, Git, Oracle Database, SQL Server, NoSQL, Redis Cache, Elasticsearch, Docker, Kubernetes, CI/CD Pipelines, PyTorch, TensorFlow, Computer Vision, YOLO Object Detection, Text Analysis, NLP & LLMs, autonomous AI Agents, Gemini API.
- Email: namhoai.ai@gmail.com.
- GitHub: github.com/hndzgit.

INSTRUCTIONS:
1. Always respond politely, objectively, and concisely in the same language as the user's message (English or Vietnamese).
2. Answer questions accurately based ONLY on the verified facts above. If asked about facts not listed (like hobbies, personal secrets, unrelated topics), politely decline to answer, keeping the focus on Nam Hoai's portfolio, AI background, and skills.
3. Respond in the first-person ('I' / 'Tôi' / 'mình') representing yourself as Nam Hoai himself (or his direct personal portfolio agent). Keep the tone professional, friendly, and objective, as if Nam Hoai is speaking directly to a guest.
4. Keep replies under 2-3 paragraphs. Formulate them with clean, readable spacing. Never make up facts.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemPrompt}\n\nUser query: ${userMessage}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 600
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API HTTP error: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text.trim();
    } else {
      throw new Error("Invalid response envelope structure from Gemini.");
    }
  } catch (err) {
    console.error("Gemini API invocation failure:", err);
    return null;
  }
}

// Typing loader element
function appendTypingIndicator() {
  const loader = document.createElement('div');
  loader.className = 'ai-message bot-message typing-indicator-wrapper';
  loader.id = 'ai-typing-indicator';
  
  const meta = document.createElement('div');
  meta.className = 'ai-message-meta space-mono';
  meta.innerText = 'BOT // DECRYPTING...';
  
  const content = document.createElement('div');
  content.className = 'ai-message-content';
  
  const dots = document.createElement('div');
  dots.className = 'typing-indicator';
  dots.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
  
  content.appendChild(dots);
  loader.appendChild(meta);
  loader.appendChild(content);
  chatMessages.appendChild(loader);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
  const loader = document.getElementById('ai-typing-indicator');
  if (loader) {
    loader.remove();
  }
}

// Universal submit dispatcher
async function handleUserSubmit(userText) {
  // Append user bubble
  appendMessage('user', userText);
  
  // Show typing loader
  appendTypingIndicator();
  
  // Add artificial organic typing delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // 1. Check if Gemini Live Mode is active
  if (GEMINI_API_KEY && GEMINI_API_KEY.trim() !== "") {
    const aiResponse = await callGeminiAPI(userText);
    removeTypingIndicator();
    if (aiResponse) {
      appendMessage('bot', aiResponse);
      return;
    }
  }
  
  // 2. Fallback to Local Smart Intent Matching
  const localMatch = queryLocalIntent(userText);
  removeTypingIndicator();
  if (localMatch) {
    const reply = currentLanguage === 'vi' ? localMatch.vi : localMatch.en;
    appendMessage('bot', reply);
  } else {
    // Standard fallback instructions
    const fallbackText = currentLanguage === 'vi' 
      ? "Tôi chưa hiểu ý của bạn. (Sau khi bạn dán API Key Gemini của mình vào đầu file main.js, tôi sẽ trả lời trôi chảy mọi câu hỏi sáng tạo!). Hiện tại, bạn có thể thử nhấp vào các gợi ý nhanh bên dưới hoặc hỏi các từ khóa như: 'kỹ năng', 'dự án', 'kinh nghiệm', 'liên hệ' nhé!"
      : "I'm not sure about that. (Once your Gemini API key is pasted in main.js, I will be able to answer any custom queries dynamically!). For now, try clicking the quick suggestions below or asking about: 'skills', 'projects', 'experience', or 'contact'!";
    appendMessage('bot', fallbackText);
  }
}

/* -------------------------------------------------------------
   MOBILE NAVIGATION DRAWER TRIGGER EVENT HANDLING
------------------------------------------------------------- */
const menuToggle = document.getElementById('menu-toggle');
const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

if (menuToggle && mobileNavDrawer) {
  // Toggle mobile drawer
  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    menuToggle.classList.toggle('open');
    mobileNavDrawer.classList.toggle('open');
    document.body.classList.toggle('mobile-menu-open');
  });

  // Close mobile drawer when clicking a link
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('open');
      mobileNavDrawer.classList.remove('open');
      document.body.classList.remove('mobile-menu-open');
    });
  });

  // Close drawer if clicking outside the drawer
  document.addEventListener('click', (e) => {
    if (mobileNavDrawer.classList.contains('open') && 
        !mobileNavDrawer.contains(e.target) && 
        !menuToggle.contains(e.target)) {
      menuToggle.classList.remove('open');
      mobileNavDrawer.classList.remove('open');
      document.body.classList.remove('mobile-menu-open');
    }
  });
}

