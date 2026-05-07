---
title: Smoothing
aliases: [스무딩, 확률 평활화, smoothing techniques]
tags: [type/concept, domain/ai, status/active]
created: 2026-05-07
updated: 2026-05-07
sources: ["001_Shannon's N-gram Model - The Foundation of Statistical Language Processing..md"]
status: active
---

# Smoothing

[[Smoothing]]은 관찰되지 않은 사건에도 합리적인 확률을 부여하도록 확률 추정치를 조정하는 기법이다. [[N-gram 모델]]에서는 학습 말뭉치에 나타나지 않은 n-gram을 실제 입력에서 마주칠 수 있으므로, 미관측 조합을 0 확률로 처리하지 않는 것이 중요하다.

## 대표 기법

Katz back-off는 특정 n-gram을 관찰하지 못했을 때 더 짧은 문맥으로 물러나 확률을 추정한다. 예를 들어 어떤 trigram을 보지 못했다면 관련 bigram을 보고, 그것도 부족하면 unigram으로 후퇴한다. 이 접근은 [[슬라바 카츠]]가 1987년에 제안한 방법으로 소개된다 [[001_섀넌의 N-gram 모델]].

Good-Turing smoothing은 한 번 관찰된 사건의 정보를 이용해 한 번도 관찰되지 않은 사건의 확률을 추정한다. Kneser-Ney smoothing은 단어가 얼마나 자주 등장하는지뿐 아니라 얼마나 다양한 문맥에서 등장하는지도 고려한다.

## 한계

Smoothing은 [[데이터 희소성]]을 완화하지만 [[마르코프 가정]]이 만드는 짧은 문맥의 한계와 의미 표현의 부재를 해결하지는 못한다. 이 한계는 분산 표현과 신경망 언어 모델로 이어지는 연구 흐름의 배경이 되었다.

## 관련 항목

- [[N-gram 모델]]
- [[데이터 희소성]]
- [[슬라바 카츠]]
- [[N-gram에서 LLM으로]]
