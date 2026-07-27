// TODO: try to find types package to do this...
/**
 * Ambient declarations for `tween.js` (v16), which ships no types of its own.
 *
 * Without these, every `import TWEEN from 'tween.js'` is an implicit `any`, which is why call
 * sites had to reach for `(TWEEN as any).Tween` casts. The surface below is deliberately limited
 * to what the library actually exposes, verified against the installed package rather than
 * guessed, so the casts can be dropped entirely.
 */
declare module 'tween.js' {
  /** Maps a progress ratio in [0, 1] onto an eased ratio. */
  export type EasingFunction = (amount: number) => number

  export interface EasingGroup {
    In: EasingFunction
    Out: EasingFunction
    InOut: EasingFunction
  }

  export interface EasingCatalogue {
    Linear: { None: EasingFunction }
    Quadratic: EasingGroup
    Cubic: EasingGroup
    Quartic: EasingGroup
    Quintic: EasingGroup
    Sinusoidal: EasingGroup
    Exponential: EasingGroup
    Circular: EasingGroup
    Elastic: EasingGroup
    Back: EasingGroup
    Bounce: EasingGroup
  }

  export type InterpolationFunction = (v: number[], k: number) => number

  export interface InterpolationCatalogue {
    Linear: InterpolationFunction
    Bezier: InterpolationFunction
    CatmullRom: InterpolationFunction
  }

  /**
   * A tween mutates the numeric properties of the object handed to its constructor, in place, so
   * that object doubles as the animation's live output.
   */
  export class Tween {
    constructor(object?: object)
    to(properties: object, duration?: number): this
    start(time?: number): this
    stop(): this
    end(): this
    stopChainedTweens(): this
    delay(amount: number): this
    repeat(times: number): this
    repeatDelay(amount: number): this
    yoyo(enabled: boolean): this
    easing(easing: EasingFunction): this
    interpolation(interpolation: InterpolationFunction): this
    chain(...tweens: Tween[]): this
    onStart(callback: () => void): this
    onUpdate(callback: (elapsed: number) => void): this
    onComplete(callback: () => void): this
    onStop(callback: () => void): this
    update(time: number): boolean
  }

  export const Easing: EasingCatalogue
  export const Interpolation: InterpolationCatalogue

  export function getAll(): Tween[]
  export function removeAll(): void
  export function add(tween: Tween): void
  export function remove(tween: Tween): void
  export function update(time?: number, preserve?: boolean): boolean
  export function now(): number

  const TWEEN: {
    Tween: typeof Tween
    Easing: EasingCatalogue
    Interpolation: InterpolationCatalogue
    getAll: typeof getAll
    removeAll: typeof removeAll
    add: typeof add
    remove: typeof remove
    update: typeof update
    now: typeof now
  }

  export default TWEEN
}
