import type { Result } from 'axe-core'
import type { TychoWindow } from './audits'
import { axeViolations } from './commands/axeViolations'
import { checkLabels } from './commands/checkLabels'
import { checkPage } from './commands/checkPage'
import { emulateReducedMotion } from './commands/emulateReducedMotion'
import { expectLabelProblem } from './commands/expectLabelProblem'
import { labelsDrawn } from './commands/labelsDrawn'
import { overlappingLabels } from './commands/overlappingLabels'
import { visitApp } from './commands/visitApp'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    /** Lets `cy.window()` return the app window with its label placements and store. */
    interface ApplicationWindow {
      __TYCHO_LABELS__: TychoWindow['__TYCHO_LABELS__']
      __TYCHO_STORE__: TychoWindow['__TYCHO_STORE__']
    }

    interface Chainable {
      /** Returns the axe violations in the page. It does not fail on them. */
      axeViolations(): Chainable<Result[]>
      /** Fails if the label audit finds a problem. */
      checkLabels(): Chainable<void>
      /** Fails if axe finds any violation in the page. */
      checkPage(): Chainable<void>
      /** Tells the browser whether the user prefers reduced motion. */
      emulateReducedMotion(reduce: boolean): Chainable<void>
      /** Waits for the label audit to report a problem that contains the given text. */
      expectLabelProblem(text: string): Chainable<void>
      /** Waits until the canvas draws at least the given number of labels. */
      labelsDrawn(count?: number): Chainable<TychoWindow>
      /** Returns each pair of orbitals whose labels overlap on screen. */
      overlappingLabels(): Chainable<[string, string][]>
      /** Loads the app as a first visit. All tests share this one visit. */
      visitApp(): Chainable<TychoWindow>
    }
  }
}

Cypress.Commands.add('axeViolations', axeViolations)
Cypress.Commands.add('checkLabels', checkLabels)
Cypress.Commands.add('checkPage', checkPage)
Cypress.Commands.add('emulateReducedMotion', emulateReducedMotion)
Cypress.Commands.add('expectLabelProblem', expectLabelProblem)
Cypress.Commands.add('labelsDrawn', labelsDrawn)
Cypress.Commands.add('overlappingLabels', overlappingLabels)
Cypress.Commands.add('visitApp', visitApp)
