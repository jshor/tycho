import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import AppContainer from './containers/AppContainer'
import Store from './store'
import 'react-datetime/css/react-datetime.css'
import './index.scss'

const StoreInstance = Store()
const root = createRoot(document.getElementById('root') || document.createElement('div'))

root.render(
  <Provider store={StoreInstance}>
    <AppContainer />
  </Provider>
)
