import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Constants from '../constants'
import { env } from '../utils/Environment'
import { TextureMap } from '../types'

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
const PHONG_OUTGOING_LIGHT =
  'vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;'

/**
 * Confines the material's emissive term to the body's night side (i.e., where the sun don't shine).
 */
const restrictEmissiveToNightSide = (shader: { fragmentShader: string }): void => {
  if (!shader.fragmentShader.includes(PHONG_OUTGOING_LIGHT)) {
    console.warn(
      'TextureContainer: night-side patch found no anchor; emissive maps will not be masked'
    )
    return
  }

  shader.fragmentShader = shader.fragmentShader.replace(
    PHONG_OUTGOING_LIGHT,
    /* glsl */ `
    #ifdef USE_EMISSIVEMAP
      vec3 sunDirection = normalize( viewMatrix[ 3 ].xyz + vViewPosition );
      float dayFactor = smoothstep( - 0.15, 0.25, dot( nonPerturbedNormal, sunDirection ) );
      totalEmissiveRadiance *= 1.0 - dayFactor;
    #endif
    ${PHONG_OUTGOING_LIGHT}`
  )
}

export default function TextureContainer({ textures, transparent, side = THREE.FrontSide }: Props) {
  const materialRef = useRef<THREE.MeshPhongMaterial>(null)
  const [revision, setRevision] = useState(0)

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
          mat.emissive.set(0x7d7d7d) // TODO: probably ought to be related to albedo, not a constant
        }

        if (key === 'specularMap') {
          mat.specular.set(Constants.WebGL.SPECULAR_COLOR)
          mat.shininess = Constants.WebGL.SHININESS
        }

        if (key === 'normalMap') {
          mat.normalScale.set(10, 10)
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
      // phong defaults specular to 0x111111 which puts a faint sheen on every rocky body in
      // the system - starting from black keeps bodies without a specularMap looking exactly as they
      // did under lambert, so this material swap is opt-in rather than scene-wide
      specular={0x000000}
      transparent={transparent}
      side={side}
      onBeforeCompile={restrictEmissiveToNightSide}
    />
  )
}
