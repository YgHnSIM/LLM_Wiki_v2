import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CAMERA_LIMITS,
  DEFAULT_CAMERA,
  cameraForWorldPoint,
  hitTestProjected,
  neighborhoodWithinDepth,
  normalizeCamera,
  projectPoint,
  rotatePoint,
  shortestPath,
  sortProjected,
  zoomCameraAt,
} from '../../site/assets/graph-3d-math.js';

const EPSILON = 1e-9;
const viewport = { width: 1200, height: 760 };
const dimensions = { width: 5600, height: 3200, depth: 900 };

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
  const center = projectPoint({ x: 2800, y: 1600, z: 0 }, flatCamera, viewport, dimensions);
  near(center.x, viewport.width / 2, 'center x');
  near(center.y, viewport.height / 2, 'center y');

  const base = projectPoint({ x: 3100, y: 1600, z: 0 }, DEFAULT_CAMERA, viewport, dimensions);
  const raised = projectPoint({ x: 3100, y: 1600, z: 300 }, DEFAULT_CAMERA, viewport, dimensions);
  assert.ok(raised.scale > base.scale);
  assert.ok(Math.abs(raised.x - viewport.width / 2) > Math.abs(base.x - viewport.width / 2));
  assert.equal(projectPoint({ x: 2800, y: 1600, z: 10000 }, DEFAULT_CAMERA, viewport, dimensions), null);
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

test('cursor-anchored zoom changes pan deterministically and respects zoom limits', () => {
  const camera = {
    ...DEFAULT_CAMERA,
    zoom: 1,
    panX: 12,
    panY: -8,
  };
  const anchor = { x: 900, y: 600 };
  const zoomed = zoomCameraAt(camera, anchor, viewport, 1.5);

  assert.equal(zoomed.zoom, 1.5);
  assert.equal(zoomed.panX, -132);
  assert.equal(zoomed.panY, -122);
  assert.deepEqual(zoomCameraAt(camera, anchor, viewport, 1.5), zoomed);

  const maximum = zoomCameraAt(camera, anchor, viewport, 100);
  assert.equal(maximum.zoom, CAMERA_LIMITS.maximumZoom);
  assert.equal(zoomCameraAt(camera, anchor, viewport, -1).zoom, camera.zoom);
});

test('camera focus centers a world point at a deterministic target zoom', () => {
  const point = { x: 2175, y: 410, z: 220 };
  const camera = cameraForWorldPoint(point, DEFAULT_CAMERA, viewport, dimensions, 1.7);
  const projected = projectPoint(point, camera, viewport, dimensions);

  assert.equal(camera.zoom, 1.7);
  near(projected.x, viewport.width / 2, 'focused x');
  near(projected.y, viewport.height / 2, 'focused y');
  assert.deepEqual(
    cameraForWorldPoint(point, DEFAULT_CAMERA, viewport, dimensions, 1.7),
    camera,
  );
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
  assert.equal(hitTestProjected(nodes, projections, { x: 118, y: 100 }, {
    visibleIds: new Set(['near']),
    minimumRadius: 4,
    radiusScale: 2,
  }).id, 'near');
});

test('neighborhood traversal is depth-bounded, undirected, and visibility-aware', () => {
  const edges = [
    { source: 'b', target: 'c' },
    { source: 'd', target: 'e' },
    { source: 'a', target: 'd' },
    { source: 'c', target: 'f' },
    { source: 'a', target: 'b' },
    { source: 'c', target: 'a' },
  ];
  const ids = (set) => [...set].sort();

  assert.deepEqual(ids(neighborhoodWithinDepth(edges, 'a', 0)), ['a']);
  assert.deepEqual(ids(neighborhoodWithinDepth(edges, 'a', 1)), ['a', 'b', 'c', 'd']);
  assert.deepEqual(ids(neighborhoodWithinDepth(edges, 'a', 2)), ['a', 'b', 'c', 'd', 'e', 'f']);
  assert.deepEqual(
    ids(neighborhoodWithinDepth(edges, 'a', 3, new Set(['a', 'b', 'c', 'd']))),
    ['a', 'b', 'c', 'd'],
  );
  assert.deepEqual(ids(neighborhoodWithinDepth(edges, 'a', 2, new Set(['b', 'c']))), []);
});

test('shortest path uses deterministic lexical tie-breaking and honors visibility', () => {
  const edges = [
    { source: 'c', target: 'd' },
    { source: 'a', target: 'c' },
    { source: 'b', target: 'd' },
    { source: 'a', target: 'b' },
    { source: 'd', target: 'e' },
  ];

  assert.deepEqual(shortestPath(edges, 'a', 'd'), ['a', 'b', 'd']);
  assert.deepEqual(shortestPath([...edges].reverse(), 'a', 'd'), ['a', 'b', 'd']);
  assert.deepEqual(
    shortestPath(edges, 'a', 'd', new Set(['a', 'c', 'd', 'e'])),
    ['a', 'c', 'd'],
  );
  assert.deepEqual(shortestPath(edges, 'e', 'a'), ['e', 'd', 'b', 'a']);
  assert.deepEqual(shortestPath(edges, 'a', 'a'), ['a']);
  assert.deepEqual(shortestPath(edges, 'a', 'missing'), []);
});
