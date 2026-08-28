// ============================================================================
// Scène 3D de l'intro : arche bordeaux dans une nébuleuse bleue, rendu
// Three.js (arche extrudée, porte entrouverte, nuages volumétriques en
// dodécaèdres, parallaxe à la souris). Entièrement indépendante de la scène
// principale (src/main.js) — son propre renderer, sa propre boucle, qu'on
// arrête et libère une fois l'intro terminée.
// ============================================================================

import * as THREE from 'three';

const BURGUNDY = 0x6b1839;
const GOLD = 0xdfa132;
const CLOUD_COLOR = 0x185bb5;
const NEON_GOLD = 0xffcc00;
const BLUE_LIGHT = 0x2b7fff;

function buildArch() {
  const group = new THREE.Group();
  const burgundyMat = new THREE.MeshStandardMaterial({ color: BURGUNDY, roughness: 0.4, metalness: 0.1 });
  const goldMat = new THREE.MeshStandardMaterial({ color: GOLD, roughness: 0.2, metalness: 0.8 });

  // Cadre de l'arche : silhouette extrudée (voûte arrondie + montants droits).
  const archShape = new THREE.Shape();
  archShape.absarc(0, 1.5, 1.2, 0, Math.PI, false);
  archShape.lineTo(-1.2, -1.5);
  archShape.lineTo(1.2, -1.5);
  archShape.lineTo(1.2, 1.5);
  const archGeo = new THREE.ExtrudeGeometry(archShape, {
    depth: 0.4,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 3,
  });
  const archMesh = new THREE.Mesh(archGeo, burgundyMat);
  archMesh.position.z = -0.2;
  group.add(archMesh);

  // Panneau lumineux derrière la porte (suggère l'intérieur éclairé).
  const innerBack = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 3),
    new THREE.MeshBasicMaterial({ color: 0xffe6d0 })
  );
  innerBack.position.set(0, 1.2, -0.3);
  group.add(innerBack);

  // Battant entrouvert + poignée dorée.
  const doorMesh = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.4, 0.08), burgundyMat);
  doorMesh.position.set(0.5, 1.1, 0);
  doorMesh.rotation.y = -Math.PI / 4;
  group.add(doorMesh);

  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3), goldMat);
  handle.position.set(0.1, 1.1, 0.08);
  doorMesh.add(handle);

  // Escalier menant à l'arche.
  for (let i = 0; i < 5; i++) {
    const width = 2.6 + i * 0.3;
    const step = new THREE.Mesh(new THREE.BoxGeometry(width, 0.18, 0.4), burgundyMat);
    step.position.set(0, -0.2 - i * 0.18, 0.2 + i * 0.25);
    group.add(step);
  }

  return { group, doorMesh };
}

function buildClouds() {
  const cloudGeo = new THREE.DodecahedronGeometry(0.6, 2);
  const cloudMat = new THREE.MeshStandardMaterial({
    color: CLOUD_COLOR,
    roughness: 0.9,
    flatShading: true,
    transparent: true,
    opacity: 0.85,
  });

  const clouds = [];
  for (let i = 0; i < 90; i++) {
    const cloud = new THREE.Mesh(cloudGeo, cloudMat);
    const side = Math.random() > 0.5 ? 1 : -1;
    cloud.position.set(
      (1.8 + Math.random() * 2.5) * side,
      -0.5 + Math.random() * 3.5,
      -1 + Math.random() * 3
    );
    const scale = 1 + Math.random() * 1.8;
    cloud.scale.set(scale, scale, scale);
    cloud.rotation.z = Math.random() * Math.PI * 2;
    clouds.push(cloud);
  }

  return clouds;
}

export function createSplashScene(canvas) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06152e, 0.015);

  const camera = new THREE.PerspectiveCamera(
    45,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1.2, 8);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene.add(new THREE.AmbientLight(0x1a3866, 1.2));
  const neonLight = new THREE.PointLight(NEON_GOLD, 2.5, 5);
  neonLight.position.set(0, 1.8, 0.2);
  scene.add(neonLight);
  const blueLight = new THREE.DirectionalLight(BLUE_LIGHT, 2.0);
  blueLight.position.set(-5, 5, 4);
  scene.add(blueLight);

  const { group: archGroup, doorMesh } = buildArch();
  scene.add(archGroup);

  const clouds = buildClouds();
  clouds.forEach((cloud) => scene.add(cloud));

  let mouseX = 0;
  let mouseY = 0;
  let introPlaying = false;

  function handleMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth - 0.5) * 0.3;
    mouseY = (event.clientY / window.innerHeight - 0.5) * 0.3;
  }
  window.addEventListener('mousemove', handleMouseMove);

  let animationId = null;

  function renderFrame() {
    if (!introPlaying) {
      // Léger parallaxe caméra piloté par la souris tant que l'intro
      // n'est pas en train de jouer son animation d'ouverture.
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY + 1.2 - camera.position.y) * 0.05;
      camera.lookAt(0, 1, 0);
    }
    clouds.forEach((cloud) => {
      cloud.rotation.z += 0.001;
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
    introPlaying = true;
    const durationMs = 2200;
    const start = performance.now();
    const doorStartRotation = doorMesh.rotation.y;
    const doorEndRotation = -Math.PI / 1.7;
    const cameraStart = camera.position.clone();
    const cameraEnd = new THREE.Vector3(0, 1.4, -1.2);

    function step(now) {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;

      doorMesh.rotation.y = doorStartRotation + (doorEndRotation - doorStartRotation) * eased;
      camera.position.lerpVectors(cameraStart, cameraEnd, eased);
      camera.lookAt(0, 1.3, -2);

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
    window.removeEventListener('mousemove', handleMouseMove);
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
