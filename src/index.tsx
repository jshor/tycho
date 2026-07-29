import { createRoot } from 'react-dom/client'
import { App } from './modules/app'
import './index.scss'

const root = createRoot(document.getElementById('root') || document.createElement('div'))

root.render(<App />)
