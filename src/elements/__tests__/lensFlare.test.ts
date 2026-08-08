import { Texture, TextureLoader } from 'three'
import { LensFlareHelper } from '../lensFlare'
import { Constants } from '../../constants'

vi.mock('three/examples/jsm/objects/Lensflare.js', () => ({
  Lensflare: vi.fn().mockImplementation(function (this: {
    position: {
      set: () => void
    }
    addElement: () => void
  }) {
    this.position = {
      set: vi.fn()
    }
    this.addElement = vi.fn()
  }),
  LensflareElement: vi.fn()
}))

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
      const spy = vi.spyOn(TextureLoader.prototype, 'load').mockImplementation(() => new Texture())

      new LensFlareHelper()

      expect(spy).toHaveBeenCalledTimes(Constants.WebGL.LENS_FLARES.length)
      spy.mockRestore()
    })
  })

  describe('addEntry()', () => {
    it('should load a texture and add a LensflareElement', () => {
      const entry = Constants.WebGL.LENS_FLARES[0]
      const loadSpy = vi.spyOn(lensFlare.textureLoader, 'load')

      lensFlare.addEntry(entry)

      expect(loadSpy).toHaveBeenCalledTimes(1)
      expect(loadSpy.mock.calls[0][0]).toContain(entry.url)
    })
  })
})
