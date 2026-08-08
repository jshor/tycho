import { Line } from '@react-three/drei'
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

  /** A traced orbit of four vertices, closed by repeating the one it set out from. */
  const orbit = [
    new Vector3(0, 0, 0),
    new Vector3(1, 0, 0),
    new Vector3(1, 1, 0),
    new Vector3(0, 1, 0),
    new Vector3(0, 0, 0)
  ]

  /** The path the orbit line was drawn over, in the order the line runs. */
  const drawnPath = () => {
    const [{ points, vertexColors }] = vi.mocked(Line).mock.lastCall as [
      { points: Vector3[]; vertexColors: [number, number, number, number][] }
    ]

    return { points, alphas: vertexColors.map(([, , , alpha]) => alpha) }
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

  describe('orbit path', () => {
    /** The body partway along the segment between the second and third vertices of the orbit. */
    const bodyPosition = new Vector3(1, 0.5, 0)

    const renderPath = (bodyPercent: number) =>
      renderInScene(
        <Orbital
          {...props}
          pathVertices={orbit}
          bodyPosition={bodyPosition}
          bodyPercent={bodyPercent}
        />
      )

    it('should set the path out from the body itself, so that nothing runs on ahead of it', () => {
      renderPath(0.3)

      expect(drawnPath().points[0]).toBe(bodyPosition)
    })

    it('should trail the path back behind the body, away from where it is headed', () => {
      renderPath(0.3)

      // the body has drawn level with the second vertex, and the path runs back from there
      expect(drawnPath().points.slice(1)).toEqual([orbit[1], orbit[0], orbit[3], orbit[2]])
    })

    it('should carry the path once around the orbit, without redrawing where it closes', () => {
      renderPath(0.3)

      const { points } = drawnPath()

      expect(points).toHaveLength(orbit.length)
      expect(new Set(points.slice(1)).size).toEqual(orbit.length - 1)
    })

    it('should pick the path up from the vertex the body has just passed', () => {
      renderPath(0.8)

      expect(drawnPath().points[1]).toBe(orbit[3])
    })

    it('should fade the path out along its length, from the body to its far end', () => {
      renderPath(0.3)

      const { alphas } = drawnPath()

      expect(alphas[0]).toEqual(1)
      expect(alphas[alphas.length - 1]).toEqual(0)
      expect(alphas).toEqual([...alphas].sort((a, b) => b - a))
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
