import { AppBar, Toolbar, Typography, makeStyles, Button } from '@material-ui/core'
import Link from '@/components/link';
import { LocaleSelector } from '@/components/language-wrapper';
import { getPath } from '@/utils';
import { useSelector, useDispatch } from 'react-redux';
import { useMemo } from 'react';
import { useRouteMatch, useLocation } from 'react-router-dom';
import { logout } from '@/store/actions/auth';
import { useIntl } from 'react-intl';
import iconPath from '@/assets/icon.png';

const useStyles = makeStyles(theme => ({
  appBar: {
    backgroundColor: theme.palette.primary.main,
    width: '100vw',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    color: 'white',
    flexGrow: 1,
    '&:hover': {
      textDecoration: 'none'
    },
  },
  title: {
    fontFamily: `'open sans','helvetica neue',helvetica,arial,sans-serif`,
    fontWeight: 'bold',
    textDecoration: 'none',
    display: 'inline-block'
  },
  icon: {
    width: '18px',
    aspectRatio: '1 / 1',
    display: 'inline-block',
    marginRight: '10px'
  },
  button: {
    color: 'white',
  },
}));

export default function Bar () {
  const classes = useStyles();

  const dispatch = useDispatch();
  const intl = useIntl();

  const isAuthenticated = useSelector(state => Boolean(state.auth.access));

  const { url } = useRouteMatch();
  const { pathname: path } = useLocation();

  const linkProps = useMemo(() =>
    isAuthenticated ?
      {
        to: getPath('manage'),
        onClick: e => (path === url ? e.preventDefault() : null)
      } :
      { to: getPath('home') },
      [isAuthenticated, path, url]
    );

  return <AppBar className={classes.appBar} position='fixed'>
    <Toolbar>
      <Link
        {...linkProps}
        className={classes.logo}
      >
        <img src={iconPath} alt="logo" className={classes.icon}/>
        <Typography variant='h6' className={classes.title}>
          SafePoll
        </Typography>
      </Link>
      <LocaleSelector black={true} />
      {isAuthenticated &&
        <Button
          className={classes.button}
          onClick={() => dispatch(logout())}
        >
          {intl.formatMessage({ id: 'manage.leave' })}
        </Button>
      }
    </Toolbar>
  </AppBar>
}
