import * as THREE from 'three'
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js'
import { Constants } from '../constants'
import { LensFlareEntry } from '../constants/WebGL'

export class LensFlareHelper extends Lensflare {
  textureLoader: THREE.TextureLoader = new THREE.TextureLoader()
  color: THREE.Color = new THREE.Color(Constants.WebGL.Sunlight.COLOR)

  constructor() {
    super()
    this.position.set(0, 0, 0)
    Constants.WebGL.LENS_FLARES.forEach(this.addEntry)
  }

  addEntry = ({ url, diameter, distance }: LensFlareEntry): void => {
    this.textureLoader.load(`/static/textures/lensflares/${url}`, (texture: THREE.Texture) => {
      this.addElement(new LensflareElement(texture, diameter, distance, this.color))
    })
  }
}
