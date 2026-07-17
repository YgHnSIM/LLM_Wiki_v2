---
schema_version: 2
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
updated: '2026-07-18'
lifecycle: active
verification: partial
artifacts:
  - >-
    raw/001_Shannon's N-gram Model - The Foundation of Statistical Language
    Processing..md
  - >-
    raw/001_Shannon's N-gram Model - The Foundation of Statistical Language
    Processing.commentary.md
  - raw/002_The Turing Test.md
  - raw/003_Georgetown-IBM Machine.md
  - raw/004_The Perceptron.md
  - raw/005_Chomsky's Syntactic Structures.md
  - raw/019_Katz Back-off - Handling Sparse Data in Language Models.ko.md
  - raw/019_Katz Back-off - Handling Sparse Data in Language Models.commentary.ko.md
  - raw/035_Neural Probabilistic Language Model - Distributed Word Representations and Neural Language Modeling.ko.md
  - raw/035_Neural Probabilistic Language Model - Distributed Word Representations and Neural Language Modeling.commentary.ko.md
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
    locator: '§§2.3–2.4 and §5.2.4'
    relation: supplements
  - source_id: bengio-et-al-2003-nplm
    locator: 'JMLR 3, pp. 1137–1155, 특히 §§1.1·2의 연속 표현 일반화와 §4의 n-gram 비교'
    relation: supports
  - source_id: gpt-2018
    locator: '§3.1, eqs. (1)–(2), and §4.1'
    relation: contextualizes
  - source_id: bert-2019
    locator: §3
    relation: contextualizes
related:
  - source.001
  - source.002
  - source.019
  - source.035
  - concept.신경-확률-언어-모형
  - concept.단어-임베딩
  - concept.n-gram-모델
  - concept.마르코프-가정
  - concept.데이터-희소성
  - concept.smoothing
  - concept.perplexity
  - analysis.튜링-테스트와-llm-평가
  - concept.기계-번역
  - analysis.ai-시연과-실제-성능
  - concept.퍼셉트론
  - analysis.규칙-기반-ai에서-데이터-기반-학습으로
  - concept.통사-구조
  - analysis.촘스키에서-llm으로
  - source.026
  - concept.순환-신경망
---
# N-gram에서 LLM으로

[[N-gram에서 LLM으로]]는 단선적인 발명 계보가 아니라 공통 문제와 중요한 단절을 비교하는 분석이다. [[N-gram 모델]]과 자기회귀 대규모 언어 모델(Large Language Model, LLM)은 앞의 문맥에서 다음 항목의 확률 분포를 예측하지만, 표현과 학습 방식은 크게 다르다.

## 같은 점

두 접근 모두 언어열에 [[조건부 확률]]을 부여할 수 있다. n-gram은 명시적인 빈도표를 사용하고, 자기회귀 LLM은 신경망 내부 상태로 다음 토큰 분포를 산출한다. 이 공통점은 과업 수준의 연속성이며 GPT가 n-gram 계산을 그대로 확장한다는 뜻은 아니다.

## 다른 점

N-gram 모델은 [[마르코프 가정]]에 따라 제한된 최근 문맥만 사용한다. 반면 LLM은 훨씬 긴 문맥 창과 attention 메커니즘을 통해 더 넓은 정보를 반영한다. 또한 n-gram은 단어를 표면 토큰으로 취급하지만, 신경망 모델은 단어와 토큰의 의미적 유사성을 벡터 표현에 담을 수 있다. Attention은 입력에 따라 표현을 결합하는 학습된 신경망 연산이지, 미관측 n-gram에서 한 단계 짧은 빈도표로 내려가는 Katz back-off가 아니다.

## 역사적 압력

N-gram의 [[데이터 희소성]]은 [[Smoothing]]과 [[019_Katz 백오프와 희소 데이터 확률 추정|back-off]] 연구의 직접 동기였다. Katz 방식은 관측된 저빈도 사건의 확률을 할인하고 미관측 조합에 남은 질량을 배분하지만, 신경망의 dropout과 가중치 감쇠는 학습 목적과 매개변수에 작용하는 별도 정규화다. 고정 어휘 안의 미관측 n-gram과 어휘 밖 단어를 하위 단위로 표현하는 토큰화 문제도 구분해야 한다. 분산 표현, [[순환 신경망]]과 트랜스포머는 장거리 문맥과 일반화 문제를 다른 방식으로 다뤘지만, 이 발전을 n-gram 한계가 각 기술을 직접 낳았다는 단일 인과 사슬로 표현하지 않는다.

## 확률 재분배에서 표현 공유로

[[019_Katz 백오프와 희소 데이터 확률 추정|Katz back-off]]와 [[035_신경 확률 언어 모형과 분산 단어 표현|2003년 NPLM]]은 모두 보지 못한 단어열에 0이 아닌 합리적 확률을 주려 하지만 정보 공유 단위가 다르다. Katz는 현재의 정확한 n-gram 횟수에 따라 할인하고, 미관측이면 더 짧은 **표면 문맥**의 분포로 내려간다. NPLM은 단어별 [[단어 임베딩|연속 벡터]]과 공유 신경 함수를 학습해, 표면 단어가 달라도 벡터 공간에서 가까운 문맥 사이에 gradient 정보를 전달한다.

이 변화는 smoothing에서 신경망으로의 단순 교체가 아니다. 2003년 실험에서도 신경 확률과 interpolated trigram을 섞으면 각각 단독일 때보다 perplexity가 낮았다. 정확 문자열 통계와 연속 표현은 서로 다른 오류를 보완했다. 오늘날 신경 언어 모형에서도 tokenization, 빈도 편향과 긴 꼬리 문제는 사라지지 않았으므로 “임베딩이 데이터 희소성을 해결했다”보다 희소성의 처리 위치가 확률표에서 공유 표현·최적화·어휘 설계로 이동했다고 읽는 편이 정확하다.

## 해석

N-gram은 현대 LLM의 축소판이 아니다. Shannon의 1948년 논문은 확률적 통신원과 연속 근사를 다뤘고, 현대 n-gram 용어·smoothing·신경망 언어 모델은 후대에 각각 발전했다. 연결은 문제 설정과 수학적 어휘의 공유로 한정한다.

## 평가 축과의 접점

[[튜링 테스트]]는 같은 언어 AI 역사를 다른 질문으로 비춘다. 섀넌 계보가 언어를 예측 가능한 확률 과정으로 다루었다면, [[앨런 튜링]]의 계보는 언어 행동이 어느 정도 지능의 증거가 되는지를 묻는다. 현대 언어 모델 연구는 두 흐름이 만나는 지점에 있다. 자기회귀 LLM과 GPT 계열은 다음 토큰 예측으로 학습할 수 있지만 BERT 계열은 마스크드 언어 모델링 같은 다른 자기지도 목적을 사용한다. 어느 경우든 실제 평가는 인간과 자연스럽게 대화하고 신뢰할 만한 답을 제공하는지까지 포함한다.

## 규칙 기반 NLP와의 대비

[[003_Georgetown-IBM 기계 번역 시연]]은 n-gram 계보와 다른 초기 NLP 흐름을 보여준다. 여기서 언어 처리는 확률적 예측보다 사전 조회와 통사 규칙 적용에 가까웠다. 이 접근은 제한된 문장에서는 작동했지만, 확장 과정에서 [[지식 공학 병목]]과 실제 성능 평가 문제를 드러냈다. 현대 LLM은 통계적 예측, 대규모 학습, 다과업 생성 능력을 결합하면서 이 두 계보의 일부를 흡수한다.

## 신경망 학습 계보

[[004_퍼셉트론]]은 오류 수정으로 선형 분류기의 가중치를 학습했다. 현대 LLM도 학습 가능한 가중치를 사용하지만 자기지도 사전학습과 미분 가능한 다층 구조를 이용한다. 두 모델을 동일한 지도학습 방식으로 묶지 않고 넓은 신경망 학습사 안의 서로 다른 지점으로 본다.

## 구조적 언어관과의 접점

[[005_촘스키의 통사 구조]]는 n-gram 계보와 긴장 관계에 있는 구조적 언어관을 추가한다. n-gram은 제한된 표면 문맥의 확률로 언어를 모델링하지만, 촘스키는 자연어가 [[유한상태 모델]]보다 강한 형식 체계와 [[통사 구조]]를 요구한다고 보았다. 현대 LLM은 표면 확률 예측으로 학습되지만, 내부적으로 위계 구조를 어느 정도 학습하는지라는 질문에서 두 계보가 다시 만난다.

## 출처

- [[001_섀넌의 N-gram 모델]]
- [[002_튜링 테스트]]
- [[003_Georgetown-IBM 기계 번역 시연]]
- [[004_퍼셉트론]]
- [[005_촘스키의 통사 구조]]
- [[019_Katz 백오프와 희소 데이터 확률 추정]]
- [[035_신경 확률 언어 모형과 분산 단어 표현]]
- Slava M. Katz, [Estimation of Probabilities from Sparse Data for the Language Model Component of a Speech Recognizer](https://doi.org/10.1109/TASSP.1987.1165125), 1987, pp. 400–401.
- Stanley F. Chen·Joshua Goodman, [An Empirical Study of Smoothing Techniques for Language Modeling](https://dash.harvard.edu/handle/1/25104739), 1998, §§2.3–2.4·5.2.4.
- Yoshua Bengio·Réjean Ducharme·Pascal Vincent·Christian Jauvin, [A Neural Probabilistic Language Model](https://www.jmlr.org/papers/v3/bengio03a.html), 2003, pp. 1137–1155.
- Alec Radford 외, [Improving Language Understanding by Generative Pre-Training](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf), 2018, §§3.1·4.1.
- Jacob Devlin 외, [BERT](https://aclanthology.org/N19-1423/), 2019, §3.

## 관련 항목

- [[001_섀넌의 N-gram 모델]]
- [[002_튜링 테스트]]
- [[019_Katz 백오프와 희소 데이터 확률 추정]]
- [[035_신경 확률 언어 모형과 분산 단어 표현]]
- [[신경 확률 언어 모형]]
- [[단어 임베딩]]
- [[N-gram 모델]]
- [[마르코프 가정]]
- [[데이터 희소성]]
- [[Smoothing]]
- [[Perplexity]]
- [[튜링 테스트와 LLM 평가]]
- [[기계 번역]]
- [[AI 시연과 실제 성능]]
- [[퍼셉트론]]
- [[규칙 기반 AI에서 데이터 기반 학습으로]]
- [[통사 구조]]
- [[촘스키에서 LLM으로]]
- [[026_순환 신경망과 시간적 문맥 학습]]
- [[순환 신경망]]
