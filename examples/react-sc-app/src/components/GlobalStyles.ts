import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  ${({ theme }) => theme.css}

  *, *::before, *::after {
    margin: 0;
    box-sizing: border-box;
  }

  body {
    font-family: system-ui, -apple-system, sans-serif;
    background: #f8f9fa;
    color: #1d1d1f;
    line-height: 1.5;
  }
`;
