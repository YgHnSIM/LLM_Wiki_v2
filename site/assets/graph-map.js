import {
  fitGraphTransform,
  focusRingPositions,
  resolvedLabelIds,
  screenToWorld,
  semanticZoomTier,
  visibleGraphElements,
  worldToScreen,
} from './graph-map-model.js';

const desktopGraph = window.matchMedia('(min-width: 1025px)');
const root = document.querySelector('[data-knowledge-map]');

if (root && !desktopGraph.matches) root.closest('.map-main')?.remove();

if (root && desktopGraph.matches) {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const collator = new Intl.Collator('ko', { numeric: true, sensitivity: 'base' });
  const typeLabels = {
    source: '원문 노트',
    reference: '참고 자료',
    concept: '개념',
    entity: '인물·기관',
    analysis: '비교 읽기',
  };
  const verificationLabels = {
    verified: '검증됨',
    partial: '부분 검증',
    disputed: '논쟁 중',
    unverified: '미검증',
  };
  const tierLabels = {
    overview: '집단',
    map: '중심 문서',
    detail: '개별 관계',
  };
  const clamp = (minimum, maximum, value) => Math.min(maximum, Math.max(minimum, value));
  const normalize = (value) => String(value ?? '')
    .normalize('NFKC')
    .toLocaleLowerCase('ko')
    .replace(/\s+/g, ' ')
    .trim();

  const refs = {
    svg: root.querySelector('[data-map-svg]'),
    scene: root.querySelector('[data-map-scene]'),
    viewport: root.querySelector('[data-map-viewport]'),
    communities: root.querySelector('[data-map-communities]'),
    edges: root.querySelector('[data-map-edges]'),
    nodes: root.querySelector('[data-map-nodes]'),
    labels: root.querySelector('[data-map-labels]'),
    nodeActions: root.querySelector('[data-map-node-actions]'),
    searchForm: root.querySelector('[data-map-search-form]'),
    search: root.querySelector('[data-map-search]'),
    loading: root.querySelector('[data-map-loading]'),
    status: root.querySelector('[data-map-status]'),
    summary: root.querySelector('[data-map-summary]'),
    tier: root.querySelector('[data-map-tier]'),
    visibleCount: root.querySelector('[data-map-visible-count]'),
    zoomOutput: root.querySelector('[data-map-zoom-output]'),
    layoutNote: root.querySelector('[data-map-layout-note]'),
    filterDialog: root.querySelector('[data-map-filters]'),
    filterCount: root.querySelector('[data-map-filter-count]'),
    type: root.querySelector('[data-map-type]'),
    verification: root.querySelector('[data-map-verification]'),
    community: root.querySelector('[data-map-community]'),
    relation: root.querySelector('[data-map-relation]'),
    showOrphans: root.querySelector('[data-map-show-orphans]'),
    details: root.querySelector('[data-map-details]'),
    detailsContent: root.querySelector('[data-map-details-content]'),
    detailsToggle: root.querySelector('[data-map-details-toggle]'),
  };

  const state = {
    data: null,
    nodeById: new Map(),
    edgeById: new Map(),
    communityById: new Map(),
    edgesByNode: new Map(),
    recordsByNode: new Map(),
    layout: '',
    filters: {
      type: '',
      verification: '',
      community: '',
      relation: 'all',
      showOrphans: true,
    },
    baseVisibleIds: new Set(),
    baseVisibleEdgeIds: new Set(),
    query: '',
    queryIds: new Set(),
    selectedId: '',
    directIds: new Set(),
    routeStartId: '',
    routeIds: new Set(),
    routeEdgeIds: new Set(),
    hoveredId: '',
    keyboardId: '',
    detailsOpen: false,
    transform: { scale: 1, translateX: 0, translateY: 0, minimumHitRadius: 12 },
    fitScale: 1,
    viewport: { width: 1200, height: 760 },
    visibleModel: null,
    displayPositions: new Map(),
    labelHitAreas: new Map(),
    pointer: null,
    queryTimer: 0,
    resizeFrame: 0,
    wheelFrame: 0,
    pendingWheelFactor: 1,
    pendingWheelAnchor: null,
  };

  function svgElement(name, attributes = {}, text = '') {
    const element = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attributes)) {
      if (value !== undefined && value !== null && value !== '') element.setAttribute(key, String(value));
    }
    if (text) element.textContent = text;
    return element;
  }

  function htmlElement(name, className = '', text = '') {
    const element = document.createElement(name);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function kindsForEdge(edge) {
    if (Array.isArray(edge?.kinds)) return edge.kinds.filter((kind) => kind === 'related' || kind === 'body');
    if (edge?.kind === 'both') return ['related', 'body'];
    return ['related', 'body'].includes(edge?.kind) ? [edge.kind] : [];
  }

  function relationAllowed(edge) {
    return state.filters.relation === 'all' || kindsForEdge(edge).includes(state.filters.relation);
  }

  function layoutPosition(node) {
    return node?.layouts?.[state.layout] ?? node?.layouts?.community ?? { x: node?.x ?? 0, y: node?.y ?? 0 };
  }

  function displayPosition(node) {
    return state.displayPositions.get(node.id) ?? layoutPosition(node);
  }

  function buildRelationshipIndex() {
    state.edgesByNode = new Map(state.data.nodes.map((node) => [node.id, []]));
    state.recordsByNode = new Map(state.data.nodes.map((node) => [node.id, new Map()]));
    for (const edge of state.data.edges) {
      state.edgesByNode.get(edge.source)?.push(edge);
      state.edgesByNode.get(edge.target)?.push(edge);
      const addRecord = (focusId, neighborId, direction) => {
        const records = state.recordsByNode.get(focusId);
        if (!records || !state.nodeById.has(neighborId)) return;
        const record = records.get(neighborId) ?? {
          node: state.nodeById.get(neighborId),
          directions: new Set(),
          kinds: new Set(),
          edgeIds: new Set(),
        };
        record.directions.add(direction);
        for (const kind of kindsForEdge(edge)) record.kinds.add(kind);
        record.edgeIds.add(edge.id);
        records.set(neighborId, record);
      };
      addRecord(edge.source, edge.target, 'out');
      addRecord(edge.target, edge.source, 'in');
    }
  }

  function filteredRecordsFor(id) {
    return [...(state.recordsByNode.get(id)?.values() ?? [])]
      .filter((record) => state.baseVisibleIds.has(record.node.id))
      .map((record) => {
        const edgeIds = new Set([...record.edgeIds].filter((edgeId) => state.baseVisibleEdgeIds.has(edgeId)));
        const directions = new Set();
        const kinds = new Set();
        for (const edgeId of edgeIds) {
          const edge = state.edgeById.get(edgeId);
          if (!edge) continue;
          if (edge.source === id) directions.add('out');
          if (edge.target === id) directions.add('in');
          for (const kind of kindsForEdge(edge)) kinds.add(kind);
        }
        return { ...record, edgeIds, directions, kinds };
      })
      .filter((record) => record.edgeIds.size)
      .sort((left, right) => (
        Number(right.kinds.has('related')) - Number(left.kinds.has('related'))
        || Number(right.directions.size > 1) - Number(left.directions.size > 1)
        || Number(right.node.bridgeConnections ?? 0) - Number(left.node.bridgeConnections ?? 0)
        || Number(right.node.degree ?? 0) - Number(left.node.degree ?? 0)
        || collator.compare(left.node.title, right.node.title)
      ));
  }

  function computeBaseVisibility() {
    const candidateIds = new Set(state.data.nodes
      .filter((node) => !state.filters.type || node.type === state.filters.type)
      .filter((node) => !state.filters.verification || node.verification === state.filters.verification)
      .filter((node) => state.filters.community === '' || String(node.community) === state.filters.community)
      .map((node) => node.id));
    const candidateEdges = state.data.edges
      .filter((edge) => candidateIds.has(edge.source) && candidateIds.has(edge.target))
      .filter(relationAllowed);
    state.baseVisibleIds = state.filters.showOrphans
      ? candidateIds
      : new Set(candidateEdges.flatMap((edge) => [edge.source, edge.target]));
    state.baseVisibleEdgeIds = new Set(candidateEdges
      .filter((edge) => state.baseVisibleIds.has(edge.source) && state.baseVisibleIds.has(edge.target))
      .map((edge) => edge.id));
    if (state.routeStartId && !state.baseVisibleIds.has(state.routeStartId)) state.routeStartId = '';
    if (state.selectedId && !state.baseVisibleIds.has(state.selectedId)) {
      clearSelection({ announce: false, updateHistory: false, renderMap: false });
    }
    updateDirectIds();
    updateRoute();
  }

  function queryMatches(query) {
    const terms = normalize(query).split(' ').filter(Boolean);
    if (!terms.length) return [];
    return state.data.nodes
      .filter((node) => state.baseVisibleIds.has(node.id))
      .map((node) => {
        const title = normalize(node.title);
        const aliases = normalize((node.aliases ?? []).join(' '));
        const haystack = `${title} ${aliases}`;
        if (!terms.every((term) => haystack.includes(term))) return null;
        const score = terms.reduce((total, term) => total
          + (title === term ? 100 : title.startsWith(term) ? 60 : title.includes(term) ? 35 : 0)
          + (aliases.includes(term) ? 20 : 0), 0);
        return { node, score };
      })
      .filter(Boolean)
      .sort((left, right) => right.score - left.score || collator.compare(left.node.title, right.node.title));
  }

  function updateQuery() {
    state.query = refs.search.value.trim();
    state.queryIds = new Set(queryMatches(state.query).slice(0, 24).map(({ node }) => node.id));
  }

  function updateDirectIds() {
    state.directIds = new Set(state.selectedId ? filteredRecordsFor(state.selectedId).map((record) => record.node.id) : []);
  }

  function shortestPath(startId, endId) {
    if (!startId || !endId || !state.baseVisibleIds.has(startId) || !state.baseVisibleIds.has(endId)) return [];
    if (startId === endId) return [startId];
    const adjacency = new Map([...state.baseVisibleIds].map((id) => [id, new Set()]));
    for (const edgeId of state.baseVisibleEdgeIds) {
      const edge = state.edgeById.get(edgeId);
      adjacency.get(edge.source)?.add(edge.target);
      adjacency.get(edge.target)?.add(edge.source);
    }
    const queue = [startId];
    const previous = new Map([[startId, null]]);
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const id = queue[cursor];
      const neighbors = [...(adjacency.get(id) ?? [])].sort((left, right) => collator.compare(left, right));
      for (const neighbor of neighbors) {
        if (previous.has(neighbor)) continue;
        previous.set(neighbor, id);
        if (neighbor === endId) {
          const path = [endId];
          for (let current = id; current; current = previous.get(current)) path.push(current);
          return path.reverse();
        }
        queue.push(neighbor);
      }
    }
    return [];
  }

  function updateRoute() {
    state.routeIds = new Set();
    state.routeEdgeIds = new Set();
    if (!state.routeStartId || !state.selectedId || state.routeStartId === state.selectedId) return;
    const path = shortestPath(state.routeStartId, state.selectedId);
    for (const id of path) state.routeIds.add(id);
    for (let index = 1; index < path.length; index += 1) {
      const left = path[index - 1];
      const right = path[index];
      const edge = state.data.edges
        .filter((candidate) => state.baseVisibleEdgeIds.has(candidate.id))
        .filter((candidate) => (
          (candidate.source === left && candidate.target === right)
          || (candidate.source === right && candidate.target === left)
        ))
        .sort((a, b) => b.weight - a.weight || collator.compare(a.id, b.id))[0];
      if (edge) state.routeEdgeIds.add(edge.id);
    }
  }

  function computeFocusPositions() {
    state.displayPositions = new Map();
    if (!state.selectedId || !state.directIds.size) return;
    const selected = state.nodeById.get(state.selectedId);
    if (!selected) return;
    const center = layoutPosition(selected);
    const neighbors = [...state.directIds]
      .map((id) => state.nodeById.get(id))
      .filter(Boolean)
      .sort((left, right) => {
        const leftPoint = layoutPosition(left);
        const rightPoint = layoutPosition(right);
        const leftAngle = Math.atan2(leftPoint.y - center.y, leftPoint.x - center.x);
        const rightAngle = Math.atan2(rightPoint.y - center.y, rightPoint.x - center.x);
        return leftAngle - rightAngle || collator.compare(left.title, right.title);
      });
    state.displayPositions = focusRingPositions(
      neighbors.map((node) => node.id),
      center,
      state.viewport,
      state.transform.scale,
    );
  }

  function viewportSize() {
    const bounds = refs.viewport.getBoundingClientRect();
    return {
      width: Math.max(320, Math.round(bounds.width)),
      height: Math.max(480, Math.round(bounds.height)),
    };
  }

  function fitVisible({ announce = false } = {}) {
    const nodes = state.data.nodes.filter((node) => state.baseVisibleIds.has(node.id));
    const fitted = fitGraphTransform(nodes, state.layout, state.viewport, {
      padding: { top: 72, right: 72, bottom: 72, left: 72 },
      maximumScale: 2,
    });
    state.transform = {
      scale: fitted.scale,
      translateX: fitted.translateX,
      translateY: fitted.translateY,
      minimumHitRadius: 12,
    };
    state.fitScale = fitted.scale || 1;
    if (state.selectedId) {
      const selected = state.nodeById.get(state.selectedId);
      if (selected) {
        const point = layoutPosition(selected);
        state.transform.translateX = state.viewport.width / 2 - point.x * state.transform.scale;
        state.transform.translateY = state.viewport.height / 2 - point.y * state.transform.scale;
      }
    }
    render();
    if (announce) {
      setStatus(state.selectedId ? '선택 문서와 직접 연결을 화면에 맞췄습니다.' : '현재 필터의 전체 지도를 화면에 맞췄습니다.');
    }
  }

  function centerNode(id, { minimumRelativeScale = 1 } = {}) {
    const node = state.nodeById.get(id);
    if (!node) return;
    const scale = Math.max(state.transform.scale, state.fitScale * minimumRelativeScale);
    const point = layoutPosition(node);
    state.transform.scale = clamp(state.fitScale * 0.6, state.fitScale * 12, scale);
    state.transform.translateX = state.viewport.width / 2 - point.x * state.transform.scale;
    state.transform.translateY = state.viewport.height / 2 - point.y * state.transform.scale;
  }

  function zoomAt(factor, anchor = { x: state.viewport.width / 2, y: state.viewport.height / 2 }) {
    const previousScale = state.transform.scale;
    const nextScale = clamp(state.fitScale * 0.6, state.fitScale * 12, previousScale * factor);
    if (Math.abs(nextScale - previousScale) < 1e-9) return;
    const world = screenToWorld(anchor, state.transform);
    state.transform.scale = nextScale;
    state.transform.translateX = anchor.x - world.x * nextScale;
    state.transform.translateY = anchor.y - world.y * nextScale;
    render();
  }

  function scheduleWheelZoom(factor, anchor) {
    state.pendingWheelFactor *= factor;
    state.pendingWheelAnchor = anchor;
    if (state.wheelFrame) return;
    state.wheelFrame = window.requestAnimationFrame(() => {
      const pendingFactor = state.pendingWheelFactor;
      const pendingAnchor = state.pendingWheelAnchor;
      state.wheelFrame = 0;
      state.pendingWheelFactor = 1;
      state.pendingWheelAnchor = null;
      zoomAt(pendingFactor, pendingAnchor);
    });
  }

  function relativeScale() {
    return state.fitScale > 0 ? state.transform.scale / state.fitScale : 1;
  }

  function visibleEdgeIds(model, tier) {
    const ids = [...model.edgeIds];
    if (state.selectedId) {
      return new Set(ids.filter((id) => {
        const edge = state.edgeById.get(id);
        return edge.source === state.selectedId || edge.target === state.selectedId || state.routeEdgeIds.has(id);
      }));
    }
    const ranked = ids
      .map((id) => state.edgeById.get(id))
      .filter(Boolean)
      .sort((left, right) => (
        Number(right.crossCommunity) - Number(left.crossCommunity)
        || Number(right.weight ?? 0) - Number(left.weight ?? 0)
        || collator.compare(left.id, right.id)
      ));
    const limit = tier === 'overview' ? 180 : tier === 'map' ? 520 : 1500;
    return new Set(ranked.slice(0, limit).map((edge) => edge.id));
  }

  function communityBounds(communityId) {
    const members = state.data.nodes
      .filter((node) => state.baseVisibleIds.has(node.id) && node.community === communityId)
      .map((node) => layoutPosition(node));
    if (!members.length) return null;
    const minX = Math.min(...members.map((point) => point.x));
    const maxX = Math.max(...members.map((point) => point.x));
    const minY = Math.min(...members.map((point) => point.y));
    const maxY = Math.max(...members.map((point) => point.y));
    const inset = 34 / state.transform.scale;
    return {
      x: minX - inset,
      y: minY - inset,
      width: Math.max(1, maxX - minX + inset * 2),
      height: Math.max(1, maxY - minY + inset * 2),
    };
  }

  function renderCommunities(model, tier) {
    refs.communities.replaceChildren();
    if (state.layout !== 'community') return;
    const fontSize = 11 / state.transform.scale;
    for (const communityId of model.communityIds) {
      const community = state.communityById.get(String(communityId));
      const bounds = communityBounds(communityId);
      if (!community || !bounds) continue;
      const group = svgElement('g', {
        class: `map-community ${state.layout === 'community' ? 'is-grouped' : 'is-ungrouped'}`,
      });
      if (state.layout === 'community' || tier === 'overview') {
        group.append(svgElement('rect', {
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
          'vector-effect': 'non-scaling-stroke',
        }));
      }
      const label = svgElement('text', {
        x: bounds.x,
        y: bounds.y - 12 / state.transform.scale,
        'font-size': fontSize,
        'data-community-id': communityId,
      });
      const number = svgElement('tspan', { class: 'map-community-number' }, String(Number(communityId) + 1).padStart(2, '0'));
      const title = svgElement('tspan', { dx: 8 / state.transform.scale }, community.label);
      label.append(number, title);
      group.append(label);
      refs.communities.append(group);
    }
  }

  function renderEdges(model, tier) {
    refs.edges.replaceChildren();
    const edgeIds = visibleEdgeIds(model, tier);
    for (const edgeId of edgeIds) {
      const edge = state.edgeById.get(edgeId);
      const source = state.nodeById.get(edge.source);
      const target = state.nodeById.get(edge.target);
      if (!source || !target) continue;
      const start = displayPosition(source);
      const end = displayPosition(target);
      const direct = state.selectedId && (edge.source === state.selectedId || edge.target === state.selectedId);
      const route = state.routeEdgeIds.has(edge.id);
      const line = svgElement('line', {
        class: `map-edge${direct ? ' is-direct' : ''}${route ? ' is-route' : ''}${edge.crossCommunity ? ' is-cross' : ''}`,
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y,
        'vector-effect': 'non-scaling-stroke',
        'marker-end': direct || route ? 'url(#map-arrow)' : null,
      });
      refs.edges.append(line);
    }
  }

  function nodeScreenRadius(node) {
    return clamp(4.5, 13, 4 + Math.log2(1 + Number(node.degree ?? 0)) * 1.5)
      + (node.id === state.selectedId ? 2.5 : state.directIds.has(node.id) ? 1 : 0);
  }

  function nodeLayerRank(node) {
    if (node.id === state.selectedId) return 2;
    if (state.directIds.has(node.id) || state.routeIds.has(node.id)) return 1;
    return 0;
  }

  function compareNodeLayers(left, right) {
    return nodeLayerRank(left) - nodeLayerRank(right)
      || Number(left.degree ?? 0) - Number(right.degree ?? 0)
      || collator.compare(left.id, right.id);
  }

  function renderNodes(model) {
    refs.nodes.replaceChildren();
    const nodes = [...model.nodeIds]
      .map((id) => state.nodeById.get(id))
      .filter(Boolean)
      .sort(compareNodeLayers);
    for (const node of nodes) {
      const point = displayPosition(node);
      const radius = nodeScreenRadius(node) / state.transform.scale;
      const selected = node.id === state.selectedId;
      const direct = state.directIds.has(node.id);
      const route = state.routeIds.has(node.id);
      const query = state.queryIds.has(node.id);
      const unrelated = Boolean(state.selectedId && !selected && !direct && !route);
      const group = svgElement('g', {
        class: `map-node map-node--${node.verification}${selected ? ' is-selected' : ''}${direct ? ' is-direct' : ''}${route ? ' is-route' : ''}${query ? ' is-query' : ''}${unrelated ? ' is-unrelated' : ''}`,
        transform: `translate(${point.x} ${point.y})`,
      });
      if (selected || (!state.selectedId && (query || node.id === state.keyboardId))) {
        group.append(svgElement('circle', {
          class: 'map-node-ring',
          r: radius + 6 / state.transform.scale,
          'vector-effect': 'non-scaling-stroke',
        }));
      }
      group.append(svgElement('circle', {
        class: 'map-node-dot',
        r: radius,
        'vector-effect': 'non-scaling-stroke',
      }));
      refs.nodes.append(group);
    }
  }

  function intersects(left, right, gap = 3) {
    return !(
      left.x + left.width + gap < right.x
      || right.x + right.width + gap < left.x
      || left.y + left.height + gap < right.y
      || right.y + right.height + gap < left.y
    );
  }

  function labelPlacement(node, placed, forced) {
    const point = worldToScreen(displayPosition(node), state.transform);
    const radius = nodeScreenRadius(node);
    const fontSize = node.id === state.selectedId ? 15 : forced ? 12.5 : 11.5;
    const title = node.title.length > 44 ? `${node.title.slice(0, 42)}…` : node.title;
    const width = Math.min(330, Math.max(38, [...title].length * fontSize * 0.62 + 12));
    const height = fontSize + 10;
    const candidates = [
      { x: point.x + radius + 8, y: point.y - height / 2 },
      { x: point.x - radius - width - 8, y: point.y - height / 2 },
      { x: point.x - width / 2, y: point.y - radius - height - 8 },
      { x: point.x - width / 2, y: point.y + radius + 8 },
    ];
    let best = candidates[0];
    let bestOverlap = Number.POSITIVE_INFINITY;
    for (const candidate of candidates) {
      const candidateBox = { ...candidate, width, height };
      const overlap = placed.filter((box) => intersects(candidateBox, box)).length
        + Number(candidate.x < 4 || candidate.y < 4 || candidate.x + width > state.viewport.width - 4 || candidate.y + height > state.viewport.height - 4) * 3;
      if (overlap < bestOverlap) {
        best = candidate;
        bestOverlap = overlap;
      }
      if (overlap === 0) break;
    }
    if (!forced && bestOverlap > 0) return null;
    const box = {
      x: clamp(4, Math.max(4, state.viewport.width - width - 4), best.x),
      y: clamp(4, Math.max(4, state.viewport.height - height - 4), best.y),
      width,
      height,
    };
    placed.push(box);
    return { ...box, fontSize, title };
  }

  function renderLabels(model) {
    refs.labels.replaceChildren();
    state.labelHitAreas = new Map();
    const forcedIds = new Set([state.selectedId, ...state.directIds, ...state.routeIds].filter(Boolean));
    const labelIds = resolvedLabelIds(model.labelIds, {
      selectedId: state.selectedId,
      directIds: state.directIds,
      routeIds: state.routeIds,
      keyboardId: model.nodeIds.has(state.keyboardId) ? state.keyboardId : '',
      hoveredId: model.nodeIds.has(state.hoveredId) ? state.hoveredId : '',
    });
    const nodes = [...labelIds]
      .map((id) => state.nodeById.get(id))
      .filter(Boolean)
      .sort((left, right) => (
        Number(forcedIds.has(right.id)) - Number(forcedIds.has(left.id))
        || Number(right.degree ?? 0) - Number(left.degree ?? 0)
        || collator.compare(left.title, right.title)
      ));
    const placed = [];
    for (const node of nodes) {
      const forced = forcedIds.has(node.id)
        || (!state.selectedId && (node.id === state.keyboardId || node.id === state.hoveredId || state.queryIds.has(node.id)));
      const placement = labelPlacement(node, placed, forced);
      if (!placement) continue;
      const world = screenToWorld({ x: placement.x, y: placement.y }, state.transform);
      state.labelHitAreas.set(node.id, {
        x: world.x,
        y: world.y,
        width: placement.width,
        height: placement.height,
      });
      const group = svgElement('g', {
        class: `map-label${node.id === state.selectedId ? ' is-selected' : ''}${state.directIds.has(node.id) ? ' is-direct' : ''}`,
        transform: `translate(${world.x} ${world.y})`,
      });
      group.append(svgElement('rect', {
        width: placement.width / state.transform.scale,
        height: placement.height / state.transform.scale,
        rx: 0,
        'vector-effect': 'non-scaling-stroke',
      }));
      group.append(svgElement('text', {
        x: 6 / state.transform.scale,
        y: placement.height / 2 / state.transform.scale,
        'font-size': placement.fontSize / state.transform.scale,
        'dominant-baseline': 'middle',
      }, placement.title));
      refs.labels.append(group);
    }
    syncNodeActionPositions();
  }

  function positionNodeAction(button, node) {
    const point = worldToScreen(displayPosition(node), state.transform);
    const nodeSize = Math.max(24, nodeScreenRadius(node) * 2 + 10);
    let left = point.x - nodeSize / 2;
    let top = point.y - nodeSize / 2;
    let right = point.x + nodeSize / 2;
    let bottom = point.y + nodeSize / 2;
    const labelArea = state.labelHitAreas.get(node.id);
    if (labelArea) {
      const labelPoint = worldToScreen(labelArea, state.transform);
      left = Math.min(left, labelPoint.x);
      top = Math.min(top, labelPoint.y);
      right = Math.max(right, labelPoint.x + labelArea.width);
      bottom = Math.max(bottom, labelPoint.y + labelArea.height);
    }
    button.style.left = `${left}px`;
    button.style.top = `${top}px`;
    button.style.width = `${right - left}px`;
    button.style.height = `${bottom - top}px`;
  }

  function syncNodeActionPositions() {
    for (const button of refs.nodeActions.querySelectorAll('[data-map-node-id]')) {
      const node = state.nodeById.get(button.dataset.mapNodeId);
      if (node) positionNodeAction(button, node);
    }
  }

  function renderNodeActions(model) {
    const focusedId = refs.nodeActions.contains(document.activeElement)
      ? document.activeElement.dataset.mapNodeId ?? ''
      : '';
    refs.nodeActions.replaceChildren();
    const nodes = [...model.nodeIds]
      .map((id) => state.nodeById.get(id))
      .filter(Boolean)
      .sort(compareNodeLayers);
    if (!state.keyboardId || !model.nodeIds.has(state.keyboardId)) {
      state.keyboardId = state.selectedId && model.nodeIds.has(state.selectedId) ? state.selectedId : nodes[0]?.id ?? '';
    }
    for (const node of nodes) {
      const button = htmlElement('button', 'map-node-action');
      button.type = 'button';
      button.dataset.mapNodeId = node.id;
      button.tabIndex = node.id === state.keyboardId ? 0 : -1;
      positionNodeAction(button, node);
      button.setAttribute('aria-label', `${node.title}, ${typeLabels[node.type] ?? node.type}, 연결 ${node.degree}`);
      button.setAttribute('aria-pressed', node.id === state.selectedId ? 'true' : 'false');
      refs.nodeActions.append(button);
    }
    if (focusedId && model.nodeIds.has(focusedId)) {
      refs.nodeActions.querySelector(`[data-map-node-id="${CSS.escape(focusedId)}"]`)?.focus({ preventScroll: true });
    }
  }

  function applyTransformOnly() {
    refs.scene.setAttribute('transform', `translate(${state.transform.translateX} ${state.transform.translateY}) scale(${state.transform.scale})`);
    syncNodeActionPositions();
  }

  function renderReadouts(model, tier) {
    const visibleNodes = model.nodeIds.size;
    refs.tier.textContent = tierLabels[tier];
    refs.visibleCount.textContent = `${visibleNodes} 문서`;
    refs.zoomOutput.value = `${Math.round(relativeScale() * 100)}%`;
    refs.zoomOutput.textContent = refs.zoomOutput.value;
    const filtered = state.baseVisibleIds.size !== state.data.nodes.length;
    const selection = state.selectedId ? state.nodeById.get(state.selectedId)?.title : '';
    refs.summary.textContent = selection
      ? `${selection} · 직접 연결 ${state.directIds.size}개`
      : `${filtered ? '필터 결과' : '전체 구조'} · 문서 ${state.baseVisibleIds.size}개`;
    refs.detailsToggle.disabled = !state.selectedId;
    refs.detailsToggle.setAttribute('aria-expanded', String(state.detailsOpen));
  }

  function render() {
    if (!state.data) return;
    computeFocusPositions();
    const scale = relativeScale();
    const tier = semanticZoomTier(scale);
    const model = visibleGraphElements(state.data, {
      baseVisibleIds: state.baseVisibleIds,
      baseVisibleEdgeIds: state.baseVisibleEdgeIds,
      selectedId: state.selectedId,
      directIds: state.directIds,
      routeIds: state.routeIds,
      routeEdgeIds: state.routeEdgeIds,
      hoveredId: state.hoveredId,
      queryIds: state.queryIds,
      scale,
    });
    state.visibleModel = model;
    applyTransformOnly();
    renderCommunities(model, tier);
    renderEdges(model, tier);
    renderNodes(model);
    renderLabels(model);
    renderNodeActions(model);
    renderReadouts(model, tier);
  }

  function directionLabel(record) {
    if (record.directions.has('in') && record.directions.has('out')) return '서로 연결';
    return record.directions.has('out') ? '나가는 관계' : '들어오는 관계';
  }

  function basisLabel(record) {
    const related = record.kinds.has('related');
    const body = record.kinds.has('body');
    return related && body ? '편집 관계 + 본문 링크' : related ? '편집 관계' : '본문 링크';
  }

  function renderDetails() {
    refs.detailsContent.replaceChildren();
    const node = state.nodeById.get(state.selectedId);
    if (!node) return;
    const article = htmlElement('article', 'map-details-article');
    const heading = htmlElement('h2', '', node.title);
    heading.tabIndex = -1;
    heading.dataset.mapDetailsHeading = '';
    const meta = htmlElement('p', 'map-details-meta', `${typeLabels[node.type] ?? node.type} · ${verificationLabels[node.verification] ?? node.verification} · 근거 ${node.evidenceCount}`);
    const excerpt = htmlElement('p', 'map-details-excerpt', node.excerpt || '요약이 없습니다.');
    const open = htmlElement('a', 'map-details-open', '문서 읽기');
    open.href = node.url;
    article.append(heading, meta, excerpt, open);

    const routeSection = htmlElement('section', 'map-details-route');
    const routeHeading = htmlElement('h3', '', '연결 경로');
    const routeCopy = htmlElement('p');
    if (!state.routeStartId) routeCopy.textContent = '이 문서를 출발점으로 정한 뒤 다른 노드를 선택하면 최단 연결 경로를 표시합니다.';
    else if (state.routeStartId === node.id) routeCopy.textContent = '출발점입니다. 지도에서 도착 문서를 선택하세요.';
    else if (state.routeIds.size) routeCopy.textContent = `${state.nodeById.get(state.routeStartId)?.title}에서 ${node.title}까지 ${state.routeIds.size - 1}단계입니다.`;
    else routeCopy.textContent = '현재 필터 안에서 두 문서를 잇는 경로가 없습니다.';
    const routeActions = htmlElement('div', 'map-details-actions');
    const routeButton = htmlElement('button', '', state.routeStartId === node.id ? '출발점 해제' : '여기서 경로 시작');
    routeButton.type = 'button';
    routeButton.dataset.mapRouteStart = node.id;
    routeActions.append(routeButton);
    if (state.routeStartId) {
      const clear = htmlElement('button', '', '경로 지우기');
      clear.type = 'button';
      clear.dataset.mapRouteClear = '';
      routeActions.append(clear);
    }
    routeSection.append(routeHeading, routeCopy, routeActions);

    const records = filteredRecordsFor(node.id);
    const relations = htmlElement('section', 'map-details-relations');
    const relationsHeader = htmlElement('header');
    relationsHeader.append(htmlElement('h3', '', '직접 연결'), htmlElement('span', '', `${records.length}개`));
    relations.append(relationsHeader);
    if (!records.length) {
      relations.append(htmlElement('p', 'map-details-empty', '현재 필터 안에 직접 연결된 문서가 없습니다.'));
    } else {
      const list = htmlElement('ol', 'map-relation-list');
      for (const record of records) {
        const item = htmlElement('li');
        const focus = htmlElement('button', 'map-relation-focus');
        focus.type = 'button';
        focus.dataset.mapSelectId = record.node.id;
        focus.append(
          htmlElement('strong', '', record.node.title),
          htmlElement('span', '', `${directionLabel(record)} · ${basisLabel(record)}`),
        );
        const link = htmlElement('a', '', '읽기');
        link.href = record.node.url;
        item.append(focus, link);
        list.append(item);
      }
      relations.append(list);
    }
    refs.detailsContent.append(article, routeSection, relations);
  }

  function openDetails() {
    if (!state.selectedId || state.detailsOpen) return;
    state.detailsOpen = true;
    refs.details.hidden = false;
    refs.details.setAttribute('aria-hidden', 'false');
    root.classList.add('has-map-details');
    renderDetails();
    refs.detailsToggle.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => refs.detailsContent.querySelector('[data-map-details-heading]')?.focus({ preventScroll: true }));
  }

  function closeDetails({ restoreFocus = true } = {}) {
    if (!state.detailsOpen) return;
    state.detailsOpen = false;
    refs.details.hidden = true;
    refs.details.setAttribute('aria-hidden', 'true');
    root.classList.remove('has-map-details');
    refs.detailsToggle.setAttribute('aria-expanded', 'false');
    if (restoreFocus) refs.detailsToggle.focus({ preventScroll: true });
  }

  function setStatus(message) {
    refs.status.textContent = message;
  }

  function updateUrl({ push = false } = {}) {
    const url = new URL(window.location.href);
    const set = (name, value, fallback = '') => {
      if (value !== fallback && value !== '' && value !== null && value !== undefined) url.searchParams.set(name, value);
      else url.searchParams.delete(name);
    };
    set('node', state.selectedId);
    set('layout', state.layout, state.data.defaultLayout);
    set('type', state.filters.type);
    set('verification', state.filters.verification);
    set('relation', state.filters.relation, 'all');
    set('community', state.filters.community);
    set('orphans', state.filters.showOrphans ? '' : '0');
    set('q', state.query);
    url.searchParams.delete('focus');
    window.history[push ? 'pushState' : 'replaceState']({}, '', url);
  }

  function selectNode(id, { push = true, center = true, announce = true } = {}) {
    const node = state.nodeById.get(id);
    if (!node || !state.baseVisibleIds.has(id)) return;
    const changed = state.selectedId !== id;
    state.selectedId = id;
    state.keyboardId = id;
    updateDirectIds();
    updateRoute();
    if (center) centerNode(id, { minimumRelativeScale: 1 });
    render();
    if (state.detailsOpen) renderDetails();
    if (push && changed) updateUrl({ push: true });
    else updateUrl();
    if (announce) setStatus(`${node.title} 선택. 직접 연결 ${state.directIds.size}개.`);
  }

  function clearSelection({ announce = true, updateHistory = true, renderMap = true } = {}) {
    if (!state.selectedId) return;
    state.selectedId = '';
    state.directIds = new Set();
    state.keyboardId = '';
    state.routeIds = new Set();
    state.routeEdgeIds = new Set();
    closeDetails({ restoreFocus: false });
    if (renderMap) render();
    if (updateHistory) updateUrl();
    if (announce) setStatus('문서 선택을 해제했습니다.');
  }

  function activeFilterCount() {
    return Number(Boolean(state.filters.type))
      + Number(Boolean(state.filters.verification))
      + Number(Boolean(state.filters.community))
      + Number(state.filters.relation !== 'all')
      + Number(!state.filters.showOrphans);
  }

  function readFilters() {
    state.filters = {
      type: refs.type.value,
      verification: refs.verification.value,
      community: refs.community.value,
      relation: refs.relation.value,
      showOrphans: refs.showOrphans.checked,
    };
  }

  function writeFilters() {
    refs.type.value = state.filters.type;
    refs.verification.value = state.filters.verification;
    refs.community.value = state.filters.community;
    refs.relation.value = state.filters.relation;
    refs.showOrphans.checked = state.filters.showOrphans;
    refs.filterCount.textContent = String(activeFilterCount());
  }

  function applyFilters({ announce = true } = {}) {
    readFilters();
    computeBaseVisibility();
    updateQuery();
    refs.filterCount.textContent = String(activeFilterCount());
    fitVisible();
    if (state.detailsOpen) renderDetails();
    updateUrl();
    if (announce) setStatus(`필터 적용. 문서 ${state.baseVisibleIds.size}개가 표시됩니다.`);
  }

  function setLayout(layoutId, { announce = true, updateHistory = true } = {}) {
    const layout = state.data.layouts.find((candidate) => candidate.id === layoutId);
    if (!layout) return;
    state.layout = layout.id;
    for (const button of root.querySelectorAll('[data-map-layout]')) {
      button.setAttribute('aria-pressed', String(button.dataset.mapLayout === state.layout));
    }
    refs.layoutNote.querySelector('strong').textContent = layout.label;
    refs.layoutNote.querySelector('span').textContent = layout.description;
    try { localStorage.setItem('llmwiki-map-layout', state.layout); } catch { /* Storage is optional. */ }
    fitVisible();
    if (updateHistory) updateUrl();
    if (announce) setStatus(`${layout.label} 배치로 전환했습니다.`);
  }

  function openFilters() {
    writeFilters();
    refs.filterDialog.showModal();
    refs.type.focus();
  }

  function closeFilters() {
    if (refs.filterDialog.open) refs.filterDialog.close();
    root.querySelector('[data-map-filters-open]')?.focus();
  }

  function pointerPoint(event) {
    const bounds = refs.viewport.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  }

  function spatialNeighbor(currentId, key) {
    const current = refs.nodeActions.querySelector(`[data-map-node-id="${CSS.escape(currentId)}"]`);
    if (!current) return null;
    const origin = { x: Number.parseFloat(current.style.left), y: Number.parseFloat(current.style.top) };
    const direction = {
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
    }[key];
    return [...refs.nodeActions.querySelectorAll('[data-map-node-id]')]
      .filter((button) => button !== current)
      .map((button) => {
        const dx = Number.parseFloat(button.style.left) - origin.x;
        const dy = Number.parseFloat(button.style.top) - origin.y;
        const distance = Math.hypot(dx, dy);
        const forward = dx * direction.x + dy * direction.y;
        const side = Math.abs(dx * direction.y - dy * direction.x);
        return { button, distance, forward, score: distance + side * 1.8 };
      })
      .filter((candidate) => candidate.forward > 2)
      .sort((left, right) => left.score - right.score || left.distance - right.distance)[0]?.button ?? null;
  }

  function handleNodeKey(event) {
    const button = event.target.closest('[data-map-node-id]');
    if (!button) return;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      const next = spatialNeighbor(button.dataset.mapNodeId, event.key);
      if (!next) return;
      state.keyboardId = next.dataset.mapNodeId;
      for (const item of refs.nodeActions.querySelectorAll('[data-map-node-id]')) item.tabIndex = item === next ? 0 : -1;
      next.focus({ preventScroll: true });
      renderLabels(state.visibleModel);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectNode(button.dataset.mapNodeId);
      refs.nodeActions.querySelector(`[data-map-node-id="${CSS.escape(state.selectedId)}"]`)?.focus({ preventScroll: true });
      return;
    }
    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      zoomAt(1.28);
    } else if (event.key === '-' || event.key === '_') {
      event.preventDefault();
      zoomAt(1 / 1.28);
    } else if (event.key === '0' || event.key === 'Home') {
      event.preventDefault();
      fitVisible({ announce: true });
    }
  }

  function bindEvents() {
    refs.searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      updateQuery();
      const match = queryMatches(state.query)[0]?.node;
      if (!match) {
        render();
        updateUrl();
        setStatus('제목이나 별칭이 일치하는 문서가 없습니다.');
        return;
      }
      selectNode(match.id, { push: true, center: true });
    });
    refs.search.addEventListener('input', () => {
      window.clearTimeout(state.queryTimer);
      state.queryTimer = window.setTimeout(() => {
        updateQuery();
        render();
        updateUrl();
      }, 120);
    });
    refs.search.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !refs.search.value) return;
      event.preventDefault();
      event.stopPropagation();
      refs.search.value = '';
      updateQuery();
      render();
      updateUrl();
    });

    root.addEventListener('click', (event) => {
      const layoutButton = event.target.closest('[data-map-layout]');
      if (layoutButton) setLayout(layoutButton.dataset.mapLayout);
      if (event.target.closest('[data-map-filters-open]')) openFilters();
      if (event.target.closest('[data-map-filters-close]')) closeFilters();
      if (event.target.closest('[data-map-filters-apply]')) {
        applyFilters();
        closeFilters();
      }
      if (event.target.closest('[data-map-filter-reset]')) {
        window.setTimeout(() => {
          state.filters = { type: '', verification: '', community: '', relation: 'all', showOrphans: true };
          writeFilters();
          applyFilters();
        }, 0);
      }
      if (event.target.closest('[data-map-details-toggle]')) state.detailsOpen ? closeDetails() : openDetails();
      if (event.target.closest('[data-map-details-close]')) closeDetails();
      const selectButton = event.target.closest('[data-map-select-id]');
      if (selectButton) selectNode(selectButton.dataset.mapSelectId);
      const routeStart = event.target.closest('[data-map-route-start]');
      if (routeStart) {
        state.routeStartId = state.routeStartId === routeStart.dataset.mapRouteStart ? '' : routeStart.dataset.mapRouteStart;
        updateRoute();
        render();
        if (state.detailsOpen) renderDetails();
        setStatus(state.routeStartId ? '경로 출발점을 정했습니다. 도착 문서를 선택하세요.' : '경로 출발점을 해제했습니다.');
      }
      if (event.target.closest('[data-map-route-clear]')) {
        state.routeStartId = '';
        updateRoute();
        render();
        if (state.detailsOpen) renderDetails();
        setStatus('연결 경로를 지웠습니다.');
      }
      const zoomButton = event.target.closest('[data-map-zoom]');
      if (zoomButton) zoomAt(zoomButton.dataset.mapZoom === 'in' ? 1.28 : 1 / 1.28);
      if (event.target.closest('[data-map-fit]')) fitVisible({ announce: true });
    });

    refs.nodeActions.addEventListener('click', (event) => {
      const button = event.target.closest('[data-map-node-id]');
      if (button) selectNode(button.dataset.mapNodeId);
    });
    refs.nodeActions.addEventListener('keydown', handleNodeKey);
    refs.nodeActions.addEventListener('focusin', (event) => {
      const button = event.target.closest('[data-map-node-id]');
      if (!button) return;
      state.keyboardId = button.dataset.mapNodeId;
      for (const item of refs.nodeActions.querySelectorAll('[data-map-node-id]')) item.tabIndex = item === button ? 0 : -1;
      renderLabels(state.visibleModel);
    });
    refs.nodeActions.addEventListener('pointerover', (event) => {
      const button = event.target.closest('[data-map-node-id]');
      if (!button || button.dataset.mapNodeId === state.hoveredId) return;
      state.hoveredId = button.dataset.mapNodeId;
      renderLabels(state.visibleModel);
    });
    refs.nodeActions.addEventListener('pointerout', (event) => {
      if (event.relatedTarget?.closest?.('[data-map-node-id]')) return;
      state.hoveredId = '';
      renderLabels(state.visibleModel);
    });

    refs.viewport.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || event.target.closest('button, a, input, select, textarea, summary, [role="button"]')) return;
      const point = pointerPoint(event);
      state.pointer = {
        id: event.pointerId,
        startX: point.x,
        startY: point.y,
        translateX: state.transform.translateX,
        translateY: state.transform.translateY,
      };
      refs.viewport.setPointerCapture(event.pointerId);
      refs.viewport.classList.add('is-panning');
    });
    refs.viewport.addEventListener('pointermove', (event) => {
      if (!state.pointer || state.pointer.id !== event.pointerId) return;
      const point = pointerPoint(event);
      state.transform.translateX = state.pointer.translateX + point.x - state.pointer.startX;
      state.transform.translateY = state.pointer.translateY + point.y - state.pointer.startY;
      applyTransformOnly();
    });
    const endPointer = (event) => {
      if (!state.pointer || state.pointer.id !== event.pointerId) return;
      state.pointer = null;
      refs.viewport.classList.remove('is-panning');
    };
    refs.viewport.addEventListener('pointerup', endPointer);
    refs.viewport.addEventListener('pointercancel', endPointer);
    refs.viewport.addEventListener('wheel', (event) => {
      event.preventDefault();
      scheduleWheelZoom(Math.exp(-event.deltaY * 0.0012), pointerPoint(event));
    }, { passive: false });

    document.addEventListener('keydown', (event) => {
      const editable = event.target.closest('input, textarea, select, [contenteditable="true"], dialog');
      if (event.key === 'Escape' && !refs.filterDialog.open) {
        if (refs.search.value) {
          event.preventDefault();
          refs.search.value = '';
          updateQuery();
          render();
          updateUrl();
          setStatus('검색어를 지웠습니다.');
        } else if (state.detailsOpen) {
          event.preventDefault();
          closeDetails();
        } else if (state.selectedId) {
          event.preventDefault();
          clearSelection();
        }
        return;
      }
      if (event.key === '/' && !editable) {
        event.preventDefault();
        refs.search.focus();
        refs.search.select();
      }
    });

    window.addEventListener('popstate', () => applyUrlState({ fit: true, announce: false }));
    desktopGraph.addEventListener('change', (event) => {
      if (!event.matches) root.closest('.map-main')?.remove();
    });
    const observer = new ResizeObserver(() => {
      window.cancelAnimationFrame(state.resizeFrame);
      state.resizeFrame = window.requestAnimationFrame(() => {
        const next = viewportSize();
        const previous = state.viewport;
        if (next.width === previous.width && next.height === previous.height) return;
        const worldCenter = screenToWorld({ x: previous.width / 2, y: previous.height / 2 }, state.transform);
        state.viewport = next;
        refs.svg.setAttribute('viewBox', `0 0 ${next.width} ${next.height}`);
        state.transform.translateX = next.width / 2 - worldCenter.x * state.transform.scale;
        state.transform.translateY = next.height / 2 - worldCenter.y * state.transform.scale;
        render();
      });
    });
    observer.observe(refs.viewport);
  }

  function validParam(url, name, allowed, fallback = '') {
    const value = url.searchParams.get(name) ?? fallback;
    return allowed.has(value) ? value : fallback;
  }

  function applyUrlState({ fit = false, announce = false } = {}) {
    const url = new URL(window.location.href);
    const detailsWasOpen = state.detailsOpen;
    let storedLayout = '';
    try { storedLayout = localStorage.getItem('llmwiki-map-layout') ?? ''; } catch { /* Storage is optional. */ }
    const layoutIds = new Set(state.data.layouts.map((layout) => layout.id));
    state.layout = validParam(url, 'layout', layoutIds, layoutIds.has(storedLayout) ? storedLayout : state.data.defaultLayout);
    state.filters.type = validParam(url, 'type', new Set(['', 'source', 'reference', 'concept', 'entity', 'analysis']));
    state.filters.verification = validParam(url, 'verification', new Set(['', 'verified', 'partial', 'disputed', 'unverified']));
    state.filters.relation = validParam(url, 'relation', new Set(['all', 'related', 'body']), 'all');
    const communities = new Set(['', ...state.data.communities.map((community) => String(community.id))]);
    state.filters.community = validParam(url, 'community', communities);
    state.filters.showOrphans = url.searchParams.get('orphans') !== '0';
    state.query = url.searchParams.get('q') ?? '';
    refs.search.value = state.query;
    writeFilters();
    state.selectedId = '';
    state.directIds = new Set();
    state.routeIds = new Set();
    state.routeEdgeIds = new Set();
    computeBaseVisibility();
    updateQuery();
    const requestedId = url.searchParams.get('node') ?? url.searchParams.get('focus') ?? '';
    state.selectedId = state.baseVisibleIds.has(requestedId) ? requestedId : '';
    state.keyboardId = state.selectedId;
    updateDirectIds();
    updateRoute();
    for (const button of root.querySelectorAll('[data-map-layout]')) button.setAttribute('aria-pressed', String(button.dataset.mapLayout === state.layout));
    const layout = state.data.layouts.find((candidate) => candidate.id === state.layout);
    refs.layoutNote.querySelector('strong').textContent = layout.label;
    refs.layoutNote.querySelector('span').textContent = layout.description;
    if (fit) fitVisible();
    else render();
    if (!state.selectedId && detailsWasOpen) closeDetails({ restoreFocus: false });
    else if (state.selectedId && detailsWasOpen) {
      state.detailsOpen = true;
      renderDetails();
    }
    updateUrl();
    if (announce) setStatus('URL에 저장된 지도 상태를 불러왔습니다.');
  }

  async function initialize() {
    try {
      const response = await fetch(root.dataset.graphUrl, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      state.data = await response.json();
      if (!Array.isArray(state.data.nodes) || !Array.isArray(state.data.edges) || !Array.isArray(state.data.communities)) {
        throw new TypeError('Invalid graph payload');
      }
      state.nodeById = new Map(state.data.nodes.map((node) => [node.id, node]));
      state.edgeById = new Map(state.data.edges.map((edge) => [edge.id, edge]));
      state.communityById = new Map(state.data.communities.map((community) => [String(community.id), community]));
      buildRelationshipIndex();
      state.viewport = viewportSize();
      refs.svg.setAttribute('viewBox', `0 0 ${state.viewport.width} ${state.viewport.height}`);
      bindEvents();
      applyUrlState();
      fitVisible();
      refs.loading.hidden = true;
      root.classList.add('is-ready');
      setStatus(`연결 지도 준비 완료. 문서 ${state.data.nodes.length}개.`);
    } catch (error) {
      refs.loading.textContent = '연결 지도를 불러오지 못했습니다. 아래 텍스트 목록을 이용해 주세요.';
      root.classList.add('has-map-error');
      console.error(error);
    }
  }

  void initialize();
}
