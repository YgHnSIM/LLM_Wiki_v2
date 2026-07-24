import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildTransformerShapeTrace,
  formatShape,
  shapeSize,
} from '../llm-math-shapes.mjs';

test('default Transformer trace follows batch, head, sequence, and feature axes', () => {
  const trace = buildTransformerShapeTrace();
  assert.deepEqual(trace.shapes.embedding, [2, 4, 8]);
  assert.deepEqual(trace.shapes.queriesByHead, [2, 2, 4, 4]);
  assert.deepEqual(trace.shapes.attentionScores, [2, 2, 4, 4]);
  assert.deepEqual(trace.shapes.concatenatedHeads, [2, 4, 8]);
  assert.deepEqual(trace.shapes.feedForwardExpanded, [2, 4, 16]);
  assert.deepEqual(trace.shapes.logits, [2, 4, 10]);
});

test('residual, LayerNorm, and parameter-gradient invariants are explicit', () => {
  const trace = buildTransformerShapeTrace();
  assert.equal(trace.invariants.residualShapesMatch, true);
  assert.equal(trace.invariants.layerNormReducesOnlyModelAxis, true);
  assert.equal(trace.invariants.parameterGradientShapesMatch, true);
  assert.deepEqual(trace.shapes.layerNormStatistics, [2, 4, 1]);
  assert.deepEqual(trace.gradients.feedForwardInWeight, [8, 16]);
  assert.deepEqual(trace.gradients.vocabularyWeight, [8, 10]);
});

test('head splitting requires an exact model-width partition', () => {
  assert.throws(
    () => buildTransformerShapeTrace({ model: 10, heads: 3 }),
    /model must be divisible by heads/,
  );
  const trace = buildTransformerShapeTrace({ model: 12, heads: 3 });
  assert.equal(trace.config.head, 4);
  assert.equal(trace.invariants.concatenatedWidth, 12);
});

test('attention score storage grows quadratically with sequence length', () => {
  const short = buildTransformerShapeTrace({ sequence: 4 });
  const long = buildTransformerShapeTrace({ sequence: 8 });
  assert.equal(long.invariants.attentionScoreElements, 4 * short.invariants.attentionScoreElements);
  assert.equal(long.invariants.logitElements, 2 * short.invariants.logitElements);
});

test('custom production-like dimensions retain expected operator shapes', () => {
  const trace = buildTransformerShapeTrace({
    batch: 3,
    sequence: 5,
    model: 12,
    heads: 3,
    feedForward: 48,
    vocabulary: 32_000,
  });
  assert.deepEqual(trace.shapes.queriesByHead, [3, 3, 5, 4]);
  assert.deepEqual(trace.shapes.attentionScores, [3, 3, 5, 5]);
  assert.deepEqual(trace.shapes.feedForwardExpanded, [3, 5, 48]);
  assert.deepEqual(trace.shapes.logits, [3, 5, 32_000]);
});

test('shape helpers keep scalar and tensor conventions visible', () => {
  assert.equal(shapeSize([]), 1);
  assert.equal(shapeSize([2, 3, 4]), 24);
  assert.equal(formatShape([2, 3, 4]), '(2, 3, 4)');
  assert.equal(formatShape([]), '()');
});
