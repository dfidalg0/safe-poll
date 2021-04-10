import {
  Divider,
  CardActions,
  CardContent,
  Card,
  Button,
  Typography,
  Grid,
  IconButton,
  Paper,
  TextField,
} from '@material-ui/core';

// Ícones
import AddIcon from '@material-ui/icons/Add';
import { DeleteOutline as DeleteIcon } from '@material-ui/icons';
import { notify } from '@/store/actions/ui';

import LoadingScreen from '@/components/loading-screen';

import axios from 'axios';

import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useStyles } from '@/styles/poll-view';

import isEmail from 'validator/lib/isEmail';
import { defineMessages, injectIntl } from 'react-intl';

const messages = defineMessages({
  addedEmailsSuccess: {
    id: 'manage.poll.added-emails-success',
  },
  addEmails: {
    id: 'manage.poll.add-emails',
  },
  emailAlreadyExists: {
    id: 'manage.poll.email-already-exists',
  },
  add: {
    id: 'manage.add',
  },
  electionNotFoundError: {
    id: 'error.election-not-found',
  },
  genericError: {
    id: 'error.generic',
  },
  invalidFormError: {
    id: 'error.invalid-form',
  },
});

function AddInvidualEmails({
  intl,
  groups,
  emails,
  setEmails,
  pollId,
  setOpened,
}) {
  const classes = useStyles();
  const [addedEmails, setAddedEmails] = useState([]);

  // novo email a ser adicionado
  const [newEmail, setNewEmail] = useState('');

  // Estado de erros de validação dos emails
  const [newEmailError, setNewEmailError] = useState(false);

  // Ref para a caixa de texto de novo email (usada para autofocus)
  const newEmailRef = useRef();

  const createEmail = useCallback(() => {
    if (newEmail && !newEmailError) {
      setAddedEmails((addedEmails) => [...addedEmails, newEmail]);
      setNewEmail('');
    }
  }, [newEmailError, newEmail]);

  const deleteEmail = useCallback(
    (index) => {
      const newEmails = [...addedEmails];
      newEmails.splice(index, 1);
      setAddedEmails(newEmails);
    },
    [addedEmails]
  );

  useEffect(() => {
    if (
      emails.includes(newEmail) ||
      addedEmails.includes(newEmail) ||
      !isEmail(newEmail)
    ) {
      setNewEmailError(true);
    } else {
      setNewEmailError(false);
    }
  }, [newEmail, addedEmails, emails]);

  const token = useSelector((state) => state.auth.access);

  const dispatch = useDispatch();

  const submit = useCallback(async () => {
    const data = {
      email_list: addedEmails,
      poll_id: pollId,
    };
    try {
      const res = await axios.post('/api/tokens/create', data, {
        headers: {
          Authorization: `JWT ${token}`,
        },
      });
      dispatch(
        notify(
          intl.formatMessage(messages.addedEmailsSuccess, {
            count: res.data.added_emails.length,
          }),
          'success'
        )
      );
      setEmails(emails.concat(res.data.added_emails));
      setOpened(false);
    } catch ({ response: { status } }) {
      let info;
      if (status === 404) {
        info = messages.electionNotFoundError;
      } else if (status === 422) {
        info = messages.invalidFormError;
      } else {
        info = messages.genericError;
      }
      dispatch(notify(intl.formatMessage(info), 'error'));
    }
  }, [
    addedEmails,
    token,
    dispatch,
    emails,
    intl,
    setEmails,
    pollId,
    setOpened,
  ]);

  return !groups ? (
    <LoadingScreen />
  ) : (
    <div align='center'>
      <Card className={classes.root}>
        <CardContent>
          <Typography variant='button' display='block' gutterBottom>
            {intl.formatMessage(messages.addEmails)}
          </Typography>

          <Divider style={{ marginBottom: 20, marginTop: 20 }} />
          {addedEmails.map((email, index) => (
            <Grid
              container
              key={index}
              style={{ justifyContent: 'center', marginBottom: 10 }}
            >
              <Grid item xs={10}>
                <Paper className={classes.paper}>
                  <Typography noWrap className={classes.paper}>
                    {email}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={2}>
                <IconButton onClick={() => deleteEmail(index)}>
                  <DeleteIcon className={classes.deleteIcon} />
                </IconButton>
              </Grid>
            </Grid>
          ))}

          <Grid container style={{ justifyContent: 'center' }}>
            <Grid item xs={10}>
              <TextField
                autoComplete='off'
                inputRef={newEmailRef}
                className={classes.option}
                variant='outlined'
                value={newEmail}
                error={newEmail === '' ? false : newEmailError}
                helperText={
                  isEmail(newEmail) && newEmailError
                    ? intl.formatMessage(messages.emailAlreadyExists)
                    : null
                }
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') createEmail();
                }}
                InputProps={{
                  className: classes.input,
                }}
                style={{ width: '100%', textAlign: 'center' }}
              />
            </Grid>
            <Grid item xs={2}>
              <IconButton onClick={createEmail}>
                <AddIcon />
              </IconButton>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions style={{ marginTop: 10 }}>
          <Grid
            container
            direction='row'
            justify='flex-end'
            alignItems='center'
          >
            <Grid item>
              <Button
                variant='contained'
                className={classes.button}
                onClick={submit}
                disabled={addedEmails.length === 0}
              >
                {intl.formatMessage(messages.add)}
              </Button>
            </Grid>
          </Grid>
        </CardActions>
      </Card>
    </div>
  );
}

export default injectIntl(AddInvidualEmails);
