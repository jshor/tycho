import '@testing-library/jest-dom'
import { beforeEach, vi } from 'vitest'
import { AudioLoader, Vector3, type Camera, type Texture } from 'three'
import { useStore } from '../store'

/**
 * The store is a module-level singleton, so state a test seeds (or an action it replaces with a
 * spy) would otherwise leak into every test that follows.
 */
const pristineStore = useStore.getState()

beforeEach(() => {
  useStore.setState(pristineStore, true)
})

/**
 * three's AudioLoader fetches a root-relative asset URL, which Node's fetch rejects outright
 * ("Failed to parse URL"). Nothing asserts on the load itself, so replace it outright rather than
 * spy on it — a spy would be undone by the suites that call restoreAllMocks.
 */
AudioLoader.prototype.load = vi.fn()

/**
 * jsdom has no Web Audio implementation, and three's AudioListener builds an AudioContext the
 * moment anything renders the Ambience path. Only the handful of members three actually touches
 * are provided here — the fuller `web-audio-mock` package patches enough globals to break
 * user-event's clipboard stub, so it stays scoped to the one suite that imports it directly.
 */
class MockAudioContext {
  currentTime = 0
  destination = {}
  createGain(): { gain: { value: number }; connect: () => void; disconnect: () => void } {
    return { gain: { value: 1 }, connect: vi.fn(), disconnect: vi.fn() }
  }
  createBuffer(): object {
    return {}
  }
  decodeAudioData(): Promise<object> {
    return Promise.resolve({})
  }
}

if (!('AudioContext' in global)) {
  Object.defineProperty(global, 'AudioContext', {
    value: MockAudioContext,
    writable: true,
    configurable: true
  })
}

/**
 * jsdom has no ResizeObserver, which react-slider constructs on mount.
 */
class MockResizeObserver implements ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

global.ResizeObserver = MockResizeObserver

/**
 * react-three-fiber's intrinsics (`<group>`, `<mesh>`, …) are not real DOM tags, so jsdom renders
 * them as HTMLUnknownElement. Components that reach for a three.js Object3D method on a ref — Sun
 * calls `groupRef.current.add(...)` — would otherwise blow up. These no-ops stand in for the
 * Object3D surface those refs are expected to expose.
 */
const object3dMethods = ['add', 'remove', 'clear', 'lookAt', 'updateMatrixWorld'] as const

object3dMethods.forEach((method) => {
  if (!(method in HTMLUnknownElement.prototype)) {
    Object.defineProperty(HTMLUnknownElement.prototype, method, {
      value: vi.fn(),
      writable: true,
      configurable: true
    })
  }
})

vi.mock('three/examples/jsm/controls/OrbitControls.js', () => ({
  OrbitControls: class {
    camera: Camera
    enabled = true
    enableZoom = true
    enablePan = true
    autoRotate = false
    autoRotateSpeed = 0
    minDistance = 0
    maxDistance = Infinity
    touches = {
      ONE: 3,
      TWO: 3
    }

    constructor(camera: Camera, _domElement: HTMLElement) {
      this.camera = camera
    }
    update() {}
    dispose() {}
  }
}))

vi.mock('three/examples/jsm/objects/Lensflare.js', () => ({
  Lensflare: vi.fn().mockImplementation(function (this: {
    position: { set: () => void }
    addElement: () => void
  }) {
    this.position = { set: vi.fn() }
    this.addElement = vi.fn()
  }),
  LensflareElement: vi.fn()
}))

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children?: React.ReactNode }): React.ReactNode => children,
  useThree: () => ({
    camera: { add: vi.fn(), position: new Vector3(0, 0, 1000) },
    scene: { getObjectByName: vi.fn(), add: vi.fn(), background: null as Texture | null },
    gl: { domElement: document.createElement('canvas') }
  }),
  useFrame: vi.fn()
}))

vi.mock('@react-three/drei', async () => {
  const React = (await import('react')).default

  interface TextProps {
    children?: React.ReactNode
    onClick?: React.MouseEventHandler
    onPointerOver?: React.PointerEventHandler
    onPointerOut?: React.PointerEventHandler
  }

  const Text = React.forwardRef<unknown, TextProps>(
    ({ children, onClick, onPointerOver, onPointerOut }, _ref): React.ReactElement =>
      React.createElement('span', { onClick, onPointerOver, onPointerOut }, children)
  )

  Text.displayName = 'Text'

  return {
    Html: ({ children }: { children?: React.ReactNode }): React.ReactNode => children,
    PerspectiveCamera: (): null => null,
    Line: (): null => null,
    Text
  }
})
