import { getDrawnLabels, type TychoWindow } from '../audits'

/**
 * Waits until the canvas draws at least the given number of labels.
 */
export function labelsDrawn(count = 3) {
  // the label buttons move in the same frame as the canvas so there is no need to wait for the
  // camera to stop
  return cy.window({ log: false, timeout: 30000 }).should((win: TychoWindow) => {
    expect(getDrawnLabels(win).length, 'labels drawn').to.be.at.least(count)
  }) as Cypress.Chainable<TychoWindow>
}
