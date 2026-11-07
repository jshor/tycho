/**
 * Tells the browser whether the user prefers reduced motion.
 */
export function emulateReducedMotion(reduce: boolean) {
  cy.wrap(
    Cypress.automation('remote:debugger:protocol', {
      command: 'Emulation.setEmulatedMedia',
      params: { features: [{ name: 'prefers-reduced-motion', value: reduce ? 'reduce' : '' }] }
    }),
    { log: false }
  )
}
