import { render } from '@testing-library/react'
import { SpinLabel, Props } from '../spinLabel'

const action = { setCameraOrbit: vi.fn(), setUIControls: vi.fn() }

const visible = { isComplete: true, isAutoOrbitEnabled: true }

describe('Spin Label Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderModule = (props: Partial<Props> = {}) => {
    return render(<SpinLabel action={action} touched={0} {...props} />)
  }

  describe('isVisible()', () => {
    it('should show the prompt once the tour completes and the camera is orbiting', () => {
      const { container } = renderModule(visible)

      expect(container.querySelector('.spin-container--show')).not.toBeNull()
    })

    it('should hide the prompt until the tour completes', () => {
      const { container } = renderModule({ isComplete: false, isAutoOrbitEnabled: true })

      expect(container.querySelector('.spin-container--hide')).not.toBeNull()
    })

    it('should hide the prompt while the camera is not orbiting', () => {
      const { container } = renderModule({ isComplete: true, isAutoOrbitEnabled: false })

      expect(container.querySelector('.spin-container--hide')).not.toBeNull()
    })
  })

  describe('maybeStopSpinPrompt()', () => {
    it('should hand the camera to the user when they reach for the visible scene', () => {
      const { rerender } = renderModule(visible)

      rerender(<SpinLabel action={action} touched={1} {...visible} />)

      expect(action.setCameraOrbit).toHaveBeenCalledWith(false)
      expect(action.setUIControls).toHaveBeenCalledWith(true)
    })

    it('should do nothing while the user has not reached for the scene', () => {
      const { rerender } = renderModule(visible)

      rerender(<SpinLabel action={action} touched={0} {...visible} />)

      expect(action.setCameraOrbit).not.toHaveBeenCalled()
    })

    it('should do nothing when the prompt is not on screen', () => {
      const { rerender } = renderModule({ isComplete: false, isAutoOrbitEnabled: false })

      rerender(
        <SpinLabel action={action} touched={1} isComplete={false} isAutoOrbitEnabled={false} />
      )

      expect(action.setCameraOrbit).not.toHaveBeenCalled()
    })
  })
})
