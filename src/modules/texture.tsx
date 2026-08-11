import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Constants } from '../constants'
import { env } from '../utils/Environment'
import { TextureMap } from '../types'
import NIGHT_SIDE_EMISSIVE from '../shaders/nightSideEmissive.glsl?raw'

/**
 * The MeshPhongMaterial properties that hold a texture.
 */
type TextureSlot =
  | 'map'
  | 'alphaMap'
  | 'aoMap'
  | 'bumpMap'
  | 'displacementMap'
  | 'emissiveMap'
  | 'envMap'
  | 'lightMap'
  | 'normalMap'
  | 'specularMap'

interface Props {
  side?: THREE.Side
  textures?: TextureMap[]
  transparent?: boolean
}

/**
 * Phong assembles its outgoing light from these four terms plus the emissive one.
 */
export const PHONG_OUTGOING_LIGHT =
  'vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;'

/**
 * Confines the material's emissive term to the body's night side (i.e., where the sun don't shine).
 */
export const restrictEmissiveToNightSide = (shader: { fragmentShader: string }): void => {
  if (!shader.fragmentShader.includes(PHONG_OUTGOING_LIGHT)) {
    console.warn('Texture: night-side patch found no anchor; emissive maps will not be masked')
    return
  }

  shader.fragmentShader = shader.fragmentShader.replace(
    PHONG_OUTGOING_LIGHT,
    `${NIGHT_SIDE_EMISSIVE}\n${PHONG_OUTGOING_LIGHT}`
  )
}

export function Texture({ textures, transparent, side = THREE.FrontSide }: Props) {
  const materialRef = useRef<THREE.MeshPhongMaterial>(null)
  const [, setRevision] = useState(0)

  useEffect(() => {
    if (!Array.isArray(textures) || textures.length === 0) return

    const loader = new THREE.TextureLoader()

    textures.forEach(({ url, slot }) => {
      const resolvedUrl = env(`/static/textures/map/${url}`)

      loader.load(resolvedUrl, (texture) => {
        const mat = materialRef.current
        if (!mat) return

        const key = (slot || 'map') as TextureSlot
        mat[key] = texture

        if (key === 'emissiveMap') {
          mat.emissive.set(0x222222) // TODO: probably ought to be related to albedo, not a constant
        }

        if (key === 'specularMap') {
          mat.specular.set(Constants.WebGL.SPECULAR_COLOR)
          mat.shininess = Constants.WebGL.SHININESS
        }

        if (key === 'normalMap') {
          mat.normalScale.set(5, 5)
        }

        mat.needsUpdate = true
        setRevision((r) => r + 1)
      })
    })
  }, [textures])

  return (
    <meshPhongMaterial
      ref={materialRef}
      color={Constants.WebGL.MESH_DEFAULT_COLOR}
      // TODO: phong defaults specular to 0x111111 which puts a faint sheen on every rocky body in
      // the system - starting from black keeps bodies without a specularMap looking exactly as they
      // did under lambert, so this material swap is opt-in rather than scene-wide
      specular={0x000000}
      transparent={transparent}
      side={side}
      onBeforeCompile={restrictEmissiveToNightSide}
    />
  )
}
