import React from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { useStore } from '../store'
import { Store } from '../types'

/**
 * Seeds the store before rendering.
 */
export const renderWithStore = (
  ui: React.ReactElement,
  initialState?: Partial<Store>,
  options?: RenderOptions
): RenderResult => {
  if (initialState) {
    useStore.setState(initialState)
  }

  return render(ui, options)
}

/**
 * Renders a piece of the scene, as the mocked `Canvas` renders the scene itself.
 */
export const renderInScene = (
  ui: React.ReactElement,
  initialState?: Partial<Store>,
  options?: RenderOptions
): RenderResult => {
  const container = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg'
  ) as unknown as HTMLElement

  document.body.appendChild(container)

  return renderWithStore(ui, initialState, { container, ...options })
}
