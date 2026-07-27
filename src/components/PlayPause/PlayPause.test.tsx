import { render } from '@testing-library/react'
import PlayPause from './PlayPause'

describe('PlayPause Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<PlayPause onClick={vi.fn()} playing={false} />)
    expect(container).toBeTruthy()
  })
})
