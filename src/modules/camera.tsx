import React, { useRef, useEffect, useImperativeHandle } from 'react'
import * as THREE from 'three'
import { useThree, useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { useStore } from '../store'
import {
  CAMERA_INITIAL_POSITION,
  attachToGyroscope,
  attachToWorld,
  getMinDistance,
  getPivotTween,
  getWorldPosition
} from '../utils/camera'
import { Controls } from '../elements/controls'
import { Ambience } from '../elements/ambience'
import { Constants } from '../constants'
import { getGeometricStep } from '../utils/math'

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
  attachToGyroscope(target, pivot, () => {})
  controls?.resetLook()
  controls?.zoom(Constants.WebGL.Zoom.MIN)
  controls?.startAutoRotate(Constants.WebGL.Camera.AUTOROTATE_SPEED)
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
  const radius = useStore((state) => state.target?.radius)
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
   * Moves the camera pivot when the target changes.
   */
  useEffect(() => {
    const pivot = pivotRef.current
    const target = scene.getObjectByName(targetId)

    if (!target || !radius) return

    controlsRef.current?.stopAutoRotate()

    if (animateTargetChange === false) {
      cancelTween() // TODO: is this necessary? cancelTween() will happen twice?
      focusCameraImmediately(target, pivot, controlsRef.current, changeZoom)
      return
    }

    const controls = controlsRef.current
    const fromDistance = controls?.camera.position.length() ?? Constants.WebGL.Camera.MIN_DISTANCE
    const toDistance = getMinDistance(radius, ratio)
    const worldPosiiton = getWorldPosition(pivot)

    attachToWorld(scene, pivot, worldPosiiton)

    setInteractivity(false)
    cancelTween()

    if (controls) {
      // assume the orbital can be zoomed into fully to allow the camera to move freely to avoid janky camera movement
      controls.minDistance = 0
    }

    tweenBaseRef.current = getPivotTween(
      worldPosiiton,
      target,
      pivot,
      toDistance,
      turnToward.bind(null, { target, fromDistance, toDistance }),
      endTween.bind(null, toDistance)
    )
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
  const turnToward = (
    {
      target,
      fromDistance,
      toDistance
    }: {
      /** The target object to turn the camera toward. */
      target: THREE.Object3D
      /** Distance from the pivot the camera was framed when it set off. */
      fromDistance: number
      /** Distance from the pivot the camera ought to be framed once it arrives. */
      toDistance: number
    },
    progress: number
  ) => {
    const pivot = pivotRef.current
    const controls = controlsRef.current

    if (!pivot || !controls) return

    pivot.updateMatrixWorld()
    controls.lookToward(pivot.worldToLocal(getWorldPosition(target)), progress)

    const distance = getGeometricStep(fromDistance, toDistance, progress)

    controls.camera.position.copy(controls.getZoomVector(controls.camera.position, distance))
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
  const endTween = (toDistance: number) => {
    setInteractivity(true)
    changeZoom(0)

    if (controlsRef.current) {
      controlsRef.current.resetLook()
      controlsRef.current.lockCameraOntoTarget()
      controlsRef.current.startAutoRotate(Constants.WebGL.Camera.AUTOROTATE_SPEED)
      controlsRef.current.minDistance = toDistance
      controlsRef.current.level = 0
    }
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

  return (
    <group ref={pivotRef}>
      <PerspectiveCamera
        makeDefault
        name="camera"
        aspect={ratio}
        fov={Constants.WebGL.Camera.FOV}
        near={Constants.WebGL.Camera.NEAR}
        far={Constants.WebGL.Camera.FAR}
        position={CAMERA_INITIAL_POSITION}
      />
    </group>
  )
})

Camera.displayName = 'Camera'

export { Camera }
