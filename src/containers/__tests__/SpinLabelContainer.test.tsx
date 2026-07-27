import React from 'react'
import { renderWithStore } from '../../test/render'
import { SpinLabelContainer, Props as SpinLabelProps } from '../SpinLabelContainer'
import { Mutable } from '../../test/helpers'

const action = { setCameraOrbit: vi.fn(), setUIControls: vi.fn() }

describe('Spin Label Container', () => {
  let ref: React.RefObject<SpinLabelContainer>

  const renderWith = (props: Partial<SpinLabelProps>) => {
    ref = React.createRef<SpinLabelContainer>()
    renderWithStore(<SpinLabelContainer action={action} {...props} ref={ref} />)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    renderWith({ isComplete: true, isAutoOrbitEnabled: true, touched: 0 })
  })

  describe('componentDidUpdate()', () => {
    it('should call maybeStopSpinPrompt()', () => {
      const spy = vi.spyOn(ref.current, 'maybeStopSpinPrompt')
      ref.current?.componentDidUpdate({ touched: 0 })
      expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  describe('maybeStopSpinPrompt()', () => {
    it('should stop orbit when touched changes and component is visible', () => {
      const container = ref.current as Mutable<SpinLabelContainer>
      container.props = {
        action,
        touched: 1,
        isComplete: true,
        isAutoOrbitEnabled: true
      }

      container.maybeStopSpinPrompt({ touched: 0 })

      expect(action.setCameraOrbit).toHaveBeenCalledWith(false)
      expect(action.setUIControls).toHaveBeenCalledWith(true)
    })

    it('should not stop orbit when touched value is unchanged', () => {
      const container = ref.current as Mutable<SpinLabelContainer>
      container.props = {
        action,
        touched: 1,
        isComplete: true,
        isAutoOrbitEnabled: true
      }

      container.maybeStopSpinPrompt({ touched: 1 })

      expect(action.setCameraOrbit).not.toHaveBeenCalled()
    })

    it('should not stop orbit when component is not visible', () => {
      const container = ref.current as Mutable<SpinLabelContainer>
      container.props = {
        action,
        touched: 1,
        isComplete: false,
        isAutoOrbitEnabled: false
      }

      container.maybeStopSpinPrompt({ touched: 0 })

      expect(action.setCameraOrbit).not.toHaveBeenCalled()
    })
  })

  describe('isVisible()', () => {
    it('should return true when complete and auto-orbit enabled', () => {
      const current = ref.current as Mutable<SpinLabelContainer>
      current.props = {
        isComplete: true,
        isAutoOrbitEnabled: true
      }
      expect(current.isVisible()).toBe(true)
    })

    it('should return false when not complete', () => {
      const current = ref.current as Mutable<SpinLabelContainer>
      current.props = {
        isComplete: false,
        isAutoOrbitEnabled: true
      }
      expect(current.isVisible()).toBe(false)
    })
  })
})
