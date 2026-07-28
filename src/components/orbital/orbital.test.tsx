import { render } from '@testing-library/react'
import { Orbital, Props } from './orbital'
import { Euler, Vector3 } from 'three'
import { TailData } from '../../types'

describe('Orbital Component', () => {
  const tail: TailData = {
    length: 100,
    width: 20,
    comaScale: 60,
    activeDistance: 450,
    restActivity: 0.18,
    dustColor: 0xfff0d0,
    ionColor: 0x66ccff
  }

  const props: Props = {
    eclipticGroupRotation: new Euler(0, 0, 0),
    orbitalGroupRotation: new Euler(0, 0, 0),
    pathVertices: [new Vector3(0, 0, 0), new Vector3(1, 0, 0)],
    bodyPosition: new Vector3(0, 0, 0),
    bodyRotation: new Euler(0, 0, 0),
    radius: 100,
    id: 'Earth',
    text: 'Earth',
    action: {
      setActiveOrbital: vi.fn(),
      addHighlightedOrbital: vi.fn(),
      removeHighlightedOrbital: vi.fn()
    }
  }

  it('should render without crashing', () => {
    expect(() => render(<Orbital {...props} />)).not.toThrow()
  })

  it('should grow a tail on an orbital configured with one', () => {
    const { container } = render(<Orbital {...props} id="halley" radius={15} tail={tail} />)

    expect(container.querySelector('group[name="comet"]')).not.toBeNull()
  })

  it('should leave an orbital with no tail configured tailless', () => {
    const { container } = render(<Orbital {...props} id="halley" radius={15} />)

    expect(container.querySelector('group[name="comet"]')).toBeNull()
  })
})
