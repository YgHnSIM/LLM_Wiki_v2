import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildMobileRelationGroups,
  isMobileGraphExperience,
  limitMobileRelationGroups,
  mobileConnectorPath,
  mobileStartNodes,
} from '../../site/assets/graph-mobile-model.js';

const nodes = [
  { id: 'a', title: '선택', bridgeConnections: 1, degree: 4, evidenceCount: 1 },
  { id: 'b', title: '나가는 관련', bridgeConnections: 2, degree: 3, evidenceCount: 5 },
  { id: 'c', title: '들어오는 본문', bridgeConnections: 4, degree: 2, evidenceCount: 2 },
  { id: 'd', title: '서로 가리킴', bridgeConnections: 5, degree: 8, evidenceCount: 4 },
  { id: 'e', title: '나가는 본문', bridgeConnections: 0, degree: 1, evidenceCount: 0 },
];
const nodeById = new Map(nodes.map((node) => [node.id, node]));
const edges = [
  { source: 'a', target: 'b', kinds: ['related'] },
  { source: 'c', target: 'a', kinds: ['body'] },
  { source: 'a', target: 'd', kinds: ['body'] },
  { source: 'd', target: 'a', kinds: ['related'] },
  { source: 'a', target: 'e', kinds: ['body'] },
];

test('mobile experience activates for narrow screens and coarse tablets only', () => {
  assert.equal(isMobileGraphExperience({ width: 390, coarsePointer: false }), true);
  assert.equal(isMobileGraphExperience({ width: 844, coarsePointer: true }), true);
  assert.equal(isMobileGraphExperience({ width: 844, coarsePointer: false }), false);
  assert.equal(isMobileGraphExperience({ width: 1280, coarsePointer: true }), false);
});

test('mobile relation model merges reciprocal edges without losing direction or kind', () => {
  const groups = buildMobileRelationGroups('a', edges, nodeById);
  assert.deepEqual(groups.map((group) => [group.direction, group.items.length]), [
    ['in', 1],
    ['both', 1],
    ['out', 2],
  ]);
  const reciprocal = groups.find((group) => group.direction === 'both').items[0];
  assert.equal(reciprocal.node.id, 'd');
  assert.deepEqual(reciprocal.kinds, ['body', 'related']);
  assert.equal(reciprocal.hasRelated, true);
  assert.deepEqual(groups.find((group) => group.direction === 'out').items.map((item) => item.node.id), ['b', 'e']);
});

test('mobile relation grouping is deterministic when input order is reversed', () => {
  const forward = buildMobileRelationGroups('a', edges, nodeById);
  const reversed = buildMobileRelationGroups('a', [...edges].reverse(), new Map([...nodeById].reverse()));
  const snapshot = (groups) => groups.map((group) => ({
    direction: group.direction,
    ids: group.items.map((item) => item.node.id),
    kinds: group.items.map((item) => item.kinds),
  }));
  assert.deepEqual(snapshot(reversed), snapshot(forward));
});

test('mobile card limit preserves all active directions and never exceeds eight cards', () => {
  const makeItems = (prefix, count) => Array.from({ length: count }, (_, index) => ({ node: { id: `${prefix}${index}` } }));
  const groups = [
    { direction: 'in', items: makeItems('i', 6) },
    { direction: 'both', items: makeItems('b', 4) },
    { direction: 'out', items: makeItems('o', 5) },
  ];
  const limited = limitMobileRelationGroups(groups, 8);
  assert.equal(limited.total, 15);
  assert.equal(limited.shown, 8);
  assert.deepEqual(limited.groups.map((group) => [group.direction, group.visibleItems.length]), [
    ['in', 3],
    ['both', 3],
    ['out', 2],
  ]);
  assert.equal(limited.groups.reduce((sum, group) => sum + group.visibleItems.length, 0), 8);
});

test('mobile start cards rank bridge documents before degree and evidence ties', () => {
  const ranked = mobileStartNodes(nodes, new Set(nodes.map((node) => node.id)), 3);
  assert.deepEqual(ranked.map((node) => node.id), ['d', 'c', 'b']);
  assert.deepEqual(mobileStartNodes(nodes, new Set(['a', 'e']), 6).map((node) => node.id), ['a', 'e']);
});

test('mobile connector path remains finite and stable for portrait card geometry', () => {
  const source = { x: 12, y: 180, width: 342, height: 118 };
  const target = { x: 12, y: 368, width: 342, height: 82 };
  const path = mobileConnectorPath(source, target);
  assert.equal(path, 'M 183.00 298.00 C 183.00 330.20, 183.00 335.80, 183.00 368.00');
  assert.equal(/NaN|Infinity/.test(path), false);
  assert.equal(mobileConnectorPath(target, source), 'M 183.00 368.00 C 183.00 335.80, 183.00 330.20, 183.00 298.00');
});

test('isolated selected documents produce no relation sections', () => {
  assert.deepEqual(buildMobileRelationGroups('a', [], nodeById), []);
  assert.deepEqual(buildMobileRelationGroups('missing', edges, nodeById), []);
});
