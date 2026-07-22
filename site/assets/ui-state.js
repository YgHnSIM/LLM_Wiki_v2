const DEFAULT_SEARCH_SORT = 'relevance';
const DEFAULT_DIRECTORY_SORT = 'default';

export const SEARCH_PAGE_SIZE = 24;
export const DIRECTORY_PAGE_SIZE = 30;

export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLocaleLowerCase('ko')
    .replace(/\s+/g, ' ')
    .trim();
}

export function publicationYear(value) {
  const parsed = Number.parseInt(String(value ?? '').trim(), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function publicationDecade(value) {
  const year = publicationYear(value);
  return year === null ? null : Math.floor(year / 10) * 10;
}

export function comparePublicationYears(leftValue, rightValue) {
  const left = publicationYear(leftValue);
  const right = publicationYear(rightValue);
  if (left === null && right !== null) return 1;
  if (left !== null && right === null) return -1;
  return (left ?? 0) - (right ?? 0);
}

export function hasSearchScope(state = {}) {
  return ['q', 'category', 'verification', 'tag']
    .some((key) => normalizeText(state[key]));
}

export function parseUiState(search = '', { directory = false } = {}) {
  const params = search instanceof URLSearchParams
    ? search
    : new URLSearchParams(String(search).replace(/^\?/, ''));
  return {
    q: params.get('q') ?? '',
    category: params.get('category') ?? '',
    verification: params.get('verification') ?? '',
    tag: params.get('tag') ?? '',
    sort: params.get('sort') ?? (directory ? DEFAULT_DIRECTORY_SORT : DEFAULT_SEARCH_SORT),
    view: params.get('view') ?? (directory ? 'compact' : ''),
  };
}

export function serializeUiState(state = {}, { directory = false } = {}) {
  const params = new URLSearchParams();
  const values = {
    q: state.q,
    category: state.category,
    verification: state.verification,
    tag: state.tag,
    sort: state.sort === (directory ? DEFAULT_DIRECTORY_SORT : DEFAULT_SEARCH_SORT) ? '' : state.sort,
    view: directory && state.view && state.view !== 'compact' ? state.view : '',
  };
  for (const [key, value] of Object.entries(values)) {
    const normalized = String(value ?? '').trim();
    if (normalized) params.set(key, normalized);
  }
  return params;
}

export function visiblePage(items, shown, pageSize) {
  const list = Array.isArray(items) ? items : [];
  const limit = Math.max(0, Number(shown) || 0);
  return list.slice(0, limit || pageSize);
}

export function nextPageSize(current, total, pageSize) {
  const currentCount = Math.max(0, Number(current) || 0);
  const totalCount = Math.max(0, Number(total) || 0);
  const increment = Math.max(1, Number(pageSize) || 1);
  return Math.min(totalCount, currentCount + increment);
}

export function remainingCount(current, total) {
  return Math.max(0, (Number(total) || 0) - (Number(current) || 0));
}

export function cleanDisplayAliases(title, aliases = [], limit = 3) {
  const normalizedTitle = normalizeText(title);
  const seen = new Set([normalizedTitle]);
  const output = [];
  for (const rawAlias of Array.isArray(aliases) ? aliases : []) {
    const alias = String(rawAlias ?? '').trim();
    const display = alias.replace(/^\d{3}[_\s-]+/, '').trim();
    const normalized = normalizeText(display);
    if (!display || !normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    output.push(display);
    if (output.length >= limit) break;
  }
  return output;
}

export function primaryEvidence(evidence = []) {
  const entries = Array.isArray(evidence) ? evidence : [];
  return entries.find((entry) => entry?.relation === 'supports' && entry?.source?.published)
    ?? entries.find((entry) => entry?.source?.published)
    ?? null;
}
