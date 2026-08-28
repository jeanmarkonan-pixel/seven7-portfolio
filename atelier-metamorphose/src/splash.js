// ============================================================================
// Arche Céleste — orchestration de l'intro CSS : déclenche l'ouverture de la
// porte après un court délai, puis masque l'overlay pour laisser place au
// site (scène principale Three.js gérée séparément par src/main.js).
// ============================================================================

const SESSION_KEY = 'atelier-splash-seen';

const splash = document.querySelector('#paradise-splash');
const skipButton = document.querySelector('#skip-intro');

const AUTO_START_DELAY_MS = 700; // avant que la porte ne commence à s'ouvrir
const DOOR_OPEN_DURATION_MS = 1800; // doit correspondre à la transition CSS .door-inner-panel
const FADE_OUT_DURATION_MS = 600;

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
      splash.classList.add('is-opening');
      timers.push(setTimeout(finishSplash, DOOR_OPEN_DURATION_MS));
    }, AUTO_START_DELAY_MS)
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
