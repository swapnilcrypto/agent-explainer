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

it('keeps a prediction until the baseline outcome and reveals evidence only afterward', () => {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Make a prediction (optional)' }))
  fireEvent.click(screen.getByRole('radio', { name: 'Automatically return the first ticket.' }))
  expect(screen.getByRole('status')).toHaveTextContent('Prediction noted.')
  expect(screen.getByRole('status')).not.toHaveTextContent('baseline tool has no operation key')
  expect(window.location.hash).toMatch(/baseline\/0$/)
  fireEvent.click(screen.getByRole('button', { name: 'Step 8: Check the actual outcome' }))
  expect(
    screen.getByRole('radio', { name: 'Automatically return the first ticket.' }),
  ).toBeChecked()
  expect(screen.getByRole('status')).toHaveTextContent('baseline tool has no operation key')
  expect(screen.getByRole('status')).toHaveTextContent('The answer: Create a second ticket.')
  expect(document.querySelector('#outcome-title')).toHaveTextContent('One request. Two tickets.')
})

it('does not put answers into browser storage or shared links and clears them on reload', () => {
  window.history.replaceState(null, '', '/?private-note=discard-me')
  const app = render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Make a prediction (optional)' }))
  fireEvent.click(screen.getByRole('radio', { name: 'Create a second ticket.' }))
  fireEvent.click(screen.getByRole('button', { name: 'Share experiment' }))
  const shared = screen.getByLabelText('Experiment link') as HTMLInputElement
  expect(shared.value).toBe(`${window.location.origin}/#/experiment/duplicate-action/1/baseline/0`)
  const preferences = JSON.parse(localStorage.getItem('agent-explainer.preferences.v1')!)
  expect(Object.keys(preferences).sort()).toEqual(['completed', 'theme'])
  app.unmount()
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Make a prediction (optional)' }))
  expect(screen.getAllByRole('radio').every((input) => !(input as HTMLInputElement).checked)).toBe(
    true,
  )
})

it('clears a prediction on restart and uses the newly selected event in feedback', () => {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Make a prediction (optional)' }))
  fireEvent.click(screen.getByRole('radio', { name: 'Create a second ticket.' }))
  fireEvent.click(screen.getByRole('button', { name: 'Restart experiment' }))
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Step 4: The response gets lost' }))
  const href = screen.getByRole('link', { name: 'This step is confusing' }).getAttribute('href')!
  expect(new URL(href).searchParams.get('experiment')).toContain(
    'Selected step: 4 — The response gets lost',
  )
})
