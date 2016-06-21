import React from 'react';
import { Router, browserHistory } from 'react-router';
import { render } from 'react-dom';
import routes from './Routes';
import store from './store';

render(
  <Router history={browserHistory}>
    {routes}
  </Router>,
  document.getElementById('app'));
