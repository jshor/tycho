import type { Result } from 'axe-core'
import type { TychoWindow } from '../audits'
import { AXE_TAGS, KNOWN_EXCEPTIONS, STRICT_RULES } from '../constants'

/**
 * Removes the known exceptions from the violations.
 */
const withoutExceptions = (violations: Result[], doc: Document): Result[] => {
  return violations
    .map((violation) => {
      const excepted = KNOWN_EXCEPTIONS[violation.id] ?? []
      const nodes = violation.nodes.filter(
        ({ target }) => !excepted.some((selector) => Cypress.$(target.join(' '), doc).is(selector))
      )

      return { ...violation, nodes }
    })
    .filter(({ nodes }) => nodes.length)
}

/**
 * Returns the axe violations in the page. It does not fail on them.
 */
export function axeViolations() {
  // the controls fade out when idle and axe skips what it cannot see so a key press wakes them
  cy.window({ log: false }).then((win: TychoWindow) => {
    const { isComplete, activeModal, controlsEnabled } = win.__TYCHO_STORE__.getState()

    if (!isComplete || activeModal || controlsEnabled) return

    cy.realPress('Shift')
    cy.get('#controls', { log: false }).should('have.css', 'opacity', '1')
  })
  // the page is never reloaded so axe only needs to be injected once
  cy.window({ log: false }).then((win) => {
    if (!('axe' in win)) cy.injectAxe()
  })
  return cy.window({ log: false }).then((win) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { axe } = win as any

    const run: Promise<Result[]> = axe
      .run(win.document, { runOnly: { type: 'tag', values: AXE_TAGS } })
      .then(({ violations, incomplete }: { violations: Result[]; incomplete: Result[] }) =>
        withoutExceptions(
          [...violations, ...incomplete.filter(({ id }) => STRICT_RULES.includes(id))],
          win.document
        )
      )

    return cy.wrap(run, { log: false, timeout: 30000 })
  }) as unknown as Cypress.Chainable<Result[]>
}
