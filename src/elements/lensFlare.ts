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

  /** The elements of the flare. */
  flares: LensflareElement[] = []

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
      const element = new LensflareElement(texture, diameter, distance, this.color.clone())

      this.flares.push(element)
      this.addElement(element)
    })
  }

  /**
   * Dims the flare by the given occlusion percentage [0, 1].
   */
  setOcclusion = (occlusion: number): void => {
    const showing = THREE.MathUtils.clamp(1 - occlusion, 0, 1)

    this.visible = showing > 0

    this.flares.forEach((flare) => flare.color.copy(this.color).multiplyScalar(showing))
  }
}
