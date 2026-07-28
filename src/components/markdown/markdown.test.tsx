import { render } from '@testing-library/react'
import { Markdown } from './markdown'

describe('Markdown Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<Markdown text="Hello **world**" />)
    expect(container).toBeTruthy()
  })
})
