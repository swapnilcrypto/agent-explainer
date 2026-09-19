// Copy into src/scenarios/your-scenario.ts and replace every teaching placeholder.
import { initialState, recorder } from '../simulation/engine'
import type { ScenarioDefinition } from '../simulation/types'

export const yourScenario: ScenarioDefinition = {
  id: 'your-scenario',
  revision: 1,
  title: 'Name one failure',
  shortTitle: 'Name one failure',
  subtitle: 'The surprising observable result.',
  topic: 'Concept A & concept B',
  description: 'Describe what the visitor will investigate.',
  objective: 'State the learning outcome.',
  task: 'Give the user a concrete goal.',
  repair: 'Name one repair',
  repairExplanation: 'Explain the mechanism, not just the outcome.',
  limitation: 'Explain the assumptions and what the simulation cannot establish.',
  takeaway: 'One sentence worth remembering.',
  sources: [{ title: 'Replace with a primary source', url: 'https://example.com' }],
  initialConditions: initialState(['Initial task and constraints.']),
  simulate(variant, initialConditions) {
    const { frames, add } = recorder(initialConditions)
    add(
      {
        actor: 'User',
        label: 'Task received',
        input: 'Original goal',
        result: 'Ready',
        change: 'No effect yet.',
      },
      'context',
      'Explain the setup.',
      ['agent'],
    )
    // Add baseline and repaired transitions here. Do not simply set a pass/fail flag.
    // Derive observable effects from the changed mechanism and assess world state.
    if (variant === 'repaired') {
      /* Implement the repair. */
    }
    return frames
  },
  assess() {
    // Replace with assertions over the authoritative world state.
    throw new Error('Implement an independent outcome assessment.')
  },
}
