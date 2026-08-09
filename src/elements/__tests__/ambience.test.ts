import { Camera } from 'three'
import { Ambience } from '../ambience'

vi.mock('three', async (importOriginal) => ({
  ...((await importOriginal()) as unknown as Promise<typeof import('three')>),
  AudioLoader: class {
    load = vi.fn()
  },
  AudioListener: class {
    add = vi.fn()
  },
  Audio: class {
    setBuffer = vi.fn()
    setLoop = vi.fn()
    play = vi.fn()
    pause = vi.fn()
    setVolume = vi.fn()
  }
}))

describe('Ambience Utility', () => {
  let camera: Camera
  let ambience: Ambience

  beforeEach(() => {
    camera = new Camera()
    vi.spyOn(camera, 'add').mockImplementation(vi.fn())
    ambience = new Ambience(camera)
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
  })

  it('should render correctly', () => {
    expect(ambience).toBeTruthy()
  })

  describe('constructor', () => {
    it('should attach itself to the camera', () => {
      expect(camera.add).toHaveBeenCalledTimes(1)
      expect(camera.add).toHaveBeenCalledWith(ambience)
    })
  })

  describe('onLoaded()', () => {
    const buffer = new ArrayBuffer() as unknown as AudioBuffer

    it('should call setBuffer with the given buffer', () => {
      const spy = vi.spyOn(ambience.sound, 'setBuffer')

      ambience.onLoaded(buffer)

      expect(spy).toHaveBeenCalled()
      expect(spy).toHaveBeenCalledWith(buffer)
    })

    it('should call setLoop with `true`', () => {
      const spy = vi.spyOn(ambience.sound, 'setLoop')

      ambience.onLoaded(buffer)

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
