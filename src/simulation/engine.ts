import type {
  Activity,
  Focus,
  ScenarioDefinition,
  SimulationFrame,
  SimulationResult,
  SimulationState,
  Variant,
  WorldState,
} from './types'

export const emptyWorld = (): WorldState => ({
  tickets: [],
  idempotency: {},
  document: { exists: false, published: false },
  job: 'not-started',
  reportExists: false,
})

export function initialState(context: string[]): SimulationState {
  return {
    context: [...context],
    constraints: [],
    agentClaim: 'Ready to begin.',
    world: emptyWorld(),
  }
}

export function recorder(initialConditions: SimulationState) {
  const state = structuredClone(initialConditions)
  const frames: SimulationFrame[] = []
  const add = (
    activity: Omit<Activity, 'tone'> & { tone?: Activity['tone'] },
    focus: Focus,
    explanation: string,
    terms: string[],
    update?: (s: SimulationState) => void,
  ) => {
    update?.(state)
    frames.push(
      structuredClone({
        ...state,
        step: frames.length,
        activity: { tone: 'neutral', ...activity },
        focus,
        explanation,
        terms,
      }),
    )
  }
  return { state, frames, add }
}

export function createTicket(world: WorldState, key?: string) {
  const existing = key ? world.idempotency[key] : undefined
  if (existing) return { id: existing, reused: true }
  const id = `TKT-${1042 + world.tickets.length}`
  world.tickets.push({ id, subject: 'Delivery address change' })
  if (key) world.idempotency[key] = id
  return { id, reused: false }
}

export function runScenario(scenario: ScenarioDefinition, variant: Variant): SimulationResult {
  const frames = scenario.simulate(variant, structuredClone(scenario.initialConditions))
  if (frames.length < 2 || frames.length > 64)
    throw new Error('A scenario must terminate in 2–64 steps.')
  if (frames.some((frame, index) => frame.step !== index))
    throw new Error('Scenario steps must be ordered and contiguous.')
  return {
    scenarioId: scenario.id,
    revision: scenario.revision,
    variant,
    frames,
    assessment: scenario.assess(frames[frames.length - 1]),
  }
}
