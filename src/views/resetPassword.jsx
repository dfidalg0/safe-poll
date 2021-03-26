import {
  Breadcrumbs,
  Button,
  CssBaseline,
  TextField,
  Link as StyledLink,
  Typography,
  Container,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';

import { Link } from 'react-router-dom';

import { reset_password } from '@/store/actions/auth';

import { useDispatch } from 'react-redux';
import { useState, useCallback } from 'react';
import { useStyles } from '@/styles/form';
import { defineMessages, injectIntl } from 'react-intl';

const messages = defineMessages({
  homepage: {
    id: 'reset-page.homepage',
  },
  resetPassword: {
    id: 'reset-page.reset-password',
  },
  recoverPassword: {
    id: 'reset-page.recover-password',
  },
  resetPasswordConfirm: {
    id: 'reset-password-confirm',
  },
});

function ResetPassword({ intl }) {
  const classes = useStyles();
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');

  const onChange = (e) => setEmail(e.target.value);

  const dispatch = useDispatch();

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      dispatch(reset_password(email));
      setSent(true);
    },
    [dispatch, email]
  );

  const displayMessage = useCallback(() => {
    if (sent) {
      return (
        <Alert className={classes.alert} severity='info'>
          {intl.formatMessage(messages.resetPasswordConfirm)}
        </Alert>
      );
    } else {
      return null;
    }
  }, [sent, classes, intl]);

  return (
    <Container className={classes.app} maxWidth='xs'>
      <Breadcrumbs className={classes.breadcrumb}>
        <StyledLink color='inherit' to='/' component={Link}>
          {intl.formatMessage(messages.homepage)}
        </StyledLink>
        <Typography color='textPrimary'>
          {intl.formatMessage(messages.resetPassword)}
        </Typography>
      </Breadcrumbs>
      <CssBaseline />

      {displayMessage()}
      <div className={classes.paper}>
        <Typography component='h1' variant='h5' className={classes.typography}>
          {intl.formatMessage(messages.resetPassword)}
        </Typography>
        <form className={classes.form} noValidate onSubmit={(e) => onSubmit(e)}>
          <TextField
            variant='outlined'
            margin='normal'
            required
            fullWidth
            id='email'
            type='email'
            label='Email'
            name='email'
            autoComplete='email'
            autoFocus
            onChange={(e) => onChange(e)}
            InputProps={{ readOnly: sent }}
          />

          <Button
            type='submit'
            fullWidth
            variant='contained'
            color='primary'
            className={classes.submit}
            disabled={sent}
          >
            {intl.formatMessage(messages.recoverPassword)}
          </Button>
        </form>
        <p></p>
      </div>
    </Container>
  );
}

export default injectIntl(ResetPassword);
