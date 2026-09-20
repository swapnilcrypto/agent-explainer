import { expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { explanationFeedbackURL } from '../src/lib/feedback'
import { scenarios } from '../src/scenarios'
import { runScenario } from '../src/simulation/engine'

it('prefills the correct public experiment, revision, variant, and human-readable step', () => {
  for (const scenario of scenarios) {
    for (const variant of ['baseline', 'repaired'] as const) {
      const frames = runScenario(scenario, variant).frames
      for (const frame of frames) {
        const route = { id: scenario.id, revision: scenario.revision, variant, step: frame.step }
        const url = new URL(explanationFeedbackURL(route, scenario, frame))
        expect(url.origin + url.pathname).toBe(
          'https://github.com/swapupg/agent-explainer/issues/new',
        )
        expect(url.searchParams.get('template')).toBe('explanation.yml')
        expect(url.searchParams.get('experiment')).toContain(
          `https://modelfieldnotes.com/agent-explainer/#/experiment/${scenario.id}/1/${variant}/${frame.step}`,
        )
        expect(url.searchParams.get('experiment')).toContain(
          `Selected step: ${frame.step + 1} — ${frame.activity.label}`,
        )
        expect(url.searchParams.get('title')).toContain(
          `revision 1 · ${variant} · step ${frame.step + 1}`,
        )
        expect([...url.searchParams.keys()]).toEqual(['template', 'title', 'experiment'])
        expect(url.toString().length).toBeLessThan(2000)
      }
    }
  }
})

it('targets a field ID that exists in the actual GitHub issue form', () => {
  const form = readFileSync('.github/ISSUE_TEMPLATE/explanation.yml', 'utf8')
  expect(form).toMatch(/type: textarea\s+id: experiment/)
})
