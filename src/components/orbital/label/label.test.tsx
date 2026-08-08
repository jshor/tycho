import React from 'react'
import { render, screen } from '@testing-library/react'
import { Label } from './label'
import { CameraText } from './cameraText'
import { Constants } from '../../../constants'
import { Scale } from '../../../utils/Scale'

// the text itself is covered by cameraText.test.tsx; what the label decides is whether there is a
// label at all, and how the text it renders is set up
vi.mock('./cameraText', () => ({
  CameraText: vi.fn(({ children }: { children?: React.ReactNode }) =>
    React.createElement('span', null, children)
  )
}))

describe('Orbital Label Component', () => {
  /** The props the label handed to the text it renders. */
  const textProps = () => vi.mocked(CameraText).mock.calls[0][0]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the label text', () => {
    render(<Label text="Earth" />)

    expect(screen.getByText('Earth')).toBeInTheDocument()
  })

  describe('which labels show', () => {
    it('should show the label of an orbital the camera is not focused on', () => {
      render(<Label text="Earth" />)

      expect(screen.getByText('Earth')).toBeInTheDocument()
    })

    it('should hide the label of the orbital the camera is focused on', () => {
      // the camera is sitting on it and the display names it at the foot of the scene, so a label
      // would only be in the way of the body it names
      render(<Label text="Earth" isFocused />)

      expect(screen.queryByText('Earth')).not.toBeInTheDocument()
    })

    it('should leave a satellite label to be culled by range rather than hiding it outright', () => {
      render(<Label text="Moon" isSatellite parentId="Earth" maxDistance={7} />)

      expect(screen.getByText('Moon')).toBeInTheDocument()
    })
  })

  describe('how the text is set up', () => {
    it('should dress the text in the colour the orbital wears elsewhere', () => {
      render(<Label text="Earth" color={0x0089bc} />)

      expect(textProps().color).toEqual(0x0089bc)
    })

    it('should leave the text white when the orbital has no colour of its own', () => {
      render(<Label text="Earth" />)

      expect(textProps().color).toEqual('white')
    })

    it('should stand the text off just clear of the surface of the orbital it names', () => {
      const radius = 69911

      render(<Label text="Jupiter" radius={radius} />)

      const drawn = Scale(radius)

      expect(textProps().standoff).toBeGreaterThan(drawn)
      expect(textProps().standoff).toBeCloseTo(drawn * Constants.WebGL.LABEL_STANDOFF, 8)
    })

    it('should stand off a small orbital by the size it is inflated to, not its own', () => {
      render(<Label text="Halley" radius={15} />)

      expect(textProps().standoff).toBeGreaterThan(Scale(15))
      expect(textProps().standoff).toBeCloseTo(
        Scale(Constants.WebGL.MINIMUM_RADIUS) * Constants.WebGL.LABEL_STANDOFF,
        8
      )
    })

    it('should measure a satellite from the orbital it orbits, so it is culled with it', () => {
      render(<Label text="Moon" isSatellite parentId="Earth" maxDistance={7} />)

      expect(textProps().barycenterId).toEqual('Earth')
      expect(textProps().maxDistance).toEqual(7)
    })

    it('should measure a planet from nothing, so it is never culled by range', () => {
      render(<Label text="Earth" parentId="sun" />)

      expect(textProps().barycenterId).toBeUndefined()
    })
  })

  describe('what the text reports back', () => {
    const onFocus = vi.fn()
    const onHover = vi.fn()
    const onLeave = vi.fn()

    beforeEach(() => {
      render(<Label text="Earth" onFocus={onFocus} onHover={onHover} onLeave={onLeave} />)
    })

    it('should focus the orbital when its text is chosen', () => {
      textProps().onClick?.(null as never)

      expect(onFocus).toHaveBeenCalledTimes(1)
    })

    it('should highlight the orbital while the pointer is over its text', () => {
      textProps().onPointerOver?.()

      expect(onHover).toHaveBeenCalledTimes(1)
    })

    it('should drop the highlight once the pointer has left its text', () => {
      textProps().onPointerOut?.()

      expect(onLeave).toHaveBeenCalledTimes(1)
    })

    it('should get by without anyone listening for what it reports', () => {
      vi.mocked(CameraText).mockClear()
      render(<Label text="Mars" />)

      expect(() => {
        textProps().onClick?.(null as never)
        textProps().onPointerOver?.()
        textProps().onPointerOut?.()
      }).not.toThrow()
    })
  })
})
