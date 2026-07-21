---
source_file: "074_DALL·E Text-to-Image Generation with Transformer Architectures.md"
translation_file: "074_DALL·E Text-to-Image Generation with Transformer Architectures.ko.md"
commentary_type: "해설"
source_stem: "074_DALL·E Text-to-Image Generation with Transformer Architectures"
order_prefix: "074"
topic: "DALL·E와 이산 이미지 토큰 기반 텍스트-이미지 생성"
period: "2020–2021"
tags:
  - multimodal-AI
  - text-to-image
  - AI-history
  - commentary
---

# DALL·E와 이산 이미지 토큰 해설

## 1. 한눈에 보기

- 핵심 주제: 256×256 이미지를 32×32 이산 token grid로 압축하고, 텍스트 256 token과 이미지 1,024 token을 하나의 자기회귀 sequence로 모델링한 120억 parameter DALL·E
- 등장 배경: 소규모 고정 데이터셋·과제별 GAN에 집중하던 텍스트-이미지 연구에 대규모 인터넷 image–text pair와 sparse Transformer scaling을 적용한 시도
- 가장 중요한 아이디어: pixel을 그대로 예측하지 않고 dVAE codebook으로 시각 표현을 이산화해 텍스트와 이미지에 같은 next-token modeling 틀을 사용한 것
- 반드시 기억할 제한: 정성 예시는 성공 표본이고 다수 결과는 512개 후보를 별도 contrastive model로 재순위화했다. 변수 결합·전문 영역·고주파 세부의 실패가 원 논문에 함께 기록돼 있다.

> 이 문서는 2025년 6월 29일 발행된 후대 회고 글 `074_DALL·E Text-to-Image Generation with Transformer Architectures.md`의 번역문을 이해하기 위한 해설입니다. 원문이 기술 구조, 제품 활용, 후대 영향과 인간 창의성에 관한 평가를 한 흐름에 섞은 부분을 2021년 DALL·E 논문과 OpenAI 공개 글의 직접 범위로 다시 나눕니다.

## 2. 핵심 요약

DALL·E의 원 논문 제목은 *Zero-Shot Text-to-Image Generation*이다. 연구진은 인터넷에서 모은 2억 5천만 image–text pair로 120억 parameter sparse Transformer를 학습했다. 첫 단계의 discrete VAE(dVAE)는 256×256 RGB image를 8,192개 codeword 가운데 하나를 택하는 32×32 grid, 즉 1,024개 image token으로 압축한다. 둘째 단계의 decoder-only Transformer는 최대 256개 BPE text token과 1,024개 image token을 붙여 단일 stream의 joint distribution을 자기회귀적으로 학습한다.

이 구조를 단순히 “GPT-3에 이미지 디코더를 붙였다”고 이해하면 안 된다. OpenAI 소개 글은 DALL·E를 120억 parameter GPT-3 version이라고 설명했지만, 원 논문의 기계 판독 가능한 구조는 별도의 text encoder와 image decoder가 아니라 **고정된 dVAE와 64-layer decoder-only sparse Transformer**다. GPT-3의 가중치를 가져와 전이했다는 기록도 없다.

- 무엇을 직접 입증했는가: MS-COCO caption을 별도 fine-tuning 없이 사용한 zero-shot 비교, 대규모 joint token modeling, 정성적 개념 조합과 제한적인 image-to-image translation
- 어떤 수치가 핵심인가: 250M pairs, 12B parameters, text vocabulary 16,384, image codebook 8,192, 최대 1,280 token context
- 무엇이 별도 system인가: 생성 후보의 caption 적합도를 평가해 재순위화하는 pretrained contrastive model, 곧 같은 시기 공개된 CLIP 계열 model
- 무엇을 입증하지 않았는가: 인간과 동등한 창의성, 일반적인 물리·인과 이해, 실제 산업 생산성, 모든 후속 diffusion model로의 직접 계보

## 3. 역사적 배경

텍스트 조건 이미지 생성은 DALL·E가 처음 시작한 분야가 아니다. Mansimov 등은 2015년에 recurrent DRAW 계열 생성 모델을 image caption에 조건화했고, Reed 등은 2016년에 text embedding을 조건으로 쓰는 GAN을 제안했다. StackGAN·AttnGAN·DM-GAN·DF-GAN은 해상도와 text–image alignment를 개선했다. DALL·E 논문 자체도 이 선행 연구를 출발점으로 둔다.

다른 한편 VQ-VAE와 VQ-VAE-2는 연속 image를 이산 code로 압축할 수 있음을 보였고, Image GPT는 pixel sequence에 autoregressive Transformer를 적용했다. DALL·E의 역사적 위치는 텍스트-이미지 생성을 발명한 데 있지 않다. **이산 시각 code와 대규모 caption data, sparse Transformer를 결합해 하나의 token stream으로 확장한 규모와 단순화**에 있다.

OpenAI는 2021년 1월 5일 연구 소개 글을 공개했고, 논문 초판은 2021년 2월 24일 제출된 뒤 ICML 2021에 실렸다. 당시 공개는 선별된 연구 결과와 dVAE code를 중심으로 했으며 120억 parameter 생성 model 전체가 누구나 쓰는 제품 API나 공개 weight로 제공된 것은 아니었다. 그러므로 원문의 마케팅·교육·디자인 활용 문단은 검증된 사용자 연구가 아니라 가능한 응용을 열거한 전망으로 읽어야 한다. 또한 2021년 연구와 2025년 회고 글의 평가를 같은 시점의 기록처럼 섞지 않아야 한다.

## 4. 핵심 개념 해설

### 4.1 2단계 학습과 visual codebook

Pixel 256×256×3을 그대로 sequence로 펼치면 196,608개 channel value를 다뤄야 한다. Stage 1 dVAE는 이를 32×32 grid로 바꾸어 context 길이를 192분의 1로 줄인다. Grid의 각 위치는 8,192개 codebook 항목 가운데 하나를 고르므로, **8,192는 한 이미지의 token 수가 아니라 각 위치가 선택할 수 있는 vocabulary 크기**다. 한 이미지의 Transformer 입력은 1,024개 image token이다.

압축은 계산을 줄이는 대신 세부를 버린다. 원 논문 Figure 1은 털, 글자, 가는 선처럼 고주파 정보가 손실되거나 왜곡될 수 있음을 명시한다. Table·Figure 평가에서 image를 조금 blur하면 DALL·E의 FID 상대 성능이 좋아진다는 결과도 이 trade-off와 연결된다. “압축된 token이 pixel을 완전히 보존한다”는 해석은 맞지 않는다.

### 4.2 텍스트와 이미지의 단일 자기회귀 stream

Stage 2는 lowercase caption을 최대 256개 BPE token, vocabulary 16,384로 부호화하고 그 뒤에 1,024개 image token을 붙인다. 120억 parameter sparse Transformer의 64개 self-attention layer는 text 구간에 causal mask를, image 구간에 row·column·convolutional sparse mask를 사용한다. 각 image token은 모든 text token을 볼 수 있다.

목표는 두 modality의 token을 모두 maximum likelihood로 예측하는 것이다. 다만 연구 목적이 image modeling에 있었기 때문에 batch 안의 text·image cross-entropy를 각각 정규화한 뒤 text loss에는 1/8, image loss에는 7/8을 곱했다. 같은 sequence 안에 있다는 사실이 두 modality의 loss와 vocabulary가 동일하다는 뜻은 아니다.

원문이 말한 “text encoder 뒤 image decoder”는 일반적인 encoder–decoder Transformer로 오해하기 쉽다. 실제로는 dVAE encoder/decoder가 image와 discrete code를 왕복하고, 별도의 decoder-only Transformer가 text·image token의 joint prior를 모델링한다.

논문 부록이 보고한 stage 2의 훈련 장부도 규모를 구체화한다. 연구진은 16GB V100 GPU 1,024개, 전체 batch size 1,024, 430,000 update를 사용했다. 따라서 “큰 Transformer”라는 말에는 parameter 수뿐 아니라 이 계산 예산과 후보 sampling·재순위화 비용도 포함된다.

### 4.3 생성, CLIP 재순위화와 평가

Transformer는 caption마다 여러 image-token sequence를 sampling한다. 논문의 대표 비교 sample은 512개 후보 가운데 pretrained contrastive model이 caption과 잘 맞는다고 평가한 최상위 하나였고, OpenAI interactive demo는 상위 32개를 보여 주었다. 이는 사람이 직접 고른 cherry-picking과는 다르지만, 단일 sample의 능력과 **best-of-512 search system**의 능력을 구분해야 한다.

MS-COCO human comparison에서 DALL·E sample은 DF-GAN보다 사실적으로 보인다는 다수표를 90.0%, caption과 더 잘 맞는다는 다수표를 93.3% 받았다. 그러나 이 결과는 MS-COCO caption, 특정 비교 model, contrastive reranking과 평가 protocol에 묶여 있다. CUB 전문 bird distribution에서는 leading prior approach보다 FID가 약 40 point 나빴다. “모든 image domain에서 기존 model을 이겼다”는 결론은 나오지 않는다.

원문의 “초밥으로 만든 고양이”는 DALL·E 논문의 대표 prompt가 아니다. 논문에는 accordion으로 만든 tapir, sweater를 입은 hedgehog 같은 사례가 제시된다. 더구나 2억 5천만 쌍의 전체 훈련 data가 공개되지 않았으므로 특정 조합이 학습 중 한 번도 없었다고 단정할 수도 없다. Zero-shot은 평가 dataset에 맞춘 별도 fine-tuning이 없었다는 뜻으로 좁혀 읽어야 한다.

## 5. 원문의 논리 구조

원문은 다음 순서로 주장을 확장한다.

1. 2021년 DALL·E를 Transformer 기반 대규모 텍스트-이미지 전환점으로 소개한다.
2. GAN·VAE와 언어 모델 사이의 단절을 문제로 설정한다.
3. dVAE와 120억 parameter Transformer의 2단계 해법을 설명한다.
4. 조합 prompt 예시를 일반적인 compositional understanding으로 해석한다.
5. 창작·마케팅·교육·디자인의 활용 가능성과 후속 model 영향으로 범위를 넓힌다.
6. 공간·문자·수량·물리·편향 한계를 열거한다.
7. DALL·E 2·Stable Diffusion·GPT-4까지 이어지는 유산으로 마무리한다.

읽을 때 가장 중요한 경계는 3번과 4번 사이, 그리고 4번과 5번 사이다. 원 논문은 기술 구조와 특정 evaluation을 직접 제시하지만, 예시 몇 장에서 일반적인 ‘이해’를 확정하거나 실제 직업·제품 효과를 측정하지는 않았다. 후대 계보도 각 후속 연구의 architecture와 citation을 따로 확인해야 한다.

## 6. 왜 중요한가

DALL·E는 image generation을 language-like token prediction으로 바꾸는 설계가 큰 규모에서도 작동할 수 있음을 보여 주었다. 이는 modality가 다르더라도 연속 신호를 이산 code로 바꾸면 Transformer의 sequence modeling 도구를 재사용할 수 있다는 강한 사례였다.

또한 model scale·data scale·sampling search가 함께 결과를 만든다는 점을 드러냈다. 120억 parameter만이 아니라 250M pair, dVAE compression, sparse attention, CLIP 계열 reranking이 한 system을 이룬다. 이 장부를 나누면 “큰 language model 하나가 곧바로 이미지를 이해해 그렸다”는 축약을 피할 수 있다.

정성 sample만이 아니라 MS-COCO·CUB, FID·IS, human preference와 overlap 제거 결과를 함께 제시한 점도 중요하다. 다만 평가 metric은 DALL·E가 새로 만든 표준이 아니라 이미 있던 image generation metric과 사람 비교 protocol이다.

## 7. 현대 멀티모달 AI와의 연결

CLIP은 DALL·E와 같은 날 소개됐지만 목적이 다르다. CLIP은 4억 image–text pair로 contrastive representation을 학습해 image와 text의 alignment score를 제공했고, DALL·E는 이와 같은 contrastive model을 생성 후보 재순위화에 사용했다. 생성기와 판별·검색용 representation model을 하나로 합치지 않는다.

DALL·E 2 논문은 2022년 4월 13일 공개됐다. 2021년 1월 5일 DALL·E 발표에서 약 15개월 뒤이므로 “1년 안”보다 “이듬해”가 정확하다. DALL·E 2는 DALL·E 1의 dVAE-token autoregression을 그대로 확대한 model이 아니라, text에서 CLIP image latent를 만드는 prior와 그 latent에서 image를 만드는 diffusion decoder를 결합한 unCLIP 계열이다. 이름과 연구 목표는 이어지지만 핵심 생성 representation과 decoder가 바뀌었다.

Stable Diffusion도 latent 공간에서 diffusion을 수행하는 별도 연구 계보다. Code와 weight가 공개됐지만 CreativeML Open RAIL-M의 사용 제한이 있으므로, 무조건적인 “open source”보다 공개 가중치(open-weight) model이라고 구체화하는 편이 안전하다. DALL·E가 ‘압축된 visual representation에서 text-conditioned generation’의 가능성을 강하게 보여 준 것은 맞지만, Stable Diffusion이 DALL·E 1 아키텍처를 직접 계승했다는 결론은 각각의 논문만으로 나오지 않는다.

현대 multimodal language model과의 연결도 같은 방식으로 읽는다. Text와 image를 token 또는 embedding으로 공동 처리한다는 공통 문제는 이어지지만, image를 생성하는 decoder-only prior와 image를 입력으로 이해하는 vision-language encoder·LLM connector는 목적·학습 신호·출력이 다르다. 특히 2023년 처음 공개된 GPT-4의 시각 기능은 image 입력을 이해해 text로 답하는 형태였지, 모든 modality를 생성하는 system이라는 뜻은 아니었다.

## 8. 한계와 비판적 관점

- **조합 예시의 신뢰도:** 논문은 distinct concept 조합이 “varying degrees of reliability”로 작동한다고 썼고, hedgehog–dog prompt에서 속성 binding이 자주 틀렸다고 보고했다.
- **문자 생성:** 원 DALL·E는 일부 짧은 word를 그릴 수 있었지만, dVAE 압축과 visual pattern 학습 때문에 일반적인 정확한 spelling 능력을 입증하지 않았다.
- **전문 영역 일반화:** CUB FID가 크게 나빴으므로 broad internet data의 zero-shot 결과를 모든 전문 domain으로 확대할 수 없다.
- **후보 선택 비용:** 많은 대표 결과가 512개 생성 뒤 reranking한 결과다. 한 번의 sampling 품질, 계산 비용과 최종 top sample 품질은 다른 지표다.
- **평가 겹침:** 학습 data에는 MS-COCO validation image 약 21%, CUB image 약 12%와 가까운 image가 있었지만 caption은 포함하지 않았다. 제거 뒤 metric의 유의한 변화는 없었다고 보고했으나 모든 의미·구도 중복이 사라졌다는 보증은 아니다.
- **학습 data 투명성:** 논문은 250M pair, Conceptual Captions와 filtered YFCC100M 포함을 밝혔지만 전체 source·license·동의·편향 구성을 공개하지 않았다.
- **data augmentation 주장:** 훈련에는 image의 random crop·resize와 caption의 10% BPE dropout이 쓰였다. 그러나 이 조작들이 prompt 표현·style·구성 일반화를 각각 만들었다는 인과를 확정하는 ablation은 제시되지 않았다.
- **훈련 비용과 공개 범위:** Stage 2는 16GB V100 1,024개로 430,000 update를 수행했다. 전체 12B Transformer weight는 공개되지 않았고 공개 repository는 dVAE 부분에 한정됐다.
- **응용과 사회 영향:** 2021년 연구는 마케팅·교육·디자인 생산성, 직업 변화나 소유권 효과를 사용자 연구로 측정하지 않았다. OpenAI도 이러한 사회적 영향을 향후 분석할 문제로 남겼다.
- **창의성 표현:** 새 조합을 생성했다는 사실은 중요하지만, ‘인간과 같은 창의성’이나 의도·이해의 존재를 판정하는 실험은 아니다.

## 9. 용어 정리

- **DALL·E:** 텍스트와 dVAE image token의 joint distribution을 학습한 2021년 OpenAI의 12B autoregressive Transformer system
- **dVAE:** RGB image를 discrete code grid로 압축하고 다시 image로 복원하는 discrete variational autoencoder
- **codebook:** 각 image-grid 위치가 선택할 수 있는 이산 vector 목록. DALL·E의 크기는 8,192다.
- **image token:** 32×32 grid의 한 위치에서 선택된 codebook index. 한 image는 1,024 token이다.
- **BPE token:** Caption을 최대 256개 단위로 나누는 subword token
- **joint stream:** Text token 뒤에 image token을 이어 붙인 최대 1,280개 token sequence
- **sparse attention:** 모든 image position 쌍을 보지 않고 row·column·local convolution pattern으로 연결해 attention 비용을 줄이는 방식
- **zero-shot text-to-image:** MS-COCO 같은 평가 caption에 맞춘 별도 fine-tuning 없이 image를 생성하는 조건. 학습 중 관련 개념이나 유사 image를 전혀 보지 않았다는 뜻은 아니다.
- **contrastive reranking:** 여러 생성 후보와 caption의 alignment score를 계산해 상위 후보를 고르는 선택 단계
- **FID·IS:** 생성 image distribution과 feature statistics 또는 분류 예측을 이용하는 image generation 평가 metric. 사실성·prompt binding을 완전히 측정하지 않는다.

## 10. 함께 보면 좋은 항목

- [Transformer](/writing/transformer-attention-is-all-you-need): DALL·E가 text·image token prior에 사용한 sequence architecture
- [GPT-3](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale): Decoder-only scaling의 비교 배경. DALL·E가 GPT-3 weight를 그대로 사용했다는 뜻은 아님
- [자기회귀 생성](/writing/autoregressive-generation-gpt-text-generation): 앞선 token을 조건으로 다음 image token을 sampling하는 절차
- [CLIP 연구](https://proceedings.mlr.press/v139/radford21a.html): DALL·E 후보 재순위화와 구분해야 하는 contrastive representation model
- [DALL·E 원 논문](https://proceedings.mlr.press/v139/ramesh21a.html): 2단계 구조·학습·평가·overlap 분석의 1차 근거
- [DALL·E 2](https://arxiv.org/abs/2204.06125): CLIP latent prior와 diffusion decoder로 바뀐 후속 architecture
- [Stable Diffusion](/writing/stable-diffusion-latent-diffusion-text-to-image-generation): latent diffusion 계열과 DALL·E 1의 공통점·차이 확인

## 11. 읽고 생각해볼 질문

1. 8,192개 image vocabulary와 한 image의 1,024개 token을 혼동하면 architecture를 어떻게 잘못 설명하게 되는가?
2. dVAE의 192배 context 압축은 계산 효율과 고주파 세부 사이에 어떤 trade-off를 만드는가?
3. 별도 text encoder–image decoder 설명과 실제 decoder-only joint stream은 attention 경로가 어떻게 다른가?
4. Best-of-512 CLIP reranking 결과를 단일 sample 성능으로 읽으면 어떤 비용과 선택 효과가 사라지는가?
5. MS-COCO의 강한 human preference와 CUB의 낮은 FID는 zero-shot 일반화 범위를 어떻게 제한하는가?
6. DALL·E 1, DALL·E 2와 Stable Diffusion을 하나의 직선 계보로 묶기 전에 어떤 representation·objective·decoder 차이를 확인해야 하는가?

## 12. 짧은 결론

DALL·E의 핵심은 “언어 모델이 그림도 그렸다”는 표어보다 구체적이다. 256×256 image를 1,024개 discrete token으로 압축하고, 최대 256개 text token과 연결해 12B sparse Transformer가 joint sequence를 예측하게 했다. 이 설계는 250M image–text pair와 contrastive reranking을 결합해 zero-shot MS-COCO에서 강한 결과와 새로운 조합 sample을 만들었다.

동시에 원 논문은 compression detail loss, variable binding 실패, specialized CUB domain의 열세와 data overlap을 기록했다. 따라서 DALL·E를 정확히 이해하려면 생성 model, visual tokenizer, 후보 search, evaluation과 후대 diffusion architecture를 분리해야 한다. 그 구분이 이 연구의 실제 기술적 전환을 과장 없이 보존한다.
