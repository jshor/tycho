import React, { useEffect, useRef } from 'react'
import TWEEN from 'tween.js'
import { CubeTextureLoader } from 'three'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { connect } from 'react-redux'
import SceneView from '../components/scene'
import Constants from '../constants'
import * as AnimationActions from '../actions/AnimationActions'
import * as UIControlsActions from '../actions/UIControlsActions'
import * as LabelActions from '../actions/LabelActions'
import ReduxService from '../services/ReduxService'
import Camera, { CameraHandle, CameraAction } from './camera'
import Event from './event'
import { OrbitalData, OrbitalLabelActions } from '../types'

/** Passed in by whoever renders the container. */
interface OwnProps {
  /** Invoked on every animation frame of the scene. */
  onAnimate: () => void
  /** The width of the canvas, in px. */
  width: number
  /** The height of the canvas, in px. */
  height: number
  /** Anything rendered into the scene alongside the orbitals. */
  children?: React.ReactNode
}

/** Supplied by connect. */
interface StateProps {
  /** The orbital data for the Solar System. */
  orbitalData: OrbitalData[]
  /** The current simulation time. */
  time?: number
  /** The scene's current size scale. */
  scale?: number
  /** The speed at which time passes in the simulation. */
  speed?: number
  /** The volume of the scene's ambience, from 0 to 1. */
  volume?: number
  /** The current zoom level. */
  zoom?: number
  /** The id of the orbital the camera is focused on. */
  targetId?: string
  /** Whether the camera animates its way to a newly focused orbital. */
  animateTargetChange?: boolean
  /** The ids of the orbitals whose paths are highlighted. */
  highlightedOrbitals?: string[]
  /** Whether the camera is orbiting its target on its own. */
  isAutoOrbitEnabled?: boolean
}

export interface Props extends StateProps, OwnProps {
  /** Store actions. */
  action?: CameraAction & OrbitalLabelActions
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
  /** The scene the canvas renders. */
  props: Props
  /** A handle on the camera, for the zoom the canvas captures. */
  cameraRef: React.RefObject<CameraHandle>
  /** Invoked on every animation frame of the scene. */
  onAnimate: () => void
}

/**
 * Everything rendered inside the canvas: the camera, the skybox, and the scene itself.
 */
function CanvasContent({ props, cameraRef, onAnimate }: CanvasContentProps) {
  const {
    orbitalData,
    time,
    scale,
    action,
    targetId,
    animateTargetChange,
    highlightedOrbitals,
    zoom,
    volume,
    isAutoOrbitEnabled,
    speed,
    width,
    height,
    children
  } = props

  return (
    <>
      <SkyboxSetup />
      <AnimationTick onAnimate={onAnimate} />
      <Camera
        ref={cameraRef}
        ratio={width / height}
        targetId={targetId}
        animateTargetChange={animateTargetChange}
        action={action}
        speed={speed}
        scale={scale}
        zoom={zoom}
        volume={volume}
        isAutoOrbitEnabled={isAutoOrbitEnabled}
        orbitalData={orbitalData}
      />
      <SceneView
        time={time}
        orbitalData={orbitalData}
        scale={scale}
        action={action}
        targetId={targetId}
        highlightedOrbitals={highlightedOrbitals}
      >
        {children}
      </SceneView>
    </>
  )
}

/**
 * Connects the scene's canvas to the store.
 */
export function Scene(props: Props) {
  const { width, height, action, onAnimate } = props
  const cameraRef = useRef<CameraHandle>(null)

  /** Zooms the camera by however far the user scrolled. */
  const changeZoom: React.WheelEventHandler<HTMLDivElement> = (ev) => {
    cameraRef.current?.controls?.wheelZoom(ev, action.changeZoom)
  }

  return (
    <Event onWheel={changeZoom}>
      <Canvas style={{ width, height }} gl={{ antialias: true, alpha: true }}>
        <CanvasContent props={props} cameraRef={cameraRef} onAnimate={onAnimate} />
      </Canvas>
    </Event>
  )
}

export default connect(
  ReduxService.mapStateToProps<StateProps>(
    'uiControls.zoom',
    'uiControls.scale',
    'uiControls.speed',
    'uiControls.volume',
    'label.targetId',
    'label.animateTargetChange',
    'label.highlightedOrbitals',
    'tour.isAutoOrbitEnabled',
    'animation.time',
    'data.orbitalData'
  ),
  ReduxService.mapDispatchToProps<Props['action']>(
    UIControlsActions,
    AnimationActions,
    LabelActions
  )
)(Scene)
