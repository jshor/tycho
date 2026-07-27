import { render } from '@testing-library/react'
import Sun from './Sun'
import LensFlareHelper from '../../utils/LensFlare'

describe('Sun Component', () => {
  it('should render without crashing', () => {
    expect(() => render(<Sun />)).not.toThrow()
  })

  it('should instantiate LensFlareHelper on mount', () => {
    render(<Sun />)
    expect(LensFlareHelper).toHaveBeenCalled()
  })
})
