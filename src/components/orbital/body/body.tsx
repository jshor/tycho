import * as THREE from 'three'
import { Constants } from '../../../constants'
import { Scale, getVisibleRadius } from '../../../utils/Scale'
import { Texture } from '../../../modules/texture'
import { Rings } from '../../orbital/rings'
import { TextureMap, RingData } from '../../../types'

interface Props {
  /** The radius of the body, in km. */
  radius: number
  /** The rotation of the body about its own axis. */
  rotation?: THREE.Euler
  /** The ring system encircling the body, if it has one. */
  rings?: RingData
  /** The texture maps applied to the body's material. */
  maps?: TextureMap[]
}

/**
 * The physical sphere of an orbital, together with any rings encircling it.
 */
export function Body({ radius, rotation, rings, maps }: Props) {
  return (
    <group>
      <mesh rotation={rotation}>
        <sphereGeometry
          args={[
            Scale(getVisibleRadius(radius)),
            Constants.WebGL.SPHERE_SEGMENTS,
            Constants.WebGL.SPHERE_SEGMENTS
          ]}
        />
        <Texture textures={maps} />
      </mesh>
      {rings && <Rings {...rings} />}
    </group>
  )
}
