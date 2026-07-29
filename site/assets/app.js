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
import { appendTitleWithSubtitleColon } from './title-format.js';

const normalize = normalizeText;

const asArray = (value) => (Array.isArray(value) ? value : []);
const collator = new Intl.Collator('ko', { numeric: true, sensitivity: 'base' });

function restoreLoadMoreFocus(button, container, previousCount, itemSelector, focusSelector) {
  if (!button.hidden) {
    button.focus();
    return;
  }

  const visibleItems = [...container.querySelectorAll(itemSelector)]
    .filter((item) => !item.hidden && getComputedStyle(item).display !== 'none');
  const nextItem = visibleItems[previousCount];
  const target = nextItem?.querySelector(focusSelector) || nextItem;
  if (!target) return;
  if (!target.matches('a[href], button, input, select, textarea, [tabindex]')) target.tabIndex = -1;
  target.focus();
}

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

/* Mobile navigation
 *
 * New builds provide a native dialog ([data-mobile-nav-dialog]).  Keep the
 * compact class-based fallback while a cached build is in use, but never use
 * the desktop navigation as the modal target.
 */
const menuButton = document.querySelector('[data-menu-toggle]');
const mobileMenuDialog = document.querySelector('[data-mobile-nav-dialog]');
const legacyPrimaryNav = document.querySelector('#primary-nav');
const positionMobileMenu = () => {
  if (!menuButton || !mobileMenuDialog) return;
  const menuButtonBox = menuButton.getBoundingClientRect();
  const headerBox = document.querySelector('.site-header')?.getBoundingClientRect();
  const anchorBottom = Math.max(menuButtonBox.bottom, headerBox?.bottom ?? menuButtonBox.bottom);
  mobileMenuDialog.style.setProperty('--mobile-nav-top', `${Math.round(anchorBottom + 8)}px`);
};

if (menuButton && typeof HTMLDialogElement !== 'undefined' && mobileMenuDialog instanceof HTMLDialogElement && typeof mobileMenuDialog.showModal === 'function') {
  const mobileBreakpoint = Number.parseInt(mobileMenuDialog.dataset.mobileBreakpoint || '820', 10) || 820;
  const mobileMedia = window.matchMedia(`(max-width: ${mobileBreakpoint}px)`);
  const menuPanel = mobileMenuDialog.querySelector('[data-mobile-nav-panel]') || mobileMenuDialog;
  let restoreFocusOnClose = false;
  let lockedRootOverflow = '';
  let lockedBodyOverflow = '';
  let pageScrollLocked = false;

  const lockPageScroll = () => {
    if (pageScrollLocked) return;
    pageScrollLocked = true;
    lockedRootOverflow = document.documentElement.style.overflow;
    lockedBodyOverflow = document.body.style.overflow;
    document.documentElement.classList.add('mobile-menu-open');
    document.body.classList.add('mobile-menu-open');
    document.body.dataset.mobileMenuOpen = 'true';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  };

  const unlockPageScroll = () => {
    if (!pageScrollLocked) return;
    pageScrollLocked = false;
    document.documentElement.classList.remove('mobile-menu-open');
    document.body.classList.remove('mobile-menu-open');
    delete document.body.dataset.mobileMenuOpen;
    document.documentElement.style.overflow = lockedRootOverflow;
    document.body.style.overflow = lockedBodyOverflow;
  };

  const finishClose = () => {
    unlockPageScroll();
    menuButton.setAttribute('aria-expanded', 'false');
    if (!restoreFocusOnClose) return;
    restoreFocusOnClose = false;
    window.requestAnimationFrame(() => menuButton.focus({ preventScroll: true }));
  };

  const closeMenu = ({ restoreFocus = false } = {}) => {
    if (!mobileMenuDialog.open && !pageScrollLocked) return;
    restoreFocusOnClose ||= restoreFocus;
    if (mobileMenuDialog.open) {
      mobileMenuDialog.close();
      return;
    }
    finishClose();
  };

  const openMenu = () => {
    if (mobileMenuDialog.open || !mobileMedia.matches) return;
    restoreFocusOnClose = false;
    lockPageScroll();
    menuButton.setAttribute('aria-expanded', 'true');
    positionMobileMenu();
    mobileMenuDialog.showModal();
    window.requestAnimationFrame(() => {
      const firstTarget = menuPanel.querySelector('[autofocus], [data-mobile-nav-links] a[href]')
        || menuPanel.querySelector('a[href], input:not([disabled]), button:not([disabled]), select:not([disabled])');
      firstTarget?.focus({ preventScroll: true });
    });
  };

  menuButton.addEventListener('click', () => {
    if (mobileMenuDialog.open) closeMenu({ restoreFocus: true });
    else openMenu();
  });

  mobileMenuDialog.addEventListener('click', (event) => {
    if (event.target === mobileMenuDialog || event.target.closest('[data-menu-close]')) closeMenu({ restoreFocus: true });
  });
  mobileMenuDialog.addEventListener('click', (event) => {
    if (event.target.closest('a[href]')) closeMenu();
  });
  mobileMenuDialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeMenu({ restoreFocus: true });
  });
  mobileMenuDialog.addEventListener('close', finishClose);
  mobileMedia.addEventListener?.('change', (event) => {
    if (!event.matches) closeMenu({ restoreFocus: false });
  });
  window.addEventListener('resize', () => {
    if (!mobileMedia.matches) {
      closeMenu({ restoreFocus: false });
      return;
    }
    if (mobileMenuDialog.open) positionMobileMenu();
  }, { passive: true });
} else if (menuButton && mobileMenuDialog) {
  const isOpen = () => mobileMenuDialog.classList.contains('is-fallback-open');
  const closeMenu = ({ restoreFocus = false } = {}) => {
    if (!isOpen()) return;
    mobileMenuDialog.classList.remove('is-fallback-open');
    mobileMenuDialog.removeAttribute('open');
    document.documentElement.classList.remove('mobile-menu-open');
    document.body.classList.remove('mobile-menu-open', 'mobile-menu-fallback-open');
    delete document.body.dataset.mobileMenuOpen;
    menuButton.setAttribute('aria-expanded', 'false');
    if (restoreFocus) menuButton.focus({ preventScroll: true });
  };
  const openMenu = () => {
    positionMobileMenu();
    mobileMenuDialog.classList.add('is-fallback-open');
    mobileMenuDialog.setAttribute('open', '');
    document.documentElement.classList.add('mobile-menu-open');
    document.body.classList.add('mobile-menu-open', 'mobile-menu-fallback-open');
    document.body.dataset.mobileMenuOpen = 'true';
    menuButton.setAttribute('aria-expanded', 'true');
    window.requestAnimationFrame(() => {
      mobileMenuDialog.querySelector('[data-mobile-nav-links] a[href], a[href], input:not([disabled]), button:not([disabled]), select:not([disabled])')?.focus({ preventScroll: true });
    });
  };

  menuButton.addEventListener('click', () => {
    if (isOpen()) closeMenu({ restoreFocus: true });
    else openMenu();
  });
  mobileMenuDialog.addEventListener('click', (event) => {
    if (event.target.closest('[data-menu-close], a[href]')) closeMenu({ restoreFocus: event.target.closest('[data-menu-close]') !== null });
  });
  document.addEventListener('pointerdown', (event) => {
    if (isOpen() && !mobileMenuDialog.contains(event.target) && !menuButton.contains(event.target)) closeMenu({ restoreFocus: true });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      event.preventDefault();
      closeMenu({ restoreFocus: true });
    }
  });
  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 821px)').matches) {
      closeMenu();
      return;
    }
    if (isOpen()) positionMobileMenu();
  }, { passive: true });
} else if (menuButton && legacyPrimaryNav) {
  const isOpen = () => legacyPrimaryNav.classList.contains('is-open');
  const closeMenu = ({ restoreFocus = false } = {}) => {
    if (!isOpen()) return;
    legacyPrimaryNav.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    if (restoreFocus) menuButton.focus({ preventScroll: true });
  };
  const openMenu = () => {
    legacyPrimaryNav.classList.add('is-open');
    menuButton.setAttribute('aria-expanded', 'true');
    window.requestAnimationFrame(() => {
      legacyPrimaryNav.querySelector('a[href], input:not([disabled]), button:not([disabled]), select:not([disabled])')?.focus();
    });
  };

  menuButton.addEventListener('click', () => {
    if (isOpen()) closeMenu({ restoreFocus: true });
    else openMenu();
  });
  legacyPrimaryNav.addEventListener('click', (event) => {
    if (event.target.closest('a[href]')) closeMenu();
  });
  legacyPrimaryNav.addEventListener('focusout', () => {
    window.requestAnimationFrame(() => {
      if (isOpen() && !legacyPrimaryNav.contains(document.activeElement) && document.activeElement !== menuButton) closeMenu();
    });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      event.preventDefault();
      closeMenu({ restoreFocus: true });
    }
  });
  window.addEventListener('resize', () => closeMenu({ restoreFocus: legacyPrimaryNav.contains(document.activeElement) }), { passive: true });
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
    tags: normalize(asArray(entry.tagLabels).concat(asArray(entry.tags)).join(' ')),
    category: normalize([entry.category, entry.categoryKey].filter(Boolean).join(' ')),
    excerpt: normalize(entry.excerpt),
    text: normalize(entry.text),
    suggestionText: normalize(entry.suggestionText),
  };
  prepared.quickHaystack = [
    prepared.suggestionText,
    prepared.title,
    prepared.aliases,
    prepared.category,
    prepared.tags,
  ].join(' ');
  prepared.haystack = [
    prepared.quickHaystack,
    prepared.excerpt,
    prepared.text,
  ].join(' ');
  normalizedSearchEntries.set(entry, prepared);
  return prepared;
}

function rankEntries(index, query, { requireQuery = false, scope = 'full' } = {}) {
  const terms = normalize(query).split(' ').filter(Boolean);
  if (requireQuery && !terms.length) return [];
  const quickScope = scope === 'quick';

  return index.map((entry, order) => {
    const {
      title, aliases, tags, excerpt, text, haystack, quickHaystack,
    } = normalizedSearchEntry(entry);
    const searchable = quickScope ? quickHaystack : haystack;
    if (!terms.every((term) => searchable.includes(term))) return null;

    let score = 0;
    for (const term of terms) {
      if (title === term) score += 180;
      else if (title.startsWith(term)) score += 120;
      else if (title.includes(term)) score += 90;
      if (aliases.includes(term)) score += 55;
      if (tags.includes(term)) score += 30;
      if (!quickScope && excerpt.includes(term)) score += 18;
      if (!quickScope && text.includes(term)) score += 5;
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
    disputed: '논쟁 중',
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

/* Search autocomplete
 *
 * Suggestions intentionally use the compact title/alias/tag index. Enter
 * without an active option still goes to the full search page, which includes
 * body text. Keeping the focus on the input gives the combobox one keyboard
 * cursor and prevents every result link becoming a tab stop.
 */
let siteSearchSequence = 0;
for (const form of document.querySelectorAll('[data-site-search]')) {
  const input = form.querySelector('[data-quick-search-input], input[type="search"]');
  const results = form.querySelector('[data-search-results], .search-results');
  const externalStatus = form.querySelector('[data-search-status]');
  const indexUrl = form.dataset.indexUrl;
  if (!input || !results || !indexUrl) continue;

  siteSearchSequence += 1;
  if (!input.id) input.id = `site-search-${siteSearchSequence}`;
  if (!results.id) results.id = `${input.id}-results`;
  results.setAttribute('role', 'listbox');
  results.setAttribute('aria-label', '제목·별칭 빠른 검색 결과');
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-controls', results.id);
  input.setAttribute('aria-expanded', 'false');
  const suggestionLimit = Math.max(1, Number.parseInt(form.dataset.suggestionLimit || '5', 10) || 5);
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
    announce('제목, 별칭, 태그를 검색하고 있습니다.');
    openResults();
  };
  const appendOption = ({ className, href, id, label, children = [] }) => {
    const link = document.createElement('a');
    link.className = className;
    link.href = href;
    link.id = id;
    link.tabIndex = -1;
    link.setAttribute('role', 'option');
    link.setAttribute('aria-selected', 'false');
    if (label) link.setAttribute('aria-label', label);
    link.append(...children);
    results.append(link);
    return link;
  };
  const matchingDetail = (entry, query) => {
    const terms = normalize(query).split(' ').filter(Boolean);
    const matchesAll = (value) => terms.every((term) => normalize(value).includes(term));
    const alias = asArray(entry.aliases).find(matchesAll);
    if (alias) return `별칭 · ${alias}`;
    const tag = asArray(entry.tagLabels).concat(asArray(entry.tags)).find(matchesAll);
    return tag ? `태그 · ${tag}` : '';
  };
  const appendAllResultsOption = (query, total, { fallback = false } = {}) => {
    const label = fallback ? '전체 검색에서 본문까지 찾기' : `전체 ${total}개 결과 보기`;
    appendOption({
      className: 'search-all-results',
      href: searchPageUrl(query, form),
      id: `${input.id}-option-all`,
      label,
      children: [document.createTextNode(label)],
    });
  };
  const renderResults = (ranked, query) => {
    results.replaceChildren();
    currentResults = ranked.map(({ entry }) => entry);
    activeIndex = -1;
    const total = currentResults.length;

    if (!total) {
      const fallback = document.createElement('p');
      fallback.className = 'search-message search-message--body-fallback';
      fallback.textContent = '제목·별칭·태그 일치 없음 — Enter로 본문까지 검색';
      results.append(fallback);
      appendAllResultsOption(query, total, { fallback: true });
      announce('제목, 별칭, 태그에서 일치하는 문서가 없습니다. Enter를 누르면 본문까지 전체 검색합니다.');
      openResults();
      return;
    }

    const visible = currentResults.slice(0, suggestionLimit);
    appendStatus(results, `제목·별칭·태그에서 ${total}개 문서`, { visuallyHidden: true, live: !externalStatus });
    for (const [index, entry] of visible.entries()) {
      const meta = document.createElement('span');
      meta.textContent = [entry.category, entry.verificationLabel || verificationLabel(entry.verification)]
        .filter(Boolean).join(' · ');
      const title = document.createElement('strong');
      appendTitleWithSubtitleColon(title, entry.title);
      const detail = matchingDetail(entry, query);
      const children = detail
        ? [meta, title, Object.assign(document.createElement('span'), { className: 'search-result-match', textContent: detail })]
        : [meta, title];
      appendOption({
        className: 'search-result',
        href: entry.url,
        id: `${input.id}-option-${index}`,
        label: `${entry.title}, ${[entry.category, entry.verificationLabel || verificationLabel(entry.verification), detail].filter(Boolean).join(', ')}`,
        children,
      });
    }

    appendAllResultsOption(query, total);
    announce(`제목, 별칭, 태그에서 ${total}개 문서를 찾았습니다. 위아래 화살표로 선택할 수 있습니다.`);
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
      renderResults(rankEntries(index, query, { requireQuery: true, scope: 'quick' }), query);
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
    } else if (event.key === 'Tab') {
      closeResults();
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

  results.addEventListener('pointermove', (event) => {
    const option = event.target.closest('[role="option"]');
    if (!option) return;
    setActiveOption(options().indexOf(option));
  });
  results.addEventListener('click', (event) => {
    const option = event.target.closest('[role="option"]');
    if (option) setActiveOption(options().indexOf(option));
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    window.location.assign(searchPageUrl(input.value, form));
  });
  document.addEventListener('pointerdown', (event) => {
    if (!form.contains(event.target)) closeResults();
  });
}

/* Full search page */
const searchPage = document.querySelector('[data-search-page]');

if (searchPage) {
  const input = searchPage.querySelector('[data-search-page-input]');
  const category = searchPage.querySelector('[data-search-filter-category]');
  const verification = searchPage.querySelector('[data-search-filter-verification]');
  const coverage = searchPage.querySelector('[data-search-filter-coverage]');
  const mode = searchPage.querySelector('[data-search-filter-mode]');
  const editorial = searchPage.querySelector('[data-search-filter-editorial]');
  const tag = searchPage.querySelector('[data-search-filter-tag]');
  const sort = searchPage.querySelector('[data-search-sort]');
  const searchContext = searchPage.closest('main, .search-page, [data-search-context]') || document;
  const results = searchContext.querySelector('[data-search-page-results]') || document.querySelector('[data-search-page-results]');
  const status = searchContext.querySelector('[data-search-page-status]') || document.querySelector('[data-search-page-status]');
  const liveStatus = searchContext.querySelector('[data-search-page-live-status]') || document.querySelector('[data-search-page-live-status]') || status;
  const indexUrl = searchPage.dataset.indexUrl || sitePath('/search-index.json');

  if (input && results && (status || liveStatus)) {
    let requestNumber = 0;
    let rankedResults = [];
    let shownCount = SEARCH_PAGE_SIZE;

    const setSearchStatus = (visualText = '', liveText = visualText) => {
      if (status) status.textContent = visualText;
      if (liveStatus && liveStatus !== status) liveStatus.textContent = liveText;
    };
    const hasDetailedFilters = () => [category?.value, verification?.value, coverage?.value, mode?.value, editorial?.value, tag?.value]
      .some((value) => normalize(value));
    const detailedFilterCount = () => [category?.value, verification?.value, coverage?.value, mode?.value, editorial?.value, tag?.value]
      .filter((value) => normalize(value)).length;
    const normalizeSortForScope = () => {
      if (!sort || normalize(input.value) || !hasDetailedFilters() || sort.value !== 'relevance') return;
      if ([...sort.options].some((option) => option.value === 'title')) sort.value = 'title';
    };

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
      setSelectFromUrl(coverage, state.coverage);
      setSelectFromUrl(mode, state.mode);
      setSelectFromUrl(editorial, state.editorial);
      setSelectFromUrl(tag, state.tag);
      setSelectFromUrl(sort, state.sort, 'relevance');
      normalizeSortForScope();
    };
    const syncUrl = () => {
      normalizeSortForScope();
      const url = new URL(window.location.href);
      const params = serializeUiState({
        q: input.value.trim(),
        category: category?.value,
        verification: verification?.value,
        coverage: coverage?.value,
        mode: mode?.value,
        editorial: editorial?.value,
        tag: tag?.value,
        sort: sort?.value,
      });
      for (const key of ['q', 'category', 'verification', 'coverage', 'mode', 'editorial', 'tag', 'sort']) url.searchParams.delete(key);
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
    const sortMetric = (entry) => {
      const mode = sort?.value || 'relevance';
      if (mode === 'updated') return entry.updated ? `갱신 ${entry.updated}` : '갱신일 미상';
      if (mode === 'evidence') return `근거 ${numericValue(entry.evidenceCount ?? entry.evidence?.length)}개`;
      return '';
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
    const loadMore = document.querySelector('[data-search-load-more]') || (() => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'search-load-more';
      button.dataset.searchLoadMore = '';
      button.textContent = '더 보기';
      results.after(button);
      return button;
    })();
    const updateFilterSummary = ({ syncPanel = true } = {}) => {
      const active = detailedFilterCount();
      const filterCount = searchPage.querySelector('[data-search-filter-count]');
      if (filterCount) filterCount.textContent = active ? `${active}개 적용` : '';
      if (typeof clearButton !== 'undefined') {
        clearButton.hidden = !hasSearchScope({
          q: input.value,
          category: category?.value,
          verification: verification?.value,
          coverage: coverage?.value,
          mode: mode?.value,
          editorial: editorial?.value,
          tag: tag?.value,
        });
      }
      const panel = searchPage.querySelector('[data-search-filter-panel]');
      if (panel && syncPanel && window.matchMedia('(max-width: 620px)').matches) panel.open = active > 0;
    };
    const renderPageResults = (ranked) => {
      results.replaceChildren();
      const query = input.value.trim();
      const scoped = hasSearchScope({
        q: query,
        category: category?.value,
        verification: verification?.value,
        coverage: coverage?.value,
        mode: mode?.value,
        editorial: editorial?.value,
        tag: tag?.value,
      });
      if (!scoped) {
        const empty = document.createElement('p');
        empty.className = 'search-message search-message--entry';
        empty.textContent = '검색어나 필터를 입력하면 결과가 표시됩니다.';
        results.append(empty);
        loadMore.hidden = true;
        setSearchStatus('', '검색어나 필터를 입력하면 결과가 표시됩니다.');
        updateFilterSummary();
        return;
      }
      if (!ranked.length) {
        const empty = document.createElement('p');
        empty.className = 'search-message';
        empty.textContent = '조건에 맞는 문서가 없습니다.';
        results.append(empty);
        setSearchStatus('', '검색 결과가 0개입니다.');
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
        const metricText = sortMetric(entry);
        if (metricText) {
          const metric = document.createElement('span');
          metric.dataset.sortMetric = '';
          metric.textContent = metricText;
          meta.append(metric);
        }
        const heading = document.createElement('h2');
        const link = document.createElement('a');
        link.className = 'search-result-card__link';
        link.href = entry.url;
        appendTitleWithSubtitleColon(link, entry.title, (target, part) => appendHighlighted(target, part, query));
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
      setSearchStatus(`검색 결과 ${ranked.length}개 중 ${visible.length}개 표시`);
      updateFilterSummary();
    };
    const applySearch = async ({ updateUrl = true } = {}) => {
      requestNumber += 1;
      const thisRequest = requestNumber;
      normalizeSortForScope();
      if (updateUrl) syncUrl();
      shownCount = SEARCH_PAGE_SIZE;
      updateFilterSummary();
      setSearchStatus('검색 중…');
      try {
        const index = await getSearchIndex(indexUrl);
        if (thisRequest !== requestNumber) return;
        const scoped = hasSearchScope({
          q: input.value,
          category: category?.value,
          verification: verification?.value,
          coverage: coverage?.value,
          mode: mode?.value,
          editorial: editorial?.value,
          tag: tag?.value,
        });
        let ranked = scoped ? rankEntries(index, input.value) : [];
        ranked = ranked.filter(({ entry }) => (
          matchesChoice(category?.value, [entry.categoryKey, entry.category])
          && matchesChoice(verification?.value, [entry.verification, entry.verificationLabel])
          && matchesChoice(coverage?.value, [entry.evidenceCoverage])
          && matchesChoice(mode?.value, [entry.contentMode])
          && matchesChoice(editorial?.value, [entry.editorialStatus])
          && matchesChoice(tag?.value, [...asArray(entry.tagKeys), ...asArray(entry.tags)])
        ));
        rankedResults = sortRanked(ranked);
        renderPageResults(rankedResults);
      } catch {
        if (thisRequest !== requestNumber) return;
        results.replaceChildren();
        appendStatus(results, '검색 색인을 불러오지 못했습니다. 조건을 바꾸면 다시 시도합니다.', { live: false });
        setSearchStatus('', '검색 색인을 불러오지 못했습니다.');
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
    for (const control of [category, verification, coverage, mode, editorial, tag, sort].filter(Boolean)) {
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
      if (coverage) coverage.value = '';
      if (mode) mode.value = '';
      if (editorial) editorial.value = '';
      if (tag) tag.value = '';
      if (sort) sort.value = 'relevance';
      debouncedSearch.cancel();
      applySearch();
      input.focus();
    });
    loadMore.addEventListener('click', () => {
      const previousCount = Math.min(shownCount, rankedResults.length);
      shownCount = nextPageSize(shownCount, rankedResults.length, SEARCH_PAGE_SIZE);
      renderPageResults(rankedResults);
      restoreLoadMoreFocus(loadMore, results, previousCount, '.search-result-card', 'a[href]');
    });
    const filterPanel = searchPage.querySelector('[data-search-filter-panel]');
    filterPanel?.addEventListener('toggle', () => updateFilterSummary({ syncPanel: false }));
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
  const empty = filterGrid.querySelector('[data-filter-empty]');
  const filterStatus = scope.querySelector('[data-filter-status]');
  const clearFilters = scope.querySelector('[data-filter-reset], [data-filter-clear]') || (() => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'search-filter-button directory-filter-clear';
    button.dataset.filterReset = '';
    button.textContent = '조건 초기화';
    (scope.querySelector('.directory-tools') || scope).append(button);
    return button;
  })();
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
  let lastMatchingCount = cards.length;

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
    else if (mode === 'evidence') list.sort((a, b) => numberValue(b, 'evidence') - numberValue(a, 'evidence') || collator.compare(titleValue(a), titleValue(b)));
    else if (mode === 'connections') list.sort((a, b) => numberValue(b, 'connections') - numberValue(a, 'connections') || collator.compare(titleValue(a), titleValue(b)));
    else if (filterGrid.dataset.directoryDefaultSort === 'title') list.sort((a, b) => collator.compare(titleValue(a), titleValue(b)));
    else list.sort((a, b) => originalOrder.get(a) - originalOrder.get(b));
    return list;
  };
  const updateSortMetrics = () => {
    const mode = sort?.value || 'default';
    for (const card of cards) {
      const metric = card.querySelector('[data-sort-metric]');
      if (!metric) continue;
      let text = '';
      if (mode === 'updated' || mode === 'updated-desc') text = card.dataset.updated ? `갱신 ${card.dataset.updated}` : '갱신일 미상';
      else if (mode === 'evidence') text = `근거 ${numberValue(card, 'evidence')}개`;
      else if (mode === 'connections') text = `연결 ${numberValue(card, 'connections')}개`;
      metric.textContent = text;
      metric.hidden = !text;
    }
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
      const searchableText = normalize(card.dataset.searchKey || `${card.dataset.title || ''} ${card.dataset.filterValue || ''}`);
      const textMatches = terms.every((term) => searchableText.includes(term));
      const verificationMatches = !verificationValue || normalize(card.dataset.verification) === verificationValue;
      return textMatches && verificationMatches;
    });
    const visible = matching.slice(0, shownCount);
    lastMatchingCount = matching.length;
    updateSortMetrics();
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
    if (filterStatus) filterStatus.textContent = `전체 ${cards.length}개 중 ${matching.length}개 일치 · 현재 ${visible.length}개 표시`;
    if (clearFilters) {
      const hasActiveFilters = Boolean(terms.length || verificationValue || (sort?.value && sort.value !== 'default'));
      clearFilters.hidden = !hasActiveFilters;
    }
  };

  filterInput.addEventListener('input', () => applyFilter());
  verification?.addEventListener('change', () => applyFilter());
  sort?.addEventListener('change', () => applyFilter());
  clearFilters?.addEventListener('click', () => {
    filterInput.value = '';
    if (verification) verification.value = '';
    if (sort) sort.value = 'default';
    applyFilter();
    filterInput.focus();
  });
  loadMore.addEventListener('click', () => {
    const previousCount = filterGrid.querySelectorAll('[data-card]:not([hidden])').length;
    shownCount = nextPageSize(shownCount, lastMatchingCount, pageSize);
    applyFilter({ updateUrl: false, reset: false });
    restoreLoadMoreFocus(loadMore, filterGrid, previousCount, '[data-card]', 'a[href]');
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

/* Copy markdown content to clipboard */
document.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-copy-markdown]');
  if (!button) return;

  const template = document.getElementById('markdown-source');
  if (!template) return;

  const rawMarkdown = (template.content ? template.content.textContent : template.textContent) || '';
  if (!rawMarkdown) return;

  const textEl = button.querySelector('.copy-text') || button;
  const originalText = button.dataset.originalText || textEl.textContent;
  if (!button.dataset.originalText) {
    button.dataset.originalText = originalText;
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(rawMarkdown);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = rawMarkdown;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    button.classList.add('is-copied');
    textEl.textContent = '복사 완료!';
    window.clearTimeout(button._copyTimer);
    button._copyTimer = window.setTimeout(() => {
      button.classList.remove('is-copied');
      textEl.textContent = originalText;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy markdown:', err);
    textEl.textContent = '복사 실패';
    window.clearTimeout(button._copyTimer);
    button._copyTimer = window.setTimeout(() => {
      textEl.textContent = originalText;
    }, 2000);
  }
});

/* Mermaid Diagram Renderer
 * Dynamically loads and initializes Mermaid CDN when .mermaid elements are present.
 */
if (document.querySelector('.mermaid')) {
  const initMermaid = () => {
    if (window.mermaid) {
      window.mermaid.initialize({
        startOnLoad: true,
        theme: 'neutral',
        securityLevel: 'loose',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      });
      window.mermaid.run({ querySelector: '.mermaid' });
    }
  };

  if (window.mermaid) {
    initMermaid();
  } else {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
    script.onload = initMermaid;
    document.head.appendChild(script);
  }
}

