import '@testing-library/jest-dom'
import { beforeEach, vi } from 'vitest'
import { Vector3, type Texture } from 'three'
import { useStore } from '../store'
import React from 'react'

const pristineStore = useStore.getState()

beforeEach(() => {
  useStore.setState(pristineStore, true)
})

// stub resize observer, which is not available in jsdom
global.ResizeObserver = class MockResizeObserver implements ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

// stub react-three-fiber's intrinsics (`<group>`, `<mesh>`, etc.) which are not real DOM elements
const object3dMethods = [
  'add',
  'remove',
  'clear',
  'lookAt',
  'updateMatrixWorld',
  'updateWorldMatrix'
] as const

object3dMethods.forEach((method) => {
  if (!(method in SVGElement.prototype)) {
    Object.defineProperty(SVGElement.prototype, method, {
      value: vi.fn(),
      writable: true,
      configurable: true
    })
  }
})

vi.mock('@react-three/fiber', () => ({
  // the scene hangs off an SVG root, which is where the DOM stops and three's elements start
  Canvas: ({ children }: { children?: React.ReactNode }): React.ReactNode =>
    React.createElement('svg', null, children),

  useThree: () => ({
    camera: {
      add: vi.fn(),
      position: new Vector3(0, 0, 1000)
    },
    scene: {
      getObjectByName: vi.fn(),
      add: vi.fn(),
      background: null as Texture | null
    },
    gl: {
      domElement: document.createElement('canvas')
    }
  }),

  useFrame: vi.fn()
}))

vi.mock('@react-three/drei', async () => {
  const React = (await import('react')).default

  const Text = React.forwardRef<
    unknown,
    {
      children?: React.ReactNode
      onClick?: React.MouseEventHandler
      onPointerOver?: React.PointerEventHandler
      onPointerOut?: React.PointerEventHandler
    }
  >(({ children, onClick, onPointerOver, onPointerOut }, _ref): React.ReactElement => {
    return React.createElement(
      'span',
      {
        onClick,
        onPointerOver,
        onPointerOut
      },
      children
    )
  })

  Text.displayName = 'Text'

  return {
    PerspectiveCamera: (): null => null,
    Line: (): null => null,
    Text
  }
})
