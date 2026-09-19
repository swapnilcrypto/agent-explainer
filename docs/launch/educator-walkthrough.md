# A 15-minute agent reliability lesson

Use the [live lab](https://swapnilcrypto.github.io/agent-explainer/) in a browser. Learners need no account or API key. All effects are simulated.

## 1. Predict before running (2 minutes)

Open the duplicate-action experiment. Ask: “If a create request times out, is it safe to retry?” Have learners commit to an answer before running it.

## 2. Inspect the evidence (4 minutes)

Run the baseline, pause when the response is lost, and compare the agent’s context with actual world state. The first ticket already exists. Finish the run and count the tickets.

## 3. Apply the repair (3 minutes)

Apply idempotency and replay. Ask learners to identify what remained the same (lost response and retry) and what changed (the service reuses the original result for the same operation key).

## 4. Transfer the idea (4 minutes)

Try the premature-done experiment. Ask why “accepted” differs from “completed,” and where the agent should look for evidence. Alternatively, use the forgotten-instruction lesson to distinguish retaining a rule from enforcing permission.

## 5. Explain and share (2 minutes)

Ask each learner to share a link to the decisive event with one sentence explaining it. Links open the selected step paused. State clearly that these are teaching simulations, not live model behavior or performance benchmarks.

## Demonstration clips

- [Duplicate action](../media/duplicate-action.webm)
- [Forgotten instruction](../media/forgotten-instruction.webm)
- [Premature completion](../media/premature-done.webm)

Clips show the running application. The live lab provides the interactive and accessible alternative. Sources and limitations are available below every experiment.
