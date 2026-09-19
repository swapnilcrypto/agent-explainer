# Agent Explainer 0.1.0 beta

See how AI agents work—and why they fail. Run a small experiment, inspect the failure, apply one repair, and replay the same situation.

[Open the public beta](https://swapnilcrypto.github.io/agent-explainer/)

## Included

- Three deterministic browser simulations: duplicate actions, forgotten instructions, and premature completion claims.
- Separate views for available information, tool activity, and authoritative world state.
- Paused shared links, event inspection, baseline-versus-repair comparisons, and a contextual glossary.
- Light and dark themes, keyboard controls, mobile layouts, and reduced-motion support.
- Typed scenario contracts, contribution examples, three demo recordings, and an educator walkthrough.
- MIT license. No accounts, model API keys, telemetry, backend, or runtime third-party services.

## Verification

Commit `3a07201fdea9ccf874ca59959dbcec2931488365` passed type checking, lint, 30 unit/interface tests, six validated scenario variants, 44 browser tests, and the production build in [GitHub Actions](https://github.com/swapnilcrypto/agent-explainer/actions/runs/35473674800). The same 44 browser tests also passed against the live GitHub Pages URL. Browser projects cover Chromium, Firefox, WebKit, and mobile Chromium emulation. JavaScript is approximately 83 KiB gzip against a 250 KB budget.

See the [verification ledger](https://github.com/swapnilcrypto/agent-explainer/blob/main/docs/verification.md) for the deployed revision, public-host test results, and limitations.

## Publication gate

This release is prepared as a **draft**. Do not publish the tag until at least eight of ten pilot participants complete an experiment unaided and correctly explain the repair. The pilot has not yet been conducted. Screen-reader user testing, physical-device testing, and rollback to an earlier release are also unverified.

These demonstrations are teaching simulations, not model benchmarks or a view into a real model’s reasoning. Continuous batching is planned for the next release.

The attached archive contains the compiled static application. Verify its SHA-256 checksum before using it. Keep this archive as a rollback baseline for future deployments.
