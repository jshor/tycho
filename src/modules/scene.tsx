import React, { useEffect, useRef } from 'react'
import TWEEN from 'tween.js'
import { CubeTextureLoader } from 'three'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import useStore from '../store'
import SceneView from '../components/scene'
import Constants from '../constants'
import Camera, { CameraHandle } from './camera'
import Event from './event'

interface Props {
  /** Invoked on every animation frame of the scene. */
  onAnimate: () => void
  /** The width of the canvas, in px. */
  width: number
  /** The height of the canvas, in px. */
  height: number
  /** Anything rendered into the scene alongside the orbitals. */
  children?: React.ReactNode
}

/**
 * Wraps the scene in the app's skybox.
 */
function SkyboxSetup(): null {
  const { scene } = useThree()

  useEffect(() => {
    const loader = new CubeTextureLoader()

    scene.background = loader.load(Constants.WebGL.SKYBOX_TEXTURES)
  }, [scene])

  return null
}

/**
 * Drives the simulation and its tweens.
 */
function AnimationTick({ onAnimate }: { onAnimate: () => void }): null {
  useFrame(() => {
    onAnimate()
    TWEEN.update()
  })

  return null
}

interface CanvasContentProps {
  /** The aspect ratio the camera renders at. */
  ratio: number
  /** A handle on the camera, for the zoom the canvas captures. */
  cameraRef: React.RefObject<CameraHandle>
  /** Invoked on every animation frame of the scene. */
  onAnimate: () => void
  /** Anything rendered into the scene alongside the orbitals. */
  children?: React.ReactNode
}

/**
 * Everything rendered inside the canvas: the camera, the skybox, and the scene itself.
 */
function CanvasContent({ ratio, cameraRef, onAnimate, children }: CanvasContentProps) {
  const orbitalData = useStore((state) => state.orbitalData)

  return (
    <>
      <SkyboxSetup />
      <AnimationTick onAnimate={onAnimate} />
      <Camera ref={cameraRef} ratio={ratio} />
      <SceneView orbitalData={orbitalData}>{children}</SceneView>
    </>
  )
}

/**
 * Connects the scene's canvas to the store.
 */
export default function Scene({ onAnimate, width, height, children }: Props) {
  const changeZoomLevel = useStore((state) => state.changeZoom)
  const cameraRef = useRef<CameraHandle>(null)

  /** Zooms the camera by however far the user scrolled. */
  const changeZoom: React.WheelEventHandler<HTMLDivElement> = (ev) => {
    cameraRef.current?.controls?.wheelZoom(ev, changeZoomLevel)
  }

  return (
    <Event onWheel={changeZoom}>
      <Canvas style={{ width, height }} gl={{ antialias: true, alpha: true }}>
        <CanvasContent ratio={width / height} cameraRef={cameraRef} onAnimate={onAnimate}>
          {children}
        </CanvasContent>
      </Canvas>
    </Event>
  )
}
