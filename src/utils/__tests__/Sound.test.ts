import type { Mock } from 'vitest'
import { Sound, clink } from '../Sound'

describe('Sound Utility', () => {
  let sound: Sound
  let play: Mock<() => Promise<void>>

  beforeEach(() => {
    vi.clearAllMocks()

    sound = new Sound('/static/audio/clink1.mp3')

    // jsdom leaves playback unimplemented, as it has nothing to sound it through
    play = vi.fn(() => Promise.resolve())
    sound.element.play = play
  })

  describe('constructor', () => {
    it('should point the audio at the given file', () => {
      expect(sound.element.src).toContain('/static/audio/clink1.mp3')
    })

    it('should hold the sound ready, so that it plays the moment it is asked for', () => {
      expect(sound.element.preload).toEqual('auto')
    })
  })

  describe('play()', () => {
    it('should sound the effect', () => {
      sound.play()

      expect(play).toHaveBeenCalledTimes(1)
    })

    it('should play at the given volume', () => {
      sound.play(0.5)

      expect(sound.element.volume).toEqual(0.5)
    })

    it('should play no louder than the sound was recorded', () => {
      sound.play(4)

      expect(sound.element.volume).toEqual(1)
    })

    it('should start from the beginning, however soon it follows the last', () => {
      sound.element.currentTime = 0.4

      sound.play()

      expect(sound.element.currentTime).toEqual(0)
    })

    it('should stay silent when the scene is muted', () => {
      sound.play(0)

      expect(play).not.toHaveBeenCalled()
    })

    it('should play in full when asked for no volume in particular', () => {
      sound.play()

      expect(sound.element.volume).toEqual(1)
    })

    it('should stay silent when the volume is not a number to play at', () => {
      sound.play(Infinity)

      expect(play).not.toHaveBeenCalled()
    })

    it('should let a browser refuse to play it, having never asked the user to hear it', () => {
      sound.element.play = vi.fn().mockRejectedValue(new Error('NotAllowedError'))

      expect(() => sound.play()).not.toThrow()
    })
  })

  describe('clink', () => {
    it('should be the sound a label makes', () => {
      expect(clink).toBeInstanceOf(Sound)
      expect(clink.element.src).toContain('/static/audio/clink1.mp3')
    })
  })
})
