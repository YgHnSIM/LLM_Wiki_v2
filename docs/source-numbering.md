# 소스 번호 체계

## 기준

정규 source 번호는 Michael Brenndoerfer의 [*A History of Language AI* 공식 책 목차](https://mbrenndoerfer.com/books/history-of-language-ai)를 기준으로 한다. 목차는 001–110의 110장을 제시하지만, [History of Language AI 카테고리](https://mbrenndoerfer.com/writing/categories/history-of-language-ai)와 로컬 원문 폴더에는 109개 게시물만 있다.

Upstream 결손은 공식 047 **Attention Mechanism (2015)**이다. 목차의 [연결 주소](https://mbrenndoerfer.com/writing/attention-mechanism-neural-machine-translation-dynamic-alignment)는 2026-07-23 현재 본문을 반환하지 않으며 카테고리에도 없다. 2026-07-23 이 번호는 Bahdanau 2015·Luong 2015·Vaswani 2017의 1차 문헌을 토대로 위키가 새로 쓴 편집부 재구성으로 공개했다. 원문이 새로 발견된 것처럼 보이지 않도록 upstream 결손과 공개 대체물의 성격을 `wiki/meta/source-gaps.yml`에 함께 기록한다.

```text
001–046  원문 있음
047      upstream 원문 없음 · 편집부 재구성 공개
048–110  원문 있음
```

카테고리는 게시일 역순 목록이므로 번호 기준으로 사용하지 않는다.

## 하나의 번호

모든 처리 단계는 같은 공식 장 번호를 사용한다.

| 위치 | 번호 규칙 |
| --- | --- |
| `/lt NNN`, `source:* -- NNN` | 공식 장 번호 |
| 외부 원문과 `LLM_ko` 파일명 | 공식 장 번호 |
| `raw/` 파일명과 `raw-artifacts.yml`의 `order_prefix` | 공식 장 번호 |
| `wiki/sources/NNN_*.md`, `source.NNN` | 공식 장 번호 |
| 위키 링크, 사이트 URL, ingest 커밋 | 공식 장 번호 |

같은 장의 원문·번역·해설·검증 source는 하나의 번호를 공유하고 역할과 URL suffix로 구분한다. `page_type: reference`인 비번호 참고 자료에는 목록 위치를 장 번호처럼 부여하지 않고 `참고`라고 표시한다.

대표 예시는 다음과 같다.

| 공식 번호 | 문서 |
| ---: | --- |
| 046 | Memory Networks |
| 047 | Attention Mechanism — upstream 원문 결손, 편집부 재구성 |
| 048 | Residual Connections |
| 073 | Multi-Vector Retrievers / ColBERT |
| 079 | HELM |
| 103 | Mixture of Experts at Scale |
| 110 | Specialized LLMs for Low-Resource Languages |

## 운영 규칙

1. 공식 047은 upstream 원문·번역본을 만들지 않는다. `source.047`과 연결 raw는 `editorial-reconstruction`·`editorial-commentary`로 표시하고, 문서 첫머리와 `source-gaps.yml`에서 원문 번역이 아님을 밝힌다. 이 번호를 다른 게시물이나 일반 참고 자료에 재사용하지 않는다.
2. `source:status`, `source:copy`, `source:ready`는 upstream 원문 번역용 명령이다. `047`은 편집부 재구성이므로 이 흐름이 적용되지 않는다는 이유를 명시하고 실패하며 `110`은 정상 입력이어야 한다.
3. source 페이지의 파일명과 `source.NNN`, 연결한 raw 경로 접두사, raw 레지스트리의 `order_prefix`는 모두 같아야 한다. 047도 번호 일치 검사를 통과해야 하며 번역 역할·`원본 출처` 표기를 사용하면 안 된다.
4. 2026-07-21 번호 통합에서는 외부 원문 047–109를 048–110으로, 기존 raw 047–078과 102를 048–079와 103으로 이름만 이동했다. Raw 본문과 SHA-256은 바꾸지 않았다.
5. Raw 해설 본문에 남은 수집 당시 자기 파일명·접두사는 보존 내용이다. 현재 식별자의 기준은 raw 경로와 `raw-artifacts.yml`이며, 보존 본문을 번호 정규화 목적으로 다시 쓰지 않는다.
6. 과거 공개됐던 한 번호 낮은 047–078 source·translation·commentary URL과 비번호 MoE URL은 현재 raw 번호에서 추론하지 않고 명시적 정적 리다이렉트 장부로 보존한다.
7. 사이트의 숫자 badge는 정규 `source`의 공식 번호에만 사용한다. 비번호 `reference`는 번호 source 뒤에 두고 `참고` badge를 사용한다.

공식 목차가 바뀌면 먼저 외부 원문 목록과 URL을 다시 전수 대조한다. 이미 공개된 번호를 자동으로 이동하지 말고, 변경 근거·파일 마이그레이션·호환성 계획을 `wiki/log.md`에 기록한 뒤 번호 검사·workflow·redirect 테스트·문서를 함께 갱신한다.
