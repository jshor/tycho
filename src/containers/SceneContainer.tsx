import React, { useEffect } from 'react'
import TWEEN from 'tween.js'
import { CubeTextureLoader } from 'three'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { connect } from 'react-redux'
import Scene from '../components/Scene'
import Constants from '../constants'
import * as AnimationActions from '../actions/AnimationActions'
import * as UIControlsActions from '../actions/UIControlsActions'
import * as LabelActions from '../actions/LabelActions'
import ReduxService from '../services/ReduxService'
import CameraContainer, { CameraContainerHandle, CameraAction } from './CameraContainer'
import EventContainer from './EventContainer'
import { OrbitalData } from '../types'

interface Props {
  orbitalData: OrbitalData[]
  onAnimate: () => void
  width: number
  height: number
  time?: number
  scale?: number
  speed?: number
  volume?: number
  zoom?: number
  targetId?: string
  highlightedOrbitals?: string[]
  isAutoOrbitEnabled?: boolean
  children?: React.ReactNode
  action?: CameraAction
}

function SkyboxSetup() {
  const { scene } = useThree()
  useEffect(() => {
    const loader = new CubeTextureLoader()
    scene.background = loader.load(Constants.WebGL.SKYBOX_TEXTURES)
  }, [scene])
  return null
}

function AnimationTick({ onAnimate }: { onAnimate: () => void }) {
  useFrame(() => {
    onAnimate()
    ;(TWEEN as any).update()
  })
  return null
}

interface CanvasContentProps {
  props: Props
  cameraRef: React.RefObject<CameraContainerHandle>
  onAnimate: () => void
}

function CanvasContent({ props, cameraRef, onAnimate }: CanvasContentProps) {
  const { camera } = useThree()
  const {
    orbitalData,
    time,
    scale,
    action,
    targetId,
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
      <CameraContainer
        ref={cameraRef}
        ratio={width / height}
        targetId={targetId}
        action={action}
        speed={speed}
        scale={scale}
        zoom={zoom}
        volume={volume}
        isAutoOrbitEnabled={isAutoOrbitEnabled}
        orbitalData={orbitalData}
      />
      <Scene
        time={time}
        orbitalData={orbitalData}
        scale={scale}
        action={action}
        targetId={targetId}
        highlightedOrbitals={highlightedOrbitals}
        camera={camera}
      >
        {children}
      </Scene>
    </>
  )
}

export class SceneContainer extends React.Component<Props> {
  cameraRef = React.createRef<CameraContainerHandle>()

  onAnimate = () => {
    this.props.onAnimate()
  }

  changeZoom = (ev: WheelEvent) => {
    this.cameraRef.current?.controls?.wheelZoom(ev, this.props.action.changeZoom)
  }

  render() {
    const { width, height } = this.props

    return (
      <EventContainer onWheel={this.changeZoom as any}>
        <Canvas style={{ width, height }} gl={{ antialias: true, alpha: true }}>
          <CanvasContent props={this.props} cameraRef={this.cameraRef} onAnimate={this.onAnimate} />
        </Canvas>
      </EventContainer>
    )
  }
}

export default connect(
  ReduxService.mapStateToProps(
    'uiControls.zoom',
    'uiControls.scale',
    'uiControls.speed',
    'uiControls.volume',
    'label.targetId',
    'label.highlightedOrbitals',
    'tour.isAutoOrbitEnabled',
    'animation.time',
    'data.orbitalData'
  ),
  ReduxService.mapDispatchToProps(UIControlsActions, AnimationActions, LabelActions)
)(SceneContainer as React.ComponentType<any>) as any
