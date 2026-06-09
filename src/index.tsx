import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'react-datetime/css/react-datetime.css';
import './index.scss';

const root = createRoot(document.getElementById('root') || document.createElement('div'));

root.render(<App />);
