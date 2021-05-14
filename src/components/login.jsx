import {
  Avatar,
  Button,
  TextField,
  Link as StyledLink,
  Grid,
  Typography,
  Container,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { login } from '@/store/actions/auth';

import { Link } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { useStyles } from '@/styles/form';
import { defineMessages, injectIntl } from 'react-intl';
import { useFormik } from 'formik';
import { loginSchema } from '@/utils/auth';

import { getPath } from '@/utils/routes';

const messages = defineMessages({
  forgotPassword: {
    id: 'home-page.forgot-password-question',
  },
  entrar: {
    id: 'home-page.login',
  },
  password: {
    id: 'home-page.password',
  },
  invalidCredentials: {
    id: 'home-page.login-credentials-error',
  },
});

function Login({ intl }) {
  const classes = useStyles();
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      dispatch(login(values.email, values.password));
    },
    enableReinitialize: true,
    validateOnBlur: false,
  });

  const getErrorMessage = (message) => {
    return intl.formatMessage({
      id: `home-page.error.${message}`,
    });
  };

  const error = useSelector((state) => state.auth.error?.login);
  return (
    <Container className={classes.app} maxWidth="xs">
      <div className={classes.paper}>
        {error ? (
          <Alert className={classes.alert} severity="error">
            {intl.formatMessage(messages.invalidCredentials)}
          </Alert>
        ) : null}
        <Avatar className={classes.avatar} />
        <Typography component="h1" variant="h5" className={classes.typography}>
          {intl.formatMessage(messages.entrar)}
        </Typography>
        <form className={classes.form}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            type="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && formik.errors.email ? true : false}
            helperText={
              formik.touched.email && formik.errors.email
                ? getErrorMessage(formik.errors.email)
                : null
            }
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label={intl.formatMessage(messages.password)}
            type="password"
            id="password"
            autoComplete="current-password"
            value={formik.values.password}
            error={
              formik.touched.password && formik.errors.password ? true : false
            }
            helperText={
              formik.touched.password && formik.errors.password
                ? getErrorMessage(formik.errors.password)
                : null
            }
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={formik.handleSubmit}
          >
            {intl.formatMessage(messages.entrar)}
          </Button>
          <Grid container>
            <Grid item xs>
              <StyledLink to={getPath('resetPassword')} variant="body2" component={Link}>
                {intl.formatMessage(messages.forgotPassword)}
              </StyledLink>
            </Grid>
          </Grid>
        </form>
        <p></p>
      </div>
    </Container>
  );
}

export default injectIntl(Login);
