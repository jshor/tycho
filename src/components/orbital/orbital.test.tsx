import { renderInScene } from '../../test/helpers'
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
    expect(() => renderInScene(<Orbital {...props} />)).not.toThrow()
  })

  it('should grow a tail on an orbital configured with one', () => {
    const { container } = renderInScene(<Orbital {...props} id="halley" radius={15} tail={tail} />)

    expect(container.querySelector('group[name="comet"]')).not.toBeNull()
  })

  it('should leave an orbital with no tail configured tailless', () => {
    const { container } = renderInScene(<Orbital {...props} id="halley" radius={15} />)

    expect(container.querySelector('group[name="comet"]')).toBeNull()
  })

  /** The shell is the sphere drawn around the body, alongside the body's own. */
  const shells = (container: HTMLElement) => container.querySelectorAll('mesh sphereGeometry')

  it('should wrap an orbital the data gives an atmosphere in a shell', () => {
    const { container } = renderInScene(
      <Orbital {...props} atmosphereHeightKm={100} atmosphereColor="#5DA9E9" />
    )

    expect(shells(container)).toHaveLength(1)
  })

  it('should leave an orbital the data gives no atmosphere bare', () => {
    const { container } = renderInScene(<Orbital {...props} />)

    expect(shells(container)).toHaveLength(0)
  })

  it('should leave an orbital given a height but no colour bare, having nothing to scatter', () => {
    const { container } = renderInScene(<Orbital {...props} atmosphereHeightKm={100} />)

    expect(shells(container)).toHaveLength(0)
  })
})
