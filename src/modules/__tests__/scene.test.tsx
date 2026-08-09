import { fireEvent } from '@testing-library/react'
import { renderWithStore } from '../../test/helpers'
import { Scene } from '../scene'
import { Constants } from '../../constants'
import data from './__fixtures__/orbitals.json'
import { OrbitalData } from '../../types'

const controls = vi.hoisted(() => ({
  getZoomDelta: vi.fn(),
  level: 0,
  zoom: vi.fn(),
  tweenZoom: vi.fn(),
  cancelTween: vi.fn(),
  setMinDistance: vi.fn(),
  update: vi.fn(),
  faceTarget: vi.fn(),
  dispose: vi.fn(),
  autoRotate: false,
  minDistance: 0,
  enabled: true
}))

vi.mock('../../elements/ambience')
vi.mock('../../elements/controls', () => ({
  // eslint-disable-next-line prefer-arrow-callback
  Controls: vi.fn(function () {
    return controls
  })
}))

const orbitalData = data as OrbitalData[]

const baseProps = {
  onAnimate: vi.fn(),
  width: 500,
  height: 300
}

describe('Scene Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    controls.level = 0
  })

  describe('render()', () => {
    it('should render the scene without crashing', () => {
      const { container } = renderWithStore(<Scene {...baseProps} />, { orbitalData, time: 1 })

      expect(container).toBeTruthy()
    })

    it('should render a group for each orbital in the scene', () => {
      const { container } = renderWithStore(<Scene {...baseProps} />, { orbitalData, time: 1 })

      orbitalData.forEach(({ id }) => {
        expect(container.querySelector(`group[name="${id}"]`)).not.toBeNull()
      })
    })
  })

  describe('onWheel()', () => {
    it('should zoom the camera by however far the user scrolled', () => {
      const newZoom = 20
      const changeZoom = vi.fn()
      const { container } = renderWithStore(<Scene {...baseProps} />, {
        orbitalData,
        time: 1,
        changeZoom
      })

      controls.getZoomDelta.mockReturnValue(newZoom)

      fireEvent.wheel(container.firstElementChild as HTMLElement, { deltaY: -10 })

      expect(controls.getZoomDelta).toHaveBeenCalledWith(-10)
      expect(controls.tweenZoom).toHaveBeenCalledTimes(1)
      expect(controls.tweenZoom).toHaveBeenCalledWith(newZoom, expect.any(Function), Constants.WebGL.Tween.ZOOM)
    })

    it('should leave the zoom alone when the level has not changed', () => {
      const { container } = renderWithStore(<Scene {...baseProps} />, {
        orbitalData,
        time: 1
      })

      controls.getZoomDelta.mockReturnValue(20)
      controls.level = 20 / 100

      fireEvent.wheel(container.firstElementChild as HTMLElement, { deltaY: -10 })

      expect(controls.tweenZoom).not.toHaveBeenCalled()
    })
  })

  describe('onPinch()', () => {
    /** Two fingers the given distance apart, along the x axis. */
    const fingers = (separation: number) => ({
      touches: [
        { clientX: 0, clientY: 0 },
        { clientX: separation, clientY: 0 }
      ]
    })

    it('should zoom the camera by however far the user pinched', () => {
      const newZoom = 20
      const changeZoom = vi.fn()
      const { container } = renderWithStore(<Scene {...baseProps} />, {
        orbitalData,
        time: 1,
        changeZoom
      })
      const scene = container.firstElementChild as HTMLElement

      controls.getZoomDelta.mockReturnValue(newZoom)

      fireEvent.touchStart(scene, fingers(100))
      fireEvent.touchMove(scene, fingers(160))

      expect(controls.getZoomDelta).toHaveBeenCalledWith(-60 * Constants.UI.PINCH_DELTA_SCALE)
      expect(changeZoom).toHaveBeenCalledTimes(1)
      expect(changeZoom).toHaveBeenCalledWith(newZoom)
    })

    it('should follow the fingers rather than ease after them as the wheel does', () => {
      const { container } = renderWithStore(<Scene {...baseProps} />, { orbitalData, time: 1 })
      const scene = container.firstElementChild as HTMLElement

      controls.getZoomDelta.mockReturnValue(20)

      fireEvent.touchStart(scene, fingers(100))
      fireEvent.touchMove(scene, fingers(160))
      fireEvent.touchMove(scene, fingers(220))

      // a pinch reports a delta every frame, so a tween on each would only fight the gesture
      expect(controls.tweenZoom).not.toHaveBeenCalled()
    })
  })
})
