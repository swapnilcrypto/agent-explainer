export type Variant = 'baseline' | 'repaired'
export type Focus = 'context' | 'agent' | 'world'
export type Tone = 'neutral' | 'warning' | 'success'

export interface WorldState {
  tickets: { id: string; subject: string }[]
  idempotency: Record<string, string>
  document: { exists: boolean; published: boolean }
  job: 'not-started' | 'accepted' | 'pending' | 'completed'
  reportExists: boolean
}

export interface SimulationState {
  context: string[]
  constraints: string[]
  agentClaim: string
  world: WorldState
}

export interface Activity {
  actor: 'User' | 'Agent' | 'Tool' | 'Harness' | 'World'
  label: string
  input: string
  result: string
  change: string
  tone: Tone
}

export interface SimulationFrame extends SimulationState {
  step: number
  focus: Focus
  activity: Activity
  explanation: string
  terms: string[]
}

export interface Assessment {
  passed: boolean
  headline: string
  evidence: string
  value: string
  label: string
}

export interface ScenarioDefinition {
  id: string
  revision: number
  title: string
  shortTitle: string
  subtitle: string
  topic: string
  description: string
  objective: string
  task: string
  repair: string
  repairExplanation: string
  limitation: string
  takeaway: string
  sources: { title: string; url: string }[]
  initialConditions: SimulationState
  simulate: (variant: Variant, initialConditions: SimulationState) => SimulationFrame[]
  assess: (state: SimulationState) => Assessment
}

export interface SimulationResult {
  scenarioId: string
  revision: number
  variant: Variant
  frames: SimulationFrame[]
  assessment: Assessment
}
