import puppeteer from 'puppeteer-core'
import { mkdir } from 'fs/promises'
import { resolve } from 'path'

const CHROME_PATH = 'C:\\Users\\winst\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
const BASE_URL = 'http://localhost:3001'
const OUTPUT_DIR = resolve('public/screenshots')

const pages = [
  { name: 'dashboard', path: '/', waitFor: 3000 },
  { name: 'flow-editor-booking', path: '/editor/demo-appointment-booking', waitFor: 4000 },
  { name: 'flow-editor-appraisal', path: '/editor/demo-seller-appraisal', waitFor: 4000 },
  { name: 'flow-editor-full', path: '/editor/demo-lead-qualification-full', waitFor: 4000 },
  { name: 'analytics', path: '/analytics', waitFor: 2500 },
  { name: 'call-history', path: '/call-history', waitFor: 2000 },
  { name: 'agents', path: '/agents', waitFor: 2500 },
  { name: 'contacts', path: '/contacts', waitFor: 2000 },
  { name: 'billing', path: '/billing', waitFor: 2500 },
  { name: 'pipeline', path: '/pipeline', waitFor: 2000 },
  { name: 'email', path: '/email', waitFor: 2000 },
  { name: 'listings', path: '/listings', waitFor: 2000 },
  { name: 'calendar', path: '/calendar', waitFor: 2000 },
  { name: 'notifications', path: '/notifications', waitFor: 2000 },
  { name: 'knowledge-base', path: '/knowledge-base', waitFor: 2000 },
  { name: 'phone-numbers', path: '/phone-numbers', waitFor: 2000 },
  { name: 'batch-call', path: '/batch-call', waitFor: 2000 },
]

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true })
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--window-size=1440,900', '--no-sandbox'],
    defaultViewport: { width: 1440, height: 900 },
  })
  const page = await browser.newPage()
  for (const { name, path, waitFor } of pages) {
    try {
      console.log(`Capturing ${name}...`)
      await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle2', timeout: 15000 })
      await new Promise(r => setTimeout(r, waitFor))
      await page.screenshot({ path: resolve(OUTPUT_DIR, `${name}.png`), fullPage: false, type: 'png' })
      console.log(`  -> ${name}.png`)
    } catch (err) {
      console.error(`  -> Failed ${name}: ${err.message}`)
    }
  }
  await browser.close()
  console.log('Done!')
}
main().catch(console.error)
