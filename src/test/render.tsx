import React from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { useStore } from '../store'
import { Store } from '../types'

/**
 * Seeds the store before rendering.
 *
 * The store is a singleton, so state (and any action replaced with a spy) is set on it directly
 * rather than handed to a provider. `src/test/setup.ts` resets it between tests.
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
