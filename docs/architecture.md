# Architecture and public teaching contract

## Data flow

URL → validated route → versioned scenario → pure simulation → frames and independent assessment → React playback → selected frame → context/activity/world views.

The browser timer changes only the playback cursor. The simulation computes the whole trace deterministically, without a network or wall-clock input. Selecting a frame does not rerun external work.

`ScenarioDefinition` holds a stable ID, revision, learning metadata, sources, limitation, explicit `initialConditions`, `simulate(variant, initialConditions)`, and `assess(state)`. `SimulationFrame` snapshots visible context, persistent constraints, the agent claim, authoritative world state, the operation, its result, the state change, and related glossary terms. `SimulationResult` packages frames and the final assessment.

The engine clones a scenario’s initial conditions before each run. The recorder copies each frame with `structuredClone`, preventing later writes from changing earlier evidence. `runScenario` validates bounded execution and step ordering. Each scenario's assessment reads authoritative world state rather than the agent's text.

## State and navigation

The URL contract is `#/experiment/<id>/<revision>/<baseline|repaired>/<step>`, where step is zero-based. Current playback updates the active history entry. Switching an experiment, restarting, or replaying a variant creates a history entry. Back/forward and external hash changes reconstruct the state and pause playback.

Shared links override local learning indicators. No route is restored from browser storage when the visitor opens the root page; the default is duplicate-action, revision 1, baseline, step 0. Invalid links show a recovery notice and a safe starting state.

Preferences use a single versioned storage key. Reading, writing, and clipboard access can all fail without blocking the lab. Shared links contain no arbitrary user text or private data. Modal dialogs use native focus containment and restore focus on close.

## Optional learning and feedback

Supplementary questions are keyed by exact scenario ID and revision in `src/learning/questions.ts`. They do not alter published simulation frames. Predictions are reviewed after the baseline result; reflection questions explain each answer after the repaired run. Both are optional and never block playback. Answers live only in React memory, not preferences or URLs. Restart, replay, scenario/history navigation, and refresh clear them; ordinary step inspection preserves them.

The feedback link uses only the canonical public experiment URL, scenario metadata, and selected event. GitHub query parameters select `explanation.yml` and prefill its `experiment` field. Clicking the link pauses playback and opens a separate tab for review. Posting requires a GitHub account and a separate submission on GitHub. Nothing is posted automatically. Browser tests intercept that external navigation; they do not create issues.

## Capability boundaries

All visitors have the same public, local capabilities. There are no accounts, tenant data, real writes, emails, payments, or secrets. Server authorization, database transactions, and external-tool recovery are therefore not application requirements. The effects being taught are simulated data transitions, not production integrations.

## Content maintenance

Keep published scenario revisions in the registry. The picker derives current revisions; exact old revisions remain resolvable. New world types are reviewed code changes. A scenario template is a developer extension point, not a remote plugin API.

## Visual design

The green active state points to the part of the system involved in the selected event. Orange plus labels identifies uncertainty or a failure. Explicit result text and state evidence carry the meaning. Animations are optional presentation and disappear for reduced motion.
