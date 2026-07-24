import { pathToFileURL } from 'node:url';

function positiveInteger(name, value) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new TypeError(`${name} must be a positive integer`);
  }
}

function sameShape(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

export function shapeSize(shape) {
  return shape.reduce((product, dimension) => product * dimension, 1);
}

export function formatShape(shape) {
  return `(${shape.join(', ')})`;
}

export function buildTransformerShapeTrace({
  batch = 2,
  sequence = 4,
  model = 8,
  heads = 2,
  feedForward = 16,
  vocabulary = 10,
} = {}) {
  const config = { batch, sequence, model, heads, feedForward, vocabulary };
  for (const [name, value] of Object.entries(config)) {
    positiveInteger(name, value);
  }
  if (model % heads !== 0) {
    throw new RangeError('model must be divisible by heads');
  }
  const head = model / heads;
  const shapes = {
    tokenIds: [batch, sequence],
    embedding: [batch, sequence, model],
    qkvPacked: [batch, sequence, 3 * model],
    queriesByHead: [batch, heads, sequence, head],
    keysByHead: [batch, heads, sequence, head],
    valuesByHead: [batch, heads, sequence, head],
    attentionScores: [batch, heads, sequence, sequence],
    attentionWeights: [batch, heads, sequence, sequence],
    headOutput: [batch, heads, sequence, head],
    concatenatedHeads: [batch, sequence, model],
    attentionProjection: [batch, sequence, model],
    attentionResidual: [batch, sequence, model],
    layerNormStatistics: [batch, sequence, 1],
    afterAttentionNorm: [batch, sequence, model],
    feedForwardExpanded: [batch, sequence, feedForward],
    activation: [batch, sequence, feedForward],
    feedForwardContracted: [batch, sequence, model],
    feedForwardResidual: [batch, sequence, model],
    blockOutput: [batch, sequence, model],
    logits: [batch, sequence, vocabulary],
    targets: [batch, sequence],
    meanLoss: [],
  };
  const parameters = {
    embeddingTable: [vocabulary, model],
    qkvWeight: [model, 3 * model],
    qkvBias: [3 * model],
    outputProjectionWeight: [model, model],
    outputProjectionBias: [model],
    layerNormScale: [model],
    layerNormBias: [model],
    feedForwardInWeight: [model, feedForward],
    feedForwardInBias: [feedForward],
    feedForwardOutWeight: [feedForward, model],
    feedForwardOutBias: [model],
    vocabularyWeight: [model, vocabulary],
    vocabularyBias: [vocabulary],
  };
  const gradients = Object.fromEntries(
    Object.entries(parameters).map(([name, shape]) => [name, [...shape]]),
  );

  const invariants = {
    perHeadWidth: head,
    concatenatedWidth: heads * head,
    residualShapesMatch:
      sameShape(shapes.embedding, shapes.attentionProjection)
      && sameShape(shapes.afterAttentionNorm, shapes.feedForwardContracted),
    layerNormReducesOnlyModelAxis:
      sameShape(shapes.layerNormStatistics, [batch, sequence, 1]),
    parameterGradientShapesMatch: Object.entries(parameters).every(
      ([name, shape]) => sameShape(shape, gradients[name]),
    ),
    attentionScoreElements: shapeSize(shapes.attentionScores),
    logitElements: shapeSize(shapes.logits),
    parameterCount: Object.values(parameters).reduce(
      (sum, shape) => sum + shapeSize(shape),
      0,
    ),
  };
  return { config: { ...config, head }, shapes, parameters, gradients, invariants };
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (import.meta.url === invokedPath) {
  console.log(JSON.stringify(buildTransformerShapeTrace(), null, 2));
}
