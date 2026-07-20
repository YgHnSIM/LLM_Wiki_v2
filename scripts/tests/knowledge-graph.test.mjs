import assert from 'node:assert/strict';
import test from 'node:test';
import { buildKnowledgeGraph } from '../lib/knowledge-graph.mjs';

function page(id, {
  type = 'concept',
  category = 'concepts',
  tags = ['type/concept', 'domain/nlp'],
} = {}) {
  return {
    id,
    title: id,
    aliases: [],
    pageType: type,
    category,
    url: `/${category}/${id}/`,
    verification: 'verified',
    evidence: [{ sourceId: 'test-source' }],
    excerpt: `${id} 설명`,
    tags,
    outgoing: [],
    relatedDocuments: [],
  };
}

function assertLayoutHasNoMarkerOverlaps(graph, layoutId, nodes = graph.nodes) {
  for (let leftIndex = 0; leftIndex < nodes.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < nodes.length; rightIndex += 1) {
      const left = nodes[leftIndex];
      const right = nodes[rightIndex];
      const leftPosition = left.layouts[layoutId];
      const rightPosition = right.layouts[layoutId];
      const distance = Math.hypot(
        rightPosition.x - leftPosition.x,
        rightPosition.y - leftPosition.y,
      );
      const minimum = left.radius + right.radius + 28;
      assert.ok(
        distance + 0.2 >= minimum,
        `${layoutId}: ${left.id} and ${right.id} overlap (${distance.toFixed(2)} < ${minimum.toFixed(2)})`,
      );
    }
  }
}

test('knowledge graph merges authored relation kinds while preserving direction', () => {
  const a = page('concept.a');
  const b = page('concept.b');
  const c = page('concept.c');
  const meta = page('meta.index', { type: 'meta', category: 'meta', tags: ['type/meta'] });
  a.outgoing = [b, b, a, meta];
  a.relatedDocuments = [b, b];
  b.outgoing = [a];
  meta.outgoing = [a];

  const graph = buildKnowledgeGraph([meta, c, b, a], { urlFor: (document) => `/base${document.url}` });

  assert.deepEqual(graph.nodes.map((node) => node.id), ['concept.a', 'concept.b', 'concept.c']);
  assert.equal(graph.edges.length, 2);
  assert.deepEqual(
    graph.edges.map(({ source, target, kinds }) => ({ source, target, kinds })),
    [
      { source: 'concept.a', target: 'concept.b', kinds: ['related', 'body'] },
      { source: 'concept.b', target: 'concept.a', kinds: ['body'] },
    ],
  );
  assert.equal(graph.edges.every((edge) => edge.source !== edge.target), true);
  const edgeAB = graph.edges.find((edge) => edge.source === 'concept.a' && edge.target === 'concept.b');
  const edgeBA = graph.edges.find((edge) => edge.source === 'concept.b' && edge.target === 'concept.a');
  assert.equal(edgeAB.kind, 'both');
  assert.equal(edgeAB.reciprocal, true);
  assert.equal(edgeAB.weight, 3);
  assert.equal(edgeBA.kind, 'body');
  assert.equal(edgeBA.reciprocal, true);
  assert.equal(edgeBA.weight, 2);

  const nodeA = graph.nodes.find((node) => node.id === 'concept.a');
  const nodeB = graph.nodes.find((node) => node.id === 'concept.b');
  const nodeC = graph.nodes.find((node) => node.id === 'concept.c');
  assert.equal(nodeA.url, '/base/concepts/concept.a/');
  assert.deepEqual(
    [nodeA.inDegree, nodeA.outDegree, nodeA.degree],
    [1, 1, 1],
  );
  assert.deepEqual(
    [nodeB.inDegree, nodeB.outDegree, nodeB.degree],
    [1, 1, 1],
  );
  assert.deepEqual(
    [nodeC.inDegree, nodeC.outDegree, nodeC.degree],
    [0, 0, 0],
  );
});

test('knowledge graph layout and communities are deterministic and internally consistent', () => {
  const pages = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => page(`concept.${id}`));
  for (let index = 0; index < pages.length - 1; index += 1) {
    pages[index].outgoing = [pages[index + 1]];
    pages[index].relatedDocuments = [pages[index + 1]];
  }

  const first = buildKnowledgeGraph(pages);
  const second = buildKnowledgeGraph([...pages].reverse());

  assert.deepEqual(first, second);
  assert.equal(first.stats.nodes, first.nodes.length);
  assert.equal(first.stats.edges, first.edges.length);
  assert.equal(first.stats.communities, first.communities.length);
  assert.equal(first.schemaVersion, 2);
  assert.equal(first.layoutVersion, 6);
  assert.equal(first.defaultLayout, 'community');
  assert.deepEqual(
    first.layouts.map(({ id, grouped }) => ({ id, grouped })),
    [
      { id: 'community', grouped: true },
      { id: 'network', grouped: false },
      { id: 'radial', grouped: false },
    ],
  );
  assert.equal(first.depthMetric, 'cross-community-neighbors');
  assert.equal(first.depthScale, 'log1p');
  assert.ok(first.dimensions.depth > 0);
  assert.equal(first.nodes.every((node) => (
    Number.isFinite(node.x)
    && Number.isFinite(node.y)
    && Number.isFinite(node.z)
    && node.z >= 0
    && node.z <= first.dimensions.depth
  )), true);
  assert.equal(first.nodes.every((node) => (
    Object.keys(node.layouts).join(',') === 'community,network,radial'
    && Object.values(node.layouts).every((position) => (
      Number.isFinite(position.x)
      && Number.isFinite(position.y)
      && position.x >= 0
      && position.x <= first.dimensions.width
      && position.y >= 0
      && position.y <= first.dimensions.height
    ))
    && node.x === node.layouts.community.x
    && node.y === node.layouts.community.y
  )), true);
  assert.equal(first.communities.every((community) => community.z === 0), true);
  assert.equal(first.edges.every((edge) => first.nodes.some((node) => node.id === edge.source)), true);
  assert.equal(first.edges.every((edge) => first.nodes.some((node) => node.id === edge.target)), true);

  assert.equal(
    first.communities.reduce((sum, community) => sum + community.size, 0),
    first.nodes.length,
  );
  for (const community of first.communities) {
    assert.equal(
      community.size,
      first.nodes.filter((node) => node.community === community.id).length,
    );
  }

  for (let leftIndex = 0; leftIndex < first.communities.length; leftIndex += 1) {
    const left = first.communities[leftIndex];
    for (let rightIndex = leftIndex + 1; rightIndex < first.communities.length; rightIndex += 1) {
      const right = first.communities[rightIndex];
      const separatedHorizontally = Math.abs(left.x - right.x) >= (left.radius + right.radius) * 1.22;
      const separatedVertically = Math.abs(left.y - right.y) >= (left.radius + right.radius) * 0.92;
      assert.ok(separatedHorizontally || separatedVertically, `communities ${left.id} and ${right.id} overlap`);
    }
  }

  const byBridgeCount = [...first.nodes].sort((left, right) => left.bridgeConnections - right.bridgeConnections);
  for (let index = 1; index < byBridgeCount.length; index += 1) {
    assert.ok(byBridgeCount[index].z >= byBridgeCount[index - 1].z);
  }
  assert.equal(first.nodes.filter((node) => node.bridgeConnections === 0).every((node) => node.z === 0), true);
  if (first.stats.maxBridgeConnections > 0) {
    assert.equal(Math.max(...first.nodes.map((node) => node.z)), first.dimensions.depth);
  }
  for (const layout of first.layouts) assertLayoutHasNoMarkerOverlaps(first, layout.id);
});

test('bridge counts represent unique cross-community neighbors, not directed edge count', () => {
  const left = Array.from({ length: 6 }, (_, index) => page(`concept.left-${index}`));
  const right = Array.from({ length: 6 }, (_, index) => page(`concept.right-${index}`));

  for (const group of [left, right]) {
    for (const source of group) {
      source.outgoing = group.filter((target) => target !== source);
      source.relatedDocuments = group.filter((target) => target !== source);
    }
  }

  // Both directions describe one bridge neighbor for each endpoint.
  left[0].outgoing.push(right[0]);
  left[0].relatedDocuments.push(right[0]);
  right[0].outgoing.push(left[0]);

  const graph = buildKnowledgeGraph([...left, ...right]);
  assert.ok(graph.stats.crossCommunityEdges > 0, 'fixture must form at least one cross-community edge');

  for (const node of graph.nodes) {
    const crossCommunityNeighbors = new Set(
      graph.edges
        .filter((edge) => edge.crossCommunity && (edge.source === node.id || edge.target === node.id))
        .map((edge) => edge.source === node.id ? edge.target : edge.source),
    );
    assert.equal(node.bridgeConnections, crossCommunityNeighbors.size);
    assert.ok(node.bridgeConnections <= node.degree);
  }

  const leftBridge = graph.nodes.find((node) => node.id === left[0].id);
  const rightBridge = graph.nodes.find((node) => node.id === right[0].id);
  assert.equal(leftBridge.bridgeConnections, 1);
  assert.equal(rightBridge.bridgeConnections, 1);
  assert.ok(leftBridge.z > 0);
  assert.ok(rightBridge.z > 0);
  assert.equal(
    graph.edges.filter((edge) => edge.crossCommunity && (
      (edge.source === leftBridge.id && edge.target === rightBridge.id)
      || (edge.source === rightBridge.id && edge.target === leftBridge.id)
    )).length,
    2,
  );
});

test('dense community layout keeps node markers from overlapping', () => {
  const pages = Array.from({ length: 36 }, (_, index) => page(`concept.dense-${String(index).padStart(2, '0')}`));
  for (const source of pages) {
    source.outgoing = pages.filter((target) => target !== source);
  }

  const graph = buildKnowledgeGraph(pages);
  assert.equal(graph.communities.length, 1, 'a complete graph should remain one community');

  const members = graph.nodes.filter((node) => node.community === graph.communities[0].id);
  for (const layout of graph.layouts) assertLayoutHasNoMarkerOverlaps(graph, layout.id, members);
});

test('center-periphery layout places the most connected node inside isolated documents', () => {
  const hub = page('concept.hub');
  const leaves = Array.from({ length: 8 }, (_, index) => page(`concept.leaf-${index}`));
  const isolated = page('concept.isolated');
  hub.outgoing = leaves;
  hub.relatedDocuments = leaves;

  const graph = buildKnowledgeGraph([isolated, ...leaves, hub]);
  const graphCenter = {
    x: graph.dimensions.width / 2,
    y: graph.dimensions.height / 2,
  };
  const distanceFromCenter = (node) => Math.hypot(
    node.layouts.radial.x - graphCenter.x,
    node.layouts.radial.y - graphCenter.y,
  );
  const graphHub = graph.nodes.find((node) => node.id === hub.id);
  const graphIsolated = graph.nodes.find((node) => node.id === isolated.id);

  assert.equal(distanceFromCenter(graphHub), 0);
  assert.ok(distanceFromCenter(graphIsolated) > distanceFromCenter(graphHub));
  assert.ok(
    distanceFromCenter(graphIsolated)
      >= Math.max(...leaves.map((leaf) => distanceFromCenter(graph.nodes.find((node) => node.id === leaf.id)))),
  );
});

test('relationship layout pulls a stronger authored connection closer', () => {
  const hub = page('concept.hub');
  const strong = page('concept.strong');
  const weak = page('concept.weak');
  hub.outgoing = [strong, weak];
  hub.relatedDocuments = [strong];
  strong.outgoing = [hub];

  const graph = buildKnowledgeGraph([weak, strong, hub]);
  const byId = new Map(graph.nodes.map((node) => [node.id, node]));
  const networkDistance = (leftId, rightId) => {
    const left = byId.get(leftId).layouts.network;
    const right = byId.get(rightId).layouts.network;
    return Math.hypot(right.x - left.x, right.y - left.y);
  };

  assert.ok(
    networkDistance(hub.id, strong.id) < networkDistance(hub.id, weak.id),
    'related, narrative, and reciprocal evidence should create a shorter weighted spring',
  );
});

test('narrative links stay distinct from links in the curated related section', () => {
  const a = page('concept.a');
  const b = page('concept.b');
  a.outgoing = [b];
  a.graphOutgoing = [];
  a.relatedDocuments = [b];

  const graph = buildKnowledgeGraph([a, b]);

  assert.equal(graph.edges.length, 1);
  assert.equal(graph.edges[0].kind, 'related');
  assert.deepEqual(graph.edges[0].kinds, ['related']);
});
