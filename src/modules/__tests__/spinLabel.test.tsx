import { act } from '@testing-library/react'
import { renderWithStore } from '../../test/helpers'
import { useStore } from '../../store'
import { SpinLabel } from '../spinLabel'
import { Store } from '../../types'

const visible = { isComplete: true, isAutoOrbitEnabled: true }

describe('Spin Label Module', () => {
  const renderModule = (state: Partial<Store> = {}) => {
    return renderWithStore(<SpinLabel />, { controlsEnabled: false, ...state })
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

    it('should hide the prompt while the scene is idling', () => {
      const { container } = renderModule({ ...visible, isIdle: true })

      expect(container.querySelector('.spin-container--hide')).not.toBeNull()
    })

    it('should take the prompt away as soon as the scene idles', () => {
      const { container } = renderModule(visible)

      act(() => useStore.setState({ isIdle: true, isAutoOrbitEnabled: true }))

      expect(container.querySelector('.spin-container--hide')).not.toBeNull()
    })
  })
})
