import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import App from '../src/App'

beforeEach(() => {
  window.history.replaceState(null, '', '/')
  localStorage.clear()
  vi.useFakeTimers()
})
afterEach(() => vi.useRealTimers())
it('never autoplays, advances once per tick, and pauses safely', () => {
  render(<App />)
  act(() => vi.advanceTimersByTime(6000))
  expect(screen.getByRole('button', { name: 'Previous step' })).toBeDisabled()
  fireEvent.click(screen.getByRole('button', { name: 'Run experiment' }))
  act(() => vi.advanceTimersByTime(1800))
  expect(screen.getByRole('button', { name: 'Previous step' })).not.toBeDisabled()
  fireEvent.click(screen.getByRole('button', { name: 'Pause experiment' }))
  const hash = window.location.hash
  act(() => vi.advanceTimersByTime(6000))
  expect(window.location.hash).toBe(hash)
})
it('stops a running experiment when switching scenarios', () => {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Run experiment' }))
  fireEvent.click(screen.getByRole('button', { name: /The forgotten instruction/ }))
  act(() => vi.advanceTimersByTime(6000))
  expect(screen.getByRole('button', { name: 'Previous step' })).toBeDisabled()
  expect(
    screen.getByRole('heading', { name: 'A shorter memory. A lost rule.' }),
  ).toBeInTheDocument()
})
