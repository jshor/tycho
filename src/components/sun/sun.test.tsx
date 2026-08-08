import { renderInScene } from '../../test/helpers'
import { Sun } from './sun'
import { LensFlareHelper } from '../../elements/lensFlare'

vi.mock('../../elements/lensFlare')

describe('Sun Component', () => {
  it('should render without crashing', () => {
    expect(() => renderInScene(<Sun />)).not.toThrow()
  })

  it('should instantiate LensFlareHelper on mount', () => {
    renderInScene(<Sun />)
    expect(LensFlareHelper).toHaveBeenCalled()
  })
})
