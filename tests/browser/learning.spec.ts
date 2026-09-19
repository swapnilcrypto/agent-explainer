import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const lessons = [
  {
    id: 'duplicate-action',
    prediction: 'Create a second ticket.',
    wrong: 'The agent stops retrying.',
    right: 'The tool recognizes the same operation key and reuses its result.',
    explanation: 'service must store and enforce',
  },
  {
    id: 'forgotten-instruction',
    prediction: 'Publish the update.',
    wrong: 'Compression now preserves every detail.',
    right: 'The harness supplies the separately retained restriction.',
    explanation: 'permissions must independently constrain publication',
  },
  {
    id: 'premature-done',
    prediction: 'The request is accepted, but the report is not ready.',
    wrong: 'It waits a fixed amount of time and assumes success.',
    right: 'It checks that the job completed and the report exists.',
    explanation: 'evidence from the authoritative system',
  },
]

for (const lesson of lessons) {
  test(`${lesson.id}: optional prediction and repair explanation stay local`, async ({ page }) => {
    await page.goto(`./#/experiment/${lesson.id}/1/baseline/0`)
    await expect(page.getByRole('radio')).toHaveCount(0)
    await page.getByRole('button', { name: 'Make a prediction (optional)' }).click()
    await page.getByRole('radio', { name: lesson.prediction, exact: true }).check()
    await expect(page.getByRole('status')).toContainText('Prediction noted.')
    await expect(page.getByRole('status')).not.toContainText('That’s right.')
    await page.getByRole('button', { name: 'Run experiment', exact: true }).click()
    await page.getByRole('button', { name: 'Pause experiment', exact: true }).click()
    await page.locator('.timeline button').last().click()
    await expect(
      page.getByRole('region', { name: 'Review your prediction' }).getByRole('status'),
    ).toContainText('That’s right.')
    await page.getByRole('button', { name: 'Apply repair and replay', exact: true }).click()
    await page.getByRole('button', { name: 'Pause experiment', exact: true }).click()
    await page.locator('.timeline button').last().click()
    await page.getByRole('button', { name: 'Check your understanding (optional)' }).click()
    await page.getByRole('radio', { name: lesson.wrong, exact: true }).check()
    await expect(page.getByRole('status')).toContainText('The answer:')
    await page.getByRole('radio', { name: lesson.right, exact: true }).check()
    await expect(page.getByRole('status')).toContainText(lesson.explanation)
    await page.getByRole('button', { name: 'Share experiment', exact: true }).click()
    const link = await page.getByLabel('Experiment link').inputValue()
    expect(new URL(link).search).toBe('')
    expect(new URL(link).hash).toMatch(new RegExp(`^#/experiment/${lesson.id}/1/repaired/[0-9]+$`))
    await page.keyboard.press('Escape')
    const preferences = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('agent-explainer.preferences.v1')!),
    )
    expect(Object.keys(preferences).sort()).toEqual(['completed', 'theme'])
    await page.reload()
    await page.getByRole('button', { name: 'Check your understanding (optional)' }).click()
    await expect(page.locator('.learning-check input:checked')).toHaveCount(0)
  })
}

test('restart, switching scenarios, and history navigation clear answers', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Make a prediction (optional)' }).click()
  await page.getByRole('radio', { name: 'Create a second ticket.', exact: true }).check()
  await page.getByRole('button', { name: 'Restart experiment' }).click()
  await expect(page.locator('.learning-check input:checked')).toHaveCount(0)
  await page.getByRole('radio', { name: 'Create a second ticket.', exact: true }).check()
  await page.getByRole('button', { name: /The forgotten instruction/ }).click()
  await expect(page.locator('.learning-check input:checked')).toHaveCount(0)
  await page.goBack()
  await expect(page.locator('.learning-check input:checked')).toHaveCount(0)
})

test('feedback opens a reviewable GitHub form for the selected event and pauses playback', async ({
  page,
  context,
}) => {
  await context.route('https://github.com/swapupg/agent-explainer/issues/new**', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<h1>Review feedback</h1>' }),
  )
  await page.clock.install()
  await page.goto('./?private-note=discard-me#/experiment/duplicate-action/1/baseline/3')
  await page.getByRole('button', { name: 'Continue experiment' }).click()
  const popupPromise = page.waitForEvent('popup')
  await page.getByRole('link', { name: 'This step is confusing' }).click()
  const popup = await popupPromise
  await popup.getByRole('heading', { name: 'Review feedback' }).waitFor()
  const url = new URL(popup.url())
  expect(url.searchParams.get('template')).toBe('explanation.yml')
  expect(url.searchParams.get('experiment')).toContain('Selected step: 4 — The response gets lost')
  expect(url.searchParams.get('experiment')).toContain('/duplicate-action/1/baseline/3')
  expect(url.toString()).not.toContain('private-note')
  await expect(page.locator('.play-state')).toHaveText('Paused')
  await popup.close()
  await page.clock.runFor(5000)
  await expect(page).toHaveURL(/baseline\/3$/)
  await page.getByRole('button', { name: 'Next step' }).click()
  const updated = new URL(
    (await page.getByRole('link', { name: 'This step is confusing' }).getAttribute('href'))!,
  )
  expect(updated.searchParams.get('experiment')).toContain(
    'Selected step: 5 — Try the request again',
  )
})

test('expanded learning checks support keyboard, contrast, and narrow screens', async ({
  page,
  browserName,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./')
  await page.getByRole('button', { name: 'Make a prediction (optional)' }).focus()
  await page.keyboard.press('Enter')
  // macOS WebKit uses Option-Tab for all controls with its default keyboard preference.
  // https://support.apple.com/en-hk/guide/safari/cpsh003/mac
  await page.keyboard.press(
    browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab',
  )
  await expect(page.getByRole('radio').first()).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(
    page.getByRole('radio', { name: 'Create a second ticket.', exact: true }),
  ).toBeChecked()
  for (const theme of ['light', 'dark']) {
    await page.evaluate((theme) => (document.documentElement.dataset.theme = theme), theme)
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([])
  }
  await page.goto('./#/experiment/forgotten-instruction/1/repaired/6')
  await page.getByRole('button', { name: 'Check your understanding (optional)' }).click()
  await page.getByRole('radio').last().check()
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([])
  await page.setViewportSize({ width: 320, height: 740 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
})

// Wider fallback fonts exposed a real overflow in the before/after comparison on Linux.
test('long comparison labels fit a 320px viewport with wider fallback fonts', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 })
  for (const [id, step] of [
    ['duplicate-action', 7],
    ['forgotten-instruction', 6],
    ['premature-done', 8],
  ] as const) {
    await page.goto(`./#/experiment/${id}/1/repaired/${step}`)
    await page.evaluate(() => (document.documentElement.style.fontFamily = 'Verdana, sans-serif'))
    await expect(page.locator('.comparison')).toBeVisible()
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
    const fits = await page.locator('.comparison').evaluate((panel) => {
      const outer = panel.getBoundingClientRect()
      return [...panel.querySelectorAll('strong')].every(
        (label) => label.getBoundingClientRect().right <= outer.right,
      )
    })
    expect(fits).toBe(true)
  }
})
