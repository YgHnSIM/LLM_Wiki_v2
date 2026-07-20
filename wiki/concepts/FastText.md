---
schema_version: 2
id: concept.fasttext
page_type: concept
title: FastText
aliases: [fastText subword embeddings, FastText 단어 임베딩]
tags:
  - type/concept
  - domain/ai
  - domain/nlp
  - domain/machine-learning
created: '2026-07-18'
updated: '2026-07-18'
lifecycle: active
verification: verified
artifacts:
  - 'raw/049_Subword Tokenization and FastText Character N-gram Embeddings for Robust Word Representations.ko.md'
  - 'raw/049_Subword Tokenization and FastText Character N-gram Embeddings for Robust Word Representations.commentary.ko.md'
evidence:
  - source_id: mikolov-et-al-2013-negative-sampling
    locator: '§§2–3의 Skip-gram with negative sampling 목적'
    relation: contextualizes
  - source_id: bojanowski-et-al-2017-fasttext
    locator: '§§3.1–3.2의 character n-gram 합·경계 기호·hash, §§4–6의 9개 언어 평가'
    relation: supports
related:
  - source.049
---
# FastText

[[FastText]]는 Skip-gram 중심 단어의 입력 표현을 완전 단어와 문자 n-gram 벡터의 합으로 매개변수화한 정적 단어 임베딩 방법이다. Bojanowski 등의 논문은 2017년 TACL에 출판됐다.

## 표현과 목적

경계 기호를 붙인 단어 $w$에서 보통 길이 3–6의 문자 n-gram 집합 $G_w$를 만들고 각 조각의 벡터를 더한다.

$$
s(w,c)=\sum_{g\in G_w}z_g^\top v_c
$$

목적은 Word2Vec SGNS와 같이 관측 중심–문맥 쌍의 점수를 높이고 음성 표본의 점수를 낮춘다. 바뀐 것은 중심 단어 입력 벡터가 word type별 한 행이 아니라 공유 문자 조각의 합이라는 점이다.

관측 단어에는 “<where>”처럼 완전 단어의 특별 항목도 포함한다. OOV 단어에서는 이 word-specific vector 없이 이미 학습한 문자 n-gram 벡터를 합한다.

## hash와 매개변수 공유

논문 구현은 FNV-1a로 문자 n-gram을 200만 bucket에 사상했다. 고정 메모리와 광범위한 공유를 얻지만 서로 다른 n-gram의 collision이 가능하다. 공유 철자가 유용한 형태 신호일 수도, 우연한 표면 유사성일 수도 있다.

## 범위와 한계

- word sequence를 여러 subword token으로 분절하지 않고 한 word vector를 만든다.
- 형태소 분석 없이 고정 길이 문자 조각을 쓰므로 형태 경계를 보장하지 않는다.
- OOV 문자열의 벡터를 계산할 수 있지만 새 개념의 의미·문맥을 자동 복원하지 않는다.
- word type당 정적 표현이므로 다의성을 문맥별로 나누지 않는다.
- 9개 언어의 유사도·유추와 일부 언어 모형 실험이 원 논문의 직접 평가다.
- 같은 fastText 프로젝트의 효율적 텍스트 분류기와 subword word-vector 방법은 구분한다.

## 출처

- [[049_FastText와 서브워드 표현의 두 경로]]
- Piotr Bojanowski·Edouard Grave·Armand Joulin·Tomas Mikolov, [Enriching Word Vectors with Subword Information](https://aclanthology.org/Q17-1010/), TACL 5, 2017, pp. 135–146.
- Tomas Mikolov 외, [Distributed Representations of Words and Phrases and their Compositionality](https://proceedings.neurips.cc/paper_files/paper/2013/hash/9aa42b31882ec039965f3c4923ce901b-Abstract.html), NeurIPS 2013.

## 관련 항목

- [[049_FastText와 서브워드 표현의 두 경로]]
