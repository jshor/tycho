/** The powers of ten the simulation clock steps through. */
export const Speed = {
  MIN: 0,
  MAX: 10
}

export const ModalTypes = {
  STATS_MODAL: 'STATS_MODAL',
  ABOUT_MODAL: 'ABOUT_MODAL'
} as const

export type ModalType = (typeof ModalTypes)[keyof typeof ModalTypes]

export const Targets = {
  ALTERNATE: ['mars', 'Mars'] as [string, string],
  DEFAULT: ['earth', 'Earth'] as [string, string]
}

export const UX_DATE_FORMAT = 'MMM DD, YYYY h:mm:ss a'

/** Minutes between the times the calendar offers to pick from. */
export const PICKER_TIME_INTERVAL = 15

export const ZOOM_LABEL_TRIGGER = 25

export const SPIN_LABEL_ARROW_COUNT = 4

/** Value of one notch of a zoom wheel. */
export const WHEEL_DELTA_DIVISOR = 100

/** * How far a pointer may drift between press and release to count as a tap. */
export const FAT_FINGER = 12

/** Value of one increment of a pinch gesture. */
export const PINCH_DELTA_SCALE = 10

export const HOVER_OPACITY_ON = 1

export const HOVER_OPACITY_OFF = 0.4

/**
 * How long a label stays lit after the pointer leaves it, in ms.
 *
 * A label is re-oriented and re-scaled every frame, so a pointer crossing it can fall through the
 * gaps for a frame or two and blink the highlight off and straight back on. Waiting this long for
 * the pointer to return holds the highlight steady through that, without lagging a real departure.
 */
export const HOVER_LINGER = 100

/** The keys that press a button, per the ARIA button pattern. */
export const A11Y_ACTIVATION_KEYS = ['Enter', ' ']