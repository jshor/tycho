import { Group } from '@tweenjs/tween.js'

/**
 * Queue of tweens to run in the simulation.
 */
export const tweens = new Group()

/**
 * Advances all tweens in the queue.
 */
export const updateTweens = (time?: number): void => {
  tweens.update(time)

  for (const tween of tweens.getAll()) {
    if (!tween.isPlaying()) {
      tweens.remove(tween)
    }
  }
}
