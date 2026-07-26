import React from 'react'
import { render } from '@testing-library/react'
import { SpinLabelContainer } from '../SpinLabelContainer'

const action = { setCameraOrbit: vi.fn(), setUIControls: vi.fn() }

describe('Spin Label Container', () => {
  let ref: React.RefObject<SpinLabelContainer>

  const renderWith = (props: any) => {
    ref = React.createRef<SpinLabelContainer>()
    render(<SpinLabelContainer action={action} {...props} ref={ref as any} />)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    renderWith({ isComplete: true, isAutoOrbitEnabled: true, touched: 0 })
  })

  describe('componentDidUpdate()', () => {
    it('should call maybeStopSpinPrompt()', () => {
      const spy = vi.spyOn(ref.current!, 'maybeStopSpinPrompt')
      ref.current!.componentDidUpdate({ touched: 0 } as any)
      expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  describe('maybeStopSpinPrompt()', () => {
    it('should stop orbit when touched changes and component is visible', () => {
      const container = ref.current!
      ;(container as any).props = {
        action,
        touched: 1,
        isComplete: true,
        isAutoOrbitEnabled: true
      }

      container.maybeStopSpinPrompt({ touched: 0 } as any)

      expect(action.setCameraOrbit).toHaveBeenCalledWith(false)
      expect(action.setUIControls).toHaveBeenCalledWith(true)
    })

    it('should not stop orbit when touched value is unchanged', () => {
      const container = ref.current!
      ;(container as any).props = {
        action,
        touched: 1,
        isComplete: true,
        isAutoOrbitEnabled: true
      }

      container.maybeStopSpinPrompt({ touched: 1 } as any)

      expect(action.setCameraOrbit).not.toHaveBeenCalled()
    })

    it('should not stop orbit when component is not visible', () => {
      const container = ref.current!
      ;(container as any).props = {
        action,
        touched: 1,
        isComplete: false,
        isAutoOrbitEnabled: false
      }

      container.maybeStopSpinPrompt({ touched: 0 } as any)

      expect(action.setCameraOrbit).not.toHaveBeenCalled()
    })
  })

  describe('isVisible()', () => {
    it('should return true when complete and auto-orbit enabled', () => {
      ;(ref.current! as any).props = { isComplete: true, isAutoOrbitEnabled: true }
      expect(ref.current!.isVisible()).toBe(true)
    })

    it('should return false when not complete', () => {
      ;(ref.current! as any).props = { isComplete: false, isAutoOrbitEnabled: true }
      expect(ref.current!.isVisible()).toBe(false)
    })
  })
})
