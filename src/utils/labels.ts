/**
 * Where an orbital's label was last drawn on the canvas.
 */
export interface LabelPlacement {
  /** Whether or not the label is drawn on screen at all. */
  visible: boolean
  /** Distance from the left edge of the canvas to the label's backing plane, in CSS px. */
  left: number
  /** Distance from the top edge of the canvas to the label's backing plane, in CSS px. */
  top: number
  /** Width of the label's backing plane, in CSS px. */
  width: number
  /** Height of the label's backing plane, in CSS px. */
  height: number
  /** The order the label is drawn in, where the greatest is drawn over all the rest. */
  order: number
}

/** The placement of every label drawn on the canvas, by the ID of the orbital it names. */
export const labelPlacements = new Map<string, LabelPlacement>()

/** The DOM element that holds the button for each label. Each one is keyed by its orbital ID. */
export const labelElements = new Map<string, HTMLElement>()

// the end-to-end tests hold the DOM to account against where the canvas actually drew each label
if ('Cypress' in window) {
  Object.assign(window, { __TYCHO_LABELS__: labelPlacements })
}
