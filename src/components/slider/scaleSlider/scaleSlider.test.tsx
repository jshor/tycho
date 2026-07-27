import { render } from '@testing-library/react'
import ScaleSlider from './scaleSlider'

describe('ScaleSlider Component', () => {
  it('should render without crashing', () => {
    expect(() =>
      render(<ScaleSlider value={1} min={0} max={10} onChange={vi.fn()} />)
    ).not.toThrow()
  })
})
