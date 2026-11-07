/** Where the canvas drew a label. See `src/utils/labels.ts`. */
export interface LabelPlacement {
  visible: boolean
  left: number
  top: number
  width: number
  height: number
  order: number
}

/** The app window. It exposes the label placements and the store to Cypress. */
export interface TychoWindow extends Window {
  __TYCHO_LABELS__: Map<string, LabelPlacement>
  __TYCHO_STORE__: {
    getState(): Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
    setState(state: Record<string, unknown>): void
  }
}

/** Returns the labels drawn on screen. */
export const getDrawnLabels = (win: TychoWindow) =>
  [...win.__TYCHO_LABELS__].filter(([, label]) => label.visible)

/** Returns true if the two labels overlap. */
const overlaps = (a: LabelPlacement, b: LabelPlacement) =>
  a.left < b.left + b.width &&
  b.left < a.left + a.width &&
  a.top < b.top + b.height &&
  b.top < a.top + a.height

/** Returns each pair of labels that overlap on screen. */
export const getOverlappingLabels = (win: TychoWindow): [string, string][] =>
  getDrawnLabels(win).flatMap(([a, labelA], i, drawn) =>
    drawn.slice(i + 1).flatMap(([b, labelB]) => (overlaps(labelA, labelB) ? [[a, b]] : []))
  ) as [string, string][]

/**
 * Returns what is wrong with the label buttons. axe cannot check these as it cannot see the canvas.
 *
 * - A button is shown only while its label is drawn.
 * - A shown button sits over its label.
 * - A focused label is drawn on top of any label it overlaps.
 */
export function auditLabels(win: TychoWindow): string[] {
  const labels = win.__TYCHO_LABELS__
  const buttons = win.document.querySelectorAll<HTMLElement>('[data-orbital-id]')
  const ids = new Set([...labels.keys(), ...[...buttons].map((button) => button.dataset.orbitalId)])
  const problems: string[] = []

  ids.forEach((id) => {
    const label = labels.get(id)
    const rect = win.document.querySelector(`[data-orbital-id="${id}"]`)?.getBoundingClientRect()
    const isDrawn = !!label?.visible
    const isShown = !!rect?.width

    if (isDrawn !== isShown) {
      problems.push(`${id}: ${isDrawn ? 'drawn without a button' : 'button shown but not drawn'}`)
    } else if (isShown && Math.abs(rect.left - label.left) + Math.abs(rect.top - label.top) > 2) {
      problems.push(`${id}: button is not over its label`)
    }
  })

  const focusedId = (win.document.activeElement as HTMLElement)?.dataset?.orbitalId
  const focused = labels.get(focusedId)

  labels.forEach((label, id) => {
    if (focused && id !== focusedId && label.visible && overlaps(focused, label)) {
      if (label.order >= focused.order) problems.push(`${focusedId}: focused but drawn under ${id}`)
    }
  })

  return problems
}
