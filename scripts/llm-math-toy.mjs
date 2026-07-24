import { pathToFileURL } from 'node:url';

function assertFiniteVector(name, values) {
  if (!Array.isArray(values) || values.length === 0 || values.some((value) => !Number.isFinite(value))) {
    throw new TypeError(`${name} must be a non-empty finite number array`);
  }
}

function assertOutputLayerShapes(r, weights, bias) {
  assertFiniteVector('r', r);
  assertFiniteVector('bias', bias);
  if (
    !Array.isArray(weights)
    || weights.length !== r.length
    || weights.some((row) => !Array.isArray(row) || row.length !== bias.length)
  ) {
    throw new TypeError('weights must have shape [r.length, bias.length]');
  }
  for (const [index, row] of weights.entries()) {
    assertFiniteVector(`weights[${index}]`, row);
  }
}

export function softmaxStable(logits) {
  assertFiniteVector('logits', logits);
  const maximum = Math.max(...logits);
  const exponentials = logits.map((logit) => Math.exp(logit - maximum));
  const denominator = exponentials.reduce((sum, value) => sum + value, 0);
  return exponentials.map((value) => value / denominator);
}

export function crossEntropyFromLogits(logits, target) {
  if (!Number.isInteger(target) || target < 0 || target >= logits.length) {
    throw new RangeError('target must be a valid zero-based logit index');
  }
  const probabilities = softmaxStable(logits);
  return {
    probabilities,
    loss: -Math.log(probabilities[target]),
  };
}

export function outputLayerForward(r, weights, bias, target) {
  assertOutputLayerShapes(r, weights, bias);
  const logits = bias.map((offset, candidate) => (
    offset + r.reduce((sum, feature, index) => sum + feature * weights[index][candidate], 0)
  ));
  const { probabilities, loss } = crossEntropyFromLogits(logits, target);
  return { logits, probabilities, loss };
}

export function outputLayerBackward(r, weights, probabilities, target) {
  assertOutputLayerShapes(r, weights, probabilities);
  if (!Number.isInteger(target) || target < 0 || target >= probabilities.length) {
    throw new RangeError('target must be a valid zero-based probability index');
  }
  const dLogits = probabilities.map((probability, candidate) => (
    probability - Number(candidate === target)
  ));
  const dBias = [...dLogits];
  const dWeights = r.map((feature) => dLogits.map((gradient) => feature * gradient));
  const dRepresentation = r.map((_, feature) => (
    dLogits.reduce(
      (sum, gradient, candidate) => sum + gradient * weights[feature][candidate],
      0,
    )
  ));
  return { dLogits, dBias, dWeights, dRepresentation };
}

export function centralDifference(fn, value, epsilon = 1e-5) {
  if (!Number.isFinite(value) || !Number.isFinite(epsilon) || epsilon <= 0) {
    throw new TypeError('value must be finite and epsilon must be positive');
  }
  return (fn(value + epsilon) - fn(value - epsilon)) / (2 * epsilon);
}

export function runHubOutputExample({ learningRate = 0.1 } = {}) {
  const attentionFirstWeight = 1 / (1 + Math.exp(1 / Math.sqrt(2)));
  const representation = [attentionFirstWeight, 2 - attentionFirstWeight];
  const weights = [
    [0, 1, 0, -1],
    [0, 0, 1, 2],
  ];
  const bias = [0, 0, 0, 0];
  const target = 3;
  const forward = outputLayerForward(representation, weights, bias, target);
  const backward = outputLayerBackward(
    representation,
    weights,
    forward.probabilities,
    target,
  );

  const numericalWeightGradient = weights.map((row, rowIndex) => row.map((value, columnIndex) => (
    centralDifference((candidateValue) => {
      const changedWeights = weights.map((sourceRow) => [...sourceRow]);
      changedWeights[rowIndex][columnIndex] = candidateValue;
      return outputLayerForward(representation, changedWeights, bias, target).loss;
    }, value)
  )));

  const numericalBiasGradient = bias.map((value, index) => (
    centralDifference((candidateValue) => {
      const changedBias = [...bias];
      changedBias[index] = candidateValue;
      return outputLayerForward(representation, weights, changedBias, target).loss;
    }, value)
  ));

  const updatedWeights = weights.map((row, rowIndex) => row.map((value, columnIndex) => (
    value - learningRate * backward.dWeights[rowIndex][columnIndex]
  )));
  const updatedBias = bias.map((value, index) => value - learningRate * backward.dBias[index]);
  const afterUpdate = outputLayerForward(
    representation,
    updatedWeights,
    updatedBias,
    target,
  );

  return {
    representation,
    weights,
    bias,
    target,
    ...forward,
    ...backward,
    numericalWeightGradient,
    numericalBiasGradient,
    learningRate,
    updatedWeights,
    updatedBias,
    afterUpdate,
  };
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (import.meta.url === invokedPath) {
  console.log(JSON.stringify(runHubOutputExample(), null, 2));
}
