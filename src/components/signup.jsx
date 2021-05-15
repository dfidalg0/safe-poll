import {
  Avatar,
  Button,
  TextField,
  Grid,
  Typography,
  Container,
  CircularProgress,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { signup } from '@/store/actions/auth';

import { useDispatch, useSelector } from 'react-redux';

import { useStyles } from '@/styles/form';
import { defineMessages, injectIntl } from 'react-intl';
import { useFormik } from 'formik';
import { signUpSchema } from '@/utils/auth';
import { useState } from 'react';

const messages = defineMessages({
  name: {
    id: 'common-messages.name',
  },
  signup: {
    id: 'home-page.signup-act',
  },
  password: {
    id: 'home-page.password',
  },
  passwordAgain: {
    id: 'home-page.password-again',
  },
  passwordsDoNotMatch: {
    id: 'home-page.passwords-do-not-match',
  },
  emailAlreadyInUse: {
    id: 'home-page.error.email-already-in-use',
  },
});

function SignUp({ intl }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      re_password: '',
    },
    validationSchema: signUpSchema,
    onSubmit: async (values) => {
      if (values.password !== values.re_password) setRePasswordError(true);
      else {
        setRePasswordError(false);
        setLoading(true);
        await dispatch(
          signup(values.name, values.email, values.password, values.re_password)
        );
        setLoading(false);
      }
    },
    enableReinitialize: true,
  });

  const getErrorMessage = (message) => {
    let split = message.split('.');
    if (split.length === 1) {
      return intl.formatMessage({
        id: `home-page.error.${message}`,
      });
    }
    return intl.formatMessage(
      {
        id: `home-page.error.${split[0]}`,
      },
      {
        count: split[1],
      }
    );
  };

  const [rePasswordError, setRePasswordError] = useState(false);
  const error = useSelector((state) => state.auth.error?.signUp);

  return (
    <Container component='main' maxWidth='xs'>
      <div className={classes.paper}>
        {rePasswordError ? (
          <Alert className={classes.alert} severity='error'>
            {intl.formatMessage(messages.passwordsDoNotMatch)}
          </Alert>
        ) : null}
        {error?.email ? (
          <Alert className={classes.alert} severity='error'>
            {intl.formatMessage(messages.emailAlreadyInUse)}
          </Alert>
        ) : null}
        <Avatar className={classes.avatar}></Avatar>
        <Typography component='h1' variant='h5'>
          {intl.formatMessage(messages.signup)}
        </Typography>
        <form className={classes.form} onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoComplete='fname'
                name='name'
                variant='outlined'
                required
                fullWidth
                id='name'
                label={intl.formatMessage(messages.name)}
                autoFocus
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && formik.errors.name ? true : false}
                helperText={
                  formik.touched.name && formik.errors.name
                    ? getErrorMessage(formik.errors.name)
                    : null
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                variant='outlined'
                required
                fullWidth
                id='email'
                label='Email'
                name='email'
                autoComplete='email'
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.email && formik.errors.email ? true : false
                }
                helperText={
                  formik.touched.email && formik.errors.email
                    ? getErrorMessage(formik.errors.email)
                    : null
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant='outlined'
                required
                fullWidth
                name='password'
                label={intl.formatMessage(messages.password)}
                type='password'
                id='password'
                autoComplete='current-password'
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.password && formik.errors.password
                    ? true
                    : false
                }
                helperText={
                  formik.touched.password && formik.errors.password
                    ? getErrorMessage(formik.errors.password)
                    : null
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant='outlined'
                required
                fullWidth
                name='re_password'
                label={intl.formatMessage(messages.passwordAgain)}
                type='password'
                id='re_password'
                autoComplete='current-password'
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.re_password && formik.errors.re_password
                    ? true
                    : false
                }
                helperText={
                  formik.touched.re_password && formik.errors.re_password
                    ? getErrorMessage(formik.errors.re_password)
                    : null
                }
              />
            </Grid>
          </Grid>
          {loading ? (
            <Button
              style={{ display: 'flex', justifyContent: 'center' }}
              disabled={true}
            >
              <CircularProgress size={20} />
            </Button>
          ) : (
            <Button
              type='submit'
              fullWidth
              variant='contained'
              color='primary'
              className={classes.submit}
            >
              {intl.formatMessage(messages.signup)}
            </Button>
          )}
        </form>
      </div>
    </Container>
  );
}

export default injectIntl(SignUp);
