import { render } from '@testing-library/react'
import TourLabel from './TourLabel'

describe('TourLabel Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<TourLabel modifier="show" text="Hello" />)
    expect(container).toBeTruthy()
  })
})
