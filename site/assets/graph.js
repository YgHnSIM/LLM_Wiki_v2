(() => {
  const root = document.querySelector('[data-knowledge-graph]');
  if (!root) return;

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const svg = root.querySelector('[data-graph-svg]');
  const stage = root.querySelector('[data-graph-stage]');
  const controls = root.querySelector('[data-graph-controls]');
  const search = root.querySelector('[data-graph-search]');
  const typeFilter = root.querySelector('[data-graph-type]');
  const verificationFilter = root.querySelector('[data-graph-verification]');
  const relationFilter = root.querySelector('[data-graph-relation]');
  const inspector = root.querySelector('[data-graph-inspector]');
  const inspectorContent = root.querySelector('[data-graph-inspector-content]');
  const status = root.querySelector('[data-graph-status]');
  const initialInspectorMarkup = inspectorContent?.innerHTML ?? '';
  const graphUrl = root.dataset.graphUrl;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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
  const normalize = (value) => String(value ?? '')
    .normalize('NFKC')
    .toLocaleLowerCase('ko')
    .replace(/\s+/g, ' ')
    .trim();
  const collator = new Intl.Collator('ko', { numeric: true, sensitivity: 'base' });
  const clamp = (minimum, maximum, value) => Math.min(maximum, Math.max(minimum, value));

  const state = {
    data: null,
    selected: '',
    query: '',
    type: '',
    verification: '',
    relation: relationFilter?.value || 'related',
    community: '',
    view: { x: 0, y: 0, scale: 1 },
  };
  const nodeElements = new Map();
  const edgeElements = new Map();
  const communityElements = new Map();
  let viewport;

  function svgElement(name, attributes = {}) {
    const element = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
    return element;
  }

  function element(name, className = '', text = '') {
    const item = document.createElement(name);
    if (className) item.className = className;
    if (text) item.textContent = text;
    return item;
  }

  function shapePath(type, radius) {
    const r = Number(radius);
    if (type === 'source' || type === 'reference') {
      return `M ${-r} ${-r} L ${r} ${-r} L ${r} ${r} L ${-r} ${r} Z`;
    }
    if (type === 'entity') return `M 0 ${-r * 1.25} L ${r} 0 L 0 ${r * 1.25} L ${-r} 0 Z`;
    if (type === 'analysis') {
      const x = r * 0.88;
      return `M 0 ${-r} L ${x} ${-r / 2} L ${x} ${r / 2} L 0 ${r} L ${-x} ${r / 2} L ${-x} ${-r / 2} Z`;
    }
    return `M ${-r} 0 A ${r} ${r} 0 1 0 ${r} 0 A ${r} ${r} 0 1 0 ${-r} 0 Z`;
  }

  function edgePath(edge, nodeById) {
    const source = nodeById.get(edge.source);
    const target = nodeById.get(edge.target);
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const ux = dx / distance;
    const uy = dy / distance;
    const startX = source.x + ux * (source.radius + 2);
    const startY = source.y + uy * (source.radius + 2);
    const endX = target.x - ux * (target.radius + 5);
    const endY = target.y - uy * (target.radius + 5);
    if (!edge.reciprocal) return `M ${startX} ${startY} L ${endX} ${endY}`;
    const bend = Math.min(20, Math.max(7, distance * 0.055));
    const controlX = (startX + endX) / 2 - uy * bend;
    const controlY = (startY + endY) / 2 + ux * bend;
    return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
  }

  function renderGraph(data) {
    const nodeById = new Map(data.nodes.map((node) => [node.id, node]));
    svg.querySelector('.graph-static-message')?.remove();

    const defs = svgElement('defs');
    const marker = svgElement('marker', {
      id: 'graph-arrow', viewBox: '0 0 8 8', refX: 7, refY: 4,
      markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse', markerUnits: 'strokeWidth',
    });
    marker.append(svgElement('path', { d: 'M 0 0 L 8 4 L 0 8 Z', class: 'graph-arrow-mark' }));
    defs.append(marker);
    svg.append(defs);

    viewport = svgElement('g', { class: 'graph-viewport' });
    const zones = svgElement('g', { class: 'graph-community-zones', 'aria-hidden': 'true' });
    const edgeLayer = svgElement('g', { class: 'graph-edges', 'aria-hidden': 'true' });
    const nodeLayer = svgElement('g', { class: 'graph-nodes' });
    viewport.append(zones, edgeLayer, nodeLayer);
    svg.append(viewport);

    for (const community of data.communities) {
      const group = svgElement('g', {
        class: `graph-community-zone graph-community-${community.colorIndex % 14}`,
        'data-community': community.id,
      });
      group.append(svgElement('ellipse', {
        cx: community.x,
        cy: community.y,
        rx: community.radius * 1.16,
        ry: community.radius * 0.82,
      }));
      const label = svgElement('text', {
        x: community.x - community.radius,
        y: community.y - community.radius * 0.64,
        class: 'graph-community-label',
      });
      label.textContent = `${community.label} · ${community.size}`;
      group.append(label);
      zones.append(group);
      communityElements.set(community.id, group);
    }

    for (const edge of data.edges) {
      const path = svgElement('path', {
        d: edgePath(edge, nodeById),
        class: `graph-edge graph-edge--${edge.kind}${edge.crossCommunity ? ' graph-edge--cross' : ''}`,
        'data-edge': edge.id,
        'vector-effect': 'non-scaling-stroke',
      });
      path.style.setProperty('--graph-edge-weight', edge.weight);
      edgeLayer.append(path);
      edgeElements.set(edge.id, path);
    }

    const degreeCutoff = [...data.nodes].sort((a, b) => b.degree - a.degree)[Math.min(19, data.nodes.length - 1)]?.degree ?? 0;
    for (const node of [...data.nodes].sort((a, b) => a.radius - b.radius || collator.compare(a.title, b.title))) {
      const group = svgElement('g', {
        class: `graph-node graph-node--${node.type} graph-node--${node.verification} graph-community-${node.community % 14}${node.degree >= degreeCutoff || node.type === 'analysis' ? ' has-default-label' : ''}`,
        transform: `translate(${node.x} ${node.y})`,
        'data-node': node.id,
        'aria-hidden': 'true',
      });
      const pathData = shapePath(node.type, node.radius);
      group.append(
        svgElement('path', { d: pathData, class: 'graph-node-registration graph-node-registration--pink', transform: 'translate(3 0)' }),
        svgElement('path', { d: pathData, class: 'graph-node-registration graph-node-registration--cyan', transform: 'translate(-3 0)' }),
        svgElement('path', { d: pathData, class: 'graph-node-mark' }),
        svgElement('path', {
          d: pathData,
          class: 'graph-node-outline',
          'stroke-width': 1.3 + Math.min(4, Math.log2(1 + node.evidenceCount) * 0.72),
        }),
        svgElement('path', { d: pathData, class: 'graph-node-focus-ring', transform: 'scale(1.55)' }),
      );
      const label = svgElement('text', {
        x: 0,
        y: -(node.radius + 7),
        class: 'graph-node-label',
        'text-anchor': 'middle',
      });
      label.textContent = node.title;
      group.append(label);
      const title = svgElement('title');
      title.textContent = `${node.title} · 연결 ${node.degree}개`;
      group.append(title);
      nodeLayer.append(group);
      nodeElements.set(node.id, group);
    }

    applyView();
    updateGraph();
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
    return { visibleNodes, visibleEdges, adjacency };
  }

  function updateGraph() {
    if (!state.data) return;
    const { visibleNodes, visibleEdges, adjacency } = visibleModel();
    if (state.selected && !visibleNodes.has(state.selected)) {
      state.selected = '';
      restoreInspector();
    }
    const visibleEdgeIds = new Set(visibleEdges.map((edge) => edge.id));
    const direct = state.selected && visibleNodes.has(state.selected)
      ? adjacency.get(state.selected) ?? new Set()
      : new Set();
    const second = new Set();
    for (const neighbor of direct) {
      for (const candidate of adjacency.get(neighbor) ?? []) {
        if (candidate !== state.selected && !direct.has(candidate)) second.add(candidate);
      }
    }
    const queryMatches = new Set(state.data.nodes.filter((node) => visibleNodes.has(node.id) && searchMatches(node)).map((node) => node.id));

    for (const node of state.data.nodes) {
      const item = nodeElements.get(node.id);
      const visible = visibleNodes.has(node.id);
      item.toggleAttribute('hidden', !visible);
      item.classList.toggle('is-selected', node.id === state.selected);
      item.classList.toggle('is-neighbor-one', direct.has(node.id));
      item.classList.toggle('is-neighbor-two', second.has(node.id));
      item.classList.toggle('is-search-match', queryMatches.has(node.id));
      item.classList.toggle('is-distant', Boolean(state.selected) && visible && node.id !== state.selected && !direct.has(node.id) && !second.has(node.id));
      item.classList.toggle('is-search-muted', Boolean(state.query) && visible && !queryMatches.has(node.id));
    }

    for (const edge of state.data.edges) {
      const item = edgeElements.get(edge.id);
      const visible = visibleEdgeIds.has(edge.id);
      const touchesSelected = Boolean(state.selected) && (edge.source === state.selected || edge.target === state.selected);
      const isSecond = Boolean(state.selected) && !touchesSelected && (
        (direct.has(edge.source) && second.has(edge.target)) || (direct.has(edge.target) && second.has(edge.source))
      );
      item.toggleAttribute('hidden', !visible);
      item.classList.toggle('is-direct', visible && touchesSelected);
      item.classList.toggle('is-second', visible && isSecond);
      item.classList.toggle('is-distant', visible && Boolean(state.selected) && !touchesSelected && !isSecond);
      item.classList.toggle('is-outgoing', visible && edge.source === state.selected);
      item.classList.toggle('is-incoming', visible && edge.target === state.selected);
      if (visible && touchesSelected) item.setAttribute('marker-end', 'url(#graph-arrow)');
      else item.removeAttribute('marker-end');
    }

    for (const community of state.data.communities) {
      const visibleMembers = state.data.nodes.some((node) => node.community === community.id && visibleNodes.has(node.id));
      communityElements.get(community.id).toggleAttribute('hidden', !visibleMembers);
      communityElements.get(community.id).classList.toggle('is-muted', state.community !== '' && String(community.id) !== String(state.community));
    }

    const relationshipCount = visibleEdges.length;
    const searchMessage = state.query ? `, 검색 일치 ${queryMatches.size}개` : '';
    status.textContent = `문서 ${visibleNodes.size}개와 방향 관계 ${relationshipCount}개 표시${searchMessage}.`;
    if (state.selected) {
      const selectedNode = state.data.nodes.find((node) => node.id === state.selected);
      if (selectedNode) renderInspector(selectedNode);
    }
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

  function renderInspector(node) {
    const community = state.data.communities.find((item) => item.id === node.community);
    const { visibleEdges } = visibleModel();
    const relations = new Map();
    for (const edge of visibleEdges) {
      if (edge.source !== node.id && edge.target !== node.id) continue;
      const neighborId = edge.source === node.id ? edge.target : edge.source;
      const record = relations.get(neighborId) ?? { directions: new Set(), kinds: new Set() };
      record.directions.add(edge.source === node.id ? 'out' : 'in');
      for (const kind of edge.kinds) record.kinds.add(kind);
      relations.set(neighborId, record);
    }
    const outsideNeighborCount = [...relations.keys()].filter((neighborId) => {
      const neighbor = state.data.nodes.find((item) => item.id === neighborId);
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
      .map(([id, record]) => ({ node: state.data.nodes.find((item) => item.id === id), record }))
      .filter((item) => item.node)
      .sort((a, b) => (
        Number(b.record.kinds.has('related')) - Number(a.record.kinds.has('related'))
        || b.node.bridgeConnections - a.node.bridgeConnections
        || collator.compare(a.node.title, b.node.title)
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
  }

  function restoreInspector() {
    inspectorContent.innerHTML = initialInspectorMarkup;
  }

  function selectNode(id, { focusInspector = false } = {}) {
    const node = state.data?.nodes.find((item) => item.id === id);
    if (!node) return;
    state.selected = id;
    updateGraph();
    const { visibleEdges } = visibleModel();
    const neighbors = new Set();
    const outsideNeighbors = new Set();
    for (const edge of visibleEdges) {
      if (edge.source !== id && edge.target !== id) continue;
      const neighborId = edge.source === id ? edge.target : edge.source;
      neighbors.add(neighborId);
      const neighbor = state.data.nodes.find((item) => item.id === neighborId);
      if (neighbor && neighbor.community !== node.community) outsideNeighbors.add(neighborId);
    }
    status.textContent = `${node.title} 선택. 표시 이웃 ${neighbors.size}개, 집단 밖 이웃 ${outsideNeighbors.size}개.`;
    if (focusInspector) inspector.focus({ preventScroll: false });
  }

  function applyView() {
    if (!viewport) return;
    viewport.setAttribute('transform', `translate(${state.view.x} ${state.view.y}) scale(${state.view.scale})`);
  }

  function zoomBy(factor, point) {
    const dimensions = state.data?.dimensions;
    if (!dimensions) return;
    const oldScale = state.view.scale;
    const nextScale = clamp(0.7, 4.2, oldScale * factor);
    const center = point ?? { x: dimensions.width / 2, y: dimensions.height / 2 };
    state.view.x = center.x - (center.x - state.view.x) * (nextScale / oldScale);
    state.view.y = center.y - (center.y - state.view.y) * (nextScale / oldScale);
    state.view.scale = nextScale;
    applyView();
  }

  function resetView() {
    state.view = { x: 0, y: 0, scale: 1 };
    applyView();
  }

  function bindInteractions() {
    svg.addEventListener('click', (event) => {
      const node = event.target.closest('[data-node]');
      if (node) selectNode(node.dataset.node);
    });
    root.addEventListener('click', (event) => {
      const selectButton = event.target.closest('[data-select-node]');
      if (selectButton) selectNode(selectButton.dataset.selectNode, { focusInspector: true });
      const communityButton = event.target.closest('[data-community-filter]');
      if (communityButton) {
        state.community = communityButton.dataset.communityFilter;
        for (const button of root.querySelectorAll('[data-community-filter]')) {
          const active = button === communityButton;
          button.classList.toggle('is-active', active);
          button.setAttribute('aria-pressed', String(active));
        }
        updateGraph();
      }
      const zoomButton = event.target.closest('[data-graph-zoom]');
      if (zoomButton?.dataset.graphZoom === 'in') zoomBy(1.28);
      else if (zoomButton?.dataset.graphZoom === 'out') zoomBy(1 / 1.28);
      else if (zoomButton?.dataset.graphZoom === 'reset') resetView();
    });

    search?.addEventListener('input', () => {
      state.query = normalize(search.value);
      updateGraph();
    });
    controls?.addEventListener('submit', (event) => {
      event.preventDefault();
      const matches = state.data.nodes.filter((node) => nodeMatchesFilters(node) && searchMatches(node))
        .sort((a, b) => collator.compare(a.title, b.title));
      if (matches[0]) selectNode(matches[0].id);
    });
    typeFilter?.addEventListener('change', () => { state.type = typeFilter.value; updateGraph(); });
    verificationFilter?.addEventListener('change', () => { state.verification = verificationFilter.value; updateGraph(); });
    relationFilter?.addEventListener('change', () => { state.relation = relationFilter.value; updateGraph(); });
    controls?.addEventListener('reset', () => window.requestAnimationFrame(() => {
      state.selected = '';
      state.query = '';
      state.type = '';
      state.verification = '';
      state.relation = relationFilter?.value || 'related';
      state.community = '';
      for (const button of root.querySelectorAll('[data-community-filter]')) {
        const active = button.dataset.communityFilter === '';
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      }
      restoreInspector();
      resetView();
      updateGraph();
    }));

    svg.addEventListener('wheel', (event) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const rect = svg.getBoundingClientRect();
      const point = {
        x: (event.clientX - rect.left) * state.data.dimensions.width / rect.width,
        y: (event.clientY - rect.top) * state.data.dimensions.height / rect.height,
      };
      zoomBy(event.deltaY < 0 ? 1.14 : 1 / 1.14, point);
    }, { passive: false });

    let drag;
    svg.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse' || event.target.closest('[data-node]') || event.button !== 0) return;
      drag = { x: event.clientX, y: event.clientY, viewX: state.view.x, viewY: state.view.y };
      svg.classList.add('is-panning');
      svg.setPointerCapture(event.pointerId);
    });
    svg.addEventListener('pointermove', (event) => {
      if (!drag) return;
      const rect = svg.getBoundingClientRect();
      state.view.x = drag.viewX + (event.clientX - drag.x) * state.data.dimensions.width / rect.width;
      state.view.y = drag.viewY + (event.clientY - drag.y) * state.data.dimensions.height / rect.height;
      applyView();
    });
    const stopPanning = (event) => {
      if (!drag) return;
      drag = null;
      svg.classList.remove('is-panning');
      if (svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
    };
    svg.addEventListener('pointerup', stopPanning);
    svg.addEventListener('pointercancel', stopPanning);

    reduceMotion.addEventListener('change', () => root.classList.toggle('reduce-motion', reduceMotion.matches));
    root.classList.toggle('reduce-motion', reduceMotion.matches);
  }

  function fail(error) {
    const message = '연결 지도를 불러오지 못했습니다. 텍스트 목록으로 문서를 탐색할 수 있습니다.';
    const staticMessage = svg.querySelector('.graph-static-message');
    if (staticMessage) staticMessage.textContent = message;
    status.textContent = message;
    stage?.classList.add('has-graph-error');
    console.error(error);
  }

  fetch(graphUrl, { headers: { Accept: 'application/json' } })
    .then((response) => {
      if (!response.ok) throw new Error(`Graph data request failed: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      if (data?.schemaVersion !== 1 || !Array.isArray(data.nodes) || !Array.isArray(data.edges) || !Array.isArray(data.communities)) {
        throw new TypeError('Graph data has an unsupported shape.');
      }
      state.data = data;
      renderGraph(data);
      bindInteractions();
      root.classList.add('is-ready');
    })
    .catch(fail);
})();
