import { describe, expect, it } from 'vitest'
import { scenarios, scenarioRevisions } from '../src/scenarios'
import { createTicket, emptyWorld, runScenario } from '../src/simulation/engine'

describe('published scenario contracts', () => {
  for (const scenario of scenarioRevisions) {
    for (const variant of ['baseline', 'repaired'] as const) {
      it(`${scenario.id}/${variant} is deterministic, bounded, and independently assessed`, () => {
        const run = runScenario(scenario, variant)
        expect(run).toEqual(runScenario(scenario, variant))
        expect(run.frames.length).toBeGreaterThan(1)
        expect(run.frames.length).toBeLessThanOrEqual(64)
        expect(run.frames.map((f) => f.step)).toEqual(run.frames.map((_, i) => i))
        expect(run.assessment.passed).toBe(variant === 'repaired')
        const last = structuredClone(run.frames.at(-1)!)
        last.agentClaim = 'I guarantee success, everything is done!'
        expect(scenario.assess(last)).toEqual(run.assessment)
      })
    }
    it(`${scenario.id} restarts from the same world and isolates frame snapshots`, () => {
      const original = structuredClone(scenario.initialConditions)
      const before = runScenario(scenario, 'baseline')
      const after = runScenario(scenario, 'repaired')
      expect(before.frames[0]).toEqual(after.frames[0])
      expect(before.frames[0]).toMatchObject(original)
      expect(scenario.initialConditions).toEqual(original)
      before.frames[0].world.document.published = true
      before.frames[0].context.push('mutated')
      expect(before.frames[1].context).not.toContain('mutated')
      expect(runScenario(scenario, 'baseline').frames[0].world.document.published).toBe(false)
    })
  }
})

it('commits a ticket before losing the response and duplicates only without a key', () => {
  const scenario = scenarios[0]
  for (const variant of ['baseline', 'repaired'] as const) {
    const run = runScenario(scenario, variant)
    const lost = run.frames.find((f) => f.activity.label === 'The response gets lost')!
    expect(lost.world.tickets).toHaveLength(1)
    expect(lost.activity.result).toContain('Timeout')
    expect(run.frames.at(-1)!.world.tickets).toHaveLength(variant === 'baseline' ? 2 : 1)
  }
})

it('idempotency applies to one intended operation, not all future tickets', () => {
  const world = emptyWorld()
  const first = createTicket(world, 'operation-a')
  expect(createTicket(world, 'operation-a')).toEqual({ id: first.id, reused: true })
  expect(createTicket(world, 'operation-b').id).not.toBe(first.id)
  expect(world.tickets).toHaveLength(2)
})

it('retains the restriction after compaction only when repaired', () => {
  const scenario = scenarios[1]
  const baseline = runScenario(scenario, 'baseline')
  const repaired = runScenario(scenario, 'repaired')
  const index = baseline.frames.findIndex((f) => f.activity.label === 'Compress the conversation')
  expect(
    baseline.frames.slice(index).every((f) => !f.context.includes('Draft only. Do not publish.')),
  ).toBe(true)
  expect(
    repaired.frames
      .slice(index)
      .every(
        (f) =>
          f.context.includes('Draft only. Do not publish.') &&
          f.constraints.includes('Draft only. Do not publish.'),
      ),
  ).toBe(true)
  expect(baseline.frames.at(-1)!.world.document.published).toBe(true)
  expect(repaired.frames.at(-1)!.world.document.published).toBe(false)
})

it('separates accepted, pending, and completed, and verifies before the repaired completion claim', () => {
  const scenario = scenarios[2]
  const baseline = runScenario(scenario, 'baseline')
  const repaired = runScenario(scenario, 'repaired')
  expect([...new Set(repaired.frames.map((f) => f.world.job))]).toEqual([
    'not-started',
    'accepted',
    'pending',
    'completed',
  ])
  expect(
    baseline.frames.find((f) => f.activity.label === 'The agent says “done”')!.world.reportExists,
  ).toBe(false)
  expect(
    repaired.frames.find((f) => f.activity.label === 'The agent says “done”')!.world.reportExists,
  ).toBe(true)
  expect(
    repaired.frames.filter((f) => f.world.job !== 'completed').every((f) => !f.world.reportExists),
  ).toBe(true)
})

it('does not trust report status when no report exists', () => {
  const state = runScenario(scenarios[2], 'repaired').frames.at(-1)!
  state.world.reportExists = false
  expect(scenarios[2].assess(state).passed).toBe(false)
})

it('rejects an unbounded contributor scenario', () => {
  const scenario = scenarios[0]
  const frames = runScenario(scenario, 'baseline').frames
  expect(() =>
    runScenario(
      {
        ...scenario,
        simulate: () => Array.from({ length: 65 }, (_, i) => ({ ...frames[0], step: i })),
      },
      'baseline',
    ),
  ).toThrow('2–64')
})
