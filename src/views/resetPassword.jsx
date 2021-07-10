import {
  Breadcrumbs,
  Button,
  CssBaseline,
  TextField,
  Link as StyledLink,
  Typography,
  Container,
  Grid,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';

import { Link } from 'react-router-dom';

import { reset_password } from '@/store/actions/auth';

import { useDispatch } from 'react-redux';
import { useState, useCallback, useContext } from 'react';
import { useStyles } from '@/styles/form';
import { defineMessages, injectIntl } from 'react-intl';
import {
  LocaleSelector,
  LocaleContext,
} from './../components/language-wrapper';

import { getPath } from '@/utils/routes';

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
  const languageContext = useContext(LocaleContext);

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      dispatch(reset_password(email, languageContext.locale));
      setSent(true);
    },
    [dispatch, email, languageContext.locale]
  );

  const displayMessage = useCallback(() => {
    if (sent) {
      return (
        <Alert
          style={{ marginBottom: '20px', marginTop: '20px' }}
          severity='info'
        >
          {intl.formatMessage(messages.resetPasswordConfirm)}
        </Alert>
      );
    } else {
      return null;
    }
  }, [sent, intl]);

  return (
    <Grid container direction='column'>
      <Grid item>
        <LocaleSelector />
      </Grid>
      <Grid item>
        <Container className={classes.app} maxWidth='xs'>
          <Breadcrumbs className={classes.breadcrumb}>
            <StyledLink color='inherit' to={getPath('login')} component={Link}>
              {intl.formatMessage(messages.homepage)}
            </StyledLink>
            <Typography color='textPrimary'>
              {intl.formatMessage(messages.resetPassword)}
            </Typography>
          </Breadcrumbs>
          <CssBaseline />

          {displayMessage()}
          <div className={classes.paper}>
            <Typography
              component='h1'
              variant='h5'
              className={classes.typography}
            >
              {intl.formatMessage(messages.resetPassword)}
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
      </Grid>
    </Grid>
  );
}

export default injectIntl(ResetPassword);
