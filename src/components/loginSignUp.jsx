import React, { useState, useCallback } from 'react';
import SwipeableViews from 'react-swipeable-views';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import Login from './login';
import SignUp from './signup';
import { defineMessages, injectIntl } from 'react-intl';

function TabPanel(props) {
  const { children, value, index } = props;

  return <div>{value === index && <Box p={1}>{children}</Box>}</div>;
}

const messages = defineMessages({
  login: {
    id: 'home-page.login',
  },
  signUp: {
    id: 'home-page.signup',
  },
});

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    width: '500',
    maxWidth: '90vw',
    color: 'black',
  },
}));

function LoginSignUp({ intl }) {
  const classes = useStyles();
  const theme = useTheme();
  const [value, setValue] = useState(0);

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
    </div>
  );
}

export default injectIntl(LoginSignUp);
