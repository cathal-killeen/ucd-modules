import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Redirect, browserHistory } from 'react-router';
// import createBrowserHistory from 'react-router/node_modules/history/lib/createBrowserHistory'
import { createHistory } from 'history'
import injectTapEventPlugin from 'react-tap-event-plugin';
import { syncHistoryWithStore } from 'react-router-redux';

import configureStore from './store/configureStore';
import routes from './routes';
import './style.scss';

require('expose?$!expose?jQuery!jquery');
require('bootstrap-webpack');

injectTapEventPlugin();

const memoryHistory = createHistory()
const store = configureStore(memoryHistory)
const history = syncHistoryWithStore(memoryHistory, store)


ReactDOM.render(
    <Provider store={store}>
        <Router history={history} onUpdate={() => window.scrollTo(0, 0)}>
            {/* <Redirect from="/" to="main" /> */}
            {routes}
        </Router>
    </Provider>,
    document.getElementById('root')
);
