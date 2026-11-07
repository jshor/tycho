import { getDrawnLabels, TychoWindow } from '../../../support/audits'

describe('functionality (navigation)', () => {
  it('should go to an orbital when its label is clicked', () => {
    cy.labelsDrawn(1)
    cy.window().then((win: TychoWindow) => {
      const drawn = getDrawnLabels(win)
      // a label no other label overlaps so the click can only land on it
      const [id, { left, top, width, height }] = drawn.find(([, a]) =>
        drawn.every(
          ([, b]) =>
            a === b ||
            a.left >= b.left + b.width ||
            b.left >= a.left + a.width ||
            a.top >= b.top + b.height ||
            b.top >= a.top + a.height
        )
      )
      const name = (
        win.document.querySelector(`[data-orbital-id="${id}"]`) as HTMLElement
      ).textContent.trim()

      cy.get('#scene canvas').realClick({ x: left + width / 2, y: top + height / 2 })

      cy.window().its('__TYCHO_STORE__').invoke('getState').its('targetId').should('equal', id)
      cy.get('#target-label').should('contain.text', name)
    })
  })
})
