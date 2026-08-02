import { render } from '@testing-library/react'
import { SpeedSlider } from './speedSlider'

describe('SpeedSlider Component', () => {
  it('should render without crashing', () => {
    expect(() => render(<SpeedSlider value={4} onChange={vi.fn()} />)).not.toThrow()
  })

  it('should lie along the horizontal', () => {
    const { container } = render(<SpeedSlider value={4} />)

    expect(container.querySelector('.slider--horizontal')).not.toBeNull()
  })

  it('should rest at real time before a speed has been chosen', () => {
    const { container } = render(<SpeedSlider />)

    expect(container.querySelector('.slider__handle')?.getAttribute('aria-valuenow')).toEqual('0')
  })
})
