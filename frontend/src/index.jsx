import React from 'react';
import { render } from 'react-dom';
import Routes from './Routes';
import store from './store';

render(
  <Routes/>,
  document.getElementById('app'));
