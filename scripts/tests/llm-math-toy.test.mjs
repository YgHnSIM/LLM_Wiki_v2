import assert from 'node:assert/strict';
import test from 'node:test';
import {
  centralDifference,
  crossEntropyFromLogits,
  outputLayerBackward,
  outputLayerForward,
  runHubOutputExample,
  softmaxStable,
} from '../llm-math-toy.mjs';

const tolerance = 1e-9;

function assertClose(actual, expected, epsilon = tolerance) {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `expected ${actual} to be within ${epsilon} of ${expected}`,
  );
}

test('stable softmax produces a normalized shift-invariant distribution', () => {
  const base = softmaxStable([0, Math.log(2), Math.log(3)]);
  const shifted = softmaxStable([1000, 1000 + Math.log(2), 1000 + Math.log(3)]);
  assertClose(base.reduce((sum, value) => sum + value, 0), 1);
  base.forEach((value, index) => assertClose(value, shifted[index], 1e-13));
});

test('hub output example reproduces the documented logits, probabilities, and loss', () => {
  const result = runHubOutputExample();
  const expectedLogits = [0, 0.3302384506733431, 1.6697615493266569, 3.0092846479799706];
  const expectedProbabilities = [
    0.03574608238334361,
    0.049733518889958785,
    0.18984391390551178,
    0.7246764848211859,
  ];
  result.logits.forEach((value, index) => assertClose(value, expectedLogits[index]));
  result.probabilities.forEach((value, index) => assertClose(value, expectedProbabilities[index]));
  assertClose(result.loss, 0.3220299515495762);
});

test('output-layer gradients preserve parameter and representation shapes', () => {
  const result = runHubOutputExample();
  assert.deepEqual(
    [result.dWeights.length, result.dWeights[0].length],
    [result.weights.length, result.weights[0].length],
  );
  assert.equal(result.dBias.length, result.bias.length);
  assert.equal(result.dRepresentation.length, result.representation.length);
  assertClose(result.dLogits.reduce((sum, value) => sum + value, 0), 0);
  assertClose(result.dRepresentation[0], 0.32505703406877295);
  assertClose(result.dRepresentation[1], -0.3608031164521165);
});

test('analytic output-layer gradients agree with central differences', () => {
  const result = runHubOutputExample();
  result.dWeights.forEach((row, rowIndex) => row.forEach((value, columnIndex) => {
    assertClose(value, result.numericalWeightGradient[rowIndex][columnIndex], 1e-9);
  }));
  result.dBias.forEach((value, index) => {
    assertClose(value, result.numericalBiasGradient[index], 1e-9);
  });
  assertClose(result.dWeights[1][3], -0.459724619271038);
});

test('one small SGD step on the full output layer lowers this example loss', () => {
  const result = runHubOutputExample();
  assert.ok(result.afterUpdate.loss < result.loss);
  assert.ok(result.afterUpdate.probabilities[result.target] > result.probabilities[result.target]);
});

test('public helpers reject invalid targets and differentiate a scalar function', () => {
  assert.throws(() => crossEntropyFromLogits([0, 1], 2), RangeError);
  assert.throws(
    () => outputLayerForward([1], [[1, 2]], [0], 0),
    /weights must have shape/,
  );
  assert.throws(
    () => outputLayerBackward([1], [[1]], [1], -1),
    RangeError,
  );
  assertClose(centralDifference((value) => value ** 2, 3), 6, 1e-9);
});
