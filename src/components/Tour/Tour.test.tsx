import React from 'react'
import { renderWithStore } from '../../test/render'
import Tour from './Tour'

describe('Tour Component', () => {
  it('should render without crashing', () => {
    const { container } = renderWithStore(<Tour pageText={{}} skipTour={vi.fn()} labels={[]} />)
    expect(container).toBeTruthy()
  })
})
