import React, { useState, useCallback } from 'react';
import SwipeableViews from 'react-swipeable-views';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Login from './login';
import SignUp from './signup';

import GoogleLogin from 'react-google-login';

import { defineMessages, injectIntl } from 'react-intl';

import { useDispatch } from 'react-redux';
import { googleLogin } from '@/store/actions/auth';

function TabPanel({ children, value, index }) {
  return <div>{value === index && <Box p={1}>{children}</Box>}</div>;
}

const messages = defineMessages({
  login: {
    id: 'home-page.login',
  },
  signUp: {
    id: 'home-page.signup',
  },
  google: {
    id: 'home-page.google.login'
  }
});

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    width: '500',
    maxWidth: '90vw',
    color: 'black',
  },
  container: {
    width: '100%'
  }
}));

function LoginSignUp({ intl }) {
  const classes = useStyles();
  const theme = useTheme();
  const [value, setValue] = useState(0);

  const dispatch = useDispatch();

  const handleChange = useCallback((event, newValue) => {
    setValue(newValue);
  }, []);

  return (
    <div className={classes.root}>
      <AppBar position='static' color='default'>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor='primary'
          textColor='primary'
          variant='fullWidth'
        >
          <Tab label={intl.formatMessage(messages.login)} />
          <Tab label={intl.formatMessage(messages.signUp)} />
        </Tabs>
      </AppBar>
      <SwipeableViews
        onSwitching={(v) => (Number.isInteger(v) ? setValue(v) : null)}
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={value}
      >
        <TabPanel value={value} index={0} dir={theme.direction}>
          <Login />
        </TabPanel>
        <TabPanel value={value} index={1} dir={theme.direction}>
          <SignUp />
        </TabPanel>
      </SwipeableViews>
      <Grid container className={classes.container} alignContent="center" alignItems="center">
        <Grid item xs={3}/>
        <Grid item style={{ marginBottom: '10px', marginTop: '-20px' }}>
          <GoogleLogin
            clientId="109753109659-lafbr7ekvdg3o245rq4a2bjbkag0j6tr.apps.googleusercontent.com"
            buttonText={intl.formatMessage(messages.google)}
            onSuccess={(...args) => dispatch(googleLogin(...args))}
            onFailure={console.error}
          />
        </Grid>
      </Grid>
    </div>
  );
}

export default injectIntl(LoginSignUp);
