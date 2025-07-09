// src/GlobalStyles.ts
import { createGlobalStyle } from 'styled-components';
import ms_sans_serif from '@react95/icons/fonts/ms_sans_serif.woff2';

const GlobalStyles = createGlobalStyle`
  @font-face {
    font-family: 'ms_sans_serif';
    src: url(${ms_sans_serif}) format('woff2');
  }

  body {
    margin: 0;
    font-family: 'ms_sans_serif', sans-serif;
    background: teal;
  }
`;

export default GlobalStyles;
