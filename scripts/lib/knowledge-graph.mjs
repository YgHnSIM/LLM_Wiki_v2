const GRAPH_WIDTH = 1600;
const GRAPH_HEIGHT = 1000;
const GRAPH_DEPTH = 420;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

const clamp = (minimum, maximum, value) => Math.min(maximum, Math.max(minimum, value));

function stableHash(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function defaultTagLabel(tag) {
  return String(tag).replace(/^domain\//, '').replaceAll('-', ' ');
}

function edgeKey(source, target) {
  return `${source}\u0000${target}`;
}

function undirectedKey(source, target) {
  return source < target ? `${source}\u0000${target}` : `${target}\u0000${source}`;
}

function structuralCommunities(nodeIds, undirectedEdges, { resolution = 1.08 } = {}) {
  const adjacency = new Map(nodeIds.map((id) => [id, new Map()]));
  for (const edge of undirectedEdges) {
    adjacency.get(edge.source)?.set(edge.target, edge.weight);
    adjacency.get(edge.target)?.set(edge.source, edge.weight);
  }

  const degree = new Map(nodeIds.map((id) => [
    id,
    [...(adjacency.get(id)?.values() ?? [])].reduce((sum, weight) => sum + weight, 0),
  ]));
  const totalWeight = [...degree.values()].reduce((sum, value) => sum + value, 0);
  if (!totalWeight) return new Map(nodeIds.map((id, index) => [id, index]));

  const assignment = new Map(nodeIds.map((id, index) => [id, index]));
  const totals = new Map(nodeIds.map((id, index) => [index, degree.get(id)]));
  const order = [...nodeIds].sort((left, right) => (
    degree.get(right) - degree.get(left) || left.localeCompare(right, 'ko')
  ));

  for (let pass = 0; pass < 30; pass += 1) {
    let moved = 0;
    for (const id of order) {
      const current = assignment.get(id);
      const nodeDegree = degree.get(id);
      totals.set(current, (totals.get(current) ?? 0) - nodeDegree);

      const weightsByCommunity = new Map();
      for (const [neighbor, weight] of adjacency.get(id)) {
        const community = assignment.get(neighbor);
        weightsByCommunity.set(community, (weightsByCommunity.get(community) ?? 0) + weight);
      }

      let best = current;
      let bestGain = (weightsByCommunity.get(current) ?? 0)
        - resolution * nodeDegree * (totals.get(current) ?? 0) / totalWeight;
      for (const [community, internalWeight] of [...weightsByCommunity.entries()].sort((a, b) => a[0] - b[0])) {
        const gain = internalWeight - resolution * nodeDegree * (totals.get(community) ?? 0) / totalWeight;
        if (gain > bestGain + 1e-9 || (Math.abs(gain - bestGain) <= 1e-9 && community < best)) {
          best = community;
          bestGain = gain;
        }
      }

      assignment.set(id, best);
      totals.set(best, (totals.get(best) ?? 0) + nodeDegree);
      if (best !== current) moved += 1;
    }
    if (!moved) break;
  }

  // Singletons and pairs usually result from weak peripheral links. Attach them to
  // the neighboring community with the strongest authored connection so the map
  // remains legible without inventing a relationship.
  for (let pass = 0; pass < 2; pass += 1) {
    const members = new Map();
    for (const [id, community] of assignment) {
      if (!members.has(community)) members.set(community, []);
      members.get(community).push(id);
    }
    for (const [community, ids] of members) {
      if (ids.length >= 3) continue;
      const candidates = new Map();
      for (const id of ids) {
        for (const [neighbor, weight] of adjacency.get(id)) {
          const target = assignment.get(neighbor);
          if (target === community) continue;
          candidates.set(target, (candidates.get(target) ?? 0) + weight);
        }
      }
      const target = [...candidates.entries()]
        .sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]?.[0];
      if (target === undefined) continue;
      for (const id of ids) assignment.set(id, target);
    }
  }

  const groups = new Map();
  for (const [id, community] of assignment) {
    if (!groups.has(community)) groups.set(community, []);
    groups.get(community).push(id);
  }
  const orderedGroups = [...groups.values()]
    .map((ids) => ids.sort((a, b) => a.localeCompare(b, 'ko')))
    .sort((left, right) => right.length - left.length || left[0].localeCompare(right[0], 'ko'));

  return new Map(orderedGroups.flatMap((ids, index) => ids.map((id) => [id, index])));
}

function communityName(memberNodes, allNodes, tagLabel) {
  const globalCounts = new Map();
  for (const node of allNodes) {
    for (const tag of node.domainKeys) globalCounts.set(tag, (globalCounts.get(tag) ?? 0) + 1);
  }
  const localCounts = new Map();
  for (const node of memberNodes) {
    for (const tag of node.domainKeys) localCounts.set(tag, (localCounts.get(tag) ?? 0) + 1);
  }

  const specific = [...localCounts.entries()]
    .filter(([tag]) => tag !== 'domain/ai' || localCounts.size === 1)
    .map(([tag, count]) => ({
      tag,
      count,
      score: count * Math.log(1 + allNodes.length / (globalCounts.get(tag) ?? 1)),
    }))
    .sort((a, b) => b.score - a.score || b.count - a.count || a.tag.localeCompare(b.tag, 'ko'));

  if (specific.length) {
    const first = specific[0];
    const second = specific.find((item) => item.tag !== first.tag && item.count >= Math.max(2, first.count * 0.45));
    return [first, second].filter(Boolean).map((item) => tagLabel(item.tag)).join(' · ');
  }

  return [...memberNodes]
    .sort((a, b) => b.degree - a.degree || a.title.localeCompare(b.title, 'ko'))[0]?.title ?? '연결이 적은 문서';
}

function placeCommunityCenters(communities) {
  if (!communities.length) return;
  communities[0].x = GRAPH_WIDTH / 2;
  communities[0].y = GRAPH_HEIGHT / 2;

  const remaining = communities.length - 1;
  const innerCount = Math.min(6, remaining);
  const outerCount = Math.max(0, remaining - innerCount);
  for (let index = 1; index < communities.length; index += 1) {
    const inner = index <= innerCount;
    const slot = inner ? index - 1 : index - innerCount - 1;
    const slots = inner ? innerCount : outerCount;
    const angle = -Math.PI / 2
      + (inner ? 0 : Math.PI / Math.max(1, slots))
      + (slots > 0 ? slot * Math.PI * 2 / slots : 0);
    communities[index].x = GRAPH_WIDTH / 2 + Math.cos(angle) * (inner ? 405 : 620);
    communities[index].y = GRAPH_HEIGHT / 2 + Math.sin(angle) * (inner ? 285 : 380);
  }
}

function relaxNodeCollisions(nodes, community) {
  const padding = 4;
  for (let pass = 0; pass < 120; pass += 1) {
    let largestOverlap = 0;
    for (let leftIndex = 0; leftIndex < nodes.length; leftIndex += 1) {
      const left = nodes[leftIndex];
      for (let rightIndex = leftIndex + 1; rightIndex < nodes.length; rightIndex += 1) {
        const right = nodes[rightIndex];
        let dx = right.x - left.x;
        let dy = right.y - left.y;
        let distance = Math.hypot(dx, dy);
        const minimum = left.radius + right.radius + padding;
        if (distance >= minimum) continue;
        if (distance < 1e-6) {
          const angle = (stableHash(`${left.id}:${right.id}`) % 360) * Math.PI / 180;
          dx = Math.cos(angle);
          dy = Math.sin(angle);
          distance = 1;
        }
        const overlap = minimum - distance;
        largestOverlap = Math.max(largestOverlap, overlap);
        const shiftX = dx / distance * overlap / 2;
        const shiftY = dy / distance * overlap / 2;
        left.x -= shiftX;
        left.y -= shiftY;
        right.x += shiftX;
        right.y += shiftY;
      }
    }
    for (const node of nodes) {
      node.x = clamp(node.radius + 12, GRAPH_WIDTH - node.radius - 12, node.x);
      node.y = clamp(node.radius + 12, GRAPH_HEIGHT - node.radius - 12, node.y);
    }
    if (largestOverlap < 0.05) break;
  }

  community.radius = Math.max(
    community.radius,
    ...nodes.map((node) => Math.max(
      Math.abs(node.x - community.x) / 1.12,
      Math.abs(node.y - community.y) / 0.78,
    ) + node.radius + 18),
  );
  for (const node of nodes) {
    node.x = Number(node.x.toFixed(1));
    node.y = Number(node.y.toFixed(1));
  }
}

/**
 * Convert already-resolved wiki documents into a deterministic graph payload.
 * `outgoing` and `relatedDocuments` must contain document object references.
 */
export function buildKnowledgeGraph(documents, {
  urlFor = (document) => document.url,
  tagLabel = defaultTagLabel,
} = {}) {
  const published = documents
    .filter((document) => document.category !== 'meta' && document.pageType !== 'meta')
    .sort((a, b) => a.id.localeCompare(b.id, 'ko'));
  const byId = new Map(published.map((document) => [document.id, document]));
  if (byId.size !== published.length) throw new Error('Knowledge graph document IDs must be unique.');

  const nodes = published.map((document) => ({
    id: document.id,
    title: document.title,
    aliases: [...(document.aliases ?? [])],
    type: document.pageType,
    category: document.category,
    url: urlFor(document),
    verification: document.verification,
    evidenceCount: document.evidence?.length ?? 0,
    excerpt: document.excerpt ?? '',
    domainKeys: (document.tags ?? []).filter((tag) => tag.startsWith('domain/')),
    domains: (document.tags ?? [])
      .filter((tag) => tag.startsWith('domain/'))
      .map((key) => ({ key, label: tagLabel(key) })),
    inDegree: 0,
    outDegree: 0,
    degree: 0,
    bridgeConnections: 0,
  }));
  const graphNodeById = new Map(nodes.map((node) => [node.id, node]));

  const edgeRecords = new Map();
  const addEdge = (sourceDocument, targetDocument, kind) => {
    if (!byId.has(sourceDocument.id) || !byId.has(targetDocument?.id) || sourceDocument.id === targetDocument.id) return;
    const key = edgeKey(sourceDocument.id, targetDocument.id);
    const record = edgeRecords.get(key) ?? {
      source: sourceDocument.id,
      target: targetDocument.id,
      kinds: new Set(),
    };
    record.kinds.add(kind);
    edgeRecords.set(key, record);
  };

  for (const document of published) {
    for (const target of document.graphOutgoing ?? document.outgoing ?? []) addEdge(document, target, 'body');
    for (const target of document.relatedDocuments ?? []) addEdge(document, target, 'related');
  }

  const edges = [...edgeRecords.values()]
    .sort((a, b) => a.source.localeCompare(b.source, 'ko') || a.target.localeCompare(b.target, 'ko'))
    .map((edge, index) => ({
      id: `edge-${String(index + 1).padStart(4, '0')}`,
      pairId: undirectedKey(edge.source, edge.target).replace('\u0000', '::'),
      source: edge.source,
      target: edge.target,
      kinds: ['related', 'body'].filter((kind) => edge.kinds.has(kind)),
      kind: edge.kinds.has('related') && edge.kinds.has('body')
        ? 'both'
        : edge.kinds.has('related') ? 'related' : 'body',
      confidence: 'EXTRACTED',
      confidenceScore: 1,
      reciprocal: edgeRecords.has(edgeKey(edge.target, edge.source)),
    }));

  const incident = new Map(nodes.map((node) => [node.id, new Set()]));
  for (const edge of edges) {
    graphNodeById.get(edge.source).outDegree += 1;
    graphNodeById.get(edge.target).inDegree += 1;
    incident.get(edge.source).add(edge.target);
    incident.get(edge.target).add(edge.source);
  }
  for (const node of nodes) node.degree = incident.get(node.id).size;

  const undirectedRecords = new Map();
  for (const edge of edges) {
    const key = undirectedKey(edge.source, edge.target);
    const [source, target] = key.split('\u0000');
    const record = undirectedRecords.get(key) ?? { source, target, weight: 0 };
    record.weight += 1 + (edge.kinds.includes('related') ? 0.8 : 0) + (edge.kinds.includes('body') ? 0.35 : 0);
    undirectedRecords.set(key, record);
  }
  const undirectedEdges = [...undirectedRecords.values()];
  const assignment = structuralCommunities(nodes.map((node) => node.id), undirectedEdges);
  for (const node of nodes) node.community = assignment.get(node.id);

  const bridgeNeighbors = new Map(nodes.map((node) => [node.id, new Set()]));
  for (const edge of edges) {
    edge.crossCommunity = graphNodeById.get(edge.source).community !== graphNodeById.get(edge.target).community;
    if (edge.crossCommunity) {
      bridgeNeighbors.get(edge.source).add(edge.target);
      bridgeNeighbors.get(edge.target).add(edge.source);
    }
    edge.weight = 1
      + (edge.kinds.includes('related') ? 1 : 0)
      + (edge.kinds.includes('body') ? 0.5 : 0)
      + (edge.reciprocal ? 0.5 : 0);
  }
  for (const node of nodes) node.bridgeConnections = bridgeNeighbors.get(node.id).size;

  const communityIds = [...new Set(nodes.map((node) => node.community))].sort((a, b) => a - b);
  const communities = communityIds.map((id) => {
    const members = nodes.filter((node) => node.community === id);
    const crossEdges = edges.filter((edge) => edge.crossCommunity && (
      graphNodeById.get(edge.source).community === id || graphNodeById.get(edge.target).community === id
    )).length;
    return {
      id,
      label: communityName(members, nodes, tagLabel),
      size: members.length,
      crossEdges,
      colorIndex: id,
      x: 0,
      y: 0,
      radius: clamp(96, 230, 56 + Math.sqrt(members.length) * 24),
    };
  });
  const labelCounts = new Map();
  for (const community of communities) labelCounts.set(community.label, (labelCounts.get(community.label) ?? 0) + 1);
  for (const community of communities) {
    if ((labelCounts.get(community.label) ?? 0) < 2) continue;
    community.label = nodes
      .filter((node) => node.community === community.id)
      .sort((a, b) => b.degree - a.degree || b.bridgeConnections - a.bridgeConnections || a.title.localeCompare(b.title, 'ko'))[0]?.title
      ?? community.label;
  }
  communities.sort((a, b) => b.crossEdges - a.crossEdges || b.size - a.size || a.id - b.id);

  placeCommunityCenters(communities);
  const visualIdByCommunity = new Map(communities.map((community, index) => [community.id, index]));
  for (const [index, community] of communities.entries()) {
    community.id = index;
    community.colorIndex = index;
  }
  for (const node of nodes) node.community = visualIdByCommunity.get(node.community);
  for (const edge of edges) {
    edge.crossCommunity = graphNodeById.get(edge.source).community !== graphNodeById.get(edge.target).community;
  }

  for (const community of communities) {
    const members = nodes
      .filter((node) => node.community === community.id)
      .sort((a, b) => (
        b.bridgeConnections - a.bridgeConnections
        || b.degree - a.degree
        || a.title.localeCompare(b.title, 'ko')
      ));
    members.forEach((node, index) => {
      const localRadius = index ? 25 * Math.sqrt(index) : 0;
      const jitter = (stableHash(node.id) % 13) - 6;
      const angle = index * GOLDEN_ANGLE + (stableHash(`${node.id}:angle`) % 31) / 100;
      node.x = Math.round(clamp(24, GRAPH_WIDTH - 24, community.x + Math.cos(angle) * localRadius * 1.08 + jitter));
      node.y = Math.round(clamp(24, GRAPH_HEIGHT - 24, community.y + Math.sin(angle) * localRadius * 0.78 - jitter));
      node.radius = Number(clamp(
        6,
        18,
        6 + Math.log2(1 + node.degree) * 1.7,
      ).toFixed(1));
    });
    relaxNodeCollisions(members, community);
  }

  const maxBridgeConnections = Math.max(0, ...nodes.map((node) => node.bridgeConnections));
  const bridgeScale = Math.log1p(maxBridgeConnections);
  for (const node of nodes) {
    node.z = bridgeScale > 0
      ? Number((Math.log1p(node.bridgeConnections) / bridgeScale * GRAPH_DEPTH).toFixed(1))
      : 0;
  }
  for (const community of communities) community.z = 0;

  const positiveBridgeCounts = nodes
    .map((node) => node.bridgeConnections)
    .filter((count) => count > 0)
    .sort((a, b) => a - b);
  const bridgeMedian = positiveBridgeCounts.length
    ? positiveBridgeCounts[Math.floor((positiveBridgeCounts.length - 1) / 2)]
    : 0;

  nodes.sort((a, b) => a.id.localeCompare(b.id, 'ko'));
  return {
    schemaVersion: 2,
    layoutVersion: 3,
    depthMetric: 'cross-community-neighbors',
    depthScale: 'log1p',
    dimensions: { width: GRAPH_WIDTH, height: GRAPH_HEIGHT, depth: GRAPH_DEPTH },
    stats: {
      nodes: nodes.length,
      edges: edges.length,
      communities: communities.length,
      crossCommunityEdges: edges.filter((edge) => edge.crossCommunity).length,
      bridgeNodes: nodes.filter((node) => node.bridgeConnections > 0).length,
      maxBridgeConnections,
      medianBridgeConnections: bridgeMedian,
    },
    communities,
    nodes,
    edges,
  };
}
