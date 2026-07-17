import {
  CAMERA_LIMITS,
  DEFAULT_CAMERA,
  cameraForWorldPoint,
  clamp,
  hitTestProjected,
  neighborhoodWithinDepth,
  normalizeCamera,
  projectPoint,
  shortestPath,
  sortProjected,
  zoomCameraAt,
} from './graph-3d-math.js';
import {
  buildMobileRelationGroups,
  limitMobileRelationGroups,
  MOBILE_GRAPH_MEDIA_QUERY,
  mobileConnectorPath,
  mobileDirectionLabel,
  mobileStartNodes,
} from './graph-mobile-model.js';

(() => {
  const root = document.querySelector('[data-knowledge-graph]');
  if (!root) return;

  let canvas = root.querySelector('[data-graph-canvas]');
  let context = null;
  let world = null;
  let rendererInitialization = null;
  const fullscreenRoot = root.querySelector('[data-graph-fullscreen-root]');
  const stage = root.querySelector('[data-graph-stage]');
  const gameHeader = root.querySelector('[data-graph-hud]');
  const controls = root.querySelector('[data-graph-controls]');
  const search = root.querySelector('[data-graph-search]');
  const typeFilter = root.querySelector('[data-graph-type]');
  const verificationFilter = root.querySelector('[data-graph-verification]');
  const relationFilter = root.querySelector('[data-graph-relation]');
  const communityFilter = root.querySelector('[data-graph-community]');
  const densityFilter = root.querySelector('[data-graph-density]');
  const localDepthFilter = root.querySelector('[data-graph-local-depth]');
  const labelDensityInput = root.querySelector('[data-graph-label-density]');
  const nodeScaleInput = root.querySelector('[data-graph-node-scale]');
  const edgeOpacityInput = root.querySelector('[data-graph-edge-opacity]');
  const edgeWidthInput = root.querySelector('[data-graph-edge-width]');
  const focusGravityInput = root.querySelector('[data-graph-focus-gravity]');
  const heightScaleInput = root.querySelector('[data-graph-height-scale]');
  const flightSpeedInput = root.querySelector('[data-graph-flight-speed]');
  const fovInput = root.querySelector('[data-graph-fov]');
  const arrowsInput = root.querySelector('[data-graph-show-arrows]');
  const gridInput = root.querySelector('[data-graph-show-grid]');
  const communitiesInput = root.querySelector('[data-graph-show-communities]');
  const orphansInput = root.querySelector('[data-graph-show-orphans]');
  const autoRotateInput = root.querySelector('[data-graph-auto-rotate]');
  const inspector = root.querySelector('[data-graph-inspector]');
  const inspectorContent = root.querySelector('[data-graph-inspector-content]');
  const status = root.querySelector('[data-graph-status]');
  const staticMessage = root.querySelector('[data-graph-static-message]');
  const minimap = root.querySelector('[data-graph-minimap]');
  const minimapContext = minimap?.getContext('2d');
  const hoverCard = root.querySelector('[data-graph-hover-card]');
  const settingsPanel = root.querySelector('[data-graph-settings]');
  const settingsToggle = root.querySelector('[data-graph-settings-toggle]');
  const settingsClose = root.querySelector('[data-graph-settings-close]');
  const helpDialog = root.querySelector('[data-graph-help]');
  const fullscreenButton = root.querySelector('[data-graph-fullscreen]');
  const cameraReadout = root.querySelector('[data-graph-camera-readout]');
  const visibleCount = root.querySelector('[data-graph-visible-count]');
  const historyLabel = root.querySelector('[data-graph-history-label]');
  const bookmarkButton = root.querySelector('[data-graph-bookmarks]');
  const travelTarget = root.querySelector('[data-graph-travel-target]');
  const routeHud = root.querySelector('[data-graph-route-hud]');
  const routeSummary = root.querySelector('[data-graph-route-summary]');
  const fpsLayer = root.querySelector('[data-graph-fps-layer]');
  const fpsTarget = root.querySelector('[data-graph-fps-target]');
  const pointerLockButton = root.querySelector('[data-graph-pointer-lock]');
  const rendererBadge = root.querySelector('[data-graph-renderer]');
  const mobileAtlas = root.querySelector('[data-graph-mobile-atlas]');
  const mobileScene = root.querySelector('[data-graph-mobile-scene]');
  const mobileContent = root.querySelector('[data-graph-mobile-content]');
  const mobileConnectors = root.querySelector('[data-graph-mobile-connectors]');
  const mobileSummary = root.querySelector('[data-graph-mobile-summary]');
  if (!canvas || !fullscreenRoot || !stage || !inspectorContent || !status) return;
  if (gameHeader) stage.prepend(gameHeader);

  const initialInspectorMarkup = inspectorContent.innerHTML;
  const graphUrl = root.dataset.graphUrl;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const forcedColors = window.matchMedia('(forced-colors: active)');
  const mobileMode = window.matchMedia(MOBILE_GRAPH_MEDIA_QUERY);
  root.classList.toggle('is-mobile-atlas', mobileMode.matches);
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
    density: densityFilter?.value || 'backbone',
    localDepth: 0,
    labelDensity: 2,
    nodeScale: 1.25,
    edgeOpacity: 0.48,
    edgeWidth: 0.72,
    focusGravity: 1,
    heightScale: 1,
    flightSpeed: 1,
    fov: 56,
    showArrows: true,
    showGrid: true,
    showCommunities: true,
    showOrphans: true,
    autoRotate: false,
    mode: 'orbit',
    firstPersonTarget: '',
    pointerLocked: false,
    webglCameraInfo: null,
    travelCandidate: '',
    travelIndex: -1,
    routeStart: '',
    routePath: [],
    routeNodeIds: new Set(),
    routeEdgeIds: new Set(),
    history: [],
    historyIndex: -1,
    bookmarks: new Set(),
    fittingPending: true,
    cameraAnimation: 0,
    autoRotateFrame: 0,
    fullscreenFallback: false,
    camera: { ...DEFAULT_CAMERA },
    model: null,
    viewport: { width: 1, height: 1, dpr: 1 },
    projectedNodes: new Map(),
    nodeById: new Map(),
    inspectorId: '',
    mobileRelationLimit: 8,
    mobileRenderedId: '',
    mobileFrame: 0,
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
    const world = cssValue('--graph-world', '#171711');
    const worldInk = cssValue('--graph-world-ink', '#f3ecd8');
    const worldMuted = cssValue('--graph-world-muted', '#b9b18f');
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
      world: highContrast ? paper : world,
      worldInk: highContrast ? ink : worldInk,
      worldMuted: highContrast ? ink : worldMuted,
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

  function overviewBackbone(visibleNodes, visibleEdges, perNode = 1) {
    const selectedIds = new Set();
    const incident = new Map([...visibleNodes].map((id) => [id, []]));
    for (const edge of visibleEdges) {
      incident.get(edge.source)?.push(edge);
      incident.get(edge.target)?.push(edge);
    }
    for (const [nodeId, edges] of incident) {
      const best = [...edges]
        .sort((left, right) => compareOverviewEdges(left, right, nodeId))
        .slice(0, Math.max(1, perNode));
      for (const edge of best) selectedIds.add(edge.id);
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
    const filteredNodes = new Set(state.data.nodes.filter(nodeMatchesFilters).map((node) => node.id));
    let visibleNodes = new Set(filteredNodes);
    let visibleEdges = state.data.edges.filter((edge) => (
      visibleNodes.has(edge.source) && visibleNodes.has(edge.target) && relationMatches(edge)
    ));

    if (!state.showOrphans) {
      const connected = new Set();
      for (const edge of visibleEdges) {
        connected.add(edge.source);
        connected.add(edge.target);
      }
      visibleNodes = new Set([...visibleNodes].filter((id) => connected.has(id)));
      visibleEdges = visibleEdges.filter((edge) => visibleNodes.has(edge.source) && visibleNodes.has(edge.target));
    }

    const baseVisibleNodes = new Set(visibleNodes);

    if (state.localDepth > 0 && state.selected && visibleNodes.has(state.selected)) {
      visibleNodes = neighborhoodWithinDepth(visibleEdges, state.selected, state.localDepth, visibleNodes);
      visibleEdges = visibleEdges.filter((edge) => visibleNodes.has(edge.source) && visibleNodes.has(edge.target));
    }

    const adjacency = new Map([...visibleNodes].map((id) => [id, new Set()]));
    for (const edge of visibleEdges) {
      adjacency.get(edge.source).add(edge.target);
      adjacency.get(edge.target).add(edge.source);
    }
    const overviewEdges = overviewBackbone(visibleNodes, visibleEdges);
    const balancedEdges = overviewBackbone(visibleNodes, visibleEdges, 2);
    return { filteredNodes, baseVisibleNodes, visibleNodes, visibleEdges, overviewEdges, balancedEdges, adjacency };
  }

  function scheduleDraw() {
    if (mobileMode.matches) return;
    if (state.frame) return;
    state.frame = window.requestAnimationFrame(() => {
      state.frame = 0;
      drawScene();
    });
  }

  function updateGraph() {
    if (!state.data) return;
    const {
      filteredNodes,
      baseVisibleNodes,
      visibleNodes,
      visibleEdges,
      overviewEdges,
      balancedEdges,
      adjacency,
    } = visibleModel();
    if (state.selected && !visibleNodes.has(state.selected)) {
      state.selected = '';
      restoreInspector();
    }
    if (state.hovered && !visibleNodes.has(state.hovered)) state.hovered = '';
    if (state.routeStart && (
      !visibleNodes.has(state.routeStart)
      || state.routePath.some((id) => !visibleNodes.has(id))
    )) resetRouteState();

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
    const baseEdges = state.density === 'all'
      ? visibleEdges
      : state.density === 'balanced' ? balancedEdges : overviewEdges;
    const baseEdgeIds = new Set(baseEdges.map((edge) => edge.id));

    let renderedEdges = state.selected
      ? visibleEdges.filter((edge) => (
        edge.source === state.selected
        || edge.target === state.selected
        || (baseEdgeIds.has(edge.id) && (
          (direct.has(edge.source) && (direct.has(edge.target) || second.has(edge.target)))
          || (direct.has(edge.target) && (direct.has(edge.source) || second.has(edge.source)))
        ))
      ))
      : state.hovered
        ? visibleEdges.filter((edge) => (
          edge.source === state.hovered
          || edge.target === state.hovered
          || baseEdgeIds.has(edge.id)
        ))
        : state.query
          ? visibleEdges.filter((edge) => (
            queryMatches.has(edge.source)
            || queryMatches.has(edge.target)
            || baseEdgeIds.has(edge.id)
          ))
          : baseEdges;

    if (state.routeEdgeIds.size) {
      const renderedById = new Map(renderedEdges.map((edge) => [edge.id, edge]));
      for (const edge of visibleEdges) {
        if (state.routeEdgeIds.has(edge.id)) renderedById.set(edge.id, edge);
      }
      renderedEdges = [...renderedById.values()];
    }

    state.model = {
      visibleNodes,
      filteredNodes,
      baseVisibleNodes,
      visibleEdges,
      overviewEdges,
      balancedEdges,
      overviewEdgeIds,
      baseEdgeIds,
      renderedEdges,
      adjacency,
      direct,
      second,
      queryMatches,
    };
    const searchMessage = state.query ? `, 검색 일치 ${queryMatches.size}개` : '';
    const densityLabel = state.density === 'all' ? '전체' : state.density === 'balanced' ? '균형' : '핵심';
    status.textContent = `문서 ${visibleNodes.size}개, 관계 ${visibleEdges.length}개 중 ${densityLabel} 연결 ${renderedEdges.length}개 표시${searchMessage}.`;
    if (visibleCount) visibleCount.textContent = String(visibleNodes.size);
    if (state.selected) {
      const selectedNode = state.nodeById.get(state.selected);
      if (selectedNode && state.inspectorId !== selectedNode.id) renderInspector(selectedNode);
    }
    renderMobileAtlas(state.nodeById.get(state.selected));
    updateHud();
    scheduleDraw();
  }

  function resizeCanvas() {
    const rectangle = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rectangle.width));
    const height = Math.max(1, Math.round(rectangle.height));
    const maximumDpr = width > 1200 ? 1.5 : 2;
    const dpr = Math.min(maximumDpr, Math.max(1, window.devicePixelRatio || 1));
    if (world) {
      world.resize(width, height, dpr);
    } else {
      const pixelWidth = Math.round(width * dpr);
      const pixelHeight = Math.round(height * dpr);
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
    }
    state.viewport = { width, height, dpr };
    if (!world && state.fittingPending && state.data && width > 100 && height > 100) {
      state.fittingPending = false;
      fitVisibleScene(false);
    }
    scheduleMobileConnectors();
    scheduleDraw();
  }

  function projected(point) {
    const dimensions = state.heightScale === 1
      ? state.data.dimensions
      : { ...state.data.dimensions, depth: state.data.dimensions.depth * state.heightScale };
    return projectPoint(
      point.z ? { ...point, z: point.z * state.heightScale } : point,
      state.camera,
      state.viewport,
      dimensions,
    );
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
    context.strokeStyle = state.palette.worldMuted;
    if (state.showGrid) {
      context.globalAlpha = forcedColors.matches ? 0.34 : 0.18;
      context.lineWidth = 0.8;
      context.setLineDash([2, 7]);
      for (let x = 0; x <= state.data.dimensions.width; x += 200) {
        drawWorldLine({ x, y: 0, z: 0 }, { x, y: state.data.dimensions.height, z: 0 });
      }
      for (let y = 0; y <= state.data.dimensions.height; y += 160) {
        drawWorldLine({ x: 0, y, z: 0 }, { x: state.data.dimensions.width, y, z: 0 });
      }
    }
    context.setLineDash([]);
    context.strokeStyle = state.palette.worldInk;
    context.globalAlpha = forcedColors.matches ? 0.7 : 0.42;
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
    if (!state.showCommunities) return labelBoxes;
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
      context.globalAlpha = forcedColors.matches ? 0.08 : 0.085;
      tracePolygon(points);
      context.fill();
      context.globalAlpha = forcedColors.matches ? 0.68 : 0.58;
      context.lineWidth = 1.25;
      context.setLineDash([8, 7]);
      context.stroke();
      context.setLineDash([]);

      const minimumX = Math.min(...points.map((point) => point.x));
      const minimumY = Math.min(...points.map((point) => point.y));
      const labelX = clamp(14, state.viewport.width - 230, minimumX + 10);
      const labelY = clamp(30, state.viewport.height - 18, minimumY + 25);
      const atlasNumber = String(community.id + 1).padStart(2, '0');
      context.globalAlpha = 1;
      context.textAlign = 'left';
      context.textBaseline = 'alphabetic';
      context.font = compact
        ? '700 16px "Courier New", "D2Coding", monospace'
        : '700 23px "Courier New", "D2Coding", monospace';
      context.fillStyle = state.palette.pink;
      context.globalAlpha = 0.34;
      context.fillText(atlasNumber, labelX + 2, labelY);
      context.fillStyle = state.palette.cyan;
      context.fillText(atlasNumber, labelX - 2, labelY);
      context.globalAlpha = 1;
      context.fillStyle = state.palette.worldInk;
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
      context.font = '700 11px "Courier New", "D2Coding", monospace';
      context.fillStyle = state.palette.worldInk;
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
    if (state.routeNodeIds.has(node.id) || node.id === state.travelCandidate) return 1;
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
      context.strokeStyle = emphasis ? state.palette.pink : color;
      context.fillStyle = color;
      context.globalAlpha = Math.min(1, (emphasis ? 0.72 : Math.max(0.12, nodeOpacity(node) * 0.42)) * state.edgeOpacity);
      context.lineWidth = (emphasis ? 1.8 : 1) * state.edgeWidth;
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
    const sourceRadius = projectedRadius(sourceNode, source);
    const targetRadius = projectedRadius(targetNode, target);
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

  function traceEdgePath(edge, geometry) {
    context.beginPath();
    context.moveTo(geometry.start.x, geometry.start.y);
    if (edge.reciprocal) context.quadraticCurveTo(geometry.control.x, geometry.control.y, geometry.end.x, geometry.end.y);
    else context.lineTo(geometry.end.x, geometry.end.y);
  }

  function drawEdges(nodeProjections) {
    const edgeRecords = state.model.renderedEdges.map((edge) => {
      const geometry = edgeGeometry(edge, nodeProjections);
      return geometry ? { edge, geometry, depth: (geometry.source.depth + geometry.target.depth) / 2 } : null;
    }).filter(Boolean).sort((left, right) => {
      const leftDirect = Number(state.selected && (left.edge.source === state.selected || left.edge.target === state.selected));
      const rightDirect = Number(state.selected && (right.edge.source === state.selected || right.edge.target === state.selected));
      const leftRoute = Number(state.routeEdgeIds.has(left.edge.id));
      const rightRoute = Number(state.routeEdgeIds.has(right.edge.id));
      return leftRoute - rightRoute || leftDirect - rightDirect || left.depth - right.depth || collator.compare(left.edge.id, right.edge.id);
    });

    for (const { edge, geometry } of edgeRecords) {
      const route = state.routeEdgeIds.has(edge.id);
      const direct = Boolean(state.selected) && (edge.source === state.selected || edge.target === state.selected);
      const hoveredDirect = !state.selected && Boolean(state.hovered)
        && (edge.source === state.hovered || edge.target === state.hovered);
      const searchDirect = !state.selected && Boolean(state.query)
        && (state.model.queryMatches.has(edge.source) || state.model.queryMatches.has(edge.target));
      const emphasized = direct || hoveredDirect || searchDirect || route;
      const second = Boolean(state.selected) && !direct && (
        (state.model.direct.has(edge.source) && (
          state.model.direct.has(edge.target) || state.model.second.has(edge.target)
        ))
        || (state.model.direct.has(edge.target) && (
          state.model.direct.has(edge.source) || state.model.second.has(edge.source)
        ))
      );
      const distant = Boolean(state.selected) && !direct && !second;
      let color = edge.crossCommunity ? state.palette.cyan : state.palette.worldInk;
      if (edge.kind === 'body') color = state.palette.blue;
      if (direct && edge.source === state.selected) color = state.palette.pink;
      else if (direct && edge.target === state.selected) color = state.palette.cyan;
      if (route) color = state.palette.pink;
      let alpha = edge.kind === 'body' ? 0.2 : edge.kind === 'both' ? 0.2 : 0.13;
      if (edge.crossCommunity) alpha += 0.09;
      if (direct) alpha = 0.96;
      else if (hoveredDirect || searchDirect) alpha = 0.66;
      else if (second) alpha = 0.28;
      else if (distant) alpha = 0.014;
      if (route) alpha = 1;
      alpha = clamp(0, 1, alpha * state.edgeOpacity);

      context.save();
      if (route && !forcedColors.matches) {
        context.strokeStyle = state.palette.cyan;
        context.globalAlpha = 0.52;
        context.lineWidth = 6 * state.edgeWidth;
        context.lineCap = 'square';
        traceEdgePath(edge, geometry);
        context.stroke();
      }
      context.strokeStyle = color;
      context.globalAlpha = forcedColors.matches ? Math.max(alpha, 0.25) : alpha;
      context.lineWidth = (route ? 3 : emphasized ? 1.9 : Math.min(1.35, 0.48 + edge.weight * 0.17)) * state.edgeWidth;
      context.lineCap = route ? 'square' : 'round';
      context.setLineDash(edge.kind === 'body' ? [4, 5] : []);
      traceEdgePath(edge, geometry);
      context.stroke();
      context.restore();
      if (state.showArrows && (emphasized || state.density === 'backbone')) {
        drawArrow(geometry.end, geometry.control, color);
        if (edge.reciprocal) drawArrow(geometry.start, geometry.control, color);
      }
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
    return clamp(4.2, 34, node.radius * Math.sqrt(Math.max(0.2, point.scale)) * 0.92 * state.nodeScale);
  }

  function traceScreenPolygon(points) {
    if (!points.length) return;
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (const point of points.slice(1)) context.lineTo(point.x, point.y);
    context.closePath();
  }

  function regularPolygonPoints(x, y, radius, sides, angle = -Math.PI / 2) {
    return Array.from({ length: sides }, (_, index) => {
      const current = angle + index * Math.PI * 2 / sides;
      return { x: x + Math.cos(current) * radius, y: y + Math.sin(current) * radius };
    });
  }

  function fillVolumeFace(points, color, tint = '', tintOpacity = 0) {
    context.save();
    traceScreenPolygon(points);
    context.fillStyle = color;
    context.fill();
    if (tint && tintOpacity > 0) {
      const opacity = context.globalAlpha;
      context.globalAlpha = opacity * tintOpacity;
      context.fillStyle = tint;
      context.fill();
    }
    context.restore();
  }

  function drawVolumetricNode(node, point, radius, color) {
    if (state.camera.flat || forcedColors.matches) {
      context.fillStyle = forcedColors.matches ? state.palette.paperLight : color;
      traceNodeShape(node, point.x, point.y, radius);
      context.fill();
      return;
    }

    context.save();
    const baseOpacity = context.globalAlpha;
    context.globalAlpha = baseOpacity * 0.36;
    context.fillStyle = state.palette.world;
    context.beginPath();
    context.ellipse(point.x + radius * 0.18, point.y + radius * 0.82, radius * 1.05, radius * 0.32, -0.08, 0, Math.PI * 2);
    context.fill();
    context.globalAlpha = baseOpacity;

    if (node.type === 'source' || node.type === 'reference') {
      const halfWidth = radius;
      const halfHeight = radius;
      const offset = { x: -radius * 0.42, y: -radius * 0.48 };
      const front = [
        { x: point.x - halfWidth, y: point.y - halfHeight },
        { x: point.x + halfWidth, y: point.y - halfHeight },
        { x: point.x + halfWidth, y: point.y + halfHeight },
        { x: point.x - halfWidth, y: point.y + halfHeight },
      ];
      const back = front.map((item) => ({ x: item.x + offset.x, y: item.y + offset.y }));
      fillVolumeFace([back[0], back[1], front[1], front[0]], color, state.palette.paperLight, 0.34);
      fillVolumeFace([back[0], front[0], front[3], back[3]], color, state.palette.world, 0.32);
      const gradient = context.createLinearGradient(point.x - radius, point.y - radius, point.x + radius, point.y + radius);
      gradient.addColorStop(0, state.palette.paperLight);
      gradient.addColorStop(0.22, color);
      gradient.addColorStop(1, color);
      context.fillStyle = gradient;
      traceScreenPolygon(front);
      context.fill();
    } else if (node.type === 'entity') {
      const top = { x: point.x, y: point.y - radius * 1.22 };
      const right = { x: point.x + radius, y: point.y };
      const bottom = { x: point.x, y: point.y + radius * 1.22 };
      const left = { x: point.x - radius, y: point.y };
      const center = { x: point.x - radius * 0.06, y: point.y - radius * 0.04 };
      fillVolumeFace([top, right, center], color, state.palette.paperLight, 0.5);
      fillVolumeFace([right, bottom, center], color, state.palette.world, 0.28);
      fillVolumeFace([bottom, left, center], color, state.palette.world, 0.48);
      fillVolumeFace([left, top, center], color, state.palette.paperLight, 0.18);
    } else if (node.type === 'analysis') {
      const front = regularPolygonPoints(point.x, point.y, radius, 6);
      const offset = { x: -radius * 0.3, y: -radius * 0.38 };
      const back = front.map((item) => ({ x: item.x + offset.x, y: item.y + offset.y }));
      for (let index = 0; index < 6; index += 1) {
        const next = (index + 1) % 6;
        if (index < 3) fillVolumeFace([back[index], back[next], front[next], front[index]], color, index === 0 ? state.palette.paperLight : state.palette.world, index === 0 ? 0.3 : 0.26);
      }
      const gradient = context.createLinearGradient(point.x - radius, point.y - radius, point.x + radius, point.y + radius);
      gradient.addColorStop(0, state.palette.paperLight);
      gradient.addColorStop(0.28, color);
      gradient.addColorStop(1, color);
      context.fillStyle = gradient;
      traceScreenPolygon(front);
      context.fill();
    } else {
      const gradient = context.createRadialGradient(
        point.x - radius * 0.36,
        point.y - radius * 0.42,
        Math.max(0.8, radius * 0.06),
        point.x,
        point.y,
        radius * 1.08,
      );
      gradient.addColorStop(0, state.palette.paperLight);
      gradient.addColorStop(0.18, color);
      gradient.addColorStop(0.72, color);
      gradient.addColorStop(1, state.palette.world);
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(point.x, point.y, radius, 0, Math.PI * 2);
      context.fill();
      context.globalAlpha = baseOpacity * 0.42;
      context.strokeStyle = state.palette.paperLight;
      context.lineWidth = Math.max(0.7, radius * 0.08);
      context.beginPath();
      context.arc(point.x - radius * 0.1, point.y - radius * 0.06, radius * 0.64, Math.PI * 1.08, Math.PI * 1.68);
      context.stroke();
    }
    context.restore();
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
      drawVolumetricNode(node, point, radius, color);
      context.strokeStyle = state.palette.worldInk;
      context.lineWidth = 0.8 + Math.min(2.4, Math.log2(1 + node.evidenceCount) * 0.45);
      context.setLineDash(verificationDash(node));
      traceNodeShape(node, point.x, point.y, radius);
      context.stroke();
      context.setLineDash([]);

      if (state.model.direct.has(node.id)) {
        context.globalAlpha = 0.48;
        context.strokeStyle = state.palette.cyan;
        context.lineWidth = 1.2;
        traceNodeShape(node, point.x, point.y, radius + 3);
        context.stroke();
      }

      if (state.routeNodeIds.has(node.id)) {
        context.globalAlpha = 0.9;
        context.strokeStyle = state.palette.pink;
        context.lineWidth = 2.4;
        traceNodeShape(node, point.x, point.y, radius + 5);
        context.stroke();
      }

      if (state.bookmarks.has(node.id)) {
        context.globalAlpha = 0.95;
        context.strokeStyle = state.palette.yellow;
        context.lineWidth = 2;
        context.setLineDash([3, 3]);
        traceNodeShape(node, point.x, point.y, radius + 8);
        context.stroke();
        context.setLineDash([]);
      }

      if (node.id === state.selected || node.id === state.hovered || state.model.queryMatches.has(node.id) || node.id === state.travelCandidate) {
        context.globalAlpha = node.id === state.selected ? 1 : 0.82;
        context.strokeStyle = node.id === state.travelCandidate ? state.palette.yellow : state.palette.cyan;
        context.lineWidth = node.id === state.selected ? 3 : 2;
        traceNodeShape(node, point.x, point.y, radius + 5);
        context.stroke();
        if (node.id === state.selected && !forcedColors.matches) {
          context.globalAlpha = 0.7;
          context.strokeStyle = state.palette.pink;
          context.lineWidth = 1.8;
          traceNodeShape(node, point.x + 3, point.y, radius + 8);
          context.stroke();
        }
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
    if (node.id === state.travelCandidate) return 95000;
    if (node.id === state.hovered) return 90000;
    if (state.routeNodeIds.has(node.id)) return 85000;
    if (state.model.queryMatches.has(node.id)) return 80000;
    if (state.model.direct.has(node.id)) return 60000 + node.bridgeConnections * 100 + node.degree;
    return node.bridgeConnections * 100 + node.degree;
  }

  function drawLabels(nodeProjections, reservedBoxes = []) {
    const visibleNodes = state.data.nodes.filter((node) => state.model.visibleNodes.has(node.id));
    const baseBudget = state.viewport.width < 620
      ? [0, 2, 4, 8][state.labelDensity]
      : [0, 5, 14, 28][state.labelDensity];
    const budget = Math.max(0, baseBudget ?? 14);
    const mandatory = visibleNodes.filter((node) => (
      node.id === state.selected
      || node.id === state.travelCandidate
      || node.id === state.hovered
      || state.routeNodeIds.has(node.id)
      || state.model.queryMatches.has(node.id)
    ));
    const contextual = budget === 0
      ? []
      : state.selected
      ? visibleNodes
        .filter((node) => state.model.direct.has(node.id))
        .sort((left, right) => labelPriority(right) - labelPriority(left) || collator.compare(left.title, right.title))
        .slice(0, Math.min(budget, state.viewport.width < 620 ? 4 : 10))
      : [...visibleNodes]
        .sort((left, right) => labelPriority(right) - labelPriority(left) || collator.compare(left.title, right.title))
        .slice(0, budget);
    const candidates = [...new Map([...mandatory, ...contextual].map((node) => [node.id, node])).values()]
      .sort((left, right) => labelPriority(right) - labelPriority(left) || collator.compare(left.title, right.title));
    const placed = [...reservedBoxes];

    context.save();
    context.font = '700 11px "Courier New", "D2Coding", monospace';
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
      context.fillStyle = state.palette.world;
      context.fillRect(box.x, box.y, width, height);
      context.fillStyle = node.id === state.travelCandidate ? state.palette.yellow : state.palette.pink;
      context.fillRect(box.x, box.y, 2, height);
      context.fillStyle = state.palette.worldInk;
      context.fillText(node.title, box.x + 7, box.y + height / 2 + 0.5);
    }
    context.restore();
  }

  function drawMinimap() {
    if (!minimap || !minimapContext || !state.data || !state.model) return;
    const rectangle = minimap.getBoundingClientRect();
    const width = Math.max(1, Math.round(rectangle.width));
    const height = Math.max(1, Math.round(rectangle.height));
    const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    if (minimap.width !== Math.round(width * dpr) || minimap.height !== Math.round(height * dpr)) {
      minimap.width = Math.round(width * dpr);
      minimap.height = Math.round(height * dpr);
    }
    minimapContext.setTransform(dpr, 0, 0, dpr, 0, 0);
    minimapContext.clearRect(0, 0, width, height);
    minimapContext.fillStyle = state.palette.paperLight;
    minimapContext.fillRect(0, 0, width, height);
    const padding = 9;
    const scaleX = (width - padding * 2) / state.data.dimensions.width;
    const scaleY = (height - padding * 2) / state.data.dimensions.height;
    const pointFor = (item) => ({ x: padding + item.x * scaleX, y: padding + item.y * scaleY });

    for (const community of state.data.communities) {
      const hasVisibleNode = state.data.nodes.some((node) => node.community === community.id && state.model.visibleNodes.has(node.id));
      if (!hasVisibleNode) continue;
      const point = pointFor(community);
      const color = state.palette.communities[community.colorIndex % state.palette.communities.length];
      minimapContext.strokeStyle = color;
      minimapContext.globalAlpha = 0.4;
      minimapContext.lineWidth = 1;
      minimapContext.beginPath();
      minimapContext.ellipse(point.x, point.y, community.radius * scaleX * 1.1, community.radius * scaleY * 0.82, 0, 0, Math.PI * 2);
      minimapContext.stroke();
    }

    const drawPath = (ids, color, widthValue, alpha) => {
      const points = ids.map((id) => state.nodeById.get(id)).filter(Boolean).map(pointFor);
      if (points.length < 2) return;
      minimapContext.strokeStyle = color;
      minimapContext.globalAlpha = alpha;
      minimapContext.lineWidth = widthValue;
      minimapContext.beginPath();
      minimapContext.moveTo(points[0].x, points[0].y);
      for (const point of points.slice(1)) minimapContext.lineTo(point.x, point.y);
      minimapContext.stroke();
    };
    drawPath(state.routePath, state.palette.pink, 3.5, 0.9);

    for (const [index, id] of state.history.entries()) {
      const visited = state.nodeById.get(id);
      if (!visited || !state.model.visibleNodes.has(id)) continue;
      const point = pointFor(visited);
      const recent = index === state.historyIndex;
      minimapContext.fillStyle = state.palette.cyan;
      minimapContext.globalAlpha = recent ? 1 : 0.38;
      minimapContext.fillRect(point.x - (recent ? 2.5 : 1.5), point.y - (recent ? 2.5 : 1.5), recent ? 5 : 3, recent ? 5 : 3);
    }

    for (const node of state.data.nodes) {
      if (!state.model.visibleNodes.has(node.id)) continue;
      const point = pointFor(node);
      minimapContext.fillStyle = state.palette.communities[node.community % state.palette.communities.length];
      minimapContext.globalAlpha = node.id === state.selected ? 1 : 0.72;
      minimapContext.beginPath();
      minimapContext.arc(point.x, point.y, node.id === state.selected ? 3.6 : 1.7, 0, Math.PI * 2);
      minimapContext.fill();
      if (state.bookmarks.has(node.id)) {
        minimapContext.strokeStyle = state.palette.ink;
        minimapContext.globalAlpha = 1;
        minimapContext.lineWidth = 1.2;
        minimapContext.strokeRect(point.x - 4, point.y - 4, 8, 8);
      }
    }
    minimapContext.globalAlpha = 1;
  }

  function drawScene() {
    if (!state.data || !state.model || !state.palette) return;
    if (world) {
      world.update({
        model: state.model,
        selected: state.selected,
        hovered: state.hovered,
        travelCandidate: state.travelCandidate,
        routeNodeIds: state.routeNodeIds,
        routeEdgeIds: state.routeEdgeIds,
        bookmarks: state.bookmarks,
        labelDensity: state.labelDensity,
        nodeScale: state.nodeScale,
        edgeOpacity: state.edgeOpacity,
        edgeWidth: state.edgeWidth,
        focusGravity: state.focusGravity,
        heightScale: state.heightScale,
        showGrid: state.showGrid,
        showCommunities: state.showCommunities,
        showArrows: state.showArrows,
        autoRotate: state.autoRotate,
        mode: state.mode,
      });
      world.render();
      drawMinimap();
      return;
    }
    if (!context) return;
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
    drawMinimap();
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

  function mobileCommunityLabel(node) {
    return state.data.communities.find((item) => item.id === node.community)?.label ?? '분류 없음';
  }

  function mobileKindsLabel(kinds) {
    const values = new Set(kinds ?? []);
    if (values.has('related') && values.has('body')) return '본문 + 관련 읽기';
    return values.has('related') ? '관련 읽기' : '본문 링크';
  }

  function mobileRelationCard(item, index) {
    const button = element('button', `graph-mobile-relation-card is-${item.direction}`);
    button.type = 'button';
    button.dataset.selectNode = item.node.id;
    button.dataset.mobileRelationCard = '';
    button.dataset.mobileDirection = item.direction;
    button.dataset.mobileCardIndex = String(index);
    button.style.setProperty('--mobile-card-index', String(index));
    button.setAttribute('aria-label', `${item.node.title}, ${mobileDirectionLabel(item.direction)}`);

    const header = element('span', 'graph-mobile-card-header');
    header.append(
      element('span', 'graph-mobile-card-type', typeLabels[item.node.type] ?? item.node.type),
      element('span', 'graph-mobile-card-direction', mobileDirectionLabel(item.direction)),
    );
    button.append(
      header,
      element('strong', 'graph-mobile-card-title', item.node.title),
      element('span', 'graph-mobile-card-footer', `${mobileKindsLabel(item.kinds)} · 근거 ${item.node.evidenceCount}건`),
    );
    return button;
  }

  function mobileRelationGroup(group, startIndex) {
    const section = element('section', `graph-mobile-relation-group is-${group.direction}`);
    section.dataset.mobileDirectionGroup = group.direction;
    const heading = element('h3');
    heading.append(
      element('span', 'graph-mobile-direction-mark'),
      document.createTextNode(`${group.label} `),
      element('small', '', `${group.items.length}개 중 ${group.visibleItems.length}개`),
    );
    const grid = element('div', 'graph-mobile-relation-grid');
    group.visibleItems.forEach((item, index) => grid.append(mobileRelationCard(item, startIndex + index)));
    section.append(heading, grid);
    return section;
  }

  function mobileFocusCard(node, relationCount) {
    const article = element('article', 'graph-mobile-focus-card');
    article.dataset.mobileFocusCard = '';
    article.tabIndex = -1;
    article.setAttribute('aria-current', 'true');

    const label = element('p', 'graph-mobile-focus-label', '지금 선택한 문서');
    const title = element('h2', '', node.title);
    const metadata = element('ul', 'graph-mobile-focus-metadata');
    for (const text of [
      typeLabels[node.type] ?? node.type,
      mobileCommunityLabel(node),
      verificationLabels[node.verification] ?? node.verification,
      `직접 연결 ${relationCount}개`,
    ]) metadata.append(element('li', '', text));

    const primaryActions = element('div', 'graph-mobile-focus-primary');
    const documentLink = element('a', 'button-link graph-mobile-document-link', '문서 읽기');
    documentLink.href = node.url;
    const clearButton = element('button', 'graph-mobile-clear', '선택 해제');
    clearButton.type = 'button';
    clearButton.dataset.graphClearSelection = '';
    primaryActions.append(documentLink, clearButton);

    const details = element('details', 'graph-mobile-focus-details');
    details.append(element('summary', '', '설명과 탐색 도구'));
    details.append(element('p', 'graph-mobile-focus-excerpt', node.excerpt));
    if (node.domains?.length) {
      const domains = element('ul', 'graph-mobile-focus-domains');
      domains.setAttribute('aria-label', '분야 태그');
      for (const domain of node.domains) domains.append(element('li', '', domain.label));
      details.append(domains);
    }
    const secondaryActions = element('div', 'graph-mobile-focus-secondary');
    const bookmark = element('button', '', state.bookmarks.has(node.id) ? '표식 지우기' : '표식 남기기');
    bookmark.type = 'button';
    bookmark.dataset.graphBookmark = node.id;
    secondaryActions.append(bookmark);
    details.append(secondaryActions);

    article.append(label, title, metadata, primaryActions, details);
    return article;
  }

  function renderMobileStart() {
    const candidateIds = state.query ? state.model.queryMatches : state.model.visibleNodes;
    const candidates = mobileStartNodes(state.data.nodes, candidateIds, 6, { collator });
    mobileContent.replaceChildren();
    const section = element('section', 'graph-mobile-start');
    section.append(element('p', 'graph-mobile-start-kicker', state.query ? '검색 일치 문서' : '연결이 많은 시작 문서'));
    const heading = element('h2', '', state.query ? `${candidates.length}개 후보` : '어디서 시작할까요?');
    section.append(heading);

    if (!candidates.length) {
      section.append(element('p', 'graph-mobile-empty', '현재 검색과 필터에 맞는 문서가 없습니다. 조건을 줄여 보세요.'));
    } else {
      const grid = element('div', 'graph-mobile-start-grid');
      candidates.forEach((node, index) => {
        const button = element('button', 'graph-mobile-start-card');
        button.type = 'button';
        button.dataset.selectNode = node.id;
        button.style.setProperty('--mobile-card-index', String(index));
        button.append(
          element('span', 'graph-mobile-start-number', String(index + 1).padStart(2, '0')),
          element('strong', '', node.title),
          element('span', '', `${typeLabels[node.type] ?? node.type} · 연결 ${node.degree}개`),
        );
        grid.append(button);
      });
      section.append(grid);
    }
    mobileContent.append(section);
    state.mobileRenderedId = '';
    mobileSummary.textContent = state.query
      ? `검색과 필터에 맞는 문서 ${candidateIds.size}개 중 시작 후보 ${candidates.length}개입니다.`
      : `현재 필터의 문서 ${candidateIds.size}개 중 연결이 많은 시작 후보 ${candidates.length}개입니다.`;
    mobileConnectors.replaceChildren();
  }

  function svgElement(name, attributes = {}) {
    const item = document.createElementNS('http://www.w3.org/2000/svg', name);
    for (const [key, value] of Object.entries(attributes)) item.setAttribute(key, String(value));
    return item;
  }

  function connectorMarker(id, className) {
    const marker = svgElement('marker', {
      id,
      viewBox: '0 0 8 8',
      refX: 7,
      refY: 4,
      markerWidth: 7,
      markerHeight: 7,
      orient: 'auto-start-reverse',
    });
    marker.classList.add(className);
    marker.append(svgElement('path', { d: 'M 0 0 L 8 4 L 0 8 Z' }));
    return marker;
  }

  function drawMobileConnectors() {
    if (!mobileMode.matches || !mobileScene || !mobileConnectors || !state.selected) return;
    const focus = mobileScene.querySelector('[data-mobile-focus-card]');
    const cards = [...mobileScene.querySelectorAll('[data-mobile-relation-card]')];
    if (!focus || !cards.length) {
      mobileConnectors.replaceChildren();
      return;
    }

    const sceneRectangle = mobileScene.getBoundingClientRect();
    const relativeRectangle = (item) => {
      const rectangle = item.getBoundingClientRect();
      return {
        x: rectangle.left - sceneRectangle.left,
        y: rectangle.top - sceneRectangle.top,
        width: rectangle.width,
        height: rectangle.height,
      };
    };
    const width = Math.max(1, Math.round(mobileScene.clientWidth));
    const height = Math.max(1, Math.round(mobileScene.scrollHeight));
    const focusRectangle = relativeRectangle(focus);
    const cardRectangles = cards.map((card) => ({
      card,
      rectangle: relativeRectangle(card),
    }));
    mobileConnectors.replaceChildren();
    mobileConnectors.setAttribute('viewBox', `0 0 ${width} ${height}`);
    mobileConnectors.setAttribute('width', String(width));
    mobileConnectors.setAttribute('height', String(height));

    const definitions = svgElement('defs');
    definitions.append(
      connectorMarker('graph-mobile-arrow-out', 'is-out'),
      connectorMarker('graph-mobile-arrow-in', 'is-in'),
    );
    mobileConnectors.append(definitions);
    const appendPath = (source, target, direction, offset = 0) => {
      const path = svgElement('path', {
        d: mobileConnectorPath(source, target, offset),
        pathLength: 1,
        'marker-end': `url(#graph-mobile-arrow-${direction})`,
      });
      path.classList.add('graph-mobile-connector', `is-${direction}`);
      mobileConnectors.append(path);
    };

    for (const { card, rectangle } of cardRectangles) {
      const direction = card.dataset.mobileDirection;
      if (direction === 'in') appendPath(rectangle, focusRectangle, 'in');
      else if (direction === 'out') appendPath(focusRectangle, rectangle, 'out');
      else {
        appendPath(rectangle, focusRectangle, 'in', -3);
        appendPath(focusRectangle, rectangle, 'out', 3);
      }
    }
  }

  function scheduleMobileConnectors() {
    if (!mobileMode.matches || !mobileConnectors) return;
    if (state.mobileFrame) window.cancelAnimationFrame(state.mobileFrame);
    state.mobileFrame = window.requestAnimationFrame(() => {
      state.mobileFrame = 0;
      drawMobileConnectors();
    });
  }

  function renderMobileAtlas(node = state.nodeById.get(state.selected)) {
    if (!mobileAtlas || !mobileContent || !mobileConnectors || !mobileSummary) return;
    root.classList.toggle('is-mobile-atlas', mobileMode.matches);
    if (!mobileMode.matches) return;
    if (!node) {
      renderMobileStart();
      return;
    }

    const preserveDetails = state.mobileRenderedId === node.id
      && Boolean(mobileContent.querySelector('.graph-mobile-focus-details[open]'));
    const refocusBookmark = state.mobileRenderedId === node.id
      && document.activeElement?.matches?.('[data-graph-bookmark]');
    const groups = buildMobileRelationGroups(node.id, state.model.visibleEdges, state.nodeById, { collator });
    const limited = limitMobileRelationGroups(groups, state.mobileRelationLimit);
    mobileContent.replaceChildren();
    const stack = element('div', 'graph-mobile-stack');
    let cardIndex = 0;
    const appendDirection = (direction) => {
      const group = limited.groups.find((item) => item.direction === direction);
      if (!group) return;
      stack.append(mobileRelationGroup(group, cardIndex));
      cardIndex += group.visibleItems.length;
    };

    appendDirection('in');
    stack.append(mobileFocusCard(node, limited.total));
    appendDirection('both');
    appendDirection('out');
    if (!limited.total) stack.append(element('p', 'graph-mobile-empty', '현재 필터에서 이 문서와 직접 연결된 문서가 없습니다.'));

    if (limited.total > 8) {
      const limitButton = element(
        'button',
        'graph-mobile-limit',
        limited.shown < limited.total ? `연결 모두 보기 · ${limited.total}개` : '핵심 연결 8개만 보기',
      );
      limitButton.type = 'button';
      limitButton.dataset.mobileRelationLimit = limited.shown < limited.total ? 'all' : 'compact';
      stack.append(limitButton);
    }
    mobileContent.append(stack);
    state.mobileRenderedId = node.id;
    if (preserveDetails) mobileContent.querySelector('.graph-mobile-focus-details')?.setAttribute('open', '');
    if (refocusBookmark) {
      window.requestAnimationFrame(() => mobileContent.querySelector('[data-graph-bookmark]')?.focus({ preventScroll: true }));
    }

    const counts = Object.fromEntries(groups.map((group) => [group.direction, group.items.length]));
    mobileSummary.textContent = `${node.title} · 들어옴 ${counts.in ?? 0} · 서로 ${counts.both ?? 0} · 나감 ${counts.out ?? 0} · ${limited.shown}/${limited.total}개 표시`;
    scheduleMobileConnectors();
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

    const actions = element('div', 'graph-inspector-actions');
    const focusButton = element('button', '', '이 문서로 이동');
    focusButton.type = 'button';
    focusButton.dataset.graphFocusNode = node.id;
    const bookmark = element('button', '', state.bookmarks.has(node.id) ? '표식 지우기' : '표식 남기기');
    bookmark.type = 'button';
    bookmark.dataset.graphBookmark = node.id;
    const route = element('button', '', state.routeStart === node.id
      ? '경로 출발점 해제'
      : state.routeStart ? '여기까지 경로 찾기' : '경로 출발점');
    route.type = 'button';
    route.dataset.graphRouteNode = node.id;
    actions.append(focusButton, bookmark, route);
    inspectorContent.append(actions);

    if (state.routePath.length > 1) {
      inspectorContent.append(element('h3', '', `현재 경로 ${state.routePath.length - 1}단계`));
      const pathList = element('ol', 'graph-route-list');
      for (const id of state.routePath) {
        const pathNode = state.nodeById.get(id);
        if (!pathNode) continue;
        const item = element('li');
        const button = element('button', '', pathNode.title);
        button.type = 'button';
        button.dataset.selectNode = pathNode.id;
        item.append(button);
        pathList.append(item);
      }
      inspectorContent.append(pathList);
    }

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

  const BOOKMARK_STORAGE_KEY = 'llm-wiki:knowledge-world:bookmarks:v1';

  function loadBookmarks() {
    try {
      const stored = JSON.parse(window.localStorage.getItem(BOOKMARK_STORAGE_KEY) || '[]');
      state.bookmarks = new Set(Array.isArray(stored)
        ? stored.filter((id) => state.nodeById.has(id))
        : []);
    } catch {
      state.bookmarks = new Set();
    }
  }

  function saveBookmarks() {
    try {
      window.localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify([...state.bookmarks]));
    } catch {
      // Browsing remains fully usable when local storage is unavailable.
    }
  }

  function recordHistory(id) {
    if (!id || state.history[state.historyIndex] === id) return;
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push(id);
    if (state.history.length > 50) state.history.shift();
    state.historyIndex = state.history.length - 1;
  }

  function updateHud() {
    const selectedNode = state.nodeById.get(state.selected);
    const candidateNode = state.nodeById.get(state.travelCandidate);
    if (cameraReadout) {
      if (world) {
        const info = world.getCameraInfo?.() ?? state.webglCameraInfo ?? {};
        const mode = state.mode === 'first-person' ? '1인칭 비행' : state.mode === 'travel' ? '연결 여행' : '궤도 탐색';
        const positionValues = Array.isArray(info.position)
          ? info.position
          : info.position && typeof info.position === 'object'
            ? [info.position.x, info.position.y, info.position.z]
            : [];
        const position = positionValues.length === 3
          ? ` · 위치 ${positionValues.map((value) => Math.round(value)).join(' / ')}`
          : '';
        cameraReadout.textContent = `${mode} · 시야 ${Math.round(info.fov ?? state.fov)}°${position}`;
      } else {
        const mode = state.camera.flat ? '2D' : state.mode === 'travel' ? '연결 여행' : '궤도';
        cameraReadout.textContent = `${mode} · 확대 ${Math.round(state.camera.zoom * 100)}% · 높이 ${Math.round(state.heightScale * 100)}%`;
      }
    }
    const modeButtons = root.querySelectorAll('[data-graph-mode]');
    for (const button of modeButtons) button.setAttribute('aria-pressed', String(button.dataset.graphMode === state.mode));
    const historyBack = root.querySelector('[data-graph-history="back"]');
    const historyForward = root.querySelector('[data-graph-history="forward"]');
    if (historyBack) historyBack.disabled = state.historyIndex <= 0;
    if (historyForward) historyForward.disabled = state.historyIndex < 0 || state.historyIndex >= state.history.length - 1;
    if (historyLabel) historyLabel.textContent = state.historyIndex >= 0
      ? `방문 ${state.historyIndex + 1}/${state.history.length}`
      : '방문 기록 없음';
    if (bookmarkButton) {
      bookmarkButton.textContent = `표식 ${state.bookmarks.size}`;
      bookmarkButton.disabled = state.bookmarks.size === 0;
    }
    if (travelTarget) {
      travelTarget.textContent = state.mode === 'first-person'
        ? state.pointerLocked
          ? 'WASD로 비행 · Enter로 조준 문서 선택'
          : canvas.dataset.pointerLock === 'available'
            ? '화면을 클릭해 마우스 시점을 시작하세요.'
            : '화면을 드래그해 둘러보고 WASD로 이동하세요.'
        : state.mode === 'travel'
        ? candidateNode ? `Enter로 이동 · ${candidateNode.title}` : selectedNode ? '연결된 이웃이 없습니다.' : '먼저 노드를 선택하세요.'
        : selectedNode ? selectedNode.title : '노드를 선택해 탐험을 시작하세요.';
    }
    if (routeHud && routeSummary) {
      const start = state.nodeById.get(state.routeStart);
      routeHud.hidden = !start;
      routeSummary.textContent = state.routePath.length > 1
        ? `${start.title} → ${state.nodeById.get(state.routePath.at(-1))?.title ?? ''} · ${state.routePath.length - 1}단계 · 방향 무시`
        : start ? `${start.title}에서 출발할 경로를 선택하세요.` : '';
    }
    const labelNames = ['선택만', '적게', '핵심', '많이'];
    const labelOutput = root.querySelector('[data-graph-label-output]');
    const nodeOutput = root.querySelector('[data-graph-node-output]');
    const edgeOutput = root.querySelector('[data-graph-edge-output]');
    const widthOutput = root.querySelector('[data-graph-width-output]');
    const focusGravityOutput = root.querySelector('[data-graph-focus-gravity-output]');
    const heightOutput = root.querySelector('[data-graph-height-output]');
    const flightOutput = root.querySelector('[data-graph-flight-output]');
    const fovOutput = root.querySelector('[data-graph-fov-output]');
    if (labelOutput) labelOutput.textContent = labelNames[state.labelDensity] ?? '핵심';
    if (nodeOutput) nodeOutput.textContent = `${Math.round(state.nodeScale * 100)}%`;
    if (edgeOutput) edgeOutput.textContent = `${Math.round(state.edgeOpacity * 100)}%`;
    if (widthOutput) widthOutput.textContent = `${Math.round(state.edgeWidth * 100)}%`;
    if (focusGravityOutput) focusGravityOutput.textContent = `${Math.round(state.focusGravity * 100)}%`;
    if (heightOutput) heightOutput.textContent = `${Math.round(state.heightScale * 100)}%`;
    if (flightOutput) flightOutput.textContent = state.flightSpeed < 0.85 ? '느리게' : state.flightSpeed > 1.35 ? '빠르게' : '보통';
    if (fovOutput) fovOutput.textContent = `${Math.round(state.fov)}°`;
    if (pointerLockButton) {
      root.classList.toggle('uses-drag-look', canvas.dataset.pointerLock === 'unavailable');
      pointerLockButton.setAttribute('aria-pressed', String(state.pointerLocked));
      pointerLockButton.textContent = state.pointerLocked
        ? '비행 중 · Esc로 마우스 해제'
        : canvas.dataset.pointerLock === 'available'
          ? '화면을 클릭해 비행 시작'
          : '화면을 드래그해 둘러보기';
    }
    updateFlatButton();
  }

  function toggleBookmark(id) {
    if (!state.nodeById.has(id)) return;
    if (state.bookmarks.has(id)) state.bookmarks.delete(id);
    else state.bookmarks.add(id);
    saveBookmarks();
    state.inspectorId = '';
    updateGraph();
    status.textContent = `${state.nodeById.get(id).title} 표식을 ${state.bookmarks.has(id) ? '남겼습니다' : '지웠습니다'}.`;
  }

  function cycleBookmark() {
    const nodes = [...state.bookmarks]
      .map((id) => state.nodeById.get(id))
      .filter((node) => node && state.model.visibleNodes.has(node.id))
      .sort((left, right) => collator.compare(left.title, right.title));
    if (!nodes.length) return;
    const current = nodes.findIndex((node) => node.id === state.selected);
    const next = nodes[(current + 1 + nodes.length) % nodes.length];
    selectNode(next.id, { focus: true });
  }

  function resetRouteState({ keepStart = false } = {}) {
    if (!keepStart) state.routeStart = '';
    state.routePath = keepStart && state.routeStart ? [state.routeStart] : [];
    state.routeNodeIds = new Set(state.routePath);
    state.routeEdgeIds = new Set();
    state.inspectorId = '';
  }

  function clearRoute({ keepStart = false } = {}) {
    resetRouteState({ keepStart });
    updateGraph();
  }

  function findRoute(targetId) {
    if (
      !state.routeStart
      || !state.model.visibleNodes.has(state.routeStart)
      || !state.model.visibleNodes.has(targetId)
    ) {
      status.textContent = '출발점과 목적지가 현재 표시된 세계 안에 있어야 합니다.';
      return;
    }
    const path = shortestPath(state.model.visibleEdges, state.routeStart, targetId, state.model.visibleNodes);
    if (!path.length) {
      status.textContent = '현재 표시된 관계 안에서 연결 경로를 찾지 못했습니다.';
      return;
    }
    const edgeIds = new Set();
    for (let index = 0; index < path.length - 1; index += 1) {
      const left = path[index];
      const right = path[index + 1];
      const edge = state.model.visibleEdges
        .filter((item) => (item.source === left && item.target === right) || (item.source === right && item.target === left))
        .sort((a, b) => compareOverviewEdges(a, b, left))[0];
      if (edge) edgeIds.add(edge.id);
    }
    state.routePath = path;
    state.routeNodeIds = new Set(path);
    state.routeEdgeIds = edgeIds;
    state.inspectorId = '';
    updateGraph();
    status.textContent = `방향을 무시한 현재 표시 관계 기준으로 ${state.nodeById.get(state.routeStart)?.title ?? '출발점'}에서 ${state.nodeById.get(targetId)?.title ?? '목적지'}까지 ${path.length - 1}단계 최단 연결을 표시했습니다.`;
  }

  function handleRouteNode(id) {
    if (state.routeStart === id) {
      clearRoute();
      status.textContent = '경로 출발점을 해제했습니다.';
      return;
    }
    if (!state.routeStart) {
      state.routeStart = id;
      state.routePath = [id];
      state.routeNodeIds = new Set([id]);
      state.routeEdgeIds = new Set();
      state.inspectorId = '';
      updateGraph();
      status.textContent = `${state.nodeById.get(id)?.title ?? '문서'}를 경로 출발점으로 지정했습니다.`;
      return;
    }
    findRoute(id);
  }

  function travelNeighbors() {
    if (!state.selected || !state.model) return [];
    return [...(state.model.adjacency.get(state.selected) ?? [])]
      .map((id) => state.nodeById.get(id))
      .filter(Boolean)
      .sort((left, right) => right.bridgeConnections - left.bridgeConnections || right.degree - left.degree || collator.compare(left.title, right.title));
  }

  function refreshTravelCandidate(preferredIndex = 0) {
    const neighbors = travelNeighbors();
    if (!neighbors.length) {
      state.travelCandidate = '';
      state.travelIndex = -1;
    } else {
      state.travelIndex = ((preferredIndex % neighbors.length) + neighbors.length) % neighbors.length;
      state.travelCandidate = neighbors[state.travelIndex].id;
    }
    updateHud();
    scheduleDraw();
  }

  function setMode(mode) {
    const nextMode = ['orbit', 'travel', 'first-person'].includes(mode) ? mode : 'orbit';
    if (nextMode === 'first-person' && !world) {
      status.textContent = '이 환경에서는 WebGL 1인칭 비행을 사용할 수 없어 2D 탐색을 유지합니다.';
      return;
    }
    if (state.mode === 'first-person' && nextMode !== 'first-person') world?.releasePointerLock?.();
    state.mode = nextMode;
    root.classList.toggle('is-first-person', state.mode === 'first-person');
    if (fpsLayer) fpsLayer.hidden = state.mode !== 'first-person';
    world?.setMode?.(state.mode, { selectedId: state.selected });
    if (state.mode === 'travel') refreshTravelCandidate(0);
    else {
      state.travelCandidate = '';
      state.travelIndex = -1;
      updateHud();
      scheduleDraw();
    }
    status.textContent = state.mode === 'first-person'
      ? canvas.dataset.pointerLock === 'available'
        ? '1인칭 비행 모드입니다. 화면을 클릭해 마우스 시점을 시작하고 WASD로 이동하세요.'
        : '1인칭 비행 모드입니다. 화면을 드래그해 둘러보고 WASD로 이동하세요.'
      : state.mode === 'travel'
      ? '연결 여행 모드입니다. 방향키로 이웃을 고르고 Enter로 이동하세요.'
      : '궤도 탐색 모드입니다. 회전, 이동, 확대를 사용할 수 있습니다.';
  }

  function stepTravel(delta) {
    if (!state.selected) {
      const first = state.data.nodes.find((node) => state.model.visibleNodes.has(node.id));
      if (first) selectNode(first.id, { focus: true });
      return;
    }
    refreshTravelCandidate(state.travelIndex + delta);
  }

  function commitTravel() {
    if (state.travelCandidate) selectNode(state.travelCandidate, { focus: true });
  }

  function navigateHistory(delta) {
    let nextIndex = state.historyIndex + delta;
    while (nextIndex >= 0 && nextIndex < state.history.length) {
      const id = state.history[nextIndex];
      if (state.model.baseVisibleNodes.has(id)) {
        state.historyIndex = nextIndex;
        selectNode(id, { focus: true, record: false });
        return;
      }
      nextIndex += delta;
    }
    status.textContent = '현재 필터에서 이동할 수 있는 방문 기록이 없습니다.';
  }

  function restoreInspector() {
    inspectorContent.innerHTML = initialInspectorMarkup;
    state.inspectorId = '';
    root.classList.remove('has-selection');
  }

  function selectNode(id, { focus = false, record = true } = {}) {
    const node = state.nodeById.get(id);
    if (!node || !state.model.baseVisibleNodes.has(id)) return false;
    if (state.selected !== id) state.mobileRelationLimit = 8;
    state.selected = id;
    state.travelCandidate = '';
    state.travelIndex = -1;
    if (record) recordHistory(id);
    root.classList.add('has-selection');
    updateGraph();
    if (state.mode === 'travel') refreshTravelCandidate(0);
    if (focus) focusNode(id);
    const relations = visibleRelations(node);
    const outsideNeighbors = [...relations.keys()].filter((neighborId) => (
      state.nodeById.get(neighborId)?.community !== node.community
    ));
    status.textContent = `${node.title} 선택. 표시 이웃 ${relations.size}개, 집단 밖 이웃 ${outsideNeighbors.length}개.`;
    return true;
  }

  function clearSelection() {
    if (!state.selected) return;
    state.selected = '';
    state.travelCandidate = '';
    state.travelIndex = -1;
    state.mobileRelationLimit = 8;
    restoreInspector();
    updateGraph();
  }

  function updateFlatButton() {
    const button = root.querySelector('[data-graph-view="flat"]');
    button?.setAttribute('aria-pressed', String(!world && Boolean(state.camera.flat)));
    if (button && world) button.textContent = '위에서 조망';
  }

  function cancelCameraAnimation() {
    if (state.cameraAnimation) window.cancelAnimationFrame(state.cameraAnimation);
    state.cameraAnimation = 0;
  }

  function applyCamera(camera) {
    state.camera = normalizeCamera(camera);
    updateHud();
    scheduleDraw();
  }

  function setCamera(patch) {
    cancelCameraAnimation();
    if (state.autoRotate) setAutoRotate(false);
    applyCamera({ ...state.camera, ...patch });
  }

  function animateCameraTo(targetCamera) {
    const target = normalizeCamera(targetCamera);
    cancelCameraAnimation();
    if (state.autoRotate) setAutoRotate(false);
    if (reduceMotion.matches) {
      applyCamera(target);
      return;
    }
    const start = { ...state.camera };
    const startedAt = window.performance.now();
    const duration = 420;
    const tick = (now) => {
      const progress = clamp(0, 1, (now - startedAt) / duration);
      const eased = 1 - (1 - progress) ** 3;
      state.camera = normalizeCamera({
        ...start,
        yaw: start.yaw + (target.yaw - start.yaw) * eased,
        pitch: start.pitch + (target.pitch - start.pitch) * eased,
        zoom: start.zoom + (target.zoom - start.zoom) * eased,
        panX: start.panX + (target.panX - start.panX) * eased,
        panY: start.panY + (target.panY - start.panY) * eased,
        flat: progress < 1 ? start.flat : target.flat,
      });
      updateHud();
      scheduleDraw();
      if (progress < 1) state.cameraAnimation = window.requestAnimationFrame(tick);
      else state.cameraAnimation = 0;
    };
    state.cameraAnimation = window.requestAnimationFrame(tick);
  }

  function displayDimensions() {
    return state.heightScale === 1
      ? state.data.dimensions
      : { ...state.data.dimensions, depth: state.data.dimensions.depth * state.heightScale };
  }

  function displayPoint(node) {
    return node.z ? { ...node, z: node.z * state.heightScale } : node;
  }

  function fitSafeArea() {
    const canvasRectangle = canvas.getBoundingClientRect();
    const headerRectangle = root.querySelector('[data-graph-hud]')?.getBoundingClientRect();
    const travelRectangle = root.querySelector('.graph-travel-hud')?.getBoundingClientRect();
    const inspectorRectangle = inspector?.getBoundingClientRect();
    const compact = state.viewport.width < 720;
    const top = headerRectangle
      ? clamp(28, state.viewport.height * 0.38, headerRectangle.bottom - canvasRectangle.top + 18)
      : 42;
    const bottom = travelRectangle
      ? clamp(32, state.viewport.height * 0.34, canvasRectangle.bottom - travelRectangle.top + 18)
      : 54;
    const left = compact ? 28 : 52;
    const right = !compact && root.classList.contains('has-selection') && inspectorRectangle
      ? clamp(52, state.viewport.width * 0.38, canvasRectangle.right - inspectorRectangle.left + 24)
      : compact ? 28 : 52;
    return { top, right, bottom, left };
  }

  function fitVisibleScene(animate = true, cameraBasis = state.camera) {
    if (mobileMode.matches) return;
    if (!state.data || !state.model || state.viewport.width <= 1 || state.viewport.height <= 1) return;
    if (world) {
      world.fit([...state.model.visibleNodes]);
      updateHud();
      return;
    }
    const camera = normalizeCamera({ ...cameraBasis, zoom: 1, panX: 0, panY: 0 });
    const dimensions = displayDimensions();
    const points = state.data.nodes
      .filter((node) => state.model.visibleNodes.has(node.id))
      .map((node) => projectPoint(displayPoint(node), camera, state.viewport, dimensions))
      .filter(Boolean);
    if (!points.length) return;
    const minimumX = Math.min(...points.map((point) => point.x));
    const maximumX = Math.max(...points.map((point) => point.x));
    const minimumY = Math.min(...points.map((point) => point.y));
    const maximumY = Math.max(...points.map((point) => point.y));
    const safe = fitSafeArea();
    const availableWidth = Math.max(160, state.viewport.width - safe.left - safe.right);
    const availableHeight = Math.max(180, state.viewport.height - safe.top - safe.bottom);
    const markerPadding = Math.max(24, 20 * state.nodeScale);
    const zoom = clamp(
      CAMERA_LIMITS.minimumZoom,
      CAMERA_LIMITS.maximumZoom,
      Math.min(
        availableWidth / Math.max(1, maximumX - minimumX + markerPadding * 2),
        availableHeight / Math.max(1, maximumY - minimumY + markerPadding * 2),
      ),
    );
    const centerX = (minimumX + maximumX) / 2;
    const centerY = (minimumY + maximumY) / 2;
    const safeCenterX = safe.left + availableWidth / 2;
    const safeCenterY = safe.top + availableHeight / 2;
    const target = normalizeCamera({
      ...camera,
      zoom,
      panX: safeCenterX - state.viewport.width / 2 - (centerX - state.viewport.width / 2) * zoom,
      panY: safeCenterY - state.viewport.height / 2 - (centerY - state.viewport.height / 2) * zoom,
    });
    if (animate) animateCameraTo(target);
    else {
      cancelCameraAnimation();
      if (state.autoRotate) setAutoRotate(false);
      applyCamera(target);
    }
  }

  function focusNode(id = state.selected) {
    const node = state.nodeById.get(id);
    if (!node || !state.model.visibleNodes.has(id)) {
      status.textContent = '먼저 노드를 선택하세요.';
      return;
    }
    if (mobileMode.matches) {
      window.requestAnimationFrame(() => {
        const card = mobileScene?.querySelector('[data-mobile-focus-card]');
        card?.scrollIntoView({
          block: 'center',
          behavior: reduceMotion.matches ? 'auto' : 'smooth',
        });
        card?.focus({ preventScroll: true });
      });
      return;
    }
    if (world) {
      world.focus(id);
      updateHud();
      return;
    }
    const targetZoom = clamp(1.25, 2.35, Math.max(state.camera.zoom, 1.55));
    const target = cameraForWorldPoint(
      displayPoint(node),
      { ...state.camera, flat: false },
      state.viewport,
      displayDimensions(),
      targetZoom,
    );
    animateCameraTo(target);
  }

  function panCamera(deltaX, deltaY) {
    if (world) {
      world.pan(deltaX, deltaY);
      updateHud();
      return;
    }
    setCamera({ panX: state.camera.panX + deltaX, panY: state.camera.panY + deltaY });
  }

  function zoomCamera(factor, anchor = { x: state.viewport.width / 2, y: state.viewport.height / 2 }) {
    if (world) {
      world.zoom(factor);
      updateHud();
      return;
    }
    cancelCameraAnimation();
    if (state.autoRotate) setAutoRotate(false);
    applyCamera(zoomCameraAt(state.camera, anchor, state.viewport, factor));
  }

  function resetCamera() {
    if (world) world.fit([...state.model.visibleNodes]);
    else fitVisibleScene(true, DEFAULT_CAMERA);
  }

  function canvasPoint(event) {
    const rectangle = canvas.getBoundingClientRect();
    return { x: event.clientX - rectangle.left, y: event.clientY - rectangle.top };
  }

  function nodeAtEvent(event) {
    if (world) {
      const picked = world.pick(canvasPoint(event));
      return state.nodeById.get(typeof picked === 'string' ? picked : picked?.id) ?? null;
    }
    return hitTestProjected(state.data.nodes, state.projectedNodes, canvasPoint(event), {
      visibleIds: state.model.visibleNodes,
      minimumRadius: 18,
      radiusScale: state.nodeScale,
    });
  }

  function isEditableTarget(target) {
    return target instanceof HTMLElement && Boolean(target.closest('input, select, textarea, button, summary, a, dialog, [contenteditable="true"]'));
  }

  function setSettingsOpen(open) {
    if (!settingsPanel || !settingsToggle) return;
    settingsPanel.hidden = !open;
    settingsToggle.setAttribute('aria-expanded', String(open));
    root.classList.toggle('has-settings', open);
    window.requestAnimationFrame(() => {
      if (open) settingsClose?.focus({ preventScroll: true });
      else settingsToggle.focus({ preventScroll: true });
    });
  }

  function updateFullscreenState() {
    const active = document.fullscreenElement === fullscreenRoot || state.fullscreenFallback;
    if (!active && state.pointerLocked) world?.releasePointerLock?.();
    fullscreenRoot.classList.toggle('is-fullscreen', active);
    fullscreenButton?.setAttribute('aria-pressed', String(active));
    if (fullscreenButton) fullscreenButton.textContent = active ? '전체 화면 나가기' : '전체 화면';
    window.requestAnimationFrame(() => {
      resizeCanvas();
      scheduleDraw();
      if (active) focusGraphSurface();
    });
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement === fullscreenRoot) {
        await document.exitFullscreen();
        return;
      }
      if (state.fullscreenFallback) {
        state.fullscreenFallback = false;
        document.body.classList.remove('graph-fallback-fullscreen');
        updateFullscreenState();
        return;
      }
      if (fullscreenRoot.requestFullscreen) await fullscreenRoot.requestFullscreen();
      else throw new Error('Fullscreen API unavailable');
    } catch {
      if (!document.fullscreenElement) {
        state.fullscreenFallback = !state.fullscreenFallback;
        document.body.classList.toggle('graph-fallback-fullscreen', state.fullscreenFallback);
        updateFullscreenState();
      }
    }
  }

  function setAutoRotate(enabled) {
    state.autoRotate = Boolean(enabled) && !reduceMotion.matches;
    if (autoRotateInput) autoRotateInput.checked = state.autoRotate;
    if (world) {
      scheduleDraw();
      return;
    }
    if (state.autoRotateFrame) window.cancelAnimationFrame(state.autoRotateFrame);
    state.autoRotateFrame = 0;
    if (!state.autoRotate) return;
    let previous = window.performance.now();
    const tick = (now) => {
      if (!state.autoRotate) {
        state.autoRotateFrame = 0;
        return;
      }
      const elapsed = Math.min(50, now - previous);
      previous = now;
      state.camera = normalizeCamera({ ...state.camera, yaw: state.camera.yaw + elapsed * 0.00008, flat: false });
      updateHud();
      scheduleDraw();
      state.autoRotateFrame = window.requestAnimationFrame(tick);
    };
    state.autoRotateFrame = window.requestAnimationFrame(tick);
  }

  function updateHoverCard(event, node) {
    if (!hoverCard) return;
    if (!node) {
      hoverCard.hidden = true;
      return;
    }
    const community = state.data.communities.find((item) => item.id === node.community);
    hoverCard.replaceChildren(
      element('strong', '', node.title),
      element('span', '', `${typeLabels[node.type] ?? node.type} · ${community?.label ?? '분류 없음'}`),
    );
    const rectangle = stage.getBoundingClientRect();
    const left = clamp(12, rectangle.width - 270, event.clientX - rectangle.left + 18);
    const top = clamp(96, rectangle.height - 90, event.clientY - rectangle.top + 18);
    hoverCard.style.left = `${left}px`;
    hoverCard.style.top = `${top}px`;
    hoverCard.hidden = false;
  }

  function minimapNodeAtEvent(event) {
    if (!minimap || !state.data || !state.model) return null;
    const rectangle = minimap.getBoundingClientRect();
    const padding = 9;
    const worldX = (event.clientX - rectangle.left - padding) / Math.max(1, rectangle.width - padding * 2) * state.data.dimensions.width;
    const worldY = (event.clientY - rectangle.top - padding) / Math.max(1, rectangle.height - padding * 2) * state.data.dimensions.height;
    return state.data.nodes
      .filter((node) => state.model.visibleNodes.has(node.id))
      .map((node) => ({ node, distance: Math.hypot(node.x - worldX, node.y - worldY) }))
      .sort((left, right) => left.distance - right.distance)[0]?.node ?? null;
  }

  function focusGraphSurface() {
    const surface = mobileMode.matches ? mobileAtlas : canvas;
    surface?.focus({ preventScroll: true });
  }

  function bindInteractions() {
    settingsToggle?.addEventListener('click', (event) => {
      event.stopPropagation();
      const nextOpen = settingsPanel?.hidden ?? true;
      setSettingsOpen(nextOpen);
    });
    settingsClose?.addEventListener('click', (event) => {
      event.stopPropagation();
      setSettingsOpen(false);
    });
    settingsPanel?.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      const focusable = [...settingsPanel.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])')]
        .filter((item) => !item.disabled && item.getClientRects().length);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    helpDialog?.addEventListener('close', focusGraphSurface);

    root.addEventListener('click', (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      if (target.closest('[data-graph-help-open]')) {
        if (typeof helpDialog?.showModal === 'function') helpDialog.showModal();
        else helpDialog?.setAttribute('open', '');
        return;
      }
      if (target.closest('[data-graph-fullscreen]')) {
        void toggleFullscreen();
        return;
      }
      if (target.closest('[data-graph-pointer-lock]')) {
        focusGraphSurface();
        if (canvas.dataset.pointerLock === 'available') void world?.requestPointerLock?.();
        return;
      }
      if (target.closest('[data-graph-fps-select]')) {
        const targetNode = world?.getReticleTarget?.();
        if (targetNode) selectNode(typeof targetNode === 'string' ? targetNode : targetNode.id);
        return;
      }

      const clearButton = event.target.closest('[data-graph-clear-selection]');
      if (clearButton) {
        clearSelection();
        search?.focus();
        return;
      }

      const relationLimit = target.closest('[data-mobile-relation-limit]');
      if (relationLimit) {
        const expanding = relationLimit.dataset.mobileRelationLimit === 'all';
        state.mobileRelationLimit = expanding ? Infinity : 8;
        renderMobileAtlas(state.nodeById.get(state.selected));
        status.textContent = state.mobileRelationLimit === 8
          ? '모바일 카드판을 핵심 연결 8개로 접었습니다.'
          : '모바일 카드판에서 직접 연결을 모두 펼쳤습니다.';
        window.requestAnimationFrame(() => {
          const nextTarget = expanding
            ? mobileScene?.querySelector('[data-mobile-card-index="8"]')
            : mobileScene?.querySelector('[data-mobile-relation-limit]');
          nextTarget?.scrollIntoView({ block: 'center', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
          nextTarget?.focus({ preventScroll: true });
        });
        return;
      }

      const selectButton = target.closest('[data-select-node]');
      if (selectButton) {
        selectNode(selectButton.dataset.selectNode, { focus: true });
        return;
      }

      const focusButton = target.closest('[data-graph-focus-selection], [data-graph-focus-node]');
      if (focusButton) {
        focusNode(focusButton.dataset.graphFocusNode || state.selected);
        return;
      }

      const bookmark = target.closest('[data-graph-bookmark]');
      if (bookmark) {
        toggleBookmark(bookmark.dataset.graphBookmark);
        return;
      }

      const routeNode = target.closest('[data-graph-route-node]');
      if (routeNode) {
        handleRouteNode(routeNode.dataset.graphRouteNode);
        return;
      }
      if (target.closest('[data-graph-route-clear]')) {
        clearRoute();
        status.textContent = '연결 경로를 지웠습니다.';
        return;
      }

      const modeButton = target.closest('[data-graph-mode]');
      if (modeButton) {
        setMode(modeButton.dataset.graphMode);
        focusGraphSurface();
        if (
          modeButton.dataset.graphMode === 'first-person'
          && world
          && canvas.dataset.pointerLock === 'available'
        ) void world.requestPointerLock();
        return;
      }

      const historyButton = target.closest('[data-graph-history]');
      if (historyButton) {
        navigateHistory(historyButton.dataset.graphHistory === 'back' ? -1 : 1);
        return;
      }
      if (target.closest('[data-graph-bookmarks]')) {
        cycleBookmark();
        return;
      }
      if (target.closest('[data-graph-fit-visible]')) {
        fitVisibleScene(true);
        return;
      }

      const panButton = target.closest('[data-graph-pan]');
      if (panButton) {
        const amount = 72;
        if (panButton.dataset.graphPan === 'left') panCamera(-amount, 0);
        if (panButton.dataset.graphPan === 'right') panCamera(amount, 0);
        if (panButton.dataset.graphPan === 'up') panCamera(0, -amount);
        if (panButton.dataset.graphPan === 'down') panCamera(0, amount);
        focusGraphSurface();
        return;
      }

      const zoomButton = target.closest('[data-graph-zoom]');
      if (zoomButton?.dataset.graphZoom === 'in') zoomCamera(1.25);
      else if (zoomButton?.dataset.graphZoom === 'out') zoomCamera(1 / 1.25);
      if (zoomButton) {
        focusGraphSurface();
        return;
      }

      const orbitButton = target.closest('[data-graph-orbit]');
      if (orbitButton) {
        const direction = orbitButton.dataset.graphOrbit;
        if (world) {
          if (direction === 'left') world.orbit(-72, 0);
          if (direction === 'right') world.orbit(72, 0);
          if (direction === 'higher') world.orbit(0, 54);
          if (direction === 'lower') world.orbit(0, -54);
          updateHud();
          focusGraphSurface();
          return;
        }
        const patch = { flat: false };
        if (direction === 'left') patch.yaw = state.camera.yaw - 0.18;
        if (direction === 'right') patch.yaw = state.camera.yaw + 0.18;
        if (direction === 'higher') patch.pitch = state.camera.pitch - 0.12;
        if (direction === 'lower') patch.pitch = state.camera.pitch + 0.12;
        setCamera(patch);
        focusGraphSurface();
        return;
      }

      const viewButton = target.closest('[data-graph-view]');
      if (viewButton?.dataset.graphView === 'flat' && world) world.orbit(0, 1000);
      else if (viewButton?.dataset.graphView === 'flat') setCamera({ flat: !state.camera.flat });
      else if (viewButton?.dataset.graphView === 'reset') resetCamera();
      if (viewButton) focusGraphSurface();
    });

    search?.addEventListener('input', () => {
      state.query = normalize(search.value);
      updateGraph();
    });
    controls?.addEventListener('submit', (event) => {
      event.preventDefault();
      const searchRank = (node) => {
        const title = normalize(node.title);
        const aliases = (node.aliases ?? []).map(normalize);
        if (title === state.query) return 0;
        if (aliases.includes(state.query)) return 1;
        if (title.startsWith(state.query)) return 2;
        if (aliases.some((alias) => alias.startsWith(state.query))) return 3;
        return 4;
      };
      const matches = state.data.nodes
        .filter((node) => state.model.baseVisibleNodes.has(node.id) && searchMatches(node))
        .sort((left, right) => searchRank(left) - searchRank(right) || collator.compare(left.title, right.title));
      if (matches[0]) {
        selectNode(matches[0].id, { focus: true });
        focusGraphSurface();
      }
      else {
        const hiddenMatch = state.data.nodes.some((node) => nodeMatchesFilters(node) && searchMatches(node));
        status.textContent = hiddenMatch
          ? '일치하는 문서가 현재 고립 문서 설정 또는 관계 필터에 가려져 있습니다.'
          : '일치하는 문서를 찾지 못했습니다.';
      }
    });

    const updateStructure = (patch, { fit = true } = {}) => {
      Object.assign(state, patch);
      resetRouteState();
      updateGraph();
      if (fit) window.requestAnimationFrame(() => fitVisibleScene(true));
    };
    typeFilter?.addEventListener('change', () => updateStructure({ type: typeFilter.value }));
    verificationFilter?.addEventListener('change', () => updateStructure({ verification: verificationFilter.value }));
    relationFilter?.addEventListener('change', () => updateStructure({ relation: relationFilter.value }, { fit: false }));
    communityFilter?.addEventListener('change', () => updateStructure({ community: communityFilter.value }));
    densityFilter?.addEventListener('change', () => {
      state.density = densityFilter.value;
      updateGraph();
    });
    localDepthFilter?.addEventListener('change', () => {
      state.localDepth = Number(localDepthFilter.value) || 0;
      resetRouteState();
      updateGraph();
      window.requestAnimationFrame(() => fitVisibleScene(true));
    });

    const bindRange = (input, key, { fit = false } = {}) => input?.addEventListener('input', () => {
      state[key] = Number(input.value);
      updateHud();
      scheduleDraw();
      if (fit) window.requestAnimationFrame(() => fitVisibleScene(false));
    });
    bindRange(labelDensityInput, 'labelDensity');
    bindRange(nodeScaleInput, 'nodeScale');
    bindRange(edgeOpacityInput, 'edgeOpacity');
    bindRange(edgeWidthInput, 'edgeWidth');
    bindRange(focusGravityInput, 'focusGravity');
    bindRange(heightScaleInput, 'heightScale', { fit: true });
    flightSpeedInput?.addEventListener('input', () => {
      state.flightSpeed = Number(flightSpeedInput.value) || 1;
      world?.setFlightSpeed?.(state.flightSpeed);
      updateHud();
    });
    fovInput?.addEventListener('input', () => {
      state.fov = Number(fovInput.value) || 56;
      world?.setFov?.(state.fov);
      updateHud();
    });

    arrowsInput?.addEventListener('change', () => { state.showArrows = arrowsInput.checked; scheduleDraw(); });
    gridInput?.addEventListener('change', () => { state.showGrid = gridInput.checked; scheduleDraw(); });
    communitiesInput?.addEventListener('change', () => { state.showCommunities = communitiesInput.checked; scheduleDraw(); });
    orphansInput?.addEventListener('change', () => {
      state.showOrphans = orphansInput.checked;
      resetRouteState();
      updateGraph();
      window.requestAnimationFrame(() => fitVisibleScene(true));
    });
    autoRotateInput?.addEventListener('change', () => setAutoRotate(autoRotateInput.checked));

    controls?.addEventListener('reset', () => window.requestAnimationFrame(() => {
      setAutoRotate(false);
      state.selected = '';
      state.hovered = '';
      state.query = '';
      state.type = '';
      state.verification = '';
      state.relation = relationFilter?.value || 'related';
      state.community = '';
      state.density = densityFilter?.value || 'backbone';
      state.localDepth = Number(localDepthFilter?.value) || 0;
      state.labelDensity = Number(labelDensityInput?.value) || 2;
      state.nodeScale = Number(nodeScaleInput?.value) || 1.25;
      state.edgeOpacity = Number(edgeOpacityInput?.value) || 0.48;
      state.edgeWidth = Number(edgeWidthInput?.value) || 0.72;
      state.focusGravity = Number(focusGravityInput?.value) || 1;
      state.heightScale = Number(heightScaleInput?.value) || 1;
      state.flightSpeed = Number(flightSpeedInput?.value) || 1;
      state.fov = Number(fovInput?.value) || 56;
      state.showArrows = arrowsInput?.checked ?? true;
      state.showGrid = gridInput?.checked ?? true;
      state.showCommunities = communitiesInput?.checked ?? true;
      state.showOrphans = orphansInput?.checked ?? true;
      state.routeStart = '';
      state.routePath = [];
      state.routeNodeIds = new Set();
      state.routeEdgeIds = new Set();
      state.mode = 'orbit';
      root.classList.remove('is-first-person');
      if (fpsLayer) fpsLayer.hidden = true;
      world?.setFlightSpeed?.(state.flightSpeed);
      world?.setFov?.(state.fov);
      world?.setMode?.('orbit');
      state.travelCandidate = '';
      state.travelIndex = -1;
      restoreInspector();
      updateGraph();
      resetCamera();
      status.textContent = '세계 설정과 카메라를 초기 상태로 되돌렸습니다.';
    }));

    canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      setAutoRotate(false);
      const intensity = event.ctrlKey ? 1.06 : 1.12;
      zoomCamera(event.deltaY < 0 ? intensity : 1 / intensity, canvasPoint(event));
    }, { passive: false });

    const activePointers = new Map();
    let drag = null;
    let pinch = null;
    let gestureMoved = false;
    const pointerCentroid = (points) => ({
      x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
      y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
    });
    const dragSnapshot = (pointerId, point, moved = false) => ({
      pointerId,
      startX: point.x,
      startY: point.y,
      yaw: state.camera.yaw,
      pitch: state.camera.pitch,
      panX: state.camera.panX,
      panY: state.camera.panY,
      moved,
      button: point.button,
      mode: point.mode,
    });

    canvas.addEventListener('pointerdown', (event) => {
      if (![0, 1, 2].includes(event.button)) return;
      event.preventDefault();
      focusGraphSurface();
      if (state.mode === 'first-person' && world) {
        if (state.pointerLocked) {
          if (event.button === 0) {
            const targetNode = world.getReticleTarget?.();
            if (targetNode) selectNode(typeof targetNode === 'string' ? targetNode : targetNode.id);
          }
          return;
        }
        if (event.pointerType === 'mouse' && canvas.dataset.pointerLock === 'available') {
          void world.requestPointerLock();
          return;
        }
        const touchPoint = { x: event.clientX, y: event.clientY, button: event.button, mode: 'first-look' };
        activePointers.set(event.pointerId, touchPoint);
        canvas.setPointerCapture(event.pointerId);
        drag = dragSnapshot(event.pointerId, touchPoint);
        return;
      }
      cancelCameraAnimation();
      setAutoRotate(false);
      state.hovered = '';
      canvas.classList.remove('has-hover');
      updateHoverCard(null, null);
      const point = {
        x: event.clientX,
        y: event.clientY,
        button: event.button,
        mode: event.shiftKey || event.button === 1 || event.button === 2 ? 'pan' : 'orbit',
      };
      activePointers.set(event.pointerId, point);
      canvas.setPointerCapture(event.pointerId);
      if (activePointers.size === 1) {
        gestureMoved = false;
        drag = dragSnapshot(event.pointerId, point);
      }
      if (activePointers.size === 2) {
        const points = [...activePointers.values()];
        gestureMoved = true;
        pinch = {
          distance: Math.max(1, Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y)),
          centroid: pointerCentroid(points),
          camera: { ...state.camera },
        };
      }
    });
    canvas.addEventListener('pointermove', (event) => {
      if (state.mode === 'first-person' && world && drag?.mode === 'first-look' && event.pointerId === drag.pointerId) {
        const deltaX = event.clientX - drag.startX;
        const deltaY = event.clientY - drag.startY;
        if (Math.hypot(deltaX, deltaY) > 1) {
          world.look(deltaX, deltaY);
          drag.startX = event.clientX;
          drag.startY = event.clientY;
          drag.moved = true;
          scheduleDraw();
        }
        return;
      }
      if (!activePointers.size) {
        const hoveredNode = nodeAtEvent(event);
        const hovered = hoveredNode?.id ?? '';
        if (hovered !== state.hovered) {
          state.hovered = hovered;
          canvas.classList.toggle('has-hover', Boolean(hovered));
          updateGraph();
        }
        updateHoverCard(event, hoveredNode);
        return;
      }

      if (activePointers.has(event.pointerId)) {
        const previous = activePointers.get(event.pointerId);
        activePointers.set(event.pointerId, { ...previous, x: event.clientX, y: event.clientY });
      }
      if (pinch && activePointers.size >= 2) {
        const points = [...activePointers.values()].slice(0, 2);
        const distance = Math.max(1, Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y));
        const centroid = pointerCentroid(points);
        if (world) {
          world.zoom(distance / pinch.distance);
          world.pan(centroid.x - pinch.centroid.x, centroid.y - pinch.centroid.y);
          pinch.distance = distance;
          pinch.centroid = centroid;
          updateHud();
        } else {
          const rectangle = canvas.getBoundingClientRect();
          const anchor = { x: pinch.centroid.x - rectangle.left, y: pinch.centroid.y - rectangle.top };
          const zoomed = zoomCameraAt(pinch.camera, anchor, state.viewport, distance / pinch.distance);
          applyCamera({
            ...zoomed,
            panX: zoomed.panX + centroid.x - pinch.centroid.x,
            panY: zoomed.panY + centroid.y - pinch.centroid.y,
          });
        }
        if (drag) drag.moved = true;
        gestureMoved = true;
        canvas.classList.add('is-panning');
        return;
      }

      if (!drag || event.pointerId !== drag.pointerId) return;
      const deltaX = event.clientX - drag.startX;
      const deltaY = event.clientY - drag.startY;
      drag.moved ||= Math.hypot(deltaX, deltaY) > 4;
      gestureMoved ||= drag.moved;
      if (drag.mode === 'pan') {
        if (world) {
          world.pan(deltaX, deltaY);
          drag.startX = event.clientX;
          drag.startY = event.clientY;
          updateHud();
        } else setCamera({ panX: drag.panX + deltaX, panY: drag.panY + deltaY });
        canvas.classList.add('is-panning');
      } else {
        if (world) {
          world.orbit(deltaX, deltaY);
          drag.startX = event.clientX;
          drag.startY = event.clientY;
          updateHud();
        } else {
          const pitch = clamp(CAMERA_LIMITS.minimumPitch, CAMERA_LIMITS.maximumPitch, drag.pitch + deltaY * 0.004);
          setCamera({ yaw: drag.yaw + deltaX * 0.006, pitch, flat: false });
        }
        canvas.classList.add('is-orbiting');
      }
    });
    const stopDrag = (event, cancelled = false) => {
      const releasedDrag = drag?.pointerId === event.pointerId ? drag : null;
      activePointers.delete(event.pointerId);
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      const shouldSelect = !cancelled
        && activePointers.size === 0
        && releasedDrag
        && !gestureMoved
        && !releasedDrag.moved
        && releasedDrag.button === 0;

      pinch = null;
      if (activePointers.size === 1) {
        const [remainingId, remainingPoint] = activePointers.entries().next().value;
        drag = dragSnapshot(remainingId, remainingPoint, true);
        gestureMoved = true;
      } else if (activePointers.size === 0) {
        drag = null;
        gestureMoved = false;
        canvas.classList.remove('is-orbiting', 'is-panning');
      }

      if (shouldSelect) {
        const node = nodeAtEvent(event);
        if (node) selectNode(node.id);
        else clearSelection();
      }
    };
    canvas.addEventListener('pointerup', stopDrag);
    canvas.addEventListener('pointercancel', (event) => stopDrag(event, true));
    canvas.addEventListener('pointerleave', () => {
      if (drag) return;
      state.hovered = '';
      canvas.classList.remove('has-hover');
      updateHoverCard(null, null);
      updateGraph();
    });
    canvas.addEventListener('contextmenu', (event) => event.preventDefault());
    canvas.addEventListener('dblclick', (event) => {
      if (state.mode === 'first-person') return;
      const node = nodeAtEvent(event);
      if (node) selectNode(node.id, { focus: true });
    });

    minimap?.addEventListener('click', (event) => {
      const node = minimapNodeAtEvent(event);
      if (node) selectNode(node.id, { focus: true });
    });

    const flightPadCodes = {
      forward: 'KeyW',
      left: 'KeyA',
      backward: 'KeyS',
      right: 'KeyD',
      up: 'Space',
      down: 'ControlLeft',
    };
    for (const button of root.querySelectorAll('[data-graph-fps-move]')) {
      const setPressed = (pressed) => {
        const code = flightPadCodes[button.dataset.graphFpsMove];
        if (code) world?.setKey?.(code, pressed);
      };
      button.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        button.setPointerCapture?.(event.pointerId);
        setPressed(true);
      });
      for (const eventName of ['pointerup', 'pointercancel', 'pointerleave']) {
        button.addEventListener(eventName, () => setPressed(false));
      }
    }

    document.addEventListener('keydown', (event) => {
      const key = event.key.toLocaleLowerCase();
      if (key === 'escape') {
        if (helpDialog?.open) helpDialog.close();
        else if (settingsPanel && !settingsPanel.hidden) setSettingsOpen(false);
        else if (state.mode === 'first-person' && state.pointerLocked) world?.releasePointerLock?.();
        else if (state.fullscreenFallback) void toggleFullscreen();
        else clearSelection();
        return;
      }
      if (isEditableTarget(event.target)) return;
      const activeElement = document.activeElement;
      const graphHasFocus = activeElement === canvas
        || (activeElement instanceof Element && root.contains(activeElement))
        || document.fullscreenElement === fullscreenRoot
        || state.fullscreenFallback
        || state.pointerLocked;
      if (!graphHasFocus || helpDialog?.open) return;
      if (mobileMode.matches) return;
      if (key === 'v') {
        event.preventDefault();
        setMode(state.mode === 'first-person' ? 'orbit' : 'first-person');
        focusGraphSurface();
        if (state.mode === 'first-person' && canvas.dataset.pointerLock === 'available') {
          void world?.requestPointerLock?.();
        }
        return;
      }
      if (key === 'f') {
        event.preventDefault();
        void toggleFullscreen();
        return;
      }
      if (key === '2') {
        event.preventDefault();
        if (world) world.orbit(0, 1000);
        else setCamera({ flat: !state.camera.flat });
        return;
      }
      if (key === 'home') {
        event.preventDefault();
        fitVisibleScene(true);
        return;
      }
      if (key === 'c') {
        event.preventDefault();
        focusNode();
        return;
      }
      if (key === 'b') {
        if (state.selected) toggleBookmark(state.selected);
        return;
      }
      if (key === '+' || key === '=') {
        event.preventDefault();
        zoomCamera(1.2);
        return;
      }
      if (key === '-' || key === '_') {
        event.preventDefault();
        zoomCamera(1 / 1.2);
        return;
      }

      if (state.mode === 'first-person' && world) {
        if (key === 'enter') {
          event.preventDefault();
          const targetNode = world.getReticleTarget?.();
          if (targetNode) selectNode(typeof targetNode === 'string' ? targetNode : targetNode.id);
          return;
        }
        if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ControlLeft', 'ControlRight', 'ShiftLeft', 'ShiftRight'].includes(event.code)) {
          event.preventDefault();
          world.setKey(event.code, true);
          return;
        }
      }

      if (state.mode === 'travel' && ['arrowleft', 'arrowup', 'a', 'w', 'arrowright', 'arrowdown', 'd', 's', 'enter'].includes(key)) {
        event.preventDefault();
        if (key === 'enter') commitTravel();
        else stepTravel(['arrowleft', 'arrowup', 'a', 'w'].includes(key) ? -1 : 1);
        return;
      }

      const amount = event.shiftKey ? 90 : 46;
      if (key === 'a' || key === 'arrowleft') panCamera(-amount, 0);
      else if (key === 'd' || key === 'arrowright') panCamera(amount, 0);
      else if (key === 'w' || key === 'arrowup') panCamera(0, -amount);
      else if (key === 's' || key === 'arrowdown') panCamera(0, amount);
      else if (key === 'q') {
        if (world) world.orbit(-32, 0);
        else setCamera({ yaw: state.camera.yaw - 0.16, flat: false });
      } else if (key === 'e') {
        if (world) world.orbit(32, 0);
        else setCamera({ yaw: state.camera.yaw + 0.16, flat: false });
      }
      else return;
      event.preventDefault();
    });

    document.addEventListener('keyup', (event) => {
      if (world) world.setKey(event.code, false);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) world?.clearKeys?.();
    });

    document.addEventListener('fullscreenchange', updateFullscreenState);
    forcedColors.addEventListener('change', () => {
      resolvePalette();
      scheduleDraw();
    });
    reduceMotion.addEventListener('change', () => {
      if (reduceMotion.matches) setAutoRotate(false);
      scheduleDraw();
    });
    mobileMode.addEventListener('change', () => {
      root.classList.toggle('is-mobile-atlas', mobileMode.matches);
      world?.setActive?.(!mobileMode.matches);
      if (mobileMode.matches && state.mode !== 'orbit') {
        state.mode = 'orbit';
        root.classList.remove('is-first-person');
        if (fpsLayer) fpsLayer.hidden = true;
        world?.setMode?.('orbit');
      }
      if (!mobileMode.matches && !world && !context) {
        void initializeDesktopRenderer().then((created) => {
          if (!created && !context && !mobileMode.matches && !activateCanvasFallback()) {
            fail(new Error('Desktop renderer initialization failed after the responsive transition.'));
            return;
          }
          updateGraph();
          resizeCanvas();
        }).catch(fail);
        return;
      }
      updateGraph();
      resizeCanvas();
    });
    new ResizeObserver(resizeCanvas).observe(canvas);
    if (mobileScene) new ResizeObserver(scheduleMobileConnectors).observe(mobileScene);
  }

  function fail(error) {
    const message = '3D 연결 지도를 불러오지 못했습니다. 텍스트 목록으로 문서를 탐색할 수 있습니다.';
    if (staticMessage) {
      staticMessage.hidden = false;
      staticMessage.textContent = message;
    }
    status.textContent = message;
    if (mobileSummary) mobileSummary.textContent = '연결 카드판을 불러오지 못했습니다.';
    if (mobileContent) mobileContent.replaceChildren(element('p', 'graph-mobile-empty', `${message} 아래 텍스트 목록을 이용해 주세요.`));
    mobileConnectors?.replaceChildren();
    stage.classList.add('has-graph-error');
    console.error(error);
  }

  function setFirstPersonAvailability(enabled) {
    const firstPersonButton = root.querySelector('[data-graph-mode="first-person"]');
    if (!firstPersonButton) return;
    firstPersonButton.disabled = !enabled;
    firstPersonButton.title = enabled ? '' : 'WebGL2를 사용할 수 있는 환경에서 지원합니다.';
  }

  function activateCanvasFallback({ replaceCanvas = false } = {}) {
    if (context) return true;
    if (replaceCanvas) {
      const replacement = canvas.cloneNode(false);
      canvas.replaceWith(replacement);
      canvas = replacement;
    }
    context = canvas.getContext('2d');
    if (!context) return false;
    root.classList.add('has-canvas-fallback');
    if (rendererBadge) rendererBadge.textContent = '2D 호환 모드';
    setFirstPersonAvailability(false);
    return true;
  }

  async function initializeDesktopRenderer(data = state.data) {
    if (world) {
      world.setActive?.(!mobileMode.matches);
      return true;
    }
    if (
      !data
      || context
      || mobileMode.matches
      || forcedColors.matches
      || !document.createElement('canvas').getContext('webgl2')
    ) return false;
    if (rendererInitialization) return rendererInitialization;

    const initialization = (async () => {
      let candidate = null;
      try {
        const { createKnowledgeWorld } = await import('./graph-world.js');
        if (context || mobileMode.matches) return false;
        candidate = createKnowledgeWorld(canvas, {
          data,
          palette: state.palette,
          reducedMotion: reduceMotion.matches,
          onReticleTarget(target) {
            const id = typeof target === 'string' ? target : target?.id ?? '';
            if (id === state.firstPersonTarget) return;
            state.firstPersonTarget = id;
            const node = state.nodeById.get(id);
            if (fpsTarget) fpsTarget.textContent = node
              ? `${node.title} · 클릭 또는 Enter로 선택`
              : '중앙의 노드를 조준하세요.';
          },
          onPointerLockChange(locked) {
            state.pointerLocked = Boolean(locked);
            root.classList.toggle('has-pointer-lock', state.pointerLocked);
            world?.clearKeys?.();
            updateHud();
          },
          onCameraChange(info) {
            state.webglCameraInfo = info ?? null;
            updateHud();
          },
        });
        world = candidate;
        world.setFlightSpeed(state.flightSpeed);
        world.setFov(state.fov);
        world.setActive?.(!mobileMode.matches);
        root.classList.add('has-webgl');
        stage.classList.add('has-webgl-world');
        if (rendererBadge) rendererBadge.textContent = 'WEBGL · 실제 3D';
        setFirstPersonAvailability(true);
        return true;
      } catch (error) {
        candidate?.dispose?.();
        world = null;
        console.warn('WebGL knowledge world unavailable; using the 2D compatibility renderer.', error);
        return false;
      }
    })();
    rendererInitialization = initialization;
    try {
      return await initialization;
    } finally {
      if (rendererInitialization === initialization) rendererInitialization = null;
    }
  }

  fetch(graphUrl, { headers: { Accept: 'application/json' } })
    .then((response) => {
      if (!response.ok) throw new Error(`Graph data request failed: ${response.status}`);
      return response.json();
    })
    .then(async (data) => {
      if (
        data?.schemaVersion !== 2
        || data?.layoutVersion !== 5
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
      loadBookmarks();
      resolvePalette();
      if (!mobileMode.matches) {
        const initialized = await initializeDesktopRenderer(data);
        if (!initialized && !activateCanvasFallback({ replaceCanvas: true })) {
          throw new Error('Neither WebGL nor 2D Canvas is available.');
        }
      } else if (rendererBadge) {
        rendererBadge.textContent = '모바일 2D 카드판';
      }
      updateGraph();
      bindInteractions();
      resizeCanvas();
      root.classList.add('is-ready');
      if (staticMessage) staticMessage.hidden = true;
    })
    .catch(fail);
})();
