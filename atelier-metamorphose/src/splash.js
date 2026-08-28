// ============================================================================
// Arche Céleste — séquence d'accueil auto-jouée (porte + escalier dans les
// nuages). Indépendant de la scène Three.js et du catalogue : ne gère que
// la timeline de l'intro et le verrouillage du scroll pendant celle-ci.
// ============================================================================

const SESSION_KEY = 'atelier-splash-seen';

const splash = document.querySelector('#paradise-splash');
const skipButton = document.querySelector('#skip-intro');

// Timeline (ms) — doit correspondre aux transitions CSS de .door-leaf,
// .splash-light-beam et .splash-scene.is-zooming.
const AUTO_START_DELAY_MS = 1000; // avant que les portes ne s'ouvrent seules
const DOOR_OPEN_DURATION_MS = 1300; // durée de rotation des battants
const ZOOM_DURATION_MS = 950; // durée du "travelling avant" à travers l'arche
const FADE_OUT_DURATION_MS = 400;

let timers = [];

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

function playIntro() {
  sessionStorage.setItem(SESSION_KEY, 'true');
  lockBodyScroll();

  timers.push(
    setTimeout(() => {
      splash.classList.add('is-open'); // ouverture des portes + faisceau lumineux
    }, AUTO_START_DELAY_MS)
  );

  timers.push(
    setTimeout(() => {
      splash.classList.add('is-zooming'); // travelling avant à travers l'arche
    }, AUTO_START_DELAY_MS + DOOR_OPEN_DURATION_MS)
  );

  timers.push(
    setTimeout(finishSplash, AUTO_START_DELAY_MS + DOOR_OPEN_DURATION_MS + ZOOM_DURATION_MS)
  );
}

function skipIntro() {
  sessionStorage.setItem(SESSION_KEY, 'true');
  finishSplash();
}

if (sessionStorage.getItem(SESSION_KEY)) {
  // Déjà vue pendant cette session : on n'affiche pas l'intro du tout.
  splash.hidden = true;
} else {
  skipButton.addEventListener('click', skipIntro);
  playIntro();
}
