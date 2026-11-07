import 'cypress-axe'
import 'cypress-real-events'
import './commands'

beforeEach(() => {
  cy.emulateReducedMotion(true)
})
