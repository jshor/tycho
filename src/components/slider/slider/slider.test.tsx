import { render } from '@testing-library/react'
import { Slider } from './slider'

describe('Slider Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<Slider onChange={vi.fn()} orientation="vertical" value={50} />)

    expect(container).toBeTruthy()
  })

  it('should apply the orientation to each of its parts', () => {
    const { container } = render(<Slider onChange={vi.fn()} orientation="horizontal" value={40} />)

    expect(container.querySelector('.slider__container--horizontal')).not.toBeNull()
    expect(container.querySelector('.slider__handle--horizontal')).not.toBeNull()
    expect(container.querySelector('.slider__bar--horizontal')).not.toBeNull()
  })
})
