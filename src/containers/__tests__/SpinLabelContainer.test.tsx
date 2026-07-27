import { render } from '@testing-library/react'
import { SpinLabelContainer, Props } from '../SpinLabelContainer'

const action = { setCameraOrbit: vi.fn(), setUIControls: vi.fn() }

const visible = { isComplete: true, isAutoOrbitEnabled: true }

describe('Spin Label Container', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderContainer = (props: Partial<Props> = {}) => {
    return render(<SpinLabelContainer action={action} touched={0} {...props} />)
  }

  describe('isVisible()', () => {
    it('should show the prompt once the tour completes and the camera is orbiting', () => {
      const { container } = renderContainer(visible)

      expect(container.querySelector('.spin-container--show')).not.toBeNull()
    })

    it('should hide the prompt until the tour completes', () => {
      const { container } = renderContainer({ isComplete: false, isAutoOrbitEnabled: true })

      expect(container.querySelector('.spin-container--hide')).not.toBeNull()
    })

    it('should hide the prompt while the camera is not orbiting', () => {
      const { container } = renderContainer({ isComplete: true, isAutoOrbitEnabled: false })

      expect(container.querySelector('.spin-container--hide')).not.toBeNull()
    })
  })

  describe('maybeStopSpinPrompt()', () => {
    it('should hand the camera to the user when they reach for the visible scene', () => {
      const { rerender } = renderContainer(visible)

      rerender(<SpinLabelContainer action={action} touched={1} {...visible} />)

      expect(action.setCameraOrbit).toHaveBeenCalledWith(false)
      expect(action.setUIControls).toHaveBeenCalledWith(true)
    })

    it('should do nothing while the user has not reached for the scene', () => {
      const { rerender } = renderContainer(visible)

      rerender(<SpinLabelContainer action={action} touched={0} {...visible} />)

      expect(action.setCameraOrbit).not.toHaveBeenCalled()
    })

    it('should do nothing when the prompt is not on screen', () => {
      const { rerender } = renderContainer({ isComplete: false, isAutoOrbitEnabled: false })

      rerender(
        <SpinLabelContainer
          action={action}
          touched={1}
          isComplete={false}
          isAutoOrbitEnabled={false}
        />
      )

      expect(action.setCameraOrbit).not.toHaveBeenCalled()
    })
  })
})
