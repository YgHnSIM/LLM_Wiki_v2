const normalize = (value) => String(value ?? '')
  .normalize('NFKC')
  .toLocaleLowerCase('ko')
  .replace(/\s+/g, ' ')
  .trim();

const menuButton = document.querySelector('[data-menu-toggle]');
const primaryNav = document.querySelector('#primary-nav');

if (menuButton && primaryNav) {
  const closeMenu = () => {
    primaryNav.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
  };

  menuButton.addEventListener('click', () => {
    const open = !primaryNav.classList.contains('is-open');
    primaryNav.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', (event) => {
    if (!primaryNav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}

let searchIndexPromise;

function getSearchIndex(url) {
  if (!searchIndexPromise) {
    searchIndexPromise = fetch(url).then((response) => {
      if (!response.ok) throw new Error(`검색 색인을 불러오지 못했습니다: ${response.status}`);
      return response.json();
    });
  }
  return searchIndexPromise;
}

function searchEntries(index, query) {
  const terms = normalize(query).split(' ').filter(Boolean);
  if (!terms.length) return [];

  return index.map((entry) => {
    const title = normalize(entry.title);
    const aliases = normalize(entry.aliases.join(' '));
    const tags = normalize(entry.tags.join(' '));
    const excerpt = normalize(entry.excerpt);
    const text = normalize(entry.text);
    const haystack = `${title} ${aliases} ${tags} ${excerpt} ${text}`;
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
    return { entry, score };
  })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title, 'ko'))
    .slice(0, 8)
    .map((result) => result.entry);
}

function appendSearchMessage(container, text) {
  const paragraph = document.createElement('p');
  paragraph.className = 'search-message';
  paragraph.textContent = text;
  container.append(paragraph);
}

for (const form of document.querySelectorAll('[data-site-search]')) {
  const input = form.querySelector('input[type="search"]');
  const results = form.querySelector('.search-results');
  const indexUrl = form.dataset.indexUrl;
  let currentResults = [];
  let requestNumber = 0;

  const closeResults = () => {
    results.hidden = true;
    input.setAttribute('aria-expanded', 'false');
  };

  const openResults = () => {
    results.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  };

  const renderResults = (entries) => {
    results.replaceChildren();
    currentResults = entries;

    if (!entries.length) {
      appendSearchMessage(results, '일치하는 문서가 없습니다.');
      openResults();
      return;
    }

    for (const entry of entries) {
      const link = document.createElement('a');
      link.className = 'search-result';
      link.href = entry.url;
      link.setAttribute('role', 'option');

      const category = document.createElement('span');
      category.textContent = entry.category;
      const title = document.createElement('strong');
      title.textContent = entry.title;
      const excerpt = document.createElement('p');
      excerpt.textContent = entry.excerpt;

      link.append(category, title, excerpt);
      results.append(link);
    }
    openResults();
  };

  const update = async () => {
    const query = input.value.trim();
    requestNumber += 1;
    const thisRequest = requestNumber;
    if (!query) {
      closeResults();
      return;
    }

    results.replaceChildren();
    appendSearchMessage(results, '검색 중…');
    openResults();

    try {
      const index = await getSearchIndex(indexUrl);
      if (thisRequest !== requestNumber) return;
      renderResults(searchEntries(index, query));
    } catch {
      if (thisRequest !== requestNumber) return;
      results.replaceChildren();
      appendSearchMessage(results, '검색 색인을 불러오지 못했습니다.');
      openResults();
    }
  };

  input.addEventListener('input', update);
  input.addEventListener('focus', () => {
    if (input.value.trim()) update();
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeResults();
      input.blur();
    }
    if (event.key === 'ArrowDown' && !results.hidden) {
      event.preventDefault();
      results.querySelector('a')?.focus();
    }
  });

  results.addEventListener('keydown', (event) => {
    const links = [...results.querySelectorAll('a')];
    const current = links.indexOf(document.activeElement);
    if (event.key === 'ArrowDown' && current < links.length - 1) {
      event.preventDefault();
      links[current + 1].focus();
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (current <= 0) input.focus();
      else links[current - 1].focus();
    }
    if (event.key === 'Escape') {
      closeResults();
      input.focus();
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (currentResults[0]) window.location.assign(currentResults[0].url);
    else update();
  });

  document.addEventListener('click', (event) => {
    if (!form.contains(event.target)) closeResults();
  });
}

const filterInput = document.querySelector('[data-filter-input]');
const filterGrid = document.querySelector('[data-filter-grid]');

if (filterInput && filterGrid) {
  const cards = [...filterGrid.querySelectorAll('[data-card]')];
  const count = document.querySelector('[data-filter-count]');
  const empty = filterGrid.querySelector('[data-filter-empty]');

  const applyFilter = () => {
    const terms = normalize(filterInput.value).split(' ').filter(Boolean);
    let visible = 0;

    for (const card of cards) {
      const value = normalize(card.dataset.filterValue);
      const matches = terms.every((term) => value.includes(term));
      card.hidden = !matches;
      if (matches) visible += 1;
    }

    count.textContent = `${visible}개 문서`;
    empty.hidden = visible !== 0;
  };

  filterInput.addEventListener('input', applyFilter);
}

const tocLinks = [...document.querySelectorAll('.toc-card a[href^="#"]')];
if (tocLinks.length && 'IntersectionObserver' in window) {
  const byId = new Map(tocLinks.map((link) => [decodeURIComponent(link.hash.slice(1)), link]));
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!visible) return;
    for (const link of tocLinks) link.removeAttribute('aria-current');
    byId.get(visible.target.id)?.setAttribute('aria-current', 'location');
  }, { rootMargin: '-18% 0px -72% 0px' });

  for (const id of byId.keys()) {
    const heading = document.getElementById(id);
    if (heading) observer.observe(heading);
  }
}
