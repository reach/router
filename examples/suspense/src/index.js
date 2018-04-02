import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import './index.css';


ReactDOM.render(
  <React.unstable_AsyncMode><App/></React.unstable_AsyncMode>,
  document.getElementById('root')
)
