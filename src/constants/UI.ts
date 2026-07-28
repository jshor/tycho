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

export const ZOOM_LABEL_TRIGGER = 25

export const SPIN_LABEL_ARROW_COUNT = 4

export const WHEEL_DELTA_DIVISOR = 100000

/** * How far a pointer may drift between press and release to count as a tap. */
export const FAT_FINGER = 12

/**
 * How much wheel delta one pixel of finger separation is worth when pinching, so that a pinch
 * zooms at roughly the same rate as the wheel does for the same amount of effort.
 */
export const PINCH_DELTA_SCALE = 50

export const HOVER_OPACITY_ON = 1

export const HOVER_OPACITY_OFF = 0.4
