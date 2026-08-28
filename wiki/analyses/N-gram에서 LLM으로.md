---
schema_version: 3
id: analysis.n-gram에서-llm으로
page_type: analysis
title: N-gram에서 LLM으로
aliases:
  - n-gram to LLM
  - 언어 모델링 계보
  - 다음 토큰 예측의 역사
tags:
  - type/analysis
  - domain/ai
created: '2026-05-07'
updated: '2026-07-25'
editorial_status: active
review:
  evidence_coverage: partial
  content_mode: synthesis
artifacts:
  - raw/001_Shannon's N-gram Model - The Foundation of Statistical Language Processing..md
  - raw/001_Shannon's N-gram Model - The Foundation of Statistical Language Processing.commentary.md
  - raw/002_The Turing Test.md
  - raw/003_Georgetown-IBM Machine.md
  - raw/004_The Perceptron.md
  - raw/005_Chomsky's Syntactic Structures.md
  - raw/019_Katz Back-off - Handling Sparse Data in Language Models.ko.md
  - raw/019_Katz Back-off - Handling Sparse Data in Language Models.commentary.ko.md
  - raw/035_Neural Probabilistic Language Model - Distributed Word Representations and Neural Language Modeling.ko.md
  - raw/035_Neural Probabilistic Language Model - Distributed Word Representations and Neural Language Modeling.commentary.ko.md
  - raw/043_Word2Vec Dense Word Embeddings and Neural Language Representations.ko.md
  - raw/043_Word2Vec Dense Word Embeddings and Neural Language Representations.commentary.ko.md
  - raw/045_Sequence-to-Sequence Neural Machine Translation End-to-End Learning Revolution.ko.md
  - raw/045_Sequence-to-Sequence Neural Machine Translation End-to-End Learning Revolution.commentary.ko.md
  - raw/055_The Transformer Attention Is All You Need.ko.md
  - raw/055_The Transformer Attention Is All You Need.commentary.ko.md
  - raw/066_Scaling Laws for Neural Language Models Predicting Performance from Scale.ko.md
  - raw/066_Scaling Laws for Neural Language Models Predicting Performance from Scale.commentary.ko.md
evidence:
  - source_id: shannon-1948
    locator: 'Part I, §§2–3 and §6'
    relation: supports
  - source_id: turing-1950
    locator: 'pp. 433–460, §§1–7'
    relation: supports
  - source_id: macdonald-1963
    locator: pp. 1–4
    relation: supports
  - source_id: rosenblatt-1958
    locator: pp. 386–408
    relation: supports
  - source_id: chomsky-1957
    locator: chapters 2–10
    relation: supports
  - source_id: katz-1987
    locator: 'pp. 400–401, especially eqs. (13)–(23) and the final paragraph'
    relation: supports
  - source_id: chen-goodman-1998
    locator: §§2.3–2.4 and §5.2.4
    relation: supplements
  - source_id: bengio-et-al-2003-nplm
    locator: 'JMLR 3, pp. 1137–1155, 특히 §§1.1·2의 연속 표현 일반화와 §4의 n-gram 비교'
    relation: supports
  - source_id: mikolov-et-al-2013-word-representations
    locator: 'arXiv:1301.3781, 초록과 §§1–3, 특히 §2의 계산 복잡도와 §3의 CBOW·Skip-gram'
    relation: supports
  - source_id: mikolov-et-al-2013-negative-sampling
    locator: 'NeurIPS 2013, pp. 3111–3119, 특히 §§2.1–2.3의 계층적 softmax·negative sampling·subsampling'
    relation: supports
  - source_id: sutskever-vinyals-le-2014-seq2seq
    locator: 'NeurIPS 2014, pp. 3104–3112, 특히 §§1–3·5와 Figure 1의 recurrent encoder–decoder·조건부 생성'
    relation: supports
  - source_id: vaswani-et-al-2017-attention
    locator: 'NeurIPS 2017, §§1·3–5와 Table 1의 recurrence 제거·self-attention·위치별 순차 연산 비교'
    relation: supports
  - source_id: gpt-2018
    locator: '§3.1, eqs. (1)–(2), and §4.1'
    relation: contextualizes
  - source_id: bert-2019
    locator: §3
    relation: contextualizes
  - source_id: kaplan-et-al-2020-scaling-laws
    locator: '§§1.1–1.3·2–3·8, 특히 자기회귀 token 예측 실험의 N·D·C 범위와 language-model loss의 적용 범위'
    relation: supports
relations:
  - target: source.001
    kind: related
  - target: source.002
    kind: related
  - target: source.019
    kind: related
  - target: source.043
    kind: related
  - target: source.045
    kind: related
  - target: source.055
    kind: related
  - target: source.066
    kind: related
  - target: concept.언어-모델-스케일링-법칙
    kind: related
  - target: concept.신경-확률-언어-모형
    kind: related
  - target: concept.단어-임베딩
    kind: related
  - target: concept.n-gram-모델
    kind: related
  - target: concept.마르코프-가정
    kind: related
  - target: concept.데이터-희소성
    kind: related
  - target: concept.smoothing
    kind: related
  - target: concept.perplexity
    kind: related
  - target: analysis.튜링-테스트와-llm-평가
    kind: related
  - target: concept.기계-번역
    kind: related
  - target: analysis.ai-시연과-실제-성능
    kind: related
  - target: concept.퍼셉트론
    kind: related
  - target: analysis.규칙-기반-ai에서-데이터-기반-학습으로
    kind: related
  - target: concept.통사-구조
    kind: related
  - target: analysis.촘스키에서-llm으로
    kind: related
  - target: source.026
    kind: related
  - target: concept.순환-신경망
    kind: related
  - target: concept.word2vec
    kind: related
  - target: concept.sequence-to-sequence
    kind: related
  - target: concept.transformer
    kind: related
  - target: analysis.statistical-language-model-computing-infrastructure
    kind: related
  - target: analysis.matrix-acceleration-deep-learning
    kind: related
  - target: analysis.transformer-parallelism-and-sequentiality
    kind: related
  - target: meta.llm-computing-coevolution
    kind: related
learning:
  difficulty:
    entry: introductory
    target: intermediate
  prerequisites: []
  assumed_knowledge: '빈도표, 임베딩, softmax, 순환 상태와 attention을 작은 예부터 정의한다.'
  outcomes:
    - 'n-gram과 LLM의 공통 문제를 보존하면서, 희소 계수 → 연속 표현 → 재사용 임베딩 → 순환 상태 → 조건부 생성 → Transformer라는 작업 전환을 설명하고 “n-gram이 커져 LLM이 됐다”는 설명의 한계를 근거와 함께 말할 수 있다.'
  next:
    - target: source.035
      reason: 이어서 035신경 확률 언어 모형과 분산 단어 표현에서 공유 표현으로의 전환을 확인한다.
---
# N-gram에서 LLM으로

> [!note] 학습 안내
> **난이도:** 입문 → 중급<br>
> **선수 지식:** 없음 — 빈도표, 임베딩, softmax, 순환 상태와 attention을 작은 예부터 정의한다.<br>
> **읽고 나면:** n-gram과 LLM의 공통 문제를 보존하면서, 희소 계수 → 연속 표현 → 재사용 임베딩 → 순환 상태 → 조건부 생성 → Transformer라는 작업 전환을 설명하고 “n-gram이 커져 LLM이 됐다”는 설명의 한계를 근거와 함께 말할 수 있다.

## 1단계 — 먼저 잡을 핵심

[[N-gram에서 LLM으로]]가 묻는 질문은 “**n-gram과 LLM은 둘 다 다음 항목을 예측하는데, 같은 기술의 크기 차이인가?**”이다. 답은 **과업은 일부 이어지지만 계산 표현은 크게 달라졌다**는 것이다.

[[N-gram 모델]]은 최근 몇 개 표면 토큰의 빈도표에서 다음 항목의 조건부확률을 찾는다. 자기회귀 대규모 언어 모델(Large Language Model, LLM)은 긴 토큰열을 학습된 벡터와 신경망 상태로 바꾸고 다음 토큰 분포를 계산한다. 둘 다 “앞 문맥에서 다음 항목은 무엇인가”를 묻지만, GPT가 n-gram 표를 그대로 거대하게 만든 것은 아니다.

쉬운 비유로 n-gram은 같은 문구가 적힌 색인 카드를 찾아보는 방식에 가깝고, LLM은 여러 문맥에서 학습한 표현을 매번 조합해 답을 계산하는 방식에 가깝다. 이 비유는 직관을 위한 것이며, 어느 쪽도 인간의 의미 이해와 그대로 같다는 뜻은 아니다.

### 같은 점

두 접근 모두 언어열에 [[조건부 확률]]을 부여할 수 있다. 문맥이 주어졌을 때 다음 후보들에 확률을 나누고, 실제 다음 항목에 얼마나 높은 확률을 줬는지 평가한다. 이 공통점은 **과업 수준의 연속성**이다.

### 다른 점

N-gram은 [[마르코프 가정]]에 따라 표면 토큰 조합을 직접 세고 보통 최근 n-1개 항목만 참고한다. 자기회귀 LLM은 토큰을 벡터로 바꾸고 여러 신경망 층을 거쳐 더 긴 문맥을 조건으로 사용한다. 따라서 “GPT는 매우 큰 n-gram이다”라는 설명은 공유하는 질문은 보여 주지만 실제 계산 방식을 놓친다.

## 2단계 — 작동 원리

표를 읽기 전에 세 용어를 구분한다. **은닉 표현**(hidden representation)은 신경망 내부에서 문맥을 수치 벡터로 나타낸 값이다. **그래디언트**(gradient)는 예측 오차를 줄이려면 매개변수를 어느 방향으로 바꿔야 하는지 나타낸다. **보간**(interpolation)은 서로 다른 확률 분포를 가중해 섞는 방법이다. 아래 표의 LLM 병목은 이 문서가 여러 자료를 함께 읽어 정리한 비교 축이며, 특정 한 논문의 실험 결과가 아니다.

| 비교 축 | n-gram | 자기회귀 LLM |
| --- | --- | --- |
| 문맥 | 보통 최근 n-1개 토큰 | 모델 문맥 창 안의 더 긴 토큰열 |
| 표현 | 표면 토큰 조합의 명시적 빈도 | 학습된 임베딩과 층별 은닉 표현 |
| 정보 공유 | 더 짧은 표면 문맥으로 후퇴·보간 | 비슷한 표현과 공유 매개변수로 그래디언트 전달 |
| 핵심 병목 | 조합 폭증과 미관측 빈도 | 계산·메모리 비용과 긴 문맥 활용의 별도 검증 |
| 출력 | 다음 항목의 조건부확률 | 다음 토큰의 조건부확률 |

### 중간 다섯 칸을 건너뛰면 역사가 직선처럼 보인다

N-gram과 LLM만 양 끝에 놓으면 “빈도표가 아주 커져서 신경망이 됐다”는 오해가 생긴다. 실제로는 **무엇을 저장하고, 무엇을 예측하며, 어떤 계산을 재사용하는가**가 여러 번 바뀌었다.

1. **Katz back-off — 희소 계수의 재분배:** 정확한 표면 n-gram을 보지 못하면 더 짧은 표면 문맥으로 후퇴한다.
2. **2003 NPLM — 연속 표현을 포함한 완전한 언어 모델:** 단어 lookup 벡터, 공유 다층 퍼셉트론과 전체 어휘 softmax를 함께 학습해 다음 단어 확률분포를 만든다.
3. **2013 Word2Vec — 표현 학습을 완전한 언어 모델에서 분리:** CBOW·Skip-gram은 국소 단어–문맥 예측에 집중한다. 계층적 softmax와 negative sampling은 매번 전체 어휘 확률을 정확히 정규화하는 비용을 피하거나 줄여, 재사용할 정적 단어 벡터를 대규모로 학습하게 했다. 이 벡터 자체는 문장 전체의 확률분포가 아니다.
4. **RNN — 시간축 매개변수 공유:** 같은 transition을 위치마다 재사용하며 이전 hidden state에 문맥을 누적한다. 고정 n-gram 길이를 넘을 구조는 얻지만, 긴 경로의 gradient와 위치별 순차 계산이 새 병목이 된다.
5. **2014 seq2seq — 입력에 조건화된 가변 길이 생성:** encoder가 입력열을 상태로 바꾸고 decoder가 그 상태와 앞선 출력에 조건화해 목표열을 생성한다. “다음 단어 확률”이 번역처럼 입력과 출력 길이가 다른 종단간 과업의 인터페이스가 된다.
6. **2017 Transformer — 훈련 위치 의존성의 재배치:** recurrence를 self-attention과 위치별 feed-forward 연산으로 바꿔 정답열을 아는 훈련에서 여러 위치의 표현을 함께 계산한다. 그러나 자기회귀 생성은 실제 앞 토큰을 기다리므로 여전히 순차적이다.

이 여섯 단계는 서로를 단순 교체한 목록이 아니다. NPLM과 Word2Vec은 모두 연속 표현을 쓰지만 **완전한 다음 단어 분포**와 **표현 학습용 국소 예측**이라는 결과 계약이 다르다. Seq2seq와 Transformer도 모두 조건부 생성을 다루지만, 위치 사이 표현 계산의 의존성이 다르다.

### 역사적 압력

N-gram의 [[데이터 희소성]]은 [[Smoothing]]과 back-off의 직접 동기였다. [[019_Katz 백오프와 희소 데이터 확률 추정|Katz back-off]]는 관측된 저빈도 사건의 확률을 할인하고, 미관측 조합이면 더 짧은 **표면 문맥**으로 내려가 남은 확률 질량을 배분한다.

Dropout과 가중치 감쇠는 신경망 매개변수의 학습에 작용하는 정규화이므로, 미관측 문자열에 확률을 재분배하는 Katz back-off와 다르다. 고정 어휘 안에서 보지 못한 n-gram과 어휘 밖 단어를 하위 단위로 나타내는 토큰화 문제도 구분한다.

분산 표현, [[순환 신경망]], Transformer는 장거리 문맥과 일반화를 다른 방식으로 다뤘다. 그러나 n-gram의 한계가 이 기술들을 차례로 직접 낳았다는 단일 인과 사슬은 확인되지 않는다. 더 긴 문맥을 담을 구조가 있다는 사실도 문맥 창 안의 모든 정보를 안정적으로 활용한다는 보장은 아니다.

### 확률 재분배에서 표현 공유로

Katz back-off와 [[035_신경 확률 언어 모형과 분산 단어 표현|2003년 신경 확률 언어 모형(Neural Probabilistic Language Model, NPLM)]]은 모두 보지 못한 단어열에 합리적인 확률을 주려 하지만 정보 공유 단위가 다르다.

1. Katz는 정확한 n-gram 횟수에 따라 관측값을 할인한다.
2. 해당 n-gram을 보지 못했으면 더 짧은 표면 문맥의 분포로 후퇴한다.
3. NPLM은 단어별 연속 벡터와 공유 다층 퍼셉트론을 학습한다.
4. 표면 단어가 달라도 벡터가 가까운 문맥에는 그래디언트 학습 신호가 공유될 수 있다.

Bengio 등의 실험에서는 신경 확률과 interpolated trigram을 섞었을 때 각각을 단독으로 쓴 것보다 perplexity가 낮았다. 두 계산이 서로 다른 오류를 보완했다는 해석과 함께 읽을 수 있지만, 이 한 실험이 모든 희소성·빈도 편향·토큰화 문제의 해결을 입증하지는 않는다.

Attention은 입력에 따라 여러 위치의 표현을 결합하는 학습된 연산이다. 미관측 n-gram에서 한 단계 짧은 빈도표로 내려가는 Katz back-off가 아니다.

## 3단계 — 기술과 근거

### 예측 과업의 연속성과 현대 규모 실험의 차이

N-gram, 2003년 NPLM과 decoder-only LLM은 앞 문맥에서 다음 항목의 조건부확률을 예측한다는 과업을 공유한다. 그러나 Kaplan 등의 [[066_신경 언어 모델의 스케일링 법칙|2020년 실험]]은 빈도표의 차수를 키운 연구가 아니라, 학습된 표현을 쓰는 Transformer에서 비임베딩 매개변수 $N$, 데이터 token 수 $D$, 학습 compute $C$를 통제하며 token 교차 엔트로피를 측정한 규모 실험이다. 그러므로 확인되는 연속성은 예측 질문과 확률 평가에 있고, 현대 [[언어 모델 스케일링 법칙]]의 실험 대상은 표현 학습·최적화·계산 배분까지 포함한다.

### 여섯 항목 측정 장부

| 항목 | 이 연결고리에서 기록할 것 |
| --- | --- |
| 작업 | Katz·NPLM의 다음 단어 언어 모델링, Word2Vec의 국소 표현 학습, seq2seq·Transformer의 조건부 sequence 생성 |
| 규모 | 어휘·corpus·문맥 길이·sequence 길이·parameter·device 수를 각각 기록하며 서로 대신하지 않는다. |
| 결과 계약 | 정규화된 다음 단어 확률과 perplexity, 단어 벡터 유추, 번역 품질처럼 단계마다 다른 성공 조건을 분리한다. |
| 시스템 경계 | 확률 추정기, 표현 학습기, encoder–decoder model, accelerator를 포함한 훈련 실행 가운데 어디까지 측정했는지 밝힌다. |
| 고정 조건 | corpus·어휘·tokenization·architecture·hardware·precision이 논문마다 달라 단순 속도 순위를 만들지 않는다. |
| 지표 | Perplexity, 벡터 과제 정확도, BLEU, 학습 시간·계산 복잡도는 같은 단위가 아니므로 별도 열에 둔다. |

이 장부의 핵심은 “더 좋은 표현”과 “더 좋은 언어 모델”, “더 빠른 훈련”을 한 점수로 합치지 않는 것이다. Word2Vec의 negative sampling 목적은 효율적인 표현 학습 계약이며, 정규화된 전체 어휘 언어 모델 likelihood와 동일하지 않다.

### 평가 축과의 접점

[[튜링 테스트]]는 같은 언어 AI 역사를 다른 질문으로 비춘다. 섀넌 계보가 언어를 예측 가능한 확률 과정으로 다뤘다면, [[앨런 튜링]]의 계보는 언어 행동이 어느 정도 지능의 증거가 되는지를 묻는다. 좋은 다음 토큰 예측과 자연스럽고 신뢰할 만한 대화 능력을 같은 측정으로 보지 않는다.

이는 두 연구 사이의 직접 영향 관계가 아니라 프로젝트의 비교 해석이다. 현대 언어 모델 연구는 확률 예측으로 모델을 학습하면서 언어 행동으로 능력을 평가한다는 점에서 두 질문이 만나는 장면으로 읽을 수 있다.

### 규칙 기반 NLP와의 대비

[[003_Georgetown-IBM 기계 번역 시연]]은 확률적 예측과 다른 초기 NLP 흐름을 보여 준다. 이 시스템은 선별된 제한 문장에서 사전 조회와 통사 규칙을 적용했다. 제한된 범위에서는 작동했지만 확장 과정에서 [[지식 공학 병목]]과 실제 성능 평가 문제가 드러났다. 현대 LLM은 대규모 통계 학습과 다과업 생성을 결합하지만, 규칙 기반 시스템의 모든 문제를 자동으로 없앤 것은 아니다.

이 문단은 두 자료를 함께 읽은 프로젝트 해석이다. 현대 LLM이 규칙·통계 두 계보의 일부 문제와 방법을 흡수했다고 볼 수 있지만, Georgetown 시스템에서 LLM으로 직접 이어지는 단일 계보를 뜻하지 않는다.

### 신경망 학습 계보

[[004_퍼셉트론]]은 정답과 예측이 다를 때 오류 수정 규칙으로 선형 분류기의 가중치를 갱신했다. 현대 LLM도 학습 가능한 가중치를 사용하지만, 자기지도 사전학습과 미분 가능한 다층 구조를 이용한다. 두 모델을 같은 지도학습 방식으로 묶지 않고 넓은 신경망 학습사의 서로 다른 지점으로 본다.

### 구조적 언어관과의 접점

[[005_촘스키의 통사 구조]]는 n-gram 계보와 긴장 관계에 있는 언어관을 추가한다. N-gram은 제한된 표면 문맥의 확률로 언어를 모델링하지만, 촘스키는 자연어가 [[유한상태 모델]]보다 강한 형식 체계와 [[통사 구조]]를 요구한다고 보았다. 현대 LLM은 표면 토큰 예측으로 학습되지만 내부적으로 위계 구조를 어느 정도 학습하는지라는 질문에서 두 계보가 다시 만난다.

마지막 문장은 직접 계보가 아니라 서로 다른 자료가 공유하는 질문을 묶은 프로젝트 해석이다.

### GPT와 BERT를 같은 칸에 넣지 않기

GPT 계열은 [[자기회귀 생성|자기회귀 다음 토큰 예측]]을 사전학습에 사용한다. BERT 계열은 문장 양쪽 문맥을 이용하는 마스크드 언어 모델링을 사용하므로 생성 순서와 학습 목표가 다르다. “현대 언어 모델은 모두 n-gram과 같은 다음 토큰 모델”이라는 문장은 BERT 같은 계열을 설명하지 못한다.

## 검증과 한계

### 해석

N-gram은 현대 LLM의 축소판이 아니다. Shannon의 1948년 논문은 확률적 통신원과 연속 근사를 다뤘고, 현대 n-gram 용어·smoothing·신경망 언어 모델은 후대에 각각 발전했다. 연결은 문제 설정과 수학적 어휘의 공유로 한정한다.

### 사실, 합성, 미확인 계보

- **확인된 연속성:** 언어열에 조건부확률을 부여하고 예측 성능을 평가한다는 문제와 수학적 어휘는 이어진다.
- **프로젝트 해석:** 희소성의 처리 단위가 표면 빈도에서 공유 표현으로 이동했다는 비교는 여러 자료를 함께 읽은 합성이다.
- **입증되지 않은 계보:** n-gram의 한계가 순환 신경망·attention·Transformer를 차례로 직접 낳았다는 단일 인과 사슬은 근거가 없다.
- **흔한 오해:** dropout·가중치 감쇠는 매개변수 학습에 작용하는 정규화이며 Katz back-off와 같은 확률 재분배가 아니다. 미관측 n-gram과 어휘 밖 단어를 하위 단위로 표현하는 토큰화 문제도 다르다.
- **범위:** 이 분석은 계산 방식과 연구 질문을 비교하며, 현대 LLM의 의미 이해 여부를 확정 판정하지 않는다.

### 네 종류로 다시 적은 연결

| 인과 표지 | 이 문서에서 허용하는 주장 |
| --- | --- |
| 직접 영향 | Bengio 등은 n-gram의 차원의 저주를 문제로 명시하고 연속 표현과 공유 신경망을 대안으로 설계했다. Vaswani 등은 recurrent sequence model의 순차 계산을 명시적으로 비교하며 recurrence 없는 구조를 제안했다. |
| 가능 조건 | 효율적 출력 계산, 큰 행렬 연산과 accelerator는 더 큰 표현 학습·sequence model을 실행 가능하게 했지만 아이디어의 단일 원인은 아니다. |
| 병행 맥락 | Katz와 NPLM은 미관측 문자열에 확률을 주는 공통 문제를 서로 다른 정보 공유 단위로 다뤘다. 함께 비교할 수 있지만 Katz가 NPLM을 직접 낳았다고 쓰지 않는다. |
| 후대 유추 | 색인 카드와 학습된 기하를 대비하는 비유, 여섯 단계를 하나의 workload 전환으로 묶는 것은 이 위키의 회고적 분석이다. 당시 연구자들의 공동 roadmap이 아니다. |

## 학습 확인

1. n-gram과 자기회귀 LLM이 공유하는 것은 모델 구조인가, 예측 과업인가?
2. Katz back-off와 NPLM은 미관측 문맥에 정보를 어떤 단위로 공유하는가?
3. “희소성이 해결됐다”보다 “희소성의 처리 위치가 이동했다”는 설명이 더 정확한 이유는 무엇인가?

먼저 [[019_Katz 백오프와 희소 데이터 확률 추정]]에서 표면 확률 재분배를 읽는다. 이어서 [[035_신경 확률 언어 모형과 분산 단어 표현]]에서 공유 표현으로의 전환을 확인한다.

횡단 역사 경로로는 [[확률적 언어 모델은 어떤 계산 인프라를 요구했나]] → 이 문서 → [[행렬곱 가속은 딥러닝을 어떻게 현실화했나]] → [[Transformer는 무엇을 병렬화했고 무엇을 남겼나]] 순서로 읽는다.

### 다음 문서

- [[source.035|신경 확률 언어 모형과 분산 단어 표현]] — 이어서 035신경 확률 언어 모형과 분산 단어 표현에서 공유 표현으로의 전환을 확인한다.

## 출처
- [[001_섀넌의 N-gram 모델]]
- [[002_튜링 테스트]]
- [[003_Georgetown-IBM 기계 번역 시연]]
- [[004_퍼셉트론]]
- [[005_촘스키의 통사 구조]]
- [[019_Katz 백오프와 희소 데이터 확률 추정]]
- [[035_신경 확률 언어 모형과 분산 단어 표현]]
- [[043_Word2Vec와 효율적 정적 단어 임베딩]]
- [[045_Sequence-to-Sequence 학습과 신경 기계 번역]]
- [[055_Transformer와 자기어텐션 기반 시퀀스 모델링]]
- [[066_신경 언어 모델의 스케일링 법칙]]
- Slava M. Katz, [Estimation of Probabilities from Sparse Data for the Language Model Component of a Speech Recognizer](https://doi.org/10.1109/TASSP.1987.1165125), 1987, pp. 400–401.
- Stanley F. Chen·Joshua Goodman, [An Empirical Study of Smoothing Techniques for Language Modeling](https://dash.harvard.edu/handle/1/25104739), 1998, §§2.3–2.4·5.2.4.
- Yoshua Bengio·Réjean Ducharme·Pascal Vincent·Christian Jauvin, [A Neural Probabilistic Language Model](https://www.jmlr.org/papers/v3/bengio03a.html), 2003, pp. 1137–1155.
- Tomas Mikolov 외, [Efficient Estimation of Word Representations in Vector Space](https://arxiv.org/abs/1301.3781), 2013, §§1–3.
- Tomas Mikolov 외, [Distributed Representations of Words and Phrases and their Compositionality](https://proceedings.neurips.cc/paper/2013/hash/9aa42b31882ec039965f3c4923ce901b-Abstract.html), 2013, §§2.1–2.3.
- Ilya Sutskever·Oriol Vinyals·Quoc V. Le, [Sequence to Sequence Learning with Neural Networks](https://proceedings.neurips.cc/paper_files/paper/2014/hash/5a18e133cbf9f257297f410bb7eca942-Abstract.html), 2014, §§1–3·5.
- Ashish Vaswani 외, [Attention Is All You Need](https://proceedings.neurips.cc/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html), 2017, §§1·3–5와 Table 1.
- Alec Radford 외, [Improving Language Understanding by Generative Pre-Training](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf), 2018, §§3.1·4.1.
- Jacob Devlin 외, [BERT](https://aclanthology.org/N19-1423/), 2019, §3.
- Jared Kaplan 외, [Scaling Laws for Neural Language Models](https://arxiv.org/abs/2001.08361), 2020, §§1.1–1.3·2–3·8.

## 관련 항목

- [[source.035|신경 확률 언어 모형과 분산 단어 표현]]
- [[source.001|섀넌의 N-gram 모델]]
- [[source.002|튜링 테스트]]
- [[source.019|Katz 백오프와 희소 데이터 확률 추정]]
- [[source.043|Word2Vec와 효율적 정적 단어 임베딩]]
- [[source.045|Sequence-to-Sequence 학습과 신경 기계 번역]]
- [[source.055|Transformer와 자기어텐션 기반 시퀀스 모델링]]
- [[source.066|신경 언어 모델의 스케일링 법칙]]
- [[concept.언어-모델-스케일링-법칙|언어 모델 스케일링 법칙]]
- [[concept.신경-확률-언어-모형|신경 확률 언어 모형]]
- [[concept.단어-임베딩|단어 임베딩]]
- [[concept.n-gram-모델|N-gram 모델]]
- [[concept.마르코프-가정|마르코프 가정]]
- [[concept.데이터-희소성|데이터 희소성]]
- [[concept.smoothing|Smoothing]]
- [[concept.perplexity|Perplexity]]
- [[analysis.튜링-테스트와-llm-평가|튜링 테스트와 LLM 평가]]
- [[concept.기계-번역|기계 번역]]
- [[analysis.ai-시연과-실제-성능|AI 시연과 실제 성능]]
- [[concept.퍼셉트론|퍼셉트론]]
- [[analysis.규칙-기반-ai에서-데이터-기반-학습으로|규칙 기반 AI에서 데이터 기반 학습으로]]
- [[concept.통사-구조|통사 구조]]
- [[analysis.촘스키에서-llm으로|촘스키에서 LLM으로]]
- [[source.026|순환 신경망과 시간적 문맥 학습]]
- [[concept.순환-신경망|순환 신경망]]
- [[concept.word2vec|Word2Vec]]
- [[concept.sequence-to-sequence|Sequence-to-Sequence 학습]]
- [[concept.transformer|Transformer]]
- [[analysis.statistical-language-model-computing-infrastructure|확률적 언어 모델은 어떤 계산 인프라를 요구했나]]
- [[analysis.matrix-acceleration-deep-learning|행렬곱 가속은 딥러닝을 어떻게 현실화했나]]
- [[analysis.transformer-parallelism-and-sequentiality|Transformer는 무엇을 병렬화했고 무엇을 남겼나]]
- [[meta.llm-computing-coevolution|LLM과 컴퓨팅 능력의 공진화]]
