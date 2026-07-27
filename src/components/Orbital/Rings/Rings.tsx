import { DoubleSide, Euler } from 'three'
import Scale from '../../../utils/Scale'
import MathService from '../../../services/MathService'
import TextureContainer from '../../../containers/TextureContainer'
import { TextureMap } from '../../../types'

export interface Props {
  /** The distance from the body's centre to the outer edge of the rings, in km. */
  outerRadius: number
  /** The texture maps applied to the rings' material. */
  maps: TextureMap[]
  /** The axial tilt of the body the rings encircle, in degrees. */
  barycenterTilt: number
  /** The scene's current size scale. */
  scale?: number
}

/**
 * The flat, textured plane standing in for a body's ring system.
 */
export default function Rings({ outerRadius, maps, barycenterTilt, scale }: Props) {
  const tilt = MathService.toRadians(barycenterTilt)
  const size = Scale(outerRadius * 2, scale)
  const rotation = new Euler(tilt, 0, 0)

  return (
    <mesh rotation={rotation}>
      <planeGeometry args={[size, size]} />
      <TextureContainer transparent={true} side={DoubleSide} textures={maps} />
    </mesh>
  )
}
