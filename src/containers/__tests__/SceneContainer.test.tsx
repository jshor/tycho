import React from 'react'
import { renderWithStore } from '../../test/render'
import { SceneContainer, Props as SceneContainerProps } from '../SceneContainer'
import { Mutable } from '../../test/helpers'
import data from './__fixtures__/orbitals.json'
import { OrbitalData } from '../../types'
import Controls from '../../utils/Controls'
import { PerspectiveCamera } from 'three'

const baseProps: SceneContainerProps = {
  orbitalData: data as OrbitalData[],
  action: {
    changeZoom: vi.fn(),
    setUIControls: vi.fn(),
    setPlaying: vi.fn(),
    setActiveOrbital: vi.fn(),
    addHighlightedOrbital: vi.fn(),
    removeHighlightedOrbital: vi.fn()
  },
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
    renderWithStore(<SceneContainer {...baseProps} ref={ref} />)
  })

  describe('onAnimate()', () => {
    it('should call props.onAnimate', () => {
      const onAnimate = vi.fn()
      const container = ref.current as Mutable<SceneContainer>
      container.props = { ...baseProps, onAnimate }

      container.onAnimate()

      expect(onAnimate).toHaveBeenCalledTimes(1)
    })
  })

  describe('changeZoom()', () => {
    it('should forward wheel events to controls.wheelZoom when controls are available', () => {
      const container = ref.current
      const controls = new Controls(new PerspectiveCamera(), document.createElement('canvas'))
      const wheelZoom = vi.spyOn(controls, 'wheelZoom')
      const cameraRef = container.cameraRef as Mutable<typeof container.cameraRef>

      cameraRef.current = { controls }

      container.changeZoom({ deltaY: -10 } as React.WheelEvent<HTMLDivElement>)

      expect(wheelZoom).toHaveBeenCalledTimes(1)
    })

    it('should not throw when camera ref has no controls', () => {
      const container = ref.current
      const cameraRef = container.cameraRef as Mutable<typeof container.cameraRef>

      cameraRef.current = null

      expect(() => container.changeZoom({} as React.WheelEvent<HTMLDivElement>)).not.toThrow()
    })
  })

  describe('render()', () => {
    it('should render without crashing', () => {
      const { container: dom } = renderWithStore(<SceneContainer {...baseProps} />)
      expect(dom).toBeTruthy()
    })
  })
})
