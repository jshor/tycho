import 'web-audio-mock'
import { Camera } from 'three'
import Ambience from '../Ambience'

describe('Ambience Utility', () => {
  const camera = new Camera()
  let ambience: Ambience

  beforeEach(() => {
    ambience = new Ambience(camera)
  })

  it('should render correctly', () => {
    expect(ambience).toBeTruthy()
  })

  describe('constructor', () => {
    it('should attach itself to the camera', () => {
      expect(camera.children).toContain(ambience)
    })
  })

  describe('loaded()', () => {
    const buffer = new AudioContext().createBuffer(1, 1, 44100)

    it('should call setBuffer with the given buffer', () => {
      const spy = vi.spyOn(ambience.sound, 'setBuffer')

      ambience.loaded(buffer)

      expect(spy).toHaveBeenCalled()
      expect(spy).toHaveBeenCalledWith(buffer)
    })

    it('should call setLoop with `true`', () => {
      const spy = vi.spyOn(ambience.sound, 'setLoop')

      ambience.loaded(buffer)

      expect(spy).toHaveBeenCalled()
      expect(spy).toHaveBeenCalledWith(true)
    })
  })

  describe('setVolume()', () => {
    describe('when the volume level is truthy', () => {
      it('should play the audio', () => {
        const spy = vi.spyOn(ambience.sound, 'play')

        ambience.setVolume(1)

        expect(spy).toHaveBeenCalled()
        expect(spy).toHaveBeenCalledTimes(1)
      })
    })

    describe('when the volume level is falsey', () => {
      it('should pause the audio', () => {
        const spy = vi.spyOn(ambience.sound, 'pause')

        ambience.setVolume(0)

        expect(spy).toHaveBeenCalled()
        expect(spy).toHaveBeenCalledTimes(1)
      })
    })

    it('should call `setVolume` with the given volume level', () => {
      const spy = vi.spyOn(ambience.sound, 'setVolume')
      const volume = 0.5

      ambience.setVolume(volume)

      expect(spy).toHaveBeenCalled()
      expect(spy).toHaveBeenCalledWith(volume)
    })
  })
})
