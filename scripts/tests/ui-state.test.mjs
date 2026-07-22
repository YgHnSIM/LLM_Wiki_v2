import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DIRECTORY_PAGE_SIZE,
  SEARCH_PAGE_SIZE,
  cleanDisplayAliases,
  hasSearchScope,
  nextPageSize,
  parseUiState,
  primaryEvidence,
  remainingCount,
  serializeUiState,
  visiblePage,
} from '../../site/assets/ui-state.js';

test('search and directory URL state keeps meaningful values only', () => {
  const search = parseUiState('?q=Transformer&category=concepts&sort=title');
  assert.deepEqual(search, {
    q: 'Transformer',
    category: 'concepts',
    verification: '',
    tag: '',
    sort: 'title',
    view: '',
  });

  const serialized = serializeUiState({ ...search, sort: 'relevance' });
  assert.equal(serialized.toString(), 'q=Transformer&category=concepts');

  const directory = parseUiState('?q=shannon&verification=verified&view=cards', { directory: true });
  assert.equal(directory.view, 'cards');
  assert.equal(serializeUiState(directory, { directory: true }).toString(), 'q=shannon&verification=verified&view=cards');
});

test('blank search is gated while a filter creates a valid scope', () => {
  assert.equal(hasSearchScope({}), false);
  assert.equal(hasSearchScope({ q: '  ' }), false);
  assert.equal(hasSearchScope({ verification: 'verified' }), true);
  assert.equal(hasSearchScope({ category: 'sources' }), true);
});

test('pagination never exceeds total and reports the remaining batch', () => {
  const items = Array.from({ length: 55 }, (_, index) => index);
  assert.equal(visiblePage(items, SEARCH_PAGE_SIZE, SEARCH_PAGE_SIZE).length, SEARCH_PAGE_SIZE);
  assert.equal(nextPageSize(SEARCH_PAGE_SIZE, items.length, SEARCH_PAGE_SIZE), 48);
  assert.equal(nextPageSize(48, items.length, SEARCH_PAGE_SIZE), 55);
  assert.equal(remainingCount(48, items.length), 7);
  assert.equal(nextPageSize(DIRECTORY_PAGE_SIZE, 12, DIRECTORY_PAGE_SIZE), 12);
});

test('display aliases remove file prefixes and title duplicates', () => {
  assert.deepEqual(
    cleanDisplayAliases('The Transformer', ['The Transformer', '055_The Transformer', 'Transformer model', '  transformer model  ', 'Attention architecture']),
    ['Transformer model', 'Attention architecture'],
  );
});

test('primary evidence prefers supporting published records', () => {
  const context = { sourceId: 'context', relation: 'contextualizes', source: { published: '2020' } };
  const supplement = { sourceId: 'supplement', relation: 'supplements', source: { published: '2021' } };
  const support = { sourceId: 'support', relation: 'supports', source: { published: '2017' } };
  assert.equal(primaryEvidence([context, supplement, support]).sourceId, 'support');
  assert.equal(primaryEvidence([context, supplement]).sourceId, 'context');
  assert.equal(primaryEvidence([{ sourceId: 'missing', relation: 'supports', source: null }]), null);
});

