import {
  DIRECTORY_PAGE_SIZE,
  SEARCH_PAGE_SIZE,
  cleanDisplayAliases,
  comparePublicationYears,
  hasSearchScope,
  nextPageSize,
  normalizeText,
  parseUiState,
  publicationDecade,
  remainingCount,
  serializeUiState,
} from './ui-state.js';

const normalize = normalizeText;

const asArray = (value) => (Array.isArray(value) ? value : []);
const collator = new Intl.Collator('ko', { numeric: true, sensitivity: 'base' });

function debounce(callback, delay = 160) {
  let timer;
  const debounced = (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => callback(...args), delay);
  };
  debounced.cancel = () => window.clearTimeout(timer);
  return debounced;
}

function sitePath(pathname) {
  const basePath = String(document.body?.dataset.basePath ?? '').replace(/^\/+|\/+$/g, '');
  const path = `/${String(pathname).replace(/^\/+/, '')}`;
  return basePath ? `/${basePath}${path}` : path;
}

function searchPageUrl(query, source) {
  const target = source?.dataset.searchPageUrl || sitePath('/search/');
  const url = new URL(target, window.location.href);
  const value = String(query ?? '').trim();
  if (value) url.searchParams.set('q', value);
  else url.searchParams.delete('q');
  return `${url.pathname}${url.search}${url.hash}`;
}

/* Mobile navigation */
const menuButton = document.querySelector('[data-menu-toggle]');
const primaryNav = document.querySelector('#primary-nav');

if (menuButton && primaryNav) {
  const isOpen = () => primaryNav.classList.contains('is-open');
  const closeMenu = ({ restoreFocus = false } = {}) => {
    if (!isOpen()) return;
    primaryNav.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    if (restoreFocus) menuButton.focus();
  };
  const openMenu = () => {
    primaryNav.classList.add('is-open');
    menuButton.setAttribute('aria-expanded', 'true');
    window.requestAnimationFrame(() => {
      primaryNav.querySelector('a[href], input:not([disabled]), button:not([disabled]), select:not([disabled])')?.focus();
    });
  };

  menuButton.addEventListener('click', () => {
    if (isOpen()) closeMenu();
    else openMenu();
  });

  primaryNav.addEventListener('click', (event) => {
    if (event.target.closest('a[href]')) closeMenu();
  });

  document.addEventListener('click', (event) => {
    if (!primaryNav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      event.preventDefault();
      closeMenu({ restoreFocus: true });
    }
  });

  window.addEventListener('resize', () => {
    closeMenu({ restoreFocus: primaryNav.contains(document.activeElement) });
  }, { passive: true });
}

/* Shared search index and ranking */
const searchIndexPromises = new Map();
const normalizedSearchEntries = new WeakMap();

function getSearchIndex(url) {
  if (!url) return Promise.reject(new Error('검색 색인 주소가 없습니다.'));
  if (searchIndexPromises.has(url)) return searchIndexPromises.get(url);

  const request = fetch(url, { headers: { Accept: 'application/json' } })
    .then((response) => {
      if (!response.ok) throw new Error(`검색 색인을 불러오지 못했습니다: ${response.status}`);
      return response.json();
    })
    .then((payload) => {
      const entries = Array.isArray(payload) ? payload : payload?.entries;
      if (!Array.isArray(entries)) throw new TypeError('검색 색인 형식이 올바르지 않습니다.');
      return entries;
    })
    .catch((error) => {
      if (searchIndexPromises.get(url) === request) searchIndexPromises.delete(url);
      throw error;
    });

  searchIndexPromises.set(url, request);
  return request;
}

function normalizedSearchEntry(entry) {
  if (normalizedSearchEntries.has(entry)) return normalizedSearchEntries.get(entry);
  const prepared = {
    title: normalize(entry.title),
    aliases: normalize(asArray(entry.aliases).join(' ')),
    tags: normalize(asArray(entry.tags).join(' ')),
    excerpt: normalize(entry.excerpt),
    text: normalize(entry.text),
  };
  prepared.haystack = [
    prepared.title,
    prepared.aliases,
    normalize(entry.category),
    prepared.tags,
    prepared.excerpt,
    prepared.text,
  ].join(' ');
  normalizedSearchEntries.set(entry, prepared);
  return prepared;
}

function rankEntries(index, query, { requireQuery = false } = {}) {
  const terms = normalize(query).split(' ').filter(Boolean);
  if (requireQuery && !terms.length) return [];

  return index.map((entry, order) => {
    const {
      title, aliases, tags, excerpt, text, haystack,
    } = normalizedSearchEntry(entry);
    if (!terms.every((term) => haystack.includes(term))) return null;

    let score = 0;
    for (const term of terms) {
      if (title === term) score += 180;
      else if (title.startsWith(term)) score += 120;
      else if (title.includes(term)) score += 90;
      if (aliases.includes(term)) score += 55;
      if (tags.includes(term)) score += 30;
      if (excerpt.includes(term)) score += 18;
      if (text.includes(term)) score += 5;
    }
    return { entry, score, order };
  })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || collator.compare(a.entry.title, b.entry.title));
}

function verificationLabel(value) {
  return {
    verified: '검증됨',
    partial: '부분 검증',
    disputed: '이견 중',
    unverified: '미검증',
  }[value] ?? value ?? '';
}

function appendStatus(container, text, { visuallyHidden = false, live = true } = {}) {
  const status = document.createElement('p');
  status.className = visuallyHidden ? 'sr-only' : 'search-message';
  if (live) {
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
  }
  status.textContent = text;
  container.append(status);
  return status;
}

/* Search autocomplete */
for (const form of document.querySelectorAll('[data-site-search]')) {
  const input = form.querySelector('input[type="search"]');
  const results = form.querySelector('.search-results');
  const externalStatus = form.querySelector('[data-search-status]');
  const indexUrl = form.dataset.indexUrl;
  if (!input || !results || !indexUrl) continue;

  results.setAttribute('role', 'listbox');
  results.setAttribute('aria-label', '검색 자동완성 결과');
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  let requestNumber = 0;
  let currentResults = [];
  let activeIndex = -1;

  const announce = (message) => {
    if (externalStatus) externalStatus.textContent = message;
  };
  const openResults = () => {
    results.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  };
  const closeResults = ({ invalidate = true } = {}) => {
    if (invalidate) requestNumber += 1;
    currentResults = [];
    activeIndex = -1;
    results.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    announce('');
  };
  const showLoading = () => {
    results.replaceChildren();
    appendStatus(results, '검색 중…', { live: !externalStatus });
    announce('검색 중입니다.');
    openResults();
  };
  const renderResults = (ranked, query) => {
    results.replaceChildren();
    currentResults = ranked.map(({ entry }) => entry);
    activeIndex = -1;
    const total = currentResults.length;
    announce(total ? `총 ${total}개 문서를 찾았습니다.` : '일치하는 문서가 없습니다.');

    if (!total) {
      appendStatus(results, '일치하는 문서가 없습니다.', { live: !externalStatus });
      openResults();
      return;
    }

    appendStatus(results, `총 ${total}개 문서`, { visuallyHidden: true, live: !externalStatus });
    for (const [index, entry] of currentResults.slice(0, 8).entries()) {
      const link = document.createElement('a');
      link.className = 'search-result';
      link.href = entry.url;
      link.id = `${input.id}-option-${index}`;
      link.setAttribute('role', 'option');
      link.setAttribute('aria-selected', 'false');

      const meta = document.createElement('span');
      meta.textContent = [entry.category, entry.verificationLabel || verificationLabel(entry.verification)]
        .filter(Boolean).join(' · ');
      const title = document.createElement('strong');
      title.textContent = entry.title;
      const excerpt = document.createElement('p');
      excerpt.textContent = entry.excerpt;
      link.append(meta, title, excerpt);
      results.append(link);
    }

    const allResults = document.createElement('a');
    allResults.className = 'search-all-results';
    allResults.href = searchPageUrl(query, form);
    allResults.id = `${input.id}-option-all`;
    allResults.setAttribute('role', 'option');
    allResults.setAttribute('aria-selected', 'false');
    allResults.textContent = `전체 ${total}개 결과 보기`;
    results.append(allResults);
    openResults();
  };

  const options = () => [...results.querySelectorAll('[role="option"]')];
  const setActiveOption = (index) => {
    const items = options();
    if (!items.length) return;
    activeIndex = Math.max(-1, Math.min(index, items.length - 1));
    for (const [itemIndex, item] of items.entries()) {
      const active = itemIndex === activeIndex;
      item.setAttribute('aria-selected', String(active));
      item.classList.toggle('is-active', active);
    }
    if (activeIndex < 0) input.removeAttribute('aria-activedescendant');
    else input.setAttribute('aria-activedescendant', items[activeIndex].id);
  };
  const moveActiveOption = (delta) => {
    const items = options();
    if (!items.length) return;
    const next = activeIndex < 0
      ? (delta > 0 ? 0 : items.length - 1)
      : (activeIndex + delta + items.length) % items.length;
    setActiveOption(next);
    items[next].scrollIntoView({ block: 'nearest' });
  };

  const runSearch = async (query, thisRequest) => {
    try {
      const index = await getSearchIndex(indexUrl);
      if (thisRequest !== requestNumber || input.value.trim() !== query) return;
      renderResults(rankEntries(index, query, { requireQuery: true }), query);
    } catch {
      if (thisRequest !== requestNumber) return;
      currentResults = [];
      results.replaceChildren();
      appendStatus(results, '검색 색인을 불러오지 못했습니다. 다시 입력해 주세요.', { live: !externalStatus });
      announce('검색 색인을 불러오지 못했습니다. 다시 입력해 주세요.');
      openResults();
    }
  };

  const scheduleSearch = debounce(runSearch);
  const beginSearch = ({ immediate = false } = {}) => {
    scheduleSearch.cancel();
    requestNumber += 1;
    const thisRequest = requestNumber;
    const query = input.value.trim();
    currentResults = [];
    if (!query) {
      closeResults({ invalidate: false });
      return;
    }
    showLoading();
    if (immediate) runSearch(query, thisRequest);
    else scheduleSearch(query, thisRequest);
  };

  input.addEventListener('input', () => beginSearch());
  input.addEventListener('focus', () => {
    if (input.value.trim() && results.hidden) beginSearch({ immediate: true });
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeResults();
      input.focus();
    } else if (event.key === 'ArrowDown' && !results.hidden) {
      event.preventDefault();
      moveActiveOption(1);
    } else if (event.key === 'ArrowUp' && !results.hidden) {
      event.preventDefault();
      moveActiveOption(-1);
    } else if (event.key === 'Home' && !results.hidden) {
      event.preventDefault();
      setActiveOption(0);
    } else if (event.key === 'End' && !results.hidden) {
      event.preventDefault();
      setActiveOption(options().length - 1);
    } else if (event.key === 'Enter' && activeIndex >= 0 && !results.hidden) {
      const item = options()[activeIndex];
      if (item) {
        event.preventDefault();
        window.location.assign(item.href);
      }
    }
  });

  results.addEventListener('mousemove', (event) => {
    const option = event.target.closest('[role="option"]');
    if (!option) return;
    setActiveOption(options().indexOf(option));
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    window.location.assign(searchPageUrl(input.value, form));
  });

  document.addEventListener('click', (event) => {
    if (!form.contains(event.target)) closeResults();
  });
}

/* Full search page */
const searchPage = document.querySelector('[data-search-page]');

if (searchPage) {
  const input = searchPage.querySelector('[data-search-page-input]');
  const category = searchPage.querySelector('[data-search-filter-category]');
  const verification = searchPage.querySelector('[data-search-filter-verification]');
  const tag = searchPage.querySelector('[data-search-filter-tag]');
  const sort = searchPage.querySelector('[data-search-sort]');
  const results = document.querySelector('[data-search-page-results]');
  const status = document.querySelector('[data-search-page-status]');
  const indexUrl = searchPage.dataset.indexUrl || sitePath('/search-index.json');

  if (input && results && status) {
    let requestNumber = 0;
    let rankedResults = [];
    let shownCount = SEARCH_PAGE_SIZE;

    const setSelectFromUrl = (control, value, fallback = '') => {
      if (!control) return;
      const wanted = value ?? fallback;
      control.value = [...control.options].some((option) => option.value === wanted) ? wanted : fallback;
    };
    const readUrl = () => {
      const state = parseUiState(window.location.search);
      input.value = state.q;
      setSelectFromUrl(category, state.category);
      setSelectFromUrl(verification, state.verification);
      setSelectFromUrl(tag, state.tag);
      setSelectFromUrl(sort, state.sort, 'relevance');
    };
    const syncUrl = () => {
      const url = new URL(window.location.href);
      const params = serializeUiState({
        q: input.value.trim(),
        category: category?.value,
        verification: verification?.value,
        tag: tag?.value,
        sort: sort?.value,
      });
      for (const key of ['q', 'category', 'verification', 'tag', 'sort']) url.searchParams.delete(key);
      for (const [key, value] of params.entries()) url.searchParams.set(key, value);
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    };
    const matchesChoice = (selected, values) => {
      if (!selected) return true;
      const target = normalize(selected);
      return values.some((value) => normalize(value) === target);
    };
    const numericValue = (value) => Number.parseFloat(value) || 0;
    const dateValue = (value) => Date.parse(value) || 0;
    const sortRanked = (ranked) => {
      const mode = sort?.value || 'relevance';
      const list = [...ranked];
      if (mode === 'title') list.sort((a, b) => collator.compare(a.entry.title, b.entry.title));
      else if (mode === 'updated') list.sort((a, b) => dateValue(b.entry.updated) - dateValue(a.entry.updated) || collator.compare(a.entry.title, b.entry.title));
      else if (mode === 'evidence') list.sort((a, b) => numericValue(b.entry.evidenceCount ?? b.entry.evidence?.length) - numericValue(a.entry.evidenceCount ?? a.entry.evidence?.length) || collator.compare(a.entry.title, b.entry.title));
      return list;
    };
    const appendHighlighted = (element, text, query) => {
      const rawTerms = [...new Set(String(query).trim().split(/\s+/).filter(Boolean))]
        .sort((a, b) => b.length - a.length)
        .slice(0, 20);
      if (!rawTerms.length) {
        element.textContent = text;
        return;
      }
      const escaped = rawTerms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const expression = new RegExp(`(${escaped.join('|')})`, 'giu');
      for (const part of String(text ?? '').split(expression)) {
        if (!part) continue;
        if (rawTerms.some((term) => normalize(term) === normalize(part))) {
          const mark = document.createElement('mark');
          mark.textContent = part;
          element.append(mark);
        } else element.append(document.createTextNode(part));
      }
    };
    const loadMore = searchPage.querySelector('[data-search-load-more]') || (() => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'search-load-more';
      button.dataset.searchLoadMore = '';
      button.textContent = '더 보기';
      results.after(button);
      return button;
    })();
    const updateFilterSummary = () => {
      const active = [input.value, category?.value, verification?.value, tag?.value]
        .filter((value) => normalize(value)).length;
      const filterCount = searchPage.querySelector('[data-search-filter-count]');
      if (filterCount) filterCount.textContent = active ? `${active}개 적용` : '';
      const panel = searchPage.querySelector('[data-search-filter-panel]');
      if (panel && window.matchMedia('(max-width: 620px)').matches && !active) panel.open = false;
    };
    const renderPageResults = (ranked) => {
      results.replaceChildren();
      const query = input.value.trim();
      const scoped = hasSearchScope({
        q: query,
        category: category?.value,
        verification: verification?.value,
        tag: tag?.value,
      });
      if (!scoped) {
        const empty = document.createElement('p');
        empty.className = 'search-message search-message--entry';
        empty.textContent = '검색어나 필터를 입력하면 결과가 표시됩니다.';
        results.append(empty);
        loadMore.hidden = true;
        status.textContent = '검색어나 필터를 입력하면 결과가 표시됩니다.';
        updateFilterSummary();
        return;
      }
      if (!ranked.length) {
        const empty = document.createElement('p');
        empty.className = 'search-message';
        empty.textContent = '조건에 맞는 문서가 없습니다.';
        results.append(empty);
        status.textContent = '검색 결과 0개';
        loadMore.hidden = true;
        updateFilterSummary();
        return;
      }

      const visible = ranked.slice(0, shownCount);
      for (const { entry } of visible) {
        const card = document.createElement('article');
        card.className = 'search-result-card';
        const meta = document.createElement('div');
        meta.className = 'card-meta';
        const categoryText = document.createElement('span');
        categoryText.textContent = entry.category;
        meta.append(categoryText);
        if (entry.publicationLabel) {
          const publication = document.createElement('span');
          publication.className = 'card-publication';
          publication.textContent = entry.publicationLabel;
          meta.append(publication);
        }
        const verificationText = entry.verificationLabel || verificationLabel(entry.verification);
        if (verificationText) {
          const badge = document.createElement('span');
          badge.className = `verification-badge verification-badge--${entry.verification || 'unknown'}`;
          if (entry.verification) badge.dataset.verification = entry.verification;
          badge.textContent = verificationText;
          meta.append(badge);
        }
        const heading = document.createElement('h2');
        const link = document.createElement('a');
        link.className = 'search-result-card__link';
        link.href = entry.url;
        appendHighlighted(link, entry.title, query);
        heading.append(link);
        const excerpt = document.createElement('p');
        excerpt.className = 'result-excerpt';
        appendHighlighted(excerpt, entry.excerpt, query);
        card.append(meta, heading, excerpt);

        if (asArray(entry.tags).length) {
          const tags = document.createElement('ul');
          tags.className = 'tag-list';
          tags.setAttribute('aria-label', '태그');
          for (const [index, item] of entry.tags.entries()) {
            const listItem = document.createElement('li');
            const label = document.createElement('a');
            label.className = 'tag-chip';
            label.textContent = item;
            const targetUrl = new URL(sitePath('/search/'), window.location.origin);
            targetUrl.searchParams.set('tag', asArray(entry.tagKeys)[index] || item);
            label.href = `${targetUrl.pathname}${targetUrl.search}`;
            listItem.append(label);
            tags.append(listItem);
          }
          card.append(tags);
        }
        results.append(card);
      }
      const remaining = remainingCount(visible.length, ranked.length);
      loadMore.hidden = remaining === 0;
      loadMore.textContent = remaining ? `더 보기 · ${Math.min(SEARCH_PAGE_SIZE, remaining)}개` : '모든 결과를 표시했습니다.';
      status.textContent = `검색 결과 ${ranked.length}개 중 ${visible.length}개 표시`;
      updateFilterSummary();
    };
    const applySearch = async ({ updateUrl = true } = {}) => {
      requestNumber += 1;
      const thisRequest = requestNumber;
      if (updateUrl) syncUrl();
      shownCount = SEARCH_PAGE_SIZE;
      status.textContent = '검색 중…';
      try {
        const index = await getSearchIndex(indexUrl);
        if (thisRequest !== requestNumber) return;
        const scoped = hasSearchScope({
          q: input.value,
          category: category?.value,
          verification: verification?.value,
          tag: tag?.value,
        });
        let ranked = scoped ? rankEntries(index, input.value) : [];
        ranked = ranked.filter(({ entry }) => (
          matchesChoice(category?.value, [entry.categoryKey, entry.category])
          && matchesChoice(verification?.value, [entry.verification, entry.verificationLabel])
          && matchesChoice(tag?.value, [...asArray(entry.tagKeys), ...asArray(entry.tags)])
        ));
        rankedResults = sortRanked(ranked);
        renderPageResults(rankedResults);
      } catch {
        if (thisRequest !== requestNumber) return;
        results.replaceChildren();
        appendStatus(results, '검색 색인을 불러오지 못했습니다. 조건을 바꾸면 다시 시도합니다.');
        status.textContent = '검색 색인을 불러오지 못했습니다.';
        loadMore.hidden = true;
      }
    };

    readUrl();
    const clearButton = searchPage.querySelector('[data-search-clear]') || (() => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'search-filter-button';
      button.dataset.searchClear = '';
      button.textContent = '검색 조건 초기화';
      (searchPage.querySelector('.search-page-filters') || searchPage).append(button);
      return button;
    })();
    const debouncedSearch = debounce(() => applySearch());
    input.addEventListener('input', () => {
      requestNumber += 1;
      debouncedSearch();
    });
    for (const control of [category, verification, tag, sort].filter(Boolean)) {
      control.addEventListener('change', () => {
        debouncedSearch.cancel();
        applySearch();
      });
    }
    searchPage.addEventListener('submit', (event) => {
      event.preventDefault();
      debouncedSearch.cancel();
      applySearch();
    });
    clearButton.addEventListener('click', () => {
      input.value = '';
      if (category) category.value = '';
      if (verification) verification.value = '';
      if (tag) tag.value = '';
      if (sort) sort.value = 'relevance';
      debouncedSearch.cancel();
      applySearch();
      input.focus();
    });
    loadMore.addEventListener('click', () => {
      shownCount = nextPageSize(shownCount, rankedResults.length, SEARCH_PAGE_SIZE);
      renderPageResults(rankedResults);
      loadMore.focus();
    });
    const filterPanel = searchPage.querySelector('[data-search-filter-panel]');
    filterPanel?.addEventListener('toggle', updateFilterSummary);
    window.addEventListener('popstate', () => {
      readUrl();
      applySearch({ updateUrl: false });
    });
    applySearch({ updateUrl: false });
  }
}

/* Category directory filtering and sorting */
for (const filterGrid of document.querySelectorAll('[data-filter-grid]')) {
  const scope = filterGrid.closest('.listing-main, [data-filter-scope]') || document;
  const filterInput = scope.querySelector('[data-filter-input]');
  if (!filterInput) continue;
  const verification = scope.querySelector('[data-filter-verification]');
  const sort = scope.querySelector('[data-filter-sort]');
  const count = scope.querySelector('[data-filter-count]');
  const empty = filterGrid.querySelector('[data-filter-empty]');
  const cards = [...filterGrid.querySelectorAll('[data-card]')];
  const originalOrder = new Map(cards.map((card, index) => [card, index]));
  const pageSize = DIRECTORY_PAGE_SIZE;
  const loadMore = scope.querySelector('[data-filter-more]') || (() => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'directory-load-more';
    button.dataset.filterMore = '';
    button.textContent = '더 보기';
    filterGrid.after(button);
    return button;
  })();
  const viewButtons = [...scope.querySelectorAll('[data-directory-view]')];
  const isSourceDirectory = filterGrid.classList.contains('directory-source-list');
  const eraLabels = [];
  let shownCount = pageSize;

  if (count) {
    count.setAttribute('role', 'status');
    count.setAttribute('aria-live', 'polite');
  }
  const numberValue = (card, key) => Number.parseFloat(card.dataset[key]) || 0;
  const dateValue = (card) => Date.parse(card.dataset.updated) || 0;
  const titleValue = (card) => card.dataset.sortTitle || card.dataset.title || card.querySelector('h2, h3')?.textContent || '';
  const sortedCards = () => {
    const list = [...cards];
    const mode = sort?.value || 'default';
    if (mode === 'chronological') {
      list.sort((a, b) => {
        return comparePublicationYears(a.dataset.publicationYear, b.dataset.publicationYear)
          || originalOrder.get(a) - originalOrder.get(b);
      });
    } else if (mode === 'title' || mode === 'title-asc') list.sort((a, b) => collator.compare(titleValue(a), titleValue(b)));
    else if (mode === 'title-desc') list.sort((a, b) => collator.compare(titleValue(b), titleValue(a)));
    else if (mode === 'updated' || mode === 'updated-desc') list.sort((a, b) => dateValue(b) - dateValue(a) || collator.compare(titleValue(a), titleValue(b)));
    else if (mode === 'connections') list.sort((a, b) => numberValue(b, 'connections') - numberValue(a, 'connections') || collator.compare(titleValue(a), titleValue(b)));
    else list.sort((a, b) => originalOrder.get(a) - originalOrder.get(b));
    return list;
  };
  const readUrl = () => {
    const state = parseUiState(window.location.search, { directory: true });
    filterInput.value = state.q;
    if (verification && [...verification.options].some((option) => option.value === state.verification)) verification.value = state.verification;
    if (sort && [...sort.options].some((option) => option.value === state.sort)) sort.value = state.sort;
    const view = state.view === 'cards' ? 'cards' : 'compact';
    filterGrid.dataset.view = view;
    filterGrid.closest('.listing-main')?.classList.toggle('directory-view--cards', view === 'cards');
    for (const button of viewButtons) button.setAttribute('aria-pressed', String(button.dataset.directoryView === view));
  };
  const syncUrl = () => {
    const url = new URL(window.location.href);
    const params = serializeUiState({
      q: filterInput.value.trim(),
      verification: verification?.value,
      sort: sort?.value,
      view: filterGrid.dataset.view || 'compact',
    }, { directory: true });
    for (const key of ['q', 'verification', 'sort', 'view']) url.searchParams.delete(key);
    for (const [key, value] of params.entries()) url.searchParams.set(key, value);
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  };
  const clearEraLabels = () => {
    for (const label of eraLabels) label.remove();
    eraLabels.length = 0;
  };
  const createEraLabel = (decade) => {
    const label = document.createElement('div');
    label.className = 'directory-era-label';
    label.innerHTML = `<span>${decade === null ? '연도 미상' : `${decade}년대`}</span>`;
    eraLabels.push(label);
    return label;
  };
  const applyFilter = ({ updateUrl = true, reset = true } = {}) => {
    if (updateUrl) syncUrl();
    if (reset) shownCount = pageSize;
    const terms = normalize(filterInput.value).split(' ').filter(Boolean);
    const verificationValue = normalize(verification?.value);
    const sorted = sortedCards();
    const matching = sorted.filter((card) => {
      const textMatches = terms.every((term) => normalize(card.dataset.filterValue || card.textContent).includes(term));
      const verificationMatches = !verificationValue || normalize(card.dataset.verification) === verificationValue;
      return textMatches && verificationMatches;
    });
    const visible = matching.slice(0, shownCount);
    const visibleSet = new Set(visible);
    clearEraLabels();
    let previousEra = Symbol('unset');
    const showEraLabels = isSourceDirectory && (sort?.value || 'default') === 'chronological';
    const orderedChildren = [];
    for (const card of sorted) {
      const isVisible = visibleSet.has(card);
      if (showEraLabels && isVisible) {
        const decade = publicationDecade(card.dataset.publicationYear);
        if (decade !== previousEra) {
          orderedChildren.push(createEraLabel(decade));
          previousEra = decade;
        }
      }
      orderedChildren.push(card);
      card.hidden = !isVisible;
    }
    if (empty) {
      empty.hidden = matching.length !== 0;
      orderedChildren.push(empty);
    }
    filterGrid.replaceChildren(...orderedChildren);
    const remaining = remainingCount(visible.length, matching.length);
    loadMore.hidden = remaining === 0;
    loadMore.textContent = remaining ? `더 보기 · ${Math.min(pageSize, remaining)}개` : '모든 문서를 표시했습니다.';
    if (count) count.textContent = matching.length ? `${matching.length}개 중 ${visible.length}개 표시` : '0개 문서';
  };

  filterInput.addEventListener('input', () => applyFilter());
  verification?.addEventListener('change', () => applyFilter());
  sort?.addEventListener('change', () => applyFilter());
  loadMore.addEventListener('click', () => {
    shownCount = nextPageSize(shownCount, cards.length, pageSize);
    applyFilter({ updateUrl: false, reset: false });
    loadMore.focus();
  });
  for (const button of viewButtons) {
    button.addEventListener('click', () => {
      const view = button.dataset.directoryView === 'cards' ? 'cards' : 'compact';
      filterGrid.dataset.view = view;
      filterGrid.closest('.listing-main')?.classList.toggle('directory-view--cards', view === 'cards');
      for (const item of viewButtons) item.setAttribute('aria-pressed', String(item === button));
      syncUrl();
    });
  }
  window.addEventListener('popstate', () => {
    readUrl();
    applyFilter({ updateUrl: false });
  });
  readUrl();
  applyFilter({ updateUrl: false });
}

/* Reading font preference */
const READING_FONT_KEY = 'llm-wiki-reading-font';
const readingFontControls = [...document.querySelectorAll('[data-reading-font]')];
const validReadingFonts = new Set(['system', 'ridi', 'd2']);
const normalizeReadingFont = (value) => (value === 'd2coding' ? 'd2' : value);
const readStoredFont = () => {
  try {
    return normalizeReadingFont(window.localStorage.getItem(READING_FONT_KEY));
  } catch {
    return null;
  }
};
const controlFontValue = (control) => normalizeReadingFont(
  control.matches('select, input') ? control.value : control.dataset.readingFont,
);
const syncReadingFontControls = (font) => {
  for (const control of readingFontControls) {
    if (control.matches('select')) {
      const option = [...control.options].find((item) => normalizeReadingFont(item.value) === font);
      if (option) control.value = option.value;
    } else if (control.matches('input[type="radio"]')) {
      control.checked = controlFontValue(control) === font;
    } else if (control.matches('button')) {
      control.setAttribute('aria-pressed', String(controlFontValue(control) === font));
    }
  }
};
const applyReadingFont = (value, { persist = false } = {}) => {
  const font = validReadingFonts.has(normalizeReadingFont(value)) ? normalizeReadingFont(value) : 'ridi';
  document.documentElement.dataset.readingFont = font;
  syncReadingFontControls(font);
  if (persist) {
    try {
      window.localStorage.setItem(READING_FONT_KEY, font);
    } catch {
      // The preference still applies for this page when storage is unavailable.
    }
  }
};

applyReadingFont(readStoredFont() || document.documentElement.dataset.readingFont || 'ridi');
for (const control of readingFontControls) {
  const eventName = control.matches('button') ? 'click' : 'change';
  control.addEventListener(eventName, () => applyReadingFont(controlFontValue(control), { persist: true }));
}
window.addEventListener('storage', (event) => {
  if (event.key === READING_FONT_KEY) applyReadingFont(event.newValue || 'ridi');
});

/* Responsive and active table of contents */
const tocDetails = [...document.querySelectorAll('[data-toc-details]')];
if (tocDetails.length) {
  const desktopToc = window.matchMedia('(min-width: 821px)');
  for (const details of tocDetails) {
    let userInteracted = false;
    details.open = desktopToc.matches;
    const summary = details.querySelector('summary');
    summary?.addEventListener('click', () => { userInteracted = true; });
    summary?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') userInteracted = true;
    });
    desktopToc.addEventListener('change', (event) => {
      if (!userInteracted) details.open = event.matches;
    });
  }
}

const tocLinks = [...document.querySelectorAll('.toc-card a[href^="#"]')];
if (tocLinks.length) {
  const linkedHeadings = tocLinks.map((link) => {
    let id = link.hash.slice(1);
    try { id = decodeURIComponent(id); } catch { /* Use the literal hash. */ }
    const depth = Number(link.closest('li')?.dataset.tocDepth || 2);
    return { link, heading: document.getElementById(id), depth };
  }).filter(({ heading }) => heading);
  let activeLink;
  let scheduled = false;
  const updateActiveToc = () => {
    scheduled = false;
    const threshold = Math.max(96, window.innerHeight * 0.18);
    let active = linkedHeadings[0];
    for (const item of linkedHeadings) {
      if (item.heading.getBoundingClientRect().top <= threshold) active = item;
      else break;
    }
    if (!active || active.link === activeLink) return;
    for (const { link } of linkedHeadings) {
      link.classList.remove('is-active');
      link.removeAttribute('aria-current');
    }
    active.link.classList.add('is-active');
    active.link.setAttribute('aria-current', 'location');
    const activeIndex = linkedHeadings.indexOf(active);
    const activeSection = active.depth === 2
      ? active
      : linkedHeadings.slice(0, activeIndex + 1).reverse().find((item) => item.depth === 2);
    for (const item of linkedHeadings) {
      if (item.depth !== 3) continue;
      const itemIndex = linkedHeadings.indexOf(item);
      const parent = linkedHeadings.slice(0, itemIndex).reverse().find((candidate) => candidate.depth === 2);
      const visible = Boolean(parent && activeSection && parent.link === activeSection.link);
      item.link.closest('li')?.toggleAttribute('hidden', !visible);
    }
    const currentLabel = activeSection?.link.textContent?.trim() || active.link.textContent?.trim() || '';
    for (const current of document.querySelectorAll('[data-toc-current]')) current.textContent = currentLabel;
    activeLink = active.link;
  };
  const scheduleTocUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(updateActiveToc);
  };
  window.addEventListener('scroll', scheduleTocUpdate, { passive: true });
  window.addEventListener('resize', scheduleTocUpdate, { passive: true });
  for (const { link } of linkedHeadings) link.addEventListener('click', scheduleTocUpdate);
  updateActiveToc();
}

/* Reading progress and return-to-top control */
const progressBar = document.querySelector('[data-reading-progress]');
const topButton = document.querySelector('[data-back-to-top]');
if (progressBar || topButton) {
  let scheduled = false;
  const updateReadingProgress = () => {
    scheduled = false;
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const ratio = Math.min(1, Math.max(0, window.scrollY / scrollable));
    if (progressBar) progressBar.style.setProperty('--reading-progress', `${ratio * 100}%`);
    if (topButton) topButton.hidden = window.scrollY < window.innerHeight * 1.25;
  };
  const scheduleReadingProgress = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(updateReadingProgress);
  };
  window.addEventListener('scroll', scheduleReadingProgress, { passive: true });
  window.addEventListener('resize', scheduleReadingProgress, { passive: true });
  topButton?.addEventListener('click', () => window.scrollTo({
    top: 0,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  }));
  updateReadingProgress();
}
