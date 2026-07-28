import { AudioListener, AudioLoader, Audio, Camera } from 'three'
import { env } from '../utils/Environment'

export class Ambience extends AudioListener {
  sound: Audio
  loader: AudioLoader = new AudioLoader()

  constructor(camera: Camera) {
    super()
    this.sound = new Audio(this)
    this.loader.load(env('/static/audio/ambience.mp3'), this.loaded)
    camera.add(this)
  }

  loaded = (buffer: AudioBuffer): void => {
    this.sound.setBuffer(buffer)
    this.sound.setLoop(true)
  }

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
