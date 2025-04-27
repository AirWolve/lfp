import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { RouterType } from './config.js';

function disableNumberInputScroll(e) {
  // Prevent scrolling when using number inputs
  if (e.target.tagName === 'INPUT' && e.target.type === 'number') {
    e.preventDefault();
  }
}

window.addEventListener('wheel', disableNumberInputScroll, { passive: false });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterType>
      <App />
    </RouterType>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
