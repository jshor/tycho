import React, { useRef, useEffect, useImperativeHandle } from 'react'
import * as THREE from 'three'
import { useThree, useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { useStore } from '../store'
import { CameraService } from '../services/CameraService'
import { Controls } from '../utils/Controls'
import { Ambience } from '../utils/Ambience'
import { Constants } from '../constants'

interface Props {
  /** The aspect ratio the camera renders at. */
  ratio: number
}

export interface CameraHandle {
  controls: Controls | null
}

/**
 * Dollies the camera in to the minimum distance allowed without tween animation.
 */
export const focusCameraImmediately = (
  target: THREE.Object3D,
  pivot: THREE.Object3D,
  controls: Controls | null,
  changeZoom?: (level: number) => void
): void => {
  controls?.cancelTween()
  CameraService.attachToGyroscope(target, pivot, () => {})
  controls?.resetLook()
  controls?.zoom(Constants.WebGL.Zoom.MIN)
  changeZoom?.(Constants.WebGL.Zoom.MIN)
}

/**
 * The camera that renders the scene.
 */
const Camera = React.forwardRef<CameraHandle, Props>(({ ratio }, ref) => {
  const targetId = useStore((state) => state.targetId)
  const animateTargetChange = useStore((state) => state.animateTargetChange)
  const zoom = useStore((state) => state.zoom)
  const volume = useStore((state) => state.volume)
  const isAutoOrbitEnabled = useStore((state) => state.isAutoOrbitEnabled)
  const orbitalData = useStore((state) => state.orbitalData)
  const changeZoom = useStore((state) => state.changeZoom)
  const pivotRef = useRef<THREE.Group>(null)
  const controlsRef = useRef<Controls>(null)
  const ambienceRef = useRef<Ambience>(null)
  const tweenBaseRef = useRef<{ stop(): void } | null>(null)
  const { scene, camera, gl } = useThree()

  useImperativeHandle(ref, () => ({
    get controls() {
      return controlsRef.current
    }
  }))

  /**
   * Initializes ambience once the camera is available.
   */
  useEffect(() => {
    ambienceRef.current = new Ambience(camera)
  }, [camera])

  /**
   * Creates controls as soon as the camera and canvas are available.
   */
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

  /**
   * Updates the volume of the ambience.
   */
  useEffect(() => {
    if (volume !== undefined && isFinite(volume)) {
      ambienceRef.current?.setVolume(volume)
    }
  }, [volume])

  /**
   * Updates the zoom level of the controls.
   */
  useEffect(() => {
    if (zoom !== undefined) {
      controlsRef.current?.zoom(zoom)
    }
  }, [zoom])

  /**
   * Updates the auto-rotate setting of the controls.
   */
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = !!isAutoOrbitEnabled
    }
  }, [isAutoOrbitEnabled])

  /**
   * Frames the target consistently (regardless of size) when the camera closes on it.
   */
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.setMinDistance(CameraService.getMinDistance(orbitalData, targetId, ratio))
    }
  }, [targetId, orbitalData, ratio])

  /**
   * Moves the camera pivot when the target changes.
   */
  useEffect(() => {
    if (!targetId) return

    const pivot = pivotRef.current
    const target = scene.getObjectByName(targetId)

    if (target) {
      if (animateTargetChange === false) {
        cancelTween() // TODO: is this necessary? cancelTween() will happen twice?
        focusCameraImmediately(target, pivot, controlsRef.current, changeZoom)
        return
      }

      setInteractivity(false)

      const worldPosiiton = CameraService.getWorldPosition(pivot)

      CameraService.attachToWorld(scene, pivot, worldPosiiton)
      cancelTween()
      zoomInFull()
      controlsRef.current?.lockCameraOntoTarget()
      tweenBaseRef.current = CameraService.getPivotTween(
        worldPosiiton,
        target,
        pivot,
        controlsRef.current?.minDistance ?? Constants.WebGL.Camera.MIN_DISTANCE,
        turnTo(target),
        endTween
      )
    }
  }, [targetId, animateTargetChange]) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Updates the matrix world so that face targets know where to look at.
   * Necessary to ensure that the labels are always facing the camera.
   */
  useFrame(() => {
    controlsRef.current?.update()
    controlsRef.current?.faceTarget()
    scene.updateMatrixWorld()
  })

  /**
   * Returns a function that turns the camera toward the new target.
   */
  const turnTo = (
    /** The target object to turn the camera toward. */
    target: THREE.Object3D
  ) => (
    /** The percentage of progress of travel [0, 1]. */
    progress: number
  ) => {
    const pivot = pivotRef.current

    if (!pivot) return

    pivot.updateMatrixWorld()
    controlsRef.current?.lookToward(pivot.worldToLocal(
      CameraService.getWorldPosition(target)),
      progress
    )
  }

  /**
   * Cancels dollying the camera.
   */
  const cancelTween = () => {
    if (tweenBaseRef.current) {
      tweenBaseRef.current.stop()
      tweenBaseRef.current = null
    }
  }

  /**
   * Completes the dolly animation.
   */
  const endTween = () => {
    controlsRef.current?.resetLook()
    setInteractivity(true)
  }

  /**
   * Enables or disables interactivity with the camera.
   */
  const setInteractivity = (enabled: boolean) => {
    useStore.setState({ controlsEnabled: !!enabled, playing: enabled })
    if (controlsRef.current) {
      controlsRef.current.enabled = !!enabled
    }
  }

  /**
   * Zooms the camera all the way in to the minimum distance allowed.
   */
  const zoomInFull = () => {
    controlsRef.current?.tweenZoom(Constants.WebGL.Zoom.MIN, changeZoom)
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

Camera.displayName = 'Camera'

export { Camera }
