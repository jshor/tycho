import React from 'react'
import { render } from '@testing-library/react'
import NoWebGL from './NoWebGL'

describe('NoWebGL Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<NoWebGL pageText={{} as any} />)
    expect(container).toBeTruthy()
  })
})
