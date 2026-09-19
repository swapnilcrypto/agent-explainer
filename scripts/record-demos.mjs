/* global window, document */
import { chromium } from '@playwright/test'
import { mkdir, rename } from 'node:fs/promises'

const base = process.env.DEMO_BASE_URL || 'http://127.0.0.1:4173/agent-explainer/'
await mkdir('docs/media', { recursive: true })
const browser = await chromium.launch()
await Promise.all(
  ['duplicate-action', 'forgotten-instruction', 'premature-done'].map(async (id) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 1000 },
      deviceScaleFactor: 1,
      colorScheme: 'light',
      recordVideo: { dir: 'docs/media', size: { width: 1280, height: 1000 } },
    })
    const page = await context.newPage()
    await page.goto(`${base}#/experiment/${id}/1/baseline/0`)
    await page.evaluate(() =>
      window.scrollTo(
        0,
        document.querySelector('.lab').getBoundingClientRect().top + window.scrollY - 20,
      ),
    )
    await page.waitForTimeout(700)
    await page.getByRole('button', { name: 'Run experiment' }).click()
    await page.getByRole('button', { name: 'Apply repair and replay' }).waitFor({ timeout: 25000 })
    await page.waitForTimeout(900)
    await page.getByRole('button', { name: 'Apply repair and replay' }).click()
    await page.getByRole('button', { name: 'Replay with repair' }).waitFor({ timeout: 25000 })
    await page.locator('.outcome-section').scrollIntoViewIfNeeded()
    await page.waitForTimeout(2200)
    const video = page.video()
    await context.close()
    await rename(await video.path(), `docs/media/${id}.webm`)
    console.log(`Recorded ${id}.webm`)
  }),
)
await browser.close()
