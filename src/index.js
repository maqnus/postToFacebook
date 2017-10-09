import React from 'react';
import ReactDOM from 'react-dom';
import AppRoot from './root';
const domAccessor = document.getElementById('app');

const render = props => {
  const { domAccessor } = props;
  ReactDOM.render(
    <AppRoot />,
    domAccessor
  );
}

render({domAccessor});
