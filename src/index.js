import React from 'react';
import ReactDOM from 'react-dom';
import { ptBR } from '@material-ui/core/locale';

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { SnackbarProvider } from 'notistack';
import { Provider } from 'react-redux';
import { ConfirmationProvider } from '@/utils/confirm-dialog';

import store from './store';

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const theme = createMuiTheme({
    palette: {
        primary: { main: '#1976d2' },
    },
}, ptBR);



ReactDOM.render(
    <ThemeProvider theme={theme}>
        <Provider store={store}>
            <SnackbarProvider>
                <ConfirmationProvider>
                    <App />
                </ConfirmationProvider>
            </SnackbarProvider>
        </Provider>
    </ThemeProvider>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
