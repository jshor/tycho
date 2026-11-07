import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 800,
    // headless runs draw the scene in software, which is slow to settle
    defaultCommandTimeout: 20000,
    video: false,
    // the app is visited once, for every test to share; each one carries on from the last
    testIsolation: false,
    setupNodeEvents(on) {
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          launchOptions.args.push(
            '--use-gl=angle',
            '--use-angle=swiftshader',
            '--enable-unsafe-swiftshader',
            '--ignore-gpu-blocklist'
          )
        }
        return launchOptions
      })
    }
  }
})
