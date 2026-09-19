# Contributing an experiment

The best contribution makes one engineering idea easier to understand. Keep the setup approachable, the world state inspectable, and the repair tied to a specific mechanism.

## Local workflow

Use Node 22, run `npm ci`, then `npm run dev`. Before proposing a change, run `npm run check` and `npm run test:e2e` (install Playwright browsers first). A pull request should explain the behavior change, show evidence, and name any limitations.

## Add a scenario

1. Copy `docs/scenario-template.ts` into `src/scenarios/your-scenario.ts` and implement the metadata, simulation, and world-state assessment.
2. Add it to `scenarioRevisions` in `src/scenarios/index.ts`. The picker shows only the latest revision per ID; earlier revisions remain addressable.
3. Define the goal, original acceptance criteria, a baseline failure, and one repair. Both variants must start in the same initial world. Use deterministic state transitions, with 2–64 frames and sequential step numbers.
4. Add definitions for any new term IDs in `src/lib/glossary.ts` and an appropriate world view in `WorldView.tsx` if your scenario needs a new visual representation. The current world schema is intentionally small; changing it is a reviewed code change.
5. Add a domain-specific test proving the failure and repair, including an assessment that ignores the agent’s confident wording. Extend browser coverage for the new journey.
6. Include primary-source references and a limitation note. A scripted result is not evidence of a model’s general behavior or failure rate.

Avoid randomness, current dates, external services, downloaded code, and real-world side effects. Do not add made-up performance scores. Scenarios ship as reviewed application code; visitors cannot upload or execute them.

The [duplicate-action module](src/scenarios/duplicate-action.ts) is a complete worked example. Its [domain and shared contract tests](tests/simulation.test.ts) demonstrate the required assertions. Shared contract tests automatically cover every registered revision.

## Optional learning questions

Add a prediction and a repair question to `src/learning/questions.ts`, keyed by the exact scenario ID and revision. Each needs one correct option and an explanation for every option, including plausible misconceptions. Use the existing questions as the example. `npm run validate` checks the question contract. Keep this UI content separate from simulation behavior; do not change historical frames to support a quiz.

## Preserve links

Published scenario revisions are immutable. For a behavioral change, copy the module to a new revision, retain the original in the registry, and bump its `revision`. Keep revision 1 routes working. Editorial corrections that change teaching meaning should also use a new revision. Theme or layout changes may improve every revision.

## Approachability and accessibility

Use plain language with exact terms available on demand. Keyboard users must be able to operate every experiment and dialog. Color or animation must never be the only explanation. Keep mobile layouts readable and honor reduced motion.

## Small first contributions

- Clarify one confusing sentence while preserving its technical meaning.
- Suggest an authoritative reference for an existing concept.
- Reproduce an accessibility or small-screen issue with an exact experiment link.
- Propose a new failure and its single repair using the scenario issue template.

No contribution requires a model API key. Work is accepted under the repository’s MIT license and code of conduct.
