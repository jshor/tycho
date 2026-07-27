import { AnyAction, Dispatch } from 'redux'
import Actions from '../constants/Actions'
import { OrbitalData, PageText } from '../types'
import { env } from '../utils/Environment'

export const requestOrbitalData = () => (dispatch: Dispatch<AnyAction>) => {
  return fetch(env('/static/data/orbitals.json'))
    .then((res) => res.json())
    .then((orbitalData: OrbitalData[]) => {
      dispatch({
        type: Actions.SET_ORBITAL_DATA,
        orbitalData
      })
    })
}

export const requestPageText = () => (dispatch: Dispatch<AnyAction>) => {
  return fetch(env('/static/data/pageText.json'))
    .then((res) => res.json())
    .then((pageText: PageText) => {
      dispatch({
        type: Actions.SET_PAGE_TEXT,
        pageText
      })
    })
}
