import type { ScenarioDefinition, SimulationFrame } from '../simulation/types'
import { encodeRoute, type Route } from './navigation'

// Use the public lab URL, never the visitor's query string, host, or learning answers.
const publicLab = 'https://swapnilcrypto.github.io/agent-explainer/'
const repository = 'https://github.com/swapnilcrypto/agent-explainer'

export function explanationFeedbackURL(
  route: Route,
  scenario: ScenarioDefinition,
  frame: SimulationFrame,
) {
  const url = new URL(`${repository}/issues/new`)
  url.searchParams.set('template', 'explanation.yml')
  url.searchParams.set(
    'title',
    `[Explanation] ${scenario.title} · revision ${route.revision} · ${route.variant} · step ${route.step + 1}`,
  )
  url.searchParams.set(
    'experiment',
    [
      `${publicLab}${encodeRoute(route)}`,
      '',
      `Experiment: ${scenario.title}`,
      `Revision: ${route.revision}`,
      `Run: ${route.variant}`,
      `Selected step: ${route.step + 1} — ${frame.activity.label}`,
    ].join('\n'),
  )
  return url.toString()
}
