import { Color, Texture, TextureLoader } from 'three'
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
  LensflareElement: vi.fn(function (
    this: { color: Color },
    texture: Texture,
    size: number,
    distance: number,
    color: Color
  ) {
    this.color = color
  })
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

    it('should hold on to each flare it loads, so they may be dimmed later on', () => {
      loadEntries(lensFlare)

      expect(lensFlare.flares).toHaveLength(Constants.WebGL.LENS_FLARES.length)
    })

    it('should give every flare a color of its own to be tinted through', () => {
      loadEntries(lensFlare)

      const [first, second] = lensFlare.flares

      expect(first.color).not.toBe(second.color)
      expect(first.color).not.toBe(lensFlare.color)
      expect(first.color.getHex()).toEqual(lensFlare.color.getHex())
    })
  })

  const loadEntries = (flare: LensFlareHelper) => {
    vi.spyOn(flare.textureLoader, 'load').mockImplementation((url, onLoad) => {
      onLoad?.(new Texture())
      return new Texture()
    })

    Constants.WebGL.LENS_FLARES.forEach(flare.addEntry)
  }

  describe('setOcclusion()', () => {
    beforeEach(() => loadEntries(lensFlare))

    const colors = () => lensFlare.flares.map(({ color }) => color.getHexString())

    it('should show the flare in full while nothing covers the sun', () => {
      lensFlare.setOcclusion(0)

      expect(lensFlare.visible).toBe(true)
      expect(colors()).toEqual(lensFlare.flares.map(() => lensFlare.color.getHexString()))
    })

    it('should put the flare out once a body covers the sun entirely', () => {
      lensFlare.setOcclusion(1)

      expect(lensFlare.visible).toBe(false)
      expect(colors()).toEqual(lensFlare.flares.map(() => '000000'))
    })

    it('should dim the flare by however much of the sun is covered', () => {
      lensFlare.setOcclusion(0.5)

      const [flare] = lensFlare.flares

      expect(lensFlare.visible).toBe(true)
      expect(flare.color.r).toBeCloseTo(lensFlare.color.r / 2)
    })

    it('should light the flare again once the body has passed by', () => {
      lensFlare.setOcclusion(1)
      lensFlare.setOcclusion(0)

      expect(lensFlare.visible).toBe(true)
      expect(colors()).toEqual(lensFlare.flares.map(() => lensFlare.color.getHexString()))
    })

    it('should hold the flare within its bounds however far past them it is taken', () => {
      lensFlare.setOcclusion(4)

      expect(lensFlare.visible).toBe(false)

      lensFlare.setOcclusion(-4)

      expect(lensFlare.flares[0].color.getHexString()).toEqual(lensFlare.color.getHexString())
    })
  })
})
