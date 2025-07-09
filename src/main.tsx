import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import '@react95/core/GlobalStyle';
import '@react95/core/themes/win95.css';
import styleReset from 'styled-reset';
import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  ${styleReset}

  body {
    font-family: 'ms_sans_serif', sans-serif;
    background-color: teal;
    padding: 20px;
  }
`;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GlobalStyles />
    <App />
  </React.StrictMode>
);
