export const LEARNING_GUIDE_STORAGE_KEY = 'llm-wiki-learning-guide:v1';
export const LEARNING_GUIDE_VERSION = 1;

export const PRIMARY_TRACKS = Object.freeze(['math', 'history', 'systems']);
export const UNDECIDED_TRACK = 'undecided';

export const CORE_MODULE_IDS = Object.freeze(['C1', 'C2', 'C3']);
export const TRACK_MODULE_IDS = Object.freeze({
  math: Object.freeze(['M1', 'M2', 'M3']),
  history: Object.freeze(['H1', 'H2', 'H3']),
  systems: Object.freeze(['S1', 'S2', 'S3']),
});
export const CROSS_MODULE_IDS = Object.freeze({
  math: Object.freeze(['XH', 'XS']),
  history: Object.freeze(['XM', 'XS']),
  systems: Object.freeze(['XM', 'XH']),
});
export const CAPSTONE_MODULE_ID = 'Z1';
export const ALL_MODULE_IDS = Object.freeze([
  ...CORE_MODULE_IDS,
  ...TRACK_MODULE_IDS.math,
  ...TRACK_MODULE_IDS.history,
  ...TRACK_MODULE_IDS.systems,
  'XM', 'XH', 'XS',
  CAPSTONE_MODULE_ID,
]);

export const DIAGNOSTIC_QUESTIONS = Object.freeze([
  {
    id: 'core-1', area: 'core', correctAnswer: 'next-token-distribution',
    recoveryModule: 'C1', recoveryOwner: '대규모 언어 모델',
    misconception: '한 번의 생성 결과와 다음 token 확률분포를 같은 것으로 보았습니다.',
  },
  {
    id: 'core-2', area: 'core', correctAnswer: 'separate-claim-conditions',
    recoveryModule: 'C3', recoveryOwner: 'N-gram에서 LLM으로',
    misconception: '주장 자체와 입력·조건·평가·출력·한계를 분리하지 않았습니다.',
  },
  {
    id: 'math-1', area: 'math', correctAnswer: 'shape-preserves-axis-meaning',
    recoveryModule: 'M1', recoveryOwner: 'LLM을 만든 수학',
    misconception: 'tensor의 축과 shape가 보존하는 의미를 놓쳤습니다.',
  },
  {
    id: 'math-2', area: 'math', correctAnswer: 'gradient-update-direction',
    recoveryModule: 'M2', recoveryOwner: 'LLM을 만든 수학',
    misconception: 'loss의 미분과 learning rate를 통한 갱신 방향을 구분하지 않았습니다.',
  },
  {
    id: 'history-1', area: 'history', correctAnswer: 'locator',
    recoveryModule: 'H2', recoveryOwner: 'LLM과 컴퓨팅 능력의 공진화',
    misconception: '검증 가능한 주장에 필요한 정확한 원문 위치(locator)를 빠뜨렸습니다.',
  },
  {
    id: 'history-2', area: 'history', correctAnswer: 'comparison-conditions',
    recoveryModule: 'H3', recoveryOwner: 'N-gram에서 LLM으로',
    misconception: '비교·계보 판단을 원래의 조건으로 되돌려 확인하지 않았습니다.',
  },
  {
    id: 'systems-1', area: 'systems', correctAnswer: 'runtime',
    recoveryModule: 'S1', recoveryOwner: 'LLM 능력은 모델의 속성인가 시스템의 속성인가',
    misconception: 'checkpoint의 계산과 runtime이 맡는 문맥·도구·재시도를 섞었습니다.',
  },
  {
    id: 'systems-2', area: 'systems', correctAnswer: 'failure-recovery',
    recoveryModule: 'S3', recoveryOwner: 'LLM 시스템 경계 확장 지도',
    misconception: '출력 형식만 보고 실패·복구·승인 경계를 빠뜨렸습니다.',
  },
]);

const QUESTION_BY_ID = new Map(DIAGNOSTIC_QUESTIONS.map((question) => [question.id, question]));
const AREAS = Object.freeze(['core', 'math', 'history', 'systems']);
const MODULE_SET = new Set(ALL_MODULE_IDS);

function plainRecord(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function cleanString(value, maximum = 160) {
  return typeof value === 'string' ? value.trim().slice(0, maximum) : '';
}

export function normalizeTrack(value) {
  const normalized = cleanString(value, 32).toLowerCase();
  return PRIMARY_TRACKS.includes(normalized) ? normalized : UNDECIDED_TRACK;
}

export const normalizeGoal = normalizeTrack;

export function trackForGoal(goal) {
  return normalizeGoal(goal);
}

export function requiredModuleIds(primaryTrack) {
  const track = normalizeTrack(primaryTrack);
  if (track === UNDECIDED_TRACK) return [...CORE_MODULE_IDS];
  return [
    ...CORE_MODULE_IDS,
    ...TRACK_MODULE_IDS[track],
    ...CROSS_MODULE_IDS[track],
    CAPSTONE_MODULE_ID,
  ];
}

export function normalizeCompletedModules(value) {
  const completed = new Set();
  for (const moduleId of Array.isArray(value) ? value : []) {
    const normalized = cleanString(moduleId, 16).toUpperCase();
    if (MODULE_SET.has(normalized)) completed.add(normalized);
  }
  return ALL_MODULE_IDS.filter((moduleId) => completed.has(moduleId));
}

export function normalizeDiagnosticAnswers(value) {
  const source = plainRecord(value);
  const answers = {};
  for (const question of DIAGNOSTIC_QUESTIONS) {
    const answer = cleanString(source[question.id]);
    if (answer) answers[question.id] = answer;
  }
  return answers;
}

export function scoreDiagnostic(value = {}) {
  const answers = normalizeDiagnosticAnswers(value);
  const areas = Object.fromEntries(AREAS.map((area) => [area, { correct: 0, answered: 0, total: 0 }]));
  const incorrect = [];
  let correct = 0;
  let answered = 0;

  for (const question of DIAGNOSTIC_QUESTIONS) {
    const area = areas[question.area];
    area.total += 1;
    const answer = answers[question.id] || '';
    if (answer) {
      answered += 1;
      area.answered += 1;
    }
    if (answer === question.correctAnswer) {
      correct += 1;
      area.correct += 1;
    } else if (answer) {
      incorrect.push({ ...question, answer });
    }
  }

  return {
    answers,
    correct,
    answered,
    total: DIAGNOSTIC_QUESTIONS.length,
    areas,
    incorrect,
    complete: answered === DIAGNOSTIC_QUESTIONS.length,
  };
}

export function recommendationForDiagnostic({ goal = UNDECIDED_TRACK, primaryTrack, answers = {} } = {}) {
  const scores = scoreDiagnostic(answers);
  const selectedTrack = normalizeTrack(primaryTrack);
  const goalTrack = trackForGoal(goal);
  const selected = selectedTrack !== UNDECIDED_TRACK ? selectedTrack : goalTrack;
  const weakestTrack = [...PRIMARY_TRACKS]
    .sort((left, right) => scores.areas[left].correct - scores.areas[right].correct || PRIMARY_TRACKS.indexOf(left) - PRIMARY_TRACKS.indexOf(right))[0];
  const coreReady = scores.areas.core.correct === scores.areas.core.total;
  return {
    primaryTrack: selected,
    recommendedTrack: selected !== UNDECIDED_TRACK ? selected : weakestTrack,
    needsTrackChoice: selected === UNDECIDED_TRACK,
    startModule: 'C1',
    challengeMode: coreReady,
    scores,
  };
}

function normalizeTimestamp(value) {
  const text = cleanString(value, 64);
  return Number.isFinite(Date.parse(text)) ? text : null;
}

export function createLearningGuideState(value = {}) {
  const source = plainRecord(value);
  const goal = normalizeGoal(source.goal);
  const hasPrimaryTrack = Object.prototype.hasOwnProperty.call(source, 'primaryTrack');
  const primaryTrack = hasPrimaryTrack ? normalizeTrack(source.primaryTrack) : trackForGoal(goal);
  const answers = normalizeDiagnosticAnswers(plainRecord(source.diagnostic).answers ?? source.answers);
  return {
    version: LEARNING_GUIDE_VERSION,
    goal,
    primaryTrack,
    diagnostic: {
      answers,
      scores: scoreDiagnostic(answers),
    },
    completedModules: normalizeCompletedModules(source.completedModules),
    updatedAt: normalizeTimestamp(source.updatedAt),
  };
}

export function parseLearningGuideState(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== LEARNING_GUIDE_VERSION) return null;
    return createLearningGuideState(parsed);
  } catch {
    return null;
  }
}

function withTimestamp(state, now = new Date()) {
  const normalized = createLearningGuideState(state);
  const timestamp = now instanceof Date ? now.toISOString() : new Date(now).toISOString();
  return { ...normalized, updatedAt: timestamp };
}

export function setDiagnostic(state, { goal, answers } = {}, now = new Date()) {
  const current = createLearningGuideState(state);
  const nextGoal = goal === undefined ? current.goal : normalizeGoal(goal);
  const nextAnswers = answers === undefined ? current.diagnostic.answers : normalizeDiagnosticAnswers(answers);
  // A diagnostic goal is the learner's requested primary route.  Keep an
  // independently chosen route only when the learner intentionally returns
  // to the undecided option after the common core.
  const primaryTrack = nextGoal !== UNDECIDED_TRACK
    ? trackForGoal(nextGoal)
    : current.primaryTrack;
  return withTimestamp({
    ...current,
    goal: nextGoal,
    primaryTrack,
    diagnostic: { answers: nextAnswers },
  }, now);
}

export function setPrimaryTrack(state, primaryTrack, now = new Date()) {
  const current = createLearningGuideState(state);
  return withTimestamp({ ...current, primaryTrack: normalizeTrack(primaryTrack) }, now);
}

export function setModuleCompletion(state, moduleId, completed, now = new Date()) {
  const current = createLearningGuideState(state);
  const normalizedModuleId = cleanString(moduleId, 16).toUpperCase();
  if (!MODULE_SET.has(normalizedModuleId)) return current;
  const modules = new Set(current.completedModules);
  if (completed) modules.add(normalizedModuleId);
  else modules.delete(normalizedModuleId);
  return withTimestamp({ ...current, completedModules: [...modules] }, now);
}

export function progressForState(state) {
  const current = createLearningGuideState(state);
  const requiredModules = requiredModuleIds(current.primaryTrack);
  const completed = new Set(current.completedModules);
  const completedRequired = requiredModules.filter((moduleId) => completed.has(moduleId));
  return {
    primaryTrack: current.primaryTrack,
    requiredModules,
    completedRequired,
    completeCount: completedRequired.length,
    total: requiredModules.length,
    ratio: requiredModules.length ? completedRequired.length / requiredModules.length : 0,
    isReadyForCapstone: current.primaryTrack !== UNDECIDED_TRACK
      && requiredModules.slice(0, -1).every((moduleId) => completed.has(moduleId)),
    isComplete: current.primaryTrack !== UNDECIDED_TRACK
      && completedRequired.length === requiredModules.length,
  };
}

export function loadLearningGuideState(storage) {
  if (!storage || typeof storage.getItem !== 'function') {
    return { state: createLearningGuideState(), available: false, restored: false };
  }
  try {
    const state = parseLearningGuideState(storage.getItem(LEARNING_GUIDE_STORAGE_KEY));
    return { state: state ?? createLearningGuideState(), available: true, restored: Boolean(state) };
  } catch {
    return { state: createLearningGuideState(), available: false, restored: false };
  }
}

export function saveLearningGuideState(storage, state, now = new Date()) {
  const nextState = withTimestamp(state, now);
  if (!storage || typeof storage.setItem !== 'function') return { state: nextState, saved: false };
  try {
    storage.setItem(LEARNING_GUIDE_STORAGE_KEY, JSON.stringify(nextState));
    return { state: nextState, saved: true };
  } catch {
    return { state: nextState, saved: false };
  }
}

export function resetLearningGuideState(storage) {
  if (!storage || typeof storage.removeItem !== 'function') return false;
  try {
    storage.removeItem(LEARNING_GUIDE_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
