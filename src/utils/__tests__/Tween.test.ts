import { Tween } from '@tweenjs/tween.js'
import { tweens, updateTweens } from '../Tween'

describe('Tween', () => {
  const duration = 1000
  let data: { value: number }
  let tween: Tween

  beforeEach(() => {
    tweens.removeAll()

    data = { value: 0 }
    tween = new Tween(data).group(tweens).to({ value: 100 }, duration).start(0)
  })

  describe('updateTweens()', () => {
    it('should advance the tweens it is driving', () => {
      updateTweens(duration / 2)

      expect(data.value).toBeCloseTo(50)
    })

    it('should hold onto a tween that is still running', () => {
      updateTweens(duration / 2)

      expect(tweens.getAll()).toContain(tween)
    })

    it('should let go of a tween that has run its course', () => {
      updateTweens(duration)

      expect(data.value).toEqual(100)
      expect(tweens.getAll()).not.toContain(tween)
    })

    it('should let go of a tween that was cut short', () => {
      tween.stop()
      updateTweens(duration / 2)

      expect(tweens.getAll()).not.toContain(tween)
    })

    it('should leave a tween it has let go of where it stopped', () => {
      updateTweens(duration / 2)
      tween.stop()
      updateTweens(duration)

      expect(data.value).toBeCloseTo(50)
    })
  })
})
