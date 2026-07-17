# 메모리 네트워크: 신경 질의응답을 위한 외부 메모리 — 해설

## 1. 한눈에 보기

2014년 Memory Networks는 읽고 쓸 수 있는 장기 메모리 (m)와 입력 (I), 갱신 (G), 출력 (O), 응답 (R) 구성 요소를 결합한 일반 틀을 제시했다. 질의응답 구현은 문장을 슬롯에 저장하고 최대 두 개의 supporting fact를 순차적으로 `argmax` 선택해 한 단어 답을 순위화했다. 원문은 이 원형을 뒤의 soft attention, End-To-End Memory Network, bAbI, 대규모 벡터 검색과 RAG에 너무 일찍 합쳐 설명한다.

## 2. 핵심 요약

- 원 논문의 메모리는 문자열 또는 벡터 객체의 배열이며, 일반 틀은 시험 시점에도 새 입력을 저장할 수 있게 했다.
- 실제 텍스트 구현의 (G)는 새 문장을 다음 빈 슬롯에 저장했을 뿐, 모든 슬롯을 학습해 다시 쓰는 정교한 메모리는 아니었다.
- (O)는 모든 후보에서 가장 점수가 높은 supporting memory를 hard `argmax`로 고르고, 둘째 홉은 질문과 첫 사실을 함께 사용했다.
- (R)은 실험에서 주로 전체 어휘 중 한 단어 답을 margin ranking으로 골랐다. 자유로운 장문 생성은 제안 가능성이지 대표 결과가 아니다.
- 훈련에는 정답뿐 아니라 supporting sentences의 라벨이 주어지는 강한 감독이 사용됐다. “정답만으로 완전 미분 가능한 soft attention을 공동 학습했다”는 원문 설명은 후대 구조와 섞인 것이다.
- 2015년 End-To-End Memory Networks가 recurrent soft attention으로 감독 요구를 줄였다.
- RAG는 2020년 dense Wikipedia index, 신경 검색기와 사전학습 seq2seq 생성기를 결합한 별도 계보다. 기능적 유사성이 곧 단일 직계 후손을 입증하지는 않는다.

## 3. 역사적 배경

외부 메모리와 검색은 2014년의 발명이 아니다. 전통 질의응답은 문서를 메모리처럼 두고 정보 검색으로 후보를 찾았으며, 지식 베이스 질의는 명시적 사실 그래프를 사용했다. 논문 자체도 associative memory, nearest-neighbor memory-based learning, 1990년대 differentiable stack을 관련 연구로 든다.

Memory Networks의 새로움은 외부 저장, 학습된 표현·순위 점수, 반복 검색, 응답을 하나의 범용 모듈 틀로 명시한 데 있다. 이를 “신경망이 역사상 처음 외부 정보를 가졌다”라고 표현하면 검색·사례 기반 학습·지식 베이스 계보가 지워진다.

## 4. 핵심 개념 해설

일반 틀은 다음 네 단계를 반복한다.

1. (I(x)): 입력을 내부 특징으로 바꾼다.
2. (m_i=G(m_i,I(x),m)): 새 입력에 따라 메모리를 갱신한다.
3. (o=O(I(x),m)): 입력과 메모리에서 출력 특징을 구한다.
4. (r=R(o)): 출력 특징을 텍스트나 행동으로 변환한다.

텍스트 구현에서 첫 supporting memory는

\[
o_1=\arg\max_i s_O(x,m_i)
\]

이고, 둘째는

\[
o_2=\arg\max_i s_O([x,m_{o_1}],m_i)
\]

이다. 점수는 bag-of-words 특징을 임베딩한 bilinear 형태 (s(x,y)=\Phi_x(x)^TU^TU\Phi_y(y))였다. softmax로 모든 슬롯을 가중 합하는 어텐션과 다르며, `argmax` 선택 경로 자체를 최종 정답만으로 미분해 배운 것도 아니다.

## 5. 원문의 논리 구조

글은 매개변수 지식의 한계를 도서관 비유로 제시하고 네 구성 요소, 다중 홉, 공동 훈련을 설명한다. 이어 규모·갱신·해석 가능성을 장점으로, 감독·계산·관계·슬롯 입도를 한계로 든다. 마지막에는 Transformer, RAG, 모듈식 LLM 응용으로 유산을 확장한다. 설명의 방향은 유익하지만 기술 세대 사이의 경계가 흐리다.

## 6. 왜 중요한가

이 연구는 “기억”을 은닉 상태나 가중치의 비유로만 두지 않고 주소를 가진 외부 객체 배열과 읽기·쓰기 연산으로 명시했다. 또한 한 질문에 대해 첫 사실을 찾고 그 결과로 둘째 사실을 찾는 반복 접근을 모델 구조로 드러냈다. 오늘날 검색 증강 시스템을 이해할 때도 저장 위치, 후보 생성, 정밀 점수화, 여러 홉, 응답 생성을 분리해 묻는 출발점이 된다.

## 7. 현대 LLM과의 연결

현대 RAG와는 다음 기능을 비교할 수 있다.

- **외부 저장**: MemNN 슬롯 ↔ RAG 문서·passage 색인
- **질의 기반 접근**: 임베딩 순위 점수 ↔ dense retriever
- **검색 결과 사용**: 단어 응답 순위화 ↔ 사전학습 seq2seq 생성
- **갱신**: 새 메모리 저장 ↔ 문서 색인 갱신

하지만 RAG는 대규모 근사 최근접 검색, DPR 계열 retriever, BART 같은 생성기, 잠재 문서 주변화를 사용한다. 원 MemNN의 hard support selection과 같은 모델은 아니다. Transformer self-attention도 입력 시퀀스 내부의 모든 위치를 매 층 결합하는 연산이며, 외부 영속 메모리 검색과 동일하지 않다.

## 8. 한계와 비판적 관점

- 원 구현은 supporting sentence 라벨을 훈련에서 사용했다. 원문 앞부분의 “어느 슬롯을 볼지 명시 감독 없이 학습”과 뒤의 감독 문제 설명은 모순된다.
- 2014년 원 논문의 합성 세계 과제는 뒤의 20개 bAbI 과제 묶음과 같지 않다. bAbI는 2015년 별도 논문에서 제안·확장됐다.
- large-scale QA 실험은 WebQuestions·Freebase 계열의 단답 과제였고, 수백만 자유 문서의 현대 독해·RAG와 동일하지 않다.
- 원형의 `argmax` 선택은 모든 슬롯의 확률 가중 결합이 아니다. “attention weights가 정확히 어떤 슬롯이 기여했는지 보여 준다”는 설명은 세대와 해석 가능성을 과장한다.
- 논문은 큰 메모리에서 모든 슬롯을 채점하는 비용을 인정하고 word hashing·embedding cluster로 후보를 줄였다. 외부 메모리가 저장 용량만 늘리면 자동으로 무한 확장되는 것은 아니다.
- 새 문서를 넣는다고 항상 바로 정확히 사용할 수 있는 것은 아니다. 훈련 분포, 표현, 분할, 색인, 용어 변화가 검색 품질을 결정한다.
- multi-hop selection은 supporting facts를 찾는 계산 절차이지 인간의 내적 “chain of thought”를 관찰한 것이 아니다.
- 선택한 근거가 보인다고 답의 모든 인과가 설명되거나 신뢰성이 보장되지는 않는다. 관련 사실을 찾고도 응답을 잘못 만들 수 있다.

## 9. 용어 정리

- **외부 메모리**: 모델 매개변수와 구분된, 주소를 가진 정보 객체 저장소.
- **Memory Network**: 외부 메모리와 (I,G,O,R) 학습·추론 구성 요소를 결합한 틀.
- **Memory Neural Network(MemNN)**: 네 구성 요소 일부를 신경 임베딩·점수 모델로 구현한 형태.
- **Supporting fact**: 질문 답에 필요한 것으로 라벨되거나 선택된 메모리 문장.
- **Hop**: 이전 질문·검색 결과를 사용해 다음 메모리를 다시 선택하는 한 단계.
- **Hard selection**: `argmax`처럼 소수 항목을 이산적으로 선택하는 접근.
- **Soft attention**: 여러 항목에 연속 가중치를 주어 가중 합하는 접근.
- **Parametric memory**: 가중치에 분산된 지식.
- **Non-parametric memory**: 문서·벡터 색인처럼 개별 항목을 추가·교체할 수 있는 외부 저장.

## 10. 함께 보면 좋은 항목

- Weston, Chopra, Bordes, “Memory Networks” (2014/2015)
- Sukhbaatar et al., “End-To-End Memory Networks” (NeurIPS 2015)
- Weston et al., “Towards AI-Complete Question Answering: A Set of Prerequisite Toy Tasks” (2015)
- Karpukhin et al., “Dense Passage Retrieval for Open-Domain Question Answering” (2020)
- Lewis et al., “Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks” (NeurIPS 2020)

## 11. 읽고 생각해볼 질문

1. 외부 저장소를 “메모리”라고 부를 때 데이터베이스·검색 색인·작업 상태는 어떻게 구분해야 하는가?
2. supporting fact 라벨이 없는 환경에서 여러 홉 검색을 학습하려면 어떤 신호가 필요한가?
3. 선택한 문서를 보여 주는 것과 답변의 근거를 충실히 설명하는 것은 왜 다른가?
4. MemNN과 RAG 사이의 공통 인터페이스와 서로 다른 학습·검색 메커니즘은 무엇인가?

## 12. 짧은 결론

Memory Networks의 핵심은 신경망에 “무한 기억”을 준 것이 아니라 저장·읽기·반복 검색·응답을 분리해 학습 가능한 외부 메모리 문제를 명시한 데 있다. 원형의 hard selection과 강한 감독, 2015년 soft end-to-end 변형, 2020년 RAG를 구분할 때 이 연구의 실제 기여와 현대적 유사성을 동시에 정확히 볼 수 있다.
