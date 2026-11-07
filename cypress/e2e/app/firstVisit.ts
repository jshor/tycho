/**
 * The first visit. Every other test shares it.
 *
 * The splash screen and the tour only show once. So their functional and accessibility tests take
 * turns here in the order the visit happens.
 */
describe('first visit', () => {
  describe('the splash screen', () => {
    it('should name the loading bar (accessibility)', () => {
      cy.get('[role="progressbar"]')
        .should('have.attr', 'aria-label', 'Loading')
        .and('have.attr', 'aria-valuenow')
    })

    it('should show the start button once loaded', () => {
      // the app loads every texture in software which is slow
      cy.contains('button', 'Start', { timeout: 120000 }).should('be.visible')
    })

    it('should focus the start button and keep the scene out of reach (accessibility)', () => {
      cy.contains('button', 'Start').should('have.focus')
      cy.get('#scene').closest('[inert]').should('exist')
      cy.checkPage()
    })

    it('should start the tour from the keyboard and focus its skip button (accessibility)', () => {
      cy.realPress('Enter')
      cy.contains('button', 'Skip Tour', { timeout: 30000 }).should('have.focus')
    })
  })

  describe('the tour', () => {
    it('should play the tour over the scene', () => {
      cy.get('.splash-screen').should('not.be.visible')
      cy.get('.tour--show').should('exist')
    })

    it('should keep the scene out of reach (accessibility)', () => {
      cy.get('#scene').closest('[inert]').should('exist')
      cy.checkPage()
    })

    it('should show the scene once skipped', () => {
      cy.contains('button', 'Skip Tour').click()
      cy.get('.tour--hide').should('exist')
      cy.labelsDrawn()
    })

    it('should focus the scene once skipped (accessibility)', () => {
      cy.focused().should('have.id', 'scene')
      cy.get('.tour').closest('[inert]').should('exist')
    })
  })
})
