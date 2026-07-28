import React from 'react'
import { render, screen } from '@testing-library/react'
import Label from './label'
import { CameraText } from './cameraText'
import Constants from '../../../constants'
import Scale from '../../../utils/Scale'

// the text itself is covered by cameraText.test.tsx; what the label decides is whether there is a
// label at all, and how the text it renders is set up
vi.mock('./cameraText', () => ({
  CameraText: vi.fn(({ children }: { children?: React.ReactNode }) =>
    React.createElement('span', null, children)
  )
}))

const action = {
  setActiveOrbital: vi.fn(),
  addHighlightedOrbital: vi.fn(),
  removeHighlightedOrbital: vi.fn()
}

describe('Orbital Label Component', () => {
  /** The props the label handed to the text it renders. */
  const textProps = () => vi.mocked(CameraText).mock.calls[0][0]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the label text', () => {
    render(<Label text="Earth" id="Earth" action={action} />)

    expect(screen.getByText('Earth')).toBeInTheDocument()
  })

  describe('which labels show', () => {
    it('should hide a satellite label while another system is being watched', () => {
      render(
        <Label text="Moon" id="Moon" action={action} isSatellite parentId="Earth" systemId="Mars" />
      )

      expect(screen.queryByText('Moon')).not.toBeInTheDocument()
    })

    it('should show a satellite label while its own system is being watched', () => {
      render(
        <Label
          text="Moon"
          id="Moon"
          action={action}
          isSatellite
          parentId="Earth"
          systemId="Earth"
        />
      )

      expect(screen.getByText('Moon')).toBeInTheDocument()
    })

    it('should show a satellite label whose sibling is the one focused', () => {
      // focusing Io leaves the camera in Jupiter's system, which Callisto shares with it
      render(
        <Label
          text="Callisto"
          id="callisto"
          action={action}
          isSatellite
          parentId="jupiter"
          systemId="jupiter"
        />
      )

      expect(screen.getByText('Callisto')).toBeInTheDocument()
    })

    it('should always show a non-satellite (planet) label', () => {
      render(<Label text="Earth" id="Earth" action={action} systemId="Mars" />)

      expect(screen.getByText('Earth')).toBeInTheDocument()
    })
  })

  describe('how the text is set up', () => {
    it('should dress the text in the colour the orbital wears elsewhere', () => {
      render(<Label text="Earth" id="Earth" action={action} color={0x0089bc} />)

      expect(textProps().color).toEqual(0x0089bc)
    })

    it('should leave the text white when the orbital has no colour of its own', () => {
      render(<Label text="Earth" id="Earth" action={action} />)

      expect(textProps().color).toEqual('white')
    })

    it('should stand the text off just clear of the surface of the orbital it names', () => {
      const radius = 69911

      render(<Label text="Jupiter" id="jupiter" action={action} radius={radius} />)

      const drawn = Scale(radius)

      // clear of the surface, so the two do not fight over the same depth, but only just, so the
      // label still reads as sitting on the body
      expect(textProps().standoff).toBeGreaterThan(drawn)
      expect(textProps().standoff).toBeCloseTo(drawn * Constants.WebGL.LABEL_STANDOFF, 8)
    })

    it('should stand off a small orbital by the size it is inflated to, not its own', () => {
      render(<Label text="Halley" id="halley" action={action} radius={15} />)

      // a 15km nucleus is drawn at the minimum visible radius, and standing off by 15km would
      // leave the label buried inside it
      expect(textProps().standoff).toBeGreaterThan(Scale(15))
      expect(textProps().standoff).toBeCloseTo(
        Scale(Constants.WebGL.MINIMUM_RADIUS) * Constants.WebGL.LABEL_STANDOFF,
        8
      )
    })

    it('should measure a satellite from the orbital it orbits, so it is culled with it', () => {
      render(
        <Label
          text="Moon"
          id="Moon"
          action={action}
          isSatellite
          parentId="Earth"
          systemId="Earth"
          maxDistance={7}
        />
      )

      expect(textProps().barycenterId).toEqual('Earth')
      expect(textProps().maxDistance).toEqual(7)
    })

    it('should measure a planet from nothing, so it is never culled by range', () => {
      render(<Label text="Earth" id="Earth" action={action} parentId="sun" />)

      expect(textProps().barycenterId).toBeUndefined()
    })
  })

  describe('what the text reports back', () => {
    beforeEach(() => {
      render(<Label text="Earth" id="earth" action={action} />)
    })

    it('should focus the orbital when its text is chosen', () => {
      textProps().onClick?.(null as never)

      expect(action.setActiveOrbital).toHaveBeenCalledWith('earth', 'Earth')
    })

    it('should highlight the orbital while the pointer is over its text', () => {
      textProps().onPointerOver?.(null as never)

      expect(action.addHighlightedOrbital).toHaveBeenCalledWith('earth')
    })

    it('should drop the highlight once the pointer has left its text', () => {
      textProps().onPointerOut?.(null as never)

      expect(action.removeHighlightedOrbital).toHaveBeenCalledWith('earth')
    })
  })
})
