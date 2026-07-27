import { Vector3 } from 'three'
import { render } from '@testing-library/react'
import data from './__fixtures__/orbitals.json'
import { Orbital } from '../orbital'
import OrbitalService from '../../services/OrbitalService'
import Constants from '../../constants'

const action = {
  setActiveOrbital: vi.fn(),
  addHighlightedOrbital: vi.fn(),
  removeHighlightedOrbital: vi.fn()
}

const orbital = data[0]

const baseProps = { ...orbital, time: 1, action }

describe('Orbital Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('render()', () => {
    it('should render a group named after the orbital', () => {
      const { container } = render(<Orbital {...baseProps} />)

      expect(container.querySelector(`group[name="${orbital.id}"]`)).not.toBeNull()
    })

    it('should position the body along its orbit at the current time', () => {
      const position = new Vector3(1, 2, 3)
      const spy = vi.spyOn(OrbitalService, 'getBodyPosition').mockReturnValue(position)

      render(<Orbital {...baseProps} />)

      expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  describe('body state', () => {
    it('should reposition the body as the clock ticks', () => {
      const spy = vi.spyOn(OrbitalService, 'getBodyPosition')
      const { rerender } = render(<Orbital {...baseProps} />)

      spy.mockClear()
      rerender(<Orbital {...baseProps} time={2} />)

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should leave the body where it is when nothing has changed', () => {
      const spy = vi.spyOn(OrbitalService, 'getBodyPosition')
      const { rerender } = render(<Orbital {...baseProps} />)

      spy.mockClear()
      rerender(<Orbital {...baseProps} />)

      expect(spy).not.toHaveBeenCalled()
    })

    it('should reposition the body when the scale changes', () => {
      const spy = vi.spyOn(OrbitalService, 'getBodyPosition')
      const { rerender } = render(<Orbital {...baseProps} scale={1} />)

      spy.mockClear()
      rerender(<Orbital {...baseProps} scale={2} />)

      expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  describe('scale', () => {
    it("should rescale a satellite's orbit when the scale changes", () => {
      const spy = vi.spyOn(OrbitalService, 'getMaxViewDistance')
      const { rerender } = render(<Orbital {...baseProps} scale={1} isSatellite />)

      spy.mockClear()
      rerender(<Orbital {...baseProps} scale={2} isSatellite />)

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should rebuild the orbit path when the scale changes', () => {
      const { container, rerender } = render(<Orbital {...baseProps} scale={1} isSatellite />)
      const before = container.innerHTML

      rerender(<Orbital {...baseProps} scale={2} isSatellite />)

      expect(container.innerHTML).not.toEqual(before)
    })
  })

  describe('pathOpacity', () => {
    it('should recompute the path opacity when the highlighted orbitals change', () => {
      const spy = vi
        .spyOn(OrbitalService, 'getPathOpacity')
        .mockReturnValue(Constants.UI.HOVER_OPACITY_ON)
      const { rerender } = render(<Orbital {...baseProps} highlightedOrbitals={[]} />)

      spy.mockClear()
      rerender(<Orbital {...baseProps} highlightedOrbitals={[orbital.id]} />)

      expect(spy).toHaveBeenCalledWith(expect.anything(), [orbital.id], false)
    })

    it('should mark the orbital as the target when the camera is focused on it', () => {
      const spy = vi.spyOn(OrbitalService, 'getPathOpacity')

      render(<Orbital {...baseProps} targetId={orbital.id} />)

      expect(spy).toHaveBeenCalledWith(expect.anything(), undefined, true)
    })
  })
})
