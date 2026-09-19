# Verification ledger

Release candidate: **0.1.0-beta.1**. Evidence recorded on **2026-09-19**.

## Verified locally

| Check                         | Evidence                                                                                                                                                                                                                          |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Type checking and lint        | `npm run typecheck` and `npm run lint` pass.                                                                                                                                                                                      |
| Unit and interface tests      | 30 tests pass across three test files.                                                                                                                                                                                            |
| Scenario contract validation  | All six revision-1 variants pass: deterministic snapshots, bounded traces, teaching metadata, valid glossary references, expected failures and repairs.                                                                           |
| Browser journeys              | 44 tests pass on Chromium, Firefox, WebKit, and a narrow mobile Chromium viewport.                                                                                                                                                |
| Route and resilience coverage | Exact shared states, refresh, back/forward, invalid links, repeated controls, scenario switching, unavailable storage, and denied clipboard access pass. Shared links discard unrelated query parameters.                         |
| Accessibility automation      | Axe checks pass in light/dark themes with reduced motion. Keyboard dialog behavior, focus restoration, and step navigation pass. Additional Chromium checks found no violations for each repaired outcome or the concepts dialog. |
| Responsive review             | Desktop, dark theme, and 390px mobile screenshots reviewed; 320px viewport has no horizontal overflow. This is browser emulation, not physical-device testing.                                                                    |
| Production build              | Relative assets and hash routes work at the `/agent-explainer/` preview subpath.                                                                                                                                                  |
| Compressed JavaScript         | 82.7 KiB gzip for all application JavaScript, within the 250 KB requested budget.                                                                                                                                                 |
| Dependencies                  | `npm audit --audit-level=high` reports zero vulnerabilities at verification time.                                                                                                                                                 |
| Privacy                       | Browser tests observe no outside service requests during an experiment. No accounts, keys, telemetry, or backend are required.                                                                                                    |
| Documentation media           | Three WebM recordings capture real UI interactions. The README includes a GIF of the duplicate-action failure and repair.                                                                                                         |

Contrast testing initially found secondary labels that were too faint. Their colors were corrected and the complete browser suite passed afterward. A final scenario-interface change made initial conditions explicit and added checks that runs cannot mutate them; the complete local checks were rerun.

## Release checks

- Clean-checkout installation: passed from a fresh local Git clone. `npm ci`, `npm run check`, and the README development server were exercised; a browser loaded the app and advanced the first experiment.
- GitHub Actions and public Pages deployment: pending.
- Public URL, assets, and direct shared links: pending.
- Versioned archive and checksum: pending.

These entries are updated with links and results when completed. No pending item is represented as a verified result.

## Unverified and intentionally deferred

- **Human comprehension:** the ten-person pilot has not been conducted. At least eight participants must complete and explain the repair unaided before a versioned release. See the [pilot protocol](launch/pilot-protocol.md).
- **Assistive technology:** automated accessibility and keyboard checks are not a screen-reader user study. Physical mobile devices and a manual screen-reader audit remain unverified.
- **Community reception:** no claim of adoption, star growth, or virality is made. The launch post is a draft and has not been distributed.
- **Real-model behavior:** outcomes are authored simulations, not model evaluations. Retained instructions do not guarantee model compliance; real systems need independent permissions.
- **Rollback:** the first release has no earlier public deployment to restore. Retain its archive and checksum as the rollback baseline before the next deployment; the rollback procedure is documented but has not yet been exercised against a prior release.
- Continuous batching is planned for the next release and is not implemented here.
