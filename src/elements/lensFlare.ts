import * as THREE from 'three'
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js'
import { Constants } from '../constants'
import { LensFlareEntry } from '../constants/WebGL'

/**
 * Sun camera solar flare effect.
 */
export class LensFlareHelper extends Lensflare {
  /** Loader that fetches the texture behind each element of the flare. */
  textureLoader: THREE.TextureLoader = new THREE.TextureLoader()

  /** The color every element of the flare is tinted, taken from the sunlight itself. */
  color: THREE.Color = new THREE.Color(Constants.WebGL.Sunlight.COLOR)

  constructor() {
    super()
    this.position.set(0, 0, 0)
    Constants.WebGL.LENS_FLARES.forEach(this.addEntry)
  }

  /**
   * Fetches the texture for the given entry in the config.
   */
  addEntry = ({ url, diameter, distance }: LensFlareEntry): void => {
    this.textureLoader.load(`/static/textures/lensflares/${url}`, (texture: THREE.Texture) => {
      this.addElement(new LensflareElement(texture, diameter, distance, this.color))
    })
  }
}
