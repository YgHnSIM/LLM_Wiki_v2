---
schema_version: 2
id: meta.overview
page_type: meta
title: Overview
aliases:
  - 위키 개요
  - 홈페이지
tags:
  - type/meta
created: '2026-05-07'
updated: '2026-07-22'
lifecycle: active
verification: verified
artifacts: []
evidence: []
related:
  - meta.index
  - meta.log
---
# Overview

이 위키는 언어 모델링, 기계 지능 평가, 초기 기계 번역, 신경망 학습, 형식언어, 대화형 AI의 역사를 1차 문헌과 함께 연결한다. 수집 당시의 번역·해설은 `raw/`에 보존하고, 공개 문서는 locator가 있는 근거로 검증한다.

## 공식 장 번호와 원문 결손

공개 source의 번호는 Michael Brenndoerfer의 [공식 책 목차](https://mbrenndoerfer.com/books/history-of-language-ai)에 있는 110개 장 번호를 따른다. [연재 카테고리](https://mbrenndoerfer.com/writing/categories/history-of-language-ai)와 로컬 원문 목록에는 109개 게시물만 있으며, 차이는 공식 047 **Attention Mechanism (2015)**이다. 목차의 [047 연결 주소](https://mbrenndoerfer.com/writing/attention-mechanism-neural-machine-translation-dynamic-alignment)는 2026-07-21 현재 원문을 제공하지 않는다.

따라서 공식 047은 다른 문서로 채우지 않고 `wiki/meta/source-gaps.yml`에 upstream 원문 결손으로 남긴다. 외부 원문·번역·raw 파일명, raw 레지스트리 `order_prefix`, 공개 파일명·`source.NNN`·링크·URL은 모두 같은 공식 번호를 쓴다. 로컬 원문 목록은 001–046·048–110이며 047 파일은 없다. 현재 source 91개는 공식 001–046·048–091·103을 다룬다. [[GLaM에서 Mixtral까지의 희소 MoE 확장]]의 원문·번역·raw도 공식 103으로 통일했으며, 다음 순차 입력은 공식 092 `Function Calling and Tool Use: Enabling Practical AI Agent Systems`다.

숫자 badge는 정규 source의 공식 장 번호에만 쓴다. 비번호 reference가 추가되면 번호 source 뒤에서 `참고`로 표시하며, 목록 위치를 `001` 같은 장 번호로 바꾸지 않는다. 같은 장의 검증 노트·번역·해설은 서로 다른 장이 아니라 하나의 source 묶음에 속한다.

## 처음 읽는 사람을 위한 길잡이

처음부터 모든 문서를 순서대로 읽을 필요는 없다. source 91개, reference 0개, concept 165개, entity 29개, analysis 22개를 합친 비메타 문서 307개는 모두 쉬운 핵심, 작동 원리, 기술과 근거의 세 단계로 구성됐다. 모르는 수식이 나오면 1단계와 2단계만 읽고 관련 개념으로 이동한 뒤 돌아와도 된다. 기존 문서 전면 단계화가 완료됐고 신규 source에도 같은 구조를 처음부터 적용한다.

| 관심 | 권장 시작 | 이어 읽기 | 도착점 |
| --- | --- | --- | --- |
| 언어 모델은 어떻게 발전했나 | [[001_섀넌의 N-gram 모델]] | [[N-gram 모델]] → [[019_Katz 백오프와 희소 데이터 확률 추정]] → [[035_신경 확률 언어 모형과 분산 단어 표현]] → [[자기회귀 생성]] | [[N-gram에서 LLM으로]] |
| 기계의 언어 행동을 어떻게 평가하나 | [[002_튜링 테스트]] | [[033_BLEU와 기계 번역 자동 평가]] → [[051_SQuAD와 추출형 독해 평가]] → [[060_GLUE와 SuperGLUE의 집계 평가]] → [[079_HELM과 다차원 언어 모델 평가]] → [[HELM]] | [[튜링 테스트와 LLM 평가]] |
| 규칙에서 학습으로 무엇이 바뀌었나 | [[003_Georgetown-IBM 기계 번역 시연]] | [[012_상징 규칙에서 통계 학습으로]] → [[022_IBM 통계적 기계 번역과 데이터 기반 전환]] | [[규칙 기반 AI에서 데이터 기반 학습으로]] |
| 현대 Transformer 계열은 어디서 왔나 | [[018_역전파와 다층 신경망 학습]] | [[045_Sequence-to-Sequence 학습과 신경 기계 번역]] → [[055_Transformer와 자기어텐션 기반 시퀀스 모델링]] → [[064_Transformer-XL과 세그먼트 수준 재귀]] → [[061_XLNet·RoBERTa·ALBERT의 BERT 개선 경로]] | [[066_신경 언어 모델의 스케일링 법칙]] |
| 같은 dense attention을 더 적은 메모리 이동으로 어떻게 실행하나 | [[055_Transformer와 자기어텐션 기반 시퀀스 모델링]] | [[088_FlashAttention과 IO 인지형 정확 어텐션]] → [[FlashAttention]] → [[Transformer-XL]] | [[훈련 병렬성과 생성 순차성은 다른 축이다]] |
| 한 언어의 지식은 다른 언어로 어떻게 옮겨지나 | [[022_IBM 통계적 기계 번역과 데이터 기반 전환]] | [[045_Sequence-to-Sequence 학습과 신경 기계 번역]] → [[062_XLM과 교차 언어 사전 학습]] → [[XLM]] | [[같은 병렬 문장은 무엇을 학습시키는가]] |
| 검색과 외부 지식은 어떻게 연결되나 | [[010_벡터 공간 모델과 TF-IDF]] | [[024_BM25와 확률적 정보 검색]] → [[052_신경 정보 검색과 의미 대응]] → [[065_BERT 기반 passage 재순위화]] → [[068_DPR과 검색 증강 생성]] → [[073_ColBERT와 다중 벡터 검색]] | [[검색은 근거를 찾고 독해는 답을 찾는다]] |
| 자연어 명세는 어떻게 실행 코드가 되나 | [[067_GPT-3와 문맥 내 학습]] | [[071_Codex와 HumanEval 기반 코드 생성 평가]] → [[OpenAI Codex (2021)]] | [[자동 평가 지표는 무엇을 보상하는가]] |
| 자연어 지시는 언제 가중치에 들어가나 | [[063_T5와 Text-to-Text 통합 프레임워크]] | [[067_GPT-3와 문맥 내 학습]] → [[072_지시 미세조정과 FLAN의 제로샷 일반화]] → [[077_InstructGPT와 인간 선호 정렬]] → [[인간 피드백 강화학습]] | [[사전 학습 지식은 과제에 어떻게 도착하는가]] |
| 큰 모델을 제한된 GPU memory에서 어떻게 적응시키나 | [[057_ELMo와 ULMFiT의 두 전이 학습 경로]] | [[언어 모델 전이 학습]] → [[089_LLaMA 1과 제한적 공개 가중치 연구 배포]] → [[091_QLoRA와 4비트 양자화 미세조정]] → [[QLoRA]] | [[사전 학습 지식은 과제에 어떻게 도착하는가]] |
| 대화 인터페이스는 모델 능력과 신뢰를 어떻게 바꾸나 | [[007_ELIZA]] | [[077_InstructGPT와 인간 선호 정렬]] → [[081_ChatGPT 연구 미리보기와 대화형 LLM 배포]] → [[ChatGPT 연구 미리보기 (2022)]] | [[ELIZA에서 LLM으로]] |
| 음성 인식에서 학습되는 경계는 어떻게 넓어졌나 | [[013_은닉 마르코프 모델과 통계적 음성 인식]] | [[041_심층 신경망 음향 모델과 DNN-HMM 전환]] → [[087_Whisper와 대규모 약한 감독 음성 인식]] → [[Whisper]] → [[단어 오류율]] | [[규칙 기반 AI에서 데이터 기반 학습으로]] |
| 프롬프트는 추론 성능을 어떻게 바꾸나 | [[067_GPT-3와 문맥 내 학습]] | [[080_사고 연쇄 프롬프팅과 추론 행동 유도]] → [[사고 연쇄 프롬프팅]] → [[083_PaLM과 Pathways 기반 대규모 언어 모델 확장]] → [[079_HELM과 다차원 언어 모델 평가]] | [[손실 곡선과 능력 곡선 사이]] |
| 이미지·동영상 조건은 생성 모델에 어떻게 들어가나 | [[070_CLIP과 대조적 언어-이미지 사전 학습]] | [[CLIP]] → [[084_Flamingo와 게이트 교차 어텐션 기반 퓨샷 시각-언어 학습]] → [[085_DALL·E 2와 CLIP 잠재 표현 기반 계층적 확산 생성]] → [[086_잠재 확산 모델과 Stable Diffusion v1 공개]] → [[잠재 확산 모델]] → [[Stable Diffusion]] | [[사전 학습 지식은 과제에 어떻게 도착하는가]] |
| 모델 공개는 곧 재현 가능성을 뜻하나 | [[074_The Pile과 대규모 언어 모델 학습 말뭉치]] | [[076_파운데이션 모델 보고서와 AI 생태계]] → [[082_BLOOM과 공개 접근 다국어 LLM]] → [[BLOOM]] → [[089_LLaMA 1과 제한적 공개 가중치 연구 배포]] → [[LLaMA 1]] → [[090_공개 가중치 LLM 파동과 서로 다른 공개 범위]] | [[공개 가중치와 재현 가능성은 같은 축인가]] |
| 희소 모델의 ‘크기’는 무엇을 뜻하나 | [[069_전문가 혼합과 희소 활성 스케일링]] | [[GLaM에서 Mixtral까지의 희소 MoE 확장]] → [[Mixtral 8x7B]] | [[총 매개변수와 활성 계산량은 같은 축인가]] |
| 학습 데이터의 양과 구성을 어떻게 읽나 | [[063_T5와 Text-to-Text 통합 프레임워크]] | [[066_신경 언어 모델의 스케일링 법칙]] → [[067_GPT-3와 문맥 내 학습]] → [[074_The Pile과 대규모 언어 모델 학습 말뭉치]] → [[The Pile]] → [[078_Chinchilla와 계산 최적 언어 모델 학습]] → [[089_LLaMA 1과 제한적 공개 가중치 연구 배포]] → [[090_공개 가중치 LLM 파동과 서로 다른 공개 범위]] | [[데이터 품질과 분포 다양성은 같은 축인가]] |

## 난이도에 따른 읽기 방법

- **입문:** 각 문서의 `학습 안내`, `1단계`, `검증과 한계`, `학습 확인`을 먼저 읽는다. 용어는 연결된 concept 문서의 쉬운 예시로 확인한다.
- **중급:** `2단계`의 문제→아이디어→처리→결과 흐름을 따라가고, 같은 문제를 푼 서로 다른 source를 analysis 문서에서 비교한다.
- **심화:** `3단계`의 수식·구조·실험 조건을 frontmatter의 evidence locator 및 `## 출처`와 대조한다. 사실, 위키의 합성 해석, 후대 평가가 어디서 갈리는지 확인한다.

전체 페이지를 유형별로 찾으려면 [[index]]를, 최근 변경과 남은 제한을 확인하려면 [[log]]를 사용한다.

## 91개 소스의 범위

- [[001_섀넌의 N-gram 모델]]은 1948년 확률적 통신원과 문자·단어 연속 근사를 후대 [[N-gram 모델]]과 연결하되, smoothing과 현대 평가 관행은 후대 발전으로 구분한다.
- [[002_튜링 테스트]]는 1950년의 성별 [[모방 게임]]과 오늘날 표준화된 인간 대 기계 텍스트 시험의 차이를 설명한다.
- [[003_Georgetown-IBM 기계 번역 시연]]은 1954년 시연의 약 250개 어휘, 6개 통사 연산, 선별된 화학 문장이라는 실제 범위를 기록한다.
- [[004_퍼셉트론]]은 1957년 보고서와 1958년 논문, 오류 수정 규칙, 수렴 조건, [[XOR 문제]]의 의미를 구분한다.
- [[005_촘스키의 통사 구조]]는 1956·1957년 형식문법, 1959년 Skinner 비판, 1965년 심층·표층 구조, 1980년대 원리와 매개변수를 시기별로 나눈다.
- [[006_위드로-호프의 MADALINE]]은 1960년 ADALINE·LMS, 1962년 Madaline I 규칙, 선형 LMS의 볼록 오차 표면, 후대 [[적응 필터]] 응용을 구분한다.
- [[007_ELIZA]]는 1964~1966년 ELIZA 프레임워크와 [[DOCTOR 스크립트]], 후대 용어인 [[ELIZA 효과]]를 구분한다.
- [[008_비터비 알고리즘]]은 1967년 통신 복호 절차, 후대 [[은닉 마르코프 모델]] 음성 인식, 1988년 통계적 품사 태깅을 시기와 문헌별로 구분한다.
- [[009_SHRDLU]]는 1968~1970년 개발, 1971년 보고서, 1972년 출판을 구분하고 [[블록 세계]]에서 통사·의미·추론·행동을 통합한 성과와 [[마이크로월드]]의 한계를 함께 기록한다.
- [[010_벡터 공간 모델과 TF-IDF]]는 1968년 솔턴 저서, 1972년 스파크 존스의 용어 특이성, 1975년 [[벡터 공간 모델]] 논문을 구분하고 희소 용어 가중을 일반 의미 이해와 구별한다.
- [[011_개념 의존]]은 1969년 개념 파서, 1972년 이론 정식화, 1973년 MARGIE, 1975년 SAM, 1977년 PAM을 구분하고 정규 의미 표현의 성과와 수작업 지식의 한계를 함께 기록한다.
- [[012_상징 규칙에서 통계 학습으로]]는 1940~1990년대의 [[통계적 자연어 처리]]를 과제별로 나누고, 1980년대 단일 혁명 서사보다 경험적 방법의 재부상과 상징·통계 혼합을 기록한다.
- [[013_은닉 마르코프 모델과 통계적 음성 인식]]은 1966·1970년의 HMM 수학, 1967년 통신 복호, 1975~1976년 음성 적용을 구분하고 평가·디코딩·학습의 차이와 후대 신경망 직접 계보 과장을 교정한다.
- [[014_증강 전이망과 절차적 자연어 파싱]]은 1969년 보고서와 1970년 논문, 1973년 LUNAR 적용을 구분하고 [[유한상태 모델|유한상태 전이망]]·재귀 전이망·[[증강 전이망]]의 계산 능력과 파싱 복잡도를 나누어 설명한다.
- [[015_몬태규 의미론과 합성적 자연언어 해석]]은 1970년 EFL·UG와 1970년 발표·1973년 사후 출판 PTQ를 구분하고, [[몬태규 의미론]]의 유형·내포·양화 분석과 LUNAR·Rosetta·Core Language Engine의 서로 다른 계산 계보를 나누어 설명한다.
- [[016_중국어 방 논증과 강한 AI 논쟁]]은 1980년 목표 논문·공개 논평·저자 응답의 DOI와 페이지를 분리하고, [[중국어 방 논증]]이 프로그램 구현의 충분성을 겨냥한다는 범위와 체계 반론·기호 접지·현대 LLM 적용의 논쟁 상태를 기록한다.
- [[017_Lesk 알고리즘과 단어 의미 중의성 해소]]는 1986년 실제 글로스 중첩 절차와 소규모 평가를 검증하고, [[Lesk 알고리즘]]·단순화 레스크·Adapted Lesk·Extended Gloss Overlaps·임베딩 WSD·GlossBERT의 범위를 구분한다.
- [[018_역전파와 다층 신경망 학습]]은 1970·1982년 선행 역누적 미분과 1986년의 일반화 델타 규칙을 구분하고, [[역전파]]·최적화·[[다층 퍼셉트론]]·[[기울기 소실]]의 역할과 실험 범위를 검증한다.
- [[019_Katz 백오프와 희소 데이터 확률 추정]]은 고빈도 유지·저빈도 할인·미관측 사건의 α 정규화 백오프·미관측 이력의 직접 후퇴라는 네 분기를 복원하고, 약 75만 단어와 100문장의 제한된 평가 및 현대 LLM과의 기술적 비동일성을 기록한다.
- [[020_시간 지연 신경망과 음소 인식]]은 1987년 기술 보고서와 1989년 논문을 구분하고, [[시간 지연 신경망]]의 공유 가중치·시간 통합과 화자 종속 B·D·G 분류의 실제 범위를 검증한다.
- [[021_합성곱 신경망과 특징 학습]]은 1980년 neocognitron·1987년 TDNN·1989년 우편번호 인식망·1998년 LeNet-5·2012년 AlexNet을 구분하고, [[합성곱 신경망]]의 국소 연결·가중치 공유·이동 등변성과 특징 학습의 실제 범위를 검증한다.
- [[022_IBM 통계적 기계 번역과 데이터 기반 전환]]은 1988년 연구 구상, 1990년 예비 시스템, 1991년 문장 정렬, 1993년 IBM Models 1–5와 1994년 Candide를 구분하고, [[통계적 기계 번역]]의 잡음 채널·잠재 정렬·EM과 후대 계보의 범위를 검증한다.
- [[023_Penn Treebank와 통계적 구문 분석]]은 1989–1992년 1단계, 1992년 예비 배포, 1994년 주석 개편과 1995년 Treebank-2 배포를 구분하고, 자동 전처리·인간 교정·PARSEVAL·Collins 파서의 실제 범위를 검증한다.
- [[024_BM25와 확률적 정보 검색]]은 1976년 관련성 가중치, 1994년 2-Poisson 근사와 Okapi TREC-3 보고를 구분하고, [[BM25]]의 빈도 포화·길이 보정·점수 해석 및 밀집 검색·RAG와의 관계를 검증한다.
- [[025_WordNet과 어휘 의미망]]은 1985년 프로젝트 시작, 1990년 논문군, 1992–1998년 배포·출판 단계를 구분하고, [[WordNet]]의 synset·어휘/의미 관계·품사별 구조와 후대 기술의 직접 계보 과장을 검증한다.
- [[026_순환 신경망과 시간적 문맥 학습]]은 Jordan·Williams–Zipser·Elman·Werbos의 1986–1990년 구조·학습 연구, 1994년 장기 의존성 분석과 음성 응용, 1997년 LSTM을 구분하고, [[순환 신경망]]의 학습 가능한 상태·BPTT·장거리 그래디언트 및 Transformer와의 구조적 단절을 검증한다.
- [[027_최대 엔트로피와 서포트 벡터 머신]]은 1993–1996년 MaxEnt NLP와 1995–2004년 SVM·구조 출력의 전개를 구분하고, [[최대 엔트로피 모델]]의 조건부 확률·명시적 결합 특징과 [[서포트 벡터 머신]]의 최대 마진·커널·추론 비용을 검증한다.
- [[028_장단기 메모리와 장기 의존성 학습]]은 1995년 기술보고서·1997년 CEC와 입력·출력 게이트·2000년 망각 게이트를 구분하고, [[장단기 메모리]]의 직접 그래디언트 경로와 후대 언어·음성·번역 응용의 실제 범위를 검증한다.
- [[029_통계적 구문 분석과 어휘화 파서]]는 1973년 확률 문법부터 1997년 Collins의 세 생성적 어휘화 모델까지의 누적 과정을 복원하고, PCFG·보간·CKY식 차트 상태·WSJ 평가와 후대 파서 및 LLM의 비직접 계보를 검증한다.
- [[030_FrameNet과 프레임 의미론]]은 1997년 프로젝트 출범, 1998년 초기 보고, 2001년 starter lexicon 공개를 구분하고, [[FrameNet]]의 프레임·어휘 단위·프레임 요소·말뭉치 주석과 PropBank·AMR·LLM 계보의 실제 범위를 검증한다.
- [[031_잠재 의미 분석과 확률적 잠재 의미 색인]]은 1988·1990년 LSI, 1998년 LSA의 인지·교육 확장, 1999년 pLSI와 2003년 LDA를 구분하고, [[잠재 의미 분석]]의 절단 SVD·검색 실험과 [[확률적 잠재 의미 분석]]의 EM·문서 수준 한계를 검증한다.
- [[032_조건부 무작위장과 구조화 예측]]은 HMM·MEMM·CRF의 생성/판별·국소/전역 정규화를 구분하고, [[조건부 무작위장]]의 선형 사슬 확률식·동적 계획법·Penn Treebank 실험·신경 CRF 계보의 범위를 검증한다.
- [[033_BLEU와 기계 번역 자동 평가]]는 [[BLEU]]의 수정 n-gram 정밀도·brevity penalty·말뭉치 집계를 복원하고, 인간 판단과의 제한된 상관·설정 재현성·통계적 불확실성·비미분 학습 목표의 경계를 검증한다.
- [[034_구 기반 통계적 기계 번역과 최소 오류율 훈련]]은 [[구 기반 통계적 기계 번역]]의 정렬 일관 문자열·lexical weighting·근사 탐색과 [[최소 오류율 훈련]]의 n-best 선 경계 탐색·목적 지표 의존성·과적합 위험을 검증한다.
- [[035_신경 확률 언어 모형과 분산 단어 표현]]은 [[신경 확률 언어 모형]]의 고정 문맥 word-feature MLP·전체 어휘 softmax·공동 가능도 학습과 [[단어 임베딩]]의 정적 word type 범위, Brown·AP News perplexity 증거 및 현대 LLM 계보를 검증한다.
- [[036_잠재 디리클레 할당과 베이지안 토픽 모델링]]은 [[잠재 디리클레 할당]]의 문서 수준 Dirichlet 혼합·단어 생성 구조·평균장 변분 추론과 AP·Reuters·EachMovie 평가를 복원하고, 기본 모형의 고정 $\beta$ 행렬과 후대 토픽-단어 Dirichlet 사전분포를 구분한다.
- [[037_ROUGE와 METEOR의 과제별 생성 텍스트 평가]]는 [[ROUGE]]의 N·L·W·S/SU 지표군과 DUC 조건별 상관, [[METEOR]]의 exact·stem·WordNet 정렬·recall 가중·chunk 벌점을 복원하고, 2004년 선행 연구와 2005년 정식 논문을 구분한다.
- [[038_PropBank와 의미역 표지]]는 2001년 선행 발표·2002년 사전 판정 공개·2004년 완전 주석 완료·2005년 대표 논문을 구분하고, [[PropBank]]의 roleset별 번호형 논항과 Penn Treebank 노드 주석 및 [[의미역 표지]]·CoNLL 과제의 범위를 검증한다.
- [[039_Freebase와 협업형 지식 그래프]]는 [[Freebase]]의 편집 가능한 스키마·비계층 다중 타입·MID·CVT·MQL을 복원하고, [[지식 그래프]]의 패턴 질의와 형식 추론 및 Google Knowledge Graph 활용·Wikidata 이전을 구분한다.
- [[040_IBM Watson과 Jeopardy 질의응답]]은 [[IBM Watson]]의 전자 텍스트 입력과 로컬 corpus, [[DeepQA]]의 후보 생성·근거 점수화·신뢰도 및 게임 전략을 복원하고 [[개방 영역 질의응답]] 시연과 범용 이해를 구분한다.
- [[041_심층 신경망 음향 모델과 DNN-HMM 전환]]은 2009–2012년의 누적 과정을 복원하고 [[DNN-HMM]]에서 GMM 음향 모델이 교체됐지만 HMM 디코더·발음 사전·언어 모델은 유지됐다는 점과 [[단어 오류율]]의 조건부 개선을 검증한다.
- [[042_Wikidata와 다언어 협업 지식 베이스]]는 [[Wikidata]]의 item·property·statement와 [[Wikibase 데이터 모델]]의 qualifier·reference·rank를 복원하고, [[SPARQL]] 질의·Wikipedia 재사용·개방 서비스·LLM grounding의 범위를 검증한다.
- [[043_Word2Vec와 효율적 정적 단어 임베딩]]은 [[Word2Vec]]을 하나의 의미 이해 발명으로 보지 않고 [[CBOW]]·[[Skip-gram]]과 계층적 softmax·부정 샘플링을 시기별로 구분하며, 유추 벡터·shifted PMI·정적 [[단어 임베딩]]의 범위를 검증한다.
- [[044_GloVe와 Adam의 서로 다른 2014년 전환]]은 [[GloVe]]의 국소 창·전역 희소 계수·가중 log-bilinear 회귀와 [[Adam 최적화기]]의 모멘트·편향 보정·후속 수렴 및 AdamW를 독립 연구로 검증한다.
- [[045_Sequence-to-Sequence 학습과 신경 기계 번역]]은 [[Sequence-to-Sequence 학습]]의 조건부 생성 인터페이스와 [[인코더-디코더]]·[[자기회귀 생성]]을 복원하고, Sutskever·Cho 시스템의 역할 차이와 어텐션·GNMT·현대 LLM 계보의 범위를 검증한다.
- [[046_메모리 네트워크와 외부 지식 접근]]은 [[메모리 네트워크]]의 I·G·O·R와 hard supporting-fact 선택·강한 감독을 복원하고, [[외부 메모리]]·[[다중 홉 검색]]에서 End-To-End MemNN·bAbI·RAG로 이어지는 단계의 범위를 검증한다.
- [[048_잔차 학습과 매우 깊은 신경망]]은 [[ResNet]]의 [[Degradation problem]]과 (F(x)+x) [[잔차 연결]]을 복원하고, 기울기 소실·Highway Network·pre-activation·Transformer residual stream을 구분한다.
- [[049_층 정규화와 시퀀스 모델의 배치 독립성]]은 [[Batch Normalization]]과 [[Layer Normalization]]의 통계 공유 축·훈련/추론 상태를 복원하고, token별 hidden 정규화·Post/Pre-LN·[[RMSNorm]]의 범위를 검증한다.
- [[050_FastText와 서브워드 표현의 두 경로]]는 [[FastText]]의 문자 n-gram 합·hash·정적 OOV 근사와 [[Byte Pair Encoding|BPE]]의 sequence 분절을 구분하고, [[서브워드 토큰화]]·SentencePiece·현대 Transformer 연결의 범위를 검증한다.
- [[051_SQuAD와 추출형 독해 평가]]는 536개 위키백과 문서·107,785개 질문, 답 구간·EM·토큰 F1을 복원하고, [[추출형 질의응답]]과 검색·생성·일반 언어 이해의 경계 및 SQuAD 2.0의 답 없음 판단을 검증한다.
- [[052_신경 정보 검색과 의미 대응]]은 2013년 DSSM·2014년 C-DSSM·2016년 DRMM을 구분하고, [[신경 정보 검색]]의 표현 중심·상호작용 중심 구조와 희소 exact signal·재순위화·DPR·RAG 연결 범위를 검증한다.
- [[053_GNMT와 제품 규모 신경 번역]]은 8층 LSTM·어텐션·잔차 연결·WordPiece·탐색 보정을 하나의 제품 시스템으로 복원하고, 평균 약 60% 오류 감소의 평가 조건과 중국어→영어 최초 배포 범위를 구분한다.
- [[054_WaveNet과 표본 단위 신경 오디오 생성]]은 μ-law 양자화 표본의 자기회귀 분포와 팽창 인과 합성곱을 복원하고, 훈련 병렬성·생성 순차성·MOS 격차·2017년 후속 제품 배포를 구분한다.
- [[055_Transformer와 자기어텐션 기반 시퀀스 모델링]]은 6층 encoder–decoder·scaled multi-head attention·위치 인코딩·Post-LN을 복원하고, 훈련 병렬성·길이 제곱 비용·자기회귀 생성·후대 LLM 계보를 분리한다.
- [[056_RLHF 토대와 인간 선호 기반 보상 학습]]은 2017년 행동 구간 비교·보상 ensemble·반복 정책 학습을 복원하고, 원 제어·게임 실험과 2019–2022년 언어 모델 RLHF를 구분한다.
- [[057_ELMo와 ULMFiT의 두 전이 학습 경로]]는 ELMo의 고정 문맥 특징과 ULMFiT의 단계적 전체 미세조정을 구분하고, 두 접근의 양방향성·목표 영역 적응·적은 표지 자료 결과와 현대 Transformer 계보의 범위를 검증한다.
- [[058_BERT의 마스크드 양방향 사전 학습]]은 [[BERT]]의 encoder·[[마스크드 언어 모델링]]·NSP·전체 미세조정을 복원하고, 15%·80/10/10 masking과 benchmark·생성 범위를 검증한다.
- [[059_GPT-1과 GPT-2의 전이 방식 변화]]는 GPT-1의 지도 미세조정과 GPT-2의 cue 기반 zero-shot text continuation을 구분하고, WebText·과제별 출력·release 연표와 현대 prompting 계보의 범위를 검증한다.
- [[060_GLUE와 SuperGLUE의 집계 평가]]는 [[GLUE와 SuperGLUE]]의 과제·metric·단순 평균·human estimate·포화를 복원하고, 표준화가 통제하지 않는 training 조건과 benchmark 과적합을 검증한다.
- [[061_XLNet·RoBERTa·ALBERT의 BERT 개선 경로]]는 [[XLNet·RoBERTa·ALBERT]]를 objective·training recipe·parameterization의 세 축으로 나누고, factorization order·총 sequence·parameter와 FLOPs의 차이 및 raw의 성능 과장을 교정한다.
- [[062_XLM과 교차 언어 사전 학습]]은 [[XLM]]의 CLM·MLM·TLM, shared BPE·언어 sampling과 English-label XNLI 전이를 복원하고, unseen-language zero-shot·few-shot·QA·검색·mBERT 후속 계보의 과장을 교정한다.
- [[063_T5와 Text-to-Text 통합 프레임워크]]는 [[T5]]의 공통 text input/output, sentinel span corruption, C4와 task별 fine-tuning을 복원하고, metric·checkpoint·instruction·번역·QA·계산량·직접 후속 계보의 과장을 교정한다.
- [[064_Transformer-XL과 세그먼트 수준 재귀]]는 [[Transformer-XL]]의 stop-gradient memory와 layer-shift recurrence, 상대 위치 attention을 복원하고, memory 길이·dependency·dense attention 비용과 조건부 RECL·평가 속도 수치를 구분한다.
- [[065_BERT 기반 passage 재순위화]]는 BM25 상위 후보를 BERT 결합 self-attention과 `[CLS]` 분류 점수로 다시 매기는 구조를 복원하고, 후보 recall·512 WordPiece·후보별 계산 비용과 Google 공개 범위를 구분한다.
- [[066_신경 언어 모델의 스케일링 법칙]]은 WebText2 자기회귀 token loss의 모델·데이터·compute별 조건부 power law와 Kaplan식 0.73/0.27 배분을 복원하고, downstream 능력 예측·보편 법칙·Chinchilla가 처음 균형 문제를 풀었다는 과장을 교정한다.
- [[067_GPT-3와 문맥 내 학습]]은 125M–175B 여덟 모델의 zero·one·few-shot 조건을 복원하고, 과제별 성능 차이·산술 exact match·benchmark 오염·후대 창발 용어와 내부 메커니즘의 범위를 검증한다.
- [[068_DPR과 검색 증강 생성]]은 BERT dual encoder·hard negative·FAISS를 사용한 DPR와 DPR query encoder·BART-large·잠재 문서 주변화를 결합한 원 RAG를 분리하고, 고정 문서 색인·평가 과제·hot-swap·인용 충실성의 실제 경계를 검증한다.
- [[069_전문가 혼합과 희소 활성 스케일링]]은 1991년 adaptive mixture, 2017년 sparsely-gated layer, GShard의 top-2와 Switch의 top-1을 분리하고, total parameters·active compute·memory·communication 및 expert specialization의 증거 경계를 검증한다.
- [[070_CLIP과 대조적 언어-이미지 사전 학습]]은 4억 image–text pair의 대칭 대조 학습, 수정 ResNet·ViT 이중 인코더와 class prompt 기반 zero-shot 분류를 복원하고, shared embedding과 일반 멀티모달 이해·생성·VQA의 경계를 검증한다.
- [[071_Codex와 HumanEval 기반 코드 생성 평가]]는 최대 12B 연구 Codex의 Python 코드 계속학습과 Codex-S 추가 미세조정을 분리하고, HumanEval·pass@k·unit-test oracle 및 GitHub Copilot production version의 경계를 검증한다.
- [[072_지시 미세조정과 FLAN의 제로샷 일반화]]는 62개 데이터셋·12개 과제 군집을 자연어 지시로 미세조정한 137B FLAN을 복원하고, 군집별 별도 checkpoint·template 선택·모델 규모 효과와 최초 발명·보편적 향상·안전 정렬 주장의 경계를 검증한다.
- [[073_ColBERT와 다중 벡터 검색]]은 SIGIR 2020 ColBERT의 독립 BERT 부호화·MaxSim 후기 상호작용·FAISS 후보 검색을 복원하고, 2021 연도·저자 소속·exact match·문서 길이 제곱 비용·cross-encoder 계보와 후속 응용의 범위를 교정한다.
- [[074_The Pile과 대규모 언어 모델 학습 말뭉치]]는 22개 영어 중심 component의 825.18 GiB raw·1,254.20 GiB effective mixture를 복원하고, Pile-wide dedupulation 부재·40GB 통제 비교·권리와 동의·재현성의 경계를 검증한다.
- [[075_DALL·E와 이산 이미지 토큰 생성]]은 256×256 이미지를 1,024개 이산 토큰으로 압축해 text와 공동 자기회귀 모델링한 12B sparse Transformer를 복원하고, 대조 재순위화·MS-COCO/CUB 평가·중복·공개 범위와 인간 창의성·후대 직선 계보의 경계를 검증한다.
- [[076_파운데이션 모델 보고서와 AI 생태계]]는 광범위한 데이터·대규모 학습·후속 과제 적응의 정의와 창발·동질화·중간 자산의 생태계를 복원하고, GPT-4 소급·최소 과제 학습·달성된 민주화·추론 환경비용 누락·후대 영향 인과를 교정한다.
- [[077_InstructGPT와 인간 선호 정렬]]은 평가자 시연 SFT·4–9개 응답 순위의 보상 모델·SFT 기준 KL과 PPO-ptx를 복원하고, 보편적 인간 가치·능력 무손실·안전한 거절·모든 후속 모델의 단일 계보라는 확대를 교정한다.
- [[078_Chinchilla와 계산 최적 언어 모델 학습]]은 fixed-compute 세 추정법의 0.50/0.50·0.49/0.51·0.46/0.54 배분과 Chinchilla–Gopher의 같은 훈련 FLOPs를 복원하고, $C^{1/3}$·보편 20:1·Kaplan의 절충 누락·단일 175B 외삽값을 교정한다.
- [[079_HELM과 다차원 언어 모델 평가]]는 16개 핵심·26개 표적 시나리오, 공통 5-shot 적응과 일곱 메트릭을 복원하고, 98/112 메트릭 coverage·17.9%→96.0% 평가 coverage를 정확도·안전 인증과 구분한다.
- [[080_사고 연쇄 프롬프팅과 추론 행동 유도]]는 few-shot CoT와 2단계 Zero-shot-CoT를 분리하고, 대표 정확도 상승을 모델·과제·prompt·답 추출 조건에 묶어 읽으며 출력 타당성·답 정확도·인과적 충실성 및 추론 비용을 구분한다.
- [[081_ChatGPT 연구 미리보기와 대화형 LLM 배포]]는 무료 연구 미리보기와 다중 턴 UI, 대화 시연 SFT→응답 순위·보상 모델→PPO, 사용자 피드백 순환을 복원하고 초기 ChatGPT의 175B·지속 기억·완전한 안전·산업 영향 인과 과장을 교정한다.
- [[082_BLOOM과 공개 접근 다국어 LLM]]은 176B decoder-only model, ROOTS 498개 구성 dataset·46개 자연어와 13개 programming language, Jean Zay 학습을 복원하고 weight·code·data·RAIL·compute를 분리해 최초성·최첨단·편향 해소·민주화 과장을 교정한다.
- [[083_PaLM과 Pathways 기반 대규모 언어 모델 확장]]은 540.35B dense decoder-only Transformer, 780B-token mixture와 두 TPU v4 Pod·6,144 chip 훈련을 복원하고, sparse attention·공개 weight·균등한 100개 언어 지원·base PaLM과 PaLM-Coder 혼동·일반 추론 과장을 평가 조건으로 교정한다.
- [[084_Flamingo와 게이트 교차 어텐션 기반 퓨샷 시각-언어 학습]]은 동결 NFNet-F6·언어 모델 사이에 64개 시각 token의 Perceiver Resampler와 0-init gated cross-attention을 연결한 구조를 복원하고, 퓨샷 문맥 조건화와 미세조정·gate 학습을 구분하며 16개 과제·자료 mixture·실패 양상·연구용 한계를 검증한다.
- [[085_DALL·E 2와 CLIP 잠재 표현 기반 계층적 확산 생성]]은 동결 [[CLIP]] 표현에서 image embedding을 생성하는 prior와 계층적 확산 decoder·upsampler를 복원하고, classifier-free guidance와 CLIP gradient guidance, 논문 unCLIP과 Preview 제품 기능, 품질·다양성 평가 축을 구분한다.
- [[086_잠재 확산 모델과 Stable Diffusion v1 공개]]는 CVPR 2022의 일반 [[잠재 확산 모델]]과 2022년 8월 공개된 [[Stable Diffusion]] v1을 분리하고, 지각 오토인코더·잠재 U-Net·CLIP token 교차 어텐션·classifier-free guidance 및 계산·면허·안전의 조건을 검증한다.
- [[087_Whisper와 대규모 약한 감독 음성 인식]]은 웹의 오디오-전사 쌍을 기존 ASR 산출물로 새로 만든 자료와 구분하고, 30초 log-Mel encoder–decoder·다중 과제 token·zero-shot 분포 밖 평가를 복원해 번역 방향·언어 수·SOTA·사람 수준·공개 범위의 과장을 교정한다.
- [[088_FlashAttention과 IO 인지형 정확 어텐션]]은 같은 dense softmax attention을 HBM에 $n\times n$ 중간 행렬로 물질화하지 않는 타일링·온라인 softmax·backward 재계산을 복원하고, 정확성·I/O·FLOPs·추가 메모리·긴 문맥 품질을 서로 다른 축으로 구분한다.
- [[089_LLaMA 1과 제한적 공개 가중치 연구 배포]]는 6.7B–65.2B family의 1.0T·1.4T-token 장기 학습을 training-compute optimum과 반복 inference budget의 교환으로 복원하고, base LLaMA·LLaMA-I·Llama 2 및 신청 승인형 비상업 연구 weight 배포를 구분한다.
- [[090_공개 가중치 LLM 파동과 서로 다른 공개 범위]]는 MPT·Falcon·Mistral의 2023년 출시를 하나의 단선 계보가 아니라 weight·code·data·license·compute 공개 범위가 다른 평행 사례로 비교하고, ALiBi·MQA·GQA·SWA·FlashAttention의 병목과 benchmark 조건을 분리한다.
- [[091_QLoRA와 4비트 양자화 미세조정]]은 동결한 NF4 base storage, BF16 compute와 all-linear LoRA update를 분리하고, double quantization·paged optimizer의 서로 다른 memory 역할과 24GB 33B·48GB 65B·MMLU·Guanaco 평가 조건을 검증한다.
- [[103_GLaM에서 Mixtral까지의 희소 MoE 확장]]은 GLaM·Mixtral의 total·active parameter와 token별 routing을 복원하고, 2024년 최초성·Meta 귀속·dense 계산의 제곱 증가·깨끗한 domain expert·민주화 과장을 교정한다.

## 현재 핵심 주제

- [[N-gram 모델]], [[조건부 확률]], [[데이터 희소성]], [[Smoothing]], [[Perplexity]]
- [[019_Katz 백오프와 희소 데이터 확률 추정|Katz 백오프]]의 빈도별 할인, 미관측 사건에만 적용하는 α 정규화, 보간법과의 구분
- [[최고 경로와 기대 통계, 백오프]]에서 구분하는 Viterbi `argmax`, 순방향 경로합, Baum–Welch·IBM EM의 사후 기대 계수, Katz의 미관측 확률 재분배
- [[확률, 마진, 순위 점수]]에서 구분하는 생성·조건부 확률의 정규화 범위, SVM 결정값, BM25·CLIP 계열 순위 점수, DALL·E의 후보 생성 분포와 512개 후보 재순위화 및 경험적 보정의 차이
- [[튜링 테스트]], [[행동주의적 지능 기준|행동 기반 지능 기준]], [[중국어 방 논증]], [[강한 AI]]
- 약 250개 어휘와 6개 연산으로 수행한 초기 [[기계 번역]] 시연과 [[지식 공학 병목]]
- [[통계적 기계 번역]]의 언어 모델·번역 모델 분해, 잠재 단어 정렬과 EM, IBM Models 1–5, 구 기반 SMT와 [[신경망 기계 번역]]의 경계
- [[퍼셉트론]] 오류 수정과 [[ADALINE]]·[[LMS 알고리즘]]의 선형 그래디언트 학습 차이
- [[MADALINE]]의 고정 논리층과 후대 [[적응 필터]] 연구의 구분
- [[역전파]]의 그래디언트 계산과 [[경사하강법]]의 매개변수 갱신 구분, [[다층 퍼셉트론]]의 은닉 표상 학습
- [[기울기 소실]]·폭주의 조건과 1985–1986년 소규모 합성 과제에서 후대 실용 응용으로 이어진 시기 구분
- [[시간 지연 신경망]]의 국소 시간 합성곱·이동 등변성과 최종 시간 통합, 수동 정렬·화자 종속 실험의 한계
- [[순환 신경망]]의 시간축 상태 전이·매개변수 공유·BPTT와 은닉 상태를 완전한 기억으로 볼 수 없는 범위, 장기 의존성의 학습 난점
- [[최대 엔트로피 모델]]의 특징 기대값·로그선형 조건부 확률·명시적 결합 특징과 [[서포트 벡터 머신]]의 soft margin·선택적 커널·서포트 벡터 비용 구분
- [[027_최대 엔트로피와 서포트 벡터 머신]]에서 복원한 1993–2004년 특징 기반 판별 NLP 연표, 품사·청킹·개체명 수치의 말뭉치·ensemble·학습량 조건
- [[장단기 메모리]]의 1997년 원형과 2000년 망각 게이트, 셀 상태 직접 경로와 전체 야코비안의 구분, LSTM sequence-to-sequence·attention·Transformer의 구조적 차이
- [[합성곱 신경망]]의 2차원 국소 연결·가중치 공유·수용 영역과 이동 등변성, pooling·stride가 보장하지 않는 완전한 이동 불변성
- [[얀 르쿤]]과 공동 저자들의 1989년 우편번호 인식망, 1998년 LeNet-5, 선행 neocognitron·TDNN과 후대 AlexNet의 시기 구분
- [[통사 구조]], [[변형생성문법]], [[촘스키 위계]], [[파싱]]의 역사적 시기 구분
- [[보편문법]]과 [[자극의 빈곤]]의 논쟁 상태
- [[ELIZA]], [[패턴 매칭]], [[템플릿 기반 응답 생성]], 사용자 의인화
- [[비터비 알고리즘]], [[동적 계획법]], [[은닉 마르코프 모델]], [[Baum–Welch 알고리즘]]의 경로 합·최고 경로·매개변수 재추정 구분
- [[SHRDLU]], [[블록 세계]], [[마이크로월드]]의 통합적 언어 이해와 폐쇄 영역의 일반화 한계
- [[벡터 공간 모델]], [[TF-IDF]], [[코사인 유사도]]를 이용한 희소 검색의 순위화와 어휘 불일치 한계
- [[잠재 의미 분석]]의 절단 SVD와 저차원 질의·문서 비교, [[확률적 잠재 의미 분석]]의 잠재 클래스 혼합·EM 및 LDA가 보완한 문서 수준 생성 구조
- [[잠재 디리클레 할당]]의 전역 토픽과 문서별 지역 혼합 분리, pLSI와 다른 새 문서 추론, 변분 EM의 $\gamma$·$\varphi$ 지역 상태 및 토픽 해석의 범위
- [[031_잠재 의미 분석과 확률적 잠재 의미 색인]]에서 구분하는 MED·CISI 검색 평가의 제한된 범위와 LSI·Word2Vec·GloVe·Transformer 사이의 구조적 유사성·직접 계보 차이
- [[조건부 무작위장]]의 전역 정규화, MEMM label bias, 상태·전이 특징, forward-backward·Viterbi 계산과 neural CRF에서 달라지는 볼록성
- [[BLEU]]의 참조별 최대 횟수 clipping, 1–4-gram 기하평균, brevity penalty와 말뭉치 단위 해석, 참조·토큰화·시험 집합에 따른 점수 조건
- [[ROUGE]]의 참조 측 n-gram recall과 LCS·skip-bigram F-measure, [[METEOR]]의 일대일 unigram 정렬·recall 가중·어순 단편화 및 평가 지표의 과제별 유인
- [[자동 평가 지표는 무엇을 보상하는가]]에서 비교하는 BLEU·ROUGE·METEOR의 분모·대응 단위·집계 방식, HumanEval 실행 검사와 InstructGPT 보상 모델, HELM의 시나리오×메트릭 장부 및 다중 지표에도 남는 프록시·가중치·가치 판단
- [[HELM]]의 시나리오–적응–메트릭–실행 구조, 16개 핵심·26개 표적 시나리오와 정확도·보정·강건성·공정성·편향·독성·효율성의 다차원 평가 및 보편 순위의 한계
- [[구 기반 통계적 기계 번역]]의 양방향 단어 정렬 대칭화, 통사 constituent가 아닌 일관 문자열 구, 짧은 구·lexical weighting·언어 모형과 beam search 결합
- [[최소 오류율 훈련]]의 piecewise-constant 개발 오류, 후보 점수 교점의 line optimization, 반복 n-best 갱신과 metric overfitting
- [[신경 확률 언어 모형]]의 lookup–concatenation–tanh–softmax 구조, 단어 feature와 확률 함수의 공동 학습, 고정 창과 전체 어휘 계산 비용
- [[단어 임베딩]]의 정적 word type 표현, 의미·통사·빈도 신호의 혼합, 다의어·OOV·contextual representation과의 경계
- [[FastText]]가 SGNS 입력 벡터를 문자 n-gram 합으로 매개변수화하는 방식, [[Byte Pair Encoding|BPE]]가 token sequence를 바꾸는 방식, SentencePiece가 raw text에서 여러 subword model을 다루는 범위
- [[서브워드는 한 벡터의 특징인가 여러 토큰인가]]에서 비교하는 기본 SGNS·FastText·BPE·SentencePiece의 조각 역할, 조합 시점, 문맥 상호작용과 OOV의 세 층
- [[추출형 질의응답]]의 시작·끝 구간 선택, 검색·생성 단계와의 경계, EM·토큰 F1 및 SQuAD 2.0의 기권 판단
- [[신경 정보 검색]]의 질의·문서 독립 표현과 token interaction, 클릭·음성 표본의 편향, 첫 단계 검색·재순위화 및 sparse·dense 상보성
- [[교차 인코더 재순위화]]에서 구분하는 질의–후보 공동 부호화, `[CLS]` relevance logit, first-stage 누락 복구 불가와 후보별 추론 비용
- [[다중 벡터 검색]]에서 구분하는 독립 문맥화 벡터 집합, MaxSim 후기 상호작용, single-vector·cross-encoder 사이 계산 경계와 색인·ANN·질의 비용
- [[언어 모델 스케일링 법칙]]에서 함께 확인하는 token loss, N·D·compute 병목, Kaplan의 0.73/0.27과 Chinchilla의 세 가지 약 0.5/0.5 배분, 조건부 20:1 및 관측 범위 밖 외삽의 차이
- [[LLaMA 1]]에서 구분하는 6.7B·13.0B·32.5B·65.2B 실제 규모, 1.0T·1.4T token 장기 학습, training-compute optimum과 반복 inference parameter footprint의 서로 다른 목적 및 base·LLaMA-I·후속 세대
- [[090_공개 가중치 LLM 파동과 서로 다른 공개 범위]]에서 비교하는 MPT base와 variant의 서로 다른 면허, Falcon의 Apache 2.0 전환과 RefinedWeb 공개 범위, Mistral의 permissive weight·code와 비공개 training corpus·token·compute
- [[The Pile]]에서 구분하는 22개 component의 raw size·epoch 가중 effective size, component deduplication·split leakage·benchmark decontamination과 project license·underlying rights
- [[데이터 품질과 분포 다양성은 같은 축인가]]에서 분리하는 문서 입장 filter, 고유 token pool, domain support, sampling weight, component별 epoch, 누적 token $D$와 평가 분포 및 quality proxy의 인과 한계
- [[문맥 내 학습]]에서 구분하는 고정 가중치, instruction·demonstration·query의 입력 조건화, zero·one·few-shot과 가중치를 갱신하는 지시 미세조정의 지속성 차이
- [[사고 연쇄 프롬프팅]]에서 구분하는 풀이 시범이 포함된 few-shot CoT, 추론 추출과 답 추출을 나눈 Zero-shot-CoT, 중간 token의 조건화·추론 비용과 출력 타당성·답 정확도·인과적 충실성
- [[PaLM]]에서 구분하는 540.35B dense architecture, 780B-token mixture, 두 TPU v4 Pod의 model/data parallelism, few-shot·CoT·PaLM-Coder·다국어 평가 조건과 연구용 model 접근 한계
- [[지시 미세조정]]에서 구분하는 여러 과제의 지시–출력 supervision, 평가 군집 보류, 고정된 가중치의 문맥 내 학습 및 선호 기반 RLHF와의 경계
- [[인간 피드백 강화학습]]에서 구분하는 평가자 시연 SFT, 응답 순위에서 학습한 보상 모델, SFT 정책 기준 KL과 PPO-ptx 사전 학습 혼합 및 선호 대표성의 경계
- [[ChatGPT 연구 미리보기 (2022)]]에서 구분하는 GPT-3.5 계열 모델, 대화형 RLHF, 다중 턴 인터페이스, moderation·피드백 배포 층과 지속 기억·현재 제품의 시간 경계
- [[BLOOM]]에서 구분하는 176B decoder-only architecture, ROOTS의 언어·token 분포, 공공 HPC 학습과 문서·weight·code·data·license·실행 자원의 서로 다른 접근 층
- [[공개 가중치와 재현 가능성은 같은 축인가]]에서 분리하는 법적 접근·검사·변형·재배포·재현·실행 비용·거버넌스 참여, 그리고 BLOOM·LLaMA 1·MPT·Falcon·Mistral처럼 weight 면허와 training data·log·compute 공개가 서로 다르게 움직이는 artifact·version 장부
- [[손실 곡선과 능력 곡선 사이]]에서 분리하는 2021년의 암묵적으로 유도된 행동이라는 넓은 창발, 2022년의 규모별 emergent ability, PaLM의 세 점 log-linear 외삽 잔차·62B 장기 학습, 평균 token cross-entropy·task score·능력 threshold와 metric·표본·checkpoint·관측 scale
- [[검색은 근거를 찾고 독해는 답을 찾는다]]에서 분리하는 단일 벡터·후기 상호작용·교차 인코더의 후보 생성/정밀 점수화 경계, retrieval recall, 답 EM·F1·faithfulness와 기권 calibration
- [[검색 증강 생성]]에서 구분하는 원 RAG의 DPR–BART 잠재 문서 주변화, 고정 document encoder·색인과 학습되는 query encoder, 검색 provenance와 claim-level citation의 차이
- [[전문가 혼합]]에서 구분하는 total parameters·token당 active expert, shared Transformer 경로, top-$k$ routing·capacity·load balancing과 memory·all-to-all communication 비용
- [[Mixtral 8x7B]]에서 구분하는 46.7B total·12.9B active parameters, 8개 중 top-2, Apache 2.0 공개 가중치와 topic expert가 아닌 routing locality
- [[총 매개변수와 활성 계산량은 같은 축인가]]에서 비교하는 dense non-embedding $N$, sparse total·active parameters, FLOPs·memory·communication·wall-clock·data·quality와 논문 안/논문 사이 비교 경계
- [[CLIP]]에서 구분하는 이미지·텍스트 이중 인코더, 정규화된 shared embedding과 대칭 대조 손실, class prompt로 합성한 zero-shot classifier 및 cross-attention·생성 능력의 부재
- [[Flamingo]]에서 구분하는 동결 시각·언어 backbone, 64개 시각 token 병목, 0-init gated cross-attention, 고정 weight의 멀티모달 문맥 내 학습과 과제별 fine-tuning의 차이
- [[DALL·E (2021)]]에서 구분하는 dVAE의 8,192개 범주 시각 어휘·1,024개 이미지 토큰, 최대 256개 text token과의 공동 자기회귀 분포, 512개 후보 생성과 별도 대조 재순위화
- [[DALL·E 2]]에서 구분하는 동결 CLIP 표현, caption-conditioned image-embedding prior, 64×64 확산 decoder와 두 upsampler, classifier-free guidance 및 논문 unCLIP·Preview 제품의 서로 다른 범위
- [[잠재 확산 모델]]과 [[Stable Diffusion]]에서 구분하는 두 단계 지각 압축·잠재 확산, 공간 위치 64배와 전체 스칼라 48배 감소, 논문 LDM의 학습 가능한 조건 Transformer와 v1의 동결 CLIP token 교차 어텐션, 공개 weight·제한 면허·대규모 전체 훈련
- [[파운데이션 모델]]에서 구분하는 광범위한 사전 학습, 여러 적응 경로, 완성된 배포 시스템과 공통 기반의 개선·결함이 전파되는 동질화
- [[OpenAI Codex (2021)]]에서 구분하는 연구용 Python 코드 모델군, Codex-S의 함수 분포 지도 미세조정, docstring prompt와 표본 생성·실행 선택 및 현행 동명 제품
- [[N-gram에서 LLM으로]]에서 비교하는 Katz의 표면 문맥 확률 재분배와 NPLM의 연속 표현 매개변수 공유
- [[BM25]]의 희소 용어 가중, 문서 내 빈도 포화, 평균 문서 길이 보정과 보정된 관련성 확률이 아닌 순위 점수라는 해석
- [[스티븐 로버트슨]]·[[캐런 스파크 존스]]·Steve Walker와 Okapi 팀의 서로 다른 기여, BM25와 Dense Passage Retrieval·RAG의 기준선·대체 검색기 관계
- [[개념 의존]], [[스크립트]], MARGIE·SAM·PAM의 구조적 의미 표현과 [[지식 공학 병목]]
- [[통계적 자연어 처리]], [[말뭉치 기반 학습]], 확률 파싱과 품사 태깅에서의 상징 구조·데이터 추정 결합
- [[023_Penn Treebank와 통계적 구문 분석|Penn Treebank]]의 품사·구문 주석 스키마, PARTS·Fidditch 자동 초안과 인간 교정, 공유 정답 자료와 PARSEVAL의 역할 구분
- [[029_통계적 구문 분석과 어휘화 파서]]에서 구분하는 기본 PCFG의 조건부 독립 가정, Collins Model 1–3의 중심어·하위범주화·gap 상태, 보간과 CKY식 차트 탐색
- [[WordNet]]의 word form·sense·synset 구분, 어휘 관계와 의미 관계, 품사별 subnet 및 1990년 25 unique beginners와 3.0의 `entity` 단일 루트 사이의 버전 차이
- [[FrameNet]]의 의미 프레임·어휘 단위·프레임 요소·FE/GF/PT 주석 층과 프레임별 결합가, 사람이 설계한 표현을 말뭉치 증거로 제약하는 편찬 절차
- [[030_FrameNet과 프레임 의미론]]에서 구분하는 1998년 진행 보고와 2001년 첫 공개, FrameNet 기반 의미역 표지와 PropBank 기반 CoNLL shared task, AMR의 PropBank frame 사용
- [[PropBank]]의 술어별 roleset·Arg0/Arg1 경향·Arg2 이상 역할의 지역성, Penn Treebank 노드·trace 연결과 [[FrameNet]]의 공유 의미 프레임 사이의 차이
- [[의미역 표지]]의 술어·감각·논항 경계·역할 분류 하위 과제, gold/automatic parse와 영역 이동에 따른 CoNLL 평가 조건
- [[구조화된 의미 자원은 무엇을 노드로 삼는가]]에서 비교하는 WordNet synset·FrameNet frame·PropBank roleset과 token·Freebase topic의 동일성 기준, 관계 정의역·공역과 근거가 붙는 위치
- [[IBM Watson]]과 [[DeepQA]]의 질문 분석·후보 재현율·다중 근거 점수·신뢰도·답변 임계값, 2,880개 코어 병렬화와 *Jeopardy!* 게임 전략의 분리
- [[개방 영역 질의응답]]에서 구분하는 주제 폭, 시험 중 자료 접근, 입력 양식, 답 단위, 근거 반환, 정확도·답변률·시간·calibration 평가 조건
- [[AI 시연과 실제 성능]]에서 비교하는 Georgetown·ELIZA·SHRDLU·Watson·2022년 ChatGPT의 입력 인터페이스, 통제된 과업 경계, 반복 평가·선택된 출시 예시와 관객이 본 공개 효과
- [[ELIZA에서 LLM으로]]에서 비교하는 DOCTOR의 역할 규칙과 ChatGPT의 모델·대화형 RLHF·다중 턴 UI·피드백 순환, 사용자 귀속과 직접 기술 계보의 차이
- [[자동 음성 인식]]의 특징·음향 모델·발음 사전·언어 모델·디코더 구성, [[DNN-HMM]] 전환에서 교체된 GMM·유지된 HMM과 [[Whisper]]의 audio-conditioned token 생성 경로
- [[Whisper]]의 30초 log-Mel·Transformer encoder–decoder, 언어·전사/X→English·timestamp·`nospeech` token과 최초 공개 checkpoint·Large V2 평가·장문 decoding procedure의 버전 경계
- [[단어 오류율]]의 치환·삭제·삽입, 상대 오류 감소와 퍼센트포인트 차이, text normalization·문자 단위 평가와 평균 WER가 숨기는 환각·언어·화자·잡음별 실패
- [[규칙 기반 AI에서 데이터 기반 학습으로]]에서 비교하는 HMM의 확률 추정, TDNN의 국소 특징 학습, DNN-HMM의 음향 모델 교체, Whisper의 audio-to-token 공동 학습과 각 단계에 남은 입력·상태·token·평가·decoding 설계
- [[Wikidata]]의 언어 중립 Q/P 식별자와 다언어 label·sitelink, [[Wikibase 데이터 모델]]의 qualifier·reference·rank·unknown/no value
- [[SPARQL]]의 triple pattern·join·filter·property path와 자동 추론의 차이, live Wikidata Query Service의 timeout·공유 자원 경계
- [[Word2Vec]]의 [[CBOW]]·[[Skip-gram]] 예측 방향, hierarchical softmax와 negative sampling의 시기·목적 차이, SGNS와 shifted PMI 행렬 분해의 연결
- [[GloVe]]의 비영 로그 동시출현 회귀와 [[Word2Vec]]·[[잠재 의미 분석]]의 목적 차이, [[Adam 최적화기]]의 좌표별 모멘트 갱신과 [[경사하강법]]·[[역전파]]의 역할 구분
- [[계수 기반과 예측 기반 단어 표현은 얼마나 다른가]]에서 비교하는 문맥 범위와 통계 집계의 두 ‘국소/전역’, LSI·NPLM·SGNS·GloVe의 가중·저랭크 목적·평가 차이
- [[Sequence-to-Sequence 학습]]의 조건부 연쇄 분해, 4층 LSTM 고정 벡터와 원문 역순, teacher forcing과 순환 시간축 의존, [[인코더-디코더]]에서 어텐션으로 바뀐 입력 접근 방식
- [[메모리 네트워크]]의 객체 슬롯과 hard supporting-fact 선택, [[외부 메모리]]·매개변수 지식의 갱신 경계, [[다중 홉 검색]]의 후보 재현율·오류 누적과 RAG의 별도 검색·생성 구조
- [[잔차 연결]]의 (I+J_F) 직접 경로와 보장의 경계, [[Degradation problem]]과 기울기 소실·과적합의 구분, [[ResNet]] 원 post-activation과 후속 pre-activation 및 Transformer residual stream
- [[Layer Normalization]]과 [[Batch Normalization]]의 사례/feature 통계 축, affine 전후 평균·분산의 차이, Post-LN·Pre-LN에서 [[잔차 연결]] identity path가 달라지는 방식과 [[RMSNorm]]의 uncentered second moment
- [[잔차 경로와 정규화는 어디에 놓이는가]]에서 비교하는 ResNet post-/pre-activation과 Transformer Post-/Pre-LN, additive identity path 위에 activation·normalization Jacobian을 둘 때의 최적화 차이
- [[훈련 병렬성과 생성 순차성은 다른 축이다]]에서 비교하는 RNN hidden-state 의존, WaveNet causal convolution, Transformer masked attention의 teacher-forced 훈련·실제 sampling과 FlashAttention의 operator–algorithm–kernel·FLOPs–HBM traffic–wall-clock 차이
- [[Transformer-XL]]에서 구분하는 현재 segment 내부 병렬 계산, segment 사이 forward memory 재사용, stop-gradient로 끊긴 학습 경로와 설정된 memory 길이
- [[FlashAttention]]에서 구분하는 dense attention operator, 온라인 softmax·타일링·재계산 algorithm, hardware별 kernel과 $O(n^2d)$ 산술량·HBM 이동·$O(n)$ 추가 중간 저장의 서로 다른 비용 축
- [[사전 학습 지식은 과제에 어떻게 도착하는가]]에서 비교하는 ELMo 고정 특징, 전체 미세조정, QLoRA의 NF4 동결 base–BF16 계산–학습 adapter, 입력 cue·demonstration, 다과제 지시, CLIP class prototype, Flamingo의 동결 백본–학습 bridge–멀티모달 context, DALL·E 2의 CLIP image-embedding target, Stable Diffusion의 text-token 교차 어텐션 조건과 공간 latent, Codex 실행 선택 및 foundation model–adapted model–deployed system의 층위·접근권
- [[자동 평가 지표는 무엇을 보상하는가]]에서 비교하는 BLEU·ROUGE·METEOR의 참조 중첩, HumanEval unit test, InstructGPT 보상 모델과 HELM의 다차원 행렬, pass@k·평가 지침·prompt 분포·누락된 조합·메트릭 선택이 점수 유인에 들어가는 서로 다른 위치
- [[XLM]]의 monolingual CLM·MLM과 parallel-data TLM, shared BPE·언어 sampling 및 target-language text와 task label을 분리한 zero-shot 조건
- [[같은 병렬 문장은 무엇을 학습시키는가]]에서 비교하는 SMT의 잠재 단어 정렬, NMT의 target sequence supervision, TLM의 양방향 masked-token 문맥과 서로 다른 alignment 층위
- [[XLNet·RoBERTa·ALBERT]]에서 분리하는 factorization objective, data·batch·masking training recipe, embedding factorization·layer sharing과 parameter 수·FLOPs·latency의 차이
- [[T5]]의 task prefix·encoder–decoder·sentinel span corruption과 shared interface, shared pretrained checkpoint, task별 fine-tuned weights의 구분 및 원 FLAN의 LaMDA-PT decoder-only 기반이라는 경계
- [[조지 밀러]]와 공동 연구진의 1985–1998년 WordNet 구축·공개 단계, 심리언어학적 설계 동기와 인간 기억 모형이라는 실증 주장의 구분
- [[Lesk 알고리즘]], [[단어 의미 중의성 해소]], WordNet 의미 목록, 사전 글로스의 정확 중첩과 후대 문맥–글로스 비교 방법의 구분
- [[증강 전이망]], [[파싱]], 재귀 호출, 레지스터·조건·구조 구축 동작을 통한 절차적 문법 공학
- [[몬태규 의미론]], [[합성성]], 유형이 있는 내포 논리, 양화사 작용역과 통사-의미 인터페이스
- [[대규모 언어 모델]]과 초기 기술 사이의 공통 문제, 차이, 과장된 직접 계보 점검

## 주요 진입점

- [[N-gram에서 LLM으로]]
- [[067_GPT-3와 문맥 내 학습]]
- [[068_DPR과 검색 증강 생성]]
- [[069_전문가 혼합과 희소 활성 스케일링]]
- [[070_CLIP과 대조적 언어-이미지 사전 학습]]
- [[CLIP]]
- [[071_Codex와 HumanEval 기반 코드 생성 평가]]
- [[OpenAI Codex (2021)]]
- [[072_지시 미세조정과 FLAN의 제로샷 일반화]]
- [[지시 미세조정]]
- [[073_ColBERT와 다중 벡터 검색]]
- [[다중 벡터 검색]]
- [[GLaM에서 Mixtral까지의 희소 MoE 확장]]
- [[Mixtral 8x7B]]
- [[074_The Pile과 대규모 언어 모델 학습 말뭉치]]
- [[The Pile]]
- [[075_DALL·E와 이산 이미지 토큰 생성]]
- [[DALL·E (2021)]]
- [[085_DALL·E 2와 CLIP 잠재 표현 기반 계층적 확산 생성]]
- [[DALL·E 2]]
- [[086_잠재 확산 모델과 Stable Diffusion v1 공개]]
- [[잠재 확산 모델]]
- [[Stable Diffusion]]
- [[087_Whisper와 대규모 약한 감독 음성 인식]]
- [[Whisper]]
- [[088_FlashAttention과 IO 인지형 정확 어텐션]]
- [[FlashAttention]]
- [[089_LLaMA 1과 제한적 공개 가중치 연구 배포]]
- [[LLaMA 1]]
- [[090_공개 가중치 LLM 파동과 서로 다른 공개 범위]]
- [[076_파운데이션 모델 보고서와 AI 생태계]]
- [[파운데이션 모델]]
- [[077_InstructGPT와 인간 선호 정렬]]
- [[인간 피드백 강화학습]]
- [[078_Chinchilla와 계산 최적 언어 모델 학습]]
- [[079_HELM과 다차원 언어 모델 평가]]
- [[HELM]]
- [[데이터 품질과 분포 다양성은 같은 축인가]]
- [[공개 가중치와 재현 가능성은 같은 축인가]]
- [[전문가 혼합]]
- [[총 매개변수와 활성 계산량은 같은 축인가]]
- [[검색 증강 생성]]
- [[문맥 내 학습]]
- [[손실 곡선과 능력 곡선 사이]]
- [[최고 경로와 기대 통계, 백오프]]
- [[확률, 마진, 순위 점수]]
- [[자동 평가 지표는 무엇을 보상하는가]]
- [[019_Katz 백오프와 희소 데이터 확률 추정]]
- [[020_시간 지연 신경망과 음소 인식]]
- [[시간 지연 신경망]]
- [[021_합성곱 신경망과 특징 학습]]
- [[합성곱 신경망]]
- [[얀 르쿤]]
- [[022_IBM 통계적 기계 번역과 데이터 기반 전환]]
- [[023_Penn Treebank와 통계적 구문 분석]]
- [[024_BM25와 확률적 정보 검색]]
- [[BM25]]
- [[스티븐 로버트슨]]
- [[025_WordNet과 어휘 의미망]]
- [[WordNet]]
- [[조지 밀러]]
- [[026_순환 신경망과 시간적 문맥 학습]]
- [[순환 신경망]]
- [[027_최대 엔트로피와 서포트 벡터 머신]]
- [[최대 엔트로피 모델]]
- [[서포트 벡터 머신]]
- [[028_장단기 메모리와 장기 의존성 학습]]
- [[장단기 메모리]]
- [[029_통계적 구문 분석과 어휘화 파서]]
- [[030_FrameNet과 프레임 의미론]]
- [[FrameNet]]
- [[038_PropBank와 의미역 표지]]
- [[PropBank]]
- [[의미역 표지]]
- [[039_Freebase와 협업형 지식 그래프]]
- [[Freebase]]
- [[지식 그래프]]
- [[구조화된 의미 자원은 무엇을 노드로 삼는가]]
- [[040_IBM Watson과 Jeopardy 질의응답]]
- [[IBM Watson]]
- [[DeepQA]]
- [[개방 영역 질의응답]]
- [[041_심층 신경망 음향 모델과 DNN-HMM 전환]]
- [[자동 음성 인식]]
- [[DNN-HMM]]
- [[단어 오류율]]
- [[042_Wikidata와 다언어 협업 지식 베이스]]
- [[Wikidata]]
- [[Wikibase 데이터 모델]]
- [[SPARQL]]
- [[043_Word2Vec와 효율적 정적 단어 임베딩]]
- [[Word2Vec]]
- [[CBOW]]
- [[Skip-gram]]
- [[044_GloVe와 Adam의 서로 다른 2014년 전환]]
- [[GloVe]]
- [[Adam 최적화기]]
- [[계수 기반과 예측 기반 단어 표현은 얼마나 다른가]]
- [[잔차 경로와 정규화는 어디에 놓이는가]]
- [[045_Sequence-to-Sequence 학습과 신경 기계 번역]]
- [[Sequence-to-Sequence 학습]]
- [[인코더-디코더]]
- [[자기회귀 생성]]
- [[046_메모리 네트워크와 외부 지식 접근]]
- [[메모리 네트워크]]
- [[외부 메모리]]
- [[다중 홉 검색]]
- [[048_잔차 학습과 매우 깊은 신경망]]
- [[잔차 연결]]
- [[ResNet]]
- [[Degradation problem]]
- [[049_층 정규화와 시퀀스 모델의 배치 독립성]]
- [[Layer Normalization]]
- [[Batch Normalization]]
- [[RMSNorm]]
- [[050_FastText와 서브워드 표현의 두 경로]]
- [[051_SQuAD와 추출형 독해 평가]]
- [[추출형 질의응답]]
- [[052_신경 정보 검색과 의미 대응]]
- [[신경 정보 검색]]
- [[검색은 근거를 찾고 독해는 답을 찾는다]]
- [[FastText]]
- [[서브워드 토큰화]]
- [[Byte Pair Encoding]]
- [[서브워드는 한 벡터의 특징인가 여러 토큰인가]]
- [[031_잠재 의미 분석과 확률적 잠재 의미 색인]]
- [[잠재 의미 분석]]
- [[확률적 잠재 의미 분석]]
- [[032_조건부 무작위장과 구조화 예측]]
- [[조건부 무작위장]]
- [[033_BLEU와 기계 번역 자동 평가]]
- [[BLEU]]
- [[034_구 기반 통계적 기계 번역과 최소 오류율 훈련]]
- [[구 기반 통계적 기계 번역]]
- [[최소 오류율 훈련]]
- [[035_신경 확률 언어 모형과 분산 단어 표현]]
- [[신경 확률 언어 모형]]
- [[단어 임베딩]]
- [[말뭉치 기반 학습]]
- [[파싱]]
- [[통계적 기계 번역]]
- [[신경망 기계 번역]]
- [[튜링 테스트와 LLM 평가]]
- [[AI 시연과 실제 성능]]
- [[규칙 기반 AI에서 데이터 기반 학습으로]]
- [[촘스키에서 LLM으로]]
- [[퍼셉트론에서 MADALINE으로]]
- [[역전파]]
- [[ELIZA에서 LLM으로]]
- [[index]]
- [[log]]

## 현재 상태

소스 90개, 참고 자료 0개, 개념 164개, 개체 29개, 분석 22개와 메타 문서 3개, 총 308개 Markdown 문서가 있다. 전체 문서는 스키마 v2를 따르며 277개는 `verified`, 해석적 문서 28개는 `partial`, 철학적 결론이 논쟁 중인 문서 3개는 `disputed`다. 352개 외부 근거와 180개 불변 raw artifact가 레지스트리에 등록돼 있다.

[[090_공개 가중치 LLM 파동과 서로 다른 공개 범위]]는 2023년 MPT·Falcon·Mistral 출시를 모두 같은 `open-source`로 묶지 않는다. MPT의 base와 chat·instruct variant, Falcon의 2023년 5월 Apache 2.0 전환과 RefinedWeb의 5T-token 처리 pool·600B-token 공개 extract, Mistral 7B의 Apache weight·reference code와 공개되지 않은 training corpus·token·compute를 artifact별로 나눈다. ALiBi의 fixed distance penalty, Falcon의 MQA, Mistral의 GQA·4,096-token sliding window와 FlashAttention kernel도 서로 다른 병목의 기법이다. MPT·Falcon의 개발이 LLaMA 공개 전부터 진행됐으므로 단선 촉발 계보를 만들지 않고, Mistral의 Llama 계열 비교를 proprietary frontier·다국어·consumer hardware 우월성으로 확대하지 않는다.

[[089_LLaMA 1과 제한적 공개 가중치 연구 배포]]와 [[LLaMA 1]]은 7B·13B의 1.0T token, 33B·65B의 1.4T token 학습을 모든 규모의 보편 20:1 규칙이 아니라 training-compute optimum을 지나 더 작은 inference parameter footprint를 노린 선택으로 복원했다. 실제 token/parameter는 약 149·77·43·21.5이며, RMSNorm·SwiGLU·RoPE는 선행 기법이고 구성요소별 ablation도 없으므로 성능을 어느 하나의 발명·단독 인과로 돌리지 않는다. 최초 weight 배포는 신청 승인과 noncommercial research license가 붙었고, base LLaMA·제한적 LLaMA-I 실험·후속 Llama 2를 서로 다른 artifact와 세대로 구분한다.

[[공개 가중치와 재현 가능성은 같은 축인가]]는 The Pile·파운데이션 모델 보고서·BLOOM/ROOTS/RAIL·LLaMA 1·MPT·Falcon·Mistral·HELM을 법적·절차적 접근, 검사, 변형, 재배포, 재현, 실행 비용과 거버넌스의 일곱 축으로 비교한다. BLOOM의 RAIL 조건 직접 접근, LLaMA 1의 신청 승인형 비상업 연구 배포, MPT의 base/variant별 면허, Falcon의 Apache 2.0 전환과 부분 data 공개, Mistral의 Apache weight·code와 미공개 corpus·token·compute는 단일 `open` 순위를 만들지 않는다. Permissive weight license는 training transparency나 exact retraining을 예측하지 않으며, local 실행 선택지도 실제 총비용·privacy·운영 권한의 개선을 자동 보장하지 않는다.

[[088_FlashAttention과 IO 인지형 정확 어텐션]]과 [[FlashAttention]]은 dense softmax attention의 수학을 바꾸지 않고 HBM–SRAM 사이의 데이터 이동을 줄이는 실행을 복원했다. 온라인 softmax는 tile별 행 최댓값·정규화 합·출력 누산값을 재조정하고, backward는 저장하지 않은 score·probability block을 다시 계산한다. 표준 구현의 $O(n^2)$ 중간 저장은 $O(n)$ 추가 메모리로 줄지만 $O(n^2d)$ 산술량과 model weight·KV cache는 남으며, `exact`도 부동소수점 bitwise 동일성을 뜻하지 않는다. Figure 2의 더 많은 FLOPs·더 적은 HBM 읽기·쓰기량·더 짧은 시간, kernel 속도와 end-to-end 속도, dense 정확 방식과 별도 block-sparse 근사, FlashAttention 1·2·3의 version 경계를 각각 분리했다.

[[훈련 병렬성과 생성 순차성은 다른 축이다]]는 이 사례를 기존 RNN·WaveNet·Transformer·Transformer-XL 비교에 합성했다. 표현 계산의 위치 의존, teacher forcing, 실제 token sampling의 순차 round와 함께 FLOPs·메모리 capacity·HBM 읽기·쓰기량·wall-clock을 별도 성능 축으로 둔다. NeurIPS 최종본 Figure 2에서 FlashAttention은 66.6→75.2 GFLOPs로 산술을 늘리면서 HBM R/W를 35.3→4.4GB, runtime을 35.1→11.7ms로 줄였으므로, 같은 dense operator에서도 algorithm·kernel·hardware 조건이 성능 장부를 바꾼다는 비교 근거가 된다.

[[087_Whisper와 대규모 약한 감독 음성 인식]]과 [[Whisper]]는 기존 ASR이 만든 자동 transcript를 학습한 자료라는 설명을 뒤집고, 웹에 이미 짝지어진 오디오-전사 쌍에서 기계 생성 transcript를 탐지·제거한 실제 수집 절차를 복원했다. 번역은 X→English로 한정하고, 최초 다섯 규모·아홉 checkpoint와 논문의 Large V2 결과, 평가 dataset 미세조정이 없는 zero-shot, LibriSpeech·MLS·VoxPopuli·CoVoST2·Kincaid46의 서로 다른 결과를 분리했다. 30초 창·text normalizer·장문 decoding heuristic·환각·언어 불균형과 모델·추론 코드 공개 대 전체 학습 자료·코드 미공개도 같은 장부에 기록했다.

[[086_잠재 확산 모델과 Stable Diffusion v1 공개]], [[잠재 확산 모델]], [[Stable Diffusion]]은 일반 LDM 논문과 공개 v1 체크포인트를 분리했다. 512×512×3에서 64×64×4로 옮기는 변화는 공간 위치 64배와 전체 스칼라 48배 감소로 구분하고, 실제 연산 절감률을 고정 배수로 단정하지 않는다. 논문 모델의 학습 가능한 조건 Transformer와 v1의 동결 CLIP ViT-L/14, 공개 code·weight와 CreativeML OpenRAIL-M 제한, 로컬 추론 메모리 조건과 256개 A100 전체 훈련도 서로 다른 장부로 기록했다.

[[085_DALL·E 2와 CLIP 잠재 표현 기반 계층적 확산 생성]]과 [[DALL·E 2]]는 공식 논문의 unCLIP을 caption-conditioned CLIP image embedding prior와 계층적 확산 decoder로 복원했다. 생성 과정은 매 denoising step에서 CLIP gradient로 중간 이미지를 채점하는 방식이 아니라 동결된 CLIP 잠재 표현과 classifier-free guidance를 사용하며, 논문의 variation·보간 실험과 Preview 제품의 inpainting·안전·접근 통제는 서로 다른 근거 층위로 기록했다.

`078`의 $C^{1/3}$ scaling, Kaplan의 model–data 절충 누락, 보편적인 20 tokens/parameter, 175B model의 단일 정답 3.5T tokens, Gopher보다 낮은 훈련비, 과소 훈련 parameter의 기계적 비활성, 모든 자료·architecture로의 직접 일반화 주장을 공개 문서에서 교정했다. Hoffmann 등의 세 fixed-compute 추정법은 $N$과 $D$에 0.50/0.50·0.49/0.51·0.46/0.54 지수를 주며, Gopher와 Chinchilla는 약 $5.76\times10^{23}$ FLOPs의 같은 사전 학습 compute를 사용했다. 20:1은 특정 dense Transformer·자료 혼합·schedule에 조건화된 근사이고, 175B 외삽은 접근별 약 3.7T·4.3T·12.0T로 벌어진다. [[089_LLaMA 1과 제한적 공개 가중치 연구 배포|LLaMA 1]]의 약 149·77·43·21.5 tokens/parameter는 이 fixed-training-compute 질문을 반박한 보편 법칙이 아니라 반복 inference의 parameter footprint에 다른 비중을 둔 사례다.

[[언어 모델 스케일링 법칙]]에는 Kaplan의 0.73/0.27과 Chinchilla의 세 추정값, $D$가 고유 문서 수나 품질 점수가 아니라 누적 token 노출량이라는 경계를 추가했다. 더 많은 token이 compute frontier에서 중요했다는 결과와 어떤 20N token도 동등하다는 결론을 분리했으며, 품질·분포·반복 노출의 합성 질문은 기존 [[데이터 품질과 분포 다양성은 같은 축인가]]에서 이어 간다.

`076`의 파운데이션 모델을 최소한의 과제별 학습을 쓰는 큰 LLM으로만 정의하는 축약, GPT-4의 2021년 사례 소급, 접근 민주화의 달성, 광범위한 지식·추론의 보편적 보장, 추론 환경비용 누락과 연구·정책·투자에 대한 직접 인과를 공개 문서에서 교정했다. 2021년 보고서의 정의는 광범위한 데이터로 대규모 훈련해 여러 후속 과제에 적응되는 역할을 가리키며, BERT의 전체 미세조정·GPT-3의 prompt·CLIP의 자연어 class 적응처럼 서로 다른 경로를 포함한다. 창발은 암묵적으로 유도된 행동이라는 넓은 뜻이고, 동질화는 공통 기반의 개선과 결함을 여러 응용으로 함께 전파하는 구조다. 보고서 §5.3은 훈련뿐 아니라 반복 추론·배포 energy와 훈련비용 상각도 이미 다뤘다.

[[사전 학습 지식은 과제에 어떻게 도착하는가]]에는 파운데이션 모델이 특정 adaptation algorithm이 아니라 기존 경로를 공통 기반–적응–배포 관계로 읽는 상위 범주라는 점을 기록했다. QLoRA를 더한 열세 과제 적응 경로에서는 전체 weights·저순위 adapter·입력 context 가운데 task supervision이 놓이는 위치와 base storage dtype·compute dtype·trainable parameter를 분리한다. 생성기를 새로 대규모 학습한 DALL·E 2·Stable Diffusion은 별도의 사전 학습 자산 재사용 표로 유지했다. CLIP의 class prototype, Flamingo의 visual key/value memory, DALL·E 2 prior의 CLIP image-embedding target, Stable Diffusion U-Net의 CLIP text-token condition과 오토인코더 공간 latent를 서로 다른 도착 위치로 비교하며, 네 시스템의 직접 계보는 주장하지 않는다. Model-parameter gradient·continuous-input gradient·output-only API 접근권과 foundation checkpoint·adapted model·deployed system의 관측 층위도 그대로 분리했다. [[손실 곡선과 능력 곡선 사이]]에는 Bommasani 등의 2021년 emergence가 암묵적으로 유도된 행동이라는 넓은 연구 의제이고, Wei 등의 2022년 emergent ability는 작은 규모에 없다가 큰 규모에서 관찰되는 task-level 판정이라는 용어 차이를 기록했다.

`075`의 2021년 제품·전체 weight 공개, 텍스트 encoder 뒤 이미지 decoder, 8,192개 image token, 특정 조합의 훈련 중 완전 미노출, attention이 만든 인간 수준 구성 이해·창의성, 광범위한 실제 직업 활용, FID·IS 표준화와 모든 후속 이미지 모델의 공통 architecture 주장을 공개 문서에서 교정했다. DALL·E 1은 8,192개 범주의 시각 어휘에서 1,024개 image token을 만들고 최대 256개 text token과 공동 분포를 학습한 12B·64층 decoder-only sparse Transformer였다. 대표 비교는 512개 후보를 별도 대조 모델로 재순위화했으며, MS-COCO 사람 비교에서는 강했지만 CUB FID는 선행 최고 방법보다 거의 40점 나빴다. 전체 12B 생성 모델은 공개되지 않았고 dVAE만 공개됐다.

[[확률, 마진, 순위 점수]]에는 DALL·E의 다음 image token 조건부분포와 CLIP 계열 scaled cosine 재순위 점수를 추가했다. 전자는 매 위치 8,192개 범주에서 정규화돼 후보 풀을 표본화하고, 후자는 이미 생성된 512개 후보 안의 순서를 정한다. 1/8·7/8은 modality 확률이 아니라 손실 가중치이고, 512는 신뢰도가 아니라 후보 탐색 예산이라는 경계를 기록했다.

[[데이터 품질과 분포 다양성은 같은 축인가]]는 WebText의 Reddit 승인 proxy, C4의 heuristic filter와 domain-aligned corpus 비교, GPT-3의 curated-similarity filter·source weighting, The Pile의 22-component mixture와 40GB 통제 실험, Chinchilla의 MassiveText sampling·epoch와 누적 token $D$를 함께 읽는다. 품질은 형식·중복·출처 proxy·과제 적합성·사실·안전·권리의 벡터이고, 다양성은 domain support와 sampling probability의 설계이며, $D$는 고유 정보량이 아닌 token 노출 총량이므로 한 순위로 합치지 않는다. T5 Table 8, Pile Table 3, Chinchilla Tables A1–A2를 직접 근거로 두되, filter·composition·weight·반복의 단독 인과와 임의의 $20N$ token 동등성은 입증되지 않은 범위로 남겼다.

`072`의 지시 미세조정을 단일 연구가 처음 발명했다는 서사, 수백 개 과제·단일 universal checkpoint·모든 규모에서의 일관된 향상, 지시 문장을 입력에 붙이는 것만으로 weights가 바뀐다는 설명, safety·RLHF·제품 배포까지 직접 검증했다는 주장도 공개 문서에서 교정했다. 원 FLAN은 62개 데이터셋을 12개 과제 군집으로 나누고 평가 군집마다 그 군집을 제외한 별도 137B LaMDA-PT checkpoint를 학습했다. 각 데이터셋에 10개 수동 template를 두었고 best-dev template 조건에서 zero-shot GPT-3보다 20/25 데이터셋에서 높았지만, 422M·2B·8B에서는 지시 미세조정 뒤 보류 과제 평균이 오히려 낮아졌다. Natural Instructions의 선행 2021년 공개와 InstructGPT의 SFT–선호 순위–보상 모델–PPO 경로도 별도 계보로 기록했다.

`071`의 2021년 8월 단일 최초 공개, 175B GPT-3의 그대로인 코드 모델, 여러 언어·프레임워크·대규모 저장소 이해, 의미·예외 처리의 일반적 보장, test 작성·교육·온보딩·생산성·오류 감소의 직접 실험, 공개 코드의 license 문제 해결과 수학·과학·법률 특화 모델로의 직접 계보 주장도 공개 문서에서 교정했다. 연구 Codex는 최대 12B, 필터링된 Python 159GB와 1,000억 token 조건이었고 HumanEval은 164개 독립 함수·평균 7.7개 test였다. Table 1의 Codex-12B pass@1 28.81%와 pass@100 72.31%, Codex-S의 단일 표본 37.7%·평균 log-probability 선택 44.5%·unit-test oracle 77.5%를 서로 다른 생성·선택 조건으로 기록했다.

`070`의 일반 멀티모달 이해·ViT 단일 image encoder·학습에서 전혀 보지 않은 class라는 zero-shot 해석, 조합·공간 관계와 VQA·style transfer·generation의 단독 수행, DALL·E·Stable Diffusion·GPT-4V로 이어지는 일괄 직접 계보, fine-grained task의 일률적 실패 및 `256 V100·18일` 계산량 결합도 공개 문서에서 교정했다. CLIP은 수정 ResNet 5종과 ViT 3종, Transformer text encoder를 대칭 대조 손실로 공동 학습하고 class prompt를 분류기 weight처럼 쓴다. ImageNet 76.2%는 원 ResNet-50과의 비교이며, RN50x64는 592 V100·18일, ViT-L/14는 256 V100·12일이었다. `075`의 DALL·E 1에서는 CLIP 계열 대조 모델이 512개 생성 후보를 재순위화했고, `085`의 unCLIP에서는 동결 CLIP 좌표계가 prior의 목표와 확산 decoder의 조건으로 쓰였다. Stable Diffusion과 그 밖의 후속 계보는 각 원 논문 근거까지 유보한다.

`068`의 DPR·RAG 단일 발명 서사, BM25를 정확 일치로만 보는 대조, 최소 표지 자료·보편 우월·조건 없는 billion-scale 지연 시간, RAG의 GPT-2 생성기·passage 직접 감독·전체 색인 공동 학습, Sequence/Token 주변화와 비용의 혼동, 실시간 최신성·자동 인용·법률·의료·뉴스·다문서 요약의 직접 검증 주장도 공개 문서에서 교정했다. DPR의 SQuAD 예외, 원 RAG의 BART-large와 고정된 2018 Wikipedia 색인, query encoder만 포함한 검색기 학습, 82개 world-leader hot-swap 및 검색 passage와 claim-level citation의 차이를 함께 기록했다.

[[손실 곡선과 능력 곡선 사이]]는 Bommasani의 넓은 emergence, Kaplan의 평균 token cross-entropy, Brown의 task별 GPT-3 곡선, FLAN의 규모별 개입 효과, PaLM의 세 점 BIG-bench 외삽 잔차·62B 장기 학습, Wei의 emergent ability 정의와 Schaeffer의 metric·표본 해상도 반론을 함께 읽는다. 암묵적으로 유도된 행동이나 특정 두 점 외삽의 실패에서 내부 상전이를 바로 추론하지 않으며, 급격한 task score만으로 내부 질적 전환을 확정할 수도 없고 metric 효과만으로 모든 창발 가능성을 부정할 수도 없다는 한계를 기록했다.

`067`의 GPT-2 대비 10배라는 비교 대상 오류, 문맥 내 학습의 내부 메커니즘 확정, 미세조정 제거와 광범위한 고정밀 성능, 175B에서의 불연속 창발, code benchmark·API 민주화·prompt engineering 산업·구체 훈련비와 후대 모델의 직접 계보 주장도 공개 문서에서 교정했다. zero·one·few-shot의 demonstration 수와 가중치 고정, SuperGLUE 71.8 대 fine-tuned 최고 89.0, TriviaQA 71.2, 자리수별 산술 exact match와 contamination filtering bug를 함께 기록했다.

`066`의 capability 사전 예측, 768 thousand라는 최솟값, architecture·dataset 독립의 근본 법칙, QA·독해 downstream 검증, diminishing returns 부정, Kaplan의 fixed-compute 배분 누락, Chinchilla가 처음 model–data 균형을 다뤘다는 설명, GPT-3·PaLM·GPT-4 규모의 직접 인과와 광범위한 조직 채택·비용 주장도 공개 문서에서 교정했다.

`065`의 초기 neural IR을 dual encoder 하나로 축약한 역사, encoder–decoder cross-attention과 BERT 결합 self-attention의 혼동, attention weight와 `[CLS]` 분류 점수의 동일시, 대표 학습을 pairwise·listwise로 묶은 설명, BERT가 전체 컬렉션 first-stage retrieval과 자연 길이 장문을 직접 처리한다는 주장, 조건 없는 100–1,000개 후보·광범위한 산업 배포·Google 내부 구조·ColBERT 계보도 공개 문서에서 교정했다.

`064`의 memory를 전체 history가 계속 커지는 무제한 cache로 보는 설명, 이전 segment의 같은 layer를 직접 잇는 recurrence, learned relative-position table, self-attention의 제곱 비용 제거, 조건 없는 1,874배 속도와 450% 긴 의존성, 평가하지 않은 document classification·coreference·QA·code 결과, GPT-3·PaLM·LLaMA·RoPE·Longformer·BigBird로 이어지는 직접 계보도 공개 문서에서 교정했다.

`063`의 T5를 최초의 통합 NLP 발명이나 하나의 universal zero-shot checkpoint로 보는 설명, text output과 공통 metric의 동일시, task prefix와 현대 instruction following의 혼동, 빠진 sentinel 예시, span corruption이 MLM보다 느리고 보편적으로 우월하다는 주장, C4의 사실성·중립성 확대, encoder–decoder parameter와 계산량의 동일시, WMT English→German 최고 성능·광범위한 multilingual translation·abstractive SQuAD 주장, production 비용 절감과 BART·GPT-3·PaLM·GPT-4 직접 계보도 공개 문서에서 교정했다.

`062`의 XLM을 하나의 고정 모델로 보는 설명, CLM 뒤 TLM을 순차 학습한다는 서술, zero-shot을 사전 학습에서도 target 언어를 보지 않은 것으로 해석한 Italian QA 예시, 평가하지 않은 few-shot·교차 언어 QA·검색, shared BPE의 자동 의미 정렬, mBERT·XNLI를 XLM의 후속 산물로 보는 역방향 계보, 모든 저자원 언어·deployment compute·multimodal AI·mT5·GPT로 확대한 영향과 data가 architecture보다 중요하다는 일반 결론도 공개 문서에서 교정했다.

`061`의 BERT가 사전 학습에서 실제 단어를 전혀 보지 않는다는 설명, XLNet이 입력 token 자체를 섞고 첫 target에서 나머지 내용을 모두 본다는 순열 예시, fine-tuning에도 query stream이 남는다는 해석, RoBERTa가 BERT보다 더 많은 step으로 완전 수렴했고 dynamic masking이 큰 향상의 단일 원인이라는 주장, ALBERT의 공유 축·base/large 성능 비교·mobile 효율 확대, parameter 수와 FLOPs·latency의 동일시, 세 모델을 정적 embedding·동일한 encoder-only 계열로 묶는 설명과 production·후대 모델의 직접 계보도 공개 문서에서 교정했다.

`060`의 GLUE 연구진을 Google Research 중심으로 보는 소속 오류, QNLI를 자유 질의응답으로 보는 설명, 하나의 shared multi-task model을 강제했다는 주장, GLUE score에 task 난이도·중요도 weight가 있다는 서술, 중앙 server가 추가 자료·compute·ensemble까지 같은 조건으로 만든다는 해석, GLUE 원 발표와 2019년 별도 인간 기준선의 혼합, aggregate 인간 추정치 초과를 전 task·일반 이해의 인간 초월로 보는 주장, SuperGLUE가 open-ended 생성 과제를 포함했다는 설명, GLUE가 더 이른 SQuAD·ImageNet·COCO 평가 설계에 영향을 주었다는 역방향 계보와 private test가 contamination·leaderboard overfitting을 해결한다는 주장도 공개 문서에서 교정했다.

`059`의 GPT가 NLP 전이 학습을 단독 발명했다는 설명, GPT-1에 과제별 입력 변환·표지 자료·출력층이 없었다는 축약과 12개 과제 전부 최고 성능이라는 확대, GPT-2를 매개변수만 10배 늘린 단순 확장으로 보는 서술, WebText를 인터넷 전체 무차별 crawl로 보는 설명, 번역·요약·QA zero-shot 출력과 지도 최고 성능의 동일시, GPT-2가 현대 few-shot prompting과 불연속적 창발을 이미 입증했다는 소급, 1.5B 모델이 끝내 비공개였다는 현재 상태 오류와 next-token 예측을 사실 검증·명시적 추론으로 보는 주장도 공개 문서에서 교정했다.

`058`의 BERT를 Transformer 발명으로 보는 설명, ELMo에는 양방향 문맥이 없었다는 대조, MLM이 입력의 15%만 보거나 선택 token 모두를 `[MASK]`로 바꾼다는 축약, NSP를 실제 문장 의미 관계의 깊은 이해로 보는 해석, RoBERTa가 NSP의 보편적 무용성을 단독 증명했다는 결론, 열한 과제 최고 성능과 사람 같은 일반 이해의 동일시, BERT를 자연스러운 범용 생성 모델로 보는 설명과 모든 현대 생성 LLM이 BERT식 양방향 attention을 쓴다는 계보도 공개 문서에서 교정했다.

`057`의 ELMo·ULMFiT를 같은 양방향 언어 모델 전이로 묶는 설명, ELMo와 BERT의 양방향 목적 혼합, ELMo 층별 구문·의미의 고정 분업과 완전한 담화 이해, ULMFiT의 세 단계에서 목표 영역 LM 적응·concat pooling을 누락한 축약, 여섯 텍스트 분류 결과를 질의응답·생성 등 모든 NLP 과제로 확대하는 주장, 표지 예시 100개의 100배 효율을 보편화한 설명, ELMo·ULMFiT가 Transformer를 낳고 BERT·GPT로 직접 이어졌다는 단일 계보도 공개 문서에서 교정했다.

`051`의 Robin Jia를 2016년 원 논문 저자로 섞은 설명, 정확히 10만 개라는 규모 축약, 답 구간 추출과 검색·자유 생성의 혼합, EM·F1과 의미 이해의 동일시, 모든 질문에 답이 있는 SQuAD 1.1의 제약, 서로 다른 사람 기준선과 모델 점수의 단순 비교, SQuAD 2.0의 답 불가능 질문 수, 어텐션·Transformer·BERT·LLM의 직접 원인 계보와 설정 없는 GPT-3·GPT-4 성능 주장도 공개 문서에서 교정했다.

`052`의 2016년 단일 신경 검색 출현, 전통 검색을 원시 키워드·선형 특징으로만 보는 설명, DSSM word hashing과 ANN hash의 혼동, 초기 문서 제목 실험을 전체 장문 벡터 검색으로 넓힌 주장, semantic similarity와 ad-hoc relevance의 동일시, DRMM을 첫 단계 전체 검색으로 보는 서술, 클릭·비클릭을 편향 없는 관련성 표지로 보는 설명, 신경 검색의 보편적 산업 효과와 DSSM에서 벡터 데이터베이스·DPR·RAG로 이어지는 단일 직접 계보도 공개 문서에서 교정했다.

`006`의 잘못된 MADALINE 약어·선형 LMS 국소 최솟값·VAD 배치 서술, `007`의 튜링 테스트 직접 계보 주장, `008`의 복잡도 산술과 Transformer 병렬성 서술, `009`의 출판 연대·이름 순서·이해 범위 과장, `010`의 VSM·IDF 단일 연도 귀속과 의미 이해 과장, `011`의 고정 원시 ACT 수·술어 논리 비판·MARGIE 질의응답·AMR 직접 계보, `012`의 1980년대 단일 혁명·Brown Corpus 연대·규칙 시스템의 원리적 무능력·자동 데이터 확장, `013`의 HMM 기원·비터비 목적·관측 독립성·MFCC 동시대성·상용화 범위·LLM 직접 계보, `014`의 1970년 단독 발명·BBN 귀속·CFG와 차트 파서 무능력·ATN 보편 지수 복잡도·레지스터의 담화 기억·후대 파서 직접 계보, `015`의 단일 1973년 귀속·PTQ 유형과 유니콘 존재 양화식·문맥 배제·가능세계 열거와 보편 지수 복잡도·LUNAR와 현대 LLM 직접 계보, `016`의 기계 일반 불가능론·포더/퍼트넘 대표 귀속·목표 논문과 저자 응답의 페이지 혼합·결합 반론 변경·모든 LLM의 다음 토큰 예측·현대 LLM에 대한 확정 판결, `017`의 1983년·Bell Labs 귀속·전역 의미 조합 탐색·선형 복잡도·OED 사용·대규모 성능·현대 NLP 직접 계보, `018`의 1986년 단독 발명·즉시 딥러닝 실용화·오류의 인과적 책임·보편 선형 시간·합성 과제의 광범위한 응용 확대·모든 언어 AI와 LLM의 직접 계보, `019`의 트라이그램 차수 혼동·α의 보간 가중치 오해·75만 단어와 100문장 평가의 과대 일반화·어텐션·드롭아웃·가중치 감쇠와 Katz 백오프의 동일시, `020`의 단독 발명·원시 음성 종단 간 처리·화자 독립·HMM 수동 확률·위치별 순차 계산·무제한 시간 불변성·제품 배포·CNN·RNN·Transformer 직접 계보, `021`의 1988년 단독 발명·수표 인식 귀속·완전 연결층의 위치 정보 삭제·일반 3×3 필터의 9개 매개변수·완전한 이동 불변성·특징 공학 제거·BatchNorm과 ResNet의 단일 해결책 서사·텍스트 CNN과 Word2Vec·GloVe·seq2seq·어텐션·Transformer의 직접 계보, `022`의 1991년 단일 발명·IBM Models 차이·EM 최고 정렬 오해·Hansard 자료 혼합·BLEU와 Moses 연대·통계 방식의 보편적 우월성·IBM 정렬에서 어텐션·Transformer·LLM으로의 직접 계보는 위키 본문에서 교정했다. raw의 원문 결손과 오류는 보존하되 공개 지식의 기준으로 사용하지 않는다.

`023`의 1993년 완전 공개·100만 단어 전체 규모·태그 수·주석 속도·빈 요소와 gapping 표기·학습/개발/시험 분할·PARSEVAL 귀속·Collins와 Brill 성능·계층적 구 기반 번역의 Penn Treebank 의존·Transformer와 LLM 직접 계보도 공개 문서에서 교정했다.

`024`의 Robertson·Spärck Jones 단독 공동개발 귀속, `25`를 이론의 스물다섯 번째 버전으로 보는 설명, TF-IDF의 단일 선형식 묘사, BM25 점수의 관련성 확률 해석, 보편적인 `k1`·`b` 값과 `b=1` 선호, 자동 피드백·개인화, 전 세계 검색 엔진의 즉각적 채택, Transformer attention과 원 RAG로의 직접 계보도 공개 문서에서 교정했다.

`025`의 1995년 단일 최초 공개, 인간 의미 기억의 충실한 복제라는 확정, 모든 관계를 개념 간 간선으로 보는 설명, `not hot ⇒ cold` 추론, 부사를 수식 대상 동사에 연결한다는 서술, 초기·후대 명사 최상위 구조의 혼합, 자동차 모델·동의어 예시, 응용 성능의 일반화, 신경 분산 표상·FrameNet·PropBank·지식 그래프·임베딩·BERT·LLM으로 이어지는 직접 계보도 공개 문서에서 교정했다.

`026`의 1995년 RNN 발명·실용화라는 단일 기점, 이전 순서열 모델의 부재, 은닉 상태를 과거 전체의 완전한 기억으로 보는 설명, BPTT의 마지막 시점 전용 해석, 가중치 고윳값만으로 설명한 소실·폭주, 응용 분야의 즉시 가능화, LSTM의 출판 연대와 forget gate 혼합, gradient clipping의 단일 기원, LSTM·GRU·attention·Transformer·GPT·BERT의 직선적 직접 계보도 공개 문서에서 교정했다.

`036`의 토픽-단어 분포에 대한 Dirichlet 사전분포를 기본 모형에 소급한 설명, 광범위한 통계적 일관성 주장, 문서별 추론 상태가 불필요하다는 서술, 켤레성으로 정확한 사후추론이 가능하다는 오해, 축약 깁스 표집을 최초 알고리즘처럼 보는 설명, 단어 주머니의 무조건적 독립 해석과 토픽의 객관적 의미·광범위한 후대 응용·LLM 직접 계보 주장도 공개 문서에서 교정했다.

`037`의 ROUGE와 완성된 METEOR를 모두 2004년에 묶는 연대, BLEU 정밀도를 원문 사실성 검사로 보는 설명, ROUGE가 원문 중요도를 직접 판별하거나 단일 recall 식이라는 서술, ROUGE-L의 precision 누락, METEOR WordNet 대응의 문맥 의미 이해·chunk 벌점의 유창성 해석, 작은 시스템 집계의 높은 인간 상관을 일반화한 주장과 현대 의미 지표·LLM 평가의 직접 계보도 공개 문서에서 교정했다.

`038`의 2005년 프로젝트 출범·최초 대규모 의미 주석 자원이라는 단정, Arg2–Arg4를 보편 의미역으로 고정한 설명, FrameNet을 제한된 어휘·PropBank를 폭넓은 어휘로만 대비한 서술, 2005년 당시 규모와 후대 확장의 혼합, 영어 Penn Treebank 기반 번호 체계를 언어 독립 표현으로 보는 주장, PropBank에서 정보 추출·질의응답·기계 번역·AMR·신경 언어 모델로 이어지는 직접 계보도 공개 문서에서 교정했다.

`039`의 스키마 부재와 편집 가능한 스키마의 혼동, 네임스페이스 경로를 타입 계층·속성 상속으로 보는 설명, 모든 노드를 현실 개체로 보는 서술, 역방향 탐색과 중복 사실 저장의 혼합, 그래프 패턴 질의를 논리 추론으로 부르는 설명, 순수 공동체 구축과 Google Knowledge Graph로의 단순 이관, 지식 그래프 패러다임의 단독 창시 및 검색·추천·LLM 전체의 직접 계보도 공개 문서에서 교정했다.

`040`의 세 날 토너먼트라는 경기 형식, 음성·화면을 직접 인식했다는 설명, 게임 중 실시간 인터넷 사용, 구조 지식 직접 조회의 중심성, 비지도 학습의 자율적 관계 발견, 신뢰도와 확실성의 동일시, 경기 상금과 원시 QA 정확도의 혼합, *Knight Rider* 1960년대·*Moby-Dick* 1850년 연대, 범용 언어 이해·일반 지능과 현대 LLM으로 이어지는 직접 계보도 공개 문서에서 교정했다.

`041`의 2012년 단일 발명·Hinton 한 연구팀 중심 서사, HMM 전체와 GMM 음향 모델의 혼동, 초기 완전 연결 DNN의 장거리 문맥 해결, 원시 파형 종단 간 특징 학습, ReLU·dropout을 2012년 초기 성공의 두 원인으로 보는 설명, 20–30% 상대 오류 감소와 퍼센트포인트·모든 자료의 동일 성능 혼합, WER 향상과 발화 의미 이해의 동일시, 음성 DNN-HMM에서 컴퓨터 비전·NLP·LLM으로 이어지는 단일 직접 계보도 공개 문서에서 교정했다.

`042`의 구조 지식 최초 발명 서사, `(Paris, P36, France)`의 반대 방향 triple, Wikidata statement를 단순 triple로 축약한 설명, reference·rank와 사실 검증의 동일시, 한 번의 편집이 모든 Wikipedia 언어판에 자동 전파된다는 주장, SPARQL 경로 질의와 자동 논리 추론의 혼동, 무제한·무지연 API·live query, 언어 중립 ID와 완전한 다언어 coverage의 동일시, 검색·가상 비서·번역·추천·RAG 전반의 직접 채택과 LLM hallucination 자동 해결 주장도 공개 문서에서 교정했다.

`043`의 밀집 단어 표현 최초 발명·인간과 같은 의미 이해, one-hot만 존재했다는 역사, 희소 동시출현 행렬의 비실용성, CBOW·Skip-gram·negative sampling을 하나의 최초 논문에 묶는 설명, 양성 단어 벡터를 직접 가깝게 만드는 대칭 목적, 벡터 유추의 보편성과 구조적 이해, 부정 샘플링의 어휘 크기별 직접 비용, 점진 학습 불가능·OOV 해결, 모든 NLP 과제의 즉각적 개선과 GloVe·FastText·ELMo·BERT·GPT로 이어지는 단일 직접 계보도 공개 문서에서 교정했다.

`044`의 GloVe가 전체 문서·말뭉치를 한꺼번에 읽는다는 설명, 5만 어휘의 dense 행렬 25억 항 전체 저장·계산, Word2Vec은 국소·GloVe만 전역 통계를 쓴다는 대립, 희귀어·OOV 자동 해결과 모든 과제의 우월성, 명시 행렬과 저차원 벡터 차원의 완전한 해석 가능성, SGD의 좌표별 동일 고정량 갱신, Adam 2차 raw moment와 gradient 분산의 혼동, 편향 보정의 초기 폭주, 기본값의 무조정 보편 수렴·훈련 시간 절반·일반화·재현성 보장, 원 Adam과 L2 penalty·AdamW의 혼합, GloVe와 Adam이 결합해 현대 LLM을 직접 가능하게 했다는 서사도 공개 문서에서 교정했다.

`027`의 MaxEnt·SVM 1996년 공동 혁명, MaxEnt와 로지스틱 회귀의 잘못된 대비, 특징 상호작용의 자동 발견, 확률 calibration 보장, SVM의 보편적 최적 경계·필수 커널·사전 support vector 선별·항상 빠른 추론, 1996년 일반 성능처럼 묶은 품사·개체명·청킹 수치, CRF·구조 SVM·신경 표현 학습·LLM으로 이어지는 직선적 직접 계보도 공개 문서에서 교정했다.

`028`의 1997년부터 존재한 현대식 3게이트 구성, 순환 가중치의 최대 고윳값 하나로 결정되는 기울기 소실·폭주, 시점마다 별도 매개변수가 멈춘다는 설명, 후보값의 tanh가 누적 셀 상태를 항상 제한한다는 주장, 시그모이드의 정확한 이진 게이트, 원형 학습법과 현대 완전 BPTT의 동일시, `sat/sitted` 수 일치 예시, LSTM의 게이팅 단독 발명·즉각적인 언어/음성 성과, GRU의 단순 게이트 병합, 결손 도식과 Transformer·LLM으로 이어지는 직접 계보도 공개 문서에서 교정했다.

`029`의 1997년 단일 통계 파싱 혁명, 규칙과 확률의 완전한 교체, 기본 PCFG의 무어휘성, 모든 규칙에 양의 확률을 주는 평활화, 표준 CKY와 Collins 차트의 동일시, NLU·IE·MT·QA 전반에 대한 단일 인과, Collins에서 Transformer·BERT·GPT로 이어지는 직접 계보도 공개 문서에서 교정했다.

`030`의 1998년 최초 대규모 공개 릴리스, 말뭉치 기반과 자동 귀납의 혼동, `Commerce_buy`의 LU·FE 완전 목록을 회고의 예시 표로 대신한 설명과 coreness 혼합, 가상 관계 예시를 실제 데이터베이스 관계로 확정하는 서술, FrameNet-inspired 계보와 PropBank 기반 CoNLL 자료의 혼합, PropBank·AMR·지식 그래프·BERT·GPT로 이어지는 직선적 직접 계보와 응용 분야 전체의 혁명적 인과도 공개 문서에서 교정했다.

`031`의 1999년 단일 혁명 연대, 1990년 논문의 저자·소속 축약, LSI 입력을 고정 TF-IDF로 보는 설명, SVD 축을 사람이 읽는 토픽으로 동일시하는 해석, 제한된 검색 평가의 보편화, pLSI와 LDA의 생성 구조 혼동, 산업 전반의 즉각적 채택 및 Word2Vec·GloVe·Transformer·LLM으로 이어지는 직선적 직접 계보도 공개 문서에서 교정했다.

`032`의 이전 순서열 모델을 독립 분류로 축약한 역사, 일반 CRF와 1차 선형 사슬의 혼동, 위치·clique 합을 생략하고 중복 렌더링된 확률식, 비터비 비용의 라벨 수 의존성 누락, 볼록 목적과 유일한 매개변수·neural CRF의 혼동, 정규화 확률을 자동 calibration으로 보는 설명, Penn Treebank 한 실험에서 NLP 전반의 성능·상용 채택으로 넓힌 주장, RNN·Transformer·LLM으로 이어지는 직선적 직접 계보도 공개 문서에서 교정했다.

`033`의 문장별 BLEU 안정성, 단순 단어 중복률이라는 축약, 완전한 언어 독립성, 결정적 점수와 통계적 확실성의 혼동, BLEU를 미분 가능한 신경 번역 학습 목표로 보는 설명, 높은 점수와 번역 품질의 동일시, 신경 기계 번역·LLM 발전을 단일 평가 지표의 직접 인과로 묶는 서사도 공개 문서에서 교정했다.

`034`의 2003년 phrase translation 단일 발명, SMT phrase와 통사·의미 구의 동일시, 긴 관용구 암기를 주된 성능 원인으로 보는 설명, 구 기반 모형이 데이터 희소성을 해결한다는 주장, beam search를 정확한 동적 계획법으로 보는 설명, MERT가 전체 모형을 BLEU의 미분 가능한 손실로 학습한다는 서술, 평가 목적 정렬과 실제 인간 품질의 동일시, phrase alignment·MERT에서 attention·신경 번역·LLM으로 이어지는 직선적 계보도 공개 문서에서 교정했다.

`035`의 n-gram이 문맥을 전혀 사용하지 않는다는 대조, `hot dog` 다의성을 정적 단어 벡터가 해결한다는 설명, one-hot 자체와 조합 희소성의 혼동, 임베딩 의미 군집·analogy·downstream 전이 학습을 2003년 실험 결과로 보는 주장, OOV 처리의 실증과 subword 혼합, 적은 자료·계산으로 우월했다는 서사, word2vec·GloVe·RNN·LSTM·Transformer·BERT·GPT와 scaling law로 이어지는 단일 직접 계보도 공개 문서에서 교정했다.

## 관련 항목

- [[index]]
- [[log]]

