import React from 'react';
import ReactDOM from 'react-dom';

import store from './store';

import { SnackbarProvider } from 'notistack';
import { Provider as ReduxProvider } from 'react-redux';
import ConfirmationProvider from '@/utils/confirm-dialog';
import LanguageWrapper from './components/language-wrapper';

import './index.css';
import App from './App';

const Website = <LanguageWrapper>
  <ReduxProvider store={store}>
    <SnackbarProvider>
      <ConfirmationProvider>
        <App />
      </ConfirmationProvider>
    </SnackbarProvider>
  </ReduxProvider>
</LanguageWrapper>;

ReactDOM.render(Website, document.getElementById('root'));
