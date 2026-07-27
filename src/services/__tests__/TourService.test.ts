import TourService from '../TourService'
import Cookie from 'js-cookie'

const labels = [
  {
    duration: 5000,
    text: 'Welcome to the Solar System'
  },
  {
    duration: 5000,
    text: 'This is a real-time interactive simulation of major planetary bodies'
  },
  {
    duration: 3000,
    text: "Let's start exploring"
  }
]

describe('Tour Service', () => {
  describe('canSkip()', () => {
    it('should return true if the cookie is set', () => {
      Cookie.set('tourViewed', 'true')

      expect(TourService.canSkip()).toEqual(true)
    })

    it('should return false if the cookie is not set', () => {
      Cookie.remove('tourViewed')

      expect(TourService.canSkip()).toEqual(false)
    })
  })

  describe('setSkip()', () => {
    it('should write the skip cookie', () => {
      const spy = vi.spyOn(Cookie, 'set')

      TourService.setSkip()

      expect(spy).toHaveBeenCalled()
      expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  describe('getTourDuration()', () => {
    it('should return the total duration of the labels', () => {
      const result = TourService.getTourDuration(labels)

      expect(typeof result).toBe('number')
      expect(result).toEqual(23000)
    })
  })
})
