---
schema_version: 2
id: concept.degradation-problem
page_type: concept
title: Degradation problem
aliases: [Degradation Problem, 성능 저하 문제, 깊이 저하 문제]
tags:
  - type/concept
  - domain/ai
  - domain/machine-learning
  - domain/optimization
created: '2026-07-18'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/047_Residual Connections Enabling Training of Very Deep Neural Networks.ko.md'
  - 'raw/047_Residual Connections Enabling Training of Very Deep Neural Networks.commentary.ko.md'
evidence:
  - source_id: he-et-al-2016-resnet
    locator: '§1과 Figures 1·4·6의 더 깊은 plain network에서 증가한 training error'
    relation: supports
related:
  - source.048
  - concept.잔차-연결
  - concept.resnet
  - concept.기울기-소실
---
# Degradation problem

> [!note] 학습 안내
> **난이도:** 입문<br>
> **선수 지식:** 없음<br>
> **읽고 나면:** 깊은 네트워크의 degradation problem을 과적합과 기울기 소실에서 구분하고 잔차 학습의 대응을 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

[[Degradation problem]]은 네트워크에 층을 더했을 때 시험 오류뿐 아니라 **훈련 오류도** 증가하는 깊은 신경망의 최적화 현상이다. ResNet 논문은 CIFAR-10의 20층 대 56층 plain net과 ImageNet의 18층 대 34층 plain net에서 이를 관찰했다.

## 2단계 — 작동 원리

### 과적합과의 차이

과적합에서는 보통 훈련 오류가 낮아지면서 시험 오류가 높아진다. degradation에서는 더 깊은 모델의 훈련 집합 적합 자체가 나빠졌다. 더 깊은 모델은 얕은 모델 함수 뒤에 항등 층을 붙여 적어도 같은 함수를 표현할 수 있으므로, 표현 용량보다 optimizer가 좋은 해를 찾는 문제가 핵심이었다.

### 기울기 소실과의 차이

vanishing/exploding gradient는 반복 Jacobian 곱 때문에 학습 신호가 지나치게 줄거나 커지는 현상이다. ResNet 실험은 정규화된 초기화와 BatchNorm으로 이 문제를 상당히 통제한 plain net도 degradation을 보였다고 설명했다. 두 현상이 상호작용할 수 있지만 같은 정의가 아니며, 원 논문은 degradation의 유일 원인을 기울기 소실로 확정하지 않았다.

## 3단계 — 기술과 근거

### 잔차 학습의 대응

잔차 블록은 추가 변환이 필요 없을 때 (F(x)=0)으로 항등을 구현할 수 있게 한다. 실제 residual net은 같은 깊이의 plain net보다 낮은 훈련 오류를 보였고 깊이가 늘며 정확도도 개선됐다. 이는 residual parameterization이 optimization difficulty를 완화했다는 경험적 증거다.

## 검증과 한계

ResNet 실험은 residual parameterization이 같은 깊이의 plain network보다 최적화하기 쉬웠다는 경험적 근거를 제공한다. 그러나 degradation의 유일한 원인을 특정하거나 잔차 연결이 모든 깊이·자료·최적화 조건에서 같은 효과를 낸다고 증명한 것은 아니다.

## 학습 확인

### 확인 질문

1. degradation problem은 훈련 오류와 시험 오류에서 어떤 모습으로 나타나는가?
2. 과적합·기울기 소실과 degradation은 각각 어떻게 다른가?
3. ResNet 실험은 잔차 학습에 관해 무엇을 보였고 무엇을 보장하지 않았는가?

### 다음 문서

- [[잔차 연결]] — degradation을 완화한 항등 경로와 잔차 갱신의 구조를 이어서 본다.

## 출처

- [[048_잔차 학습과 매우 깊은 신경망]]
- Kaiming He 외, [Deep Residual Learning for Image Recognition](https://openaccess.thecvf.com/content_cvpr_2016/html/He_Deep_Residual_Learning_CVPR_2016_paper.html), 2016, §1과 Figures 1·4·6.

## 관련 항목

- [[048_잔차 학습과 매우 깊은 신경망]]
- [[잔차 연결]]
- [[ResNet]]
- [[기울기 소실]]
