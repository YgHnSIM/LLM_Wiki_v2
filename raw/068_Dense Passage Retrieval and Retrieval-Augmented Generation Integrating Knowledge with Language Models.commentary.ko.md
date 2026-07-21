---
source_file: "067_Dense Passage Retrieval and Retrieval-Augmented Generation Integrating Knowledge with Language Models.md"
translation_file: "067_Dense Passage Retrieval and Retrieval-Augmented Generation Integrating Knowledge with Language Models.ko.md"
commentary_type: "해설"
source_stem: "067_Dense Passage Retrieval and Retrieval-Augmented Generation Integrating Knowledge with Language Models"
order_prefix: "067"
topic: "DPR와 RAG"
period: "2020년"
tags:
  - LLM
  - NLP
  - AI-history
  - commentary
---

<!-- Obsidian note: keep frontmatter valid, replace placeholders, and use wikilinks only for confirmed or intentionally planned notes. -->

# DPR와 RAG 해설

## 1. 한눈에 보기

- 핵심 주제: 외부 문서에서 관련 passage를 찾는 Dense Passage Retrieval(DPR)과, 그 검색 결과를 생성 모델의 비모수적 기억으로 사용하는 Retrieval-Augmented Generation(RAG)
- 등장 배경: 사전 학습 언어 모델의 지식이 매개변수와 학습 시점에 묶이고, BM25 같은 희소 검색은 질문과 문서의 어휘가 다를 때 놓치는 문제가 있었다.
- 가장 중요한 아이디어: DPR는 질문과 passage를 별도로 벡터화해 대규모 색인을 검색하고, RAG는 DPR 계열 검색기와 BART 생성기를 잠재 문서 확률로 결합했다.
- 이후 LLM/NLP에 남긴 영향: 검색과 생성을 하나의 지식 집약적 과제 안에서 연결하는 연구 틀을 제시했으며, 후대의 실무형 RAG가 발전할 출발점 가운데 하나가 되었다.

> 이 문서는 `067_Dense Passage Retrieval and Retrieval-Augmented Generation Integrating Knowledge with Language Models.md`의 번역문을 이해하기 위한 해설입니다. 원문을 반복하기보다 개념적 배경, 역사적 의미, 현대적 연결점을 정리합니다.

## 2. 핵심 요약

DPR와 RAG는 같은 2020년에 발표되고 구성 요소를 공유하지만, 서로 다른 논문이 제안한 서로 다른 시스템이다. DPR 논문의 목표는 대규모 말뭉치에서 답을 포함한 passage를 빠르게 찾는 것이며, 두 BERT 기반 인코더가 만든 질문·passage 벡터의 내적으로 순위를 정한다. passage 벡터는 미리 계산해 FAISS 색인에 넣고, 학습에서는 같은 미니배치의 다른 정답 passage와 BM25가 찾은 어려운 오답 passage를 음성 예제로 활용한다. RAG 논문은 DPR로 초기화한 검색기를 400M 매개변수의 BART-large encoder-decoder와 결합하여, 검색 문서를 관측되지 않은 잠재 변수로 두고 정답 문자열의 주변우도를 학습했다. RAG-Sequence는 한 문서를 전체 출력 시퀀스의 잠재 근거로 사용하고, RAG-Token은 토큰마다 서로 다른 문서에 걸쳐 확률을 주변화할 수 있다. 원 논문의 실험은 2018년 12월 Wikipedia 색인을 이용한 개방형 질의응답, MS MARCO 추상형 질의응답, Jeopardy 질문 생성, FEVER 사실 검증에 한정되었다. 오늘날의 문서 청킹, 임베딩 API, 벡터 데이터베이스, 재순위화, 인용 표시, 권한 관리까지 포함한 ‘RAG 스택’은 이 논문의 구조를 확장한 후대의 실무 범주다.

- 무엇을 다루는가: 의미 기반 passage 검색과 검색 조건부 텍스트 생성의 연결
- 어떤 문제를 해결하려 했는가: 매개변수에만 저장된 지식의 갱신·추적 어려움과 키워드 검색의 의미 불일치
- 어떤 방식이 새로웠는가: 단순한 bi-encoder를 강한 음성 예제로 학습한 DPR와, 문서를 잠재 변수로 삼아 검색기와 생성기를 최적화한 RAG
- 결과적으로 무엇을 바꾸었는가: 외부 텍스트 색인을 언어 모델의 비모수적 기억으로 다루는 재사용 가능한 연구 설계를 확립했다.

## 3. 역사적 배경

개방형 질의응답은 보통 거대한 문서 집합을 곧바로 읽지 않고, 먼저 소수의 passage를 찾은 다음 reader가 답 span을 추출하는 두 단계 구조를 사용했다. 이때 TF-IDF와 BM25는 빠르고 강력했지만, 질문과 정답 passage가 서로 다른 단어로 같은 뜻을 표현하면 검색 점수가 낮아질 수 있었다. 반대로 BERT와 GPT 계열의 사전 학습 모델은 많은 언어·사실 패턴을 매개변수에 담았지만, 학습이 끝난 뒤 그 기억을 고치거나 특정 예측이 어느 문서에서 왔는지 확인하기 어려웠다.

DPR 이전에도 ORQA와 REALM처럼 학습된 검색기를 사용하는 연구가 있었다. DPR 논문의 질문은 더 좁고 실증적이었다. 별도의 복잡한 역 cloze 사전 학습 없이, 이미 사전 학습된 BERT와 비교적 적은 질문–passage 쌍만으로도 순수 dense retriever가 BM25를 넘어설 수 있는가였다. RAG 논문은 그 다음 문제를 다뤘다. 검색 결과에서 답 span을 잘라 내는 데 그치지 않고, 비모수적 문서 기억과 모수적 seq2seq 기억을 결합해 여러 지식 집약적 생성·분류 과제를 하나의 방식으로 풀 수 있는가였다.

- 이전 접근법: TF-IDF/BM25 기반 검색 뒤 extractive reader를 붙이거나, 검색 없이 언어 모델의 매개변수 지식만 사용했다.
- 당시의 한계: 어휘 불일치, 학습 시점 이후 지식의 부재, 지식 수정의 높은 비용, 생성 결과의 근거 추적 어려움이 서로 다른 단계에서 나타났다.
- 이 주제가 필요했던 이유: 대규모 외부 말뭉치에 효율적으로 접근하면서도, 찾아온 텍스트를 답 생성에 실제로 활용하는 통합 방법이 필요했다.

## 4. 핵심 개념 해설

### 4.1 DPR의 bi-encoder

DPR는 질문 인코더와 passage 인코더라는 두 개의 독립적인 BERT-base 네트워크를 사용한다. 각 인코더는 입력의 `[CLS]` 표현을 같은 차원의 dense vector로 만들고, 질문 벡터와 passage 벡터의 내적이 클수록 관련성이 높다고 본다. 핵심 절충은 질문과 passage가 서로를 보며 cross-attention을 수행하지 않는다는 점이다. 표현력은 cross-encoder보다 제한되지만, 모든 passage 벡터를 오프라인에서 한 번 계산해 둘 수 있으므로 수천만 개 후보를 대상으로 최대 내적 탐색(Maximum Inner Product Search, MIPS)을 수행할 수 있다.

원 DPR 실험은 2018년 12월 영어 Wikipedia를 겹치지 않는 100단어 블록으로 나누어 약 2,100만 passage를 만들었다. passage 벡터는 FAISS에 미리 색인하고, 실행 시에는 새 질문만 벡터화하여 가까운 passage를 찾았다. 따라서 DPR 논문에서의 ‘end-to-end’ 질의응답 시스템은 검색기 자체와 별도로, 상위 passage를 cross-attention으로 재평가하고 답 span을 추출하는 BERT reader까지 포함한 파이프라인을 가리킨다. DPR 자체는 생성 모델이 아니다.

### 4.2 hard negative와 색인

Dense retrieval의 학습 신호는 정답 passage를 가깝게, 오답 passage를 멀게 만드는 대조 목적에서 온다. 무작위 오답만 쓰면 질문과 너무 달라 쉽게 구별되므로 학습 신호가 약하다. DPR의 최종 설정은 미니배치 안에서 다른 질문의 정답 passage를 in-batch negative로 재사용하고, 각 질문에 대해 BM25 상위권이지만 답 문자열은 포함하지 않는 passage 하나를 hard negative로 더했다. 이것은 키워드는 비슷하지만 답은 아닌 후보를 구분하도록 만드는 실용적인 장치였다.

색인은 속도와 갱신 비용을 동시에 만든다. passage 인코더가 고정되어 있으면 passage 벡터를 한 번 계산한 뒤 질문만 빠르게 처리할 수 있다. 그러나 문서가 바뀌거나 passage 인코더를 다시 학습하면 해당 벡터를 재계산하고 색인을 다시 만들어야 한다. 원 논문에서도 dense 검색의 질과 질의 처리량은 강했지만, 2,100만 passage 임베딩 계산과 FAISS 색인 구축은 BM25 역색인보다 훨씬 비쌌다. 따라서 ‘dense가 sparse를 완전히 대체했다’기보다, 의미 매칭의 이득과 색인 비용 사이에 새로운 선택지를 제시했다고 이해하는 편이 정확하다.

### 4.3 RAG의 검색기·생성기와 두 주변화 방식

원 RAG의 검색기는 DPR의 bi-encoder로 초기화되며, 생성기는 GPT-2가 아니라 **BART-large**다. 질문과 검색 passage를 이어 붙인 입력을 BART가 받아 답을 생성한다. 학습 때 정답 문서 라벨을 직접 주는 대신, 상위 K개 검색 문서를 잠재 변수로 보고 각 문서의 검색 확률과 그 문서 조건부 생성 확률을 합쳐 목표 문자열의 확률을 높인다. 색인을 매번 다시 만드는 비용을 피하기 위해 원 실험에서는 document encoder와 Wikipedia 색인을 고정하고, query encoder와 BART generator만 미세 조정했다. 그러므로 ‘검색기와 생성기를 함께 학습했다’는 표현은 맞지만, 두 DPR 인코더와 색인까지 모두 계속 갱신했다는 뜻은 아니다.

RAG-Sequence는 문서 하나가 전체 출력 시퀀스를 설명한다고 놓고, 상위 문서 각각에서 계산한 시퀀스 확률을 문서 확률로 주변화한다. RAG-Token은 다음 토큰을 예측할 때마다 상위 문서별 확률을 주변화하므로, 한 출력 안에서 서로 다른 문서가 서로 다른 토큰에 더 큰 영향을 줄 수 있다. 이는 실행 중 매 토큰마다 새 검색 질의를 만들어 색인을 다시 검색한다는 뜻이 아니다. 두 방식 모두 입력으로 한 번 얻은 상위 K개 문서 집합을 사용하되, 잠재 문서를 합산하는 확률 모델의 단위가 시퀀스인지 토큰인지가 다르다.

## 5. 원문의 논리 구조

원문은 대략 다음 흐름으로 전개됩니다.

1. 매개변수에 고정된 언어 모델 지식과 키워드 기반 정보 검색의 한계를 문제로 제시한다.
2. DPR가 질문과 passage를 dense vector 공간에서 비교해 의미적 검색을 수행한다는 핵심 아이디어를 설명한다.
3. DPR의 dual-encoder·대조 학습·근사 최근접 탐색과 RAG의 retriever–generator 결합을 하나의 계보로 연결한다.
4. 개방형 질의응답에서 도메인별 응용, 최신 정보 접근, 사실성 향상으로 적용 범위를 넓혀 설명한다.
5. 검색 실패, 색인 비용, context 제한, 환각을 짚은 뒤 현대 RAG 시스템으로 이어진 유산을 정리한다.

이 흐름을 읽을 때는 ‘DPR가 검색을 해결했고 RAG가 그 위에 생성을 붙였다’는 큰 줄기와, 두 논문이 실제로 평가한 범위를 분리해야 한다. 특히 원문의 법률·의료·뉴스·조직 지식 응용과 실시간 업데이트 설명은 가능한 후대 응용 시나리오이지, 2020년 두 원 논문이 그런 배포 환경에서 검증했다는 뜻은 아니다.

## 6. 왜 중요한가

DPR의 중요성은 검색 후보 전체에 비싼 cross-attention을 적용하지 않고도, 사전 학습 언어 표현을 이용한 dense retrieval이 대규모 개방형 QA에서 강한 성능을 낼 수 있음을 단순한 구성으로 보인 데 있다. 원 논문에서 DPR는 SQuAD를 제외한 여러 데이터셋에서 BM25보다 높은 top-k 검색 정확도를 보였고, 더 나은 검색이 최종 QA 정확도 향상으로 이어짐을 확인했다. 다만 SQuAD처럼 질문과 원 passage의 어휘 중첩이 큰 조건에서는 BM25가 유리했으므로 결과는 ‘dense의 보편적 승리’가 아니었다.

RAG의 중요성은 retrieval을 생성 전의 고정된 전처리로만 두지 않고, 어떤 문서가 답 생성에 유용한지를 잠재 변수 목적을 통해 query encoder와 generator에 학습시킨 데 있다. 원 논문은 네 개의 개방형 QA 데이터셋뿐 아니라 MS MARCO 추상형 QA, Jeopardy 질문 생성, FEVER 사실 검증에서 같은 기본 구조를 미세 조정해 평가했다. 이로써 모수적 기억과 사람이 읽고 바꿀 수 있는 비모수적 텍스트 기억을 결합하는 일반 목적 설계가 연구 대상으로 자리 잡았다.

특히 중요한 점:

- DPR는 bi-encoder가 제공하는 사전 계산 가능성과 hard negative가 제공하는 판별력을 결합했다.
- RAG는 검색 문서 라벨이 없는 downstream 학습에서도 검색 문서를 잠재 변수로 다루는 생성 목적을 제시했다.
- 두 연구는 ‘더 큰 모델에 사실을 모두 외우게 하기’와 ‘외부 지식을 필요할 때 찾기’ 사이의 설계 공간을 구체화했다.

## 7. 현대 LLM과의 연결

현대의 RAG는 흔히 문서 수집·정제, 청킹, 임베딩, 벡터 또는 하이브리드 검색, 재순위화, 프롬프트 조립, LLM 생성, 인용·평가·권한 관리까지 포함하는 시스템 설계 전체를 뜻한다. 이 넓은 의미는 2020년 RAG 논문의 고유 모델명에서 출발했지만 동일하지 않다. 오늘날에는 검색기와 생성기를 end-to-end로 학습하지 않고, 독립된 임베딩 모델과 상용 LLM을 조합하는 경우도 ‘RAG’라고 부른다.

- 임베딩 검색과 벡터 데이터베이스: DPR의 passage 사전 계산과 MIPS 색인은 오늘날의 vector retrieval 구성과 직접 닿아 있다. 다만 현대 시스템은 cosine similarity, 다양한 임베딩 모델, 메타데이터 필터, sparse–dense hybrid 검색을 함께 쓸 수 있다.
- 재순위화와 context 구성: 빠른 bi-encoder가 넓게 후보를 찾고 cross-encoder가 좁게 재순위화하는 구조, passage를 선택해 LLM context에 넣는 구조가 널리 쓰인다. 검색 recall이 낮으면 생성기는 보지 못한 근거를 복구할 수 없다.
- 근거 있는 생성과 도구 사용: 외부 텍스트를 읽는 방식은 최신 정보, 사내 문서, 검색 도구를 LLM에 연결하는 기반이 되었다. 그러나 retrieval은 evidence access를 제공할 뿐, 답의 모든 문장이 그 evidence에 충실하다는 보증은 아니다.

## 8. 한계와 비판적 관점

원문은 DPR와 RAG가 최신 정보 접근과 source attribution을 자연스럽게 제공한다고 서술하지만, 2020년 실험은 고정된 2018년 12월 Wikipedia snapshot으로 수행됐다. 문서 기억을 교체할 수 있다는 구조적 장점은 분명하지만, 지속적 갱신의 정확성·삭제·충돌 해결·운영 지연까지 실험한 것은 아니다. 또 검색된 passage를 사람이 들여다볼 수 있다는 것과, 생성된 각 주장이 그 passage에 의해 충실하게 뒷받침된다는 것은 다른 문제다. 원 RAG는 자동 인용 형식이나 문장별 인용 정확도를 평가한 시스템이 아니었다.

- 기술적 한계: DPR는 passage 경계와 질문 분포에 민감하고, hard negative의 품질에 따라 학습이 달라진다. RAG는 검색 누락, 잘못된 passage, 생성기의 근거 무시가 연쇄적으로 최종 오류가 되는 복합 시스템이다.
- 이론적 한계: RAG-Sequence와 RAG-Token의 잠재 문서 확률은 어느 문장이 어느 근거에서 논리적으로 도출됐는지를 완전히 설명하지 않는다. 높은 retrieval score는 참·신뢰성·충분성을 뜻하지 않는다.
- 실용적 한계: dense 색인은 메모리와 재색인 비용이 크며, 실시간 서비스에서는 검색·재순위화·긴 context 처리로 지연 시간이 늘어난다. 비공개 자료에서는 접근 제어와 삭제 반영도 별도의 문제다.
- 오늘날 관점에서 다시 봐야 할 점: RAG가 환각을 ‘없앤다’거나 fine-tuning을 ‘대체한다’고 일반화할 수 없다. 과제에 따라 학습, 검색, 도구 호출, 구조화 데이터 접근을 함께 설계해야 하며 retriever와 generator를 각각 평가해야 한다.

또한 원문이 RAG generator를 ‘GPT-2 또는 유사 모델’로 설명한 부분은 원 논문과 다르다. 2020년 RAG 실험의 parametric memory는 BART-large encoder-decoder였고, DPR로 초기화한 query encoder만 생성 목적과 함께 조정했으며 document encoder와 색인은 고정했다. 이 구분은 오늘날의 임의의 LLM+검색 파이프라인을 원 RAG 아키텍처와 혼동하지 않기 위해 중요하다.

## 9. 용어 정리

| 용어 | 설명 |
|---|---|
| Dense Passage Retrieval (DPR) | 질문과 passage를 서로 다른 BERT 인코더로 벡터화하고 내적으로 관련 passage를 찾는 2020년 dense retriever |
| bi-encoder | 두 입력을 독립적으로 인코딩해 벡터를 미리 계산할 수 있게 하는 구조. 빠른 대규모 검색에 적합하지만 입력 쌍을 함께 보는 cross-encoder보다 상호작용 표현이 제한된다. |
| in-batch negative | 같은 미니배치에서 다른 질문의 정답 passage를 현재 질문의 음성 예제로 재사용하는 학습 방식 |
| hard negative | 질문과 표면적으로 비슷해 높은 점수를 받지만 정답은 아닌 passage. DPR에서는 BM25 상위 결과를 활용했다. |
| MIPS | Maximum Inner Product Search. 질문 벡터와 내적이 큰 passage 벡터를 대규모 색인에서 찾는 문제 |
| non-parametric memory | 모델 가중치 밖의 문서 색인처럼 내용을 직접 읽고 교체할 수 있는 기억 |
| RAG-Sequence | 하나의 잠재 문서가 전체 출력 시퀀스를 조건화한다고 두고 문서별 시퀀스 확률을 주변화하는 방식 |
| RAG-Token | 각 출력 토큰에서 상위 문서별 예측 확률을 주변화해 여러 문서의 영향을 토큰 단위로 결합하는 방식 |

## 10. 함께 보면 좋은 항목

- [[024_BM25 The Probabilistic Ranking Revolution in Information Retrieval]]
- [[050_SQuAD The Stanford Question Answering Dataset and Reading Comprehension Benchmark]]
- [[051_Neural Information Retrieval Semantic Search with Deep Learning]]
- [[057_BERT Bidirectional Pretraining Revolutionizes Language Understanding]]
- [[064_BERT for Information Retrieval Transformer-Based Ranking and Semantic Search]]
- [[066_GPT-3 and In-Context Learning Emergent Capabilities from Scale]]

이 항목들은 실제 원문 폴더에 존재하며, 희소 검색에서 신경 검색으로의 변화, BERT 기반 표현·재순위화, reader benchmark, 매개변수 지식에 의존하는 생성 모델이라는 DPR·RAG의 인접 맥락을 제공한다.

## 11. 읽고 생각해볼 질문

1. DPR가 cross-encoder보다 표현력은 제한되면서도 대규모 검색의 첫 단계에 적합한 이유는 무엇인가?
2. in-batch negative와 BM25 hard negative는 질문–passage 벡터 공간에 각각 어떤 학습 신호를 제공하는가?
3. RAG-Sequence와 RAG-Token은 검색을 반복하는 횟수가 아니라 무엇을 주변화하는 단위에서 어떻게 다른가?
4. 검색된 passage를 표시할 수 있다는 사실만으로 생성 답변의 인용 충실성이 보장되지 않는 이유는 무엇인가?

## 12. 짧은 결론

DPR와 RAG는 하나의 단일 발명이라기보다, 2020년에 이어진 두 개의 보완적 연구 단계다. DPR는 BERT bi-encoder, in-batch negative, BM25 hard negative, FAISS 색인을 결합해 dense passage retrieval의 실용성을 보였고, RAG는 그 검색기를 BART 생성기와 잠재 변수 목적 안에서 연결해 외부 텍스트 기억을 사용하는 범용 생성 모델을 제시했다. 이후 ‘RAG’라는 말은 훨씬 넓은 산업적 파이프라인을 가리키게 되었지만, 원 연구의 핵심 교훈은 여전히 유효하다. 검색 품질, 생성의 근거 사용, 색인의 갱신 가능성은 서로 연결되어 있으면서도 별도로 검증해야 하는 문제다.
