import { fireEvent, render, screen } from '@testing-library/react'
import { Slider } from './slider'

describe('Slider Component', () => {
  it('should render without crashing', () => {
    const { container } = render(
      <Slider label="Level" onChange={vi.fn()} orientation="vertical" value={50} />
    )

    expect(container).toBeTruthy()
  })

  it('should apply the orientation to each of its parts', () => {
    const { container } = render(
      <Slider label="Level" onChange={vi.fn()} orientation="horizontal" value={40} />
    )

    expect(container.querySelector('.slider__container--horizontal')).not.toBeNull()
    expect(container.querySelector('.slider__handle--horizontal')).not.toBeNull()
    expect(container.querySelector('.slider__bar--horizontal')).not.toBeNull()
  })

  describe('to assistive technology', () => {
    it('should name the slider after what it sets', () => {
      render(<Slider label="Level" orientation="vertical" value={50} />)

      expect(screen.getByRole('slider', { name: 'Level' })).toBeInTheDocument()
    })

    it('should read out the value as it means to the user', () => {
      render(
        <Slider label="Level" orientation="vertical" value={50} valueText={(v) => `${v} percent`} />
      )

      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '50 percent')
    })
  })

  describe('from the keyboard', () => {
    const renderKeyed = (value = 50) => {
      const onChange = vi.fn()

      render(
        <Slider
          label="Level"
          orientation="vertical"
          step={0.005}
          keyboardStep={5}
          value={value}
          onChange={onChange}
        />
      )

      return onChange
    }

    it.each([
      ['ArrowUp', 55],
      ['ArrowRight', 55],
      ['ArrowDown', 45],
      ['ArrowLeft', 45],
      ['PageUp', 100],
      ['PageDown', 0],
      ['Home', 0],
      ['End', 100]
    ])('should move by the keyboard step on %s, rather than the far finer drag step', (key, to) => {
      const onChange = renderKeyed()

      fireEvent.keyDown(screen.getByRole('slider'), { key })

      expect(onChange).toHaveBeenCalledWith(to)
    })

    it('should hold the value within its bounds', () => {
      const onChange = renderKeyed(98)

      fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowUp' })

      expect(onChange).toHaveBeenCalledWith(100)
    })

    it('should leave every other key alone', () => {
      const onChange = renderKeyed()

      fireEvent.keyDown(screen.getByRole('slider'), { key: 'Tab' })

      expect(onChange).not.toHaveBeenCalled()
    })
  })
})
