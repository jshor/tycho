import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Constants from '../constants'
import { env } from '../utils/Environment'
import { TextureMap } from '../types'

interface Props {
  side?: number
  textures?: TextureMap[]
  transparent?: boolean
}

export default function TextureContainer({ textures, transparent, side = THREE.FrontSide }: Props) {
  const materialRef = useRef<THREE.MeshLambertMaterial>(null)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    if (!Array.isArray(textures) || textures.length === 0) return

    const loader = new THREE.TextureLoader()

    textures.forEach(({ url, slot }) => {
      const resolvedUrl = env(`/static/textures/map/${url}`)
      loader.load(resolvedUrl, (texture) => {
        const mat = materialRef.current
        if (!mat) return

        const key = (slot || 'map') as keyof THREE.MeshLambertMaterial
        ;(mat as any)[key] = texture
        mat.needsUpdate = true
        setRevision((r) => r + 1)
      })
    })
  }, [textures])

  return (
    <meshLambertMaterial
      ref={materialRef}
      color={Constants.WebGL.MESH_DEFAULT_COLOR}
      transparent={transparent}
      side={side}
    />
  )
}
