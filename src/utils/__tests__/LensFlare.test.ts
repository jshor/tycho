import LensFlare from '../LensFlare';
import Constants from '../../constants';

describe('Lens Flare', () => {
    let lensFlare;
    let cameraDistance;

    const camera = {
        position: {
            length: () => cameraDistance
        }
    };

    beforeEach(() => {
        lensFlare = new LensFlare(camera);
    });

    describe('render()', () => {
        it('should call addLensFlare() on each instance of LENS_FLARES', () => {
            const {LENS_FLARES} = Constants.WebGL;
            const spy = jest.spyOn(lensFlare, 'addLensFlare');

            lensFlare.render();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(LENS_FLARES.length);
        });
    });

    describe('updateLensFlares()', () => {
        beforeEach(() => {
            lensFlare.add(null, 20, 0.0);
            lensFlare.add(null, 40, 0.3);
        });

        it('should scale the origin flare to the percentage of distance', () => {
            cameraDistance = Constants.WebGL.Camera.MAX_DISTANCE / 2; // 50% camera pan
            lensFlare.updateLensFlares();

            expect(lensFlare.lensFlares[0].scale).toEqual(0.5);
        });

        describe('when zoomed beyond LENS_FLARE_MAX_DISTANCE', () => {
            it('should set the sprite scales to 0', () => {
                cameraDistance = Constants.WebGL.Camera.MAX_DISTANCE;
                lensFlare.updateLensFlares();

                expect(lensFlare.lensFlares[1].scale).toEqual(0);
            });
        });

        describe('when camera is panned within LENS_FLARE_MAX_DISTANCE', () => {
            it('should set the sprite scales to 1', () => {
                cameraDistance = 0;
                lensFlare.updateLensFlares();

                expect(lensFlare.lensFlares[1].scale).toEqual(1);
            });
        });
    });
});
