# Ten-person comprehension pilot

Status: **not conducted**. Automated tests cannot establish human comprehension.

Recruit ten developers learning agents. Balance experience levels and include at least two phone users and a keyboard-only session. Do not coach participants through the task.

## Task

“Open the lab. Find out why the agent created two tickets. Make the experiment finish with one ticket, and share a link to the evidence.”

Ask afterward:

1. Did the first operation fail, or did its response fail?
2. Why did retrying create a second ticket?
3. What did the repair change, and where must that behavior be implemented?
4. Does the demonstration prove every real model behaves this way?

## Scoring

A participant passes if they complete the run/inspect/repair/share journey without instructions and explain that the first write succeeded, the timeout left the result uncertain, and the service deduplicates a repeated operation key. They should recognize the example as a simulation.

The launch gate is at least eight passes out of ten. Record time to first insight and points of confusion as qualitative evidence, not artificial performance scores.

Use anonymous participant IDs. Store consented research notes outside the public repository. Publish only aggregate results with permission. Fix recurring confusion and run a new cohort when major interaction changes occur.

## Results template

| Participant ID | Device | Journey completed unaided | Repair explained | Main confusion |
| -------------- | ------ | ------------------------- | ---------------- | -------------- |
| Pending        | —      | Unverified                | Unverified       | —              |
