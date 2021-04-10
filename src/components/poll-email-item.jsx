import {
  Typography,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Tooltip,
} from '@material-ui/core';

// Ícones
import EmailIcon from '@material-ui/icons/Email';
import CheckIcon from '@material-ui/icons/Check';
import { DeleteOutline as DeleteIcon } from '@material-ui/icons';
import { useStyles } from '@/styles/poll-view';

import { notify } from '@/store/actions/ui';

import axios from 'axios';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { defineMessages, injectIntl } from 'react-intl';

const messages = defineMessages({
  individualEmailSent: {
    id: 'manage.poll.individual-email-sent',
  },
  sendIndividualEmail: {
    id: 'manage.poll.send-invidual-email',
  },
});

function EmailItem({ email, token, emails, poll, intl, setEmails }) {
  const classes = useStyles();
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const dispatch = useDispatch();

  const delete_email = async (email) => {
    setLoadingDelete(true);
    try {
      const res = await axios.post(
        '/api/polls/emails/delete',
        {
          email: email,
          poll_id: poll.id,
        },
        {
          headers: {
            Authorization: `JWT ${token}`,
          },
        }
      );
      setLoadingDelete(false);
      const new_emails = emails.filter((e) => e !== email);
      setEmails(new_emails);
      dispatch(notify(res.data.message, 'success'));
    } catch ({ response: { data } }) {
      setLoadingDelete(false);
      dispatch(notify(data.message, 'warning'));
    }
  };

  const send_email = async (email) => {
    setLoadingSend(true);
    try {
      await axios.post(
        '/api/emails/send-list',
        {
          poll_id: poll.id,
          users_emails_list: [email],
        },
        {
          headers: {
            Authorization: `JWT ${token}`,
          },
        }
      );
      setLoadingSend(false);
      dispatch(
        notify(intl.formatMessage(messages.individualEmailSent, { email }))
      );
    } catch ({ response: { data } }) {
      setLoadingSend(false);
      dispatch(notify(data.message, 'warning'));
    }
  };

  return (
    <Grid container style={{ justifyContent: 'center', marginBottom: 10 }}>
      <Grid item xs={10}>
        <Paper className={classes.paper}>
          <Typography noWrap className={classes.paper}>
            {email}
          </Typography>
        </Paper>
      </Grid>
      {poll.emails_voted.indexOf(email) > -1 ? (
        <Grid item xs={2}>
          <IconButton>
            <CheckIcon className={classes.checkIcon} />
          </IconButton>
        </Grid>
      ) : (
        <>
          <Grid item xs={1}>
            {loadingDelete ? (
              <IconButton>
                <CircularProgress size={18} />
              </IconButton>
            ) : (
              <IconButton onClick={() => delete_email(email)}>
                <DeleteIcon className={classes.deleteIcon} />
              </IconButton>
            )}
          </Grid>
          <Grid item xs={1}>
            {loadingSend ? (
              <IconButton>
                <CircularProgress size={18} />
              </IconButton>
            ) : (
              <Tooltip title={intl.formatMessage(messages.sendIndividualEmail)}>
                <IconButton onClick={() => send_email(email)}>
                  <EmailIcon className={classes.emailIcon} />
                </IconButton>
              </Tooltip>
            )}
          </Grid>
        </>
      )}
    </Grid>
  );
}

export default injectIntl(EmailItem);
