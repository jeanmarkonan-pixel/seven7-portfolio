// ============================================================================
// Scène 3D de l'intro : arche dans les nuages (rendu Three.js volumétrique,
// palette bleu indigo nocturne + arche bordeaux). Entièrement indépendante
// de la scène principale (src/main.js) — son propre renderer, sa propre
// boucle, qu'on arrête et libère une fois l'intro terminée.
// ============================================================================

import * as THREE from 'three';

const CLOUD_COLOR = 0x2e4a8a;
const CLOUD_HIGHLIGHT = 0x9fb8e8;
const ARCH_COLOR = 0x7a1527;
const ARCH_COLOR_DARK = 0x58101c;
const DOOR_COLOR = 0x120a0e;
const GOLD = 0xe8c170;

/**
 * Génère une texture de dégradé vertical (utilisée comme fond de ciel).
 */
function createSkyTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, '#0a1436');
  gradient.addColorStop(0.45, '#1c2f66');
  gradient.addColorStop(1, '#2d4a8f');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 2, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Génère la texture de l'enseigne néon (texte + lueur douce) via canvas 2D,
 * appliquée sur un matériau non-éclairé pour un rendu "lumineux" sans
 * pipeline de post-traitement (bloom).
 */
function createSignTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 92px Georgia, serif';

  ctx.shadowColor = '#ffcf6b';
  ctx.shadowBlur = 40;
  ctx.fillStyle = '#ffe9a8';
  ctx.fillText('ATELIER', canvas.width / 2, 95);

  ctx.shadowBlur = 25;
  ctx.font = '600 46px Georgia, serif';
  ctx.fillStyle = '#ffdf99';
  ctx.fillText('MÉTAMORPHOSE', canvas.width / 2, 185);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Crée un amas de nuage : plusieurs sphères basse-poly superposées avec un
 * léger décalage aléatoire, pour un volume "duveteux" sans shader complexe.
 */
function createCloudCluster(material, baseScale) {
  const group = new THREE.Group();
  const puffCount = 6 + Math.floor(Math.random() * 4);

  for (let i = 0; i < puffCount; i++) {
    const radius = baseScale * (0.5 + Math.random() * 0.6);
    const geometry = new THREE.IcosahedronGeometry(radius, 1);
    const puff = new THREE.Mesh(geometry, material);
    puff.position.set(
      (Math.random() - 0.5) * baseScale * 1.8,
      (Math.random() - 0.3) * baseScale * 0.7,
      (Math.random() - 0.5) * baseScale * 1.2
    );
    puff.castShadow = false;
    group.add(puff);
  }

  return group;
}

function buildArch(scene) {
  const archGroup = new THREE.Group();

  const pillarMaterial = new THREE.MeshStandardMaterial({
    color: ARCH_COLOR,
    roughness: 0.85,
    metalness: 0.05,
  });

  // Piliers verticaux de l'arche.
  const pillarGeometry = new THREE.BoxGeometry(0.5, 3, 0.5);
  const pillarLeft = new THREE.Mesh(pillarGeometry, pillarMaterial);
  pillarLeft.position.set(-1.3, 1.5, 0);
  const pillarRight = pillarLeft.clone();
  pillarRight.position.x = 1.3;
  archGroup.add(pillarLeft, pillarRight);

  // Voûte arrondie (demi-tore) reliant les deux piliers.
  const archCurveMaterial = new THREE.MeshStandardMaterial({
    color: ARCH_COLOR_DARK,
    roughness: 0.85,
    metalness: 0.05,
  });
  const archCurve = new THREE.Mesh(
    new THREE.TorusGeometry(1.3, 0.28, 16, 32, Math.PI),
    archCurveMaterial
  );
  archCurve.rotation.z = Math.PI;
  archCurve.position.set(0, 3, 0);
  archGroup.add(archCurve);

  // Fond sombre de la porte (l'ouverture).
  const doorway = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 3),
    new THREE.MeshStandardMaterial({ color: DOOR_COLOR, roughness: 1 })
  );
  doorway.position.set(0, 1.5, -0.05);
  archGroup.add(doorway);

  // Battant entrouvert (un seul, comme sur la référence).
  const doorMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a1620,
    roughness: 0.6,
    metalness: 0.1,
  });
  const doorGeometry = new THREE.BoxGeometry(1.05, 2.9, 0.06);
  doorGeometry.translate(0.52, 0, 0); // pivot ramené sur le bord gauche (charnière)
  const doorLeaf = new THREE.Mesh(doorGeometry, doorMaterial);
  doorLeaf.position.set(-1.3, 1.5, 0); // charnière alignée sur le pilier gauche
  doorLeaf.rotation.y = -0.55; // entrouverte
  archGroup.add(doorLeaf);

  // Poignée dorée verticale.
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 1.1, 8),
    new THREE.MeshStandardMaterial({ color: GOLD, roughness: 0.3, metalness: 0.8, emissive: 0x442a00 })
  );
  handle.position.set(0.85, 0, 0.08); // près du bord libre du battant, en coordonnées locales
  doorLeaf.add(handle);

  // Enseigne néon au-dessus de l'arche.
  const signTexture = createSignTexture();
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 0.65),
    new THREE.MeshBasicMaterial({ map: signTexture, transparent: true })
  );
  sign.position.set(0, 3.85, 0.1);
  archGroup.add(sign);

  // Marches menant à l'arche.
  const stepMaterial = new THREE.MeshStandardMaterial({ color: ARCH_COLOR, roughness: 0.9 });
  for (let i = 0; i < 5; i++) {
    const width = 3.4 - i * 0.35;
    const step = new THREE.Mesh(new THREE.BoxGeometry(width, 0.18, 0.55), stepMaterial);
    step.position.set(0, -0.1 - i * 0.18, 1.6 - i * 0.5);
    archGroup.add(step);
  }

  scene.add(archGroup);
  return { archGroup, doorLeaf };
}

export function createSplashScene(canvas) {
  const scene = new THREE.Scene();
  scene.background = createSkyTexture();

  const camera = new THREE.PerspectiveCamera(
    45,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 2, 7);
  camera.lookAt(0, 2, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  // Ambiance nocturne : lumière de lune froide sur les nuages, contre-jour
  // bleuté, et une lueur chaude qui semble jaillir de la porte entrouverte.
  scene.add(new THREE.AmbientLight(0x4a5fa8, 0.55));
  const moonLight = new THREE.DirectionalLight(0xaebfff, 1.1);
  moonLight.position.set(-3, 6, 4);
  scene.add(moonLight);
  const rimLight = new THREE.DirectionalLight(0x6f8fd9, 0.7);
  rimLight.position.set(4, 3, -3);
  scene.add(rimLight);
  const doorGlow = new THREE.PointLight(0xffb066, 2.2, 6, 2);
  doorGlow.position.set(0, 1.6, 0.5);
  scene.add(doorGlow);

  const { archGroup, doorLeaf } = buildArch(scene);

  // Amas de nuages disposés autour de l'arche et au sol.
  const cloudMaterial = new THREE.MeshStandardMaterial({
    color: CLOUD_COLOR,
    roughness: 1,
    metalness: 0,
    emissive: CLOUD_HIGHLIGHT,
    emissiveIntensity: 0.08,
  });

  const cloudPositions = [
    [-3.2, 0, 1.5, 1.6],
    [3.2, 0, 1.5, 1.6],
    [-2.6, 0.6, -0.5, 1.3],
    [2.6, 0.6, -0.5, 1.3],
    [-4.2, -0.3, 3, 1.8],
    [4.2, -0.3, 3, 1.8],
    [0, -0.6, 4.5, 1.4],
    [-1.8, 1.6, -1.5, 1],
    [1.8, 1.6, -1.5, 1],
  ];

  const clouds = cloudPositions.map(([x, y, z, scale]) => {
    const cluster = createCloudCluster(cloudMaterial, scale);
    cluster.position.set(x, y, z);
    scene.add(cluster);
    return cluster;
  });

  let animationId = null;
  const clock = new THREE.Clock();

  function renderFrame() {
    const t = clock.getElapsedTime();
    // Léger flottement des nuages pour éviter un rendu figé.
    clouds.forEach((cluster, i) => {
      cluster.position.y += Math.sin(t * 0.4 + i) * 0.0015;
    });
    renderer.render(scene, camera);
    animationId = requestAnimationFrame(renderFrame);
  }

  function start() {
    if (animationId === null) {
      renderFrame();
    }
  }

  function stop() {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  function resize() {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  }

  /**
   * Ouvre le battant en grand puis fait avancer la caméra à travers l'arche
   * (effet "travelling avant"). Appelle `onComplete` une fois terminé.
   */
  function playEnterAnimation(onComplete) {
    const durationMs = 2200;
    const start = performance.now();
    const doorStartRotation = doorLeaf.rotation.y;
    const doorEndRotation = -1.9;
    const cameraStart = camera.position.clone();
    const cameraEnd = new THREE.Vector3(0, 2, -1.5);

    function step(now) {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;

      doorLeaf.rotation.y = doorStartRotation + (doorEndRotation - doorStartRotation) * eased;
      camera.position.lerpVectors(cameraStart, cameraEnd, eased);
      camera.lookAt(0, 2, -3);

      if (t < 1) {
        requestAnimationFrame(step);
      } else if (onComplete) {
        onComplete();
      }
    }

    requestAnimationFrame(step);
  }

  function dispose() {
    stop();
    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((m) => m.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    renderer.dispose();
  }

  return { start, stop, resize, playEnterAnimation, dispose };
}
