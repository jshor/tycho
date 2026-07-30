import { Tween } from '@tweenjs/tween.js'
import { tweens } from '../Tween'
import { Clock } from '../Clock'
import moment from 'moment'

describe('Clock', () => {
  describe('getOffset()', () => {
    it('should return the offset passed in', () => {
      const time = 1470323035
      const clock = new Clock()
      const offset = clock.getOffset(time)

      expect(typeof offset).toBe('number')
      expect(offset).toBe(time)
    })

    it('should return the current unix time as offset', () => {
      // because unix time changes within seconds, record the moment
      // before the clock was initialized and ensure that the offset
      // time not greater than the pre-start time
      const start = moment().unix()
      const clock = new Clock()
      const offset = clock.getOffset()

      expect(typeof offset).toBe('number')
      expect(offset).toBeGreaterThanOrEqual(start)
    })
  })

  describe('getTime()', () => {
    it('should be a number', () => {
      const clock = new Clock()

      vi.useFakeTimers()
      vi.runAllTimers()

      expect(typeof clock.getTime()).toBe('number')
    })

    it('should read the same time until the simulation is advanced', () => {
      const clock = new Clock()

      clock.timer.update(performance.now() + 1000)

      expect(clock.getTime()).toEqual(clock.getTime())
    })

    it('should run on at the speed the simulation is set to', () => {
      const clock = new Clock()

      clock.speed(1) // ten seconds of simulation for every second that passes
      clock.setTime(1000)
      clock.timer.update(performance.now() + 1000)

      expect(clock.getTime()).toBeGreaterThanOrEqual(1010)
      expect(clock.getTime()).toBeLessThan(1012)
    })
  })

  describe('update()', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.runAllTimers()
    })

    it('should update the elapsed time when 1 sec has passed', () => {
      const clock = new Clock()

      clock.elapsedTime = 0
      clock.timer.getElapsed = () => 1

      clock.update()

      expect(clock).toHaveProperty('elapsedTime')
      expect(clock.elapsedTime).toEqual(1)
    })

    it('should not update elapsedTime if no time has passed', () => {
      const elapsedTime = 1470323035
      const clock = new Clock()

      clock.elapsedTime = elapsedTime
      clock.timer.getElapsed = () => elapsedTime

      clock.update()

      expect(clock).toHaveProperty('elapsedTime')
      expect(clock.elapsedTime).toEqual(elapsedTime)
    })
  })

  describe('speed()', () => {
    it('should set `scale` to 10^<input> if changed', () => {
      const input = 5
      const scale = 6
      const clock = new Clock()

      clock.scale = scale
      clock.speed(input)

      expect(clock.scale).toBe(Math.pow(10, input))
      expect(clock.timer.getTimescale()).toBe(Math.pow(10, input))
    })

    it('should not change the scale if unchanged', () => {
      const input = 5
      const clock = new Clock()
      const spy = vi.spyOn(clock.timer, 'setTimescale')

      clock.scale = Math.pow(10, input)
      clock.speed(input)

      expect(clock.scale).toBe(Math.pow(10, input))
      expect(spy).not.toHaveBeenCalled()
    })

    it('should leave a stopped simulation stopped', () => {
      const clock = new Clock()

      clock.stop()
      clock.speed(5)

      expect(clock.stopped).toEqual(true)
    })

    it('should fallback to an exponent of 0 if param undefined', () => {
      const clock = new Clock()

      clock.speed()

      expect(clock.scale).toBeDefined()
      expect(clock.scale).toBe(1)
    })
  })

  describe('start()', () => {
    let clock: Clock

    beforeEach(() => {
      clock = new Clock()
    })

    it('should not count the time it stood still against the simulation', () => {
      const spy = vi.spyOn(clock.timer, 'reset')

      clock.start()

      expect(spy).toHaveBeenCalled()
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should set stopped = false', () => {
      clock.start()

      expect(clock).toHaveProperty('stopped')
      expect(clock.stopped).toEqual(false)
    })
  })

  describe('continue()', () => {
    let clock: Clock

    beforeEach(() => {
      clock = new Clock()
    })

    it('should not count the time it stood still against the simulation', () => {
      const spy = vi.spyOn(clock.timer, 'reset')

      clock.continue()

      expect(spy).toHaveBeenCalled()
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should pick the simulation up where it left off', () => {
      clock.timer.update(performance.now() + 1000)

      const time = clock.getTime()

      clock.stop()
      clock.continue()

      expect(clock.getTime()).toEqual(time)
    })

    it('should set stopped = false', () => {
      clock.continue()

      expect(clock).toHaveProperty('stopped')
      expect(clock.stopped).toEqual(false)
    })
  })

  describe('stop()', () => {
    let clock: Clock

    beforeEach(() => {
      clock = new Clock()
    })

    it('should hold the simulation where it is', () => {
      const spy = vi.spyOn(clock.timer, 'update')
      const time = clock.getTime()

      clock.stop()
      clock.update()

      expect(spy).not.toHaveBeenCalled()
      expect(clock.getTime()).toEqual(time)
    })

    it('should set stopped = true', () => {
      clock.stop()

      expect(clock).toHaveProperty('stopped')
      expect(clock.stopped).toEqual(true)
    })
  })

  describe('stopTween()', () => {
    describe('when an instance of Tween is defined', () => {
      let clock: Clock

      beforeEach(() => {
        clock = new Clock()
        clock.tween = new Tween({})
      })

      it('should stop the Tween in progress', () => {
        const spy = vi.spyOn(clock.tween, 'stop')

        clock.stopTween()

        expect(spy).toHaveBeenCalled()
        expect(spy).toHaveBeenCalledTimes(1)
      })

      it('should leave the simulation on the time the tween was making for', () => {
        clock.destinationTime = 1000
        clock.stopTween()

        expect(clock.getTime()).toEqual(1000)
      })

      it('should set the simulation running again', () => {
        const spy = vi.spyOn(clock, 'start')

        clock.stopTween()

        expect(spy).toHaveBeenCalled()
        expect(spy).toHaveBeenCalledTimes(1)
      })

      it('should dispose of the Tween instance', () => {
        clock.stopTween()

        expect(clock.tween).not.toBeDefined()
        expect(clock).not.toHaveProperty('tween')
      })
    })
  })

  describe('updateTweenTime()', () => {
    it('should move the simulation to the time the tween has reached', () => {
      const clock = new Clock()

      clock.tweenData = { time: 200 }
      clock.updateTweenTime()

      expect(clock.getTime()).toEqual(clock.tweenData.time)
    })

    it('should hold that time however far the timer has run on', () => {
      const clock = new Clock()

      clock.timer.update(performance.now() + 5000)
      clock.tweenData = { time: 200 }
      clock.updateTweenTime()

      expect(clock.getTime()).toEqual(200)
    })
  })

  describe('setOffset()', () => {
    it('should update the offset of Clock', () => {
      const clock = new Clock()

      const offset = 1470323035
      clock.offset = offset

      vi.useFakeTimers()
      vi.runAllTimers()

      expect(clock.offset).toEqual(offset)
    })

    it('should hand its tween to the group that drives them, or it would never run', () => {
      const clock = new Clock()

      clock.setOffset(1470323035)

      expect(tweens.getAll()).toContain(clock.tween)
    })
  })
})
