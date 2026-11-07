import { getOverlappingLabels, type TychoWindow } from '../audits'

/**
 * Returns each pair of orbitals whose labels overlap on screen.
 */
export function overlappingLabels() {
  return cy.window({ log: false }).then((win: TychoWindow) => getOverlappingLabels(win))
}
