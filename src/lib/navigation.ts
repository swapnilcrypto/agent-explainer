import { getScenario, scenarios } from '../scenarios'
import { runScenario } from '../simulation/engine'
import type { Variant } from '../simulation/types'

export interface Route {
  id: string
  revision: number
  variant: Variant
  step: number
}
export const defaultRoute: Route = {
  id: 'duplicate-action',
  revision: 1,
  variant: 'baseline',
  step: 0,
}
export function encodeRoute(route: Route) {
  return `#/experiment/${route.id}/${route.revision}/${route.variant}/${route.step}`
}
export function decodeRoute(hash: string): { route: Route; notice?: string } {
  if (!hash || hash === '#') return { route: { ...defaultRoute } }
  const parts = hash.match(
    /^#\/experiment\/([a-z-]+)\/([1-9]\d*)\/(baseline|repaired)\/(0|[1-9]\d*)$/,
  )
  if (!parts)
    return {
      route: { ...defaultRoute },
      notice: 'This experiment link is not valid. Start a fresh experiment below.',
    }
  const [, id, rev, variant, cursor] = parts
  const scenario = getScenario(id, Number(rev))
  if (!scenario) {
    const fallback = scenarios.find((s) => s.id === id)
    return {
      route: fallback
        ? { id: fallback.id, revision: fallback.revision, variant: 'baseline', step: 0 }
        : { ...defaultRoute },
      notice: 'That experiment revision is not available. You can run the available version below.',
    }
  }
  const frames = runScenario(scenario, variant as Variant).frames
  if (!Number.isSafeInteger(Number(cursor)) || Number(cursor) >= frames.length)
    return {
      route: { id, revision: Number(rev), variant: variant as Variant, step: 0 },
      notice: 'That step does not exist. This experiment has been reset to its starting state.',
    }
  return { route: { id, revision: Number(rev), variant: variant as Variant, step: Number(cursor) } }
}

export type Theme = 'system' | 'light' | 'dark'
export interface Preferences {
  theme: Theme
  completed: string[]
}
export const STORAGE_KEY = 'agent-explainer.preferences.v1'
export function readPreferences(): Preferences {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return {
      theme: ['system', 'light', 'dark'].includes(raw?.theme) ? raw.theme : 'system',
      completed: Array.isArray(raw?.completed)
        ? raw.completed.filter(
            (id: unknown) => typeof id === 'string' && scenarios.some((s) => s.id === id),
          )
        : [],
    }
  } catch {
    return { theme: 'system', completed: [] }
  }
}
export function savePreferences(preferences: Preferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  } catch {
    /* Storage is optional; learning works without it. */
  }
}
