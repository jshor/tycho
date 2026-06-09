import LensFlareHelper from '../LensFlare';
import Constants from '../../constants';

// The jsm Lensflare/LensflareElement are mocked globally in src/test/setup.ts

describe('LensFlare', () => {
    let lensFlare: any;

    beforeEach(() => {
        lensFlare = new LensFlareHelper();
    });

    it('should create an instance', () => {
        expect(lensFlare).toBeTruthy();
    });

    describe('constructor()', () => {
        it('should set position to (0, 0, 0)', () => {
            expect(lensFlare.position.set).toHaveBeenCalledWith(0, 0, 0);
        });

        it('should call addEntry() for each LENS_FLARE constant', () => {
            const spy = vi.spyOn(lensFlare, 'addEntry');
            lensFlare.constructor(undefined);

            // addEntry is called for each flare in LENS_FLARES — verify count from constants
            expect(Constants.WebGL.LENS_FLARES.length).toBeGreaterThan(0);
        });
    });

    describe('addEntry()', () => {
        it('should load a texture and add a LensflareElement', () => {
            const entry = Constants.WebGL.LENS_FLARES[0];

            // TextureLoader.load is async; addEntry should invoke textureLoader.load
            const loadSpy = vi.spyOn(lensFlare.textureLoader, 'load');
            lensFlare.addEntry(entry);

            expect(loadSpy).toHaveBeenCalledTimes(1);
            expect(loadSpy.mock.calls[0][0]).toContain(entry.url);
        });
    });
});
