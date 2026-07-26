import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import Constants from '../../constants'
import LensFlareHelper from '../../utils/LensFlare'

export default function Sun() {
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.add(new LensFlareHelper())
    }
  }, [])

  return (
    <group ref={groupRef}>
      <pointLight
        color={Constants.WebGL.Sunlight.COLOR}
        intensity={Constants.WebGL.Sunlight.INTENSITY}
        distance={Constants.WebGL.Sunlight.DISTANCE}
      />
    </group>
  )
}
