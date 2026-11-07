/** The powers of ten the simulation clock steps through. */
export const Speed = {
  MIN: 0,
  MAX: 10,
  STEP: 1
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

/** Locale of the clock format. */
export const UX_DATE_LOCALE = 'en-US'

/** The pieces the clock reads the simulation time out in, as `DD MMM YYYY HH:mm:ss`. */
export const UX_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  // midnight reads as 00, rather than the 24 an h24 cycle would give it
  hourCycle: 'h23'
}

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

/** Amount of time at which the scene idles, in ms. */
export const IDLE_INTERVAL = 5000

/** Amount of time between interactions, in ms. */
export const INTERACTION_INTERVAL = 250

export const HOVER_OPACITY_ON = 1

export const HOVER_OPACITY_OFF = 0.4

/** ID of the scene. */
export const SCENE_ID = 'scene'

/** ID of the heads-up display overlaying the scene. */
export const CONTROLS_ID = 'controls'

/** ID of the button naming the orbital the camera is focused on. */
export const TARGET_LABEL_ID = 'target-label'

/** The angle the camera turns through for each press of an arrow key, in radians. */
export const KEYBOARD_ROTATE_STEP = Math.PI / 36

/** The keys that turn the camera, as the [left, up] angles each one turns it by. */
export const KEYBOARD_ROTATE_KEYS: Record<string, [number, number]> = {
  ArrowLeft: [KEYBOARD_ROTATE_STEP, 0],
  ArrowRight: [-KEYBOARD_ROTATE_STEP, 0],
  ArrowUp: [0, KEYBOARD_ROTATE_STEP],
  ArrowDown: [0, -KEYBOARD_ROTATE_STEP]
}

/** The keys that zoom the camera. */
export const KEYBOARD_ZOOM_KEYS: Record<string, number> = {
  '+': -WHEEL_DELTA_DIVISOR,
  '=': -WHEEL_DELTA_DIVISOR,
  '-': WHEEL_DELTA_DIVISOR,
  _: WHEEL_DELTA_DIVISOR
}
