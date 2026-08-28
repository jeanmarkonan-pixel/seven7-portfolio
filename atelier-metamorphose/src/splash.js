// ============================================================================
// Porte Paradisiaque — séquence d'accueil plein écran. Indépendant de la
// scène Three.js et du catalogue : ne gère que l'ouverture/fermeture de
// l'overlay et le verrouillage du scroll pendant l'intro.
// ============================================================================

const SESSION_KEY = 'atelier-splash-seen';

const splash = document.querySelector('#paradise-splash');
const enterButton = document.querySelector('#enter-atelier');
const skipButton = document.querySelector('#skip-intro');

// Durée de l'animation d'ouverture des portes (doit correspondre à la
// transition CSS de .door-leaf) avant de masquer complètement l'overlay.
const DOOR_OPEN_DURATION_MS = 1400;
const FADE_OUT_DURATION_MS = 600;

function lockBodyScroll() {
  document.body.classList.add('splash-active');
}

function unlockBodyScroll() {
  document.body.classList.remove('splash-active');
}

function hideSplash() {
  splash.classList.add('is-hidden');
  unlockBodyScroll();
  setTimeout(() => {
    splash.hidden = true;
  }, FADE_OUT_DURATION_MS);
}

function openDoorsAndReveal() {
  sessionStorage.setItem(SESSION_KEY, 'true');
  splash.classList.add('is-open');
  setTimeout(hideSplash, DOOR_OPEN_DURATION_MS);
}

function skipIntro() {
  sessionStorage.setItem(SESSION_KEY, 'true');
  hideSplash();
}

if (sessionStorage.getItem(SESSION_KEY)) {
  // Déjà vue pendant cette session : on n'affiche pas la porte du tout.
  splash.hidden = true;
} else {
  lockBodyScroll();
  enterButton.addEventListener('click', openDoorsAndReveal);
  skipButton.addEventListener('click', skipIntro);
}
