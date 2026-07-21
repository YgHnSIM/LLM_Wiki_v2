# 소스 번호 체계

## 기준

공개 위키의 정규 source 번호는 Michael Brenndoerfer의 [*A History of Language AI* 책 목차](https://mbrenndoerfer.com/books/history-of-language-ai)를 기준으로 한다. 이 목차는 001–110의 110장을 제시한다. 반면 [History of Language AI 카테고리](https://mbrenndoerfer.com/writing/categories/history-of-language-ai)와 `C:\Vault\ObsidianVault\Assets\LLM_sources`에는 109개 게시물만 있다.

차이는 공식 047 **Attention Mechanism (2015)**이다. 목차의 [연결 주소](https://mbrenndoerfer.com/writing/attention-mechanism-neural-machine-translation-dynamic-alignment)는 2026-07-21 현재 `Content Not Found`를 반환하며 카테고리에도 없다. 카테고리는 게시일 역순 목록이므로 공식 장 번호의 기준으로 사용하지 않는다.

## 두 식별자

| 식별자 | 사용하는 곳 | 변경 원칙 |
| --- | --- | --- |
| 로컬 수집 접두사 | `/lt NNN`, `source:* -- NNN`, 외부 원문·`LLM_ko`·`raw/` 파일명, `raw-artifacts.yml`의 `order_prefix` | 수집 이력과 raw 불변성을 위해 유지 |
| 공식 장 번호 | `wiki/sources/NNN_*.md`, `source.NNN`, 위키 링크, 사이트 URL, ingest 커밋 번호 | 공식 책 목차와 일치 |

공식 장 번호는 파일마다 새로 부여하는 전역 순번이 아니라 하나의 source 묶음을 식별한다. 같은 장의 검증 노트·번역 reader·해설 reader는 같은 공식 번호를 공유하고 역할과 URL suffix로 구분한다. 반대로 `page_type: reference`인 비번호 참고 자료에는 목록 위치를 번호처럼 부여하지 않고 `참고`라고 표시한다.

매핑은 다음과 같다.

```text
local 001–046  → canonical 001–046
local 047–109  → canonical 048–110
canonical 047  → local 없음
```

대표 예시는 다음과 같다.

| 로컬 수집 접두사 | 공식 장 번호 | 문서 |
| ---: | ---: | --- |
| 046 | 046 | Memory Networks |
| 047 | 048 | Residual Connections |
| 072 | 073 | Multi-Vector Retrievers / ColBERT |
| 077 | 078 | Chinchilla Scaling Laws |
| 078 | 079 | HELM |
| 109 | 110 | Specialized LLMs for Low-Resource Languages |

## 운영 규칙

1. 공식 047은 결손 장으로 남기며 다른 게시물이나 참고 자료에 재사용하지 않는다.
2. `raw/` 파일, raw 레지스트리 경로, 해시와 `order_prefix`는 번호 교정 때문에 수정·이름 변경·복제하지 않는다.
3. `source:status`, `source:copy`, `source:ready`의 입력은 로컬 수집 접두사다. 도구는 매핑된 공식 source ID와 파일명을 찾아야 한다.
4. source 페이지는 연결한 정규 raw artifact의 로컬 접두사에서 공식 번호를 계산한다. 파일명 접두사와 `source.NNN`이 그 번호와 다르면 lint가 실패해야 한다.
5. 2026-07-21 교정 전 공개됐던 047–077 경로는 새 048–078 경로로 정적 리다이렉트해 기존 북마크를 보존한다.
6. 정규 로컬 072는 공식 073 ColBERT이며, 공식 103 MoE는 로컬 102 원문을 새로 번역·검토한 raw 쌍으로 처리한다. 과거 072에 잘못 배정된 중복 MoE raw와 레지스트리 항목은 제거했다.
7. 사이트의 숫자 badge는 `page_type: source`의 공식 번호에만 사용한다. 비번호 reference를 source 목록에 함께 보여 줄 때는 번호 source 뒤에 배치하고 `참고` badge를 사용한다. 배열 위치를 `001` 같은 fallback 번호로 바꾸지 않는다.

공식 목차가 바뀌면 먼저 외부 원문 목록과 URL을 다시 전수 대조한다. 이미 공개된 번호를 자동으로 당기거나 raw를 바꾸지 말고, 변경 근거와 호환성 계획을 `wiki/log.md`에 기록한 뒤 매핑 코드·lint·문서를 함께 갱신한다.
