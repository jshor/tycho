import { createStore, applyMiddleware, compose, PreloadedState, Store } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from '../reducers'
import { RootState } from '../types'

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose
  }
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export default (initialState?: Partial<RootState>): Store<RootState> => {
  return createStore(
    rootReducer,
    initialState as PreloadedState<RootState>,
    composeEnhancers(applyMiddleware(thunk))
  )
}
