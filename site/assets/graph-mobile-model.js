const directionLabels = {
  in: '이 문서를 가리킴',
  out: '이 문서에서 가리킴',
  both: '서로 가리킴',
};

export const MOBILE_GRAPH_MEDIA_QUERY = '(max-width: 760px), (any-pointer: coarse) and (max-width: 1024px)';

export function isMobileGraphExperience({ width, coarsePointer = false }) {
  return Number(width) <= 760 || (Boolean(coarsePointer) && Number(width) <= 1024);
}

function titleCompare(left, right, collator) {
  if (collator) return collator.compare(left, right);
  return String(left).localeCompare(String(right), 'ko', { numeric: true, sensitivity: 'base' });
}

export function mobileDirection(directions) {
  const values = directions instanceof Set ? directions : new Set(directions ?? []);
  if (values.has('in') && values.has('out')) return 'both';
  return values.has('out') ? 'out' : 'in';
}

export function mobileDirectionLabel(direction) {
  return directionLabels[direction] ?? directionLabels.in;
}

export function buildMobileRelationGroups(selectedId, edges, nodeById, { collator } = {}) {
  const records = new Map();
  for (const edge of edges ?? []) {
    if (edge.source !== selectedId && edge.target !== selectedId) continue;
    const neighborId = edge.source === selectedId ? edge.target : edge.source;
    const record = records.get(neighborId) ?? { directions: new Set(), kinds: new Set() };
    record.directions.add(edge.source === selectedId ? 'out' : 'in');
    for (const kind of edge.kinds ?? [edge.kind].filter(Boolean)) record.kinds.add(kind);
    records.set(neighborId, record);
  }

  const groups = new Map([
    ['in', []],
    ['both', []],
    ['out', []],
  ]);
  for (const [id, record] of records) {
    const node = nodeById.get(id);
    if (!node) continue;
    const direction = mobileDirection(record.directions);
    groups.get(direction).push({
      node,
      direction,
      kinds: [...record.kinds].sort(),
      hasRelated: record.kinds.has('related'),
    });
  }

  const compare = (left, right) => (
    Number(right.hasRelated) - Number(left.hasRelated)
    || Number(right.node.bridgeConnections ?? 0) - Number(left.node.bridgeConnections ?? 0)
    || Number(right.node.evidenceCount ?? 0) - Number(left.node.evidenceCount ?? 0)
    || titleCompare(left.node.title, right.node.title, collator)
  );

  return ['in', 'both', 'out']
    .map((direction) => ({
      direction,
      label: mobileDirectionLabel(direction),
      items: groups.get(direction).sort(compare),
    }))
    .filter((group) => group.items.length);
}

export function limitMobileRelationGroups(groups, limit = 8) {
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);
  if (!Number.isFinite(limit) || total <= limit) {
    return { groups: groups.map((group) => ({ ...group, visibleItems: [...group.items] })), shown: total, total };
  }

  const active = groups.filter((group) => group.items.length);
  const allocations = new Map(active.map((group) => [group.direction, 0]));
  let remaining = Math.max(0, Math.floor(limit));
  while (remaining > 0) {
    let assigned = false;
    for (const group of active) {
      const count = allocations.get(group.direction);
      if (count >= group.items.length || remaining <= 0) continue;
      allocations.set(group.direction, count + 1);
      remaining -= 1;
      assigned = true;
    }
    if (!assigned) break;
  }

  return {
    groups: groups.map((group) => ({
      ...group,
      visibleItems: group.items.slice(0, allocations.get(group.direction) ?? 0),
    })).filter((group) => group.visibleItems.length),
    shown: Math.min(total, Math.max(0, Math.floor(limit))),
    total,
  };
}

export function mobileConnectorPath(source, target, offset = 0) {
  const sourceCenterX = source.x + source.width / 2 + offset;
  const sourceCenterY = source.y + source.height / 2;
  const targetCenterX = target.x + target.width / 2 + offset;
  const targetCenterY = target.y + target.height / 2;
  const travelsDown = targetCenterY >= sourceCenterY;
  const start = {
    x: sourceCenterX,
    y: travelsDown ? source.y + source.height : source.y,
  };
  const end = {
    x: targetCenterX,
    y: travelsDown ? target.y : target.y + target.height,
  };
  const direction = travelsDown ? 1 : -1;
  const bend = Math.max(26, Math.abs(end.y - start.y) * 0.46);
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} C ${start.x.toFixed(2)} ${(start.y + bend * direction).toFixed(2)}, ${end.x.toFixed(2)} ${(end.y - bend * direction).toFixed(2)}, ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

export function mobileStartNodes(nodes, visibleIds, count = 6, { collator } = {}) {
  return (nodes ?? [])
    .filter((node) => visibleIds?.has(node.id))
    .sort((left, right) => (
      Number(right.bridgeConnections ?? 0) - Number(left.bridgeConnections ?? 0)
      || Number(right.degree ?? 0) - Number(left.degree ?? 0)
      || Number(right.evidenceCount ?? 0) - Number(left.evidenceCount ?? 0)
      || titleCompare(left.title, right.title, collator)
    ))
    .slice(0, Math.max(0, count));
}
