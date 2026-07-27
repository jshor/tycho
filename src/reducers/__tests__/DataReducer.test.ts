import reducer from '../DataReducer'
import Actions from '../../constants/Actions'
import { DataState } from '../../types'

describe('Data Reducer', () => {
  it('should return the state', () => {
    const state: DataState = { orbitalData: [] }
    const result = reducer(state, { type: 'UNKNOWN_ACTION' })

    expect(result).toEqual(state)
  })

  it('should handle SET_ORBITAL_DATA', () => {
    const orbitalData = {}
    const result = reducer(undefined, {
      type: Actions.SET_ORBITAL_DATA,
      orbitalData
    })

    expect(result).toEqual({ orbitalData })
  })

  it('should handle SET_PAGE_TEXT', () => {
    const pageText = {}
    const result = reducer(undefined, {
      type: Actions.SET_PAGE_TEXT,
      pageText
    })

    expect(result).toEqual({ pageText })
  })
})
