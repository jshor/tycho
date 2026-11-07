import { auditLabels, type TychoWindow } from '../audits'

/**
 * Waits for the label audit to report a problem that contains the given text.
 */
export function expectLabelProblem(text: string) {
  cy.window({ log: false }).should((win: TychoWindow) => {
    expect(auditLabels(win).join(' | '), 'label problems').to.include(text)
  })
}
