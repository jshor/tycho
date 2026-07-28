import { render } from '@testing-library/react'
import { ZoomSlider } from './zoomSlider'

describe('ZoomSlider Component', () => {
  it('should render without crashing', () => {
    expect(() => render(<ZoomSlider value={50} onChange={vi.fn()} />)).not.toThrow()
  })
})
