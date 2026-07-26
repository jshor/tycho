import React from 'react'
import { render } from '@testing-library/react'
import Settings from './Settings'

describe('Settings Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<Settings pageText={{} as any} action={{} as any} />)
    expect(container).toBeTruthy()
  })
})
