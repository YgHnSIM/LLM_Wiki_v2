import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createRelationshipIndex,
  rankRelationshipRecords,
  relationshipCounts,
  relationshipRecordLabel,
  relationshipRecordsFor,
  relationshipRecordsForTab,
} from '../../site/assets/relationship-explorer.js';

const data = {
  stats: { nodes: 5 },
  communities: [
    { id: 0, label: '언어 모델', size: 4, crossEdges: 1 },
    { id: 1, label: '대화 시스템', size: 1, crossEdges: 1 },
  ],
  nodes: [
    { id: 'a', title: '선택 문서', community: 0, degree: 3, bridgeConnections: 0, verification: 'verified' },
    { id: 'b', title: '편집 관계', community: 0, degree: 2, bridgeConnections: 1, verification: 'partial' },
    { id: 'c', title: '서로 가리킴', community: 0, degree: 3, bridgeConnections: 2, verification: 'verified' },
    { id: 'd', title: '같은 집단', community: 0, degree: 1, bridgeConnections: 0, verification: 'verified' },
    { id: 'e', title: '들어오는 본문', community: 1, degree: 1, bridgeConnections: 1, verification: 'verified' },
  ],
  edges: [
    { source: 'a', target: 'b', kinds: ['related'] },
    { source: 'a', target: 'c', kinds: ['body'] },
    { source: 'c', target: 'a', kinds: ['related', 'body'] },
    { source: 'e', target: 'a', kinds: ['body'] },
  ],
};

test('relationship index merges reciprocal edges into one directional record', () => {
  const index = createRelationshipIndex(data);
  const records = relationshipRecordsFor(index, 'a');
  const reciprocal = records.find((record) => record.node.id === 'c');
  assert.equal(records.length, 3);
  assert.equal(reciprocal.direction, 'both');
  assert.deepEqual([...reciprocal.directions].sort(), ['in', 'out']);
  assert.deepEqual([...reciprocal.kinds].sort(), ['body', 'related']);
  assert.equal(relationshipRecordLabel(reciprocal), '편집 관계 + 본문 링크 · 서로 가리킴');
});

test('relationship counts use unique neighbors while relation scopes may overlap', () => {
  const records = relationshipRecordsFor(createRelationshipIndex(data), 'a');
  assert.deepEqual(relationshipCounts(records), {
    total: 3,
    related: 2,
    body: 2,
    incoming: 2,
    outgoing: 2,
    mutual: 1,
  });
});

test('recommended ranking prioritizes authored relation before graph centrality', () => {
  const records = relationshipRecordsFor(createRelationshipIndex(data), 'a');
  assert.deepEqual(rankRelationshipRecords(records).map((record) => record.node.id), ['c', 'b', 'e']);
});

test('tabs preserve direction and add unlinked documents only for community view', () => {
  const index = createRelationshipIndex(data);
  assert.deepEqual(relationshipRecordsForTab(index, 'a', 'outgoing').map((record) => record.node.id), ['c', 'b']);
  assert.deepEqual(relationshipRecordsForTab(index, 'a', 'incoming').map((record) => record.node.id), ['c', 'e']);
  const community = relationshipRecordsForTab(index, 'a', 'community');
  assert.deepEqual(community.map((record) => record.node.id), ['c', 'b', 'd']);
  assert.equal(community.find((record) => record.node.id === 'd').communityOnly, true);
});
