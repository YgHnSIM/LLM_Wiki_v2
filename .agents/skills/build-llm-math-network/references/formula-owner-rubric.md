# Formula Owner Rubric

Read this reference when assigning, splitting, merging, or validating a formula-family owner.

## Same family or separate family

Treat occurrences as one family when they answer the same mathematical question under compatible assumptions and differ only in notation, batching, or a direct algebraic rewrite. Split them when the output meaning, normalization domain, optimization target, statistical assumptions, or failure conditions differ.

Do not merge probability, logit, similarity, margin, reward, and ranking score merely because each is a scalar. Do not treat a mathematical resemblance as evidence of historical influence.

## Existing page or new concept

Strengthen an existing concept when its central question already owns the definition and most downstream use. Create a new concept only when the prerequisite needs its own complete example and derivation, is reused across multiple paths, or is an indispensable junction in the v1 calculation.

Keep a short local definition in every consumer. A link never replaces the consumer page’s explanation of current symbols, shapes, inputs, outputs, assumptions, and limits.

## Owner selection

A canonical owner must:

1. Ask one stable, independently teachable question.
2. Be more foundational than its main consumers.
3. Support a complete small example and general form.
4. Have evidence for mathematical claims and any historical lineage.
5. Avoid circular prerequisites.
6. Remain useful outside one source paper or model variant.

Record exactly one owner path and ID in `docs/llm-math-network.yml`. Use `coverage: ready` only after all content and repository gates pass.

## Central formula gate

Confirm that the owner explains:

- the question and required properties;
- assumptions and definitions;
- every symbol, index, type, shape, range, unit, and value source;
- why every term and operation exists;
- each derivation step and the rule used;
- a hand-reproducible numerical example and intermediate values;
- the result in the original problem’s language;
- definitions and mathematical or statistical consequences;
- modeling, approximation, engineering, and historical choices;
- at least one alternative and the property it trades away;
- undefined inputs, numerical failures, and assumption violations;
- the four lineage layers: mathematics, statistics or numerical computing, machine learning, and LLM use.

## Consumer-page gate

Each occurrence page must retain:

- its local question;
- all newly introduced notation and shapes;
- how the formula’s output is consumed there;
- model- or experiment-specific assumptions;
- a resolved link to the owner.

Do not copy the full derivation unless the local argument changes it materially.

## Verification

Recompute every teaching example. Check matrix compatibility and outputs after each operation. Confirm probability sums and normalized axes. For central gradient claims, compare the analytic result with a small finite-difference estimate when practical. Test zero, tied, very large, or very small values when they expose a boundary.

Verify evidence IDs and locators. Separate a theorem or algebraic derivation from claims about invention, adoption, influence, or later convention. Inspect KaTeX and mobile overflow for representative long formulas and symbol tables.
