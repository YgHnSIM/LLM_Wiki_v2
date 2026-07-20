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

const tabLabels = {
  recommended: '다음 읽기',
  outgoing: '나가는 관계',
  incoming: '들어오는 관계',
  community: '같은 집단',
};

const normalize = (value) => String(value ?? '')
  .normalize('NFKC')
  .toLocaleLowerCase('ko')
  .replace(/\s+/g, ' ')
  .trim();

function element(name, className = '', text = '') {
  const item = document.createElement(name);
  if (className) item.className = className;
  if (text) item.textContent = text;
  return item;
}

function relationDirection(directions) {
  if (directions.has('in') && directions.has('out')) return 'both';
  return directions.has('out') ? 'out' : 'in';
}

function directionLabel(direction) {
  return {
    in: '이 문서를 가리킴',
    out: '이 문서에서 가리킴',
    both: '서로 가리킴',
  }[direction] ?? '';
}

function kindsForEdge(edge) {
  const kinds = Array.isArray(edge?.kinds) ? edge.kinds : [];
  if (kinds.length) return kinds.filter((kind) => kind === 'related' || kind === 'body');
  if (edge?.kind === 'related') return ['related'];
  if (edge?.kind === 'body') return ['body'];
  if (edge?.kind === 'both') return ['related', 'body'];
  return [];
}

export function createRelationshipIndex(data) {
  if (!Array.isArray(data?.nodes) || !Array.isArray(data?.edges) || !Array.isArray(data?.communities)) {
    throw new TypeError('연결 데이터 형식이 올바르지 않습니다.');
  }
  const nodeById = new Map(data.nodes.map((node) => [node.id, node]));
  const communityById = new Map(data.communities.map((community) => [String(community.id), community]));
  const recordsByNode = new Map(data.nodes.map((node) => [node.id, new Map()]));

  const add = (focusId, neighborId, direction, kinds) => {
    if (!nodeById.has(focusId) || !nodeById.has(neighborId) || focusId === neighborId) return;
    const records = recordsByNode.get(focusId);
    const record = records.get(neighborId) ?? {
      node: nodeById.get(neighborId),
      directions: new Set(),
      kinds: new Set(),
      communityOnly: false,
    };
    record.directions.add(direction);
    for (const kind of kinds) record.kinds.add(kind);
    records.set(neighborId, record);
  };

  for (const edge of data.edges) {
    const kinds = kindsForEdge(edge);
    add(edge.source, edge.target, 'out', kinds);
    add(edge.target, edge.source, 'in', kinds);
  }

  return {
    data,
    nodeById,
    communityById,
    recordsByNode,
  };
}

export function relationshipRecordsFor(index, focusId) {
  return [...(index.recordsByNode.get(focusId)?.values() ?? [])].map((record) => ({
    ...record,
    direction: relationDirection(record.directions),
  }));
}

export function relationshipCounts(records) {
  return {
    total: records.length,
    related: records.filter((record) => record.kinds.has('related')).length,
    body: records.filter((record) => record.kinds.has('body')).length,
    incoming: records.filter((record) => record.directions.has('in')).length,
    outgoing: records.filter((record) => record.directions.has('out')).length,
    mutual: records.filter((record) => record.direction === 'both').length,
  };
}

function verificationRank(value) {
  return {
    verified: 4,
    partial: 3,
    disputed: 2,
    unverified: 1,
  }[value] ?? 0;
}

export function rankRelationshipRecords(records) {
  return [...records].sort((left, right) => (
    Number(right.kinds.has('related')) - Number(left.kinds.has('related'))
    || Number(right.direction === 'both') - Number(left.direction === 'both')
    || Number(right.kinds.has('body')) - Number(left.kinds.has('body'))
    || verificationRank(right.node.verification) - verificationRank(left.node.verification)
    || Number(right.node.bridgeConnections ?? 0) - Number(left.node.bridgeConnections ?? 0)
    || Number(right.node.degree ?? 0) - Number(left.node.degree ?? 0)
    || collator.compare(left.node.title, right.node.title)
  ));
}

export function relationshipRecordsForTab(index, focusId, tab) {
  const focus = index.nodeById.get(focusId);
  if (!focus) return [];
  const direct = relationshipRecordsFor(index, focusId);
  if (tab === 'outgoing') return rankRelationshipRecords(direct.filter((record) => record.directions.has('out')));
  if (tab === 'incoming') return rankRelationshipRecords(direct.filter((record) => record.directions.has('in')));
  if (tab === 'community') {
    const directById = new Map(direct.map((record) => [record.node.id, record]));
    return index.data.nodes
      .filter((node) => node.id !== focus.id && node.community === focus.community)
      .map((node) => directById.get(node.id) ?? {
        node,
        directions: new Set(),
        kinds: new Set(),
        direction: '',
        communityOnly: true,
      })
      .sort((left, right) => (
        Number(!right.communityOnly) - Number(!left.communityOnly)
        || Number(right.kinds.has('related')) - Number(left.kinds.has('related'))
        || Number(right.node.degree ?? 0) - Number(left.node.degree ?? 0)
        || collator.compare(left.node.title, right.node.title)
      ));
  }
  return rankRelationshipRecords(direct);
}

export function relationshipRecordLabel(record) {
  if (record.communityOnly) return '같은 연결 집단';
  const related = record.kinds.has('related');
  const body = record.kinds.has('body');
  const basis = related && body ? '편집 관계 + 본문 링크' : related ? '편집 관계' : '본문 링크';
  return `${basis} · ${directionLabel(record.direction)}`;
}

function loadHistory(index, initialId) {
  let ids = [];
  try {
    ids = JSON.parse(sessionStorage.getItem('llmwiki-relationship-history') ?? '[]');
  } catch {
    ids = [];
  }
  ids = Array.isArray(ids) ? ids.filter((id) => index.nodeById.has(id)).slice(-12) : [];
  if (initialId && ids.at(-1) !== initialId) ids.push(initialId);
  return ids.slice(-12);
}

function saveHistory(ids) {
  try {
    sessionStorage.setItem('llmwiki-relationship-history', JSON.stringify(ids.slice(-12)));
  } catch {
    // The explorer remains usable when session storage is unavailable.
  }
}

const graphRequests = new Map();

function loadGraph(url) {
  if (graphRequests.has(url)) return graphRequests.get(url);
  const request = fetch(url, { headers: { Accept: 'application/json' } })
    .then((response) => {
      if (!response.ok) throw new Error(`연결 데이터를 불러오지 못했습니다: ${response.status}`);
      return response.json();
    })
    .catch((error) => {
      graphRequests.delete(url);
      throw error;
    });
  graphRequests.set(url, request);
  return request;
}

class RelationshipExplorer {
  constructor(root, data) {
    this.root = root;
    this.context = root.dataset.relationshipContext || 'article';
    this.root.id ||= `relationship-explorer-${this.context}`;
    this.index = createRelationshipIndex(data);
    const urlFocus = this.context === 'graph' ? new URL(window.location.href).searchParams.get('focus') : '';
    const initialId = this.index.nodeById.has(urlFocus)
      ? urlFocus
      : this.index.nodeById.has(root.dataset.focusId) ? root.dataset.focusId : '';
    this.focusId = initialId;
    this.tab = 'recommended';
    this.limit = 6;
    this.communityLimit = 12;
    this.communityId = null;
    this.showAllCommunities = false;
    this.query = '';
    this.history = loadHistory(this.index, initialId);
    this.root.addEventListener('click', (event) => this.handleClick(event));
    this.root.addEventListener('submit', (event) => this.handleSubmit(event));
    this.render();
  }

  updateUrl() {
    if (this.context !== 'graph') return;
    const url = new URL(window.location.href);
    if (this.focusId) url.searchParams.set('focus', this.focusId);
    else url.searchParams.delete('focus');
    if (this.communityId !== null) url.searchParams.set('community', String(this.communityId));
    else url.searchParams.delete('community');
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }

  focus(id, { fromHistory = false } = {}) {
    if (!this.index.nodeById.has(id)) return;
    this.focusId = id;
    this.communityId = null;
    this.query = '';
    this.tab = 'recommended';
    this.limit = 6;
    if (!fromHistory && this.history.at(-1) !== id) this.history.push(id);
    this.history = this.history.slice(-12);
    saveHistory(this.history);
    this.updateUrl();
    this.render();
    const focusCard = this.root.querySelector('.relationship-explorer__focus');
    if (this.context === 'article') {
      this.root.scrollTop = 0;
      focusCard?.focus({ preventScroll: true });
    } else {
      focusCard?.focus();
    }
  }

  openCommunity(id) {
    if (!this.index.communityById.has(String(id))) return;
    this.communityId = Number(id);
    this.focusId = '';
    this.query = '';
    this.communityLimit = 12;
    this.updateUrl();
    this.render();
  }

  handleClick(event) {
    const focusButton = event.target.closest('[data-relationship-focus]');
    if (focusButton) {
      this.focus(focusButton.dataset.relationshipFocus);
      return;
    }
    const historyButton = event.target.closest('[data-relationship-history-index]');
    if (historyButton) {
      const index = Number(historyButton.dataset.relationshipHistoryIndex);
      const id = this.history[index];
      if (!id) return;
      this.history = this.history.slice(0, index + 1);
      saveHistory(this.history);
      this.focus(id, { fromHistory: true });
      return;
    }
    const tabButton = event.target.closest('[data-relationship-tab]');
    if (tabButton) {
      this.tab = tabButton.dataset.relationshipTab;
      this.limit = 6;
      this.render();
      return;
    }
    const limitButton = event.target.closest('[data-relationship-limit]');
    if (limitButton) {
      this.limit = this.limit === Infinity ? 6 : Infinity;
      this.render();
      return;
    }
    const communityButton = event.target.closest('[data-relationship-community]');
    if (communityButton) {
      this.openCommunity(communityButton.dataset.relationshipCommunity);
      return;
    }
    if (event.target.closest('[data-relationship-all-communities]')) {
      this.showAllCommunities = !this.showAllCommunities;
      this.render();
      return;
    }
    if (event.target.closest('[data-relationship-community-limit]')) {
      this.communityLimit = this.communityLimit === Infinity ? 12 : Infinity;
      this.render();
      return;
    }
    if (event.target.closest('[data-relationship-home]')) {
      this.focusId = '';
      this.communityId = null;
      this.query = '';
      this.updateUrl();
      this.render();
    }
  }

  handleSubmit(event) {
    const form = event.target.closest('[data-relationship-search]');
    if (!form) return;
    event.preventDefault();
    this.query = String(new FormData(form).get('q') ?? '').trim();
    this.focusId = '';
    this.communityId = null;
    this.render();
  }

  renderSearch() {
    const form = element('form', 'relationship-search');
    form.dataset.relationshipSearch = '';
    form.setAttribute('role', 'search');
    const id = `${this.root.id || 'relationship-explorer'}-search`;
    const label = element('label', '', '문서 찾기');
    label.htmlFor = id;
    const row = element('div', 'relationship-search__row');
    const input = element('input');
    input.id = id;
    input.name = 'q';
    input.type = 'search';
    input.autocomplete = 'off';
    input.value = this.query;
    input.placeholder = '제목 또는 별칭';
    const submit = element('button', '', '찾기');
    submit.type = 'submit';
    row.append(input, submit);
    form.append(label, row);
    return form;
  }

  renderMasthead() {
    const focus = this.index.nodeById.get(this.focusId);
    const header = element('header', 'relationship-explorer__masthead');
    const folio = element('span', 'relationship-explorer__folio');
    folio.setAttribute('aria-hidden', 'true');
    folio.textContent = focus
      ? String(Math.max(1, this.history.lastIndexOf(focus.id) + 1)).padStart(2, '0')
      : String(this.index.data.stats?.nodes ?? this.index.data.nodes.length).padStart(2, '0');
    const copy = element('div', 'relationship-explorer__masthead-copy');
    copy.append(element('p', '', '연결 탐색'));
    const heading = element(this.context === 'graph' ? 'h1' : 'h2', '', focus?.title ?? '지식 연결');
    copy.append(heading);
    const summary = focus
      ? `${typeLabels[focus.type] ?? focus.type} · ${verificationLabels[focus.verification] ?? focus.verification}`
      : `문서 ${this.index.data.stats?.nodes ?? this.index.data.nodes.length}개 · 연결 집단 ${this.index.data.communities.length}개`;
    copy.append(element('p', 'relationship-explorer__summary', summary));
    header.append(folio, copy);
    return header;
  }

  renderHistory() {
    const valid = this.history.filter((id) => this.index.nodeById.has(id)).slice(-4);
    if (valid.length < 2) return null;
    const nav = element('nav', 'relationship-history');
    nav.setAttribute('aria-label', '방문 경로');
    nav.append(element('p', '', '방문 경로'));
    const list = element('ol');
    const offset = this.history.length - valid.length;
    valid.forEach((id, index) => {
      const node = this.index.nodeById.get(id);
      const item = element('li');
      const button = element('button', '', node.title);
      button.type = 'button';
      button.dataset.relationshipHistoryIndex = String(offset + index);
      if (id === this.focusId) {
        button.disabled = true;
        button.setAttribute('aria-current', 'page');
      }
      item.append(button);
      list.append(item);
    });
    nav.append(list);
    return nav;
  }

  renderFocus() {
    const node = this.index.nodeById.get(this.focusId);
    if (!node) return this.renderHome();
    const records = relationshipRecordsFor(this.index, node.id);
    const counts = relationshipCounts(records);
    const fragment = document.createDocumentFragment();
    const focus = element('article', 'relationship-explorer__focus');
    focus.tabIndex = -1;
    const community = this.index.communityById.get(String(node.community));
    const metadata = element('p', 'relationship-explorer__focus-meta', [
      typeLabels[node.type] ?? node.type,
      verificationLabels[node.verification] ?? node.verification,
      community?.label,
    ].filter(Boolean).join(' · '));
    const title = element('h3', '', node.title);
    const excerpt = element('p', 'relationship-explorer__excerpt', node.excerpt);
    const metrics = element('dl', 'relationship-metrics');
    for (const [term, value] of [
      ['직접 연결', counts.total],
      ['편집 관계', counts.related],
      ['본문 링크', counts.body],
    ]) {
      const group = element('div');
      group.append(element('dt', '', term), element('dd', '', String(value)));
      metrics.append(group);
    }
    const note = element('p', 'relationship-metrics__note', '편집 관계와 본문 링크는 한 문서에 함께 적용될 수 있습니다.');
    const actions = element('div', 'relationship-explorer__focus-actions');
    const documentLink = element('a', '', '문서 읽기');
    documentLink.href = node.url;
    const homeButton = element('button', '', '전체 집단');
    homeButton.type = 'button';
    homeButton.dataset.relationshipHome = '';
    actions.append(documentLink, homeButton);
    focus.append(metadata, title, excerpt, metrics, note, actions);
    fragment.append(focus);

    const history = this.renderHistory();
    if (history) fragment.append(history);

    const tabs = element('div', 'relationship-tabs');
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', '연결 보기');
    const panelId = `${this.root.id}-panel`;
    for (const [id, label] of Object.entries(tabLabels)) {
      const button = element('button', '', label);
      button.type = 'button';
      button.id = `${this.root.id}-tab-${id}`;
      button.dataset.relationshipTab = id;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', String(this.tab === id));
      button.setAttribute('aria-controls', panelId);
      tabs.append(button);
    }
    fragment.append(tabs);

    const recordsForTab = relationshipRecordsForTab(this.index, node.id, this.tab);
    const section = element('section', 'relationship-results');
    section.id = panelId;
    section.setAttribute('role', 'tabpanel');
    section.setAttribute('aria-labelledby', `${this.root.id}-tab-${this.tab}`);
    const headingRow = element('header', 'relationship-results__header');
    headingRow.append(element('h3', '', tabLabels[this.tab]), element('span', '', `${recordsForTab.length}개`));
    section.append(headingRow);
    if (!recordsForTab.length) {
      section.append(element('p', 'relationship-results__empty', '이 조건에 맞는 공개 문서가 없습니다.'));
    } else {
      section.append(this.renderRecordList(recordsForTab.slice(0, this.limit)));
      if (recordsForTab.length > 6) {
        const limit = element('button', 'relationship-results__limit', this.limit === Infinity ? '6개만 보기' : `${recordsForTab.length}개 모두 보기`);
        limit.type = 'button';
        limit.dataset.relationshipLimit = '';
        section.append(limit);
      }
    }
    fragment.append(section);
    return fragment;
  }

  renderRecordList(records) {
    const list = element('ol', 'relationship-list');
    records.forEach((record, index) => {
      const item = element('li', 'relationship-list__item');
      const number = element('span', 'relationship-list__index', String(index + 1).padStart(2, '0'));
      number.setAttribute('aria-hidden', 'true');
      const copy = element('div', 'relationship-list__copy');
      const meta = element('p', '', `${typeLabels[record.node.type] ?? record.node.type} · ${verificationLabels[record.node.verification] ?? record.node.verification}`);
      const select = element('button', 'relationship-list__select', record.node.title);
      select.type = 'button';
      select.dataset.relationshipFocus = record.node.id;
      const relation = element('p', 'relationship-list__relation', relationshipRecordLabel(record));
      copy.append(meta, select, relation);
      const link = element('a', 'relationship-list__open', '문서 읽기');
      link.href = record.node.url;
      item.append(number, copy, link);
      list.append(item);
    });
    return list;
  }

  representativeNodes(communities) {
    return communities.map((community) => this.index.data.nodes
      .filter((node) => node.community === community.id)
      .sort((left, right) => (
        Number(right.degree ?? 0) - Number(left.degree ?? 0)
        || Number(right.bridgeConnections ?? 0) - Number(left.bridgeConnections ?? 0)
        || collator.compare(left.title, right.title)
      ))[0]).filter(Boolean);
  }

  renderHome() {
    const fragment = document.createDocumentFragment();
    const communities = this.index.data.communities;
    const visible = this.showAllCommunities ? communities : communities.slice(0, 6);
    const section = element('section', 'relationship-communities');
    const heading = element('header', 'relationship-results__header');
    heading.append(element('h2', '', '연결 집단'), element('span', '', `${communities.length}개`));
    section.append(heading);
    const list = element('ol', 'relationship-community-list');
    visible.forEach((community, index) => {
      const item = element('li');
      const button = element('button');
      button.type = 'button';
      button.dataset.relationshipCommunity = String(community.id);
      button.append(
        element('span', 'relationship-community-list__index', String(index + 1).padStart(2, '0')),
        element('strong', '', community.label),
        element('span', '', `문서 ${community.size}개`),
      );
      item.append(button);
      list.append(item);
    });
    section.append(list);
    if (communities.length > 6) {
      const toggle = element('button', 'relationship-results__limit', this.showAllCommunities ? '6개만 보기' : `${communities.length}개 모두 보기`);
      toggle.type = 'button';
      toggle.dataset.relationshipAllCommunities = '';
      section.append(toggle);
    }
    fragment.append(section);

    const representatives = this.representativeNodes(communities.slice(0, 6));
    const start = element('section', 'relationship-representatives');
    const startHeading = element('header', 'relationship-results__header');
    startHeading.append(element('h2', '', '집단별 대표 문서'), element('span', '', `${representatives.length}개`));
    start.append(startHeading, this.renderRecordList(representatives.map((node) => ({
      node,
      directions: new Set(),
      kinds: new Set(),
      direction: '',
      communityOnly: true,
    }))));
    fragment.append(start);
    return fragment;
  }

  renderCommunity() {
    const community = this.index.communityById.get(String(this.communityId));
    if (!community) return this.renderHome();
    const members = this.index.data.nodes
      .filter((node) => node.community === community.id)
      .sort((left, right) => (
        Number(right.degree ?? 0) - Number(left.degree ?? 0)
        || collator.compare(left.title, right.title)
      ));
    const fragment = document.createDocumentFragment();
    const header = element('section', 'relationship-community-focus');
    const home = element('button', '', '모든 연결 집단');
    home.type = 'button';
    home.dataset.relationshipHome = '';
    header.append(home, element('p', '', `문서 ${community.size}개 · 집단 밖 연결 ${community.crossEdges}개`), element('h2', '', community.label));
    fragment.append(header, this.renderRecordList(members.slice(0, this.communityLimit).map((node) => ({
      node,
      directions: new Set(),
      kinds: new Set(),
      direction: '',
      communityOnly: true,
    }))));
    if (members.length > 12) {
      const limit = element('button', 'relationship-results__limit', this.communityLimit === Infinity ? '12개만 보기' : `${members.length}개 모두 보기`);
      limit.type = 'button';
      limit.dataset.relationshipCommunityLimit = '';
      fragment.append(limit);
    }
    return fragment;
  }

  renderSearchResults() {
    const terms = normalize(this.query).split(' ').filter(Boolean);
    const matches = terms.length ? this.index.data.nodes
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
      .sort((left, right) => right.score - left.score || collator.compare(left.node.title, right.node.title))
      .slice(0, 12) : [];
    const section = element('section', 'relationship-search-results');
    const heading = element('header', 'relationship-results__header');
    heading.append(element('h2', '', '검색 결과'), element('span', '', `${matches.length}개`));
    section.append(heading);
    if (!matches.length) section.append(element('p', 'relationship-results__empty', '제목이나 별칭이 일치하는 문서가 없습니다.'));
    else section.append(this.renderRecordList(matches.map(({ node }) => ({
      node,
      directions: new Set(),
      kinds: new Set(),
      direction: '',
      communityOnly: true,
    }))));
    return section;
  }

  render() {
    this.root.replaceChildren();
    this.root.classList.add('is-ready');
    this.root.append(this.renderMasthead(), this.renderSearch());
    if (this.query) this.root.append(this.renderSearchResults());
    else if (this.communityId !== null) this.root.append(this.renderCommunity());
    else if (this.focusId) this.root.append(this.renderFocus());
    else this.root.append(this.renderHome());
  }
}

function bindRelationshipDialogs() {
  const dialog = document.querySelector('[data-relationship-dialog]');
  if (!dialog) return;
  for (const trigger of document.querySelectorAll('[data-open-relationship-dialog]')) {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      if (!dialog.open) dialog.showModal();
      dialog.querySelector('[data-close-relationship-dialog]')?.focus();
    });
  }
  dialog.querySelector('[data-close-relationship-dialog]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}

export async function initializeRelationshipExplorers() {
  bindRelationshipDialogs();
  const roots = [...document.querySelectorAll('[data-relationship-explorer]')];
  await Promise.all(roots.map(async (root) => {
    try {
      const data = await loadGraph(root.dataset.graphUrl);
      new RelationshipExplorer(root, data);
    } catch (error) {
      root.replaceChildren(element('p', 'relationship-results__empty', '연결 데이터를 불러오지 못했습니다. 지식 그래프나 검색을 이용해 주세요.'));
      console.error(error);
    }
  }));
}

if (typeof document !== 'undefined') void initializeRelationshipExplorers();
