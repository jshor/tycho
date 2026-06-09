import * as THREE from 'three';
import Constants from '../constants';

export default class LensFlare extends THREE.LensFlare {

    constructor(camera) {
        super();
        this.render();
        this.position.set(0, 0, 0);
        this.camera = camera;
    }

    /**
     * Texture loader.
     *
     * @type {THREE.TextureLoader}
     */
    textureLoader = new THREE.TextureLoader()

    /**
     * Lens flare color.
     *
     * @type {THREE.Color}
     */
    color = new THREE.Color(Constants.WebGL.Sunlight.COLOR)

    /**
     * Blending mode.
     *
     * @type {Number}
     */
    blending = THREE.AdditiveBlending

    /**
     * Adds a lens flare texture to the set.
     *
     * @param {Object} options
     * @param {String} options.url - file name of texture
     * @param {Number} options.diameter - size, in pixels, of texture
     * @param {Number} options.distance - relative distance from light source to camera [0,1]
     */
    addLensFlare = ({ url, diameter, distance }) => {
        this.textureLoader.load(`/static/textures/lensflares/${url}`, (texture) => {
            this.add(texture, diameter, distance, this.blending, this.color);
        });
    }

    /**
     * Renders the lens flare.
     */
    render = () => {
        Constants.WebGL.LENS_FLARES.forEach(this.addLensFlare);
    }

    /**
     * Updates lens flares update positions on all flares based on the screen position.
     * Set myLensFlare.customUpdateCallback to alter the flares in your project specific way.
     *
     * @overrides THREE.LensFlare.updateLensFlares
     */
    updateLensFlares = () => {
        let flare;

        const fl = this.lensFlares.length;
        const vecX = -this.positionScreen.x * 2;
        const vecY = -this.positionScreen.y * 2;

        const cameraDistance = this.camera.position.length();
        const percentDistance = 1 - cameraDistance / Constants.WebGL.Camera.MAX_DISTANCE;
        const isZoomedTooFar = percentDistance < Constants.WebGL.LENS_FLARE_MAX_DISTANCE;

        for (let f = 0; f < fl; f++) {
            flare = this.lensFlares[f];

            flare.x = this.positionScreen.x + vecX * flare.distance;
            flare.y = this.positionScreen.y + vecY * flare.distance;

            flare.wantedRotation = flare.x * Math.PI * 0.25;
            flare.rotation += (flare.wantedRotation - flare.rotation) * 0.25;

            if (flare.distance === 0.0) {
                flare.scale = percentDistance;
            } else {
                flare.scale = isZoomedTooFar ? 0 : 1;
            }
        }
    }
}
