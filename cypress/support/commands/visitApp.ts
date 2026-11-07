import type { TychoWindow } from '../audits'

/**
 * Loads the app as a first visit. All tests share this one visit.
 */
export function visitApp() {
  cy.visit('/', {
    onBeforeLoad(win) {
      // clear storage so the tour plays
      win.localStorage.clear()
    }
  })

  return cy.window() as Cypress.Chainable<TychoWindow>
}
