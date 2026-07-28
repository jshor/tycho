import { render } from '@testing-library/react'
import { Body } from './body'
import { TextureMap } from '../../../types'

describe('Body Component', () => {
  it('should render without crashing', () => {
    expect(() => render(<Body radius={1000} />)).not.toThrow()
  })

  it('should render with rings', () => {
    const rings = { outerRadius: 2000, barycenterTilt: 27, maps: [] as TextureMap[] }
    expect(() => render(<Body radius={1000} rings={rings} />)).not.toThrow()
  })
})
