# Security and privacy

Agent Explainer executes bundled, deterministic simulations in the browser. It has no model connection, account system, application backend, telemetry, or real external tools. It does not accept uploaded transcripts or visitor-provided executable scenarios.

URLs contain only public scenario identifiers and state selections. Local storage contains the theme and completed-experiment IDs. Clearing site data removes these preferences. The static hosting provider may maintain ordinary access logs; “no telemetry” means the application does not collect behavioral analytics.

Report a vulnerability through [GitHub private vulnerability reporting](https://github.com/swapnilcrypto/agent-explainer/security/advisories/new). Please include a minimal reproduction, browser version, affected release, and the impact. Do not include secrets or private logs. Use public issues for ordinary bugs without security-sensitive details.

The beta line is supported. Security fixes should be applied promptly and documented in release notes. The local preview script binds to localhost and is not intended for production hosting.
