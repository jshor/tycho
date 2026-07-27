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

  return render(<Provider store={store}>{ui}</Provider>, options)
}
