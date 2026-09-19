# Agent Explainer

**See how AI agents work—and why they fail.**

[![Watch a failed retry become a safe retry](docs/media/duplicate-action-preview.gif)](https://swapnilcrypto.github.io/agent-explainer/)

**[Open the interactive lab →](https://swapnilcrypto.github.io/agent-explainer/)** · [Watch the demonstrations](docs/launch/educator-walkthrough.md) · [Contribute an experiment](CONTRIBUTING.md)

Watch an agent fail. Inspect the evidence. Change one mechanism. Replay the same situation.

Agent Explainer is a free, open-source science lab for developers learning agentic systems. It runs entirely in your browser: **no accounts, no API keys, no telemetry, no model bills**.

> **Public beta.** These are deterministic, rule-based teaching simulations, not live model runs or benchmarks. The ten-person comprehension pilot remains a gate before publishing a tagged release.

## Three experiments

| Experiment                                                                                                                   | What goes wrong                                                                   | What you change                                    |
| ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------- |
| [The duplicate action](https://swapnilcrypto.github.io/agent-explainer/#/experiment/duplicate-action/1/baseline/0)           | A tool commits a ticket, its response disappears, and a retry creates another.    | Reuse an idempotency key.                          |
| [The forgotten instruction](https://swapnilcrypto.github.io/agent-explainer/#/experiment/forgotten-instruction/1/baseline/0) | Compaction drops “draft only” and the simulated agent publishes.                  | Retain constraints outside the compressed history. |
| [The premature “done”](https://swapnilcrypto.github.io/agent-explainer/#/experiment/premature-done/1/baseline/0)             | A tool accepts a job and the agent announces completion before the report exists. | Verify the authoritative result.                   |

Optionally make a prediction before running, review it after the failure, and check your understanding after the repair. Answers stay in tab memory and are never saved or shared. A “This step is confusing” link opens an issue form with the selected event filled in; posting feedback on GitHub requires an account.

Inspect three separate views: information available to the agent, agent/tool activity, and actual world state. Navigate the timeline, replay with the repair, then share a link to the exact selected step.

## Run locally

Requires Node.js 20.19+ on the 20.x line, or 22.12+ (Node 22 recommended) and npm.

```sh
git clone https://github.com/swapnilcrypto/agent-explainer.git
cd agent-explainer
npm ci
npm run dev
```

Open the local address printed by Vite. Browser application functionality works without internet after the page and its assets have loaded; this release does not install an offline service worker.

## Verify the project

```sh
npm run check
npx playwright install --with-deps chromium firefox webkit
npm run test:e2e
```

`check` runs TypeScript, ESLint, unit/interface tests, scenario validation, the production build, and the compressed JavaScript budget. Browser tests use the production build under `/agent-explainer/`, matching GitHub Pages subpath hosting.

```sh
npm run build
node scripts/serve-preview.mjs
```

Open `http://127.0.0.1:4173/agent-explainer/`. The preview server is a local test utility, not a production server.

## How it works

- **Pure simulations:** each scenario creates ordered, independent state snapshots. No wall clock, external requests, or random values determine an outcome.
- **Independent assessment:** outcome checks examine world state, rather than trusting the simulated agent’s claim.
- **Small interface:** React, TypeScript, CSS, and SVG. No application backend.
- **Versioned links:** scenario, revision, variant, and step reproduce the selected state. Shared links open paused.
- **Privacy:** theme and completed-experiment indicators stay in local storage. Denying storage does not break the lab. Nothing is uploaded.

The simulations make deliberate assumptions. Read the limitation note and original references in each experiment. Retained instructions are not a substitute for permissions, and real idempotency must be implemented by the service processing the operation.

## Contribute

Start with [CONTRIBUTING.md](CONTRIBUTING.md) and the [copyable scenario template](docs/scenario-template.ts). Useful contributions include clearer explanations, accessible interactions, source corrections, and well-supported failure scenarios.

Published scenario revisions are preserved so old links continue to work. Behavioral changes belong in a new revision.

Next planned experiment: continuous batching, introduced as a model-serving mechanism rather than an agent workflow feature. It is not part of this release.

## Release and learning evidence

- [Verification ledger](docs/verification.md)
- [Architecture and scenario contracts](docs/architecture.md)
- [Pilot protocol](docs/launch/pilot-protocol.md)
- [Deployment and rollback](docs/releasing.md)

GitHub stars are welcome if this helps you explain agents. A reproducible bug report, teaching experience, or new experiment is equally useful.

MIT licensed. Built for small experiments and better mental models.
