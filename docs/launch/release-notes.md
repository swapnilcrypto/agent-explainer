# Agent Explainer 0.1.0 beta

See how AI agents work—and why they fail. Run a small experiment, inspect the failure, apply one repair, and replay the same situation.

[Open the public beta](https://modelfieldnotes.com/agent-explainer/)

## Included

- Three deterministic browser simulations: duplicate actions, forgotten instructions, and premature completion claims.
- Separate views for available information, tool activity, and authoritative world state.
- Paused shared links, event inspection, baseline-versus-repair comparisons, and a contextual glossary.
- Optional predictions before a run and understanding questions after a repair, with explanations for every answer. Answers stay in the current tab and are never stored or shared.
- “This step is confusing” feedback opens a reviewable GitHub issue form with the exact experiment and event. Posting feedback requires GitHub sign-in.
- Light and dark themes, keyboard controls, mobile layouts, and reduced-motion support.
- Typed scenario contracts, contribution examples, three demo recordings, and an educator walkthrough.
- MIT license. No accounts, model API keys, telemetry, backend, or runtime third-party services.

## Verification

Commit `2aa45a9f46ba5c538a26de4605ac66642aaba8d0` passed type checking, lint, 35 unit/interface tests, six validated scenario variants, 72 browser tests, dependency auditing, and the production build in [GitHub Actions](https://github.com/swapupg/agent-explainer/actions/runs/35477044064). The same 72 browser tests also passed against the live GitHub Pages URL under the renamed `swapupg` account. App, feedback, documentation, and sharing links use the new owner. Browser projects cover Chromium, Firefox, WebKit, and mobile Chromium emulation. JavaScript is 84.8 KiB gzip against a 250 KB budget.

The outcome comparison now stacks on narrow screens. A regression check covers longer labels and wider fallback fonts at 320px. Feedback-link generation and opening are tested; the signed-in GitHub form and issue submission remain unverified.

See the [verification ledger](https://github.com/swapupg/agent-explainer/blob/main/docs/verification.md) for the deployed revision, public-host test results, and limitations.

## Publication gate

This release is prepared as a **draft**. Do not publish the tag until at least eight of ten pilot participants complete an experiment unaided and correctly explain the repair. The pilot has not yet been conducted. Screen-reader user testing, physical-device testing, and rollback to an earlier release are also unverified.

These demonstrations are teaching simulations, not model benchmarks or a view into a real model’s reasoning. Continuous batching is planned for the next release.

The current compiled application is attached as `agent-explainer-v0.1.0-beta.1-2aa45a9.tar.gz`. Its SHA-256 is `a4366564d3489fffbc1c224209525802708d32313358e64a03dad1fa8c1d06ff`. Earlier archives are retained; `BUILD-NOTES.txt` identifies each commit. Archives from before the account rename contain old URLs and need the same link migration before use as a rollback build under the new account. Verify the archive against `SHA256SUMS.txt` before use. Public rollback has not been exercised.
