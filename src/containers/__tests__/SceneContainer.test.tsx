import { fireEvent } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import { SceneContainer, Props as SceneContainerProps } from '../SceneContainer'
import data from './__fixtures__/orbitals.json'
import { OrbitalData } from '../../types'

/** Controls' methods are instance properties, so the whole module stands in for the real thing. */
const controls = vi.hoisted(() => ({
  wheelZoom: vi.fn(),
  zoom: vi.fn(),
  tweenZoom: vi.fn(),
  cancelTween: vi.fn(),
  update: vi.fn(),
  faceTarget: vi.fn(),
  dispose: vi.fn(),
  autoRotate: false,
  minDistance: 0,
  enabled: true
}))

vi.mock('../../utils/Controls', () => ({ default: vi.fn(() => controls) }))

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
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('render()', () => {
    it('should render the scene without crashing', () => {
      const { container } = renderWithStore(<SceneContainer {...baseProps} />)

      expect(container).toBeTruthy()
    })

    it('should render a group for each orbital in the scene', () => {
      const { container } = renderWithStore(<SceneContainer {...baseProps} />)

      data.forEach(({ id }) => {
        expect(container.querySelector(`group[name="${id}"]`)).not.toBeNull()
      })
    })
  })

  describe('changeZoom()', () => {
    it('should zoom the camera by however far the user scrolled', () => {
      const { container } = renderWithStore(<SceneContainer {...baseProps} />)

      fireEvent.wheel(container.firstElementChild as HTMLElement, { deltaY: -10 })

      expect(controls.wheelZoom).toHaveBeenCalledTimes(1)
      expect(controls.wheelZoom).toHaveBeenCalledWith(
        expect.anything(),
        baseProps.action.changeZoom
      )
    })
  })
})
