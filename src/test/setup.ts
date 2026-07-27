import '@testing-library/jest-dom'
import { vi } from 'vitest'
import type { Camera, Texture } from 'three'

class MockOrbitControls {
  camera: Camera
  enabled = true
  enableZoom = true
  enablePan = true
  autoRotate = false
  autoRotateSpeed = 0
  minDistance = 0
  maxDistance = Infinity

  constructor(camera: Camera, _domElement: HTMLElement) {
    this.camera = camera
  }
  update() {}
  dispose() {}
}

vi.mock('three/examples/jsm/controls/OrbitControls.js', () => ({
  OrbitControls: MockOrbitControls
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
    camera: { add: vi.fn(), position: { length: () => 1000 } },
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
