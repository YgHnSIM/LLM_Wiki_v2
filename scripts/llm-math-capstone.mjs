import { pathToFileURL } from 'node:url';
import { buildTransformerShapeTrace } from './llm-math-shapes.mjs';
import {
  centralDifference,
  outputLayerBackward,
  outputLayerForward,
} from './llm-math-toy.mjs';

function addVectors(left, right) {
  return left.map((value, index) => value + right[index]);
}

function multiplyRowByMatrix(row, matrix) {
  return matrix[0].map((_, column) => (
    row.reduce((sum, value, index) => sum + value * matrix[index][column], 0)
  ));
}

function layerNorm(row, epsilon = 0) {
  const mean = row.reduce((sum, value) => sum + value, 0) / row.length;
  const variance = row.reduce(
    (sum, value) => sum + (value - mean) ** 2,
    0,
  ) / row.length;
  if (variance + epsilon <= 0) {
    throw new RangeError('layerNorm requires positive variance plus epsilon');
  }
  const normalized = row.map((value) => (value - mean) / Math.sqrt(variance + epsilon));
  return { mean, variance, normalized };
}

function causalUniformAttention(values) {
  return values.map((_, query) => {
    const allowed = query + 1;
    const weights = values.map((__, key) => (key < allowed ? 1 / allowed : 0));
    const output = values[0].map((__, feature) => (
      weights.reduce((sum, weight, key) => sum + weight * values[key][feature], 0)
    ));
    return { weights, output };
  });
}

export function runIntegratedCapstone({ learningRate = 0.1 } = {}) {
  const vocabulary = ['온다', '오늘', '비가'];
  const embeddingTable = [
    [0, 0],
    [1, 0],
    [0, 1],
  ];
  const tokenIds = [1, 2];
  const embeddings = tokenIds.map((id) => [...embeddingTable[id]]);
  const attention = causalUniformAttention(embeddings);
  const attentionWeights = attention.map(({ weights }) => weights);
  const attentionOutput = attention.map(({ output }) => output);
  const attentionResidual = embeddings.map((row, index) => (
    addVectors(row, attentionOutput[index])
  ));
  const normalizedRows = attentionResidual.map((row) => layerNorm(row));
  const normalized = normalizedRows.map(({ normalized: row }) => row);

  const finalNormalized = normalized.at(-1);
  const feedForwardInWeight = [
    [1, 0],
    [0, 1],
  ];
  const feedForwardOutWeight = [
    [1, 0],
    [0, 1],
  ];
  const feedForwardPreActivation = multiplyRowByMatrix(
    finalNormalized,
    feedForwardInWeight,
  );
  const feedForwardActivation = feedForwardPreActivation.map((value) => Math.max(0, value));
  const feedForwardOutput = multiplyRowByMatrix(
    feedForwardActivation,
    feedForwardOutWeight,
  );
  const representation = addVectors(finalNormalized, feedForwardOutput);

  const outputWeights = [
    [0, 0, 0],
    [Math.log(2), Math.log(2) / 2, 0],
  ];
  const outputBias = [0, 0, 0];
  const target = 0;
  const forward = outputLayerForward(
    representation,
    outputWeights,
    outputBias,
    target,
  );
  const backward = outputLayerBackward(
    representation,
    outputWeights,
    forward.probabilities,
    target,
  );
  const dFfnResidualInput = [...backward.dRepresentation];
  const dFfnOutput = [...backward.dRepresentation];
  const dFfnActivation = multiplyRowByMatrix(
    dFfnOutput,
    [
      [1, 0],
      [0, 1],
    ],
  );
  const dFfnPreActivation = dFfnActivation.map((value, index) => (
    feedForwardPreActivation[index] > 0 ? value : 0
  ));
  const dNormalizedFromFfn = multiplyRowByMatrix(
    dFfnPreActivation,
    [
      [1, 0],
      [0, 1],
    ],
  );
  const dNormalized = addVectors(dFfnResidualInput, dNormalizedFromFfn);

  const numericalWeightGradient = outputWeights.map(
    (row, rowIndex) => row.map((value, columnIndex) => (
      centralDifference((candidateValue) => {
        const changed = outputWeights.map((source) => [...source]);
        changed[rowIndex][columnIndex] = candidateValue;
        return outputLayerForward(representation, changed, outputBias, target).loss;
      }, value)
    )),
  );
  const updatedOutputWeights = outputWeights.map(
    (row, rowIndex) => row.map((value, columnIndex) => (
      value - learningRate * backward.dWeights[rowIndex][columnIndex]
    )),
  );
  const updatedOutputBias = outputBias.map(
    (value, index) => value - learningRate * backward.dBias[index],
  );
  const afterUpdate = outputLayerForward(
    representation,
    updatedOutputWeights,
    updatedOutputBias,
    target,
  );
  const shapeTrace = buildTransformerShapeTrace({
    batch: 1,
    sequence: 2,
    model: 2,
    heads: 1,
    feedForward: 2,
    vocabulary: 3,
  });

  return {
    vocabulary,
    embeddingTable,
    tokenIds,
    embeddings,
    attentionWeights,
    attentionOutput,
    attentionResidual,
    layerNormStatistics: normalizedRows.map(({ mean, variance }) => ({ mean, variance })),
    normalized,
    feedForwardPreActivation,
    feedForwardActivation,
    feedForwardOutput,
    representation,
    outputWeights,
    outputBias,
    target,
    ...forward,
    ...backward,
    dFfnResidualInput,
    dFfnOutput,
    dFfnPreActivation,
    dNormalizedFromFfn,
    dNormalized,
    numericalWeightGradient,
    learningRate,
    updatedOutputWeights,
    updatedOutputBias,
    afterUpdate,
    shapeTrace,
  };
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (import.meta.url === invokedPath) {
  console.log(JSON.stringify(runIntegratedCapstone(), null, 2));
}
