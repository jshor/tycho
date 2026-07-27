import { render } from '@testing-library/react'
import Stats from './stats'

describe('Stats Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<Stats time="2024-01-01" pageText={{}} />)
    expect(container).toBeTruthy()
  })
})
