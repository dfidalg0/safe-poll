import LoginSignUp from '@/components/loginSignUp';
import { Link } from 'react-router-dom';

import {
  AppBar, Toolbar, Typography
} from '@material-ui/core';

import { Grid } from '@material-ui/core';
import { LocaleSelector } from '../components/language-wrapper';
import { makeStyles } from '@material-ui/core/styles';

import { getPath } from '@/utils/routes';

const useStyles = makeStyles(theme => ({
  appBar: {
    backgroundColor: '#0b1016',
    width: '100vw',
  },
  logo: {
    textDecoration: 'none',
    color: 'white',
    flexGrow: 1,
  },
  container: {
    margin: '64px 0px 0px 0px',
    minHeight: 'calc(100vh - 64px)'
  },
  panel: {
    [theme.breakpoints.up('md')]: {
      margin: '30px 0px 100px 0px'
    },
    margin: `10px 0px 10px 0px`,
  }
}));

export default function Login() {
  const classes = useStyles();

  return (
    <>
      <AppBar className={classes.appBar} position='fixed'>
        <Toolbar>
          <Link
            to={getPath('home')}
            className={classes.logo}
          >
            <Typography variant='h6'>SafePoll</Typography>
          </Link>
          <LocaleSelector black={true} />
        </Toolbar>
      </AppBar>
      <Grid container justify='center' className={classes.container} alignItems='center'>
        <Grid item className={classes.panel}>
          <LoginSignUp />
        </Grid>
      </Grid>
    </>
  );
}
