const GRAPH_WIDTH = 5600;
const GRAPH_HEIGHT = 3200;
const GRAPH_DEPTH = 900;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const NODE_SPIRAL_STEP = 68;
const NODE_COLLISION_GAP = 28;
const COMMUNITY_GAP = 220;
const GRAPH_MARGIN = 260;
const NETWORK_LAYOUT_ITERATIONS = 240;
const LAYOUT_EDGE_MARGIN = 54;

const GRAPH_LAYOUTS = Object.freeze([
  {
    id: 'community',
    label: '연결 집단',
    description: '구조적으로 밀접한 문서를 집단별로 묶어 보여 줍니다.',
    grouped: true,
  },
  {
    id: 'network',
    label: '관계 중심',
    description: '집단 경계 없이 작성된 연결의 강도로 노드 거리를 결정합니다.',
    grouped: false,
  },
  {
    id: 'radial',
    label: '중심-주변',
    description: '연결망의 핵심도와 가중 연결 수를 기준으로 중심에서 밖으로 배치합니다.',
    grouped: false,
  },
]);

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

  const maximumRowWidth = GRAPH_WIDTH - GRAPH_MARGIN * 2;
  const records = communities.map((community) => ({
    community,
    width: community.radius * 2 * 1.22,
    height: community.radius * 2 * 0.92,
  }));
  const rows = [];
  let row = { records: [], width: 0, height: 0 };
  for (const record of records) {
    const nextWidth = row.records.length
      ? row.width + COMMUNITY_GAP + record.width
      : record.width;
    if (row.records.length && nextWidth > maximumRowWidth) {
      rows.push(row);
      row = { records: [], width: 0, height: 0 };
    }
    row.width = row.records.length ? row.width + COMMUNITY_GAP + record.width : record.width;
    row.height = Math.max(row.height, record.height);
    row.records.push(record);
  }
  if (row.records.length) rows.push(row);

  const packedHeight = rows.reduce((sum, item) => sum + item.height, 0)
    + COMMUNITY_GAP * Math.max(0, rows.length - 1);
  let top = (GRAPH_HEIGHT - packedHeight) / 2;
  for (const packedRow of rows) {
    let left = (GRAPH_WIDTH - packedRow.width) / 2;
    for (const record of packedRow.records) {
      record.community.x = left + record.width / 2;
      record.community.y = top + packedRow.height / 2;
      left += record.width + COMMUNITY_GAP;
    }
    top += packedRow.height + COMMUNITY_GAP;
  }
}

function relaxNodeCollisions(nodes, community) {
  const padding = NODE_COLLISION_GAP;
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
      Math.abs(node.x - community.x) / 1.16,
      Math.abs(node.y - community.y) / 0.9,
    ) + node.radius + 36),
  );
  for (const node of nodes) {
    node.x = Number(node.x.toFixed(1));
    node.y = Number(node.y.toFixed(1));
  }
}

function saveNodeLayout(nodes, layoutId) {
  for (const node of nodes) {
    node.layouts ??= {};
    node.layouts[layoutId] = {
      x: Number(node.x.toFixed(1)),
      y: Number(node.y.toFixed(1)),
    };
  }
}

function restoreNodeLayout(nodes, layoutId) {
  for (const node of nodes) {
    const position = node.layouts?.[layoutId];
    if (!position) continue;
    node.x = position.x;
    node.y = position.y;
  }
}

function relaxGlobalNodeCollisions(nodes, { passes = 180 } = {}) {
  for (let pass = 0; pass < passes; pass += 1) {
    let largestOverlap = 0;
    for (let leftIndex = 0; leftIndex < nodes.length; leftIndex += 1) {
      const left = nodes[leftIndex];
      for (let rightIndex = leftIndex + 1; rightIndex < nodes.length; rightIndex += 1) {
        const right = nodes[rightIndex];
        let dx = right.x - left.x;
        let dy = right.y - left.y;
        let distance = Math.hypot(dx, dy);
        const minimum = left.radius + right.radius + NODE_COLLISION_GAP;
        if (distance >= minimum) continue;
        if (distance < 1e-6) {
          const angle = (stableHash(`collision:${left.id}:${right.id}`) % 360) * Math.PI / 180;
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
      const margin = node.radius + LAYOUT_EDGE_MARGIN;
      node.x = clamp(margin, GRAPH_WIDTH - margin, node.x);
      node.y = clamp(margin, GRAPH_HEIGHT - margin, node.y);
    }
    if (largestOverlap < 0.05) break;
  }

  for (const node of nodes) {
    node.x = Number(node.x.toFixed(1));
    node.y = Number(node.y.toFixed(1));
  }
}

function placeNetworkLayout(nodes, undirectedEdges) {
  if (!nodes.length) return;

  const centerX = GRAPH_WIDTH / 2;
  const centerY = GRAPH_HEIGHT / 2;
  const weightedDegree = new Map(nodes.map((node) => [node.id, 0]));
  for (const edge of undirectedEdges) {
    weightedDegree.set(edge.source, (weightedDegree.get(edge.source) ?? 0) + edge.weight);
    weightedDegree.set(edge.target, (weightedDegree.get(edge.target) ?? 0) + edge.weight);
  }
  const ordered = [...nodes].sort((left, right) => (
    (weightedDegree.get(right.id) ?? 0) - (weightedDegree.get(left.id) ?? 0)
    || right.degree - left.degree
    || left.id.localeCompare(right.id, 'ko')
  ));
  const initialScale = Math.min(GRAPH_WIDTH, GRAPH_HEIGHT) * 0.39 / Math.sqrt(Math.max(1, nodes.length));
  for (const [index, node] of ordered.entries()) {
    const angle = index * GOLDEN_ANGLE + (stableHash(`network:${node.id}`) % 37) / 100;
    const radius = initialScale * Math.sqrt(index);
    node.x = centerX + Math.cos(angle) * radius * 1.52;
    node.y = centerY + Math.sin(angle) * radius;
  }

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const usableArea = (GRAPH_WIDTH - GRAPH_MARGIN * 2) * (GRAPH_HEIGHT - GRAPH_MARGIN * 2);
  const naturalSpacing = clamp(120, 260, Math.sqrt(usableArea / Math.max(1, nodes.length)));
  const displacement = new Map(nodes.map((node) => [node.id, { x: 0, y: 0 }]));

  for (let iteration = 0; iteration < NETWORK_LAYOUT_ITERATIONS; iteration += 1) {
    for (const vector of displacement.values()) {
      vector.x = 0;
      vector.y = 0;
    }

    for (let leftIndex = 0; leftIndex < nodes.length; leftIndex += 1) {
      const left = nodes[leftIndex];
      for (let rightIndex = leftIndex + 1; rightIndex < nodes.length; rightIndex += 1) {
        const right = nodes[rightIndex];
        let dx = right.x - left.x;
        let dy = right.y - left.y;
        let distance = Math.hypot(dx, dy);
        if (distance < 1e-6) {
          const angle = (stableHash(`network-pair:${left.id}:${right.id}`) % 360) * Math.PI / 180;
          dx = Math.cos(angle);
          dy = Math.sin(angle);
          distance = 1;
        }
        const force = naturalSpacing * naturalSpacing / Math.max(32, distance);
        const forceX = dx / distance * force;
        const forceY = dy / distance * force;
        displacement.get(left.id).x -= forceX;
        displacement.get(left.id).y -= forceY;
        displacement.get(right.id).x += forceX;
        displacement.get(right.id).y += forceY;
      }
    }

    for (const edge of undirectedEdges) {
      const source = nodeById.get(edge.source);
      const target = nodeById.get(edge.target);
      if (!source || !target) continue;
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const idealDistance = clamp(88, naturalSpacing * 1.35, naturalSpacing * 1.18 / Math.sqrt(edge.weight));
      const force = (distance - idealDistance) * 0.16 * Math.sqrt(edge.weight);
      const forceX = dx / distance * force;
      const forceY = dy / distance * force;
      displacement.get(source.id).x += forceX;
      displacement.get(source.id).y += forceY;
      displacement.get(target.id).x -= forceX;
      displacement.get(target.id).y -= forceY;
    }

    const progress = iteration / Math.max(1, NETWORK_LAYOUT_ITERATIONS - 1);
    const temperature = 68 * (1 - progress) + 2;
    for (const node of nodes) {
      const vector = displacement.get(node.id);
      vector.x += (centerX - node.x) * 0.018;
      vector.y += (centerY - node.y) * 0.018;
      const magnitude = Math.max(1, Math.hypot(vector.x, vector.y));
      const step = Math.min(temperature, magnitude);
      node.x += vector.x / magnitude * step;
      node.y += vector.y / magnitude * step;
      const margin = node.radius + LAYOUT_EDGE_MARGIN;
      node.x = clamp(margin, GRAPH_WIDTH - margin, node.x);
      node.y = clamp(margin, GRAPH_HEIGHT - margin, node.y);
    }
  }

  relaxGlobalNodeCollisions(nodes);
}

function graphCoreNumbers(nodes, undirectedEdges) {
  const neighbors = new Map(nodes.map((node) => [node.id, new Set()]));
  for (const edge of undirectedEdges) {
    neighbors.get(edge.source)?.add(edge.target);
    neighbors.get(edge.target)?.add(edge.source);
  }
  const remaining = new Set(nodes.map((node) => node.id));
  const degrees = new Map(nodes.map((node) => [node.id, neighbors.get(node.id).size]));
  const core = new Map();

  while (remaining.size) {
    const id = [...remaining].sort((left, right) => (
      degrees.get(left) - degrees.get(right) || left.localeCompare(right, 'ko')
    ))[0];
    const value = degrees.get(id);
    core.set(id, value);
    remaining.delete(id);
    for (const neighbor of neighbors.get(id)) {
      if (remaining.has(neighbor) && degrees.get(neighbor) > value) {
        degrees.set(neighbor, degrees.get(neighbor) - 1);
      }
    }
  }

  return core;
}

function placeRadialLayout(nodes, undirectedEdges) {
  if (!nodes.length) return;

  const core = graphCoreNumbers(nodes, undirectedEdges);
  const weightedDegree = new Map(nodes.map((node) => [node.id, 0]));
  for (const edge of undirectedEdges) {
    weightedDegree.set(edge.source, (weightedDegree.get(edge.source) ?? 0) + edge.weight);
    weightedDegree.set(edge.target, (weightedDegree.get(edge.target) ?? 0) + edge.weight);
  }
  const ordered = [...nodes].sort((left, right) => (
    core.get(right.id) - core.get(left.id)
    || (weightedDegree.get(right.id) ?? 0) - (weightedDegree.get(left.id) ?? 0)
    || right.degree - left.degree
    || left.id.localeCompare(right.id, 'ko')
  ));
  const centerX = GRAPH_WIDTH / 2;
  const centerY = GRAPH_HEIGHT / 2;
  const maximumRadius = Math.max(0, ...nodes.map((node) => node.radius));
  const minimumSeparation = maximumRadius * 2 + NODE_COLLISION_GAP + 8;
  const ringSpacing = minimumSeparation + 20;

  ordered[0].x = centerX;
  ordered[0].y = centerY;
  let cursor = 1;
  let ring = 1;
  while (cursor < ordered.length) {
    const radialDistance = ring * ringSpacing;
    const angleStep = 2 * Math.asin(Math.min(1, minimumSeparation / (2 * radialDistance)));
    const capacity = Math.max(1, Math.floor(Math.PI * 2 / angleStep));
    const count = Math.min(capacity, ordered.length - cursor);
    const offset = (stableHash(`radial-ring:${ring}`) % 360) * Math.PI / 180;
    for (let index = 0; index < count; index += 1) {
      const node = ordered[cursor + index];
      const angle = offset + index * Math.PI * 2 / count;
      node.x = centerX + Math.cos(angle) * radialDistance;
      node.y = centerY + Math.sin(angle) * radialDistance;
    }
    cursor += count;
    ring += 1;
  }

  relaxGlobalNodeCollisions(nodes, { passes: 60 });
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
  for (const node of nodes) {
    node.radius = Number(clamp(
      8,
      22,
      8 + Math.log2(1 + node.degree) * 1.85,
    ).toFixed(1));
  }

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
      radius: clamp(240, 480, 130 + Math.sqrt(members.length) * 55),
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
      const localRadius = index ? NODE_SPIRAL_STEP * Math.sqrt(index) : 0;
      const jitter = (stableHash(node.id) % 13) - 6;
      const angle = index * GOLDEN_ANGLE + (stableHash(`${node.id}:angle`) % 31) / 100;
      node.x = Math.round(clamp(24, GRAPH_WIDTH - 24, community.x + Math.cos(angle) * localRadius * 1.1 + jitter));
      node.y = Math.round(clamp(24, GRAPH_HEIGHT - 24, community.y + Math.sin(angle) * localRadius * 0.94 - jitter));
    });
    relaxNodeCollisions(members, community);
  }

  const previousCenters = new Map(communities.map((community) => [community.id, {
    x: community.x,
    y: community.y,
  }]));
  placeCommunityCenters(communities);
  for (const community of communities) {
    const previous = previousCenters.get(community.id);
    const shiftX = community.x - previous.x;
    const shiftY = community.y - previous.y;
    for (const node of nodes.filter((item) => item.community === community.id)) {
      node.x = Number((node.x + shiftX).toFixed(1));
      node.y = Number((node.y + shiftY).toFixed(1));
    }
  }

  saveNodeLayout(nodes, 'community');
  placeNetworkLayout(nodes, undirectedEdges);
  saveNodeLayout(nodes, 'network');
  placeRadialLayout(nodes, undirectedEdges);
  saveNodeLayout(nodes, 'radial');
  restoreNodeLayout(nodes, 'community');

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
    layoutVersion: 6,
    defaultLayout: 'community',
    layouts: GRAPH_LAYOUTS.map((layout) => ({ ...layout })),
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
