import React from 'react'
import { render } from '@testing-library/react'
import UIControls from './UIControls'

describe('UIControls Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<UIControls action={{} as any} pageText={{} as any} />)
    expect(container).toBeTruthy()
  })
})
