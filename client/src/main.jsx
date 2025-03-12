// import { StrictMode } from "react";
import { createRoot } from 'react-dom/client';
import React from 'react';
import App from './App.jsx';
import { Provider } from 'react-redux';
import store from './store';
import { AuthContextProvider } from './context/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <AuthContextProvider>
    <Provider store={store}>
      <App />
    </Provider>
  </AuthContextProvider>
  /* </StrictMode> */
);
