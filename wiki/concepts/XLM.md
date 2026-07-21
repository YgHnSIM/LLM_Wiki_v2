---
schema_version: 2
id: concept.xlm
page_type: concept
title: XLM
aliases:
  - Cross-lingual Language Model
  - Cross-lingual Language Models
  - 교차 언어 모델
tags:
  - type/concept
  - domain/ai
  - domain/nlp
  - domain/machine-learning
created: '2026-07-21'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/061_XLM Cross-lingual Language Model for Multilingual NLP.ko.md'
  - 'raw/061_XLM Cross-lingual Language Model for Multilingual NLP.commentary.ko.md'
evidence:
  - source_id: conneau-lample-2019-xlm
    locator: '§§3.1–3.5와 Figure 1의 language sampling·shared BPE·CLM/MLM/TLM, §§4–5와 Tables 1–5의 전이 protocol·평가 결과'
    relation: supports
related:
  - source.061
  - concept.마스크드-언어-모델링
  - concept.byte-pair-encoding
  - concept.언어-모델-전이-학습
  - concept.신경망-기계-번역
  - analysis.사전-학습-지식은-과제에-어떻게-도착하는가
  - analysis.같은-병렬-문장은-무엇을-학습시키는가
---
# XLM

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[마스크드 언어 모델링]], [[Byte Pair Encoding|BPE]]<br>
> **읽고 나면:** XLM의 세 objective와 shared multilingual encoder가 target-language label 없는 전이를 만드는 방식을 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

XLM(Cross-lingual Language Model)은 여러 언어가 Transformer parameter와 subword vocabulary를 공유하도록 사전 학습한 방법군이다. monolingual data의 CLM·MLM과 parallel data의 TLM을 비교하며, XNLI에서 영어 label로 fine-tune한 모델을 다른 언어에 옮겼다. XLM-R·mBERT·TLM은 서로 관련 있지만 XLM의 alias나 같은 대상은 아니다.

## 2단계 — 작동 원리

### data 조건에 따라 정렬 신호를 더한다

1. 각 언어의 corpus에서 CLM 또는 MLM을 학습한다.
2. shared BPE와 Transformer parameter가 언어 사이 공통 capacity를 만든다.
3. 병렬 문장쌍이 있으면 TLM으로 두 언어 문맥을 직접 연결한다.
4. 영어 task label로 fine-tune한 뒤 target-language label 없이 다른 언어를 평가한다.

1–2만으로도 교차 언어 전이가 가능했다. 3의 TLM은 parallel data가 있을 때 추가하는 직접적인 교차 언어 문맥 신호다.

## 3단계 — 기술과 근거

### 세 objective

| objective | data | attention·예측 방향 | parallel data |
|---|---|---|---|
| CLM | 언어별 text | 왼쪽 문맥에서 다음 token | 불필요 |
| MLM | 언어별 text | 같은 문장의 양쪽 문맥에서 masked token | 불필요 |
| TLM | 번역 문장쌍 | 두 언어 문장 전체에서 양쪽 masked token | 필요 |

MLM+TLM 모델은 monolingual MLM batch와 parallel TLM batch를 교대로 학습한다. TLM은 target 번역을 순차 생성하는 [[신경망 기계 번역]] loss와 다르다. 한쪽 문장 전체가 자기회귀 출력 정답으로 쓰이지 않고, 양쪽 문장이 shared encoder의 masked-token 복원 문맥이 된다.

### zero-shot의 두 언어 조건

XNLI encoder pretraining에는 target 언어의 unlabeled text가 포함된다. fine-tuning label은 영어에만 있다. 따라서 zero-shot은 **unseen language**가 아니라 **unseen target-language task supervision**을 뜻한다. 사전 학습 언어·fine-tuning label 언어·test 언어를 따로 기록해야 한다.

### 대표 결과

- XNLI 평균: MLM 71.5, MLM+TLM 75.1
- 비지도 German→English MT: 34.3 BLEU
- 지도 Romanian→English MT: 38.5 BLEU
- Nepali LM: monolingual perplexity 157.2, English·Hindi를 함께 사용했을 때 109.3
- SemEval17 cross-lingual word similarity: Pearson 0.69

이 수치는 하나의 범용 다국어 능력 점수가 아니다. task·language pair·corpus·compute가 서로 다르다.

### 공유 vocabulary가 하는 일과 하지 않는 일

shared BPE는 같은 문자열 조각, 숫자, 고유명 같은 anchor를 공유하게 한다. 철자가 다른 번역어의 의미 대응은 BPE merge만으로 생기지 않는다. shared parameter에서의 공동 학습과 TLM의 parallel context가 추가 교차 언어 대응 신호를 제공한다.

## 검증과 한계

### 해석 경계

- XLM은 단일 architecture 발명보다 여러 multilingual objective를 비교한 연구다.
- TLM이 없어도 monolingual data만으로 교차 언어 전이가 가능했다.
- XNLI zero-shot은 target 언어 corpus까지 배제한 실험이 아니다.
- few-shot·교차 언어 QA·검색은 원 논문의 평가 범위가 아니다.
- mBERT는 XLM 논문에 이미 등장하는 비교 baseline이지 XLM의 후속 산물이 아니다.
- 한 encoder의 언어 공유가 언어별 동등한 성능이나 낮은 deployment cost를 보장하지 않는다.
- 후속 multilingual model을 모두 XLM의 직접 계보로 묶으려면 각 논문의 설계·인용 근거가 필요하다.

## 학습 확인

### 확인 질문

1. CLM·MLM·TLM 가운데 parallel corpus가 필요한 objective는 무엇인가?
2. XNLI zero-shot에서 target 언어는 어느 단계에 있고 어느 단계에 없는가?
3. shared BPE와 TLM은 교차 언어 정렬에 서로 어떤 다른 신호를 주는가?

### 다음 문서

- [[같은 병렬 문장은 무엇을 학습시키는가]] — 병렬 pair가 SMT의 잠재 정렬, NMT의 target 생성, TLM의 masked 복원에서 맡는 역할을 비교한다.
- [[사전 학습 지식은 과제에 어떻게 도착하는가]] — 과제 전이에 언어 축이 추가될 때 zero-shot의 경계를 비교한다.

## 출처

- [[061_XLM과 교차 언어 사전 학습]]
- Alexis Conneau·Guillaume Lample, [Cross-lingual Language Model Pretraining](https://proceedings.neurips.cc/paper_files/paper/2019/hash/c04c19c2c2474dbf5f7ac4372c5b9af1-Abstract.html), NeurIPS 2019, 특히 §§3–5.

## 관련 항목

- [[061_XLM과 교차 언어 사전 학습]]
- [[마스크드 언어 모델링]]
- [[Byte Pair Encoding]]
- [[언어 모델 전이 학습]]
- [[신경망 기계 번역]]
- [[사전 학습 지식은 과제에 어떻게 도착하는가]]
- [[같은 병렬 문장은 무엇을 학습시키는가]]
