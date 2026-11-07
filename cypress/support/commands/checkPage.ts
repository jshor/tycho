/**
 * Fails if axe finds any violation in the page.
 */
export function checkPage() {
  cy.axeViolations().then((violations) => {
    const found = violations.map(
      ({ id, nodes }) => `${id} on ${nodes.map(({ target }) => target.join(' ')).join(' and ')}`
    )

    // joined so the failure prints each violation in full
    expect(found.join(' | '), 'axe violations').to.equal('')
  })
}
