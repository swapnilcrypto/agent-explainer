import { scenarioRevisions } from '../src/scenarios'
import { runScenario } from '../src/simulation/engine'
import { glossary } from '../src/lib/glossary'

const identities = new Set<string>()
for (const scenario of scenarioRevisions) {
  const identity = `${scenario.id}@${scenario.revision}`
  if (identities.has(identity)) throw new Error(`Duplicate revision: ${identity}`)
  identities.add(identity)
  if (!scenario.objective || !scenario.limitation || !scenario.sources.length)
    throw new Error(`Missing teaching metadata: ${identity}`)
  for (const variant of ['baseline', 'repaired'] as const) {
    const run = runScenario(scenario, variant)
    if (run.assessment.passed !== (variant === 'repaired'))
      throw new Error(`Unexpected outcome: ${identity}/${variant}`)
    if (JSON.stringify(run) !== JSON.stringify(runScenario(scenario, variant)))
      throw new Error(`Non-deterministic: ${identity}`)
    for (const frame of run.frames)
      for (const term of frame.terms) if (!glossary[term]) throw new Error(`Unknown term: ${term}`)
    console.log(
      `${identity}/${variant}: ${run.frames.length} frames, ${run.assessment.passed ? 'repair verified' : 'failure exposed'}`,
    )
  }
}
