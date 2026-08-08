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
      expect(changeZoom).toHaveBeenCalledTimes(1)
      expect(changeZoom).toHaveBeenCalledWith(newZoom)
    })

    it('should leave the zoom alone when the level has not changed', () => {
      const newZoom = 20
      const changeZoom = vi.fn()
      const { container } = renderWithStore(<Scene {...baseProps} />, {
        orbitalData,
        time: 1,
        changeZoom
      })

      controls.getZoomDelta.mockReturnValue(newZoom)
      controls.level = newZoom / 100

      fireEvent.wheel(container.firstElementChild as HTMLElement, { deltaY: -10 })

      expect(changeZoom).not.toHaveBeenCalled()
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

      // the fingers spread 60px apart, which zooms in by the steps the wheel zooms in
      expect(controls.getZoomDelta).toHaveBeenCalledWith(-60 * Constants.UI.PINCH_DELTA_SCALE)
      expect(changeZoom).toHaveBeenCalledTimes(1)
      expect(changeZoom).toHaveBeenCalledWith(newZoom)
    })
  })
})
