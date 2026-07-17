import {
  CAMERA_LIMITS,
  DEFAULT_CAMERA,
  clamp,
  hitTestProjected,
  normalizeCamera,
  projectPoint,
  sortProjected,
} from './graph-3d-math.js';

(() => {
  const root = document.querySelector('[data-knowledge-graph]');
  if (!root) return;

  const canvas = root.querySelector('[data-graph-canvas]');
  const context = canvas?.getContext('2d');
  const stage = root.querySelector('[data-graph-stage]');
  const controls = root.querySelector('[data-graph-controls]');
  const search = root.querySelector('[data-graph-search]');
  const typeFilter = root.querySelector('[data-graph-type]');
  const verificationFilter = root.querySelector('[data-graph-verification]');
  const relationFilter = root.querySelector('[data-graph-relation]');
  const communityFilter = root.querySelector('[data-graph-community]');
  const inspector = root.querySelector('[data-graph-inspector]');
  const inspectorContent = root.querySelector('[data-graph-inspector-content]');
  const status = root.querySelector('[data-graph-status]');
  const staticMessage = root.querySelector('[data-graph-static-message]');
  if (!canvas || !context || !stage || !inspectorContent || !status) return;

  const initialInspectorMarkup = inspectorContent.innerHTML;
  const graphUrl = root.dataset.graphUrl;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const forcedColors = window.matchMedia('(forced-colors: active)');
  const collator = new Intl.Collator('ko', { numeric: true, sensitivity: 'base' });
  const normalize = (value) => String(value ?? '')
    .normalize('NFKC')
    .toLocaleLowerCase('ko')
    .replace(/\s+/g, ' ')
    .trim();

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

  const state = {
    data: null,
    selected: '',
    hovered: '',
    query: '',
    type: '',
    verification: '',
    relation: relationFilter?.value || 'related',
    community: '',
    camera: { ...DEFAULT_CAMERA },
    model: null,
    viewport: { width: 1, height: 1, dpr: 1 },
    projectedNodes: new Map(),
    nodeById: new Map(),
    inspectorId: '',
    palette: null,
    frame: 0,
  };

  function element(name, className = '', text = '') {
    const item = document.createElement(name);
    if (className) item.className = className;
    if (text) item.textContent = text;
    return item;
  }

  function cssValue(name, fallback) {
    return getComputedStyle(root).getPropertyValue(name).trim() || fallback;
  }

  function resolvePalette() {
    const ink = cssValue('--ink', '#171711');
    const paper = cssValue('--paper', '#e8e0c0');
    const paperLight = cssValue('--paper-light', '#f4edcf');
    const pink = cssValue('--pink', '#ff006e');
    const cyan = cssValue('--cyan', '#00ffcc');
    const blue = cssValue('--blue', '#2449ff');
    const yellow = cssValue('--yellow', '#f1e740');
    const communityColors = state.data.communities.map((community) => {
      const probe = document.createElement('span');
      probe.className = `graph-community-${community.colorIndex % 14}`;
      probe.hidden = true;
      root.append(probe);
      const color = getComputedStyle(probe).getPropertyValue('--graph-color').trim() || pink;
      probe.remove();
      return color;
    });
    const highContrast = forcedColors.matches;
    state.palette = {
      ink,
      paper,
      paperLight,
      pink: highContrast ? ink : pink,
      cyan: highContrast ? ink : cyan,
      blue: highContrast ? ink : blue,
      yellow: highContrast ? paperLight : yellow,
      communities: highContrast ? communityColors.map(() => ink) : communityColors,
    };
  }

  function relationMatches(edge) {
    if (state.relation === 'all') return true;
    return edge.kinds.includes(state.relation);
  }

  function nodeMatchesFilters(node) {
    return (!state.type || node.type === state.type)
      && (!state.verification || node.verification === state.verification)
      && (state.community === '' || String(node.community) === String(state.community));
  }

  function searchMatches(node) {
    if (!state.query) return false;
    const haystack = normalize([
      node.title,
      ...(node.aliases ?? []),
      ...(node.domains ?? []).map((domain) => domain.label),
    ].join(' '));
    return state.query.split(' ').filter(Boolean).every((term) => haystack.includes(term));
  }

  function compareOverviewEdges(left, right, nodeId = '') {
    const leftNeighbor = left.source === nodeId ? left.target : left.source;
    const rightNeighbor = right.source === nodeId ? right.target : right.source;
    const leftNeighborNode = state.nodeById.get(leftNeighbor);
    const rightNeighborNode = state.nodeById.get(rightNeighbor);
    return Number(right.kind === 'both') - Number(left.kind === 'both')
      || Number(right.reciprocal) - Number(left.reciprocal)
      || Number(right.crossCommunity) - Number(left.crossCommunity)
      || right.weight - left.weight
      || (rightNeighborNode?.degree ?? 0) - (leftNeighborNode?.degree ?? 0)
      || collator.compare(left.id, right.id);
  }

  function overviewBackbone(visibleNodes, visibleEdges) {
    const selectedIds = new Set();
    const incident = new Map([...visibleNodes].map((id) => [id, []]));
    for (const edge of visibleEdges) {
      incident.get(edge.source)?.push(edge);
      incident.get(edge.target)?.push(edge);
    }
    for (const [nodeId, edges] of incident) {
      const best = [...edges].sort((left, right) => compareOverviewEdges(left, right, nodeId))[0];
      if (best) selectedIds.add(best.id);
    }

    const crossByCommunityPair = new Map();
    for (const edge of visibleEdges.filter((item) => item.crossCommunity)) {
      const sourceCommunity = state.nodeById.get(edge.source)?.community;
      const targetCommunity = state.nodeById.get(edge.target)?.community;
      if (sourceCommunity === undefined || targetCommunity === undefined) continue;
      const key = sourceCommunity < targetCommunity
        ? `${sourceCommunity}:${targetCommunity}`
        : `${targetCommunity}:${sourceCommunity}`;
      const current = crossByCommunityPair.get(key);
      if (!current || compareOverviewEdges(edge, current) < 0) crossByCommunityPair.set(key, edge);
    }
    for (const edge of crossByCommunityPair.values()) selectedIds.add(edge.id);
    return visibleEdges.filter((edge) => selectedIds.has(edge.id));
  }

  function visibleModel() {
    const visibleNodes = new Set(state.data.nodes.filter(nodeMatchesFilters).map((node) => node.id));
    const visibleEdges = state.data.edges.filter((edge) => (
      visibleNodes.has(edge.source) && visibleNodes.has(edge.target) && relationMatches(edge)
    ));
    const adjacency = new Map([...visibleNodes].map((id) => [id, new Set()]));
    for (const edge of visibleEdges) {
      adjacency.get(edge.source).add(edge.target);
      adjacency.get(edge.target).add(edge.source);
    }
    const overviewEdges = overviewBackbone(visibleNodes, visibleEdges);
    return { visibleNodes, visibleEdges, overviewEdges, adjacency };
  }

  function scheduleDraw() {
    if (state.frame) return;
    state.frame = window.requestAnimationFrame(() => {
      state.frame = 0;
      drawScene();
    });
  }

  function updateGraph() {
    if (!state.data) return;
    const { visibleNodes, visibleEdges, overviewEdges, adjacency } = visibleModel();
    if (state.selected && !visibleNodes.has(state.selected)) {
      state.selected = '';
      restoreInspector();
    }
    if (state.hovered && !visibleNodes.has(state.hovered)) state.hovered = '';

    const direct = state.selected ? adjacency.get(state.selected) ?? new Set() : new Set();
    const second = new Set();
    for (const neighbor of direct) {
      for (const candidate of adjacency.get(neighbor) ?? []) {
        if (candidate !== state.selected && !direct.has(candidate)) second.add(candidate);
      }
    }
    const queryMatches = new Set(state.data.nodes
      .filter((node) => visibleNodes.has(node.id) && searchMatches(node))
      .map((node) => node.id));
    const overviewEdgeIds = new Set(overviewEdges.map((edge) => edge.id));

    const renderedEdges = state.selected
      ? visibleEdges.filter((edge) => (
        edge.source === state.selected
        || edge.target === state.selected
        || (overviewEdgeIds.has(edge.id) && (
          (direct.has(edge.source) && (direct.has(edge.target) || second.has(edge.target)))
          || (direct.has(edge.target) && (direct.has(edge.source) || second.has(edge.source)))
        ))
      ))
      : state.hovered
        ? visibleEdges.filter((edge) => (
          edge.source === state.hovered
          || edge.target === state.hovered
          || overviewEdgeIds.has(edge.id)
        ))
        : state.query
          ? visibleEdges.filter((edge) => (
            queryMatches.has(edge.source)
            || queryMatches.has(edge.target)
            || overviewEdgeIds.has(edge.id)
          ))
          : overviewEdges;

    state.model = {
      visibleNodes,
      visibleEdges,
      overviewEdges,
      overviewEdgeIds,
      renderedEdges,
      adjacency,
      direct,
      second,
      queryMatches,
    };
    const searchMessage = state.query ? `, 검색 일치 ${queryMatches.size}개` : '';
    status.textContent = `문서 ${visibleNodes.size}개, 전체 관계 ${visibleEdges.length}개 중 구조선 ${renderedEdges.length}개 표시${searchMessage}.`;
    if (state.selected) {
      const selectedNode = state.nodeById.get(state.selected);
      if (selectedNode && state.inspectorId !== selectedNode.id) renderInspector(selectedNode);
    }
    scheduleDraw();
  }

  function resizeCanvas() {
    const rectangle = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rectangle.width));
    const height = Math.max(1, Math.round(rectangle.height));
    const maximumDpr = width > 1200 ? 1.5 : 2;
    const dpr = Math.min(maximumDpr, Math.max(1, window.devicePixelRatio || 1));
    const pixelWidth = Math.round(width * dpr);
    const pixelHeight = Math.round(height * dpr);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    state.viewport = { width, height, dpr };
    scheduleDraw();
  }

  function projected(point) {
    return projectPoint(point, state.camera, state.viewport, state.data.dimensions);
  }

  function tracePolygon(points) {
    if (!points.length) return false;
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (const point of points.slice(1)) context.lineTo(point.x, point.y);
    context.closePath();
    return true;
  }

  function drawWorldLine(left, right) {
    const start = projected(left);
    const end = projected(right);
    if (!start || !end) return;
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
  }

  function drawFloor() {
    context.save();
    context.strokeStyle = state.palette.ink;
    context.globalAlpha = forcedColors.matches ? 0.34 : 0.09;
    context.lineWidth = 0.8;
    context.setLineDash([2, 7]);
    for (let x = 0; x <= state.data.dimensions.width; x += 200) {
      drawWorldLine({ x, y: 0, z: 0 }, { x, y: state.data.dimensions.height, z: 0 });
    }
    for (let y = 0; y <= state.data.dimensions.height; y += 160) {
      drawWorldLine({ x: 0, y, z: 0 }, { x: state.data.dimensions.width, y, z: 0 });
    }
    context.setLineDash([]);
    context.globalAlpha = forcedColors.matches ? 0.7 : 0.32;
    context.lineWidth = 1.3;
    const corners = [
      { x: 0, y: 0, z: 0 },
      { x: state.data.dimensions.width, y: 0, z: 0 },
      { x: state.data.dimensions.width, y: state.data.dimensions.height, z: 0 },
      { x: 0, y: state.data.dimensions.height, z: 0 },
    ].map(projected).filter(Boolean);
    if (corners.length === 4 && tracePolygon(corners)) context.stroke();
    context.restore();
  }

  function communityContour(community) {
    const points = [];
    for (let index = 0; index < 30; index += 1) {
      const angle = index / 30 * Math.PI * 2;
      const point = projected({
        x: community.x + Math.cos(angle) * community.radius * 1.16,
        y: community.y + Math.sin(angle) * community.radius * 0.82,
        z: 0,
      });
      if (point) points.push(point);
    }
    return points;
  }

  function drawCommunities() {
    const labelBoxes = [];
    const compact = state.viewport.width < 620;
    const visibleCommunities = state.data.communities.filter((community) => (
      state.data.nodes.some((node) => node.community === community.id && state.model.visibleNodes.has(node.id))
    ));
    const projectionById = new Map(visibleCommunities.map((community) => [community.id, projected(community)]));
    for (const community of sortProjected(visibleCommunities, projectionById)) {
      const center = projectionById.get(community.id);
      const points = communityContour(community);
      if (!center || points.length < 3) continue;
      const color = state.palette.communities[community.colorIndex % state.palette.communities.length];
      context.save();
      context.fillStyle = color;
      context.strokeStyle = color;
      context.globalAlpha = forcedColors.matches ? 0.08 : 0.035;
      tracePolygon(points);
      context.fill();
      context.globalAlpha = forcedColors.matches ? 0.68 : 0.3;
      context.lineWidth = 1;
      context.stroke();

      const minimumX = Math.min(...points.map((point) => point.x));
      const minimumY = Math.min(...points.map((point) => point.y));
      const labelX = clamp(14, state.viewport.width - 230, minimumX + 10);
      const labelY = clamp(30, state.viewport.height - 18, minimumY + 25);
      const atlasNumber = String(community.id + 1).padStart(2, '0');
      context.globalAlpha = 1;
      context.textAlign = 'left';
      context.textBaseline = 'alphabetic';
      context.font = compact
        ? '600 16px "Helvetica Neue", Arial, sans-serif'
        : '500 23px "Helvetica Neue", Arial, sans-serif';
      context.fillStyle = state.palette.blue;
      context.fillText(atlasNumber, labelX, labelY);
      const numberWidth = context.measureText(atlasNumber).width;
      if (compact) {
        labelBoxes.push({
          x: labelX - 3,
          y: labelY - 19,
          width: numberWidth + 6,
          height: 23,
        });
        context.restore();
        continue;
      }
      context.font = '500 11px "Helvetica Neue", Arial, sans-serif';
      context.fillStyle = state.palette.ink;
      const labelText = `${community.label} · ${community.size}`;
      context.fillText(labelText, labelX + numberWidth + 8, labelY - 2);
      const labelWidth = context.measureText(labelText).width;
      labelBoxes.push({
        x: labelX - 4,
        y: labelY - 25,
        width: numberWidth + labelWidth + 16,
        height: 31,
      });
      context.restore();
    }
    return labelBoxes;
  }

  function nodeOpacity(node) {
    if (!state.selected) {
      if (state.query && !state.model.queryMatches.has(node.id)) return 0.12;
      return 0.92;
    }
    if (node.id === state.selected) return 1;
    if (state.model.direct.has(node.id)) return 0.95;
    if (state.model.second.has(node.id)) return 0.55;
    return 0.08;
  }

  function drawStems(nodeProjections, groundProjections) {
    if (state.camera.flat) return;
    const nodes = state.data.nodes.filter((node) => state.model.visibleNodes.has(node.id) && node.z > 0);
    for (const node of sortProjected(nodes, nodeProjections)) {
      const top = nodeProjections.get(node.id);
      const ground = groundProjections.get(node.id);
      if (!top || !ground) continue;
      const color = state.palette.communities[node.community % state.palette.communities.length];
      const emphasis = node.id === state.selected || state.model.direct.has(node.id);
      context.save();
      context.strokeStyle = emphasis ? state.palette.ink : color;
      context.fillStyle = color;
      context.globalAlpha = emphasis ? 0.72 : Math.max(0.12, nodeOpacity(node) * 0.42);
      context.lineWidth = emphasis ? 1.8 : 1;
      context.setLineDash([3, 4]);
      context.beginPath();
      context.moveTo(ground.x, ground.y);
      context.lineTo(top.x, top.y);
      context.stroke();
      context.setLineDash([]);
      context.globalAlpha *= 0.48;
      context.beginPath();
      context.ellipse(ground.x, ground.y, Math.max(2, node.radius * ground.scale * 0.8), Math.max(1, node.radius * ground.scale * 0.28), 0, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }
  }

  function edgeGeometry(edge, nodeProjections) {
    const source = nodeProjections.get(edge.source);
    const target = nodeProjections.get(edge.target);
    const sourceNode = state.nodeById.get(edge.source);
    const targetNode = state.nodeById.get(edge.target);
    if (!source || !target || !sourceNode || !targetNode) return null;
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const unitX = dx / distance;
    const unitY = dy / distance;
    const sourceRadius = Math.max(3, sourceNode.radius * source.scale);
    const targetRadius = Math.max(3, targetNode.radius * target.scale);
    const start = { x: source.x + unitX * (sourceRadius + 2), y: source.y + unitY * (sourceRadius + 2) };
    const end = { x: target.x - unitX * (targetRadius + 5), y: target.y - unitY * (targetRadius + 5) };
    const bend = edge.reciprocal ? Math.min(18, Math.max(6, distance * 0.055)) : 0;
    const control = {
      x: (start.x + end.x) / 2 - unitY * bend,
      y: (start.y + end.y) / 2 + unitX * bend,
    };
    return { source, target, start, end, control };
  }

  function drawArrow(end, control, color) {
    const angle = Math.atan2(end.y - control.y, end.x - control.x);
    const size = 6.5;
    context.save();
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(end.x, end.y);
    context.lineTo(end.x - Math.cos(angle - 0.55) * size, end.y - Math.sin(angle - 0.55) * size);
    context.lineTo(end.x - Math.cos(angle + 0.55) * size, end.y - Math.sin(angle + 0.55) * size);
    context.closePath();
    context.fill();
    context.restore();
  }

  function drawEdges(nodeProjections) {
    const edgeRecords = state.model.renderedEdges.map((edge) => {
      const geometry = edgeGeometry(edge, nodeProjections);
      return geometry ? { edge, geometry, depth: (geometry.source.depth + geometry.target.depth) / 2 } : null;
    }).filter(Boolean).sort((left, right) => {
      const leftDirect = Number(state.selected && (left.edge.source === state.selected || left.edge.target === state.selected));
      const rightDirect = Number(state.selected && (right.edge.source === state.selected || right.edge.target === state.selected));
      return leftDirect - rightDirect || left.depth - right.depth || collator.compare(left.edge.id, right.edge.id);
    });

    for (const { edge, geometry } of edgeRecords) {
      const direct = Boolean(state.selected) && (edge.source === state.selected || edge.target === state.selected);
      const hoveredDirect = !state.selected && Boolean(state.hovered)
        && (edge.source === state.hovered || edge.target === state.hovered);
      const searchDirect = !state.selected && Boolean(state.query)
        && (state.model.queryMatches.has(edge.source) || state.model.queryMatches.has(edge.target));
      const emphasized = direct || hoveredDirect || searchDirect;
      const second = Boolean(state.selected) && !direct && (
        (state.model.direct.has(edge.source) && (
          state.model.direct.has(edge.target) || state.model.second.has(edge.target)
        ))
        || (state.model.direct.has(edge.target) && (
          state.model.direct.has(edge.source) || state.model.second.has(edge.source)
        ))
      );
      const distant = Boolean(state.selected) && !direct && !second;
      let color = edge.crossCommunity ? state.palette.blue : state.palette.ink;
      if (edge.kind === 'body') color = state.palette.blue;
      if (direct && edge.source === state.selected) color = state.palette.blue;
      else if (direct && edge.target === state.selected) color = state.palette.blue;
      let alpha = edge.kind === 'body' ? 0.12 : edge.kind === 'both' ? 0.1 : 0.07;
      if (edge.crossCommunity) alpha += 0.06;
      if (direct) alpha = 0.94;
      else if (hoveredDirect || searchDirect) alpha = 0.66;
      else if (second) alpha = 0.28;
      else if (distant) alpha = 0.014;

      context.save();
      context.strokeStyle = color;
      context.globalAlpha = forcedColors.matches ? Math.max(alpha, 0.25) : alpha;
      context.lineWidth = emphasized ? 1.8 : Math.min(1.25, 0.38 + edge.weight * 0.16);
      context.lineCap = 'round';
      context.setLineDash(edge.kind === 'body' ? [4, 5] : []);
      context.beginPath();
      context.moveTo(geometry.start.x, geometry.start.y);
      if (edge.reciprocal) context.quadraticCurveTo(geometry.control.x, geometry.control.y, geometry.end.x, geometry.end.y);
      else context.lineTo(geometry.end.x, geometry.end.y);
      context.stroke();
      context.restore();
      if (direct) drawArrow(geometry.end, geometry.control, color);
    }
  }

  function traceNodeShape(node, x, y, radius) {
    context.beginPath();
    if (node.type === 'source' || node.type === 'reference') {
      context.rect(x - radius, y - radius, radius * 2, radius * 2);
      return;
    }
    if (node.type === 'entity') {
      context.moveTo(x, y - radius * 1.22);
      context.lineTo(x + radius, y);
      context.lineTo(x, y + radius * 1.22);
      context.lineTo(x - radius, y);
      context.closePath();
      return;
    }
    if (node.type === 'analysis') {
      for (let index = 0; index < 6; index += 1) {
        const angle = -Math.PI / 2 + index * Math.PI / 3;
        const pointX = x + Math.cos(angle) * radius;
        const pointY = y + Math.sin(angle) * radius;
        if (index === 0) context.moveTo(pointX, pointY);
        else context.lineTo(pointX, pointY);
      }
      context.closePath();
      return;
    }
    context.arc(x, y, radius, 0, Math.PI * 2);
  }

  function verificationDash(node) {
    if (node.verification === 'partial') return [5, 3];
    if (node.verification === 'disputed') return [2, 2, 8, 2];
    if (node.verification === 'unverified') return [1, 4];
    return [];
  }

  function projectedRadius(node, point) {
    return clamp(4.8, 24, node.radius * Math.sqrt(Math.max(0.2, point.scale)) * 0.92);
  }

  function drawNodes(nodeProjections) {
    const visibleNodes = state.data.nodes.filter((node) => state.model.visibleNodes.has(node.id));
    for (const node of sortProjected(visibleNodes, nodeProjections)) {
      const point = nodeProjections.get(node.id);
      if (!point) continue;
      const color = state.palette.communities[node.community % state.palette.communities.length];
      const radius = projectedRadius(node, point);
      const opacity = nodeOpacity(node);

      context.save();
      context.globalAlpha = opacity;
      context.fillStyle = forcedColors.matches ? state.palette.paperLight : color;
      context.strokeStyle = state.palette.ink;
      context.lineWidth = 0.8 + Math.min(2.4, Math.log2(1 + node.evidenceCount) * 0.45);
      context.setLineDash(verificationDash(node));
      traceNodeShape(node, point.x, point.y, radius);
      context.fill();
      context.stroke();
      context.setLineDash([]);

      if (state.model.direct.has(node.id)) {
        context.globalAlpha = 0.48;
        context.strokeStyle = state.palette.blue;
        context.lineWidth = 1.2;
        traceNodeShape(node, point.x, point.y, radius + 3);
        context.stroke();
      }

      if (node.id === state.selected || node.id === state.hovered || state.model.queryMatches.has(node.id)) {
        context.globalAlpha = node.id === state.selected ? 1 : 0.82;
        context.strokeStyle = state.palette.blue;
        context.lineWidth = 2;
        traceNodeShape(node, point.x, point.y, radius + 5);
        context.stroke();
      }
      context.restore();
    }
  }

  function boxesOverlap(left, right, padding = 4) {
    return left.x < right.x + right.width + padding
      && left.x + left.width + padding > right.x
      && left.y < right.y + right.height + padding
      && left.y + left.height + padding > right.y;
  }

  function labelPriority(node) {
    if (node.id === state.selected) return 100000;
    if (node.id === state.hovered) return 90000;
    if (state.model.queryMatches.has(node.id)) return 80000;
    if (state.model.direct.has(node.id)) return 60000 + node.bridgeConnections * 100 + node.degree;
    return node.bridgeConnections * 100 + node.degree;
  }

  function drawLabels(nodeProjections, reservedBoxes = []) {
    const visibleNodes = state.data.nodes.filter((node) => state.model.visibleNodes.has(node.id));
    const budget = state.viewport.width < 620
      ? 3
      : clamp(6, 14, Math.floor(state.viewport.width * state.viewport.height / 70000));
    const mandatory = visibleNodes.filter((node) => (
      node.id === state.selected
      || node.id === state.hovered
      || state.model.queryMatches.has(node.id)
    ));
    const contextual = state.selected
      ? visibleNodes
        .filter((node) => state.model.direct.has(node.id))
        .sort((left, right) => labelPriority(right) - labelPriority(left) || collator.compare(left.title, right.title))
        .slice(0, state.viewport.width < 620 ? 4 : 8)
      : [...visibleNodes]
        .sort((left, right) => labelPriority(right) - labelPriority(left) || collator.compare(left.title, right.title))
        .slice(0, budget);
    const candidates = [...new Map([...mandatory, ...contextual].map((node) => [node.id, node])).values()]
      .sort((left, right) => labelPriority(right) - labelPriority(left) || collator.compare(left.title, right.title));
    const placed = [...reservedBoxes];

    context.save();
    context.font = '500 11px "Helvetica Neue", Arial, sans-serif';
    context.textAlign = 'left';
    context.textBaseline = 'middle';
    for (const node of candidates) {
      const point = nodeProjections.get(node.id);
      if (!point) continue;
      const radius = projectedRadius(node, point);
      const textWidth = Math.ceil(context.measureText(node.title).width);
      const width = textWidth + 12;
      const height = 20;
      const positions = [
        { x: point.x + radius + 8, y: point.y - height / 2 },
        { x: point.x - width / 2, y: point.y - radius - height - 7 },
        { x: point.x - radius - width - 8, y: point.y - height / 2 },
        { x: point.x - width / 2, y: point.y + radius + 7 },
        { x: point.x + radius + 6, y: point.y - radius - height - 3 },
        { x: point.x - radius - width - 6, y: point.y - radius - height - 3 },
      ];
      const mandatoryLabel = mandatory.some((item) => item.id === node.id);
      let box = positions.find((candidate) => (
        candidate.x >= 8
        && candidate.y >= 8
        && candidate.x + width <= state.viewport.width - 8
        && candidate.y + height <= state.viewport.height - 8
        && placed.every((other) => !boxesOverlap({ ...candidate, width, height }, other))
      ));
      if (!box && mandatoryLabel) {
        box = {
          x: clamp(8, state.viewport.width - width - 8, point.x + radius + 8),
          y: clamp(8, state.viewport.height - height - 8, point.y - height / 2),
        };
      }
      if (!box) continue;
      const placedBox = { ...box, width, height };
      placed.push(placedBox);

      context.globalAlpha = node.id === state.selected ? 1 : 0.94;
      context.fillStyle = state.palette.paperLight;
      context.fillRect(box.x, box.y, width, height);
      context.fillStyle = state.palette.blue;
      context.fillRect(box.x, box.y, 2, height);
      context.fillStyle = state.palette.ink;
      context.fillText(node.title, box.x + 7, box.y + height / 2 + 0.5);
    }
    context.restore();
  }

  function drawScene() {
    if (!state.data || !state.model || !state.palette) return;
    const { width, height, dpr } = state.viewport;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);
    drawFloor();
    const reservedLabelBoxes = drawCommunities();

    const nodeProjections = new Map();
    const groundProjections = new Map();
    for (const node of state.data.nodes) {
      if (!state.model.visibleNodes.has(node.id)) continue;
      const top = projected(node);
      const ground = projected({ ...node, z: 0 });
      if (top) nodeProjections.set(node.id, top);
      if (ground) groundProjections.set(node.id, ground);
    }
    state.projectedNodes = nodeProjections;
    drawStems(nodeProjections, groundProjections);
    drawEdges(nodeProjections);
    drawNodes(nodeProjections);
    drawLabels(nodeProjections, reservedLabelBoxes);
  }

  function metadataRow(term, description) {
    const wrapper = element('div');
    wrapper.append(element('dt', '', term), element('dd', '', description));
    return wrapper;
  }

  function relationDescription(record) {
    const direction = record.directions.size > 1
      ? '서로 가리킴'
      : record.directions.has('out') ? '이 문서에서 가리킴' : '이 문서를 가리킴';
    const kind = record.kinds.has('related') && record.kinds.has('body')
      ? '서술 본문 + 관련 읽기'
      : record.kinds.has('related') ? '관련 읽기' : '서술 본문 링크';
    return `${direction} · ${kind}`;
  }

  function visibleRelations(node) {
    const relations = new Map();
    for (const edge of state.model.visibleEdges) {
      if (edge.source !== node.id && edge.target !== node.id) continue;
      const neighborId = edge.source === node.id ? edge.target : edge.source;
      const record = relations.get(neighborId) ?? { directions: new Set(), kinds: new Set() };
      record.directions.add(edge.source === node.id ? 'out' : 'in');
      for (const kind of edge.kinds) record.kinds.add(kind);
      relations.set(neighborId, record);
    }
    return relations;
  }

  function renderInspector(node) {
    const community = state.data.communities.find((item) => item.id === node.community);
    const relations = visibleRelations(node);
    const outsideNeighborCount = [...relations.keys()].filter((neighborId) => {
      const neighbor = state.nodeById.get(neighborId);
      return neighbor && neighbor.community !== node.community;
    }).length;
    inspectorContent.replaceChildren();
    inspectorContent.append(element('p', 'eyebrow', typeLabels[node.type] ?? node.type));
    inspectorContent.append(element('h2', '', node.title));
    inspectorContent.append(element('p', 'graph-inspector-excerpt', node.excerpt));

    const metadata = element('dl', 'graph-node-metadata');
    metadata.append(
      metadataRow('연결 집단', community?.label ?? '분류 없음'),
      metadataRow('검증 상태', verificationLabels[node.verification] ?? node.verification),
      metadataRow('등록 근거', `${node.evidenceCount}건`),
      metadataRow('표시 이웃', `${relations.size}개`),
      metadataRow('집단 밖 이웃', `${outsideNeighborCount}개`),
      metadataRow('3D 높이', `${node.bridgeConnections}개를 로그 눈금으로 변환`),
    );
    inspectorContent.append(metadata);

    if (node.domains?.length) {
      const tags = element('ul', 'graph-domain-list');
      tags.setAttribute('aria-label', '분야 태그');
      for (const domain of node.domains) tags.append(element('li', '', domain.label));
      inspectorContent.append(tags);
    }

    const documentLink = element('a', 'button-link graph-document-link', '문서 읽기');
    documentLink.href = node.url;
    inspectorContent.append(documentLink);

    const ranked = [...relations.entries()]
      .map(([id, record]) => ({ node: state.nodeById.get(id), record }))
      .filter((item) => item.node)
      .sort((left, right) => (
        Number(right.record.kinds.has('related')) - Number(left.record.kinds.has('related'))
        || right.node.bridgeConnections - left.node.bridgeConnections
        || collator.compare(left.node.title, right.node.title)
      ));

    if (ranked.length) {
      inspectorContent.append(element('h3', '', `직접 연결 ${ranked.length}개`));
      const list = element('ul', 'graph-relation-list');
      for (const { node: neighbor, record } of ranked.slice(0, 12)) {
        const item = element('li');
        const link = element('a', '', neighbor.title);
        link.href = neighbor.url;
        item.append(link, element('span', '', relationDescription(record)));
        list.append(item);
      }
      inspectorContent.append(list);
      if (ranked.length > 12) inspectorContent.append(element('p', 'graph-relation-more', `나머지 ${ranked.length - 12}개 연결은 지도에서 확인할 수 있습니다.`));
    }
    state.inspectorId = node.id;
  }

  function restoreInspector() {
    inspectorContent.innerHTML = initialInspectorMarkup;
    state.inspectorId = '';
    root.classList.remove('has-selection');
  }

  function selectNode(id) {
    const node = state.nodeById.get(id);
    if (!node || !state.model.visibleNodes.has(id)) return;
    state.selected = id;
    root.classList.add('has-selection');
    updateGraph();
    const relations = visibleRelations(node);
    const outsideNeighbors = [...relations.keys()].filter((neighborId) => (
      state.nodeById.get(neighborId)?.community !== node.community
    ));
    status.textContent = `${node.title} 선택. 표시 이웃 ${relations.size}개, 집단 밖 이웃 ${outsideNeighbors.length}개.`;
  }

  function clearSelection() {
    if (!state.selected) return;
    state.selected = '';
    restoreInspector();
    updateGraph();
  }

  function updateFlatButton() {
    const button = root.querySelector('[data-graph-view="flat"]');
    button?.setAttribute('aria-pressed', String(Boolean(state.camera.flat)));
  }

  function setCamera(patch) {
    state.camera = normalizeCamera({ ...state.camera, ...patch });
    updateFlatButton();
    scheduleDraw();
  }

  function resetCamera() {
    state.camera = { ...DEFAULT_CAMERA };
    updateFlatButton();
    scheduleDraw();
  }

  function canvasPoint(event) {
    const rectangle = canvas.getBoundingClientRect();
    return { x: event.clientX - rectangle.left, y: event.clientY - rectangle.top };
  }

  function nodeAtEvent(event) {
    return hitTestProjected(state.data.nodes, state.projectedNodes, canvasPoint(event), {
      visibleIds: state.model.visibleNodes,
      minimumRadius: 18,
    });
  }

  function bindInteractions() {
    root.addEventListener('click', (event) => {
      const clearButton = event.target.closest('[data-graph-clear-selection]');
      if (clearButton) {
        clearSelection();
        search?.focus();
        return;
      }

      const selectButton = event.target.closest('[data-select-node]');
      if (selectButton) selectNode(selectButton.dataset.selectNode);

      const zoomButton = event.target.closest('[data-graph-zoom]');
      if (zoomButton?.dataset.graphZoom === 'in') setCamera({ zoom: state.camera.zoom * 1.25 });
      else if (zoomButton?.dataset.graphZoom === 'out') setCamera({ zoom: state.camera.zoom / 1.25 });

      const orbitButton = event.target.closest('[data-graph-orbit]');
      if (orbitButton) {
        const direction = orbitButton.dataset.graphOrbit;
        const patch = { flat: false };
        if (direction === 'left') patch.yaw = state.camera.yaw - 0.18;
        if (direction === 'right') patch.yaw = state.camera.yaw + 0.18;
        if (direction === 'higher') patch.pitch = state.camera.pitch - 0.12;
        if (direction === 'lower') patch.pitch = state.camera.pitch + 0.12;
        setCamera(patch);
      }

      const viewButton = event.target.closest('[data-graph-view]');
      if (viewButton?.dataset.graphView === 'flat') setCamera({ flat: !state.camera.flat });
      else if (viewButton?.dataset.graphView === 'reset') resetCamera();
    });

    search?.addEventListener('input', () => {
      state.query = normalize(search.value);
      updateGraph();
    });
    controls?.addEventListener('submit', (event) => {
      event.preventDefault();
      const matches = state.data.nodes
        .filter((node) => nodeMatchesFilters(node) && searchMatches(node))
        .sort((left, right) => collator.compare(left.title, right.title));
      if (matches[0]) selectNode(matches[0].id);
    });
    typeFilter?.addEventListener('change', () => { state.type = typeFilter.value; updateGraph(); });
    verificationFilter?.addEventListener('change', () => { state.verification = verificationFilter.value; updateGraph(); });
    relationFilter?.addEventListener('change', () => { state.relation = relationFilter.value; updateGraph(); });
    communityFilter?.addEventListener('change', () => { state.community = communityFilter.value; updateGraph(); });
    controls?.addEventListener('reset', () => window.requestAnimationFrame(() => {
      state.selected = '';
      state.hovered = '';
      state.query = '';
      state.type = '';
      state.verification = '';
      state.relation = relationFilter?.value || 'related';
      state.community = '';
      restoreInspector();
      resetCamera();
      updateGraph();
    }));

    canvas.addEventListener('wheel', (event) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      setCamera({ zoom: state.camera.zoom * (event.deltaY < 0 ? 1.12 : 1 / 1.12) });
    }, { passive: false });

    let drag = null;
    canvas.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      drag = {
        pointerId: event.pointerId,
        pointerType: event.pointerType,
        startX: event.clientX,
        startY: event.clientY,
        yaw: state.camera.yaw,
        pitch: state.camera.pitch,
        moved: false,
        orbiting: event.pointerType === 'mouse',
      };
      if (drag.orbiting) canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener('pointermove', (event) => {
      if (!drag) {
        const hovered = nodeAtEvent(event)?.id ?? '';
        if (hovered !== state.hovered) {
          state.hovered = hovered;
          canvas.classList.toggle('has-hover', Boolean(hovered));
          updateGraph();
        }
        return;
      }
      const deltaX = event.clientX - drag.startX;
      const deltaY = event.clientY - drag.startY;
      if (drag.pointerType !== 'mouse' && !drag.orbiting) {
        if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
          drag.orbiting = true;
          canvas.setPointerCapture(event.pointerId);
        } else {
          return;
        }
      }
      drag.moved ||= Math.hypot(deltaX, deltaY) > 4;
      const pitch = drag.pointerType === 'mouse'
        ? clamp(CAMERA_LIMITS.minimumPitch, CAMERA_LIMITS.maximumPitch, drag.pitch + deltaY * 0.004)
        : drag.pitch;
      setCamera({ yaw: drag.yaw + deltaX * 0.006, pitch, flat: false });
      canvas.classList.add('is-orbiting');
    });
    const stopDrag = (event) => {
      if (!drag) return;
      const shouldSelect = !drag.moved;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      drag = null;
      canvas.classList.remove('is-orbiting');
      if (shouldSelect) {
        const node = nodeAtEvent(event);
        if (node) selectNode(node.id);
        else clearSelection();
      }
    };
    canvas.addEventListener('pointerup', stopDrag);
    canvas.addEventListener('pointercancel', () => {
      drag = null;
      canvas.classList.remove('is-orbiting');
    });
    canvas.addEventListener('pointerleave', () => {
      if (drag) return;
      state.hovered = '';
      canvas.classList.remove('has-hover');
      updateGraph();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') clearSelection();
    });

    forcedColors.addEventListener('change', () => {
      resolvePalette();
      scheduleDraw();
    });
    reduceMotion.addEventListener('change', scheduleDraw);
    new ResizeObserver(resizeCanvas).observe(canvas);
  }

  function fail(error) {
    const message = '3D 연결 지도를 불러오지 못했습니다. 텍스트 목록으로 문서를 탐색할 수 있습니다.';
    if (staticMessage) {
      staticMessage.hidden = false;
      staticMessage.textContent = message;
    }
    status.textContent = message;
    stage.classList.add('has-graph-error');
    console.error(error);
  }

  fetch(graphUrl, { headers: { Accept: 'application/json' } })
    .then((response) => {
      if (!response.ok) throw new Error(`Graph data request failed: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      if (
        data?.schemaVersion !== 2
        || data?.layoutVersion !== 4
        || data?.depthMetric !== 'cross-community-neighbors'
        || data?.depthScale !== 'log1p'
        || !Number.isFinite(data?.dimensions?.depth)
        || !Array.isArray(data.nodes)
        || !Array.isArray(data.edges)
        || !Array.isArray(data.communities)
        || data.nodes.some((node) => !Number.isFinite(node.z))
      ) {
        throw new TypeError('Graph data has an unsupported 3D shape.');
      }
      state.data = data;
      state.nodeById = new Map(data.nodes.map((node) => [node.id, node]));
      resolvePalette();
      updateGraph();
      bindInteractions();
      resizeCanvas();
      root.classList.add('is-ready');
      if (staticMessage) staticMessage.hidden = true;
    })
    .catch(fail);
})();
