import { renderInScene } from '../../test/helpers'
import { Sun } from './sun'
import { Corona } from './corona/corona'
import { LensFlareHelper } from '../../elements/lensFlare'

const flare = vi.hoisted(() => ({
  setOcclusion: vi.fn()
}))

vi.mock('../../elements/lensFlare', () => ({
  // eslint-disable-next-line prefer-arrow-callback
  LensFlareHelper: vi.fn(function () {
    return flare
  })
}))

vi.mock('./corona/corona', () => ({
  Corona: vi.fn(() => null)
}))

describe('Sun Component', () => {
  const occlude = (occlusion: number) => {
    const { calls } = vi.mocked(Corona).mock

    calls[calls.length - 1][0].onOcclude?.(occlusion)
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render without crashing', () => {
    expect(() => renderInScene(<Sun />)).not.toThrow()
  })

  it('should instantiate LensFlareHelper on mount', () => {
    renderInScene(<Sun />)
    expect(LensFlareHelper).toHaveBeenCalled()
  })

  it('should attach the flare to the sun  so it follows it around', () => {
    const { container } = renderInScene(<Sun />)
    const group = container.querySelector('group') as unknown as { add: ReturnType<typeof vi.fn> }

    expect(group.add).toHaveBeenCalledWith(flare)
  })

  it('should put the flare out as the bodies in front of the sun cover it', () => {
    renderInScene(<Sun />)

    occlude(1)

    expect(flare.setOcclusion).toHaveBeenCalledWith(1)
  })

  it('should light the flare back up once the sun is clear again', () => {
    renderInScene(<Sun />)

    occlude(1)
    occlude(0)

    expect(flare.setOcclusion).toHaveBeenLastCalledWith(0)
  })

  it('should leave the flare alone once the sun has left the scene', () => {
    const { unmount } = renderInScene(<Sun />)

    unmount()
    occlude(1)

    expect(flare.setOcclusion).not.toHaveBeenCalled()
  })
})
