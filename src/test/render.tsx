import React from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { Provider } from 'react-redux'
import createStore from '../store'
import { RootState } from '../types'

export const renderWithStore = (
  ui: React.ReactElement,
  initialState?: Partial<RootState>,
  options?: RenderOptions
): RenderResult => {
  const store = createStore(initialState)
  const withStore = (node: React.ReactElement) => <Provider store={store}>{node}</Provider>
  const result = render(withStore(ui), options)

  return {
    ...result,
    rerender: (node: React.ReactElement) => result.rerender(withStore(node))
  }
}
