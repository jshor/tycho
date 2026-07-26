import React from 'react'
import { render } from '@testing-library/react'
import Markdown from './Markdown'

describe('Markdown Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<Markdown text="Hello **world**" />)
    expect(container).toBeTruthy()
  })
})
