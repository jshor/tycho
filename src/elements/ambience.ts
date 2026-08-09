import { AudioListener, AudioLoader, Audio, Camera } from 'three'
import { env } from '../utils/Environment'

export class Ambience extends AudioListener {
  /** The Audio instance for the ambience. */
  sound: Audio

  /** Audio downloader instance. */
  loader: AudioLoader = new AudioLoader()

  constructor(camera: Camera) {
    super()
    this.sound = new Audio(this)
    this.loader.load(env('/static/audio/ambience.mp3'), this.onLoaded)
    camera.add(this)
  }

  /**
   * Buffers the audio file to be ready for playback.
   */
  onLoaded = (buffer: AudioBuffer): void => {
    this.sound.setBuffer(buffer)
    this.sound.setLoop(true)
  }

  /**
   * Sets the given volume for the ambience.
   */
  setVolume = (volume: number): void => {
    if (!isFinite(volume)) return
    if (volume) {
      this.sound.play()
    } else {
      this.sound.pause()
    }

    this.sound.setVolume(volume)
  }
}
