import { auditLabels, type TychoWindow } from '../audits'

/**
 * Fails if the label audit finds a problem.
 */
export function checkLabels() {
  // retried as the canvas draws a frame or two behind the DOM
  cy.window({ log: false }).should((win: TychoWindow) => {
    expect(auditLabels(win), 'label problems').to.be.empty
  })
}
