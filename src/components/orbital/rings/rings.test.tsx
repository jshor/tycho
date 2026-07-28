import { render } from '@testing-library/react'
import Rings, { Props } from './rings'

describe('Rings Component', () => {
  it('should render without crashing', () => {
    const props: Props = { outerRadius: 2000, barycenterTilt: 27, maps: [] }
    expect(() => render(<Rings {...props} />)).not.toThrow()
  })
})
