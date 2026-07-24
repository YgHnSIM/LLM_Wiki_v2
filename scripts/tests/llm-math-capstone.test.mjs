import assert from 'node:assert/strict';
import test from 'node:test';
import { runIntegratedCapstone } from '../llm-math-capstone.mjs';

function assertClose(actual, expected, epsilon = 1e-9) {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `expected ${actual} to be within ${epsilon} of ${expected}`,
  );
}

test('capstone lookup and causal attention use the intended token and key axes', () => {
  const result = runIntegratedCapstone();
  assert.deepEqual(result.embeddings, [[1, 0], [0, 1]]);
  assert.deepEqual(result.attentionWeights, [[1, 0], [0.5, 0.5]]);
  assert.deepEqual(result.attentionOutput, [[1, 0], [0.5, 0.5]]);
  result.attentionWeights.forEach((row) => {
    assertClose(row.reduce((sum, value) => sum + value, 0), 1);
  });
});

test('residual, LayerNorm, and FFN produce the documented representation', () => {
  const result = runIntegratedCapstone();
  assert.deepEqual(result.attentionResidual, [[2, 0], [0.5, 1.5]]);
  assert.deepEqual(result.layerNormStatistics, [
    { mean: 1, variance: 1 },
    { mean: 1, variance: 0.25 },
  ]);
  assert.deepEqual(result.normalized, [[1, -1], [-1, 1]]);
  assert.deepEqual(result.feedForwardActivation, [0, 1]);
  assert.deepEqual(result.representation, [-1, 2]);
});

test('capstone logits, probabilities, and NLL have exact simple ratios', () => {
  const result = runIntegratedCapstone();
  assertClose(result.logits[0], Math.log(4));
  assertClose(result.logits[1], Math.log(2));
  assertClose(result.logits[2], 0);
  [4 / 7, 2 / 7, 1 / 7].forEach((expected, index) => {
    assertClose(result.probabilities[index], expected);
  });
  assertClose(result.loss, Math.log(7 / 4));
});

test('full output gradients match exact values and central differences', () => {
  const result = runIntegratedCapstone();
  [-3 / 7, 2 / 7, 1 / 7].forEach((expected, index) => {
    assertClose(result.dLogits[index], expected);
  });
  const expectedWeights = [
    [3 / 7, -2 / 7, -1 / 7],
    [-6 / 7, 4 / 7, 2 / 7],
  ];
  result.dWeights.forEach((row, rowIndex) => row.forEach((value, columnIndex) => {
    assertClose(value, expectedWeights[rowIndex][columnIndex]);
    assertClose(value, result.numericalWeightGradient[rowIndex][columnIndex], 1e-9);
  }));
});

test('FFN residual sends and sums direct and nonlinear branch gradients', () => {
  const result = runIntegratedCapstone();
  assertClose(result.dRepresentation[0], 0);
  assertClose(result.dRepresentation[1], -2 * Math.log(2) / 7);
  assertClose(result.dNormalizedFromFfn[0], 0);
  assertClose(result.dNormalizedFromFfn[1], -2 * Math.log(2) / 7);
  assertClose(result.dNormalized[0], 0);
  assertClose(result.dNormalized[1], -4 * Math.log(2) / 7);
});

test('output update lowers loss and the embedded shape trace stays consistent', () => {
  const result = runIntegratedCapstone();
  assert.ok(result.afterUpdate.loss < result.loss);
  assert.deepEqual(result.shapeTrace.shapes.attentionScores, [1, 1, 2, 2]);
  assert.deepEqual(result.shapeTrace.shapes.feedForwardExpanded, [1, 2, 2]);
  assert.deepEqual(result.shapeTrace.shapes.logits, [1, 2, 3]);
  assert.equal(result.shapeTrace.invariants.residualShapesMatch, true);
});
