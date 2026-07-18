---
schema_version: 2
id: concept.resnet
page_type: concept
title: ResNet
aliases: [Residual Network, Residual Networks, 잔차 네트워크]
tags:
  - type/concept
  - domain/ai
  - domain/machine-learning
  - domain/computer-vision
created: '2026-07-18'
updated: '2026-07-18'
lifecycle: active
verification: verified
artifacts:
  - 'raw/048_Residual Connections Enabling Training of Very Deep Neural Networks.ko.md'
  - 'raw/048_Residual Connections Enabling Training of Very Deep Neural Networks.commentary.ko.md'
evidence:
  - source_id: he-et-al-2016-resnet
    locator: '전체, 특히 Figures 2–6, Tables 2–6의 18–152층 ImageNet과 20–1202층 CIFAR 실험'
    relation: supports
  - source_id: he-et-al-2016-identity-mappings
    locator: '§§3–4의 pre-activation ResNet과 1001층 CIFAR·200층 ImageNet 평가'
    relation: supplements
related:
  - source.048
  - concept.잔차-연결
  - concept.degradation-problem
  - concept.합성곱-신경망
---
# ResNet

[[ResNet]](Residual Network)은 [[잔차 연결]]을 반복해 깊은 합성곱 신경망의 최적화를 개선한 구조 계열이다. 2015년 공개·CVPR 2016 발표 논문은 ImageNet에서 18·34·50·101·152층, CIFAR-10에서 20층부터 1202층까지의 plain/residual 대조를 제시했다.

## Basic block과 bottleneck

18·34층 basic block은 주로 두 3×3 convolution을 썼다. 50층 이상 bottleneck은 1×1에서 channel을 줄이고 3×3 변환 뒤 1×1에서 늘리는 세 층으로 계산량을 조절했다. 각 stage 전환에서는 spatial resolution을 낮추고 channel 수를 늘렸다.

원 블록은 addition 뒤 ReLU를 둔 post-activation 구조였다. 2016년 후속 연구는 BN·ReLU를 convolution 앞에 두는 full pre-activation을 제안해 identity path를 더 직접적으로 만들었다.

## 평가 범위

152층 단일 모델의 ImageNet 10-crop top-5 오류 4.49%와 여러 residual net 앙상블의 test 3.57%를 구분한다. 후자가 ILSVRC 2015 분류 우승 수치다. CIFAR의 1202층 모델은 훈련 오류는 낮았지만 110층보다 시험 오류가 높아 과적합 가능성을 보였다.

따라서 ResNet은 “깊을수록 항상 정확하다”는 증거가 아니라, 같은 깊이의 plain network보다 residual parameterization이 훨씬 쉽게 최적화되고 적절한 범위에서 깊이 이득을 얻는다는 증거다.

## 출처

- [[048_잔차 학습과 매우 깊은 신경망]]
- Kaiming He 외, [Deep Residual Learning for Image Recognition](https://openaccess.thecvf.com/content_cvpr_2016/html/He_Deep_Residual_Learning_CVPR_2016_paper.html), 2016.
- Kaiming He 외, [Identity Mappings in Deep Residual Networks](https://arxiv.org/abs/1603.05027), 2016.

## 관련 항목

- [[048_잔차 학습과 매우 깊은 신경망]]
- [[잔차 연결]]
- [[Degradation problem]]
- [[합성곱 신경망]]
