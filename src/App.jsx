import { Grow as GrowTransition, createMuiTheme, ThemeProvider } from '@material-ui/core';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { useSnackbar } from 'notistack';

import ConditionRoute from '@/components/condition-route';

import Home from '@/views/home';
import Login from '@/views/login';
import ResetPassword from '@/views/resetPassword';
import ResetPasswordConfirm from '@/views/resetPasswordConfirm';
import Dashboard from '@/views/manage';
import Vote from '@/views/voteForm';

import LoadingScreen from '@/components/loading-screen';

import { useSelector, useDispatch } from 'react-redux';
import { checkAuthenticated } from '@/store/actions/auth';
import { fetchUserGroups, fetchUserPolls } from '@/store/actions/items';
import { clearNotify } from '@/store/actions/ui';
import { ptBR, esES, enUS } from '@material-ui/core/locale';
import { useContext, useEffect, useState, useMemo } from 'react';
import { LocaleContext } from './components/language-wrapper';

import { getPath } from '@/utils/routes';

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuthenticated());
  }, [dispatch]);

  const isAuthenticated = useSelector((state) => Boolean(state.auth.access));

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserGroups());
      dispatch(fetchUserPolls());
    }
  }, [isAuthenticated, dispatch]);

  const { enqueueSnackbar } = useSnackbar();

  const notif = useSelector((state) => state.ui.notification);

  useEffect(() => {
    if (notif) {
      enqueueSnackbar(notif.msg, {
        variant: notif.variant,
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'center',
        },
        TransitionComponent: GrowTransition,
        autoHideDuration: 2500,
      });
      dispatch(clearNotify());
    }
  }, [notif, enqueueSnackbar, dispatch]);

  const loading = useSelector((state) => state.ui.loading);

  const [locale, setLocale] = useState(ptBR);
  const localeContext = useContext(LocaleContext);
  useEffect(() => {
    switch (localeContext.locale) {
      case 'pt-BR':
        setLocale(ptBR);
        break;
      case 'es-ES':
        setLocale(esES);
        break;
      default:
        setLocale(enUS);
    }
  }, [localeContext]);

  const theme = useMemo(() => createMuiTheme({
    palette: {
      primary: {
        main: '#044767',
        contrastText: '#ffffff'
      },
      secondary: {
        main: '#007981',
        contrastText: '#ffffff'
      },
      action: {
        main: '#4623A7',
        contrastText: '#ffffff'
      }
    },
    typography: {
      fontFamily: `'open sans','helvetica neue',helvetica,arial,sans-serif`
    }
  }, locale), [locale]);

  if (loading) {
    return <ThemeProvider theme={theme}>
      <LoadingScreen />
    </ThemeProvider>;
  }

  return <ThemeProvider theme={theme}>
    <Router>
      <Switch>
        <ConditionRoute
          exact
          path={getPath('home')}
          component={Home}
          condition={!isAuthenticated}
          redirect={getPath('manage')}
        />
        <ConditionRoute
          path={getPath('manage')}
          component={Dashboard}
          condition={isAuthenticated}
          redirect={getPath('login')}
        /*
          * Nesse caso, não usamos o exact, pois essa rota servirá
          * para dar match em /manage/polls/*, /manage/groups/*, etc..
          * Como especificado em views/manage/index.jsx
          */
        />
        <ConditionRoute
          exact
          path={getPath('login')}
          component={Login}
          condition={!isAuthenticated}
          redirect={getPath('manage')}
        />
        <ConditionRoute
          exact
          path={getPath('resetPassword')}
          component={ResetPassword}
          condition={!isAuthenticated}
          redirect={getPath('manage')}
        />
        <ConditionRoute
          exact
          path={getPath('confirmResetPassword')}
          component={ResetPasswordConfirm}
          condition={!isAuthenticated}
          redirect={getPath('manage')}
        />
        <Route exact path={getPath('vote')} component={Vote} />
      </Switch>
    </Router>
  </ThemeProvider>;
}
