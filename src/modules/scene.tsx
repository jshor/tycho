import React, { useEffect, useRef } from 'react'
import { CubeTextureLoader } from 'three'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import { Constants } from '../constants'
import { Camera, CameraHandle } from './camera'
import { Event } from './event'
import { updateTweens } from '../utils/tween'
import { Sun } from '../components/sun/sun'
import { OrbitalData } from '../types'
import { Orbital } from './orbital'
import { LabelSync } from './labels'

interface Props {
  /** Invoked on every animation frame of the scene. */
  onAnimate: () => void
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

    // eslint-disable-next-line react-hooks/immutability
    scene.backgroundIntensity = 0.1
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
    updateTweens()
  })

  return null
}

interface CanvasContentProps {
  /** A handle on the camera, for the zoom the canvas captures. */
  cameraRef: React.RefObject<CameraHandle>
  /** Invoked on every animation frame of the scene. */
  onAnimate: () => void
  /** Anything rendered into the scene alongside the orbitals. */
  children?: React.ReactNode
}

/**
 * Recursively renders the given orbitals, nesting each one's satellites within it.
 */
function getOrbitalElements(orbitals: OrbitalData[], isSatellite?: boolean, parentId?: string) {
  return orbitals.map((orbital) => (
    <Orbital {...orbital} key={orbital.id} isSatellite={isSatellite} parentId={parentId}>
      {orbital.satellites && getOrbitalElements(orbital.satellites, !isSatellite, orbital.id)}
    </Orbital>
  ))
}

/**
 * Everything rendered inside the canvas: the camera, the skybox, and the scene itself.
 */
function CanvasContent({ cameraRef, onAnimate, children }: CanvasContentProps) {
  const orbitalData = useStore((state) => state.orbitalData)
  // the canvas is measured afresh as the window resizes (or the phone turns), the camera with it
  const { size } = useThree()

  return (
    <>
      <SkyboxSetup />
      <AnimationTick onAnimate={onAnimate} />
      <Camera ref={cameraRef} ratio={size.width / size.height} />
      <group>
        {getOrbitalElements(orbitalData)}
        <Sun />
        {children}
      </group>
      <LabelSync />
    </>
  )
}

/**
 * Connects the scene's canvas to the store.
 */
export function Scene({ onAnimate, children }: Props) {
  const changeZoomLevel = useStore((state) => state.changeZoom)
  const targetName = useStore((state) => state.targetName)
  const cameraRef = useRef<CameraHandle>(null)

  /**
   * Invokes the given callback with the new computed zoom level for the given delta.
   */
  const computeZoom = (delta: number, callback: (zoom: number) => void) => {
    const controls = cameraRef.current?.controls

    if (!controls) return

    controls.stopAutoRotate()

    const zoom = controls.getZoomDelta(delta)
    const current = Math.round(controls.level * 100)

    if (current !== zoom) {
      callback(zoom)
    }
  }

  /**
   * Tweens the camera to the given zoom level.
   */
  const tweenZoom = (zoom: number) => {
    cameraRef.current?.controls.tweenZoom(zoom, changeZoomLevel, Constants.WebGL.Tween.ZOOM)
  }

  /**
   * Zooms the camera by however far the user scrolled.
   */
  const onWheel: React.WheelEventHandler<HTMLDivElement> = (ev) => {
    computeZoom(ev.deltaY, tweenZoom)
  }

  /**
   * Zooms the camera by however far the user pinched.
   */
  const onPinch = (separationDelta: number) => {
    computeZoom(-separationDelta * Constants.UI.PINCH_DELTA_SCALE, changeZoomLevel)
  }

  /**
   * Handles the arrow key presses.
   *
   *  - arrow keys rotate the camera
   *  - `Ctrl`+`+` or `⌘`+`+` zooms in
   *  - `Ctrl`+`-` or `⌘`+`-` zooms out
   */
  const onKeyDown = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    const controls = cameraRef.current?.controls
    const turn = Constants.UI.KEYBOARD_ROTATE_KEYS[ev.key]
    const scroll = Constants.UI.KEYBOARD_ZOOM_KEYS[ev.key]

    if (!controls?.enabled || ev.altKey || ev.ctrlKey || ev.metaKey) return

    if (turn) {
      ev.preventDefault()
      controls.stopAutoRotate()
      controls.rotateLeft(turn[0])
      controls.rotateUp(turn[1])
    } else if (scroll) {
      ev.preventDefault()
      computeZoom(scroll, tweenZoom)
    }
  }

  return (
    <Event
      id={Constants.UI.SCENE_ID}
      label={targetName ? `Solar system, viewing ${targetName}` : 'Solar system'}
      instructions="Use the arrow keys to turn the camera, and plus or minus to zoom it."
      onKeyDown={onKeyDown}
      onWheel={onWheel}
      onPinch={onPinch}
    >
      <Canvas
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance'
        }}
      >
        <CanvasContent cameraRef={cameraRef} onAnimate={onAnimate}>
          {children}
        </CanvasContent>
      </Canvas>
    </Event>
  )
}
