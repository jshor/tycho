import { Texture, TextureLoader } from 'three'
import { LensFlareHelper } from '../LensFlare'
import { Constants } from '../../constants'

// The jsm Lensflare/LensflareElement are mocked globally in src/test/setup.ts

describe('LensFlare', () => {
  let lensFlare: LensFlareHelper

  beforeEach(() => {
    lensFlare = new LensFlareHelper()
  })

  it('should create an instance', () => {
    expect(lensFlare).toBeTruthy()
  })

  describe('constructor()', () => {
    it('should set position to (0, 0, 0)', () => {
      expect(lensFlare.position.set).toHaveBeenCalledWith(0, 0, 0)
    })

    it('should call addEntry() for each LENS_FLARE constant', () => {
      // addEntry runs during construction, so the only way to observe it is to watch what it
      // does — load one texture per configured flare — with the spy installed beforehand.
      const spy = vi.spyOn(TextureLoader.prototype, 'load').mockImplementation(() => new Texture())

      new LensFlareHelper()

      expect(spy).toHaveBeenCalledTimes(Constants.WebGL.LENS_FLARES.length)

      spy.mockRestore()
    })
  })

  describe('addEntry()', () => {
    it('should load a texture and add a LensflareElement', () => {
      const entry = Constants.WebGL.LENS_FLARES[0]

      // TextureLoader.load is async; addEntry should invoke textureLoader.load
      const loadSpy = vi.spyOn(lensFlare.textureLoader, 'load')
      lensFlare.addEntry(entry)

      expect(loadSpy).toHaveBeenCalledTimes(1)
      expect(loadSpy.mock.calls[0][0]).toContain(entry.url)
    })
  })
})
