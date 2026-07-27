import { renderWithStore } from '../../test/render'
import { DoubleSide } from 'three'
import TextureContainer from '../TextureContainer'

describe('Texture Container', () => {
  it('should render without textures', () => {
    expect(() => renderWithStore(<TextureContainer />)).not.toThrow()
  })

  it('should render with a transparent flag', () => {
    expect(() => renderWithStore(<TextureContainer transparent />)).not.toThrow()
  })

  it('should render with textures array', () => {
    const textures = [{ url: 'earth.jpg', slot: 'map' }]
    expect(() => renderWithStore(<TextureContainer textures={textures} />)).not.toThrow()
  })

  it('should accept a custom side prop', () => {
    expect(() => renderWithStore(<TextureContainer side={DoubleSide} />)).not.toThrow()
  })
})
