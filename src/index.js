import React from 'react';
import ReactDOM from 'react-dom';

import { SnackbarProvider } from 'notistack';
import { Provider } from 'react-redux';
import { ConfirmationProvider } from '@/utils/confirm-dialog';
import LanguageWrapper from './components/language-wrapper';
import store from './store';

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <LanguageWrapper>
    <Provider store={store}>
      <SnackbarProvider>
        <ConfirmationProvider>
          <App />
        </ConfirmationProvider>
      </SnackbarProvider>
    </Provider>
  </LanguageWrapper>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
