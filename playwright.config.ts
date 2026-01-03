import { defineConfig, devices } from '@playwright/test'
import { defineBddConfig } from 'playwright-bdd'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const basePath = process.env.VITE_BASE_PATH || '/'

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'features/step-definitions/*.ts',
})

export default defineConfig({
  testDir,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: `http://localhost:5173${basePath}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: `http://localhost:5173${basePath}`,
    reuseExistingServer: !process.env.CI,
  },
})
