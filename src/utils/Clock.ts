import { Timer } from 'three'
import { Easing, Tween } from '@tweenjs/tween.js'
import { Constants } from '../constants'
import { getUnixTime } from './DateTime'
import { tweens, updateTweens } from './Tween'

export class Clock {
  timer: Timer
  /** The simulation time that the timer's own elapsed time counts up from. */
  offset: number
  scale: number
  stopped: boolean = false
  elapsedTime: number = 0
  tween?: Tween
  tweenData: {
    time: number
  }
  destinationTime: number

  constructor() {
    this.timer = new Timer()
    this.timer.connect(document)
    this.scale = 1
    this.setTime(this.getOffset())
    this.start()
  }

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

  stop = (): void => {
    this.stopped = true
  }

  /**
   * Disposes the visibility handler the timer in the document.
   */
  dispose = (): void => {
    this.timer.dispose()
  }

  stopTween = (): void => {
    if (this.tween) {
      this.tween.stop()
      this.setTime(this.destinationTime)
      this.start()
      delete this.tween
    }
  }

  updateTweenTime = (): void => {
    this.setTime(this.tweenData.time)
  }

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
