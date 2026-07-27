import { renderWithStore } from '../../test/render'
import { DoubleSide } from 'three'
import Texture from '../texture'

describe('Texture Module', () => {
  it('should render without textures', () => {
    expect(() => renderWithStore(<Texture />)).not.toThrow()
  })

  it('should render with a transparent flag', () => {
    expect(() => renderWithStore(<Texture transparent />)).not.toThrow()
  })

  it('should render with textures array', () => {
    const textures = [{ url: 'earth.jpg', slot: 'map' }]
    expect(() => renderWithStore(<Texture textures={textures} />)).not.toThrow()
  })

  it('should accept a custom side prop', () => {
    expect(() => renderWithStore(<Texture side={DoubleSide} />)).not.toThrow()
  })
})
