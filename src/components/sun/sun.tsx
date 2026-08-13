import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Constants } from '../../constants'
import { LensFlareHelper } from '../../elements/lensFlare'
import { Corona } from './corona/corona'

export function Sun() {
  const groupRef = useRef<THREE.Group>(null)
  const flareRef = useRef<LensFlareHelper | null>(null)

  useEffect(() => {
    const group = groupRef.current

    if (!group) return

    const flare = new LensFlareHelper()

    flareRef.current = flare
    group.add(flare)

    return () => {
      group.remove(flare)
      flareRef.current = null
    }
  }, [])

  /**
   * Dims the flare by the given occlusion (i.e., how much sun hiding behind a planet).
   */
  const onOcclude = (occlusion: number) => {
    flareRef.current?.setOcclusion(occlusion)
  }

  return (
    <group ref={groupRef}>
      <pointLight
        color={Constants.WebGL.Sunlight.COLOR}
        intensity={Constants.WebGL.Sunlight.INTENSITY}
        distance={Constants.WebGL.Sunlight.DISTANCE}
        decay={0}
      />
      <Corona onOcclude={onOcclude} />
    </group>
  )
}
