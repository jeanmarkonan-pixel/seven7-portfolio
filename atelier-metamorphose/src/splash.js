// ============================================================================
// Arche Céleste — orchestration de l'intro : initialise la scène 3D dédiée
// (src/splash-scene.js), joue l'animation d'ouverture après un court délai,
// puis masque l'overlay et libère les ressources GPU de cette scène pour
// laisser la scène principale (src/main.js) prendre le relais.
// ============================================================================

import { createSplashScene } from './splash-scene.js';

const SESSION_KEY = 'atelier-splash-seen';

const splash = document.querySelector('#paradise-splash');
const skipButton = document.querySelector('#skip-intro');
const splashCanvas = document.querySelector('#canvas-splash');

const AUTO_START_DELAY_MS = 900; // avant que l'animation d'ouverture ne se déclenche seule
const FADE_OUT_DURATION_MS = 500;

let timers = [];
let scene = null;

function clearTimers() {
  timers.forEach((id) => clearTimeout(id));
  timers = [];
}

function lockBodyScroll() {
  document.body.classList.add('splash-active');
}

function unlockBodyScroll() {
  document.body.classList.remove('splash-active');
}

function finishSplash() {
  clearTimers();
  splash.classList.add('is-hidden');
  unlockBodyScroll();
  setTimeout(() => {
    splash.hidden = true;
    if (scene) {
      scene.dispose(); // libère la scène 3D de l'intro, plus jamais rejouée
      scene = null;
    }
  }, FADE_OUT_DURATION_MS);
}

function playIntro() {
  sessionStorage.setItem(SESSION_KEY, 'true');
  lockBodyScroll();

  scene = createSplashScene(splashCanvas);
  scene.start();

  window.addEventListener('resize', handleResize);

  timers.push(
    setTimeout(() => {
      scene.playEnterAnimation(() => {
        finishSplash();
      });
    }, AUTO_START_DELAY_MS)
  );
}

function handleResize() {
  if (scene) scene.resize();
}

function skipIntro() {
  sessionStorage.setItem(SESSION_KEY, 'true');
  window.removeEventListener('resize', handleResize);
  finishSplash();
}

if (sessionStorage.getItem(SESSION_KEY)) {
  // Déjà vue pendant cette session : on n'affiche pas l'intro du tout.
  splash.hidden = true;
} else {
  skipButton.addEventListener('click', skipIntro);
  playIntro();
}
