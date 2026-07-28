import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Label from './label'
import Constants from '../../../constants'

const action = {
  setActiveOrbital: vi.fn(),
  addHighlightedOrbital: vi.fn(),
  removeHighlightedOrbital: vi.fn()
}

describe('Orbital Label Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the label text', () => {
    render(<Label text="Earth" id="Earth" action={action} />)
    expect(screen.getByText('Earth')).toBeInTheDocument()
  })

  it('should hide a satellite label when its parent orbital is not focused', () => {
    render(
      <Label text="Moon" id="Moon" action={action} isSatellite parentId="Earth" targetId="Mars" />
    )
    expect(screen.queryByText('Moon')).not.toBeInTheDocument()
  })

  it('should show a satellite label when its parent orbital is focused', () => {
    render(
      <Label text="Moon" id="Moon" action={action} isSatellite parentId="Earth" targetId="Earth" />
    )
    expect(screen.getByText('Moon')).toBeInTheDocument()
  })

  it('should show a satellite label when the satellite itself is focused', () => {
    render(
      <Label text="Moon" id="Moon" action={action} isSatellite parentId="Earth" targetId="Moon" />
    )
    expect(screen.getByText('Moon')).toBeInTheDocument()
  })

  it('should always show a non-satellite (planet) label', () => {
    render(<Label text="Earth" id="Earth" action={action} targetId="Mars" />)
    expect(screen.getByText('Earth')).toBeInTheDocument()
  })

  it('should call setActiveOrbital on click', async () => {
    const user = userEvent.setup()
    render(<Label text="Earth" id="Earth" action={action} />)

    await user.click(screen.getByText('Earth'))

    expect(action.setActiveOrbital).toHaveBeenCalledWith('Earth', 'Earth')
  })

  describe('tapping', () => {
    /**
     * Presses and releases the label, with the pointer drifting the given distance between.
     *
     * jsdom has no PointerEvent, and the plain Event that testing-library falls back to carries
     * no coordinates at all, so these are dispatched as mouse events instead.
     */
    const tap = (drift: number) => {
      const label = screen.getByText('Earth')
      const press = { bubbles: true, clientX: 100, clientY: 100 }

      fireEvent(label, new MouseEvent('pointerdown', press))
      fireEvent(label, new MouseEvent('pointerup', { ...press, clientX: 100 + drift }))
    }

    it('should focus the orbital when a finger lands and lifts on it', () => {
      render(<Label text="Earth" id="Earth" action={action} />)

      tap(0)

      expect(action.setActiveOrbital).toHaveBeenCalledWith('Earth', 'Earth')
    })

    it('should forgive a finger that drifts as it lifts', () => {
      render(<Label text="Earth" id="Earth" action={action} />)

      tap(Constants.UI.FAT_FINGER - 1)

      expect(action.setActiveOrbital).toHaveBeenCalledWith('Earth', 'Earth')
    })

    it('should leave the orbital alone when the scene was dragged instead', () => {
      render(<Label text="Earth" id="Earth" action={action} />)

      tap(Constants.UI.FAT_FINGER + 1)

      expect(action.setActiveOrbital).not.toHaveBeenCalled()
    })

    it('should leave the orbital alone when a release arrives without a press', () => {
      render(<Label text="Earth" id="Earth" action={action} />)

      fireEvent(
        screen.getByText('Earth'),
        new MouseEvent('pointerup', { bubbles: true, clientX: 100, clientY: 100 })
      )

      expect(action.setActiveOrbital).not.toHaveBeenCalled()
    })
  })

  it('should highlight the orbital on pointer over', async () => {
    const user = userEvent.setup()
    render(<Label text="Earth" id="Earth" action={action} />)

    await user.hover(screen.getByText('Earth'))

    expect(action.addHighlightedOrbital).toHaveBeenCalledWith('Earth')
  })

  it('should remove the highlight once the pointer has stayed away', async () => {
    const user = userEvent.setup()
    render(<Label text="Earth" id="Earth" action={action} />)

    await user.hover(screen.getByText('Earth'))
    await user.unhover(screen.getByText('Earth'))

    // the label holds its highlight for a moment first, in case the pointer is coming back
    expect(action.removeHighlightedOrbital).not.toHaveBeenCalled()

    await waitFor(() => expect(action.removeHighlightedOrbital).toHaveBeenCalledWith('Earth'))
  })

  it('should keep the highlight when the pointer flickers off the label and back', async () => {
    const user = userEvent.setup()
    render(<Label text="Earth" id="Earth" action={action} />)
    const label = screen.getByText('Earth')

    await user.hover(label)
    await user.unhover(label)
    await user.hover(label)

    // long enough that a departure would have been seen through had it not been called off
    await new Promise((resolve) => setTimeout(resolve, Constants.UI.HOVER_LINGER * 2))

    expect(action.removeHighlightedOrbital).not.toHaveBeenCalled()
  })
})
