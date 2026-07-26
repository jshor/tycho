import React from 'react'
import { render } from '@testing-library/react'
import { SceneContainer } from '../SceneContainer'
import data from './__fixtures__/orbitals.json'

const baseProps: any = {
  orbitalData: data,
  action: { changeZoom: vi.fn(), setUIControls: vi.fn(), setPlaying: vi.fn() },
  onAnimate: vi.fn(),
  width: 500,
  height: 300,
  time: 1
}

describe('Scene Container', () => {
  let ref: React.RefObject<SceneContainer>

  beforeEach(() => {
    vi.clearAllMocks()
    ref = React.createRef<SceneContainer>()
    render(<SceneContainer {...baseProps} ref={ref as any} />)
  })

  describe('onAnimate()', () => {
    it('should call props.onAnimate', () => {
      const onAnimate = vi.fn()
      const container = ref.current!
      ;(container as any).props = { onAnimate }

      container.onAnimate()

      expect(onAnimate).toHaveBeenCalledTimes(1)
    })
  })

  describe('changeZoom()', () => {
    it('should forward wheel events to controls.wheelZoom when controls are available', () => {
      const wheelZoom = vi.fn()
      const container = ref.current!
      ;(container.cameraRef as any).current = {
        controls: { wheelZoom }
      }

      container.changeZoom({ deltaY: -10 } as WheelEvent)

      expect(wheelZoom).toHaveBeenCalledTimes(1)
    })

    it('should not throw when camera ref has no controls', () => {
      const container = ref.current!
      ;(container.cameraRef as any).current = null

      expect(() => container.changeZoom({} as WheelEvent)).not.toThrow()
    })
  })

  describe('render()', () => {
    it('should render without crashing', () => {
      const { container: dom } = render(<SceneContainer {...baseProps} />)
      expect(dom).toBeTruthy()
    })
  })
})
