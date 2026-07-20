import assert from 'node:assert/strict';
import test from 'node:test';
import {
  fitGraphTransform,
  focusRingPositions,
  hitTestGraphNode,
  resolvedLabelIds,
  screenToWorld,
  semanticZoomTier,
  visibleGraphElements,
  worldToScreen,
} from '../../site/assets/graph-map-model.js';

const EPSILON = 1e-9;

function near(actual, expected, label) {
  assert.ok(Math.abs(actual - expected) <= EPSILON, `${label}: ${actual} != ${expected}`);
}

const nodes = [
  { id: 'a', title: 'A', community: 0, degree: 10, bridgeConnections: 2, radius: 10, layouts: { community: { x: 100, y: 100 }, radial: { x: 50, y: 60 } } },
  { id: 'b', title: 'B', community: 0, degree: 3, bridgeConnections: 0, radius: 8, layouts: { community: { x: 240, y: 100 }, radial: { x: 80, y: 60 } } },
  { id: 'c', title: 'C', community: 1, degree: 8, bridgeConnections: 3, radius: 9, layouts: { community: { x: 500, y: 260 }, radial: { x: 110, y: 60 } } },
  { id: 'd', title: 'D', community: 1, degree: 1, bridgeConnections: 0, radius: 7, layouts: { community: { x: 640, y: 260 }, radial: { x: 140, y: 60 } } },
  { id: 'e', title: 'E', community: 2, degree: 5, bridgeConnections: 1, radius: 8, layouts: { community: { x: 800, y: 500 }, radial: { x: 170, y: 60 } } },
  { id: 'f', title: 'F', community: 2, degree: 0, bridgeConnections: 0, radius: 7, layouts: { community: { x: 920, y: 500 }, radial: { x: 200, y: 60 } } },
];

const edges = [
  { id: 'edge-1', source: 'a', target: 'b' },
  { id: 'edge-2', source: 'a', target: 'c' },
  { id: 'edge-3', source: 'c', target: 'd' },
  { id: 'edge-4', source: 'c', target: 'e' },
  { id: 'edge-5', source: 'e', target: 'f' },
];

const data = {
  defaultLayout: 'community',
  nodes,
  edges,
  communities: [
    { id: 0, label: 'Zero' },
    { id: 1, label: 'One' },
    { id: 2, label: 'Two' },
  ],
};

test('semantic zoom has stable overview, map, and detail boundaries', () => {
  assert.equal(semanticZoomTier(Number.NaN), 'overview');
  assert.equal(semanticZoomTier(0.79), 'overview');
  assert.equal(semanticZoomTier(0.8), 'map');
  assert.equal(semanticZoomTier(1.54), 'map');
  assert.equal(semanticZoomTier(1.55), 'detail');
  assert.equal(semanticZoomTier(Number.POSITIVE_INFINITY), 'detail');
});

test('fit transform keeps node bounds inside padding and centers the world bounds', () => {
  const transform = fitGraphTransform(nodes, 'community', { width: 1000, height: 600 }, {
    padding: { top: 40, right: 60, bottom: 40, left: 60 },
    maximumScale: 4,
  });

  for (const node of nodes) {
    const position = node.layouts.community;
    const screen = worldToScreen(position, transform);
    const radius = node.radius * transform.scale;
    assert.ok(screen.x - radius >= 60 - EPSILON, `${node.id} crosses left padding`);
    assert.ok(screen.x + radius <= 940 + EPSILON, `${node.id} crosses right padding`);
    assert.ok(screen.y - radius >= 40 - EPSILON, `${node.id} crosses top padding`);
    assert.ok(screen.y + radius <= 560 + EPSILON, `${node.id} crosses bottom padding`);
  }

  const worldCenter = {
    x: (transform.bounds.minX + transform.bounds.maxX) / 2,
    y: (transform.bounds.minY + transform.bounds.maxY) / 2,
  };
  assert.deepEqual(worldToScreen(worldCenter, transform), { x: 500, y: 300 });
});

test('world and screen coordinates round-trip without drift', () => {
  const transform = { scale: 0.375, translateX: 91.25, translateY: -33.5 };
  const world = { x: 348.125, y: -92.75 };
  const screen = worldToScreen(world, transform);
  const restored = screenToWorld(screen, transform);
  near(restored.x, world.x, 'world x');
  near(restored.y, world.y, 'world y');
});

test('overview uses community representatives while map and detail progressively expose labels', () => {
  const baseVisibleIds = new Set(nodes.map((node) => node.id));
  const overview = visibleGraphElements(data, { baseVisibleIds, scale: 0.5 });
  const map = visibleGraphElements(data, { baseVisibleIds, scale: 1 });
  const detail = visibleGraphElements(data, { baseVisibleIds, scale: 2 });

  assert.deepEqual([...overview.nodeIds], ['a', 'b', 'c', 'e']);
  assert.deepEqual([...overview.communityIds], [0, 1, 2]);
  assert.equal(map.nodeIds.size, nodes.length);
  assert.ok(map.labelIds.size <= detail.labelIds.size);
  assert.deepEqual([...detail.labelIds], ['a', 'b', 'c', 'd', 'e', 'f']);
  assert.deepEqual([...overview.edgeIds], ['edge-1', 'edge-2', 'edge-4']);
});

test('selection labels ignore hover and search outside the direct and route focus', () => {
  const result = visibleGraphElements(data, {
    baseVisibleIds: new Set(nodes.map((node) => node.id)),
    selectedId: 'a',
    directIds: new Set(['b', 'c']),
    routeIds: new Set(['a', 'c', 'e']),
    routeEdgeIds: new Set(['edge-4']),
    hoveredId: 'd',
    queryIds: new Set(['f']),
    scale: 1,
  });

  assert.deepEqual([...result.labelIds], ['a', 'b', 'c', 'e']);
  assert.equal(result.labelIds.has('d'), false);
  assert.equal(result.labelIds.has('f'), false);
  assert.deepEqual([...result.edgeIds], ['edge-1', 'edge-2', 'edge-4']);
});

test('runtime label resolution never reintroduces unrelated focus labels during selection', () => {
  const selected = resolvedLabelIds(new Set(['a', 'b', 'c', 'e']), {
    selectedId: 'a',
    directIds: new Set(['b', 'c']),
    routeIds: new Set(['a', 'c', 'e']),
    keyboardId: 'd',
    hoveredId: 'f',
  });
  assert.deepEqual([...selected], ['a', 'b', 'c', 'e']);
  assert.equal(selected.has('d'), false);
  assert.equal(selected.has('f'), false);

  const unselected = resolvedLabelIds(new Set(['a']), { keyboardId: 'd', hoveredId: 'f' });
  assert.deepEqual([...unselected], ['a', 'd', 'f']);
});

test('focus rings keep even a high-degree neighborhood inside the usable viewport', () => {
  const neighborIds = Array.from({ length: 83 }, (_, index) => `neighbor-${index}`);
  const center = { x: 100, y: 200 };
  const viewport = { width: 1200, height: 720 };
  const scale = 0.5;
  const positions = focusRingPositions(neighborIds, center, viewport, scale);
  assert.equal(positions.size, neighborIds.length);
  for (const position of positions.values()) {
    const screenDx = Math.abs(position.x - center.x) * scale;
    const screenDy = Math.abs(position.y - center.y) * scale;
    assert.ok(screenDx <= viewport.width / 2 - 72 + EPSILON);
    assert.ok(screenDy <= viewport.height / 2 - 64 + EPSILON);
  }
});

test('visibility is deterministic and filter sets remain authoritative', () => {
  const state = {
    baseVisibleIds: new Set(['e', 'd', 'c', 'a']),
    queryIds: new Set(['e', 'a']),
    scale: 1,
  };
  const forward = visibleGraphElements(data, state);
  const reversed = visibleGraphElements({
    ...data,
    nodes: [...nodes].reverse(),
    edges: [...edges].reverse(),
  }, state);
  const snapshot = (model) => Object.fromEntries(
    Object.entries(model).map(([key, values]) => [key, [...values]]),
  );

  assert.deepEqual(snapshot(reversed), snapshot(forward));
  assert.deepEqual([...forward.nodeIds], ['a', 'c', 'd', 'e']);
  assert.deepEqual([...forward.edgeIds], ['edge-2', 'edge-3', 'edge-4']);
});

test('hit test uses the requested layout, visible IDs, and nearest candidate', () => {
  const transform = { scale: 2, translateX: 10, translateY: 20, minimumHitRadius: 12 };
  const target = worldToScreen(nodes[2].layouts.radial, transform);
  assert.equal(hitTestGraphNode(data, 'radial', target, transform, new Set(['a', 'c']))?.id, 'c');
  assert.equal(hitTestGraphNode(data, 'radial', target, transform, new Set(['a'])), null);

  const compactTransform = { scale: 0.5, translateX: 10, translateY: 20, minimumHitRadius: 12 };
  const between = { x: 10 + 95 * 0.5, y: 20 + 60 * 0.5 };
  assert.equal(hitTestGraphNode(data, 'radial', between, compactTransform, new Set(['b', 'c']))?.id, 'c');
  assert.equal(hitTestGraphNode(data, 'radial', null, transform), null);
});
