import { duplicateAction } from './duplicate-action'
import { forgottenInstruction } from './forgotten-instruction'
import { prematureDone } from './premature-done'

// Published revisions are immutable. Add new revisions here without replacing old ones.
export const scenarioRevisions = [duplicateAction, forgottenInstruction, prematureDone]
export const scenarios = scenarioRevisions.filter(
  (s) => !scenarioRevisions.some((other) => other.id === s.id && other.revision > s.revision),
)
export const getScenario = (id: string, revision = 1) =>
  scenarioRevisions.find((s) => s.id === id && s.revision === revision)
