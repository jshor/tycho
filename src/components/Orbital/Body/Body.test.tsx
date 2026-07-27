import React from 'react'
import { render } from '@testing-library/react'
import Body from './Body'
import { TextureMap } from '../../../types'

describe('Body Component', () => {
  it('should render without crashing', () => {
    expect(() => render(<Body radius={1000} scale={1} />)).not.toThrow()
  })

  it('should render with rings', () => {
    const rings = { outerRadius: 2000, barycenterTilt: 27, maps: [] as TextureMap[], scale: 1 }
    expect(() => render(<Body radius={1000} scale={1} rings={rings} />)).not.toThrow()
  })
})
