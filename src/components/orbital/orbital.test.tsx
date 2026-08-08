import { Line } from '@react-three/drei'
import { renderInScene } from '../../test/helpers'
import { Orbital, Props } from './orbital'
import { Euler } from 'three'
import { Ellipse } from '../../elements/ellipse'
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

  let ellipse: Ellipse

  let props: Props

  beforeEach(() => {
    ellipse = new Ellipse({
      semimajor: 149598261,
      semiminor: 149556483,
      eccentricity: 0.01671123,
      periapses: { last: 1136430000, next: 1167987600 }
    })

    ellipse.updateTime(1)

    props = {
      eclipticGroupRotation: new Euler(0, 0, 0),
      orbitalGroupRotation: new Euler(0, 0, 0),
      ellipse,
      radius: 100,
      id: 'Earth',
      text: 'Earth'
    }
  })

  /** The path the orbit line was drawn over, in the order the line runs. */
  const drawnPath = () => {
    const [{ points, vertexColors }] = vi.mocked(Line).mock.lastCall as [
      { points: unknown[]; vertexColors: [number, number, number, number][] }
    ]

    return { points, alphas: vertexColors.map(([, , , alpha]) => alpha) }
  }

  it('should render without crashing', () => {
    expect(() => renderInScene(<Orbital {...props} />)).not.toThrow()
  })

  it('should name the body after the orbital, so the scene can find it again', () => {
    const { container } = renderInScene(<Orbital {...props} />)

    expect(container.querySelector('group[name="Earth"]')).not.toBeNull()
  })

  it('should grow a tail on an orbital configured with one', () => {
    const { container } = renderInScene(<Orbital {...props} id="halley" radius={15} tail={tail} />)

    expect(container.querySelector('group[name="comet"]')).not.toBeNull()
  })

  it('should leave an orbital with no tail configured tailless', () => {
    const { container } = renderInScene(<Orbital {...props} id="halley" radius={15} />)

    expect(container.querySelector('group[name="comet"]')).toBeNull()
  })

  describe('orbit path', () => {
    it('should draw the line over the trail the ellipse traced', () => {
      renderInScene(<Orbital {...props} />)

      expect(drawnPath().points).toBe(ellipse.trailVertices)
    })

    it('should fade the line out along its length, from the body to its far end', () => {
      renderInScene(<Orbital {...props} />)

      const { alphas } = drawnPath()

      expect(alphas[0]).toEqual(1)
      expect(alphas[alphas.length - 1]).toEqual(0)
    })

    it('should draw the line at the opacity it was given', () => {
      renderInScene(<Orbital {...props} pathOpacity={0.25} />)

      const [{ opacity }] = vi.mocked(Line).mock.lastCall as [{ opacity: number }]

      expect(opacity).toEqual(0.25)
    })

    it('should draw the line fully opaque when no opacity was given', () => {
      renderInScene(<Orbital {...props} />)

      const [{ opacity }] = vi.mocked(Line).mock.lastCall as [{ opacity: number }]

      expect(opacity).toEqual(1)
    })
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
