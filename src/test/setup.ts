import '@testing-library/jest-dom'
import { vi } from 'vitest'

class MockOrbitControls {
  camera: any
  enabled = true
  enableZoom = true
  enablePan = true
  autoRotate = false
  autoRotateSpeed = 0
  minDistance = 0
  maxDistance = Infinity

  constructor(camera: any, _domElement: any) {
    this.camera = camera
  }
  update() {}
  dispose() {}
}

vi.mock('three/examples/jsm/controls/OrbitControls.js', () => ({
  OrbitControls: MockOrbitControls
}))

vi.mock('three/examples/jsm/objects/Lensflare.js', () => ({
  Lensflare: vi.fn().mockImplementation(function (this: any) {
    this.position = { set: vi.fn() }
    this.addElement = vi.fn()
  }),
  LensflareElement: vi.fn()
}))

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => children,
  useThree: () => ({
    camera: { add: vi.fn(), position: { length: () => 1000 } },
    scene: { getObjectByName: vi.fn(), add: vi.fn(), background: null },
    gl: { domElement: document.createElement('canvas') }
  }),
  useFrame: vi.fn()
}))

vi.mock('@react-three/drei', async () => {
  const React = (await import('react')).default
  return {
    Html: ({ children }: any) => children,
    PerspectiveCamera: () => null,
    Line: () => null,
    Text: React.forwardRef(({ children, onClick, onPointerOver, onPointerOut }: any, _ref: any) =>
      React.createElement('span', { onClick, onPointerOver, onPointerOut }, children)
    )
  }
})
