import {
  DIAGNOSTIC_QUESTIONS,
  LEARNING_GUIDE_VERSION,
  createLearningGuideState,
  loadLearningGuideState,
  progressForState,
  recommendationForDiagnostic,
  resetLearningGuideState,
  saveLearningGuideState,
  setDiagnostic,
  setModuleCompletion,
  setPrimaryTrack,
} from './learning-guide-state.js';

function availableStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function textElement(parent, attribute, tagName = 'p') {
  let element = parent.querySelector(`[${attribute}]`);
  if (!element) {
    element = document.createElement(tagName);
    element.setAttribute(attribute, '');
    parent.append(element);
  }
  return element;
}

function moduleControl(marker) {
  if (marker.matches('input[type="checkbox"]')) return marker;
  return marker.querySelector('input[type="checkbox"]');
}

function diagnosticAnswers(form) {
  const answers = {};
  for (const question of DIAGNOSTIC_QUESTIONS) {
    const fieldset = [...form.querySelectorAll('[data-learning-question]')]
      .find((element) => element.dataset.learningQuestion === question.id);
    const selected = fieldset?.querySelector('[data-learning-answer]:checked')
      ?? form.querySelector(`input[name="${question.id}"]:checked`);
    const answer = selected?.dataset.learningAnswer || selected?.value;
    if (answer) answers[question.id] = answer;
  }
  return answers;
}

function diagnosticGoal(form) {
  const selected = form.querySelector('[data-learning-goal]:checked')
    ?? form.querySelector('input[name="learning-goal"]:checked');
  return selected?.value ?? 'undecided';
}

function setCompletionMarker(marker, complete) {
  marker.dataset.complete = String(Boolean(complete));
  marker.closest('[data-learning-module-card]')?.setAttribute('data-complete', String(Boolean(complete)));
}

function createListItem(text) {
  const item = document.createElement('li');
  item.textContent = text;
  return item;
}

function setupLearningGuide() {
  const guide = document.querySelector('[data-learning-guide]') ?? document;
  const storage = availableStorage();
  const loaded = loadLearningGuideState(storage);
  let state = loaded.state;

  const form = document.querySelector('[data-learning-diagnostic]');
  const result = guide.querySelector('[data-learning-diagnostic-result]')
    ?? document.querySelector('[data-learning-diagnostic-result]');
  const diagnosticSubmit = form?.querySelector('[data-learning-diagnostic-submit]');
  const primaryTrack = document.querySelector('[data-learning-primary-track]');
  const progressMount = document.querySelector('[data-learning-progress]');
  const resetButton = document.querySelector('[data-learning-reset]');
  const markers = [...document.querySelectorAll('[data-learning-module]')];
  const storageStatus = progressMount ? textElement(progressMount, 'data-learning-storage-status') : null;
  const progressText = progressMount ? textElement(progressMount, 'data-learning-progress-text') : null;
  const progressSummary = progressMount ? textElement(progressMount, 'data-learning-progress-summary', 'strong') : null;

  function persist(nextState) {
    const saved = saveLearningGuideState(storage, nextState);
    state = saved.state;
    if (storageStatus) {
      storageStatus.textContent = saved.saved
        ? '진도는 이 브라우저에만 저장됩니다. 페이지를 방문했다고 완료되지는 않습니다.'
        : '이 브라우저에서는 진도를 저장할 수 없습니다. 이 페이지를 떠나면 표시한 완료 상태가 사라집니다.';
      storageStatus.dataset.available = String(saved.saved);
    }
    return saved;
  }

  function renderProgress() {
    if (!progressMount) return;
    const progress = progressForState(state);
    const trackLabels = { math: '수학·모델 계산', history: '역사·근거', systems: '시스템·평가' };
    progressMount.dataset.primaryTrack = progress.primaryTrack;
    progressMount.dataset.complete = String(progress.isComplete);
    if (progress.primaryTrack === 'undecided') {
      progressSummary.textContent = `공통 코어 ${progress.completeCount}/${progress.total} 완료`;
      progressText.textContent = 'C1–C3을 마친 뒤 주 전공을 선택하면 9단위 경로와 종합 과제가 표시됩니다.';
    } else {
      progressSummary.textContent = `${trackLabels[progress.primaryTrack]} 경로 ${progress.completeCount}/${progress.total} 완료`;
      progressText.textContent = progress.isComplete
        ? '종합 과제까지 직접 완료로 표시했습니다. 17/20점과 치명적 오류 0개 기준을 다시 확인하세요.'
        : '각 산출물과 통과 기준을 확인한 뒤에만 완료 표시를 바꾸세요.';
    }
    const completed = new Set(state.completedModules);
    for (const marker of markers) {
      const moduleId = marker.dataset.learningModule;
      const isComplete = completed.has(moduleId);
      const control = moduleControl(marker);
      if (control) control.checked = isComplete;
      setCompletionMarker(marker, isComplete);
    }
  }

  function answerFeedback(fieldset, message, status) {
    let feedback = fieldset.querySelector('[data-learning-answer-feedback]');
    if (!feedback) {
      feedback = document.createElement('p');
      feedback.setAttribute('data-learning-answer-feedback', '');
      feedback.setAttribute('role', 'status');
      feedback.setAttribute('aria-live', 'polite');
      fieldset.append(feedback);
    }
    feedback.textContent = message;
    feedback.dataset.status = status;
  }

  function renderDiagnostic({ focus = false } = {}) {
    if (!form || !result) return;
    const recommendation = recommendationForDiagnostic({
      goal: state.goal,
      primaryTrack: state.primaryTrack,
      answers: state.diagnostic.answers,
    });
    const { scores } = recommendation;
    result.replaceChildren();
    const heading = document.createElement('strong');
    const trackLabels = { math: '수학·모델 계산', history: '역사·근거', systems: '시스템·평가' };
    heading.textContent = recommendation.needsTrackChoice
      ? `공통 코어부터 시작하세요. 이후 추천 전공은 ${trackLabels[recommendation.recommendedTrack]}입니다.`
      : `주 전공: ${trackLabels[recommendation.primaryTrack]}. 공통 코어부터 시작하세요.`;
    result.append(heading);

    const summary = document.createElement('p');
    summary.textContent = `${scores.total}문항 중 ${scores.correct}문항을 확인했습니다. ${recommendation.challengeMode ? 'C1–C3은 설명을 줄이고 산출물로 바로 통과를 시도할 수 있습니다.' : 'C1–C3의 설명과 산출물을 차례로 확인하세요.'}`;
    result.append(summary);

    const list = document.createElement('ul');
    for (const question of DIAGNOSTIC_QUESTIONS) {
      const fieldset = [...form.querySelectorAll('[data-learning-question]')]
        .find((element) => element.dataset.learningQuestion === question.id);
      const answer = scores.answers[question.id];
      if (!answer) {
        answerFeedback(fieldset, '아직 답하지 않았습니다. 정적 해설을 읽고 다시 답해 보세요.', 'unanswered');
        continue;
      }
      if (answer === question.correctAnswer) {
        answerFeedback(fieldset, '확인했습니다. 다음 질문 또는 산출물로 이어가세요.', 'correct');
        continue;
      }
      const feedback = `${question.misconception} ${question.recoveryModule}의 ${question.recoveryOwner}로 돌아가 새 사례에 다시 적용하세요.`;
      answerFeedback(fieldset, feedback, 'incorrect');
      list.append(createListItem(`${question.recoveryModule} 복귀 — ${feedback}`));
    }
    if (list.children.length) result.append(list);
    if (focus) result.focus();
  }

  function restoreForm() {
    if (!form) return;
    for (const [questionId, answer] of Object.entries(state.diagnostic.answers)) {
      const choice = [...form.querySelectorAll(`[name="${questionId}"]`)]
        .find((input) => (input.dataset.learningAnswer || input.value) === answer);
      if (choice) choice.checked = true;
    }
    const goal = [...form.querySelectorAll('[data-learning-goal], input[name="learning-goal"]')]
      .find((input) => input.value === state.goal);
    if (goal) goal.checked = true;
    if (primaryTrack) primaryTrack.value = state.primaryTrack;
  }

  restoreForm();
  renderProgress();
  if (storageStatus) {
    storageStatus.textContent = loaded.available
      ? (loaded.restored ? '이전 학습 기록을 이 브라우저에서 불러왔습니다.' : '진도는 이 브라우저에만 저장됩니다. 페이지를 방문했다고 완료되지는 않습니다.')
      : '이 브라우저에서는 진도를 저장할 수 없습니다. 이 페이지를 떠나면 표시한 완료 상태가 사라집니다.';
    storageStatus.dataset.available = String(loaded.available);
  }
  if (form && Object.keys(state.diagnostic.answers).length) renderDiagnostic();

  function runDiagnostic(event) {
    event?.preventDefault();
    const goal = diagnosticGoal(form);
    state = setDiagnostic(state, { goal, answers: diagnosticAnswers(form) });
    if (goal === 'undecided' && primaryTrack?.value && primaryTrack.value !== 'undecided') {
      state = setPrimaryTrack(state, primaryTrack.value);
    }
    persist(state);
    if (primaryTrack) primaryTrack.value = state.primaryTrack;
    renderProgress();
    renderDiagnostic({ focus: true });
  }

  form?.addEventListener('submit', runDiagnostic);
  diagnosticSubmit?.addEventListener('click', runDiagnostic);

  primaryTrack?.addEventListener('change', () => {
    state = setPrimaryTrack(state, primaryTrack.value);
    persist(state);
    renderProgress();
    if (form && Object.keys(state.diagnostic.answers).length) renderDiagnostic();
  });

  for (const marker of markers) {
    const control = moduleControl(marker);
    if (!control) continue;
    control.addEventListener('change', () => {
      state = setModuleCompletion(state, marker.dataset.learningModule, control.checked);
      persist(state);
      renderProgress();
    });
  }

  resetButton?.addEventListener('click', () => {
    if (!window.confirm('이 브라우저에 저장된 학습 진단과 완료 표시를 초기화할까요?')) return;
    const resetSaved = resetLearningGuideState(storage);
    state = createLearningGuideState();
    form?.reset();
    if (primaryTrack) primaryTrack.value = state.primaryTrack;
    if (result) result.replaceChildren();
    for (const feedback of document.querySelectorAll('[data-learning-answer-feedback]')) feedback.remove();
    renderProgress();
    if (storageStatus) {
      storageStatus.textContent = resetSaved
        ? '이 브라우저에 저장된 학습 기록을 초기화했습니다.'
        : '현재 화면의 학습 기록을 초기화했습니다. 이 브라우저에서는 저장소에 접근할 수 없습니다.';
      storageStatus.dataset.available = String(resetSaved);
    }
  });

  guide.dataset.learningGuideVersion = String(LEARNING_GUIDE_VERSION);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupLearningGuide, { once: true });
else setupLearningGuide();
