import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// This is container, so no need to render conditionally. We always want to render immediately.
ReactDOM.render(<App />, document.querySelector('#root'));
