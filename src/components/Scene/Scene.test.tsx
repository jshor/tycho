import { render } from '@testing-library/react'
import Scene from '../Scene'
import data from './__fixtures__/orbitals.json'

describe('Scene Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<Scene orbitalData={data} time={1} />)

    expect(container).toBeTruthy()
  })

  it('should render a named group for each orbital, nesting satellites within their parent', () => {
    const { container } = render(<Scene orbitalData={data} time={1} />)
    const named = Array.from(container.querySelectorAll('group[name]'))

    expect(named.map((group) => group.getAttribute('name'))).toEqual([
      'dummyOuter',
      'dummyParent',
      'dummyChild'
    ])

    const parent = container.querySelector('group[name="dummyParent"]')

    expect(parent?.querySelector('group[name="dummyChild"]')).not.toBeNull()
  })
})
