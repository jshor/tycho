import React from 'react'
import { renderWithStore } from '../../test/render'
import UIControls from './UIControls'

describe('UIControls Component', () => {
  it('should render without crashing', () => {
    const { container } = renderWithStore(<UIControls pageText={{}} />)
    expect(container).toBeTruthy()
  })
})
