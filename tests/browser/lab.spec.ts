import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const cases = [
  {
    id: 'duplicate-action',
    title: 'One request. Two tickets.',
    failure: 'One request. Two tickets.',
    repair: 'One request. One ticket.',
  },
  {
    id: 'forgotten-instruction',
    title: 'A shorter memory. A lost rule.',
    failure: 'The draft went public.',
    repair: 'The draft stays a draft.',
  },
  {
    id: 'premature-done',
    title: 'Accepted is not completed.',
    failure: 'The report is not ready.',
    repair: '“Done” means done.',
  },
]
const lastStep = (page: Page) => page.locator('.timeline button').last().click()

for (const scenario of cases) {
  test(`${scenario.id}: inspect, repair, compare, share, refresh, and restart`, async ({
    page,
  }) => {
    await page.goto(`./?unrelated=discard-me#/experiment/${scenario.id}/1/baseline/0`)
    await expect(
      page.getByRole('heading', { name: scenario.title, exact: true }).first(),
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Previous step' })).toBeDisabled()
    await page.getByRole('button', { name: 'Run experiment' }).click()
    await expect(page.getByRole('button', { name: 'Pause experiment' })).toBeVisible()
    await page.getByRole('button', { name: 'Pause experiment' }).click()
    await page.getByRole('button', { name: 'Next step' }).click()
    await expect(page).toHaveURL(/baseline\/1$/)
    await lastStep(page)
    await expect(page.locator('#outcome-title')).toHaveText(scenario.failure)
    await page.getByRole('button', { name: 'Apply repair and replay' }).click()
    await expect(page).toHaveURL(/repaired\/0$/)
    await page.getByRole('button', { name: 'Pause experiment' }).click()
    await lastStep(page)
    await expect(page.locator('#outcome-title')).toHaveText(scenario.repair)
    await expect(page.locator('.comparison')).toBeVisible()
    await page.getByRole('button', { name: 'Share experiment' }).click()
    const url = await page.getByLabel('Experiment link').inputValue()
    expect(new URL(url).search).toBe('')
    await page.keyboard.press('Escape')
    await page.goto(url)
    await expect(page.locator('#outcome-title')).toHaveText(scenario.repair)
    await expect(page.locator('.play-state')).toHaveText('Complete')
    await page.reload()
    await expect(page.locator('#outcome-title')).toHaveText(scenario.repair)
    await page.getByRole('button', { name: 'Restart experiment' }).click()
    await expect(page.getByRole('button', { name: 'Previous step' })).toBeDisabled()
    await expect(page.locator('#outcome-title')).toHaveCount(0)
  })
}

test('playback finishes, double clicks pause, and scenario changes cancel playback', async ({
  page,
}) => {
  await page.clock.install()
  await page.goto('./')
  await page.clock.runFor(5000)
  await expect(page).toHaveURL(/baseline\/0$/)
  await page.getByRole('button', { name: 'Run experiment' }).dblclick()
  await expect(page.getByRole('button', { name: 'Run experiment' })).toBeVisible()
  await page.getByRole('button', { name: 'Run experiment' }).click()
  for (let i = 0; i < 8; i++) await page.clock.runFor(1800)
  await expect(page.locator('#outcome-title')).toHaveText('One request. Two tickets.')
  await page.getByRole('button', { name: 'Apply repair and replay' }).click()
  await page.getByRole('button', { name: /The forgotten instruction/ }).click()
  await page.clock.runFor(8000)
  await expect(page).toHaveURL(/forgotten-instruction\/1\/baseline\/0$/)
})

test('browser back and forward restore experiment states paused', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Next step' }).click()
  await page.getByRole('button', { name: /The forgotten instruction/ }).click()
  await page.goBack()
  await expect(page).toHaveURL(/duplicate-action\/1\/baseline\/1$/)
  await expect(page.locator('.play-state')).toHaveText('Paused')
  await page.goForward()
  await expect(page).toHaveURL(/forgotten-instruction\/1\/baseline\/0$/)
})

test('malformed links recover without rendering arbitrary content', async ({ page }) => {
  await page.goto('./#/experiment/duplicate-action/1/baseline/900')
  await expect(page.getByRole('alert')).toContainText('That step does not exist')
  await page.getByRole('button', { name: 'Start this experiment' }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Run experiment' })).toBeVisible()
})

test('works without browser storage or clipboard access', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error('blocked')
    }
    Storage.prototype.setItem = () => {
      throw new Error('blocked')
    }
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('blocked')) },
    })
  })
  await page.goto('./')
  await lastStep(page)
  await page.getByRole('button', { name: 'Apply repair and replay' }).click()
  await page.getByRole('button', { name: 'Pause experiment' }).click()
  await lastStep(page)
  await expect(page.locator('#outcome-title')).toHaveText('One request. One ticket.')
  await page.getByRole('button', { name: 'Share experiment' }).click()
  await page.getByRole('button', { name: 'Copy link', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Select and copy')
  await expect(page.getByLabel('Experiment link')).toBeFocused()
})

test('stores theme and completion progress while shared links control the selected state', async ({
  page,
}) => {
  await page.goto('./#/experiment/duplicate-action/1/repaired/7')
  await page.getByRole('button', { name: /Theme: system/ }).click()
  await page.getByRole('button', { name: /Theme: light/ }).click()
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('.experiment-tab.selected .completed-icon')).toBeVisible()
  await page.goto('./#/experiment/premature-done/1/baseline/2')
  await expect(page).toHaveURL(/premature-done\/1\/baseline\/2$/)
  await expect(page.locator('.play-state')).toHaveText('Paused')
})

test('keyboard can open and close concepts, inspect a term, and navigate steps', async ({
  page,
}) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Concepts' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Concepts' })).toBeFocused()
  await page.getByRole('button', { name: 'Explain Agent', exact: true }).click()
  await expect(page.locator('.term-definition')).toContainText('explicit, simulated rules')
  await page.getByRole('button', { name: 'Next step' }).focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/baseline\/1$/)
})

test('light and dark views are accessible, reduced-motion friendly, and fit the viewport', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./')
  for (const theme of ['light', 'dark']) {
    await page.evaluate((theme) => {
      document.documentElement.dataset.theme = theme
    }, theme)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze()
    expect(results.violations).toEqual([])
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
  }
  await lastStep(page)
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(results.violations).toEqual([])
})

test('does not request outside services or log page errors', async ({ page }) => {
  const outside: string[] = [],
    errors: string[] = []
  page.on('request', (r) => {
    if (
      !r
        .url()
        .startsWith(new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173/').origin) &&
      !r.url().startsWith('data:')
    )
      outside.push(r.url())
  })
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('./')
  await lastStep(page)
  expect(outside).toEqual([])
  expect(errors).toEqual([])
})
