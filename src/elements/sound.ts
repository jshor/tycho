import { env } from '../utils/Environment'

/**
 * A short sound the UI plays on demand, held ready so that it sounds the moment it is asked for.
 */
export class Sound {
  element: HTMLAudioElement

  constructor(path: string) {
    this.element = new Audio(env(path))
    this.element.preload = 'auto'
  }

  /**
   * Sounds the effect from its beginning, so that it plays in full however soon it follows the last.
   */
  play = (volume: number = 1): void => {
    if (!volume || !isFinite(volume)) return

    this.element.volume = Math.min(volume, 1)
    this.element.currentTime = 0

    // the browser turns autoplay down until the user has interacted with the page, which is nothing
    // for a sound this incidental to make a fuss over
    this.element.play()?.catch(() => {})
  }
}

/** The clink a label sounds when the pointer meets it. */
export const clink = new Sound('/static/audio/clink1.mp3')
