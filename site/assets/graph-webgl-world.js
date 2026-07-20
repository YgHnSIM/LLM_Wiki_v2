import * as THREE from 'three';
import { edgeDirectionForNode, focusBurstLayout, labelIsExposed } from './graph-3d-math.js';

const UP = new THREE.Vector3(0, 1, 0);
const ORBIT_MIN_ELEVATION = 0.08;
const ORBIT_MAX_ELEVATION = Math.PI * 0.47;
const MIN_FOV = 42;
const MAX_FOV = 92;
const DEFAULT_FOV = 62;
const EPSILON = 1e-5;

const clamp = (minimum, maximum, value) => Math.min(maximum, Math.max(minimum, value));

function finite(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function stableHash(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function asIdSet(value) {
  if (value instanceof Set) return new Set(value);
  if (!value) return new Set();
  const items = Array.isArray(value) ? value : typeof value[Symbol.iterator] === 'function' ? [...value] : [];
  return new Set(items.map((item) => typeof item === 'object' ? item?.id : item).filter(Boolean));
}

function safeColor(value, fallback) {
  try {
    return new THREE.Color(value || fallback);
  } catch {
    return new THREE.Color(fallback);
  }
}

function normalizeMode(value, fallback = 'orbit') {
  const candidate = String(value ?? '').toLocaleLowerCase('en').replaceAll('_', '-');
  if (['first-person', 'firstperson', 'fps', 'flight', 'fly'].includes(candidate)) return 'first-person';
  if (['orbit', 'atlas', 'travel', 'map'].includes(candidate)) return 'orbit';
  return fallback;
}

function normalizedKey(value) {
  const key = String(value ?? '').toLocaleLowerCase('en');
  if (key === ' ' || key === 'spacebar' || key === 'space') return 'space';
  if (key === 'control' || key === 'controlleft' || key === 'controlright') return 'ctrl';
  if (key === 'shiftleft' || key === 'shiftright') return 'shift';
  if (key.startsWith('key') && key.length === 4) return key.slice(3);
  return key;
}

function relationKinds(edge) {
  if (Array.isArray(edge?.kinds)) return edge.kinds;
  return edge?.kind ? [edge.kind] : [];
}

function createGlowTexture(documentRef) {
  const textureCanvas = documentRef.createElement('canvas');
  textureCanvas.width = 128;
  textureCanvas.height = 128;
  const context = textureCanvas.getContext('2d');
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.14, 'rgba(255,255,255,.82)');
  gradient.addColorStop(0.42, 'rgba(255,255,255,.2)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function disposeMaterial(material, disposed) {
  for (const item of Array.isArray(material) ? material : [material]) {
    if (!item || disposed.has(item)) continue;
    disposed.add(item);
    for (const value of Object.values(item)) {
      if (value?.isTexture && !disposed.has(value)) {
        disposed.add(value);
        value.dispose();
      }
    }
    item.dispose();
  }
}

/**
 * Build the WebGL knowledge-world renderer around an existing canvas.
 * The DOM controller remains responsible for HUD state and forwarding input.
 */
export function createKnowledgeWorld(canvas, options = {}) {
  if (!canvas || typeof canvas.getContext !== 'function') {
    throw new TypeError('createKnowledgeWorld requires a canvas element.');
  }

  const data = options.data;
  if (
    !data
    || !Array.isArray(data.nodes)
    || !Array.isArray(data.edges)
    || !Array.isArray(data.communities)
    || !Number.isFinite(data.dimensions?.width)
    || !Number.isFinite(data.dimensions?.height)
    || !Number.isFinite(data.dimensions?.depth)
  ) {
    throw new TypeError('Knowledge-world data has an unsupported shape.');
  }

  const documentRef = canvas.ownerDocument;
  const windowRef = documentRef.defaultView;
  let topLevelDocument = false;
  try {
    topLevelDocument = windowRef?.top === windowRef;
  } catch {
    topLevelDocument = false;
  }
  const permissionsPolicy = documentRef.permissionsPolicy ?? documentRef.featurePolicy;
  let pointerLockAllowedByPolicy = true;
  try {
    if (typeof permissionsPolicy?.allowsFeature === 'function') {
      pointerLockAllowedByPolicy = permissionsPolicy.allowsFeature('pointer-lock');
    } else if (typeof permissionsPolicy?.allowedFeatures === 'function') {
      pointerLockAllowedByPolicy = permissionsPolicy.allowedFeatures().includes('pointer-lock');
    }
  } catch {
    pointerLockAllowedByPolicy = false;
  }
  const pointerLockAvailable = topLevelDocument
    && pointerLockAllowedByPolicy
    && typeof canvas.requestPointerLock === 'function';
  canvas.dataset.pointerLock = pointerLockAvailable ? 'available' : 'unavailable';
  canvas.dataset.focusState = 'idle';
  canvas.dataset.focusNeighbors = '0';
  canvas.dataset.focusTension = '0';
  const reducedMotion = Boolean(options.reducedMotion);
  const dimensions = {
    width: Math.max(1, finite(data.dimensions.width, 1)),
    height: Math.max(1, finite(data.dimensions.height, 1)),
    depth: Math.max(1, finite(data.dimensions.depth, 1)),
  };
  const worldDiagonal = Math.hypot(dimensions.width, dimensions.height, dimensions.depth * 1.35);
  const baseFlightSpeed = clamp(80, 720, worldDiagonal * 0.038);
  const nodeById = new Map(data.nodes.map((node) => [node.id, node]));
  const communityById = new Map(data.communities.map((community) => [community.id, community]));
  const layoutIds = new Set((data.layouts ?? []).map((layout) => layout?.id).filter(Boolean));
  const defaultLayout = layoutIds.has(data.defaultLayout)
    ? data.defaultLayout
    : layoutIds.has('community') ? 'community' : [...layoutIds][0] ?? 'community';
  const normalizeLayout = (value, fallback = defaultLayout) => (
    layoutIds.has(String(value ?? '')) ? String(value) : fallback
  );

  const paletteInput = options.palette ?? {};
  const palette = {
    world: safeColor(paletteInput.world, '#11120f'),
    worldInk: safeColor(paletteInput.worldInk, '#f3ecd8'),
    worldMuted: safeColor(paletteInput.worldMuted, '#9f987c'),
    paper: safeColor(paletteInput.paper, '#e8e0c0'),
    paperLight: safeColor(paletteInput.paperLight, '#f3ecd8'),
    pink: safeColor(paletteInput.pink, '#ff006e'),
    cyan: safeColor(paletteInput.cyan, '#00ffcc'),
    blue: safeColor(paletteInput.blue, '#2449ff'),
    yellow: safeColor(paletteInput.yellow, '#f4d64d'),
  };
  const suppliedCommunityColors = paletteInput.communities ?? paletteInput.communityColors ?? [];
  const communityColors = data.communities.map((community, index) => {
    const supplied = suppliedCommunityColors[index] ?? suppliedCommunityColors[community.colorIndex];
    if (supplied) return safeColor(supplied, '#ff006e');
    return new THREE.Color().setHSL((index * 0.61803398875 + 0.94) % 1, 0.78, 0.58);
  });

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    depth: true,
    stencil: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false,
    failIfMajorPerformanceCaveat: false,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.setClearColor(palette.world, 1);
  renderer.shadowMap.enabled = false;

  const scene = new THREE.Scene();
  scene.background = palette.world.clone();
  scene.fog = new THREE.FogExp2(palette.world, clamp(0.000035, 0.0012, 1.05 / worldDiagonal));

  const camera = new THREE.PerspectiveCamera(
    DEFAULT_FOV,
    Math.max(1, canvas.clientWidth) / Math.max(1, canvas.clientHeight),
    Math.max(0.4, worldDiagonal / 18000),
    worldDiagonal * 8,
  );
  camera.up.copy(UP);
  let pointerLocked = false;

  const worldRoot = new THREE.Group();
  worldRoot.name = 'knowledge-world';
  scene.add(worldRoot);

  const communityRoot = new THREE.Group();
  communityRoot.name = 'knowledge-communities';
  const edgeRoot = new THREE.Group();
  edgeRoot.name = 'knowledge-edges';
  const nodeRoot = new THREE.Group();
  nodeRoot.name = 'knowledge-nodes';
  const labelRoot = new THREE.Group();
  labelRoot.name = 'knowledge-labels';
  const atmosphereRoot = new THREE.Group();
  atmosphereRoot.name = 'knowledge-atmosphere';
  worldRoot.add(communityRoot, edgeRoot, nodeRoot, labelRoot, atmosphereRoot);

  const hemisphere = new THREE.HemisphereLight(palette.worldInk, palette.world, 1.28);
  scene.add(hemisphere);
  const ambient = new THREE.AmbientLight(palette.worldInk, 0.48);
  scene.add(ambient);
  const keyLight = new THREE.DirectionalLight(palette.paperLight, 2.05);
  keyLight.position.set(-dimensions.width * 0.24, dimensions.depth * 2.4, dimensions.height * 0.2);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(palette.cyan, 0.72);
  rimLight.position.set(dimensions.width * 0.3, dimensions.depth * 1.15, -dimensions.height * 0.34);
  scene.add(rimLight);

  const gridSize = Math.max(dimensions.width, dimensions.height) * 1.34;
  const grid = new THREE.GridHelper(
    gridSize,
    clamp(28, 96, Math.round(gridSize / 90)),
    palette.worldMuted,
    palette.worldMuted,
  );
  grid.position.y = -4;
  const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
  for (const material of gridMaterials) {
    material.transparent = true;
    material.opacity = 0.13;
    material.depthWrite = false;
  }
  atmosphereRoot.add(grid);

  const glowTexture = createGlowTexture(documentRef);
  const geometries = {
    concept: new THREE.IcosahedronGeometry(1, 2),
    source: new THREE.BoxGeometry(1.55, 1.55, 1.55, 1, 1, 1),
    reference: new THREE.BoxGeometry(1.55, 1.55, 1.55, 1, 1, 1),
    entity: new THREE.OctahedronGeometry(1.3, 0),
    analysis: new THREE.CylinderGeometry(1.02, 1.02, 1.92, 6, 1, false),
    default: new THREE.IcosahedronGeometry(1, 1),
    beam: new THREE.CylinderGeometry(1, 1, 1, 6, 1, true),
    arrow: new THREE.ConeGeometry(1, 1, 7, 1, false),
    ring: new THREE.TorusGeometry(1.35, 0.075, 7, 40),
  };

  const paperLightDirection = new THREE.Vector3(-0.42, 0.78, 0.46).normalize();
  for (const key of ['concept', 'source', 'reference', 'entity', 'analysis', 'default']) {
    const geometry = geometries[key];
    const normals = geometry.getAttribute('normal');
    if (!normals) continue;
    const colors = new Float32Array(normals.count * 3);
    const normal = new THREE.Vector3();
    for (let index = 0; index < normals.count; index += 1) {
      normal.fromBufferAttribute(normals, index).normalize();
      const light = 0.42 + Math.max(0, normal.dot(paperLightDirection)) * 0.58;
      colors[index * 3] = light;
      colors[index * 3 + 1] = light * 0.96;
      colors[index * 3 + 2] = light * 0.86;
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }
  for (const key of ['beam', 'arrow', 'ring']) {
    const geometry = geometries[key];
    const positions = geometry.getAttribute('position');
    if (!positions) continue;
    const colors = new Float32Array(positions.count * 3);
    colors.fill(1);
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }

  const materials = {
    verified: new THREE.MeshBasicMaterial({
      color: 0xffffff,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    }),
    partial: new THREE.MeshBasicMaterial({
      color: 0xffffff,
      vertexColors: true,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    }),
    disputed: new THREE.MeshBasicMaterial({
      color: 0xffffff,
      vertexColors: true,
      transparent: true,
      opacity: 0.86,
      depthWrite: false,
    }),
    unverified: new THREE.MeshBasicMaterial({
      color: 0xffffff,
      vertexColors: true,
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
    }),
    core: new THREE.MeshBasicMaterial({
      color: 0xffffff,
      vertexColors: true,
      transparent: true,
      opacity: 0.68,
      blending: THREE.NormalBlending,
      depthWrite: false,
      toneMapped: false,
    }),
    shellPartial: new THREE.MeshBasicMaterial({
      color: 0xffffff,
      vertexColors: true,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    }),
    shellDisputed: new THREE.MeshBasicMaterial({
      color: 0xffffff,
      vertexColors: true,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
      blending: THREE.NormalBlending,
      depthWrite: false,
    }),
    shellUnverified: new THREE.MeshBasicMaterial({
      color: 0xffffff,
      vertexColors: true,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
      blending: THREE.NormalBlending,
      depthWrite: false,
    }),
    aura: new THREE.MeshBasicMaterial({
      color: 0xffffff,
      vertexColors: true,
      side: THREE.DoubleSide,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
      blending: THREE.NormalBlending,
      depthWrite: false,
      toneMapped: false,
    }),
    stem: new THREE.MeshBasicMaterial({
      color: 0xffffff,
      vertexColors: true,
      transparent: true,
      opacity: 0.055,
      blending: THREE.NormalBlending,
      depthWrite: false,
      toneMapped: false,
    }),
    beam: new THREE.MeshBasicMaterial({
      color: 0xffffff,
      vertexColors: true,
      transparent: true,
      opacity: 0.2,
      blending: THREE.NormalBlending,
      depthWrite: false,
      toneMapped: false,
    }),
    activeHalo: new THREE.MeshBasicMaterial({
      color: 0xffffff,
      vertexColors: true,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    }),
    line: new THREE.LineBasicMaterial({
      color: 0xffffff,
      vertexColors: true,
      transparent: true,
      opacity: 0.14,
      blending: THREE.NormalBlending,
      depthWrite: false,
      toneMapped: false,
    }),
    arrow: new THREE.MeshBasicMaterial({
      color: 0xffffff,
      vertexColors: true,
      transparent: true,
      opacity: 0.34,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }),
    route: new THREE.MeshBasicMaterial({
      color: palette.yellow,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }),
    highlights: new THREE.MeshBasicMaterial({
      color: 0xffffff,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }),
    glow: new THREE.PointsMaterial({
      color: 0xffffff,
      vertexColors: true,
      map: glowTexture,
      size: clamp(30, 92, worldDiagonal * 0.009),
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.22,
      alphaTest: 0.015,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }),
    dust: new THREE.PointsMaterial({
      color: palette.worldInk,
      map: glowTexture,
      size: clamp(1.5, 5, worldDiagonal / 1600),
      sizeAttenuation: true,
      transparent: true,
      opacity: reducedMotion ? 0.05 : 0.08,
      alphaTest: 0.02,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }),
  };

  const state = {
    disposed: false,
    contextLost: false,
    active: true,
    viewport: {
      width: Math.max(1, canvas.clientWidth || 1),
      height: Math.max(1, canvas.clientHeight || 1),
      dpr: 1,
    },
    model: {
      visibleNodes: new Set(data.nodes.map((node) => node.id)),
      renderedEdges: data.edges,
      direct: new Set(),
      second: new Set(),
      queryMatches: new Set(),
    },
    selected: '',
    hovered: '',
    travelCandidate: '',
    routeNodeIds: new Set(),
    routeEdgeIds: new Set(),
    bookmarks: new Set(),
    layout: normalizeLayout(options.layout),
    nodeScale: 1.25,
    edgeOpacity: 0.48,
    edgeWidth: 0.72,
    focusGravity: 1,
    heightScale: 1,
    labelDensity: 2,
    showGrid: true,
    showCommunities: true,
    showArrows: true,
    autoRotate: false,
    mode: 'orbit',
    reticleTarget: '',
    orbitTarget: new THREE.Vector3(),
    orbitYaw: -0.58,
    orbitElevation: 0.42,
    orbitDistance: Math.max(420, worldDiagonal * 0.16),
    keys: new Set(),
    velocity: new THREE.Vector3(),
    flightSpeedMultiplier: 1,
    animationFrame: 0,
    lastCameraSignature: '',
    lastFrameTime: 0,
    elapsedTime: 0,
    focusLayoutSignature: '',
    focusPhysicsActive: false,
    focusTension: 0,
    nodeBuildSignature: '',
    edgeBuildSignature: '',
    labelBuildSignature: '',
  };

  const raycaster = new THREE.Raycaster();
  const nodeMeshes = [];
  const nodeWorldPositions = new Map();
  const focusPhysics = new Map();
  const communityObjects = new Map();
  const communityLights = [];
  const labelTextureCache = new Map();
  let nodeGlow = null;
  let highlightMesh = null;
  let stemMesh = null;
  let edgeMesh = null;
  let activeEdgeHaloMesh = null;
  let edgeLines = null;
  let arrowMesh = null;
  let routeGroup = null;
  let dust = null;

  function communityColor(communityId) {
    const community = communityById.get(communityId);
    const index = community?.colorIndex ?? community?.id ?? communityId ?? 0;
    return (communityColors[index] ?? communityColors[communityId] ?? palette.pink).clone();
  }

  function baseWorldPositionFor(node, heightScale = state.heightScale) {
    const position = node.layouts?.[state.layout]
      ?? node.layouts?.[defaultLayout]
      ?? node;
    return new THREE.Vector3(
      finite(position.x, finite(node.x)) - dimensions.width / 2,
      finite(node.z) * Math.max(0, finite(heightScale, 1)),
      finite(position.y, finite(node.y)) - dimensions.height / 2,
    );
  }

  function worldPositionFor(node, heightScale = state.heightScale) {
    if (heightScale === state.heightScale) {
      const animated = focusPhysics.get(node.id)?.position;
      if (animated) return animated.clone();
    }
    return baseWorldPositionFor(node, heightScale);
  }

  function worldPositionForCommunity(community) {
    return new THREE.Vector3(
      finite(community.x) - dimensions.width / 2,
      0,
      finite(community.y) - dimensions.height / 2,
    );
  }

  function createAtmosphere() {
    const random = mulberry32(stableHash(`${data.layoutVersion}:${data.nodes.length}:${data.edges.length}`));
    const count = reducedMotion ? 420 : clamp(720, 1800, Math.round(data.nodes.length * 8));
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = (random() - 0.5) * dimensions.width * 1.35;
      positions[index * 3 + 1] = random() * Math.max(dimensions.depth * 2.5, dimensions.height * 0.55) + 10;
      positions[index * 3 + 2] = (random() - 0.5) * dimensions.height * 1.45;
      const color = random() > 0.72 ? palette.cyan : random() > 0.62 ? palette.pink : palette.worldInk;
      color.toArray(colors, index * 3);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    dust = new THREE.Points(geometry, materials.dust);
    dust.name = 'knowledge-dust';
    dust.frustumCulled = false;
    atmosphereRoot.add(dust);
  }

  function createCommunities() {
    const ranked = [...data.communities]
      .sort((left, right) => finite(right.crossEdges) - finite(left.crossEdges));
    const litIds = new Set(ranked.slice(0, 4).map((community) => community.id));

    for (const community of data.communities) {
      const group = new THREE.Group();
      group.name = `community-${community.id}`;
      group.position.copy(worldPositionForCommunity(community));
      const color = communityColor(community.id);
      const radius = Math.max(42, finite(community.radius, 90));

      const ringMaterial = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.13,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      });
      const ring = new THREE.Mesh(new THREE.RingGeometry(radius * 0.82, radius, 72, 1), ringMaterial);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = -2.4;
      ring.renderOrder = 0;
      group.add(ring);

      const columnHeight = Math.max(90, dimensions.depth * 1.18);
      const columnMaterial = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.018,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      });
      const column = new THREE.Mesh(
        new THREE.CylinderGeometry(radius * 0.72, radius * 0.94, columnHeight, 48, 1, true),
        columnMaterial,
      );
      column.position.y = columnHeight / 2 - 2;
      group.add(column);

      communityRoot.add(group);
      communityObjects.set(community.id, group);

      if (litIds.has(community.id)) {
        const light = new THREE.PointLight(color, 2.2, radius * 4.5, 1.65);
        light.position.copy(group.position).add(new THREE.Vector3(0, Math.max(80, dimensions.depth * 0.55), 0));
        light.userData.communityId = community.id;
        scene.add(light);
        communityLights.push(light);
      }
    }
  }

  function dominantCommunitySpawn() {
    if (state.layout !== 'community') {
      state.orbitTarget.set(0, dimensions.depth * 0.18, 0);
      state.orbitDistance = Math.max(520, worldDiagonal * 0.28);
      return;
    }
    const dominant = [...data.communities]
      .sort((left, right) => (
        finite(right.crossEdges) - finite(left.crossEdges)
        || finite(right.size) - finite(left.size)
        || String(left.id).localeCompare(String(right.id), 'ko')
      ))[0];
    if (!dominant) {
      state.orbitTarget.set(0, dimensions.depth * 0.18, 0);
      state.orbitDistance = Math.max(420, worldDiagonal * 0.18);
      return;
    }
    const members = data.nodes.filter((node) => node.community === dominant.id);
    const averageHeight = members.length
      ? members.reduce((sum, node) => sum + finite(node.z), 0) / members.length
      : dimensions.depth * 0.18;
    state.orbitTarget.copy(worldPositionForCommunity(dominant));
    state.orbitTarget.y = averageHeight * 0.72;
    state.orbitDistance = clamp(
      Math.max(250, finite(dominant.radius, 100) * 2.45),
      Math.max(520, worldDiagonal * 0.34),
      Math.max(finite(dominant.radius, 100) * 2.45, worldDiagonal * 0.115),
    );
  }

  function syncOrbitCamera() {
    const horizontal = Math.cos(state.orbitElevation) * state.orbitDistance;
    camera.position.set(
      state.orbitTarget.x + Math.sin(state.orbitYaw) * horizontal,
      state.orbitTarget.y + Math.sin(state.orbitElevation) * state.orbitDistance,
      state.orbitTarget.z + Math.cos(state.orbitYaw) * horizontal,
    );
    camera.lookAt(state.orbitTarget);
    camera.updateMatrixWorld();
  }

  function cameraSignature() {
    const values = [
      state.mode,
      camera.position.x,
      camera.position.y,
      camera.position.z,
      camera.quaternion.x,
      camera.quaternion.y,
      camera.quaternion.z,
      camera.quaternion.w,
      camera.fov,
      state.orbitTarget.x,
      state.orbitTarget.y,
      state.orbitTarget.z,
      state.orbitDistance,
    ];
    return values.map((value) => typeof value === 'number' ? value.toFixed(4) : value).join(':');
  }

  function getCameraInfo() {
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    return {
      mode: state.mode,
      locked: pointerLocked,
      position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
      direction: { x: direction.x, y: direction.y, z: direction.z },
      target: {
        x: state.orbitTarget.x,
        y: state.orbitTarget.y,
        z: state.orbitTarget.z,
      },
      yaw: state.orbitYaw,
      elevation: state.orbitElevation,
      distance: state.orbitDistance,
      fov: camera.fov,
      speed: state.flightSpeedMultiplier,
      worldSpeed: baseFlightSpeed * state.flightSpeedMultiplier,
    };
  }

  function notifyCamera(force = false) {
    const signature = cameraSignature();
    if (!force && signature === state.lastCameraSignature) return;
    state.lastCameraSignature = signature;
    options.onCameraChange?.(getCameraInfo());
  }

  function nodeAttentionFactor(nodeId) {
    const queryMatches = asIdSet(state.model.queryMatches);
    const direct = asIdSet(state.model.direct);
    const second = asIdSet(state.model.second);
    const hasFocus = Boolean(state.selected || state.hovered || queryMatches.size || state.routeNodeIds.size);
    if (nodeId === state.selected || nodeId === state.hovered || nodeId === state.travelCandidate) return 1;
    if (state.routeNodeIds.has(nodeId) || state.bookmarks.has(nodeId) || queryMatches.has(nodeId)) return 0.98;
    if (!hasFocus) return 0.96;
    if (direct.has(nodeId)) return 0.94;
    if (second.has(nodeId)) return 0.72;
    return 0.34;
  }

  function grayscaleColor(color) {
    const luminance = color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722;
    return new THREE.Color(luminance, luminance, luminance);
  }

  function nodeSelectionTier(nodeId) {
    if (!state.selected) return 'ambient';
    if (nodeId === state.selected) return 'selected';
    if (asIdSet(state.model.direct).has(nodeId)) return 'direct';
    if (
      nodeId === state.travelCandidate
      || state.routeNodeIds.has(nodeId)
      || asIdSet(state.model.queryMatches).has(nodeId)
    ) return 'signal';
    if (nodeId === state.hovered) return 'hovered';
    if (asIdSet(state.model.second).has(nodeId)) return 'second';
    return 'unrelated';
  }

  function muteNodeForSelection(color, nodeId, { core = false } = {}) {
    const tier = nodeSelectionTier(nodeId);
    if (['ambient', 'selected', 'direct', 'signal'].includes(tier)) return color;

    const grayscaleAmount = tier === 'hovered'
      ? 0.72
      : tier === 'second'
        ? core ? 0.94 : 0.9
        : core ? 0.995 : 0.985;
    const dimAmount = tier === 'hovered'
      ? 0.18
      : tier === 'second'
        ? core ? 0.43 : 0.36
        : core ? 0.62 : 0.56;
    const neutral = grayscaleColor(color);
    const neutralWorld = grayscaleColor(palette.world);
    color.lerp(neutral, grayscaleAmount);
    color.lerp(neutralWorld, dimAmount);
    return color;
  }

  function nodeColor(node) {
    const visibility = nodeAttentionFactor(node.id);
    const color = communityColor(node.community).lerp(palette.paperLight, 0.1);
    if (node.id === state.selected) color.lerp(palette.cyan, 0.64);
    else if (node.id === state.travelCandidate) color.lerp(palette.yellow, 0.64);
    else if (state.routeNodeIds.has(node.id)) color.lerp(palette.pink, 0.48);
    else if (state.bookmarks.has(node.id)) color.lerp(palette.yellow, 0.28);
    if (!state.selected) color.lerp(palette.world, (1 - visibility) * 0.82);
    return muteNodeForSelection(color, node.id);
  }

  function nodeCoreColor(node) {
    const typeAccent = node.type === 'concept'
      ? palette.cyan
      : node.type === 'entity'
        ? palette.pink
        : node.type === 'analysis'
          ? palette.yellow
          : node.type === 'reference'
            ? palette.blue
            : palette.paperLight;
    const color = typeAccent.clone().lerp(communityColor(node.community), 0.3);
    if (!state.selected) color.lerp(palette.world, (1 - nodeAttentionFactor(node.id)) * 0.74);
    return muteNodeForSelection(color, node.id, { core: true });
  }

  function focusNodeRadius(node) {
    return Math.max(6, finite(node?.radius, 8) * state.nodeScale);
  }

  function currentFocusLayoutSignature() {
    return [
      state.layout,
      state.selected,
      sortedSetSignature(state.model.direct),
      sortedSetSignature(state.model.visibleNodes),
      state.nodeScale.toFixed(3),
      state.heightScale.toFixed(3),
      state.focusGravity.toFixed(3),
    ].join('\u0003');
  }

  function configureFocusLayout() {
    const signature = currentFocusLayoutSignature();
    if (signature === state.focusLayoutSignature) return false;
    state.focusLayoutSignature = signature;
    const visibleIds = asIdSet(state.model.visibleNodes);

    for (const node of data.nodes) {
      const base = baseWorldPositionFor(node);
      let entry = focusPhysics.get(node.id);
      if (!entry) {
        entry = {
          position: base.clone(),
          target: base.clone(),
          velocity: new THREE.Vector3(),
        };
        focusPhysics.set(node.id, entry);
      }
      entry.target.copy(base);
    }

    const selectedNode = visibleIds.has(state.selected) ? nodeById.get(state.selected) : null;
    let focusNeighborCount = 0;
    if (selectedNode) {
      const center = baseWorldPositionFor(selectedNode);
      const neighbors = [...asIdSet(state.model.direct)]
        .filter((id) => id !== selectedNode.id && visibleIds.has(id) && nodeById.has(id))
        .map((id) => nodeById.get(id))
        .sort((left, right) => String(left.id).localeCompare(String(right.id), 'ko'));
      focusNeighborCount = neighbors.length;
      const minimumRadius = clamp(176, 260, 242 - state.focusGravity * 42);
      const maximumRadius = clamp(440, 760, 470 + Math.sqrt(neighbors.length) * 56);
      const layout = focusBurstLayout(
        { x: center.x, y: center.z },
        neighbors.map((node) => {
          const base = baseWorldPositionFor(node);
          return {
            id: node.id,
            x: base.x,
            y: base.z,
            radius: focusNodeRadius(node),
            labelSpan: clamp(96, 330, String(node.title ?? '').length * 8.2 + 52),
          };
        }),
        {
          minimumRadius,
          ringGap: clamp(128, 182, 138 + neighbors.length * 2.2),
          maximumRadius,
          ringFill: 0.72,
        },
      );
      const layoutById = new Map(layout.map((item) => [item.id, item]));
      const targets = neighbors.map((node, index) => {
        const base = baseWorldPositionFor(node);
        const burst = layoutById.get(node.id);
        const heightOffset = ((index % 3) - 1) * Math.min(16, neighbors.length * 0.6);
        const preferred = new THREE.Vector3(
          burst?.x ?? base.x,
          center.y + (base.y - center.y) * 0.28 + heightOffset,
          burst?.y ?? base.z,
        );
        return {
          node,
          preferred,
          target: preferred.clone(),
          labelSpan: burst?.span ?? focusNodeRadius(node) * 2 + 24,
        };
      });

      for (let iteration = 0; iteration < 12; iteration += 1) {
        for (let leftIndex = 0; leftIndex < targets.length; leftIndex += 1) {
          for (let rightIndex = leftIndex + 1; rightIndex < targets.length; rightIndex += 1) {
            const left = targets[leftIndex];
            const right = targets[rightIndex];
            let dx = right.target.x - left.target.x;
            let dz = right.target.z - left.target.z;
            let distance = Math.hypot(dx, dz);
            const minimum = Math.max(
              focusNodeRadius(left.node) + focusNodeRadius(right.node) + 28,
              Math.min(176, (left.labelSpan + right.labelSpan) * 0.28),
            );
            if (distance >= minimum) continue;
            if (distance < EPSILON) {
              const angle = (stableHash(`${left.node.id}:${right.node.id}`) % 360) * Math.PI / 180;
              dx = Math.cos(angle);
              dz = Math.sin(angle);
              distance = 1;
            }
            const correction = (minimum - distance) * 0.53;
            const nx = dx / distance;
            const nz = dz / distance;
            left.target.x -= nx * correction;
            left.target.z -= nz * correction;
            right.target.x += nx * correction;
            right.target.z += nz * correction;
          }
        }
        for (const item of targets) {
          item.target.x += (item.preferred.x - item.target.x) * 0.035;
          item.target.z += (item.preferred.z - item.target.z) * 0.035;
          const dx = item.target.x - center.x;
          const dz = item.target.z - center.z;
          const distance = Math.hypot(dx, dz);
          if (distance > maximumRadius && distance > EPSILON) {
            const scale = maximumRadius / distance;
            item.target.x = center.x + dx * scale;
            item.target.z = center.z + dz * scale;
          }
        }
      }
      for (const item of targets) focusPhysics.get(item.node.id)?.target.copy(item.target);
    }

    if (reducedMotion) {
      for (const entry of focusPhysics.values()) {
        entry.position.copy(entry.target);
        entry.velocity.set(0, 0, 0);
      }
      state.focusPhysicsActive = false;
      state.focusTension = 0;
    } else {
      state.focusPhysicsActive = [...focusPhysics.values()].some((entry) => (
        entry.position.distanceToSquared(entry.target) > 0.04
        || entry.velocity.lengthSq() > 0.01
      ));
    }
    canvas.dataset.focusNeighbors = String(focusNeighborCount);
    canvas.dataset.focusState = state.focusPhysicsActive
      ? selectedNode ? 'attracting' : 'restoring'
      : selectedNode ? 'focused' : 'idle';
    ensureAnimationLoop();
    return true;
  }

  function updateFocusPhysics(deltaSeconds) {
    if (!state.focusPhysicsActive || deltaSeconds <= 0) return false;
    const spring = 20 + state.focusGravity * 14;
    const damping = Math.exp(-deltaSeconds * 7.4);
    let maximumDistance = 0;
    let moving = false;
    for (const entry of focusPhysics.values()) {
      const offset = entry.target.clone().sub(entry.position);
      const distance = offset.length();
      maximumDistance = Math.max(maximumDistance, distance);
      entry.velocity.addScaledVector(offset, spring * deltaSeconds).multiplyScalar(damping);
      entry.position.addScaledVector(entry.velocity, deltaSeconds);
      if (distance < 0.08 && entry.velocity.lengthSq() < 0.01) {
        entry.position.copy(entry.target);
        entry.velocity.set(0, 0, 0);
      } else moving = true;
    }

    const selectedNode = nodeById.get(state.selected);
    if (selectedNode) {
      const center = focusPhysics.get(selectedNode.id)?.position ?? baseWorldPositionFor(selectedNode);
      const neighbors = [...asIdSet(state.model.direct)]
        .map((id) => nodeById.get(id))
        .filter(Boolean);
      for (let iteration = 0; iteration < 2; iteration += 1) {
        for (let leftIndex = 0; leftIndex < neighbors.length; leftIndex += 1) {
          const leftNode = neighbors[leftIndex];
          const leftEntry = focusPhysics.get(leftNode.id);
          if (!leftEntry) continue;
          const centerDx = leftEntry.position.x - center.x;
          const centerDz = leftEntry.position.z - center.z;
          const centerDistance = Math.hypot(centerDx, centerDz);
          const centerMinimum = focusNodeRadius(selectedNode) + focusNodeRadius(leftNode) + 34;
          if (centerDistance < centerMinimum && centerDistance > EPSILON) {
            const correction = centerMinimum - centerDistance;
            leftEntry.position.x += centerDx / centerDistance * correction;
            leftEntry.position.z += centerDz / centerDistance * correction;
          }
          for (let rightIndex = leftIndex + 1; rightIndex < neighbors.length; rightIndex += 1) {
            const rightNode = neighbors[rightIndex];
            const rightEntry = focusPhysics.get(rightNode.id);
            if (!rightEntry) continue;
            let dx = rightEntry.position.x - leftEntry.position.x;
            let dz = rightEntry.position.z - leftEntry.position.z;
            let distance = Math.hypot(dx, dz);
            const minimum = focusNodeRadius(leftNode) + focusNodeRadius(rightNode) + 18;
            if (distance >= minimum) continue;
            if (distance < EPSILON) {
              const angle = (stableHash(`${leftNode.id}:${rightNode.id}`) % 360) * Math.PI / 180;
              dx = Math.cos(angle);
              dz = Math.sin(angle);
              distance = 1;
            }
            const correction = (minimum - distance) * 0.5;
            const nx = dx / distance;
            const nz = dz / distance;
            leftEntry.position.x -= nx * correction;
            leftEntry.position.z -= nz * correction;
            rightEntry.position.x += nx * correction;
            rightEntry.position.z += nz * correction;
          }
        }
      }
    }
    state.focusTension = clamp(0, 1, maximumDistance / 260);
    state.focusPhysicsActive = moving;
    canvas.dataset.focusTension = state.focusTension.toFixed(3);
    if (!moving) canvas.dataset.focusState = state.selected ? 'focused' : 'idle';
    return true;
  }

  function verificationKey(node) {
    return ['verified', 'partial', 'disputed', 'unverified'].includes(node.verification)
      ? node.verification
      : 'unverified';
  }

  function geometryKey(node) {
    return geometries[node.type] ? node.type : 'default';
  }

  function sortedSetSignature(value) {
    return [...asIdSet(value)].sort((left, right) => String(left).localeCompare(String(right), 'ko')).join('\u0001');
  }

  function currentNodeBuildSignature() {
    return [
      state.layout,
      sortedSetSignature(state.model.visibleNodes),
      sortedSetSignature(state.model.direct),
      sortedSetSignature(state.model.second),
      sortedSetSignature(state.model.queryMatches),
      sortedSetSignature(state.routeNodeIds),
      sortedSetSignature(state.bookmarks),
      state.selected,
      state.hovered,
      state.travelCandidate,
      state.nodeScale.toFixed(3),
      state.heightScale.toFixed(3),
    ].join('\u0002');
  }

  function currentEdgeBuildSignature() {
    const renderedEdgeIds = (Array.isArray(state.model.renderedEdges) ? state.model.renderedEdges : [])
      .map((edge) => edge?.id ?? `${edge?.source ?? ''}>${edge?.target ?? ''}`)
      .join('\u0001');
    return [
      state.layout,
      renderedEdgeIds,
      sortedSetSignature(state.model.visibleNodes),
      sortedSetSignature(state.routeEdgeIds),
      state.selected,
      state.hovered,
      state.travelCandidate,
      state.edgeOpacity.toFixed(3),
      state.edgeWidth.toFixed(3),
      state.heightScale.toFixed(3),
      String(state.showArrows),
    ].join('\u0002');
  }

  function currentLabelBuildSignature() {
    return [
      state.layout,
      sortedSetSignature(state.model.visibleNodes),
      sortedSetSignature(state.model.queryMatches),
      sortedSetSignature(state.bookmarks),
      sortedSetSignature(state.routeNodeIds),
      state.selected,
      state.hovered,
      state.travelCandidate,
      state.labelDensity,
      state.nodeScale.toFixed(3),
      state.heightScale.toFixed(3),
      String(state.showCommunities),
    ].join('\u0002');
  }

  function labelTexture(text, { community = false, accent = palette.pink } = {}) {
    const content = String(text ?? '').trim();
    const cacheKey = `${community ? 'community' : 'node'}\u0000${colorToCacheKey(accent)}\u0000${content}`;
    if (labelTextureCache.has(cacheKey)) return labelTextureCache.get(cacheKey);
    const labelCanvas = documentRef.createElement('canvas');
    const context = labelCanvas.getContext('2d');
    const maximumTextWidth = community ? 1120 : 960;
    let fontSize = community ? 32 : 28;
    let font = '';
    let measured = Infinity;
    do {
      font = community
        ? `700 ${fontSize}px "Courier New", "D2Coding", monospace`
        : `700 ${fontSize}px Arial, "Noto Sans KR", sans-serif`;
      context.font = font;
      measured = context.measureText(content).width;
      if (measured <= maximumTextWidth || fontSize <= 17) break;
      fontSize -= 1;
    } while (fontSize >= 17);
    const horizontalPadding = community ? 42 : 34;
    const stripeWidth = community ? 9 : 6;
    const shadowOffset = community ? 9 : 0;
    const contentWidth = Math.max(128, Math.ceil(measured + horizontalPadding * 2 + stripeWidth));
    const contentHeight = Math.ceil(fontSize * (community ? 2.2 : 2.05));
    labelCanvas.width = contentWidth + shadowOffset;
    labelCanvas.height = contentHeight + shadowOffset;
    context.font = font;
    context.textBaseline = 'middle';
    if (community) {
      context.fillStyle = `#${accent.getHexString()}`;
      context.fillRect(shadowOffset, shadowOffset, contentWidth, contentHeight);
      context.fillStyle = `#${palette.paperLight.getHexString()}`;
      context.fillRect(0, 0, contentWidth, contentHeight);
      context.fillStyle = `#${accent.getHexString()}`;
      context.fillRect(0, 0, contentWidth, 11);
      context.strokeStyle = `#${palette.world.getHexString()}`;
      context.lineWidth = 4;
      context.strokeRect(2, 2, contentWidth - 4, contentHeight - 4);
      context.fillStyle = `#${palette.world.getHexString()}`;
      context.fillText(content, horizontalPadding, contentHeight / 2 + 4);
    } else {
      context.fillStyle = `rgba(${Math.round(palette.world.r * 255)},${Math.round(palette.world.g * 255)},${Math.round(palette.world.b * 255)},0.8)`;
      context.fillRect(0, 0, contentWidth, contentHeight);
      context.fillStyle = `#${accent.getHexString()}`;
      context.fillRect(0, 0, stripeWidth, contentHeight);
      context.strokeStyle = `#${accent.getHexString()}`;
      context.lineWidth = 2;
      context.strokeRect(1.5, 1.5, contentWidth - 3, contentHeight - 3);
      context.fillStyle = `#${palette.worldInk.getHexString()}`;
      context.fillText(content, horizontalPadding + stripeWidth, contentHeight / 2 + 1);
    }
    const texture = new THREE.CanvasTexture(labelCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    texture.userData.aspect = labelCanvas.width / labelCanvas.height;
    labelTextureCache.set(cacheKey, texture);
    return texture;
  }

  function colorToCacheKey(color) {
    return color?.isColor ? color.getHexString() : String(color ?? '');
  }

  function makeLabelSprite(text, {
    position,
    accent,
    community = false,
    nodeId = '',
  }) {
    const texture = labelTexture(text, { community, accent });
    const material = new THREE.SpriteMaterial({
      map: texture,
      color: 0xffffff,
      transparent: true,
      opacity: community ? 1 : 0.94,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      fog: true,
    });
    const sprite = new THREE.Sprite(material);
    sprite.position.copy(position);
    const labelHeight = community
      ? clamp(34, 78, worldDiagonal * 0.009)
      : clamp(24, 54, worldDiagonal * 0.0066);
    sprite.scale.set(labelHeight * texture.userData.aspect, labelHeight, 1);
    sprite.center.set(0.5, 0);
    sprite.renderOrder = community ? 7 : 8;
    sprite.userData.nodeId = nodeId;
    sprite.userData.labelAspect = texture.userData.aspect;
    sprite.userData.labelPixels = community ? 25 : 22;
    sprite.userData.labelMaximum = community ? 78 : 52;
    return sprite;
  }

  function labelBoxesOverlap(left, right, padding = 6) {
    return left.x < right.x + right.width + padding
      && left.x + left.width + padding > right.x
      && left.y < right.y + right.height + padding
      && left.y + left.height + padding > right.y;
  }

  function focusLabelSafeArea() {
    const width = state.viewport.width;
    const height = state.viewport.height;
    const desktop = width >= 860;
    let rightInset = 14;
    if (desktop && state.selected) {
      const canvasRectangle = canvas.getBoundingClientRect();
      const inspectorRectangle = documentRef.querySelector('[data-graph-inspector]')?.getBoundingClientRect();
      const overlap = inspectorRectangle
        ? Math.max(0, canvasRectangle.right - Math.max(canvasRectangle.left, inspectorRectangle.left) + 14)
        : Math.min(350, width * 0.31);
      rightInset = Math.max(14, Math.min(Math.max(14, width - 300), overlap));
    }
    const topInset = desktop ? Math.min(118, height * 0.18) : 14;
    const bottomInset = desktop ? Math.min(118, height * 0.2) : 14;
    const area = {
      left: 14,
      top: topInset,
      right: width - rightInset,
      bottom: height - bottomInset,
    };
    if (area.right - area.left < 260) area.right = Math.min(width - 14, area.left + 280);
    if (area.bottom - area.top < 220) {
      area.top = 14;
      area.bottom = height - 14;
    }
    return area;
  }

  function focusLabelObstacles() {
    const canvasRectangle = canvas.getBoundingClientRect();
    const selectors = [
      '.graph-minimap',
      '[data-graph-inspector]',
      '.graph-view-controls',
      '.graph-travel-hud',
      '.graph-route-hud',
    ];
    const obstacles = [];
    for (const selector of selectors) {
      const item = documentRef.querySelector(selector);
      if (!item || item.hidden) continue;
      const rectangle = item.getBoundingClientRect();
      if (!rectangle.width || !rectangle.height) continue;
      const left = Math.max(canvasRectangle.left, rectangle.left);
      const top = Math.max(canvasRectangle.top, rectangle.top);
      const right = Math.min(canvasRectangle.right, rectangle.right);
      const bottom = Math.min(canvasRectangle.bottom, rectangle.bottom);
      if (right <= left || bottom <= top) continue;
      obstacles.push({
        x: left - canvasRectangle.left - 8,
        y: top - canvasRectangle.top - 8,
        width: right - left + 16,
        height: bottom - top + 16,
      });
    }
    return obstacles;
  }

  function screenPointForWorld(position) {
    const projected = position.clone().project(camera);
    if (![projected.x, projected.y, projected.z].every(Number.isFinite)) return null;
    return {
      x: (projected.x + 1) * state.viewport.width / 2,
      y: (1 - projected.y) * state.viewport.height / 2,
      z: projected.z,
    };
  }

  function worldPointForScreen(x, y, z) {
    return new THREE.Vector3(
      x / Math.max(1, state.viewport.width) * 2 - 1,
      1 - y / Math.max(1, state.viewport.height) * 2,
      z,
    ).unproject(camera);
  }

  function placeFocusLabels(sprites) {
    if (!state.selected || sprites.length < 2) return;
    const selectedSprite = sprites.find((sprite) => sprite.userData.nodeId === state.selected);
    const selectedPoint = selectedSprite ? screenPointForWorld(selectedSprite.position) : null;
    if (!selectedPoint) return;
    const safe = focusLabelSafeArea();
    const directCount = asIdSet(state.model.direct).size;
    const labelPixels = directCount > 18 ? 17 : directCount > 12 ? 19 : 22;
    const items = sprites
      .map((sprite) => {
        const point = screenPointForWorld(sprite.position);
        if (!point) return null;
        const pixels = sprite.userData.nodeId === state.selected ? Math.max(22, labelPixels) : labelPixels;
        const width = Math.max(36, pixels * finite(sprite.userData.labelAspect, 1));
        const height = pixels;
        const dx = point.x - selectedPoint.x;
        const dy = point.y - selectedPoint.y;
        return {
          sprite,
          point,
          width,
          height,
          angle: Math.atan2(dy, dx),
          selected: sprite.userData.nodeId === state.selected,
        };
      })
      .filter(Boolean)
      .sort((left, right) => (
        Number(right.selected) - Number(left.selected)
        || left.angle - right.angle
        || String(left.sprite.userData.nodeId).localeCompare(String(right.sprite.userData.nodeId), 'ko')
      ));
    const placed = focusLabelObstacles();

    for (const item of items) {
      const length = Math.hypot(item.point.x - selectedPoint.x, item.point.y - selectedPoint.y) || 1;
      const outward = item.selected
        ? { x: 0, y: -1 }
        : {
          x: (item.point.x - selectedPoint.x) / length,
          y: (item.point.y - selectedPoint.y) / length,
        };
      const tangent = { x: -outward.y, y: outward.x };
      const candidates = [];
      const distances = item.selected ? [12, 34] : [12, 32, 58, 88, 122];
      for (const distance of distances) {
        const directions = [
          outward,
          { x: outward.x * 0.82 + tangent.x * 0.58, y: outward.y * 0.82 + tangent.y * 0.58 },
          { x: outward.x * 0.82 - tangent.x * 0.58, y: outward.y * 0.82 - tangent.y * 0.58 },
          tangent,
          { x: -tangent.x, y: -tangent.y },
          { x: -outward.x, y: -outward.y },
        ];
        for (const direction of directions) {
          const centerX = item.point.x + direction.x * (distance + item.width * Math.abs(direction.x) * 0.5);
          const centerY = item.point.y + direction.y * (distance + item.height * Math.abs(direction.y) * 0.5);
          candidates.push({
            x: clamp(safe.left, safe.right - item.width, centerX - item.width / 2),
            y: clamp(safe.top, safe.bottom - item.height, centerY - item.height / 2),
            width: item.width,
            height: item.height,
          });
        }
      }
      let box = candidates.find((candidate) => placed.every((other) => !labelBoxesOverlap(candidate, other)));
      if (!box) {
        const gridCandidates = [];
        const horizontalStep = Math.max(72, item.width * 0.58);
        const verticalStep = item.height + 9;
        for (let y = safe.top; y <= safe.bottom - item.height; y += verticalStep) {
          for (let x = safe.left; x <= safe.right - item.width; x += horizontalStep) {
            gridCandidates.push({
              x,
              y,
              width: item.width,
              height: item.height,
            });
          }
        }
        gridCandidates.sort((left, right) => {
          const leftDistance = Math.hypot(
            left.x + left.width / 2 - item.point.x,
            left.y + left.height / 2 - item.point.y,
          );
          const rightDistance = Math.hypot(
            right.x + right.width / 2 - item.point.x,
            right.y + right.height / 2 - item.point.y,
          );
          return leftDistance - rightDistance || left.y - right.y || left.x - right.x;
        });
        candidates.push(...gridCandidates);
        box = gridCandidates.find((candidate) => placed.every((other) => !labelBoxesOverlap(candidate, other)));
      }
      if (!box) {
        box = candidates
          .map((candidate) => ({
            ...candidate,
            overlap: placed.reduce((sum, other) => {
              const overlapX = Math.max(0, Math.min(candidate.x + candidate.width, other.x + other.width) - Math.max(candidate.x, other.x));
              const overlapY = Math.max(0, Math.min(candidate.y + candidate.height, other.y + other.height) - Math.max(candidate.y, other.y));
              return sum + overlapX * overlapY;
            }, 0),
          }))
          .sort((left, right) => left.overlap - right.overlap)[0];
      }
      if (!box) continue;
      placed.push(box);
      item.sprite.position.copy(worldPointForScreen(
        box.x + box.width / 2,
        box.y + box.height,
        item.point.z,
      ));
    }
  }

  function updateLabelScales() {
    if (!labelRoot.children.length) return;
    const worldHeightAtDistance = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
    const focusSprites = [];
    const direct = asIdSet(state.model.direct);
    const queryMatches = asIdSet(state.model.queryMatches);
    for (const sprite of labelRoot.children) {
      const node = nodeById.get(sprite.userData.nodeId);
      if (node) {
        sprite.position.copy(worldPositionFor(node));
        sprite.position.y += Math.max(10, finite(node.radius, 8) * state.nodeScale * 1.62);
      }
      const distance = Math.max(1, camera.position.distanceTo(sprite.position));
      const pixels = finite(sprite.userData.labelPixels, 22);
      const height = clamp(
        5,
        finite(sprite.userData.labelMaximum, 52),
        distance * worldHeightAtDistance / Math.max(1, state.viewport.height) * pixels,
      );
      sprite.scale.set(height * finite(sprite.userData.labelAspect, 1), height, 1);
      if (node && labelIsExposed(node.id, {
        selected: state.selected,
        direct,
        routeNodeIds: state.routeNodeIds,
        hovered: state.hovered,
        travelCandidate: state.travelCandidate,
        queryMatches,
        bookmarks: state.bookmarks,
      })) focusSprites.push(sprite);
    }
    placeFocusLabels(focusSprites);
  }

  function removeLabels() {
    for (const sprite of [...labelRoot.children]) {
      labelRoot.remove(sprite);
      sprite.material?.dispose();
    }
  }

  function nodeLabelPriority(node) {
    if (node.id === state.selected) return 1000000;
    if (state.selected && asIdSet(state.model.direct).has(node.id)) return 950000;
    if (state.routeNodeIds.has(node.id)) return 925000;
    if (node.id === state.hovered) return 900000;
    if (node.id === state.travelCandidate) return 800000;
    if (asIdSet(state.model.queryMatches).has(node.id)) return 700000;
    if (state.bookmarks.has(node.id)) return 600000;
    return Math.max(0, finite(node.degree)) * 100 + Math.max(0, finite(node.bridgeConnections));
  }

  function buildLabels() {
    removeLabels();
    const visibleIds = asIdSet(state.model.visibleNodes);
    const visibleNodes = data.nodes.filter((node) => visibleIds.has(node.id));

    if (state.layout === 'community' && state.showCommunities && !state.selected) {
      for (const community of data.communities) {
        const members = visibleNodes.filter((node) => node.community === community.id);
        if (!members.length || !community.label) continue;
        const position = worldPositionForCommunity(community);
        position.y = Math.max(
          18,
          ...members.map((node) => worldPositionFor(node).y + Math.max(8, finite(node.radius, 8) * state.nodeScale * 1.6)),
        ) + clamp(18, 62, worldDiagonal * 0.006);
        const atlasNumber = String(community.id + 1).padStart(2, '0');
        labelRoot.add(makeLabelSprite(`집단 ${atlasNumber} / ${community.label} · ${members.length}`, {
          position,
          accent: communityColor(community.id),
          community: true,
        }));
      }
    }

    const density = clamp(0, 3, Math.round(state.labelDensity));
    const caps = [8, 14, 26, 42];
    const queryMatches = asIdSet(state.model.queryMatches);
    const direct = asIdSet(state.model.direct);
    const mandatory = (node) => labelIsExposed(node.id, {
      selected: state.selected,
      direct,
      routeNodeIds: state.routeNodeIds,
      hovered: state.hovered,
      travelCandidate: state.travelCandidate,
      queryMatches,
      bookmarks: state.bookmarks,
    });
    const mandatoryNodes = visibleNodes.filter(mandatory);
    const ambientNodes = visibleNodes
      .filter((node) => !state.selected && !mandatory(node) && density > 0)
      .sort((left, right) => (
        nodeLabelPriority(right) - nodeLabelPriority(left)
        || String(left.title).localeCompare(String(right.title), 'ko')
      ))
      .slice(0, Math.max(0, caps[density] - mandatoryNodes.length));
    const candidates = [...mandatoryNodes, ...ambientNodes]
      .sort((left, right) => (
        nodeLabelPriority(right) - nodeLabelPriority(left)
        || String(left.title).localeCompare(String(right.title), 'ko')
      ));

    for (const node of candidates) {
      if (!node.title) continue;
      const position = worldPositionFor(node);
      position.y += Math.max(10, finite(node.radius, 8) * state.nodeScale * 1.62);
      const accent = node.id === state.selected
        ? palette.cyan
        : node.id === state.travelCandidate
          ? palette.yellow
          : queryMatches.has(node.id)
            ? palette.pink
            : communityColor(node.community);
      const labelAccent = muteNodeForSelection(accent.clone(), node.id);
      labelRoot.add(makeLabelSprite(node.title, {
        position,
        accent: labelAccent,
        nodeId: node.id,
      }));
    }
    state.labelBuildSignature = currentLabelBuildSignature();
  }

  function removeNodeObjects() {
    for (const mesh of nodeMeshes) nodeRoot.remove(mesh);
    nodeMeshes.length = 0;
    if (nodeGlow) {
      nodeRoot.remove(nodeGlow);
      nodeGlow.geometry.dispose();
      nodeGlow = null;
    }
    if (highlightMesh) {
      nodeRoot.remove(highlightMesh);
      highlightMesh = null;
    }
    if (stemMesh) {
      nodeRoot.remove(stemMesh);
      stemMesh = null;
    }
    nodeWorldPositions.clear();
  }

  function matrixForNode(node, shellScale = 1) {
    const dummy = new THREE.Object3D();
    const radius = Math.max(3, finite(node.radius, 8)) * state.nodeScale * shellScale;
    dummy.position.copy(worldPositionFor(node));
    const hash = stableHash(node.id);
    dummy.rotation.y = (hash % 360) * Math.PI / 180;
    if (node.type === 'source' || node.type === 'reference') {
      dummy.rotation.x = ((hash >>> 8) % 11 - 5) * 0.018;
      dummy.rotation.z = ((hash >>> 13) % 11 - 5) * 0.018;
    }
    dummy.scale.setScalar(radius);
    dummy.updateMatrix();
    return dummy.matrix;
  }

  function buildNodes() {
    removeNodeObjects();
    const visibleIds = asIdSet(state.model.visibleNodes);
    const visibleNodes = data.nodes.filter((node) => visibleIds.has(node.id));
    const groups = new Map();
    for (const node of visibleNodes) {
      const key = `${geometryKey(node)}:${verificationKey(node)}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(node);
      nodeWorldPositions.set(node.id, worldPositionFor(node));
    }

    for (const [key, nodes] of groups) {
      const [shape, verification] = key.split(':');
      const mesh = new THREE.InstancedMesh(geometries[shape], materials[verification], nodes.length);
      mesh.name = `nodes-${shape}-${verification}`;
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.userData.nodeIds = nodes.map((node) => node.id);
      mesh.userData.scaleFactor = 1;
      nodes.forEach((node, index) => {
        mesh.setMatrixAt(index, matrixForNode(node));
        mesh.setColorAt(index, nodeColor(node));
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingSphere();
      mesh.renderOrder = 3;
      nodeRoot.add(mesh);
      nodeMeshes.push(mesh);

      const core = new THREE.InstancedMesh(geometries[shape], materials.core, nodes.length);
      core.name = `node-core-${shape}-${verification}`;
      core.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      core.userData.nodeIds = nodes.map((node) => node.id);
      core.userData.scaleFactor = 0.56;
      nodes.forEach((node, index) => {
        core.setMatrixAt(index, matrixForNode(node, 0.56));
        core.setColorAt(index, nodeCoreColor(node));
      });
      core.instanceMatrix.needsUpdate = true;
      if (core.instanceColor) core.instanceColor.needsUpdate = true;
      core.computeBoundingSphere();
      core.renderOrder = 2.8;
      nodeRoot.add(core);
      nodeMeshes.push(core);

      if (verification === 'partial' || verification === 'disputed' || verification === 'unverified') {
        const shellMaterial = verification === 'disputed'
          ? materials.shellDisputed
          : verification === 'unverified'
            ? materials.shellUnverified
            : materials.shellPartial;
        const shell = new THREE.InstancedMesh(geometries[shape], shellMaterial, nodes.length);
        shell.name = `verification-shell-${shape}-${verification}`;
        shell.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        shell.userData.nodeIds = nodes.map((node) => node.id);
        shell.userData.scaleFactor = verification === 'disputed' ? 1.2 : 1.1;
        nodes.forEach((node, index) => {
          shell.setMatrixAt(index, matrixForNode(node, shell.userData.scaleFactor));
          const shellColor = nodeColor(node).lerp(
            verification === 'disputed' ? palette.pink : palette.worldInk,
            verification === 'disputed' ? 0.52 : 0.28,
          );
          shell.setColorAt(index, muteNodeForSelection(shellColor, node.id));
        });
        shell.instanceMatrix.needsUpdate = true;
        if (shell.instanceColor) shell.instanceColor.needsUpdate = true;
        shell.computeBoundingSphere();
        shell.renderOrder = 4;
        nodeRoot.add(shell);
        nodeMeshes.push(shell);
      }
    }

    const auraGroups = new Map();
    const directIds = asIdSet(state.model.direct);
    for (const node of visibleNodes.filter((item) => (
      item.id === state.selected
      || item.id === state.hovered
      || item.id === state.travelCandidate
      || directIds.has(item.id)
      || state.routeNodeIds.has(item.id)
      || state.bookmarks.has(item.id)
    ))) {
      const shape = geometryKey(node);
      if (!auraGroups.has(shape)) auraGroups.set(shape, []);
      auraGroups.get(shape).push(node);
    }
    for (const [shape, nodes] of auraGroups) {
      const aura = new THREE.InstancedMesh(geometries[shape], materials.aura, nodes.length);
      aura.name = `node-aura-${shape}`;
      aura.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      aura.userData.nodeIds = nodes.map((node) => node.id);
      aura.userData.scaleFactor = 1.08;
      nodes.forEach((node, index) => {
        aura.setMatrixAt(index, matrixForNode(node, 1.08));
        aura.setColorAt(index, nodeCoreColor(node));
      });
      aura.instanceMatrix.needsUpdate = true;
      if (aura.instanceColor) aura.instanceColor.needsUpdate = true;
      aura.computeBoundingSphere();
      aura.renderOrder = 4;
      nodeRoot.add(aura);
      nodeMeshes.push(aura);
    }

    const glowPositions = new Float32Array(visibleNodes.length * 3);
    const glowColors = new Float32Array(visibleNodes.length * 3);
    visibleNodes.forEach((node, index) => {
      worldPositionFor(node).toArray(glowPositions, index * 3);
      nodeColor(node).toArray(glowColors, index * 3);
    });
    const glowGeometry = new THREE.BufferGeometry();
    glowGeometry.setAttribute('position', new THREE.BufferAttribute(glowPositions, 3));
    glowGeometry.setAttribute('color', new THREE.BufferAttribute(glowColors, 3));
    materials.glow.size = clamp(42, 160, worldDiagonal * 0.012) * state.nodeScale;
    nodeGlow = new THREE.Points(glowGeometry, materials.glow);
    nodeGlow.name = 'node-emissive-glow';
    nodeGlow.userData.nodeIds = visibleNodes.map((node) => node.id);
    nodeGlow.frustumCulled = false;
    nodeGlow.renderOrder = 2;
    nodeRoot.add(nodeGlow);

    const elevatedNodes = visibleNodes.filter((node) => worldPositionFor(node).y > 4);
    if (elevatedNodes.length) {
      stemMesh = new THREE.InstancedMesh(geometries.beam, materials.stem, elevatedNodes.length);
      stemMesh.name = 'semantic-height-stems';
      stemMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      stemMesh.userData.nodeIds = elevatedNodes.map((node) => node.id);
      elevatedNodes.forEach((node, index) => {
        const end = worldPositionFor(node);
        const start = new THREE.Vector3(end.x, 0, end.z);
        const matrix = beamMatrix(start, end, node.id === state.selected ? 1.1 : 0.62);
        if (matrix) stemMesh.setMatrixAt(index, matrix);
        stemMesh.setColorAt(index, nodeColor(node));
      });
      stemMesh.instanceMatrix.needsUpdate = true;
      if (stemMesh.instanceColor) stemMesh.instanceColor.needsUpdate = true;
      stemMesh.computeBoundingSphere();
      stemMesh.renderOrder = 1;
      nodeRoot.add(stemMesh);
    }

    const highlights = visibleNodes.filter((node) => (
      node.id === state.selected
      || node.id === state.hovered
      || node.id === state.travelCandidate
      || state.routeNodeIds.has(node.id)
      || state.bookmarks.has(node.id)
    ));
    if (highlights.length) {
      highlightMesh = new THREE.InstancedMesh(geometries.ring, materials.highlights, highlights.length);
      highlightMesh.name = 'node-state-rings';
      highlightMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      highlightMesh.userData.nodeIds = highlights.map((node) => node.id);
      highlights.forEach((node, index) => {
        const dummy = new THREE.Object3D();
        dummy.position.copy(worldPositionFor(node));
        dummy.rotation.x = Math.PI / 2;
        const scale = Math.max(5, finite(node.radius, 8)) * state.nodeScale * 1.18;
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        highlightMesh.setMatrixAt(index, dummy.matrix);
        const color = node.id === state.selected
          ? palette.cyan
          : node.id === state.travelCandidate
            ? palette.yellow
            : state.routeNodeIds.has(node.id)
              ? palette.pink
              : palette.yellow;
        highlightMesh.setColorAt(index, color);
      });
      highlightMesh.instanceMatrix.needsUpdate = true;
      if (highlightMesh.instanceColor) highlightMesh.instanceColor.needsUpdate = true;
      highlightMesh.computeBoundingSphere();
      highlightMesh.renderOrder = 5;
      nodeRoot.add(highlightMesh);
    }
    state.nodeBuildSignature = currentNodeBuildSignature();
  }

  function removeEdgeObjects() {
    if (edgeMesh) {
      edgeRoot.remove(edgeMesh);
      edgeMesh.dispose?.();
      edgeMesh = null;
    }
    if (activeEdgeHaloMesh) {
      edgeRoot.remove(activeEdgeHaloMesh);
      activeEdgeHaloMesh.dispose?.();
      activeEdgeHaloMesh = null;
    }
    if (edgeLines) {
      edgeRoot.remove(edgeLines);
      edgeLines.geometry.dispose();
      edgeLines = null;
    }
    if (arrowMesh) {
      edgeRoot.remove(arrowMesh);
      arrowMesh.dispose?.();
      arrowMesh = null;
    }
    if (routeGroup) {
      edgeRoot.remove(routeGroup);
      routeGroup.traverse((object) => object.geometry?.dispose());
      routeGroup = null;
    }
  }

  function edgeColor(edge) {
    if (state.routeEdgeIds.has(edge.id)) return palette.yellow.clone();
    const focusId = state.selected || state.hovered || state.travelCandidate;
    if (focusId && edge.source === focusId) return palette.pink.clone();
    if (focusId && edge.target === focusId) return palette.cyan.clone();
    if (state.selected) {
      return grayscaleColor(palette.paperLight).lerp(grayscaleColor(palette.world), 0.76);
    }
    const kinds = relationKinds(edge);
    const semanticColor = edge.crossCommunity
      ? palette.cyan.clone()
      : kinds.includes('related')
        ? palette.pink.clone()
        : palette.worldMuted.clone();
    const source = nodeById.get(edge.source);
    const target = nodeById.get(edge.target);
    if (!edge.crossCommunity && !kinds.includes('related') && source) {
      semanticColor.lerp(communityColor(source.community), 0.22);
      if (target) semanticColor.lerp(communityColor(target.community), 0.11);
    }
    const color = palette.paperLight.clone().lerp(semanticColor, edge.crossCommunity ? 0.24 : 0.18);
    if (focusId || state.routeNodeIds.size) color.lerp(palette.world, 0.68);
    return color;
  }

  function edgeIsEmphasized(edge) {
    if (state.routeEdgeIds.has(edge.id)) return true;
    const focusId = state.selected || state.hovered || state.travelCandidate;
    return Boolean(edgeDirectionForNode(edge, focusId));
  }

  function selectedEdgeWidth(edge, widthScale) {
    const selectedDirection = edgeDirectionForNode(edge, state.selected);
    const directionMultiplier = selectedDirection ? 1.15 : 1;
    return (edge.crossCommunity ? 1.35 : 1) * widthScale * directionMultiplier;
  }

  function activeHaloColor(edge) {
    const direction = edgeDirectionForNode(edge, state.selected);
    if (direction === 'outgoing') return palette.cyan.clone();
    if (direction === 'incoming') return palette.pink.clone();
    return palette.yellow.clone();
  }

  function edgeEndpoints(edge) {
    const sourceNode = nodeById.get(edge.source);
    const targetNode = nodeById.get(edge.target);
    const sourcePosition = nodeWorldPositions.get(edge.source);
    const targetPosition = nodeWorldPositions.get(edge.target);
    if (!sourceNode || !targetNode || !sourcePosition || !targetPosition) return null;
    const direction = new THREE.Vector3().subVectors(targetPosition, sourcePosition);
    const distance = direction.length();
    if (distance <= EPSILON) return null;
    direction.divideScalar(distance);
    const sourceClearance = Math.max(3.5, finite(sourceNode.radius, 8) * state.nodeScale * 1.14);
    const targetClearance = Math.max(3.5, finite(targetNode.radius, 8) * state.nodeScale * 1.14);
    if (distance <= sourceClearance + targetClearance + 2) return null;
    return {
      start: sourcePosition.clone().addScaledVector(direction, sourceClearance),
      end: targetPosition.clone().addScaledVector(direction, -targetClearance),
      direction,
      sourceNode,
      targetNode,
    };
  }

  function beamMatrix(start, end, width) {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    if (length <= EPSILON) return null;
    const dummy = new THREE.Object3D();
    dummy.position.copy(start).add(end).multiplyScalar(0.5);
    dummy.quaternion.setFromUnitVectors(UP, direction.normalize());
    dummy.scale.set(width, length, width);
    dummy.updateMatrix();
    return dummy.matrix;
  }

  function buildEdges() {
    removeEdgeObjects();
    const visibleIds = asIdSet(state.model.visibleNodes);
    const renderedEdges = (Array.isArray(state.model.renderedEdges) ? state.model.renderedEdges : [])
      .filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target));
    if (!renderedEdges.length) {
      state.edgeBuildSignature = currentEdgeBuildSignature();
      return;
    }

    materials.beam.opacity = state.selected
      ? clamp(0.72, 0.92, state.edgeOpacity * 1.8)
      : clamp(0.08, 0.68, state.edgeOpacity * 0.72);
    materials.beam.depthTest = !state.selected;
    materials.activeHalo.opacity = clamp(0.26, 0.54, state.edgeOpacity * 0.86);
    materials.line.opacity = clamp(0.04, 0.38, state.edgeOpacity * 0.32) * (state.selected ? 0.72 : 1);
    materials.arrow.opacity = clamp(0.1, 0.62, state.edgeOpacity * 0.65);
    const widthScale = clamp(0.4, 4, state.edgeWidth);

    const linePositions = [];
    const lineColors = [];
    const lineEdges = [];
    for (const edge of renderedEdges) {
      const endpoints = edgeEndpoints(edge);
      if (!endpoints) continue;
      const { start, end } = endpoints;
      linePositions.push(start.x, start.y, start.z, end.x, end.y, end.z);
      const color = edgeColor(edge);
      lineColors.push(color.r, color.g, color.b, color.r, color.g, color.b);
      lineEdges.push(edge);
    }
    if (linePositions.length) {
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
      edgeLines = new THREE.LineSegments(lineGeometry, materials.line);
      edgeLines.name = 'relationship-light-lines';
      edgeLines.userData.edges = lineEdges;
      edgeLines.renderOrder = 2;
      edgeRoot.add(edgeLines);
    }

    const emphasizedEdges = renderedEdges.filter(edgeIsEmphasized);
    if (emphasizedEdges.length) {
      edgeMesh = new THREE.InstancedMesh(geometries.beam, materials.beam, emphasizedEdges.length);
      edgeMesh.name = 'relationship-beams';
      edgeMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      let beamCount = 0;
      const beamEdges = [];
      for (const edge of emphasizedEdges) {
        const endpoints = edgeEndpoints(edge);
        if (!endpoints) continue;
        const baseWidth = selectedEdgeWidth(edge, widthScale);
        const matrix = beamMatrix(endpoints.start, endpoints.end, baseWidth);
        if (!matrix) continue;
        edgeMesh.setMatrixAt(beamCount, matrix);
        edgeMesh.setColorAt(beamCount, edgeColor(edge));
        beamEdges.push(edge);
        beamCount += 1;
      }
      edgeMesh.userData.edges = beamEdges;
      edgeMesh.count = beamCount;
      edgeMesh.instanceMatrix.needsUpdate = true;
      if (edgeMesh.instanceColor) edgeMesh.instanceColor.needsUpdate = true;
      edgeMesh.computeBoundingSphere();
      edgeMesh.frustumCulled = true;
      edgeMesh.renderOrder = 4;
      edgeRoot.add(edgeMesh);
    }

    const activeEdges = renderedEdges.filter((edge) => edgeDirectionForNode(edge, state.selected));
    if (activeEdges.length) {
      activeEdgeHaloMesh = new THREE.InstancedMesh(geometries.beam, materials.activeHalo, activeEdges.length);
      activeEdgeHaloMesh.name = 'selected-relationship-halos';
      activeEdgeHaloMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      let haloCount = 0;
      const haloEdges = [];
      for (const edge of activeEdges) {
        const endpoints = edgeEndpoints(edge);
        if (!endpoints) continue;
        const haloWidth = selectedEdgeWidth(edge, widthScale) * 1.55;
        const matrix = beamMatrix(endpoints.start, endpoints.end, haloWidth);
        if (!matrix) continue;
        activeEdgeHaloMesh.setMatrixAt(haloCount, matrix);
        activeEdgeHaloMesh.setColorAt(haloCount, activeHaloColor(edge));
        haloEdges.push(edge);
        haloCount += 1;
      }
      activeEdgeHaloMesh.userData.edges = haloEdges;
      activeEdgeHaloMesh.count = haloCount;
      activeEdgeHaloMesh.instanceMatrix.needsUpdate = true;
      if (activeEdgeHaloMesh.instanceColor) activeEdgeHaloMesh.instanceColor.needsUpdate = true;
      activeEdgeHaloMesh.computeBoundingSphere();
      activeEdgeHaloMesh.renderOrder = 3;
      edgeRoot.add(activeEdgeHaloMesh);
    }

    if (state.showArrows && emphasizedEdges.length) {
      arrowMesh = new THREE.InstancedMesh(geometries.arrow, materials.arrow, emphasizedEdges.length);
      arrowMesh.name = 'relationship-arrows';
      arrowMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      let arrowCount = 0;
      const arrowEdges = [];
      for (const edge of emphasizedEdges) {
        const endpoints = edgeEndpoints(edge);
        if (!endpoints) continue;
        const { end, direction, targetNode } = endpoints;
        const arrowLength = clamp(5, 22, finite(targetNode.radius, 8) * state.nodeScale * 0.74);
        const dummy = new THREE.Object3D();
        dummy.position.copy(end).addScaledVector(direction, -arrowLength * 0.52);
        dummy.quaternion.setFromUnitVectors(UP, direction);
        const arrowRadius = arrowLength * 0.32 * widthScale;
        dummy.scale.set(arrowRadius, arrowLength, arrowRadius);
        dummy.updateMatrix();
        arrowMesh.setMatrixAt(arrowCount, dummy.matrix);
        arrowMesh.setColorAt(arrowCount, edgeColor(edge));
        arrowEdges.push(edge);
        arrowCount += 1;
      }
      arrowMesh.userData.edges = arrowEdges;
      arrowMesh.count = arrowCount;
      arrowMesh.instanceMatrix.needsUpdate = true;
      if (arrowMesh.instanceColor) arrowMesh.instanceColor.needsUpdate = true;
      arrowMesh.computeBoundingSphere();
      arrowMesh.renderOrder = 5;
      edgeRoot.add(arrowMesh);
    }

    const routeEdges = renderedEdges.filter((edge) => state.routeEdgeIds.has(edge.id));
    if (routeEdges.length) {
      routeGroup = new THREE.Group();
      routeGroup.name = 'luminous-route';
      for (const edge of routeEdges) {
        const endpoints = edgeEndpoints(edge);
        if (!endpoints) continue;
        const { start, end } = endpoints;
        const distance = start.distanceTo(end);
        const middle = start.clone().add(end).multiplyScalar(0.5);
        middle.y += clamp(10, 90, distance * 0.07);
        const curve = new THREE.QuadraticBezierCurve3(start, middle, end);
        const geometry = new THREE.TubeGeometry(
          curve,
          clamp(10, 28, Math.round(distance / 55)),
          clamp(1.1, 6, widthScale * 1.9),
          6,
          false,
        );
        const mesh = new THREE.Mesh(geometry, materials.route);
        mesh.renderOrder = 6;
        routeGroup.add(mesh);
      }
      edgeRoot.add(routeGroup);
    }
    state.edgeBuildSignature = currentEdgeBuildSignature();
  }

  function syncDynamicScene() {
    const visibleIds = asIdSet(state.model.visibleNodes);
    nodeWorldPositions.clear();
    for (const node of data.nodes) {
      if (visibleIds.has(node.id)) nodeWorldPositions.set(node.id, worldPositionFor(node));
    }

    for (const mesh of nodeMeshes) {
      const ids = mesh.userData.nodeIds ?? [];
      const scaleFactor = finite(mesh.userData.scaleFactor, 1);
      ids.forEach((id, index) => {
        const node = nodeById.get(id);
        if (node) mesh.setMatrixAt(index, matrixForNode(node, scaleFactor));
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }

    if (nodeGlow) {
      const positionAttribute = nodeGlow.geometry.getAttribute('position');
      (nodeGlow.userData.nodeIds ?? []).forEach((id, index) => {
        const node = nodeById.get(id);
        if (!node) return;
        const position = worldPositionFor(node);
        positionAttribute.setXYZ(index, position.x, position.y, position.z);
      });
      positionAttribute.needsUpdate = true;
      nodeGlow.geometry.computeBoundingSphere();
    }

    if (stemMesh) {
      (stemMesh.userData.nodeIds ?? []).forEach((id, index) => {
        const node = nodeById.get(id);
        if (!node) return;
        const end = worldPositionFor(node);
        const start = new THREE.Vector3(end.x, 0, end.z);
        const matrix = beamMatrix(start, end, node.id === state.selected ? 1.1 : 0.62);
        if (matrix) stemMesh.setMatrixAt(index, matrix);
      });
      stemMesh.instanceMatrix.needsUpdate = true;
      stemMesh.computeBoundingSphere();
    }

    if (highlightMesh) {
      (highlightMesh.userData.nodeIds ?? []).forEach((id, index) => {
        const node = nodeById.get(id);
        if (!node) return;
        const dummy = new THREE.Object3D();
        dummy.position.copy(worldPositionFor(node));
        dummy.rotation.x = Math.PI / 2;
        dummy.scale.setScalar(Math.max(5, finite(node.radius, 8)) * state.nodeScale * 1.18);
        dummy.updateMatrix();
        highlightMesh.setMatrixAt(index, dummy.matrix);
      });
      highlightMesh.instanceMatrix.needsUpdate = true;
      highlightMesh.computeBoundingSphere();
    }

    for (const sprite of labelRoot.children) {
      const node = nodeById.get(sprite.userData.nodeId);
      if (!node) continue;
      sprite.position.copy(worldPositionFor(node));
      sprite.position.y += Math.max(10, finite(node.radius, 8) * state.nodeScale * 1.62);
    }

    if (routeGroup) {
      buildEdges();
      return;
    }

    if (edgeLines) {
      const positionAttribute = edgeLines.geometry.getAttribute('position');
      (edgeLines.userData.edges ?? []).forEach((edge, index) => {
        const endpoints = edgeEndpoints(edge);
        if (!endpoints) return;
        positionAttribute.setXYZ(index * 2, endpoints.start.x, endpoints.start.y, endpoints.start.z);
        positionAttribute.setXYZ(index * 2 + 1, endpoints.end.x, endpoints.end.y, endpoints.end.z);
      });
      positionAttribute.needsUpdate = true;
      edgeLines.geometry.computeBoundingSphere();
    }

    if (edgeMesh) {
      const widthScale = clamp(0.4, 4, state.edgeWidth);
      (edgeMesh.userData.edges ?? []).forEach((edge, index) => {
        const endpoints = edgeEndpoints(edge);
        if (!endpoints) return;
        const width = selectedEdgeWidth(edge, widthScale);
        const matrix = beamMatrix(endpoints.start, endpoints.end, width);
        if (matrix) edgeMesh.setMatrixAt(index, matrix);
      });
      edgeMesh.instanceMatrix.needsUpdate = true;
      edgeMesh.computeBoundingSphere();
      materials.beam.opacity = state.selected
        ? clamp(0.72, 0.92, state.edgeOpacity * 1.8 * (1 + state.focusTension * 0.1))
        : clamp(0.08, 0.68, state.edgeOpacity * 0.72 * (1 + state.focusTension * 0.28));
    }

    if (activeEdgeHaloMesh) {
      const widthScale = clamp(0.4, 4, state.edgeWidth);
      (activeEdgeHaloMesh.userData.edges ?? []).forEach((edge, index) => {
        const endpoints = edgeEndpoints(edge);
        if (!endpoints) return;
        const width = selectedEdgeWidth(edge, widthScale) * 1.55;
        const matrix = beamMatrix(endpoints.start, endpoints.end, width);
        if (matrix) activeEdgeHaloMesh.setMatrixAt(index, matrix);
      });
      activeEdgeHaloMesh.instanceMatrix.needsUpdate = true;
      activeEdgeHaloMesh.computeBoundingSphere();
      materials.activeHalo.opacity = clamp(0.26, 0.58, state.edgeOpacity * 0.86 * (1 + state.focusTension * 0.2));
    }

    if (arrowMesh) {
      const widthScale = clamp(0.4, 4, state.edgeWidth);
      (arrowMesh.userData.edges ?? []).forEach((edge, index) => {
        const endpoints = edgeEndpoints(edge);
        if (!endpoints) return;
        const arrowLength = clamp(5, 22, focusNodeRadius(endpoints.targetNode) * 0.74);
        const dummy = new THREE.Object3D();
        dummy.position.copy(endpoints.end).addScaledVector(endpoints.direction, -arrowLength * 0.52);
        dummy.quaternion.setFromUnitVectors(UP, endpoints.direction);
        const arrowRadius = arrowLength * 0.32 * widthScale;
        dummy.scale.set(arrowRadius, arrowLength, arrowRadius);
        dummy.updateMatrix();
        arrowMesh.setMatrixAt(index, dummy.matrix);
      });
      arrowMesh.instanceMatrix.needsUpdate = true;
      arrowMesh.computeBoundingSphere();
    }
  }

  function updateCommunityVisibility() {
    const visibleIds = asIdSet(state.model.visibleNodes);
    const visibleCommunities = new Set(
      data.nodes.filter((node) => visibleIds.has(node.id)).map((node) => node.community),
    );
    for (const [communityId, object] of communityObjects) {
      object.visible = state.layout === 'community' && state.showCommunities && visibleCommunities.has(communityId);
    }
    for (const light of communityLights) {
      light.visible = state.layout === 'community' && state.showCommunities && visibleCommunities.has(light.userData.communityId);
    }
    grid.visible = state.showGrid;
  }

  function intersectNodes(ndc) {
    if (!nodeMeshes.length) return '';
    raycaster.setFromCamera(ndc, camera);
    const intersections = raycaster.intersectObjects(nodeMeshes, false);
    for (const intersection of intersections) {
      const nodeId = intersection.object.userData.nodeIds?.[intersection.instanceId];
      if (nodeId) return nodeId;
    }
    return '';
  }

  function pick(point = {}) {
    if (state.disposed || state.contextLost) return '';
    const width = Math.max(1, state.viewport.width);
    const height = Math.max(1, state.viewport.height);
    const x = finite(point.x, width / 2);
    const y = finite(point.y, height / 2);
    return intersectNodes(new THREE.Vector2(x / width * 2 - 1, -(y / height) * 2 + 1));
  }

  function updateReticleTarget() {
    const next = state.mode === 'first-person' ? intersectNodes(new THREE.Vector2(0, 0)) : '';
    if (next === state.reticleTarget) return;
    state.reticleTarget = next;
    options.onReticleTarget?.(next || null);
  }

  function spawnNearNode(nodeId) {
    const node = nodeById.get(nodeId);
    if (!node) return false;
    const target = worldPositionFor(node);
    const existingDirection = new THREE.Vector3().subVectors(camera.position, target);
    existingDirection.y *= 0.3;
    if (existingDirection.lengthSq() < EPSILON) existingDirection.set(0.6, 0.18, 1);
    existingDirection.normalize();
    const clearance = clamp(80, 420, Math.max(finite(node.radius, 10) * state.nodeScale * 9, worldDiagonal * 0.023));
    camera.position.copy(target).addScaledVector(existingDirection, clearance);
    camera.position.y += Math.max(12, finite(node.radius, 10) * state.nodeScale * 1.2);
    camera.lookAt(target);
    camera.updateMatrixWorld();
    state.orbitTarget.copy(target);
    return true;
  }

  function frameFocusedNeighborhood(nodeId) {
    const node = nodeById.get(nodeId);
    if (!node) return false;
    const selectedPosition = focusPhysics.get(node.id)?.target ?? worldPositionFor(node);
    const ids = [node.id, ...asIdSet(state.model.direct)];
    const box = new THREE.Box3();
    let count = 0;
    for (const id of ids) {
      const item = nodeById.get(id);
      if (!item) continue;
      const position = focusPhysics.get(id)?.target ?? worldPositionFor(item);
      const labelPadding = id === node.id
        ? focusNodeRadius(item) * 2.2 + 38
        : clamp(58, 180, String(item.title ?? '').length * 3.8 + focusNodeRadius(item) * 1.8);
      box.expandByPoint(position.clone().addScalar(labelPadding));
      box.expandByPoint(position.clone().addScalar(-labelPadding));
      count += 1;
    }
    if (!count || box.isEmpty()) return false;

    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);
    const halfVerticalFov = THREE.MathUtils.degToRad(camera.fov * 0.5);
    const halfHorizontalFov = Math.atan(Math.tan(halfVerticalFov) * Math.max(0.4, camera.aspect));
    const fitAngle = Math.max(0.18, Math.min(halfVerticalFov, halfHorizontalFov));
    state.orbitTarget.copy(selectedPosition);
    state.orbitDistance = clamp(
      Math.max(210, sphere.radius * 1.15),
      worldDiagonal * 4,
      Math.max(240, sphere.radius / Math.max(0.18, Math.sin(fitAngle)) * 1.26),
    );
    syncOrbitCamera();

    if (state.viewport.width >= 860) {
      const safe = focusLabelSafeArea();
      const safeCenterX = (safe.left + safe.right) / 2;
      const horizontalShiftPixels = state.viewport.width / 2 - safeCenterX;
      if (horizontalShiftPixels > 1) {
        const worldPerPixel = state.orbitDistance
          * 2
          * Math.tan(halfVerticalFov)
          / Math.max(1, state.viewport.height);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).normalize();
        state.orbitTarget.addScaledVector(right, horizontalShiftPixels * worldPerPixel);
        syncOrbitCamera();
      }
    }
    return true;
  }

  function focus(nodeId) {
    const node = nodeById.get(nodeId);
    if (!node) return false;
    if (state.mode === 'first-person') {
      spawnNearNode(nodeId);
    } else {
      frameFocusedNeighborhood(nodeId);
    }
    notifyCamera(true);
    render();
    return true;
  }

  function fit(ids) {
    const requested = asIdSet(ids);
    const candidates = requested.size ? requested : asIdSet(state.model.visibleNodes);
    const box = new THREE.Box3();
    let count = 0;
    for (const id of candidates) {
      const node = nodeById.get(id);
      if (!node) continue;
      const position = focusPhysics.get(node.id)?.target ?? worldPositionFor(node);
      const padding = Math.max(4, finite(node.radius, 8) * state.nodeScale * 1.7);
      box.expandByPoint(position.clone().addScalar(padding));
      box.expandByPoint(position.clone().addScalar(-padding));
      count += 1;
    }
    if (!count || box.isEmpty()) return false;
    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);
    state.orbitTarget.copy(sphere.center);
    const halfFov = THREE.MathUtils.degToRad(camera.fov * 0.5);
    state.orbitDistance = clamp(
      Math.max(90, sphere.radius / Math.max(0.18, Math.sin(halfFov)) * 1.22),
      worldDiagonal * 4,
      Math.max(110, sphere.radius * 1.25),
    );
    syncOrbitCamera();
    notifyCamera(true);
    render();
    return true;
  }

  function orbit(deltaX, deltaY) {
    if (state.mode !== 'orbit') return;
    state.orbitYaw -= finite(deltaX) * 0.0052;
    state.orbitElevation = clamp(
      ORBIT_MIN_ELEVATION,
      ORBIT_MAX_ELEVATION,
      state.orbitElevation + finite(deltaY) * 0.0042,
    );
    syncOrbitCamera();
    notifyCamera();
    render();
  }

  function pan(deltaX, deltaY) {
    if (state.mode !== 'orbit') return;
    const pixelsToWorld = state.orbitDistance
      * 2
      * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5))
      / Math.max(1, state.viewport.height);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).normalize();
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion).normalize();
    state.orbitTarget.addScaledVector(right, -finite(deltaX) * pixelsToWorld);
    state.orbitTarget.addScaledVector(up, finite(deltaY) * pixelsToWorld);
    syncOrbitCamera();
    notifyCamera();
    render();
  }

  function zoom(factor) {
    if (state.mode !== 'orbit') return;
    const safeFactor = Number.isFinite(Number(factor)) && Number(factor) > 0 ? Number(factor) : 1;
    state.orbitDistance = clamp(
      Math.max(34, worldDiagonal * 0.006),
      worldDiagonal * 4,
      state.orbitDistance / safeFactor,
    );
    syncOrbitCamera();
    notifyCamera();
    render();
  }

  function setMode(mode, { selectedId } = {}) {
    const next = normalizeMode(mode, state.mode);
    if (next === state.mode) {
      if (next === 'first-person' && selectedId) spawnNearNode(selectedId);
      return state.mode;
    }
    if (next === 'first-person') {
      state.mode = next;
      if (selectedId && nodeById.has(selectedId)) spawnNearNode(selectedId);
      else camera.updateMatrixWorld();
      state.velocity.set(0, 0, 0);
    } else {
      releasePointerLock();
      const targetId = selectedId || state.reticleTarget || state.selected;
      const targetNode = nodeById.get(targetId);
      if (targetNode) state.orbitTarget.copy(worldPositionFor(targetNode));
      else {
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        state.orbitTarget.copy(camera.position).addScaledVector(direction, Math.max(100, worldDiagonal * 0.045));
      }
      const offset = new THREE.Vector3().subVectors(camera.position, state.orbitTarget);
      state.orbitDistance = clamp(Math.max(34, worldDiagonal * 0.006), worldDiagonal * 4, offset.length());
      if (offset.lengthSq() > EPSILON) {
        state.orbitYaw = Math.atan2(offset.x, offset.z);
        state.orbitElevation = clamp(
          ORBIT_MIN_ELEVATION,
          ORBIT_MAX_ELEVATION,
          Math.asin(clamp(-1, 1, offset.y / state.orbitDistance)),
        );
      }
      state.mode = next;
      state.velocity.set(0, 0, 0);
      syncOrbitCamera();
    }
    updateReticleTarget();
    notifyCamera(true);
    render();
    return state.mode;
  }

  function requestPointerLock() {
    if (state.disposed || state.contextLost) return false;
    if (state.mode !== 'first-person') setMode('first-person', { selectedId: state.selected });
    if (!pointerLockAvailable) {
      options.onPointerLockChange?.(false);
      return false;
    }
    try {
      const request = canvas.requestPointerLock();
      if (request && typeof request.catch === 'function') {
        request.catch(() => {
          canvas.dataset.pointerLock = 'unavailable';
          options.onPointerLockChange?.(false);
        });
      }
    } catch {
      canvas.dataset.pointerLock = 'unavailable';
      options.onPointerLockChange?.(false);
      return false;
    }
    return true;
  }

  function releasePointerLock() {
    if (documentRef.pointerLockElement === canvas && typeof documentRef.exitPointerLock === 'function') {
      documentRef.exitPointerLock();
    }
  }

  function setKey(key, pressed) {
    const normalized = normalizedKey(key);
    if (!normalized) return;
    if (pressed) state.keys.add(normalized);
    else state.keys.delete(normalized);
    ensureAnimationLoop();
  }

  function clearKeys() {
    state.keys.clear();
    state.velocity.set(0, 0, 0);
  }

  function look(deltaX, deltaY) {
    if (state.mode !== 'first-person') return;
    const euler = new THREE.Euler(0, 0, 0, 'YXZ').setFromQuaternion(camera.quaternion);
    euler.y -= finite(deltaX) * 0.0022;
    euler.x = clamp(-Math.PI / 2 + 0.06, Math.PI / 2 - 0.06, euler.x - finite(deltaY) * 0.0022);
    camera.quaternion.setFromEuler(euler);
    camera.updateMatrixWorld();
    notifyCamera();
    render();
  }

  function setFlightSpeed(value) {
    state.flightSpeedMultiplier = clamp(0.25, 4, finite(value, state.flightSpeedMultiplier));
    notifyCamera(true);
    ensureAnimationLoop();
    return state.flightSpeedMultiplier;
  }

  function setFov(value) {
    camera.fov = clamp(MIN_FOV, MAX_FOV, finite(value, camera.fov));
    camera.updateProjectionMatrix();
    notifyCamera(true);
    render();
    return camera.fov;
  }

  function updateFlight(deltaSeconds) {
    if (state.mode !== 'first-person') return;
    const forwardAmount = Number(state.keys.has('w') || state.keys.has('arrowup'))
      - Number(state.keys.has('s') || state.keys.has('arrowdown'));
    const rightAmount = Number(state.keys.has('d') || state.keys.has('arrowright'))
      - Number(state.keys.has('a') || state.keys.has('arrowleft'));
    const verticalAmount = Number(state.keys.has('space'))
      - Number(state.keys.has('ctrl') || state.keys.has('c'));
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    if (forward.lengthSq() < EPSILON) forward.set(0, 0, -1);
    forward.normalize();
    const right = new THREE.Vector3().crossVectors(forward, UP).normalize();
    const desired = new THREE.Vector3()
      .addScaledVector(forward, forwardAmount)
      .addScaledVector(right, rightAmount)
      .addScaledVector(UP, verticalAmount);
    if (desired.lengthSq() > 1) desired.normalize();
    const sprint = state.keys.has('shift') ? 2.55 : 1;
    desired.multiplyScalar(baseFlightSpeed * state.flightSpeedMultiplier * sprint);
    const response = 1 - Math.exp(-deltaSeconds * 9.5);
    state.velocity.lerp(desired, response);
    if (!forwardAmount && !rightAmount && !verticalAmount) {
      state.velocity.multiplyScalar(Math.exp(-deltaSeconds * 7.2));
    }
    if (state.velocity.lengthSq() < 0.0001) {
      state.velocity.set(0, 0, 0);
      return;
    }
    camera.position.addScaledVector(state.velocity, deltaSeconds);
    const horizontalMargin = Math.max(dimensions.width, dimensions.height) * 0.34;
    camera.position.x = clamp(-dimensions.width / 2 - horizontalMargin, dimensions.width / 2 + horizontalMargin, camera.position.x);
    camera.position.z = clamp(-dimensions.height / 2 - horizontalMargin, dimensions.height / 2 + horizontalMargin, camera.position.z);
    camera.position.y = clamp(-30, Math.max(dimensions.depth * 3, horizontalMargin * 1.3), camera.position.y);
    camera.updateMatrixWorld();
  }

  function resize(width, height, dpr = 1) {
    if (state.disposed) return;
    state.viewport.width = Math.max(1, finite(width, canvas.clientWidth || 1));
    state.viewport.height = Math.max(1, finite(height, canvas.clientHeight || 1));
    state.viewport.dpr = clamp(0.75, 1.75, finite(dpr, 1));
    renderer.setPixelRatio(state.viewport.dpr);
    renderer.setSize(state.viewport.width, state.viewport.height, false);
    camera.aspect = state.viewport.width / state.viewport.height;
    camera.updateProjectionMatrix();
    render();
  }

  function update(nextState = {}) {
    if (state.disposed) return;
    const previousSelected = state.selected;
    const previousLayout = state.layout;
    const nextModel = nextState.model ?? state.model;
    state.model = {
      ...state.model,
      ...nextModel,
      visibleNodes: asIdSet(nextModel.visibleNodes ?? state.model.visibleNodes),
      direct: asIdSet(nextModel.direct ?? state.model.direct),
      second: asIdSet(nextModel.second ?? state.model.second),
      queryMatches: asIdSet(nextModel.queryMatches ?? state.model.queryMatches),
      renderedEdges: Array.isArray(nextModel.renderedEdges)
        ? nextModel.renderedEdges
        : state.model.renderedEdges,
    };
    state.selected = String(nextState.selected ?? state.selected ?? '');
    state.hovered = String(nextState.hovered ?? state.hovered ?? '');
    state.travelCandidate = String(nextState.travelCandidate ?? state.travelCandidate ?? '');
    state.routeNodeIds = asIdSet(nextState.routeNodeIds ?? state.routeNodeIds);
    state.routeEdgeIds = asIdSet(nextState.routeEdgeIds ?? state.routeEdgeIds);
    state.bookmarks = asIdSet(nextState.bookmarks ?? state.bookmarks);
    state.layout = normalizeLayout(nextState.layout, state.layout);
    state.nodeScale = clamp(0.35, 3, finite(nextState.nodeScale, state.nodeScale));
    state.edgeOpacity = clamp(0.05, 2.5, finite(nextState.edgeOpacity, state.edgeOpacity));
    state.edgeWidth = clamp(0.35, 4, finite(nextState.edgeWidth, state.edgeWidth));
    state.focusGravity = clamp(0.35, 1.6, finite(nextState.focusGravity, state.focusGravity));
    state.heightScale = clamp(0, 3, finite(nextState.heightScale, state.heightScale));
    state.labelDensity = clamp(0, 3, Math.round(finite(nextState.labelDensity, state.labelDensity)));
    state.showGrid = nextState.showGrid === undefined ? state.showGrid : Boolean(nextState.showGrid);
    state.showCommunities = nextState.showCommunities === undefined
      ? state.showCommunities
      : Boolean(nextState.showCommunities);
    state.showArrows = nextState.showArrows === undefined ? state.showArrows : Boolean(nextState.showArrows);
    state.autoRotate = nextState.autoRotate === undefined ? state.autoRotate : Boolean(nextState.autoRotate);
    if (nextState.mode !== undefined) {
      const requestedMode = normalizeMode(nextState.mode, state.mode);
      if (requestedMode !== state.mode) setMode(requestedMode, { selectedId: state.selected });
    }
    const focusLayoutChanged = configureFocusLayout();
    const selectionChanged = previousSelected !== state.selected;
    const layoutChanged = previousLayout !== state.layout;
    if ((selectionChanged || layoutChanged) && state.selected && state.mode === 'orbit') frameFocusedNeighborhood(state.selected);
    const nodesChanged = focusLayoutChanged || currentNodeBuildSignature() !== state.nodeBuildSignature;
    if (nodesChanged) buildNodes();
    if (nodesChanged || currentEdgeBuildSignature() !== state.edgeBuildSignature) buildEdges();
    updateCommunityVisibility();
    if (nodesChanged || currentLabelBuildSignature() !== state.labelBuildSignature) buildLabels();
    updateReticleTarget();
    render();
  }

  function animationShouldRun() {
    if (!state.active || state.disposed || state.contextLost || documentRef.visibilityState === 'hidden') return false;
    return state.mode === 'first-person' || state.autoRotate || !reducedMotion;
  }

  function stopAnimationLoop() {
    if (!state.animationFrame) return;
    windowRef?.cancelAnimationFrame(state.animationFrame);
    state.animationFrame = 0;
  }

  function animationTick(timestamp) {
    state.animationFrame = 0;
    if (!animationShouldRun()) return;
    render(timestamp);
  }

  function ensureAnimationLoop() {
    if (!animationShouldRun()) {
      stopAnimationLoop();
      return;
    }
    if (!state.animationFrame) state.animationFrame = windowRef.requestAnimationFrame(animationTick);
  }

  function render(timestamp = windowRef?.performance?.now?.() ?? Date.now()) {
    if (!state.active || state.disposed || state.contextLost) return;
    const deltaSeconds = state.lastFrameTime
      ? Math.min(0.05, Math.max(0, (timestamp - state.lastFrameTime) / 1000))
      : 0;
    state.lastFrameTime = timestamp;
    state.elapsedTime += deltaSeconds;
    const focusMoved = updateFocusPhysics(deltaSeconds);
    if (focusMoved) syncDynamicScene();
    if (state.mode === 'first-person') updateFlight(deltaSeconds);
    else if (state.autoRotate && !reducedMotion) {
      state.orbitYaw += deltaSeconds * 0.09;
      syncOrbitCamera();
    }
    if (!reducedMotion) {
      const elapsed = state.elapsedTime;
      if (dust) dust.rotation.y = elapsed * 0.0035;
      materials.glow.opacity = 0.22 + Math.sin(elapsed * 1.35) * 0.025;
      materials.highlights.opacity = 0.82 + Math.sin(elapsed * 2.1) * 0.13;
      if (routeGroup) routeGroup.rotation.y = Math.sin(elapsed * 0.24) * 0.0015;
    } else {
      materials.glow.opacity = 0.22;
      materials.highlights.opacity = 0.9;
    }
    updateReticleTarget();
    updateLabelScales();
    renderer.render(scene, camera);
    notifyCamera();
    ensureAnimationLoop();
  }

  function setActive(nextActive) {
    state.active = Boolean(nextActive);
    canvas.dataset.webglActive = String(state.active);
    if (!state.active) {
      stopAnimationLoop();
      clearKeys();
      releasePointerLock();
      return;
    }
    state.lastFrameTime = 0;
    render();
  }

  function getReticleTarget() {
    return state.reticleTarget || '';
  }

  function dispatchContextEvent(name) {
    const EventConstructor = documentRef.defaultView?.CustomEvent ?? CustomEvent;
    canvas.dispatchEvent(new EventConstructor(name, {
      bubbles: false,
      detail: { renderer: 'webgl' },
    }));
  }

  function handleContextLost(event) {
    event.preventDefault();
    state.contextLost = true;
    stopAnimationLoop();
    clearKeys();
    releasePointerLock();
    canvas.dataset.webglState = 'lost';
    dispatchContextEvent('graph-webgl-contextlost');
  }

  function handleContextRestored() {
    state.contextLost = false;
    canvas.dataset.webglState = 'ready';
    renderer.resetState?.();
    buildNodes();
    buildEdges();
    updateCommunityVisibility();
    buildLabels();
    dispatchContextEvent('graph-webgl-contextrestored');
    render();
  }

  function handlePointerLock() {
    pointerLocked = documentRef.pointerLockElement === canvas;
    options.onPointerLockChange?.(pointerLocked);
    if (!pointerLocked) clearKeys();
    notifyCamera(true);
  }

  function handlePointerLockError() {
    pointerLocked = false;
    canvas.dataset.pointerLock = 'unavailable';
    clearKeys();
    options.onPointerLockChange?.(false);
    notifyCamera(true);
  }

  function handleLockedMouseMove(event) {
    if (!pointerLocked || state.mode !== 'first-person') return;
    look(event.movementX, event.movementY);
  }

  function handleVisibilityChange() {
    if (documentRef.visibilityState === 'hidden') stopAnimationLoop();
    else ensureAnimationLoop();
  }

  function dispose() {
    if (state.disposed) return;
    state.disposed = true;
    stopAnimationLoop();
    clearKeys();
    releasePointerLock();
    canvas.removeEventListener('webglcontextlost', handleContextLost);
    canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    documentRef.removeEventListener('pointerlockchange', handlePointerLock);
    documentRef.removeEventListener('pointerlockerror', handlePointerLockError);
    documentRef.removeEventListener('mousemove', handleLockedMouseMove);
    documentRef.removeEventListener('visibilitychange', handleVisibilityChange);
    const disposed = new Set();
    scene.traverse((object) => {
      if (object.geometry && !disposed.has(object.geometry)) {
        disposed.add(object.geometry);
        object.geometry.dispose();
      }
      if (object.material) disposeMaterial(object.material, disposed);
    });
    for (const geometry of Object.values(geometries)) {
      if (!disposed.has(geometry)) geometry.dispose();
    }
    for (const material of Object.values(materials)) disposeMaterial(material, disposed);
    for (const texture of labelTextureCache.values()) {
      if (!disposed.has(texture)) texture.dispose();
    }
    labelTextureCache.clear();
    if (!disposed.has(glowTexture)) glowTexture.dispose();
    renderer.renderLists.dispose();
    renderer.dispose();
  }

  canvas.addEventListener('webglcontextlost', handleContextLost, false);
  canvas.addEventListener('webglcontextrestored', handleContextRestored, false);
  documentRef.addEventListener('pointerlockchange', handlePointerLock);
  documentRef.addEventListener('pointerlockerror', handlePointerLockError);
  documentRef.addEventListener('mousemove', handleLockedMouseMove);
  documentRef.addEventListener('visibilitychange', handleVisibilityChange);
  canvas.dataset.webglState = 'ready';

  createAtmosphere();
  createCommunities();
  dominantCommunitySpawn();
  syncOrbitCamera();
  buildNodes();
  buildEdges();
  updateCommunityVisibility();
  buildLabels();
  resize(state.viewport.width, state.viewport.height, documentRef.defaultView?.devicePixelRatio ?? 1);
  options.onPointerLockChange?.(false);
  notifyCamera(true);

  return {
    update,
    resize,
    render,
    pick,
    orbit,
    pan,
    zoom,
    fit,
    focus,
    setMode,
    requestPointerLock,
    releasePointerLock,
    setKey,
    clearKeys,
    look,
    setFlightSpeed,
    setFov,
    getCameraInfo,
    getReticleTarget,
    setActive,
    dispose,
  };
}
