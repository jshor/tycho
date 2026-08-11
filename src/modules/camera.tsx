import React, { useRef, useEffect, useImperativeHandle } from 'react'
import * as THREE from 'three'
import { useThree, useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { useStore } from '../store'
import {
  attachToWorld,
  getMinDistance,
  getNearPlane,
  getPivotTween,
  getSunlitHeading,
  getWorldPosition,
  turnHeading
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

    const controls = controlsRef.current
    const fromDistance = controls?.camera.position.length() ?? Constants.WebGL.Camera.MIN_DISTANCE
    const fromHeading = (controls?.camera.position ?? Constants.WebGL.CAMERA_INITIAL_POSITION)
      .clone()
      .normalize()
    const toDistance = getMinDistance(radius, ratio)
    const worldPosiiton = getWorldPosition(pivot)

    attachToWorld(scene, pivot, worldPosiiton)
    setInteractivity(false)
    cancelTween()

    if (controls) {
      // assume the orbital can be zoomed into fully to allow the camera to move freely to avoid janky camera movement
      controls.minDistance = 0
    }

    if (animateTargetChange) {
      tweenBaseRef.current = getPivotTween(
        worldPosiiton,
        target,
        pivot,
        toDistance,
        turnToward.bind(null, { target, fromDistance, toDistance, fromHeading }),
        endTween.bind(null, toDistance)
      )
    } else {
      turnToward({ target, fromDistance, toDistance, fromHeading }, 1)
      endTween(toDistance)
    }
  }, [targetId, animateTargetChange]) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Updates the matrix world so that face targets know where to look at.
   * Necessary to ensure that the labels are always facing the camera.
   */
  useFrame(() => {
    controlsRef.current?.update()
    controlsRef.current?.faceTarget()
    drawInNearPlane()
    scene.updateMatrixWorld()
  })

  /**
   * Draws the near clip plane in as the camera closes in on its target.
   */
  const drawInNearPlane = () => {
    const perspective = camera as THREE.PerspectiveCamera

    if (!perspective.isPerspectiveCamera) return

    const near = getNearPlane(perspective.position.length(), radius)

    if (near !== perspective.near) {
      perspective.near = near
      perspective.updateProjectionMatrix()
    }
  }

  /**
   * Returns a function that turns the camera toward the new target.
   */
  const turnToward = (
    {
      target,
      fromDistance,
      toDistance,
      fromHeading
    }: {
      /** The target object to turn the camera toward. */
      target: THREE.Object3D
      /** Distance from the pivot the camera was framed from where it departed. */
      fromDistance: number
      /** Distance from the pivot the camera ought to be framed once it arrives. */
      toDistance: number
      /** The previous direction of the camera. */
      fromHeading: THREE.Vector3
    },
    progress: number
  ) => {
    const pivot = pivotRef.current
    const controls = controlsRef.current

    if (!pivot || !controls) return

    const position = getWorldPosition(target)
    const distance = getGeometricStep(fromDistance, toDistance, progress)
    const heading = turnHeading(fromHeading, getSunlitHeading(position, fromHeading), progress)
    const turned = progress / Constants.WebGL.Camera.TURN_FRACTION

    pivot.updateMatrixWorld()
    controls.lookToward(pivot.worldToLocal(position.clone()), turned)
    controls.camera.position.copy(heading.multiplyScalar(distance))
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
        position={Constants.WebGL.CAMERA_INITIAL_POSITION}
      />
    </group>
  )
})

Camera.displayName = 'Camera'

export { Camera }
