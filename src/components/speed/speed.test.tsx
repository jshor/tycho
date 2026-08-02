import { fireEvent, render } from '@testing-library/react'
import { Speed } from './speed'

describe('Speed Component', () => {
  /** The button, whose press opens and closes the slider beside it. */
  const button = (container: HTMLElement) => container.querySelector('.speed__button') as Element

  /** Whether the slider is out, which the whole control wears so that it can be animated. */
  const isOpen = (container: HTMLElement) => !!container.querySelector('.speed--open')

  /** Presses somewhere else on the page, as a user reaching past the slider would. */
  const pressElsewhere = () => fireEvent.pointerDown(document.body)

  /** Nudges the slider up a step, as a keyboard would: it listens for the key on the document. */
  const slideUp = (container: HTMLElement) => {
    fireEvent.focus(container.querySelector('.slider__handle') as Element)
    fireEvent.keyDown(document, { key: 'ArrowRight' })
  }

  it('should render without crashing', () => {
    const { container } = render(<Speed speed={0} onChange={vi.fn()} />)

    expect(container).toBeTruthy()
  })

  it('should show the speed as a power of ten', () => {
    const { container } = render(<Speed speed={4} />)

    expect(container.querySelector('.speed__button')?.textContent).toEqual('104')
    expect(container.querySelector('.speed__exponent')?.textContent).toEqual('4')
  })

  it('should show real time as the zeroth power', () => {
    const { container } = render(<Speed />)

    expect(container.querySelector('.speed__exponent')?.textContent).toEqual('0')
  })

  describe('the slider it opens', () => {
    it('should keep the slider to itself until the button is pressed', () => {
      const { container } = render(<Speed speed={1} />)

      expect(isOpen(container)).toBe(false)
      expect(container.querySelector('.speed__popover')?.getAttribute('aria-hidden')).toEqual('true')
    })

    it('should open the slider when the button is clicked', () => {
      const { container } = render(<Speed speed={1} />)

      fireEvent.click(button(container))

      expect(isOpen(container)).toBe(true)
    })

    it('should open the slider for a keyboard that presses the button', () => {
      const { container } = render(<Speed speed={1} />)

      fireEvent.keyDown(button(container), { key: 'Enter' })

      expect(isOpen(container)).toBe(true)
    })

    it('should label the slider', () => {
      const { container } = render(<Speed speed={1} />)

      fireEvent.click(button(container))

      expect(container.querySelector('.speed__popover-label')?.textContent).toEqual('Speed')
    })

    it('should leave the slider in place while closed, so that it has somewhere to fade from', () => {
      const { container } = render(<Speed speed={1} />)

      expect(container.querySelector('.speed__popover')).not.toBeNull()
      expect(container.querySelector('.slider')).not.toBeNull()
    })

    it('should put the slider away again when the button is pressed a second time', () => {
      const { container } = render(<Speed speed={1} />)

      fireEvent.click(button(container))
      fireEvent.click(button(container))

      expect(isOpen(container)).toBe(false)
    })

    it('should put the slider away when the user reaches for anything else', () => {
      const { container } = render(<Speed speed={1} />)

      fireEvent.click(button(container))
      pressElsewhere()

      expect(isOpen(container)).toBe(false)
    })

    it('should stay open for a press on the slider itself', () => {
      const { container } = render(<Speed speed={1} />)

      fireEvent.click(button(container))
      fireEvent.pointerDown(container.querySelector('.speed__popover') as Element)

      expect(isOpen(container)).toBe(true)
    })

    it('should stop listening for presses once it goes away', () => {
      const remove = vi.spyOn(document, 'removeEventListener')
      const { container, unmount } = render(<Speed speed={1} />)

      fireEvent.click(button(container))
      unmount()

      expect(remove).toHaveBeenCalledWith('pointerdown', expect.any(Function))
    })
  })

  it('should not step the speed on its own when the button is pressed', () => {
    const onChange = vi.fn()
    const { container } = render(<Speed speed={1} onChange={onChange} />)

    fireEvent.click(button(container))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('should report the speed the user slid to', () => {
    const onChange = vi.fn()
    const { container } = render(<Speed speed={1} onChange={onChange} />)

    fireEvent.click(button(container))
    slideUp(container)

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]).toEqual(2)
  })
})
