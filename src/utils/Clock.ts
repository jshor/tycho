import * as THREE from 'three'
import TWEEN, { Tween } from 'tween.js'
import moment from 'moment'
import { Constants } from '../constants'

export class Clock {
  clock: THREE.Clock
  offset: number
  scale: number
  stopped: boolean = false
  elapsedTime: number = 0
  tween?: Tween
  tweenData: { offset: number }
  destinationOffset: number

  constructor() {
    this.clock = new THREE.Clock()
    this.offset = this.getOffset()
    this.start()
    this.scale = 1
  }

  getOffset = (time?: number): number => {
    if (time) {
      return time
    }
    return moment().unix()
  }

  getTime = (): number => {
    let time = this.clock.getElapsedTime()
    time *= this.scale
    time += this.offset

    return Math.ceil(time)
  }

  update = (): void => {
    const elapsedTime = this.clock.getElapsedTime()

    if (elapsedTime !== this.elapsedTime) {
      this.elapsedTime = elapsedTime
    }
    TWEEN.update()
  }

  speed = (e?: number): void => {
    const scale = Math.pow(10, e || 0)

    if (scale !== this.scale) {
      this.stopTween()
      this.offset = this.getTime()
      this.scale = scale
      this.start()
    }
  }

  start = (): void => {
    this.stopped = false
    this.clock.start()
  }

  continue = (): void => {
    const { elapsedTime } = this.clock

    this.stopped = false
    this.clock.start()
    this.clock.elapsedTime = elapsedTime
  }

  stop = (): void => {
    this.stopped = true
    this.clock.stop()
  }

  stopTween = (): void => {
    if (this.tween) {
      this.tween.stop()
      this.offset = this.destinationOffset
      this.start()
      delete this.tween
    }
  }

  updateTweenOffset = (): void => {
    this.offset = this.tweenData.offset
  }

  setOffset = (time: number): void => {
    this.stop()
    this.stopTween()
    this.tweenData = {
      offset: this.offset
    }
    this.destinationOffset = time

    this.tween = new TWEEN.Tween(this.tweenData)
      .easing(TWEEN.Easing.Quadratic.Out)
      .to({ offset: time }, Constants.WebGL.Tween.NORMAL)
      .onUpdate(this.updateTweenOffset)
      .onComplete(this.start)
      .start()
  }
}
