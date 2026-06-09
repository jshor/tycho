import { useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import CameraControls from './containers/CameraControls'
import SolarSystem from './containers/SolarSystem'
import Controls from './containers/Controls'
import { Camera } from './constants/WebGL'
import { store } from './store/new-store'
import './App.css'

/** Drives the simulation clock once per frame (gated internally by `playing`). */
const ClockTick = () => {
  useFrame(() => store.getState().updateClock())
  return null
}

const App = () => {
  // load the real orbital data into the store once
  useEffect(() => {
    store.getState().loadOrbitals()
  }, [])

  const gl = {
    logarithmicDepthBuffer: true
  }
  const camera = {
    // frames the inner system (Earth orbit ~150 units); zoom out reaches the
    // outer planets (Pluto ~5900) up to CameraControls' maxDistance
    position: new Vector3(0, 1500, 3000),
    fov: Camera.FOV,
    // bodies are true-to-scale and sub-unit, so the near plane must be tiny or
    // they clip away as you zoom in; the logarithmic depth buffer (see `gl`)
    // keeps the huge near/far ratio free of z-fighting
    near: Camera.NEAR,
    far: 100000
  }

  return (
    <div>
      <Canvas camera={camera} gl={gl}>
        <ClockTick />
        <CameraControls />
        <SolarSystem />
      </Canvas>
      <Controls />
    </div>
  )
}

export default App
