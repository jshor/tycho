import * as THREE from 'three';
import Constants from '../constants';
import { LensFlareEntry } from '../constants/WebGL';

export default class LensFlare extends (THREE as any).LensFlare {

    camera: any;
    textureLoader: THREE.TextureLoader = new THREE.TextureLoader();
    color: THREE.Color = new THREE.Color(Constants.WebGL.Sunlight.COLOR);
    blending: number = (THREE as any).AdditiveBlending;

    constructor(camera: any) {
        super();
        this.render();
        this.position.set(0, 0, 0);
        this.camera = camera;
    }

    addLensFlare = ({ url, diameter, distance }: LensFlareEntry): void => {
        this.textureLoader.load(`/static/textures/lensflares/${url}`, (texture: THREE.Texture) => {
            this.add(texture, diameter, distance, this.blending, this.color);
        });
    }

    render = (): void => {
        Constants.WebGL.LENS_FLARES.forEach(this.addLensFlare);
    }

    updateLensFlares = (): void => {
        let flare: any;

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
