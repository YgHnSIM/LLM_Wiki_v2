export const SEMANTIC_ZOOM_THRESHOLDS = Object.freeze({
  map: 0.8,
  detail: 1.55,
});

const DEFAULT_PADDING = 48;
const DEFAULT_MINIMUM_HIT_RADIUS = 12;

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function positiveNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function clamp(minimum, maximum, value) {
  return Math.min(maximum, Math.max(minimum, value));
}

function compareIds(left, right) {
  return String(left).localeCompare(String(right), 'ko', {
    numeric: true,
    sensitivity: 'base',
  });
}

function toIdSet(value) {
  if (value instanceof Set) return new Set(value);
  if (Array.isArray(value)) return new Set(value);
  if (value === undefined || value === null || value === '') return null;
  return new Set([value]);
}

function orderedSet(values) {
  return new Set([...values].sort(compareIds));
}

function normalizePadding(value = DEFAULT_PADDING) {
  if (Number.isFinite(Number(value))) {
    const inset = Math.max(0, Number(value));
    return { top: inset, right: inset, bottom: inset, left: inset };
  }
  return {
    top: Math.max(0, finiteNumber(value?.top, DEFAULT_PADDING)),
    right: Math.max(0, finiteNumber(value?.right, DEFAULT_PADDING)),
    bottom: Math.max(0, finiteNumber(value?.bottom, DEFAULT_PADDING)),
    left: Math.max(0, finiteNumber(value?.left, DEFAULT_PADDING)),
  };
}

function layoutPoint(node, layoutId) {
  const requested = node?.layouts?.[layoutId];
  if (Number.isFinite(Number(requested?.x)) && Number.isFinite(Number(requested?.y))) {
    return { x: Number(requested.x), y: Number(requested.y) };
  }

  const fallbackIds = ['community', 'network', 'radial'];
  for (const fallbackId of fallbackIds) {
    const fallback = node?.layouts?.[fallbackId];
    if (Number.isFinite(Number(fallback?.x)) && Number.isFinite(Number(fallback?.y))) {
      return { x: Number(fallback.x), y: Number(fallback.y) };
    }
  }

  const firstValidLayout = Object.keys(node?.layouts ?? {})
    .sort(compareIds)
    .map((id) => node.layouts[id])
    .find((point) => Number.isFinite(Number(point?.x)) && Number.isFinite(Number(point?.y)));
  if (firstValidLayout) return { x: Number(firstValidLayout.x), y: Number(firstValidLayout.y) };

  return {
    x: finiteNumber(node?.x),
    y: finiteNumber(node?.y),
  };
}

function transformScale(transform) {
  return positiveNumber(transform?.scale, 1);
}

function transformTranslation(transform) {
  return {
    x: finiteNumber(transform?.translateX, finiteNumber(transform?.x)),
    y: finiteNumber(transform?.translateY, finiteNumber(transform?.y)),
  };
}

function nodeRank(left, right) {
  return finiteNumber(right?.degree) - finiteNumber(left?.degree)
    || finiteNumber(right?.bridgeConnections) - finiteNumber(left?.bridgeConnections)
    || finiteNumber(right?.evidenceCount) - finiteNumber(left?.evidenceCount)
    || compareIds(left?.id, right?.id);
}

function edgeRank(left, right) {
  return compareIds(left?.id, right?.id)
    || compareIds(left?.source, right?.source)
    || compareIds(left?.target, right?.target);
}

function validBaseNodeIds(data, state, nodeById) {
  const requested = toIdSet(
    state?.baseVisibleIds
      ?? state?.filters?.baseVisibleIds
      ?? state?.filters?.visibleIds
      ?? state?.filters?.nodeIds,
  );
  if (!requested) return new Set(nodeById.keys());
  return new Set([...requested].filter((id) => nodeById.has(id)));
}

function validEdgeIds(state) {
  return toIdSet(
    state?.baseVisibleEdgeIds
      ?? state?.filters?.baseVisibleEdgeIds
      ?? state?.filters?.edgeIds,
  );
}

function directNodeIds(data, state, selectedId) {
  const supplied = toIdSet(state?.directIds);
  if (supplied) return supplied;
  const derived = new Set();
  for (const edge of data?.edges ?? []) {
    if (edge?.source === selectedId) derived.add(edge.target);
    if (edge?.target === selectedId) derived.add(edge.source);
  }
  return derived;
}

function communityRepresentatives(nodes) {
  const groups = new Map();
  for (const node of nodes) {
    const key = node?.community === undefined || node?.community === null
      ? `__unassigned__:${String(node.id)}`
      : node.community;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(node);
  }

  return [...groups.entries()]
    .sort(([left], [right]) => compareIds(left, right))
    .map(([, members]) => [...members].sort(nodeRank)[0])
    .filter(Boolean);
}

function overviewNodes(baseNodes) {
  const representatives = communityRepresentatives(baseNodes);
  const topCount = Math.max(4, Math.ceil(Math.sqrt(baseNodes.length)));
  const ids = new Set(representatives.map((node) => node.id));
  for (const node of [...baseNodes].sort(nodeRank).slice(0, topCount)) ids.add(node.id);
  return ids;
}

function keyLabelNodes(baseNodes) {
  const representatives = communityRepresentatives(baseNodes);
  const topCount = Math.max(8, Math.ceil(baseNodes.length * 0.12));
  const ids = new Set(representatives.map((node) => node.id));
  for (const node of [...baseNodes].sort(nodeRank).slice(0, topCount)) ids.add(node.id);
  return ids;
}

/**
 * Convert a user-facing zoom factor into one of the three information tiers.
 * Invalid or negative values deliberately fall back to the quiet overview.
 */
export function semanticZoomTier(scale) {
  const parsed = Number(scale);
  const value = Number.isNaN(parsed) || parsed === Number.NEGATIVE_INFINITY ? 0 : parsed;
  if (value < SEMANTIC_ZOOM_THRESHOLDS.map) return 'overview';
  if (value < SEMANTIC_ZOOM_THRESHOLDS.detail) return 'map';
  return 'detail';
}

/**
 * Fit graph nodes into a viewport. The returned transform follows
 * screen = world * scale + translation and includes x/y aliases for canvas use.
 */
export function fitGraphTransform(nodes, layoutId, viewport, options = {}) {
  const width = positiveNumber(viewport?.width, 1);
  const height = positiveNumber(viewport?.height, 1);
  const padding = normalizePadding(options.padding);
  const availableWidth = Math.max(1, width - padding.left - padding.right);
  const availableHeight = Math.max(1, height - padding.top - padding.bottom);
  const records = (Array.isArray(nodes) ? nodes : [])
    .filter((node) => node?.id !== undefined && node?.id !== null)
    .map((node) => {
      const point = layoutPoint(node, layoutId);
      const radius = options.includeNodeRadius === false ? 0 : Math.max(0, finiteNumber(node.radius));
      return { node, point, radius };
    });

  let bounds;
  if (records.length) {
    bounds = {
      minX: Math.min(...records.map(({ point, radius }) => point.x - radius)),
      maxX: Math.max(...records.map(({ point, radius }) => point.x + radius)),
      minY: Math.min(...records.map(({ point, radius }) => point.y - radius)),
      maxY: Math.max(...records.map(({ point, radius }) => point.y + radius)),
    };
  } else {
    bounds = { minX: -0.5, maxX: 0.5, minY: -0.5, maxY: 0.5 };
  }

  const spanX = Math.max(1, bounds.maxX - bounds.minX);
  const spanY = Math.max(1, bounds.maxY - bounds.minY);
  const minimumScale = Math.max(0, finiteNumber(options.minimumScale, 0));
  const maximumScale = options.maximumScale === undefined
    ? Number.POSITIVE_INFINITY
    : positiveNumber(options.maximumScale, 1);
  const upperScale = Math.max(minimumScale, maximumScale);
  const fittedScale = records.length
    ? Math.min(availableWidth / spanX, availableHeight / spanY)
    : 1;
  const scale = clamp(minimumScale, upperScale, fittedScale);
  const worldCenter = {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2,
  };
  const viewportCenter = {
    x: padding.left + availableWidth / 2,
    y: padding.top + availableHeight / 2,
  };
  const translateX = viewportCenter.x - worldCenter.x * scale;
  const translateY = viewportCenter.y - worldCenter.y * scale;

  return {
    scale,
    translateX,
    translateY,
    x: translateX,
    y: translateY,
    layoutId: String(layoutId ?? ''),
    bounds: { ...bounds, width: spanX, height: spanY },
    padding,
    viewport: { width, height },
  };
}

export function worldToScreen(point, transform) {
  const scale = transformScale(transform);
  const translation = transformTranslation(transform);
  return {
    x: finiteNumber(point?.x) * scale + translation.x,
    y: finiteNumber(point?.y) * scale + translation.y,
  };
}

export function screenToWorld(point, transform) {
  const scale = transformScale(transform);
  const translation = transformTranslation(transform);
  return {
    x: (finiteNumber(point?.x) - translation.x) / scale,
    y: (finiteNumber(point?.y) - translation.y) / scale,
  };
}

/**
 * Spread an ordered neighbor list into viewport-bounded elliptical rings.
 * Radii are expressed in screen pixels, then converted back into world space.
 */
export function focusRingPositions(neighborIds, center, viewport, scale = 1) {
  const ids = Array.isArray(neighborIds) ? neighborIds : [];
  const resolvedScale = positiveNumber(scale, 1);
  const width = positiveNumber(viewport?.width, 1);
  const height = positiveNumber(viewport?.height, 1);
  const origin = { x: finiteNumber(center?.x), y: finiteNumber(center?.y) };
  const capacities = [];
  for (let ring = 0, total = 0; total < ids.length; ring += 1) {
    const capacity = 8 + ring * 5;
    capacities.push(capacity);
    total += capacity;
  }
  const ringCount = Math.max(1, capacities.length);
  const maximumRadiusX = Math.max(128, width / 2 - 72);
  const maximumRadiusY = Math.max(112, height / 2 - 64);
  const positions = new Map();
  let cursor = 0;
  let ring = 0;
  while (cursor < ids.length) {
    const members = ids.slice(cursor, cursor + capacities[ring]);
    const progress = ringCount === 1 ? 1 : 0.34 + 0.66 * ring / (ringCount - 1);
    const radiusX = maximumRadiusX * progress / resolvedScale;
    const radiusY = maximumRadiusY * progress / resolvedScale;
    members.forEach((id, index) => {
      const angle = -Math.PI / 2 + Math.PI * 2 * index / members.length + ring * 0.18;
      positions.set(id, {
        x: origin.x + Math.cos(angle) * radiusX,
        y: origin.y + Math.sin(angle) * radiusY,
      });
    });
    cursor += members.length;
    ring += 1;
  }
  return positions;
}

/**
 * Add keyboard/hover labels only while no node is selected. Selection mode is
 * intentionally strict: selected, direct, and active route labels only.
 */
export function resolvedLabelIds(modelLabelIds, state = {}) {
  const labels = toIdSet(modelLabelIds) ?? new Set();
  const selectedId = state.selectedId ?? '';
  if (selectedId) {
    const allowed = new Set([selectedId]);
    for (const id of toIdSet(state.directIds) ?? []) allowed.add(id);
    for (const id of toIdSet(state.routeIds) ?? []) allowed.add(id);
    return orderedSet([...labels].filter((id) => allowed.has(id)));
  }
  if (state.keyboardId) labels.add(state.keyboardId);
  if (state.hoveredId) labels.add(state.hoveredId);
  return orderedSet(labels);
}

/**
 * Resolve the deterministic subset a 2D renderer should draw at the current
 * semantic zoom. All four fields are insertion-ordered Sets.
 */
export function visibleGraphElements(data, state = {}) {
  const nodes = (Array.isArray(data?.nodes) ? data.nodes : [])
    .filter((node) => node?.id !== undefined && node?.id !== null)
    .sort((left, right) => compareIds(left.id, right.id));
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const baseIds = validBaseNodeIds(data, state, nodeById);
  const baseNodes = nodes.filter((node) => baseIds.has(node.id));
  const tier = semanticZoomTier(state.scale);
  const queryIds = toIdSet(state.queryIds) ?? new Set();
  const routeIds = toIdSet(state.routeIds) ?? new Set();
  const routeEdgeIds = toIdSet(state.routeEdgeIds) ?? new Set();
  const hoveredId = nodeById.has(state.hoveredId) ? state.hoveredId : null;
  const selectedId = baseIds.has(state.selectedId) ? state.selectedId : null;
  const directIds = selectedId ? directNodeIds(data, state, selectedId) : new Set();

  const visibleNodes = tier === 'overview' ? overviewNodes(baseNodes) : new Set(baseIds);
  for (const id of queryIds) if (baseIds.has(id)) visibleNodes.add(id);
  for (const id of routeIds) if (baseIds.has(id)) visibleNodes.add(id);
  if (hoveredId !== null && baseIds.has(hoveredId)) visibleNodes.add(hoveredId);
  if (selectedId !== null) {
    visibleNodes.add(selectedId);
    for (const id of directIds) if (baseIds.has(id)) visibleNodes.add(id);
  }

  let labelIds;
  if (selectedId !== null) {
    labelIds = new Set([selectedId]);
    for (const id of directIds) if (visibleNodes.has(id)) labelIds.add(id);
    for (const id of routeIds) if (visibleNodes.has(id)) labelIds.add(id);
  } else if (tier === 'overview') {
    labelIds = new Set(visibleNodes);
  } else if (tier === 'map') {
    labelIds = keyLabelNodes(baseNodes);
    for (const id of queryIds) if (visibleNodes.has(id)) labelIds.add(id);
    for (const id of routeIds) if (visibleNodes.has(id)) labelIds.add(id);
    if (hoveredId !== null && visibleNodes.has(hoveredId)) labelIds.add(hoveredId);
  } else {
    labelIds = new Set(visibleNodes);
  }

  const allowedEdgeIds = validEdgeIds(state);
  const visibleEdges = (Array.isArray(data?.edges) ? data.edges : [])
    .filter((edge) => edge?.id !== undefined && edge?.id !== null)
    .filter((edge) => (
      visibleNodes.has(edge.source)
      && visibleNodes.has(edge.target)
      && (!allowedEdgeIds || allowedEdgeIds.has(edge.id))
      && (
        selectedId === null
        || edge.source === selectedId
        || edge.target === selectedId
        || routeEdgeIds.has(edge.id)
      )
    ))
    .sort(edgeRank);

  const communityIds = new Set();
  for (const id of visibleNodes) {
    const community = nodeById.get(id)?.community;
    if (community !== undefined && community !== null) communityIds.add(community);
  }

  return {
    nodeIds: orderedSet(visibleNodes),
    edgeIds: new Set(visibleEdges.map((edge) => edge.id)),
    labelIds: orderedSet([...labelIds].filter((id) => visibleNodes.has(id))),
    communityIds: orderedSet(communityIds),
  };
}

/**
 * Return the nearest visible node under a screen-space pointer, or null.
 */
export function hitTestGraphNode(data, layoutId, point, transform, visibleIds) {
  if (!Number.isFinite(Number(point?.x)) || !Number.isFinite(Number(point?.y))) return null;
  const allowed = toIdSet(visibleIds);
  const scale = transformScale(transform);
  const minimumRadius = positiveNumber(transform?.minimumHitRadius, DEFAULT_MINIMUM_HIT_RADIUS);
  const candidates = [];

  for (const node of data?.nodes ?? []) {
    if (node?.id === undefined || node?.id === null || (allowed && !allowed.has(node.id))) continue;
    const screen = worldToScreen(layoutPoint(node, layoutId), transform);
    const distance = Math.hypot(finiteNumber(point?.x) - screen.x, finiteNumber(point?.y) - screen.y);
    const radius = Math.max(minimumRadius, Math.max(0, finiteNumber(node.radius)) * scale);
    if (distance <= radius) candidates.push({ node, distance, radius });
  }

  candidates.sort((left, right) => (
    left.distance / left.radius - right.distance / right.radius
    || left.distance - right.distance
    || nodeRank(left.node, right.node)
  ));
  return candidates[0]?.node ?? null;
}
