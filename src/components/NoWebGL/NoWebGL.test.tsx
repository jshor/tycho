import React from 'react'
import { renderWithStore } from '../../test/render'
import NoWebGL from './NoWebGL'
import { PageText } from '../../types'

const pageText: PageText = {
  webgl: {
    noWebGl: 'WebGL is unavailable',
    required: 'WebGL is required to view this simulation.',
    enableInstructionsUrl: 'https://example.test/enable-webgl',
    clickHere: 'Click here',
    learn: 'to learn more.'
  }
}

describe('NoWebGL Component', () => {
  it('should render without crashing', () => {
    const { container } = renderWithStore(<NoWebGL pageText={pageText} />)
    expect(container).toBeTruthy()
  })
})
