import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CAMERA_LIMITS,
  DEFAULT_CAMERA,
  hitTestProjected,
  normalizeCamera,
  projectPoint,
  rotatePoint,
  sortProjected,
} from '../../site/assets/graph-3d-math.js';

const EPSILON = 1e-9;
const viewport = { width: 1200, height: 760 };
const dimensions = { width: 2800, height: 1300, depth: 460 };

function near(actual, expected, message) {
  assert.ok(Math.abs(actual - expected) <= EPSILON, `${message}: ${actual} != ${expected}`);
}

test('3D rotation preserves identity and maps cardinal axes deterministically', () => {
  const point = { x: 2, y: 3, z: 5 };
  assert.deepEqual(rotatePoint(point, { yaw: 0, pitch: 0, flat: false }), point);

  const yawed = rotatePoint({ x: 1, y: 0, z: 0 }, { yaw: Math.PI / 2, pitch: 0, flat: false });
  near(yawed.x, 0, 'yaw x');
  near(yawed.y, 1, 'yaw y');
  near(yawed.z, 0, 'yaw z');

  const pitched = rotatePoint({ x: 0, y: 0, z: 1 }, { yaw: 0, pitch: Math.PI / 2, flat: false });
  near(pitched.x, 0, 'pitch x');
  near(pitched.y, -1, 'pitch y');
  near(pitched.z, 0, 'pitch z');
});

test('3D projection centers the optical origin and makes taller nodes appear nearer', () => {
  const flatCamera = { ...DEFAULT_CAMERA, yaw: 0, pitch: 0, zoom: 1, panX: 0, panY: 0, flat: true };
  const center = projectPoint({ x: 1400, y: 650, z: 0 }, flatCamera, viewport, dimensions);
  near(center.x, viewport.width / 2, 'center x');
  near(center.y, viewport.height / 2, 'center y');

  const base = projectPoint({ x: 1550, y: 650, z: 0 }, DEFAULT_CAMERA, viewport, dimensions);
  const raised = projectPoint({ x: 1550, y: 650, z: 300 }, DEFAULT_CAMERA, viewport, dimensions);
  assert.ok(raised.scale > base.scale);
  assert.ok(Math.abs(raised.x - viewport.width / 2) > Math.abs(base.x - viewport.width / 2));
  assert.equal(projectPoint({ x: 1400, y: 650, z: 10000 }, DEFAULT_CAMERA, viewport, dimensions), null);
});

test('scene fitting gives a wide atlas meaningful viewport coverage', () => {
  const flatCamera = { ...DEFAULT_CAMERA, yaw: 0, pitch: 0, zoom: 1, panX: 0, panY: 0, flat: true };
  const corners = [
    projectPoint({ x: 0, y: 0, z: 0 }, flatCamera, viewport, dimensions),
    projectPoint({ x: dimensions.width, y: dimensions.height, z: 0 }, flatCamera, viewport, dimensions),
  ];
  const width = Math.abs(corners[1].x - corners[0].x);
  const height = Math.abs(corners[1].y - corners[0].y);
  assert.ok(width >= viewport.width * 0.88 && width <= viewport.width * 0.91);
  assert.ok(height >= viewport.height * 0.62);
});

test('camera normalization clamps pitch and zoom to supported bounds', () => {
  const camera = normalizeCamera({ pitch: -99, zoom: 99, distance: 1 });
  assert.equal(camera.pitch, CAMERA_LIMITS.minimumPitch);
  assert.equal(camera.zoom, CAMERA_LIMITS.maximumZoom);
  assert.equal(camera.distance, DEFAULT_CAMERA.distance);
});

test('depth sorting and hit testing prefer the nearest visible node', () => {
  const nodes = [
    { id: 'far', radius: 8 },
    { id: 'near', radius: 8 },
    { id: 'hidden', radius: 30 },
  ];
  const projections = new Map([
    ['far', { x: 100, y: 100, scale: 1, depth: -10 }],
    ['near', { x: 100, y: 100, scale: 1.2, depth: 40 }],
    ['hidden', { x: 100, y: 100, scale: 2, depth: 80 }],
  ]);
  assert.deepEqual(sortProjected(nodes, projections).map((node) => node.id), ['far', 'near', 'hidden']);
  assert.equal(hitTestProjected(nodes, projections, { x: 100, y: 100 }, {
    visibleIds: new Set(['far', 'near']),
    minimumRadius: 4,
  }).id, 'near');
});
