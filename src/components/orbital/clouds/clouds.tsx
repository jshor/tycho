import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { Scale } from '../../../utils/scale'
import { Constants } from '../../../constants'
import { env } from '../../../utils/Environment'

interface Props {
  /** Radius of the body wearing the clouds, in km. */
  radius: number
  /** The texture the deck is drawn from, as the orbital data names it. */
  url: string
  /** How the body is turned, which its clouds turn with. */
  rotation?: THREE.Euler
}

/**
 * Returns the radius of the cloud deck drawn over a body of the given radius, in scene units.
 */
export const getCloudRadius = (radius: number): number => {
  return Scale(radius * (1 + Constants.WebGL.Clouds.HEIGHT_SCALE))
}

/**
 * Returns the material a cloud deck is drawn with, before its texture has arrived.
 */
export const createCloudMaterial = (): THREE.MeshPhongMaterial => {
  const { DEPTH_BIAS } = Constants.WebGL.Clouds

  return new THREE.MeshPhongMaterial({
    color: Constants.WebGL.MESH_DEFAULT_COLOR,
    specular: 0x000000,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -DEPTH_BIAS,
    polygonOffsetUnits: -DEPTH_BIAS
  })
}

/**
 * Hangs the given texture on a cloud material, as both what to draw and what to see through.
 */
export const applyCloudTexture = (
  material: THREE.MeshPhongMaterial,
  texture: THREE.Texture
): void => {
  material.map = texture
  material.alphaMap = texture
  material.needsUpdate = true
}

/**
 * The deck of cloud drawn over a body, turning with it.
 */
export function Clouds({ radius, url, rotation }: Props) {
  const material = useMemo(() => createCloudMaterial(), [])

  useEffect(() => {
    const loader = new THREE.TextureLoader()

    loader.load(env(`/static/textures/map/${url}`), (texture) => {
      applyCloudTexture(material, texture)
    })
  }, [url, material])

  return (
    <mesh rotation={rotation} material={material}>
      <sphereGeometry
        args={[
          getCloudRadius(radius),
          Constants.WebGL.SPHERE_SEGMENTS,
          Constants.WebGL.SPHERE_SEGMENTS
        ]}
      />
    </mesh>
  )
}
