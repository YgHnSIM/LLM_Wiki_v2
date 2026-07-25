import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LEARNING_GUIDE_STORAGE_KEY,
  createLearningGuideState,
  loadLearningGuideState,
  parseLearningGuideState,
  progressForState,
  recommendationForDiagnostic,
  requiredModuleIds,
  resetLearningGuideState,
  saveLearningGuideState,
  scoreDiagnostic,
  setDiagnostic,
  setModuleCompletion,
  setPrimaryTrack,
} from '../../site/assets/learning-guide-state.js';

const completeAnswers = {
  'core-1': 'next-token-distribution',
  'core-2': 'separate-claim-conditions',
  'math-1': 'shape-preserves-axis-meaning',
  'math-2': 'gradient-update-direction',
  'history-1': 'locator',
  'history-2': 'comparison-conditions',
  'systems-1': 'runtime',
  'systems-2': 'failure-recovery',
};

function memoryStorage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    values,
  };
}

test('diagnostic scores eight answers in four areas and gives concrete recovery', () => {
  const scores = scoreDiagnostic({ ...completeAnswers, 'math-2': 'softmax-normalizes-logits' });
  assert.equal(scores.correct, 7);
  assert.equal(scores.areas.core.correct, 2);
  assert.equal(scores.areas.math.correct, 1);
  assert.equal(scores.incorrect[0].id, 'math-2');
  assert.equal(scores.incorrect[0].recoveryModule, 'M2');
  assert.match(scores.incorrect[0].misconception, /loss/);

  const undecided = recommendationForDiagnostic({ goal: 'undecided', answers: scores.answers });
  assert.equal(undecided.needsTrackChoice, true);
  assert.equal(undecided.recommendedTrack, 'math');
  assert.equal(undecided.challengeMode, true);
});

test('each selected specialization has exactly nine required modules', () => {
  assert.deepEqual(requiredModuleIds('math'), ['C1', 'C2', 'C3', 'M1', 'M2', 'M3', 'XH', 'XS', 'Z1']);
  assert.deepEqual(requiredModuleIds('history'), ['C1', 'C2', 'C3', 'H1', 'H2', 'H3', 'XM', 'XS', 'Z1']);
  assert.deepEqual(requiredModuleIds('systems'), ['C1', 'C2', 'C3', 'S1', 'S2', 'S3', 'XM', 'XH', 'Z1']);
  assert.deepEqual(requiredModuleIds('undecided'), ['C1', 'C2', 'C3']);
});

test('switching tracks preserves completed work and recalculates progress', () => {
  let state = createLearningGuideState({ goal: 'math', diagnostic: { answers: completeAnswers } });
  state = setModuleCompletion(state, 'C1', true, new Date('2026-07-25T00:00:00.000Z'));
  state = setModuleCompletion(state, 'M1', true, new Date('2026-07-25T00:01:00.000Z'));
  state = setPrimaryTrack(state, 'history', new Date('2026-07-25T00:02:00.000Z'));
  assert.deepEqual(state.completedModules, ['C1', 'M1']);
  const progress = progressForState(state);
  assert.equal(progress.total, 9);
  assert.equal(progress.completeCount, 1);
  assert.equal(progress.primaryTrack, 'history');
});

test('a new diagnostic goal changes the recommended primary route without discarding completion history', () => {
  let state = createLearningGuideState({ goal: 'math', completedModules: ['C1', 'M1'] });
  state = setDiagnostic(state, { goal: 'systems', answers: completeAnswers }, new Date('2026-07-25T00:03:00.000Z'));
  assert.equal(state.primaryTrack, 'systems');
  assert.deepEqual(state.completedModules, ['C1', 'M1']);
  assert.equal(progressForState(state).completeCount, 1);
});

test('malformed, unsupported, and unavailable storage fail safely', () => {
  assert.equal(parseLearningGuideState('{invalid'), null);
  assert.equal(parseLearningGuideState(JSON.stringify({ version: 999 })), null);
  const brokenStorage = { getItem() { throw new Error('blocked'); } };
  const loaded = loadLearningGuideState(brokenStorage);
  assert.equal(loaded.available, false);
  assert.equal(loaded.state.primaryTrack, 'undecided');
});

test('save stamps a versioned local-only state and reset removes only its own key', () => {
  const storage = memoryStorage({ unrelated: 'keep' });
  const result = saveLearningGuideState(storage, createLearningGuideState({ goal: 'systems' }), new Date('2026-07-25T00:00:00.000Z'));
  assert.equal(result.saved, true);
  assert.equal(JSON.parse(storage.getItem(LEARNING_GUIDE_STORAGE_KEY)).updatedAt, '2026-07-25T00:00:00.000Z');
  assert.equal(resetLearningGuideState(storage), true);
  assert.equal(storage.getItem(LEARNING_GUIDE_STORAGE_KEY), null);
  assert.equal(storage.getItem('unrelated'), 'keep');
});
