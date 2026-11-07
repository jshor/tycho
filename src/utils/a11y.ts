import { SCENE_ID } from '../constants/UI'

/**
 * Returns true if the user has asked the system to minimize motion.
 */
export function prefersReducedMotion(): boolean {
  return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/**
 * Returns a user-friendly description of the time speed-up.
 */
export function describeSpeed(power: number): string {
  return `${(10 ** power).toLocaleString('en-US')}× real time`
}

/**
 * Moves the keyboard focus to the element having the given ID.
 */
export function focusById(id: string): void {
  requestAnimationFrame(() => document.getElementById(id)?.focus({ preventScroll: true }))
}

/**
 * Focuses the scene if nothing else has the keyboard focus.
 */
export function recoverFocus(): void {
  requestAnimationFrame(() => {
    if (!document.activeElement || document.activeElement === document.body) {
      document.getElementById(SCENE_ID)?.focus({ preventScroll: true })
    }
  })
}
