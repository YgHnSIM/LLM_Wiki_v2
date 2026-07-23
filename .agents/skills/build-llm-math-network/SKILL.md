---
name: build-llm-math-network
description: Plan, resume, audit, implement, and validate the LLM Wiki v2 “LLM을 만든 수학” hub and its prerequisite mathematics concept network. Use in this repository when requests mention “LLM을 만든 수학”, LLM 수학 문서망, 수식 소유권, formula families or owners, prerequisite mathematics paths, math-network batches, or continuing and validating this initiative.
---

# Build LLM Math Network

Work on one dependency-complete batch at a time. Treat the repository plan and merged ledger as the durable handoff between sessions.

## Load the current contract

1. Read `AGENTS.md`.
2. Read `docs/llm-math-network-plan.md` and `docs/llm-math-network.yml`.
3. Read `docs/foundational-learning-workflow.md` and `docs/learning-structure-style-guide.md`.
4. Read `references/formula-owner-rubric.md` before assigning or changing an owner.
5. Inspect `git status --short --branch`.
6. Run `npm run math:status` and `npm run math:check`.

Preserve unrelated changes and never edit `raw/`. The exact generic command `하던 작업 계속 진행` remains the source-ingestion trigger unless the user explicitly names this skill or the math-network initiative.

## Select the mode and resume point

Classify the request as `plan`, `audit`, `resume`, `implement`, or `validate`. Use `docs/llm-math-network.yml` as the sole state, batch, and formula-owner registry. Do not reconstruct completion from memory.

For implementation, use `initiative.current_batch` and `initiative.next_action`. Select only one dependency-complete batch. The roadmap may schedule an unmet prerequisite in the same or an earlier non-deferred batch, but the active batch is runnable only when each prerequisite is `established`, `ready`, or included in that active batch. An earlier planned batch alone does not satisfy it.

If `current_batch` is null with no blockers, treat the current milestone as complete and do not activate a deferred extension merely to keep working. If it is null with planned work, require the blockers to explain the pause. Ask the user only when a missing choice materially changes the learning path, safety boundary, or project scope.

## Acquire and assign owners

Read every selected owner, prerequisite, downstream page, evidence record, and relevant source completely. Group formulas by the mathematical question they answer, not by notation alone.

For each family:

1. Prefer strengthening an existing `concept`.
2. Create a new `concept` only for an independently teachable and reused question or a necessary learning-path junction.
3. Assign exactly one canonical owner.
4. Keep local notation, shape, role, assumptions, and limits in each occurrence page.
5. Record the owner, prerequisites, downstream pages, rationale, coverage, and batch in the ledger.
6. Reject duplicate owners, prerequisite cycles, new page types, a mathematics folder, and mechanical reciprocal links.

## Implement one batch

Before content edits, mark the batch `in_progress`, update owner decisions, and run `npm run math:check`.

Implement in prerequisite order:

1. Create or strengthen canonical owner pages.
2. Add local explanations to occurrence pages.
3. Extend only completed paths in the hub.
4. Add or update evidence, locators, tags, and curated directional links.
5. Update `overview.md` and `log.md`; use `sync:index` for generated index content.
6. Persist exact progress, blockers, and the next executable action in the ledger.

For each central formula, cover the problem, required properties, assumptions, all symbols and shapes, every term and operation, stepwise derivation, reproducible numeric example, natural-language interpretation, consequences versus design choices, alternatives, failure conditions, and the four-layer origin path from mathematics through LLM use.

## Verify

Manually reproduce scalar calculations, shapes, probability constraints, and central gradients. Use finite differences when appropriate. Verify evidence and reject unsupported direct genealogy.

Run:

```powershell
npm run math:check
npm run learning:audit
npm run learning:audit:check
npm run sync:index
npm run lint:wiki
npm run verify
```

Inspect representative KaTeX and mobile rendering. Fix current-batch failures and rerun relevant checks. Mark a family `ready` and a batch `complete` only after every required manual and automated gate passes, then run `npm run math:check` again.

## Finalize and hand off

Update the ledger with completed coverage, batch stage, exact next action, blockers, owner and dependency changes. Record public wiki changes and material reusable-framework changes in `wiki/log.md`; do not log internal session chatter there.

Run `git diff --check`, inspect the final diff and status, and confirm `raw/` is unchanged. Report outcomes, checks, limitations, blockers, and the first next action. Follow `AGENTS.md` for Git boundaries.
