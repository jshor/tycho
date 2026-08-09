import { Timer } from 'three'
import { Easing, Tween } from '@tweenjs/tween.js'
import { Constants } from '../constants'
import { getUnixTime } from '../utils/time'
import { tweens, updateTweens } from '../utils/tween'

export class Clock {
  /** Current scene timer. */
  timer: Timer

  /** The simulation time that the timer's own elapsed time counts up from. */
  offset: number

  /** The speed multiplier for the simulation (1 = real-time, 2 = twice as fast, etc.). */
  scale: number

  /** Whether or not the clock is stopped. */
  stopped: boolean = false

  /** The elapsed time since the clock started, in seconds. */
  elapsedTime: number = 0

  /** The current tween instance for time manipulation. */
  tween?: Tween

  /** Data for the current time tween. */
  tweenData: {
    time: number
  }

  /** The goal time to tween the current time to. */
  destinationTime: number

  constructor() {
    this.timer = new Timer()
    this.timer.connect(document)
    this.scale = 1
    this.setTime(this.getOffset())
    this.start()
  }

  /**
   * Returns the current time offset.
   */
  getOffset = (time?: number): number => {
    if (time) {
      return time
    }
    return getUnixTime()
  }

  /**
   * Returns the time the simulation has reached.
   */
  getTime = (): number => {
    return Math.ceil(this.offset + this.timer.getElapsed())
  }

  /**
   * Sets the simulation time to the given one.
   */
  setTime = (time: number): void => {
    this.offset = time - this.timer.getElapsed()
  }

  /**
   * Advances the simulation, and its tweens, by however long the last frame took.
   */
  update = (): void => {
    if (!this.stopped) {
      this.timer.update()
    }

    this.elapsedTime = this.timer.getElapsed()

    updateTweens()
  }

  /**
   * Runs the simulation at ten to the power of the given exponent, in seconds.
   */
  speed = (e?: number): void => {
    const scale = Math.pow(10, e || 0)

    if (scale !== this.scale) {
      this.stopTween()
      this.scale = scale
      this.timer.setTimescale(scale)
    }
  }

  /**
   * Starts the clock.
   */
  start = (): void => {
    this.stopped = false
    this.timer.reset()
  }

  /**
   * Resumes the simulation clock from where it left off.
   */
  continue = (): void => {
    this.start()
  }

  /**
   * Stops the simulation clock, and freezes the time at its current value.
   */
  stop = (): void => {
    this.stopped = true
  }

  /**
   * Disposes the visibility handler the timer in the document.
   */
  dispose = (): void => {
    this.timer.dispose()
  }

  /**
   * Pauses the simulation clock, freezing the time at its current value.
   */
  stopTween = (): void => {
    if (this.tween) {
      this.tween.stop()
      this.setTime(this.destinationTime)
      this.start()
      delete this.tween
    }
  }

  /**
   * Updates the simulation time to the current tween's time.
   *
   * This should be called on scene tick.
   */
  updateTweenTime = (): void => {
    this.setTime(this.tweenData.time)
  }

  /**
   * Sets the simulation time to the given time over a tween.
   *
   * This will resume the clock tween.
   */
  setOffset = (time: number): void => {
    this.stop()
    this.stopTween()
    this.tweenData = {
      time: this.getTime()
    }
    this.destinationTime = time

    this.tween = new Tween(this.tweenData)
      .group(tweens)
      .easing(Easing.Quadratic.Out)
      .to({ time }, Constants.WebGL.Tween.NORMAL)
      .onUpdate(this.updateTweenTime)
      .onComplete(this.start)
      .start()
  }
}
