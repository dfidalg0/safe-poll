import {
  Avatar,
  Breadcrumbs,
  Link,
  Button,
  CssBaseline,
  TextField,
  Typography,
  Container,
  CircularProgress,
  Grid,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';

import DisplayAlert from '@/components/displayAlert';

import { reset_password_confirm } from '@/store/actions/auth';
import { notify } from '@/store/actions/ui';

import { useDispatch, useSelector } from 'react-redux';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useStyles } from '@/styles/form';
import { defineMessages, injectIntl } from 'react-intl';
import { LocaleSelector } from './../components/language-wrapper';

const messages = defineMessages({
  passwordsDontMatch: {
    id: 'reset-password.password-match',
  },
  resetPasswordSuccess: {
    id: 'reset-password.success',
  },
  successUser: {
    id: 'reset-password.success.user',
  },
  redirect: {
    id: 'reset-password.success.redirect',
  },
  changePassword: {
    id: 'reset-passowrd.change-password',
  },
  confirm: {
    id: 'manage.confirm',
  },
  initialPage: {
    id: 'reset-page.homepage',
  },
  newPassword: {
    id: 'reset-password.new-password',
  },
  typeAgain: {
    id: 'reset-password.type-again',
  },
});

function ResetPasswordConfirm({ intl }) {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);

  const [passwordReset, setPasswordReset] = useState(false);

  const [data, setData] = useState({
    new_password: '',
    re_new_password: '',
  });

  const { new_password, re_new_password } = data;
  const onChange = useCallback(
    (e) =>
      setData((data) => ({
        ...data,
        [e.target.name]: e.target.value,
      })),
    []
  );

  const { uid, token } = useRouteMatch().params;

  const dispatch = useDispatch();

  const router = useHistory();

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (new_password === re_new_password) {
        setLoading(true);
        await dispatch(
          reset_password_confirm(uid, token, new_password, re_new_password)
        );
        setPasswordReset(true);
        setLoading(false);
      } else {
        dispatch(
          notify(intl.formatMessage(messages.passwordsDontMatch), 'error')
        );
      }
    },
    [new_password, re_new_password, dispatch, uid, token, intl]
  );

  const error = useSelector((state) => state.auth.error);

  useEffect(() => {
    if (passwordReset && !error)
      setTimeout(() => {
        dispatch(
          notify(intl.formatMessage(messages.resetPasswordSuccess), 'success')
        );
        router.replace('/');
      }, 2000);
  }, [router, passwordReset, error, dispatch, intl]);

  const DisplaySucessAlert = useCallback(
    (error) => {
      if (!error) {
        if (passwordReset) {
          return (
            <Alert
              className={classes.alert}
              style={{ marginBottom: '30px' }}
              severity='success'
            >
              {intl.formatMessage(messages.successUser)} <br />
              {intl.formatMessage(messages.redirect)}
            </Alert>
          );
        } else return null;
      } else {
        return null;
      }
    },
    [passwordReset, classes, intl]
  );

  return (
    <Grid container direction='column'>
      <Grid item>
        <LocaleSelector />
      </Grid>
      <Grid item>
        <Container className={classes.app} maxWidth='xs'>
          <CssBaseline />
          <Breadcrumbs className={classes.breadcrumb}>
            <Link color='inherit' to='/' href='/'>
              {intl.formatMessage(messages.initialPage)}
            </Link>
            <Typography color='textPrimary'>
              {intl.formatMessage(messages.changePassword)}
            </Typography>
          </Breadcrumbs>
          <div className={classes.paper}>
            {DisplayAlert(error)}
            {DisplaySucessAlert(error)}
            <Avatar className={classes.avatar} />
            {loading && (
              <CircularProgress size={45} className={classes.progress} />
            )}
            <Typography
              component='h1'
              variant='h5'
              className={classes.typography}
            >
              {intl.formatMessage(messages.changePassword)}
            </Typography>
            <form
              className={classes.form}
              noValidate
              onSubmit={(e) => onSubmit(e)}
            >
              <TextField
                variant='outlined'
                margin='normal'
                required
                fullWidth
                name='new_password'
                label={intl.formatMessage(messages.newPassword)}
                type='password'
                id='new_password'
                autoComplete='current-password'
                onChange={(e) => onChange(e)}
                disabled={loading}
              />
              <TextField
                variant='outlined'
                margin='normal'
                required
                fullWidth
                name='re_new_password'
                label={intl.formatMessage(messages.typeAgain)}
                type='password'
                id='re_new_password'
                autoComplete='current-password'
                onChange={(e) => onChange(e)}
                disabled={loading}
              />

              <Button
                type='submit'
                fullWidth
                variant='contained'
                color='primary'
                className={classes.submit}
                disabled={loading}
              >
                {intl.formatMessage(messages.confirm)}
              </Button>
            </form>
            <p></p>
          </div>
        </Container>
      </Grid>
    </Grid>
  );
}

export default injectIntl(ResetPasswordConfirm);
