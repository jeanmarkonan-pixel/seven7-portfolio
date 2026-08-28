// ============================================================================
// ATELIER // MÉTAMORPHOSE — Phase 1 : Rendu WebGPU + boutique 3D temps réel
// Décor "Brutalisme Organique" : monolithe de béton brut + tissu suspendu
// dont l'ondulation est pilotée en direct par le slider #wind-slider.
// ============================================================================

import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// ----------------------------------------------------------------------------
// 1. RÉFÉRENCES DOM
// ----------------------------------------------------------------------------

const canvas = document.querySelector('#canvas-metamorphose');
const windSlider = document.querySelector('#wind-slider');

// La force du vent est lue en continu dans la boucle d'animation : on la
// stocke dans une variable module plutôt que de recréer un listener à chaque
// frame.
let windForce = parseFloat(windSlider.value);
windSlider.addEventListener('input', (event) => {
  windForce = parseFloat(event.target.value);
});

// ----------------------------------------------------------------------------
// 2. SCÈNE, CAMÉRA, RENDERER
// ----------------------------------------------------------------------------

const scene = new THREE.Scene();
// Brouillard froid léger pour donner de la profondeur au décor brutaliste,
// dans la continuité de l'ambiance "météo pluvieuse".
scene.fog = new THREE.Fog(0x0a0c10, 8, 30);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(4, 2.5, 7);

// WebGPURenderer : rendu moderne avec repli automatique sur WebGL2 si le
// navigateur ne supporte pas WebGPU (géré nativement par three.js via
// l'option `forceWebGL`/détection interne du backend).
const renderer = new WebGPURenderer({
  canvas,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x0a0c10, 1);

// Ombres portées fortes, activées explicitement (désactivées par défaut).
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Tonemapping filmique pour un rendu PBR plus contrasté / cinématographique.
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

// Le WebGPURenderer initialise son contexte de façon asynchrone.
await renderer.init();

// ----------------------------------------------------------------------------
// 3. CONTRÔLES ORBITAUX
// ----------------------------------------------------------------------------

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.2, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 3;
controls.maxDistance = 15;
// On limite l'angle vertical pour ne pas passer sous le sol brutaliste.
controls.maxPolarAngle = Math.PI / 2 - 0.02;
controls.update();

// ----------------------------------------------------------------------------
// 4. LUMIÈRES DRAMATIQUES — ambiance froide, pluvieuse
// ----------------------------------------------------------------------------

// Lumière d'ambiance très faible et bleutée : on garde des noirs profonds,
// typiques du brutalisme, sans zones totalement éteintes.
const ambientLight = new THREE.AmbientLight(0x2a3550, 0.35);
scene.add(ambientLight);

// Lumière directionnelle principale : froide, dure, ombres portées marquées
// (simule un ciel gris/pluvieux traversant les nuages).
const keyLight = new THREE.DirectionalLight(0x9fb8ff, 3.2);
keyLight.position.set(5, 8, 3);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.near = 1;
keyLight.shadow.camera.far = 25;
keyLight.shadow.camera.left = -8;
keyLight.shadow.camera.right = 8;
keyLight.shadow.camera.top = 8;
keyLight.shadow.camera.bottom = -8;
keyLight.shadow.bias = -0.0015;
keyLight.shadow.radius = 4; // adoucit légèrement le contour des ombres dures
scene.add(keyLight);

// Contre-lumière froide, plus faible, pour détacher le tissu du monolithe.
const rimLight = new THREE.DirectionalLight(0x5b7fff, 1.2);
rimLight.position.set(-6, 4, -4);
scene.add(rimLight);

// ----------------------------------------------------------------------------
// 5. SOL BRUTALISTE — béton sombre, très rugueux, non réfléchissant
// ----------------------------------------------------------------------------

const groundGeometry = new THREE.PlaneGeometry(40, 40);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x121316,
  roughness: 0.95,
  metalness: 0.05,
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// ----------------------------------------------------------------------------
// 6. MONOLITHE CENTRAL — bloc de béton brut, arêtes franches
// ----------------------------------------------------------------------------

const monolithGeometry = new THREE.BoxGeometry(1.6, 3.2, 1.6);
const monolithMaterial = new THREE.MeshStandardMaterial({
  color: 0x3a3a3c,
  roughness: 0.9,
  metalness: 0.0,
});
const monolith = new THREE.Mesh(monolithGeometry, monolithMaterial);
monolith.position.set(-2.4, 1.6, -1.5);
monolith.castShadow = true;
monolith.receiveShadow = true;
scene.add(monolith);

// ----------------------------------------------------------------------------
// 7. GRILLE DE TISSU SUSPENDUE — ondulation pilotée par le vent
// ----------------------------------------------------------------------------

const CLOTH_WIDTH = 2.2;
const CLOTH_HEIGHT = 3;
const CLOTH_SEGMENTS_X = 48;
const CLOTH_SEGMENTS_Y = 64;

const clothGeometry = new THREE.PlaneGeometry(
  CLOTH_WIDTH,
  CLOTH_HEIGHT,
  CLOTH_SEGMENTS_X,
  CLOTH_SEGMENTS_Y
);

const clothMaterial = new THREE.MeshStandardMaterial({
  color: 0xe0e0e0,
  side: THREE.DoubleSide,
  roughness: 0.7,
  metalness: 0.0,
  flatShading: false,
});

const cloth = new THREE.Mesh(clothGeometry, clothMaterial);
cloth.position.set(0.6, 2.6, 0.3);
cloth.castShadow = true;
cloth.receiveShadow = true;
scene.add(cloth);

// Bruit pseudo-aléatoire (hash trigonométrique) : source de micro-turbulences
// naturelles pour le vent, sans dépendance externe.
function noise2D(x, y) {
  return (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123) % 1;
}

// Bruit adouci par interpolation bilinéaire + lissage (smoothstep) entre les
// 4 sommets de la grille de bruit, pour éviter les saccades du hash brut.
function smoothNoise(x, y) {
  const x0 = Math.floor(x);
  const x1 = x0 + 1;
  const y0 = Math.floor(y);
  const y1 = y0 + 1;

  const fractX = x - x0;
  const fractY = y - y0;
  const tX = fractX * fractX * (3.0 - 2.0 * fractX);
  const tY = fractY * fractY * (3.0 - 2.0 * fractY);

  const v0 = noise2D(x0, y0);
  const v1 = noise2D(x1, y0);
  const v2 = noise2D(x0, y1);
  const v3 = noise2D(x1, y1);

  const i1 = v0 + tX * (v1 - v0);
  const i2 = v2 + tX * (v3 - v2);
  return i1 + tY * (i2 - i1);
}

/**
 * Anime la grille de tissu : rafale principale (sinus) combinée à des
 * micro-turbulences (bruit adouci) pour un mouvement de vent naturel et
 * chaotique. Amplitude et vitesse dépendent de `windForce` (slider HTML).
 * Seul l'axe Z (profondeur) est animé ; X/Y restent ceux de la grille.
 */
function updateCloth(elapsedTime) {
  const positionAttribute = clothGeometry.attributes.position;

  for (let i = 0; i < positionAttribute.count; i++) {
    const x = positionAttribute.getX(i);
    const y = positionAttribute.getY(i);

    // Le tissu est ancré en haut (bord suspendu) : plus on descend, plus il
    // flotte librement.
    const freedomFactor = (CLOTH_HEIGHT / 2 - y) * 0.4;

    const mainWave = Math.sin(x * 1.5 + elapsedTime * (2.0 * windForce)) * 0.15;
    const turbulence = smoothNoise(x * 3.0 + elapsedTime, y * 3.0) * 0.08;

    const zAnim = (mainWave + turbulence) * windForce * freedomFactor;
    positionAttribute.setZ(i, zAnim);
  }

  positionAttribute.needsUpdate = true;
  clothGeometry.computeVertexNormals();
}

// ----------------------------------------------------------------------------
// 8. REDIMENSIONNEMENT RESPONSIVE
// ----------------------------------------------------------------------------

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ----------------------------------------------------------------------------
// 9. BOUCLE D'ANIMATION
// ----------------------------------------------------------------------------

const clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
  const elapsedTime = clock.getElapsedTime();

  updateCloth(elapsedTime);
  controls.update();

  renderer.render(scene, camera);
});
