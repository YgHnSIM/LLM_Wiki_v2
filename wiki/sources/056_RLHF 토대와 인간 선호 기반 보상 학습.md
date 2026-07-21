---
schema_version: 2
id: source.056
page_type: source
title: RLHF 토대와 인간 선호 기반 보상 학습
aliases:
  - 056_RLHF Foundations Learning from Human Preferences in Reinforcement Learning
  - Deep Reinforcement Learning from Human Preferences
tags:
  - type/source
  - domain/ai
  - domain/nlp
  - domain/machine-learning
created: '2026-07-20'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/056_RLHF Foundations Learning from Human Preferences in Reinforcement Learning.ko.md'
  - 'raw/056_RLHF Foundations Learning from Human Preferences in Reinforcement Learning.commentary.ko.md'
evidence:
  - source_id: christiano-et-al-2017-human-preferences
    locator: '초록과 §§2–4의 trajectory segment 비교·reward ensemble·정책 반복 학습, §§5–6의 Atari·simulated robotics'
    relation: supports
  - source_id: ziegler-et-al-2019-lm-preferences
    locator: '초록과 §§2–4의 선호 기반 언어 모델 미세조정 네 과제'
    relation: contextualizes
  - source_id: stiennon-et-al-2020-human-feedback-summarization
    locator: '초록과 §§2–4의 human comparison·reward model·PPO summarization policy'
    relation: contextualizes
  - source_id: ouyang-et-al-2022-instructgpt
    locator: '초록과 §§3–4, Figure 2의 SFT·ranking·reward model·PPO와 인간 평가'
    relation: supplements
related:
  - concept.rlhf
  - concept.대규모-언어-모델
  - concept.transformer
---
# RLHF 토대와 인간 선호 기반 보상 학습

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** 정책과 보상의 기초 개념<br>
> **읽고 나면:** 인간의 쌍대 비교가 보상 모델과 정책 갱신으로 이어지는 순환을 설명하고 2017년 실험과 후대 언어 모델 RLHF를 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

원문은 2017년 「Deep Reinforcement Learning from Human Preferences」를 현대 언어 모델 RLHF의 토대로 설명한다. 방향은 맞지만 원 제어·게임 실험과 2019–2022년 언어 모델 보상 학습·PPO 파이프라인, 현재 상용 모델의 비공개 훈련을 한 사건처럼 연결한다. 공개 문서는 실제 비교 단위·학습 순환·실험 범위와 후속 계보를 나누어 검증한다.

### 핵심 문장

- 2017년 연구는 짧은 행동 구간의 인간 비교로 보상 모델을 학습하고 정책과 반복 갱신하는 틀을 보였다.
- 원 실험은 Atari와 시뮬레이션 제어이며 현대 언어 모델 RLHF는 후속 적용이다.
- 보상 모델은 인간 가치 자체가 아니라 정해진 평가 분포의 선호를 근사한다.
- 인간 비교는 보상 명세 부담을 줄이지만 대표성·비용·보상 해킹 문제를 없애지 않는다.

## 2단계 — 작동 원리

### 손작성 보상 대신 비교 판단

복잡한 목표를 하나의 보상식으로 작성하면 의도에서 빠진 부분이 생기고 정책이 허점을 악용할 수 있다. 2017년 연구는 사람이 두 개의 짧은 trajectory segment를 보고 더 나은 쪽을 선택하게 했다. 보상 모델은 각 구간의 시점별 예측 보상 합으로 선택 확률을 계산하고 인간 라벨의 교차 엔트로피를 최소화했다.

절대 보상 수치를 사람이 지정한 것이 아니다. 비교에서 식별되는 것은 주로 상대 순위이며 보상에 상수를 더하는 변환 등은 선호 확률을 바꾸지 않을 수 있다. 학습된 스칼라를 인간 가치의 절대 측정값으로 읽지 않는다.

### 정책과 보상 모델의 반복 학습

초기 정책이 구간을 만들고 사람이 비교하면 보상 모델을 학습한다. 에이전트는 예측 보상을 최대화하도록 업데이트되고, 바뀐 정책의 새 구간을 다시 비교한다. 정책이 만들어 내는 자료 분포와 보상 모델 훈련 자료를 반복해서 맞추는 과정이다.

여러 보상 모델의 예측 불일치는 다음에 물을 구간을 고르는 능동 질의 신호로 쓰였다. raw가 말하듯 불확실성을 고려했지만, 단일 보상 모델이 잘 보정된 확신도까지 공동 학습했다고 확대하지 않는다.

## 3단계 — 기술과 근거

### 원 실험의 실제 범위

논문은 Atari와 MuJoCo형 시뮬레이션 로봇 이동·제어 과제를 다뤘다. 인간이 환경 상호작용의 1% 미만을 관찰해 비교를 제공하면서 복잡한 과제를 학습할 수 있다고 보고했고, 일부 새 행동에는 약 한 시간의 인간 시간이 들었다.

가정용 실제 로봇의 깨지기 쉬운 물건 처리, 추천 시스템, 자율주행, 코드·이미지 생성은 원 실험 결과가 아니라 가능한 응용 또는 후대 확장이다. 2017년 연구는 자연어 응답의 도움됨·정직성·무해성도 측정하지 않았다.

### 언어 모델 RLHF로 이어진 단계

2019년 Ziegler 등은 GPT-2 계열 출력의 인간 비교에서 보상 모델을 학습하고 PPO로 언어 모델을 미세조정했다. 2020년 Stiennon 등은 요약 비교와 보상 모델을 더 큰 인간 평가로 연결했다. 2022년 InstructGPT는 평가자 시연 SFT, 응답 순위 보상 모델, PPO 정책 미세조정이라는 세 단계를 명시했다.

이 계보에서 2017년 연구가 제공한 것은 **선호 비교 → 보상 모델 → 정책 최적화 → 새 비교**라는 일반 인터페이스다. 사전학습된 [[Transformer]], prompt 분포, SFT, token별 정책, KL penalty와 언어 품질 평가는 후대에 추가됐다.

## 검증과 한계

### 무엇이 확장되고 무엇이 남는가

보상 모델은 사람이 모든 출력을 평가하지 않아도 비교 패턴을 일반화한다. 그러나 일반화 범위는 평가자·지침·prompt·정책 분포에 묶인다. 정책이 보상 모델을 강하게 최적화하면 모델의 오류를 찾아 높은 점수만 얻는 보상 해킹이 생길 수 있다.

쌍대 비교는 평가자가 수치 보상을 만드는 부담을 줄이지만 여러 가치의 절충을 한 순위로 압축한다. 사람 사이 불일치, 집단 대표성, 문화적 맥락과 비교 불가능한 선택은 별도 설계가 필요하다. 피드백 비용도 사라지지 않는다.

### 검증 정정

- **2017년에 현대 LLM RLHF가 완성됐다**: 원 논문은 Atari·시뮬레이션 제어였고 언어 적용은 2019년 이후 별도 단계다.
- **보상 모델은 인간 가치의 절대 점수를 배운다**: 수집된 쌍대 비교의 상대 순위를 예측하는 proxy다.
- **단일 보상 모델이 확신도를 직접 학습했다**: 원 방법의 query 선택은 reward ensemble의 예측 불일치를 사용했다.
- **기존 RL 알고리즘은 아무 수정 없이 그대로 적용된다**: 학습 보상·반복 자료 수집·정규화와 환경별 정책 알고리즘을 결합했으며 전체 파이프라인 변경이 필요하다.
- **소량 비교면 인간 감독 병목이 해결된다**: 원 과제에서는 1% 미만 관찰이 효과적이었지만 언어·새 영역의 평가 비용과 품질 관리는 남는다.
- **RLHF가 도움됨·사실성·안전성을 보장한다**: 선호 분포에서 개선할 수 있지만 평가 밖 일반화와 보상 해킹을 보장하지 않는다.
- **모든 현대 상용 언어 모델이 같은 RLHF를 쓴다**: 공개된 시스템마다 절차가 다르고 비공개 세부를 이 자료만으로 확정할 수 없다.

## 학습 확인

### 확인 질문

1. 사람이 절대 보상값 대신 두 행동 구간을 비교하면 모델은 무엇을 학습하는가?
2. 정책과 보상 모델은 새 행동 자료를 사이에 두고 어떤 순서로 반복 갱신되는가?
3. 2017년 Atari·시뮬레이션 실험만으로 현대 언어 모델의 안전성을 보장할 수 없는 이유는 무엇인가?

### 다음 문서

- [[인간 피드백 강화학습]] — 2017년 프레임워크와 언어 모델 파이프라인을 하나의 개념 지도로 정리한다.
- [[대규모 언어 모델]] — 선호 최적화가 적용되는 사전학습 언어 모델의 구조와 범위를 이어서 살핀다.

## 출처

- Paul F. Christiano 외, [Deep Reinforcement Learning from Human Preferences](https://arxiv.org/abs/1706.03741), NeurIPS 2017, 특히 §§2–6.
- Daniel M. Ziegler 외, [Fine-Tuning Language Models from Human Preferences](https://arxiv.org/abs/1909.08593), 2019.
- Nisan Stiennon 외, [Learning to Summarize from Human Feedback](https://proceedings.neurips.cc/paper/2020/hash/1f89885d556929e98d3ef9b86448f951-Abstract.html), NeurIPS 2020.
- Long Ouyang 외, [Training Language Models to Follow Instructions with Human Feedback](https://arxiv.org/abs/2203.02155), 2022.
- 프로젝트 번역·검토 출발 자료: [RLHF Foundations Learning from Human Preferences in Reinforcement Learning](https://mbrenndoerfer.com/writing/rlhf-foundations-reinforcement-learning-human-preferences)
- 프로젝트 보존 자료: `raw/056_RLHF Foundations Learning from Human Preferences in Reinforcement Learning.ko.md`, `raw/056_RLHF Foundations Learning from Human Preferences in Reinforcement Learning.commentary.ko.md`.

## 관련 항목

- [[인간 피드백 강화학습]]
- [[대규모 언어 모델]]
- [[Transformer]]
