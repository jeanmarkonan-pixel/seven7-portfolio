// ============================================================================
// Arche Céleste — orchestration de l'intro : image plein écran (voir
// public/door-intro.png), zoom immersif à travers la porte déclenché
// automatiquement après un court délai ou au clic/tap, puis fondu vers le
// site (scène principale Three.js gérée séparément par src/main.js).
// ============================================================================

const SESSION_KEY = 'atelier-splash-seen';

const splash = document.querySelector('#paradise-splash');
const skipButton = document.querySelector('#skip-intro');
const stage = document.querySelector('#splash-stage');

const AUTO_OPEN_DELAY_MS = 1800; // avant que le zoom ne se déclenche seul (laisse le temps de voir la scène)
const ZOOM_DURATION_MS = 2400; // doit correspondre à la transition CSS .splash-stage
const FADE_OUT_DURATION_MS = 600;

let timers = [];
let hasOpened = false;

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
  }, FADE_OUT_DURATION_MS);
}

function openPortal() {
  if (hasOpened) return;
  hasOpened = true;
  clearTimers();
  splash.classList.add('is-opening');
  timers.push(setTimeout(finishSplash, ZOOM_DURATION_MS));
}

function skipIntro() {
  sessionStorage.setItem(SESSION_KEY, 'true');
  finishSplash();
}

function playIntro() {
  sessionStorage.setItem(SESSION_KEY, 'true');
  lockBodyScroll();

  stage.addEventListener('click', openPortal);
  timers.push(setTimeout(openPortal, AUTO_OPEN_DELAY_MS));
}

if (sessionStorage.getItem(SESSION_KEY)) {
  // Déjà vue pendant cette session : on n'affiche pas l'intro du tout.
  splash.hidden = true;
} else {
  skipButton.addEventListener('click', skipIntro);
  playIntro();
}
