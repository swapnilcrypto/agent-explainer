# Release and rollback

## Beta versus stable

Technical verification is necessary but does not establish the human comprehension goal. Until the ten-person pilot passes, keep the public demo clearly labeled beta and leave the tagged release unpublished. A draft release may hold the reviewed archive and notes. Do not call the project production ready or imply 1,000-star adoption.

## Continuous integration and Pages

The Pages workflow runs checks and browser journeys, then uploads the built static site. The deployment job receives Pages write permission and an identity token; normal validation jobs have read-only repository access. Pull requests run validation without deploying.

Set GitHub Pages to GitHub Actions as its build source. Use Node 22 and `npm ci`. The application has no environment secrets and uses relative asset URLs plus hash navigation. The preview tests host the built site at `/agent-explainer/`.

## Release checklist

1. Identify the exact passing commit, check the diff, and confirm there are no credentials or unrelated files.
2. Run `npm run check`, all Playwright projects, and `npm audit`. Review the dependency results rather than silently accepting material findings.
3. Confirm the public Pages deployment finished successfully. Smoke-test all three experiments, a shared repaired link, and static assets from the public URL.
4. Record the deployed commit, compressed bundle size, test evidence, and remaining limitations in `docs/verification.md`.
5. Attach the built static archive and SHA-256 checksum to a draft release tied to the passing commit. Publish a versioned release only after the comprehension pilot meets the eight-of-ten target and all checks above pass.

## Rollback

Download the previous known-good static archive from its GitHub release (or the maintainer-only draft during the pilot). Verify its checksum and retain it before deploying a newer version. To restore through the workflow, dispatch the Pages workflow with the previous passing commit or release tag as `deploy_ref`. It checks out, rebuilds, tests, and deploys that revision. Normal push deployments build the triggering commit.

If only a scene changed incorrectly, prefer publishing a corrected new scenario revision while preserving historical revisions. Never silently change a published revision's behavior.

## Monitoring and privacy

A scheduled GitHub Actions smoke check reads the public root page and a key built asset. Failures appear in repository Actions; no application analytics are collected. Track stars, forks, issues, contributors, and voluntary feedback through GitHub.

## Demo assets

After the preview is running, `node scripts/record-demos.mjs` captures the real application into `docs/media/`. Regenerate clips only when a visible behavior changes. Keep recorded content limited to bundled public scenarios.
