import { render } from '@testing-library/react'
import Orbital, { Props } from './orbital'
import { Euler, Vector3 } from 'three'

describe('Orbital Component', () => {
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
})
