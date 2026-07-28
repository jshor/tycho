import { act } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import useStore from '../../store'
import SpinLabel from '../spinLabel'
import { Store } from '../../types'

const visible = { isComplete: true, isAutoOrbitEnabled: true }

describe('Spin Label Module', () => {
  const renderModule = (state: Partial<Store> = {}) => {
    return renderWithStore(<SpinLabel />, { touched: 0, controlsEnabled: false, ...state })
  }

  /**
   * Reaches for the scene, the way the event module does.
   */
  const touchScene = () => act(() => useStore.setState({ touched: 1 }))

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
      renderModule(visible)
      touchScene()

      const { isAutoOrbitEnabled, controlsEnabled } = useStore.getState()

      expect(isAutoOrbitEnabled).toBe(false)
      expect(controlsEnabled).toBe(true)
    })

    it('should do nothing while the user has not reached for the scene', () => {
      renderModule(visible)

      act(() => useStore.setState({ touched: 0 }))

      expect(useStore.getState().isAutoOrbitEnabled).toBe(true)
    })

    it('should do nothing when the prompt is not on screen', () => {
      renderModule({ isComplete: false, isAutoOrbitEnabled: true })
      touchScene()

      expect(useStore.getState().isAutoOrbitEnabled).toBe(true)
    })
  })
})
