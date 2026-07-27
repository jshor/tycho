import { fireEvent } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import Scene from '../scene'
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

const orbitalData = data as OrbitalData[]

const baseProps = { onAnimate: vi.fn(), width: 500, height: 300 }

describe('Scene Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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

  describe('changeZoom()', () => {
    it('should zoom the camera by however far the user scrolled', () => {
      const changeZoom = vi.fn()
      const { container } = renderWithStore(<Scene {...baseProps} />, {
        orbitalData,
        time: 1,
        changeZoom
      })

      fireEvent.wheel(container.firstElementChild as HTMLElement, { deltaY: -10 })

      expect(controls.wheelZoom).toHaveBeenCalledTimes(1)
      expect(controls.wheelZoom).toHaveBeenCalledWith(expect.anything(), changeZoom)
    })
  })
})
