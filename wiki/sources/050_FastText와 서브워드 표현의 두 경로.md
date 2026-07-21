---
schema_version: 2
id: source.050
page_type: source
title: FastText와 서브워드 표현의 두 경로
aliases:
  - 050_Subword Tokenization and FastText Character N-gram Embeddings for Robust Word Representations
  - Subword Tokenization and FastText Character N-gram Embeddings for Robust Word Representations
tags:
  - type/source
  - domain/ai
  - domain/nlp
  - domain/machine-learning
created: '2026-07-18'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/050_Subword Tokenization and FastText Character N-gram Embeddings for Robust Word Representations.ko.md'
  - 'raw/050_Subword Tokenization and FastText Character N-gram Embeddings for Robust Word Representations.commentary.ko.md'
evidence:
  - source_id: mikolov-et-al-2013-negative-sampling
    locator: 'NeurIPS 2013, §§2–3의 Skip-gram negative sampling과 subsampling'
    relation: contextualizes
  - source_id: gage-1994-byte-pair-encoding
    locator: 'The C Users Journal 12(2), pp. 23–38, 초록과 §1의 빈번한 인접 byte pair 치환 압축'
    relation: contextualizes
  - source_id: sennrich-haddow-birch-2016-subword-nmt
    locator: 'ACL 2016, pp. 1715–1725, 특히 §§1·3.2와 Algorithm 1의 BPE word segmentation, §§4–5의 희귀어 번역 평가'
    relation: supports
  - source_id: bojanowski-et-al-2017-fasttext
    locator: 'TACL 5, pp. 135–146, 특히 §§3.1–3.2의 character n-gram 합·hash와 §§4–6의 9개 언어 평가'
    relation: supports
  - source_id: kudo-2018-subword-regularization
    locator: 'ACL 2018, 초록과 §§2–3의 unigram language model segmentation과 subword sampling'
    relation: contextualizes
  - source_id: kudo-richardson-2018-sentencepiece
    locator: 'EMNLP 2018 System Demonstrations, pp. 66–71, 특히 §§1–2의 raw sentence 훈련·lossless tokenization과 §3의 NMT 검증'
    relation: contextualizes
related:
  - concept.fasttext
  - concept.서브워드-토큰화
  - concept.byte-pair-encoding
---
# FastText와 서브워드 표현의 두 경로

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[Word2Vec]]<br>
> **읽고 나면:** FastText의 문자 n-gram 벡터 합성과 BPE의 시퀀스 분절이 어떻게 다른지 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

049 raw는 원자적인 word type 임베딩의 희귀어·OOV 한계와 [[FastText]]의 문자 n-gram 합을 설명하고, 이를 [[Byte Pair Encoding|BPE]]·SentencePiece·현대 Transformer 토큰화로 잇는다. 희소성을 더 작은 문자열 단위의 매개변수 공유로 완화한다는 공통점은 맞다. 그러나 **단어 하나의 벡터를 내부 특징에서 합성하는 일**과 **입력 시퀀스 자체를 여러 token으로 분절하는 일**은 모델 인터페이스가 다르다.

공개 문서는 이 두 경로를 분리하고, 논문 연도·FastText의 실제 식과 hash·BPE의 압축 기원·SentencePiece의 도구 범위·원 논문의 평가 범위를 1차 문헌으로 검증한다.

### 핵심 문장

- FastText는 Skip-gram의 문맥 목적을 유지하면서 중심 단어 입력 벡터를 공유 문자 n-gram 벡터의 합으로 바꾼다.
- OOV 벡터를 계산할 수 있다는 사실은 미관측 단어의 의미를 정확히 추론한다는 뜻이 아니다.
- BPE는 고정 어휘와 sequence 길이 사이의 trade-off를 빈번한 symbol pair 병합으로 조절한다.
- FastText의 subword는 한 벡터의 특징이고 BPE의 subword는 여러 sequence position이다.
- SentencePiece는 BPE의 동의어가 아니라 raw text에서 여러 subword model을 다루는 tokenizer/detokenizer 틀이다.

## 2단계 — 작동 원리

### 원자적 단어 벡터의 희소성

기본 Word2Vec Skip-gram은 word type마다 별도 입력 벡터를 두고 중심 단어로 문맥 단어를 예측한다. 철자가 비슷하거나 같은 접사를 공유해도 매개변수를 직접 나누지 않는다. 희귀 굴절형은 업데이트가 적고 훈련 어휘 밖 문자열에는 lookup vector가 없다.

이 문제는 형태가 풍부한 언어에서 두드러지지만 그 언어에만 한정되지 않는다. 전문 용어·이름·신조어·철자 변이도 관측이 희소하다. 다만 OOV를 표현할 수 없다는 문제, 관측이 적어 벡터가 부정확하다는 문제, 새 개념의 의미를 알지 못한다는 문제는 서로 다르다.

## 3단계 — 기술과 근거

### FastText: token을 쪼개지 않고 입력 벡터를 합성하기

Bojanowski 등의 논문은 2016년 제출을 거쳐 TACL 2017에 출판됐다. 이 방법은 중심 단어 $w$에 경계 기호를 붙이고 길이 3–6의 문자 n-gram 집합 $G_w$와 완전한 단어의 특별 항목을 만든다. 각 항목의 벡터 $z_g$를 더해 문맥 단어 $c$와 다음 점수를 계산한다.

$$
s(w,c)=\sum_{g\in G_w}z_g^\top v_c
$$

$v_c$는 문맥 쪽 출력 벡터다. 목적은 Word2Vec의 Skip-gram with negative sampling을 유지하되 중심 단어의 독립 입력 벡터를 공유 subword 벡터의 합으로 바꾼다. 이 점에서 FastText는 별도의 형태소 분석기가 아니라 SGNS의 **매개변수화 확장**이다.

논문은 “<where>”라는 완전 단어 항목을 “where” 내부의 “<wh>, whe, her, ere, re>”와 함께 사용한다. 단어 “her”의 경계를 포함한 “<her>”와 “where” 안의 “her”는 다른 항목이다. 훈련에 없던 단어에는 완전 단어 벡터가 없지만 이미 학습한 문자 n-gram 벡터를 합해 근사할 수 있다.

### 고정 hash 공간의 이점과 대가

가능한 모든 문자 n-gram에 독립 벡터를 두면 메모리가 커진다. 논문 구현은 FNV-1a hash로 n-gram을 $K=2{,}000{,}000$개 bucket에 사상했다. 고정 공간 덕분에 사전을 제한할 수 있지만 서로 다른 문자열이 같은 bucket을 공유하는 충돌이 생긴다.

그러므로 FastText가 “무한 어휘를 정확히 이해한다”고 표현하면 안 된다. 미관측 단어가 알려진 문자 패턴을 공유할수록 유용한 신호를 받을 수 있지만, 우연한 철자 유사성·hash collision·다른 문자 체계·불투명한 이름은 오차를 만든다. 문자 n-gram은 형태소 경계를 보장하지 않는다.

### 논문이 실제로 평가한 범위

TACL 논문은 아랍어·체코어·독일어·영어·스페인어·프랑스어·이탈리아어·루마니아어·러시아어의 9개 Wikipedia 말뭉치에서 단어 유사도와 유추를 평가했다. 자료량·n-gram 길이, OOV 이웃과 일부 언어 모형 초기화도 분석했다. 형태가 풍부한 언어와 희귀 단어에서 개선이 더 큰 경향을 보고했다.

원문의 개체명 인식·정보 검색·감성 분석·콘텐츠 조정 사례는 가능한 후속 응용이지만 이 논문의 직접 실험 목록은 아니다. 같은 fastText 프로젝트의 효율적 텍스트 분류기와 문자 n-gram 단어 벡터 논문도 구분해야 한다.

영어 설정에서 subword 모델은 논문이 비교한 plain Skip-gram보다 약 1.5배 느렸고 초당 처리량도 105k 대 145k words/thread였다. 여전히 빠른 방법이라는 평가와 추가 계산이 없다는 주장을 구분한다.

### BPE: 한 단어를 여러 시퀀스 단위로 바꾸기

Philip Gage의 1994년 BPE는 가장 자주 나타나는 인접 byte pair를 미사용 byte로 반복 치환하는 압축 알고리즘이었다. Sennrich·Haddow·Birch는 ACL 2016에서 byte 대신 문자 또는 이미 합쳐진 문자열 symbol을 병합하도록 바꾸어 NMT의 word segmentation에 적용했다.

초기 symbol 어휘는 문자와 단어 끝 기호로 시작한다. 말뭉치에서 가장 빈번한 인접 pair를 반복 병합하면 자주 나타나는 문자열은 긴 subword나 완전한 단어가 되고, 드문 문자열은 더 짧은 단위로 남는다. 원 논문 설정은 word boundary를 넘는 pair를 병합하지 않았고 merge 횟수가 최종 어휘 크기를 조절했다.

이 과정은 단어 안의 여러 조각을 합해 한 벡터로 되돌리지 않는다. 번역 encoder와 decoder가 각 subword를 별도 sequence position으로 처리한다. 어휘가 작아지면 희소성은 줄지만 text sequence가 길어지고 모델이 더 먼 위치를 연결해야 하는 비용이 생긴다.

### SentencePiece는 BPE의 다른 이름이 아니다

SentencePiece는 기존 subword 도구가 사전 word tokenization을 가정하는 문제를 겨냥해 raw sentence에서 직접 subword model을 훈련하고 encode/decode하는 도구·틀이다. 공백도 meta symbol로 다뤄 normalized text를 복원할 수 있게 했다. BPE와 unigram language model을 포함한 여러 model type을 지원한다.

따라서 BPE는 merge 기반 segmentation 알고리즘이고, Unigram은 가능한 조각 집합에서 문장 확률과 분절을 다루는 다른 알고리즘이며, SentencePiece는 이를 raw text에 적용하는 구현 틀이다. 세 이름을 같은 tokenization 방법의 동의어로 쓰지 않는다.

### 현대 Transformer와의 연결 범위

Transformer 언어 모형은 보통 tokenizer가 만든 이산 token ID를 lookup embedding으로 바꾸고 self-attention 층에서 문맥화한다. FastText는 word token 하나를 유지한 채 그 정적 입력 벡터를 문자 n-gram 합으로 만들고, BPE 계열은 문자열을 여러 token position으로 바꾼다.

둘 다 유한한 매개변수로 더 많은 문자열을 표현하지만 다음 차이가 있다.

| 질문 | FastText | BPE 계열 tokenizer |
| --- | --- | --- |
| 조각의 역할 | 한 word vector의 내부 특징 | 모델 입력·출력의 sequence token |
| 시퀀스 길이 | 원 word token 수를 유지 | 분절에 따라 늘어남 |
| 표현 | 문맥과 무관한 정적 합 | 초기 token lookup 뒤 문맥화 |
| 학습 대상 | SGNS 문맥 점수와 n-gram 벡터 | tokenizer merge/분절 규칙과 별도 model objective |
| OOV 조건 | 알려진 hash bucket n-gram으로 근사 | base alphabet·byte fallback·normalization 범위에 의존 |

많은 현대 파이프라인은 tokenizer를 먼저 학습·고정한 뒤 언어 모형 embedding과 본체를 훈련한다. tokenizer와 embedding을 항상 end-to-end로 공동 학습한다는 raw 설명은 보편적 사실이 아니다.

FastText가 BPE의 직접 원인이었다는 계보도 현재 근거로 확정하지 않는다. Sennrich의 BPE NMT 논문은 2016년에 발표됐고 FastText 단어 벡터 논문은 2017년에 출판되었으며, 후자는 관련 연구에서 전자를 인용한다. 확인되는 것은 비슷한 시기에 단어 원자성의 한계를 서로 다른 방식으로 다뤘다는 사실이다.

## 검증과 한계

### 검증 정정

- **FastText 단어 벡터는 2016년 정식 논문**: TACL 출판은 2017년이며 2016년은 제출·초기 공개 시기다.
- **FastText는 문자 n-gram만 더함**: 관측 단어에는 완전한 단어의 특별 벡터도 포함한다.
- **n-gram 사전은 충돌 없는 전체 목록**: 실제 구현은 200만 bucket hash를 사용해 충돌이 가능하다.
- **OOV이면 의미 있는 표현이 보장됨**: 철자 조각의 훈련 신호를 합성할 뿐 새 의미와 문맥을 자동 이해하지 않는다.
- **FastText가 형태소를 발견함**: 고정 길이 문자 조각은 형태소 경계와 일치할 필요가 없다.
- **FastText가 NER·검색·분류 개선을 원 논문에서 모두 입증**: 핵심 직접 평가는 9개 언어 유사도·유추와 일부 언어 모형 실험이다.
- **FastText가 BPE·SentencePiece를 낳음**: 공통 문제와 구조적 유사성은 있지만 직접 인과 계보는 입증되지 않았다.
- **BPE와 FastText는 같은 서브워드 처리**: 전자는 sequence segmentation, 후자는 한 정적 word vector의 feature composition이다.
- **SentencePiece는 BPE 알고리즘**: raw text tokenizer/detokenizer 틀이며 BPE와 Unigram을 지원한다.
- **subword tokenization이면 OOV가 항상 사라짐**: 기본 symbol coverage와 fallback·normalization 설정에 달려 있다.
- **현대 Transformer는 tokenizer와 embedding을 항상 공동 학습**: 많은 표준 파이프라인은 tokenizer를 먼저 고정한다.

## 학습 확인

### 확인 질문

1. FastText와 BPE는 문자열 조각을 모델 입력에 서로 어떤 단위로 제공하는가?
2. FastText는 미관측 단어의 벡터를 어떤 절차로 합성하는가?
3. subword 방법이 OOV를 완화해도 의미와 무손실 표현을 항상 보장하지는 않는 이유는 무엇인가?

### 다음 문서

- [[서브워드 토큰화]] — 문자열 분절이 어휘 크기와 시퀀스 길이를 어떻게 바꾸는지 개념 단위로 확인한다.

## 출처

- Tomas Mikolov 외, [Distributed Representations of Words and Phrases and their Compositionality](https://proceedings.neurips.cc/paper_files/paper/2013/hash/9aa42b31882ec039965f3c4923ce901b-Abstract.html), NeurIPS 2013.
- Philip Gage, [A New Algorithm for Data Compression](https://www.derczynski.com/papers/archive/BPE_Gage.pdf), The C Users Journal 12(2), 1994, pp. 23–38.
- Rico Sennrich·Barry Haddow·Alexandra Birch, [Neural Machine Translation of Rare Words with Subword Units](https://aclanthology.org/P16-1162/), ACL 2016, pp. 1715–1725.
- Piotr Bojanowski·Edouard Grave·Armand Joulin·Tomas Mikolov, [Enriching Word Vectors with Subword Information](https://aclanthology.org/Q17-1010/), TACL 5, 2017, pp. 135–146.
- Taku Kudo, [Subword Regularization](https://aclanthology.org/P18-1007/), ACL 2018, pp. 66–75.
- Taku Kudo·John Richardson, [SentencePiece](https://aclanthology.org/D18-2012/), EMNLP System Demonstrations 2018, pp. 66–71.
- 프로젝트 번역·검토 출발 자료: [Subword Tokenization and FastText Character N-gram Embeddings for Robust Word Representations](https://mbrenndoerfer.com/writing/subword-tokenization-fasttext-character-ngram-embeddings-robust-word-representations)
- 프로젝트 보존 자료: "raw/050_Subword Tokenization and FastText Character N-gram Embeddings for Robust Word Representations.ko.md"와 대응 해설.

## 관련 항목

- [[FastText]]
- [[서브워드 토큰화]]
- [[Byte Pair Encoding]]
