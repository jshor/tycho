import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import AppContainer from './containers/AppContainer';
import Store from './store';
import 'react-datetime/css/react-datetime.css';
import './index.css';

const StoreInstance = Store();

ReactDOM.render(
    <Provider store={StoreInstance}>
        <AppContainer />
    </Provider>,
    document.getElementById('root') || document.createElement('div')
);
