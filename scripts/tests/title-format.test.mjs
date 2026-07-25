import assert from 'node:assert/strict';
import test from 'node:test';
import { isSubtitleDashPart, splitTitleAtSubtitleDash } from '../../site/assets/title-format.js';

test('title subtitle separators split only spaced em dashes', () => {
  const title = '같은 벡터 공간은 무엇을 보장하는가 — 공기·대조·생성의 경계';
  assert.deepEqual(splitTitleAtSubtitleDash(title), [
    '같은 벡터 공간은 무엇을 보장하는가',
    ' — ',
    '공기·대조·생성의 경계',
  ]);
  assert.equal(isSubtitleDashPart(' — '), true);
  assert.equal(isSubtitleDashPart('—'), false);
  assert.equal(isSubtitleDashPart('a-b'), false);
});
