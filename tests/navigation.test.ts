import { beforeEach, expect, it, vi } from 'vitest'
import {
  decodeRoute,
  defaultRoute,
  encodeRoute,
  readPreferences,
  savePreferences,
  STORAGE_KEY,
} from '../src/lib/navigation'

beforeEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})
it('round-trips a versioned link exactly', () => {
  const route = { id: 'premature-done', revision: 1, variant: 'repaired' as const, step: 5 }
  expect(decodeRoute(encodeRoute(route))).toEqual({ route })
})
it.each([
  '#/experiment/unknown/1/baseline/0',
  '#/experiment/duplicate-action/99/baseline/0',
  '#/experiment/duplicate-action/1/baseline/9999999999999999999',
  '#/experiment/duplicate-action/1/repaired/-1',
  '#/experiment/duplicate-action/1/anything/0',
  '#/experiment/duplicate-action/1/baseline/0?extra=yes',
  '#%invalid',
  '#/experiment/%3Cscript%3E/1/baseline/0',
])('rejects invalid or unavailable links: %s', (hash) => {
  expect(decodeRoute(hash).notice).toBeTruthy()
  expect(decodeRoute(hash).route.step).toBe(0)
})
it('uses a valid scenario as the recovery target', () => {
  expect(decodeRoute('#/experiment/forgotten-instruction/5/baseline/0').route.id).toBe(
    'forgotten-instruction',
  )
})
it('defaults to the duplicate-action experiment', () => {
  expect(decodeRoute('').route).toEqual(defaultRoute)
})
it('survives corrupt preferences and filters unknown records', () => {
  localStorage.setItem(STORAGE_KEY, '{broken')
  expect(readPreferences()).toEqual({ theme: 'system', completed: [] })
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ theme: 'invalid', completed: ['duplicate-action', 'unknown', 12] }),
  )
  expect(readPreferences()).toEqual({ theme: 'system', completed: ['duplicate-action'] })
})
it('survives missing storage access', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  expect(readPreferences()).toEqual({ theme: 'system', completed: [] })
  expect(() => savePreferences({ theme: 'dark', completed: [] })).not.toThrow()
})
