# Verification ledger

Release candidate: **0.1.0-beta.1**. Evidence recorded on **2026-09-19**.

## Launch-polish update

Optional prediction and repair questions, plus event-specific feedback, were added after the initial beta. Simulation revisions and frames are unchanged.

| Capability                      | Status           | Evidence                                                                                                                                                                                                                        | Remaining limitation                                                                                                         |
| ------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Prediction and repair questions | Tested locally   | 35 unit/interface tests and 68 browser checks pass across Chromium, Firefox, WebKit, and mobile Chromium emulation. The new checks cover all three lessons, answer explanations, resets, shared-link privacy, and optional use. | Human comprehension pilot remains pending.                                                                                   |
| Accessibility and layout        | Verified locally | Expanded questions pass axe checks in light/dark themes and reduced motion; keyboard radio navigation, 320px overflow checks, and desktop/mobile screenshots were reviewed.                                                     | Physical devices and screen-reader user testing remain unverified.                                                           |
| Event feedback link             | Tested locally   | Exact issue-form field ID, canonical public URL, scenario revision, run variant, and one-based event label are checked. Browser tests intercept the outbound page and confirm playback pauses; no issue is submitted.           | The real GitHub page presents sign-in in the available browser, so the signed-in form view and submission remain unverified. |
| Public deployment               | Pending          | Local production asset and CI evidence will be recorded after deployment.                                                                                                                                                       | New controls have not yet been checked on the public host.                                                                   |

The macOS WebKit keyboard test uses Option-Tab, matching its default navigation preference ([Apple keyboard guidance](https://support.apple.com/en-hk/guide/safari/cpsh003/mac)). No browser or operating-system preferences were changed.

An initial test caught concatenated accessible text in the question toggle; an explicit, readable accessible label fixes it. The tests now exercise the same label on every browser.

## Initial beta verification

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
- GitHub Actions and public Pages deployment: passed for application commit [`3a07201`](https://github.com/swapnilcrypto/agent-explainer/commit/3a07201fdea9ccf874ca59959dbcec2931488365). [Passing verification and deployment run](https://github.com/swapnilcrypto/agent-explainer/actions/runs/35473674800).
- Public URL, assets, and direct shared links: all **44 browser tests passed against the live Pages URL**, using `PLAYWRIGHT_BASE_URL=https://swapnilcrypto.github.io/agent-explainer/ npx playwright test`. Public HTML, JavaScript, CSS, favicon, and social image returned HTTP 200. The checked application asset is `index-CT7KvDfW.js`.
- Versioned archive and checksum: prepared directly from the passing GitHub Pages artifact. The maintainer-only [draft release](https://github.com/swapnilcrypto/agent-explainer/releases/tag/untagged-00f813f27a887a0ca581) contains the current static archive, the previous public build, build notes, and `SHA256SUMS.txt`. The release remains unpublished pending the pilot.

The release archive is tied to the passing application commit above. Documentation-only evidence updates may follow it without changing the application asset.

Current archive SHA-256: `55914bfa4e94d5e58e2296042f5bc3f277ebf5943a66012ef876dc1b232efe7f`.

Previous archive (commit `760a02e`) SHA-256: `c2ae8988a5ef4867f2dcf6fe93bb778352aacf653a2a4dc77cfb739ba0ac26c4`.

## Unverified and intentionally deferred

- **Human comprehension:** the ten-person pilot has not been conducted. At least eight participants must complete and explain the repair unaided before a versioned release. See the [pilot protocol](launch/pilot-protocol.md).
- **Assistive technology:** automated accessibility and keyboard checks are not a screen-reader user study. Physical mobile devices and a manual screen-reader audit remain unverified.
- **Community reception:** no claim of adoption, star growth, or virality is made. The launch post is a draft and has not been distributed.
- **Real-model behavior:** outcomes are authored simulations, not model evaluations. Retained instructions do not guarantee model compliance; real systems need independent permissions.
- **Rollback exercise:** the previous public deployment has been retained as an archive with a checksum. The workflow can rebuild that passing commit using `deploy_ref`. Restoring an earlier deployment has not been exercised on the public site.
- Continuous batching is planned for the next release and is not implemented here.
