import { render } from '@testing-library/react'
import { Volume } from './volume'

describe('Volume Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<Volume onClick={vi.fn()} playing={false} />)
    expect(container).toBeTruthy()
  })
})
