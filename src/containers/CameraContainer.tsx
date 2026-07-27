import React, { useRef, useEffect, useImperativeHandle } from 'react'
import * as THREE from 'three'
import { useThree, useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import CameraService from '../services/CameraService'
import Controls from '../utils/Controls'
import Ambience from '../utils/Ambience'
import Constants from '../constants'
import { OrbitalData } from '../types'

export interface CameraAction {
  setUIControls: (enabled: boolean) => void
  setPlaying: (enabled: boolean) => void
  changeZoom: (level: number) => void
}

interface Props {
  ratio: number
  targetId?: string
  speed?: number
  scale?: number
  zoom?: number
  volume?: number
  isAutoOrbitEnabled?: boolean
  orbitalData?: OrbitalData[]
  action?: CameraAction
}

export interface CameraContainerHandle {
  controls: Controls | null
}

const CameraContainer = React.forwardRef<CameraContainerHandle, Props>((props, ref) => {
  const { ratio, targetId, scale, zoom, volume, isAutoOrbitEnabled, orbitalData, action } = props

  const pivotRef = useRef<THREE.Group>(null)
  const controlsRef = useRef<Controls>(null)
  const ambienceRef = useRef<Ambience>(null)
  const tweenBaseRef = useRef<{ stop(): void } | null>(null)
  const prevTargetIdRef = useRef<string | undefined>(undefined)

  // gl.domElement is the canvas — use it directly instead of requiring a prop
  const { scene, camera, gl } = useThree()

  useImperativeHandle(ref, () => ({
    get controls() {
      return controlsRef.current
    }
  }))

  // initialize ambience once the camera is available
  useEffect(() => {
    ambienceRef.current = new Ambience(camera)
  }, [camera])

  // create controls as soon as the camera and canvas are available
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.dispose()
    }
    controlsRef.current = new Controls(camera as THREE.PerspectiveCamera, gl.domElement)
    return () => {
      controlsRef.current?.dispose()
      controlsRef.current = null
    }
  }, [camera, gl.domElement])

  // update volume
  useEffect(() => {
    if (volume !== undefined && isFinite(volume)) {
      ambienceRef.current?.setVolume(volume)
    }
  }, [volume])

  // update zoom level
  useEffect(() => {
    if (zoom !== undefined) {
      controlsRef.current?.zoom(zoom)
    }
  }, [zoom])

  // update auto-rotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = !!isAutoOrbitEnabled
    }
  }, [isAutoOrbitEnabled])

  // Prevent camera collision when target or scale changes
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.minDistance = CameraService.getMinDistance(orbitalData, targetId, scale)
    }
  }, [targetId, scale, orbitalData])

  // Move camera pivot when target changes
  useEffect(() => {
    const hadTarget = !!prevTargetIdRef.current
    prevTargetIdRef.current = targetId

    if (!targetId || !hadTarget) return

    const pivot = pivotRef.current
    const target = scene.getObjectByName(targetId)

    if (target) {
      setInteractivity(false)
      const v = CameraService.getWorldPosition(target)
      const w = CameraService.getWorldPosition(pivot)

      CameraService.attachToWorld(scene, pivot, w)
      cancelTween()
      zoomInFull()
      tweenBaseRef.current = CameraService.getPivotTween(w, v, target, pivot, endTween)
    }
  }, [targetId]) // eslint-disable-line react-hooks/exhaustive-deps

  useFrame(() => {
    controlsRef.current?.update()
    controlsRef.current?.faceTarget()

    // update the matrix world so that face targets know where to look at the next frame
    // this is necessary to ensure that the labels are always facing the camera correctly
    scene.updateMatrixWorld()
  })

  const cancelTween = () => {
    if (tweenBaseRef.current) {
      tweenBaseRef.current.stop()
      tweenBaseRef.current = null
    }
  }

  const endTween = () => setInteractivity(true)

  const setInteractivity = (enabled: boolean) => {
    action?.setUIControls(!!enabled)
    action?.setPlaying(enabled)
    if (controlsRef.current) {
      controlsRef.current.enabled = !!enabled
    }
  }

  const zoomInFull = () => {
    controlsRef.current?.tweenZoom(Constants.WebGL.Zoom.MIN, action?.changeZoom)
  }

  return (
    <group ref={pivotRef}>
      <PerspectiveCamera
        makeDefault
        name="camera"
        aspect={ratio}
        fov={Constants.WebGL.Camera.FOV}
        near={Constants.WebGL.Camera.NEAR}
        far={Constants.WebGL.Camera.FAR}
        position={CameraService.CAMERA_INITIAL_POSITION.toArray() as [number, number, number]}
      />
    </group>
  )
})

CameraContainer.displayName = 'CameraContainer'

export default CameraContainer
