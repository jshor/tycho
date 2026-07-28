import { render, screen } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import { Scene } from '../scene'
import data from './__fixtures__/orbitals.json'
import { OrbitalData } from '../../types'

describe('Scene Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<Scene orbitalData={data} />)

    expect(container).toBeTruthy()
  })

  it('should render a named group for each orbital, nesting satellites within their parent', () => {
    const { container } = render(<Scene orbitalData={data} />)
    const named = Array.from(container.querySelectorAll('group[name]'))

    expect(named.map((group) => group.getAttribute('name'))).toEqual([
      'dummyOuter',
      'dummyParent',
      'dummyChild'
    ])

    const parent = container.querySelector('group[name="dummyParent"]')

    expect(parent?.querySelector('group[name="dummyChild"]')).not.toBeNull()
  })

  describe('satellite labels', () => {
    const [outer, planet] = data as OrbitalData[]
    const [satellite] = planet.satellites ?? []

    /** A planet with two satellites, so that one may be focused and the other looked for. */
    const system = [
      outer,
      {
        ...planet,
        satellites: [
          { ...satellite, id: 'first', name: 'First Moon' },
          { ...satellite, id: 'second', name: 'Second Moon' }
        ]
      }
    ] as OrbitalData[]

    it('should show the rest of the system while one satellite is focused', () => {
      renderWithStore(<Scene orbitalData={system} />, { orbitalData: system, targetId: 'first' })

      expect(screen.queryByText('First Moon')).not.toBeInTheDocument()
      expect(screen.getByText('Second Moon')).toBeInTheDocument()
    })

    it('should show every satellite of the system while their own planet is focused', () => {
      renderWithStore(<Scene orbitalData={system} />, {
        orbitalData: system,
        targetId: planet.id
      })

      expect(screen.getByText('First Moon')).toBeInTheDocument()
      expect(screen.getByText('Second Moon')).toBeInTheDocument()
      expect(screen.queryByText(planet.name)).not.toBeInTheDocument()
    })

    it('should hide them all while something outside their system is focused', () => {
      renderWithStore(<Scene orbitalData={system} />, {
        orbitalData: system,
        targetId: outer.id
      })

      expect(screen.queryByText('First Moon')).not.toBeInTheDocument()
      expect(screen.queryByText('Second Moon')).not.toBeInTheDocument()
    })
  })
})
