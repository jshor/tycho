import { getDrawnLabels, TychoWindow } from '../../../support/audits'

describe('accessibility (navigation)', () => {
  it('should go to an orbital from its label by keyboard and keep the keyboard focus', () => {
    cy.labelsDrawn(1)
    cy.window().then((win: TychoWindow) => {
      const [id] = [...getDrawnLabels(win)][0]

      cy.get(`[data-orbital-id="${id}"]`).focus().realPress('Enter')

      // the label of the orbital in view is not drawn so its button goes with it
      cy.get(`[data-orbital-id="${id}"]`).should('not.be.visible')
      cy.focused().should('have.id', 'target-label')
    })
  })
})
