import {
  Divider,
  CardActions,
  CardContent,
  Card,
  Button,
  Typography,
  TextField,
  CircularProgress,
} from '@material-ui/core';

// Ícones
import { notify } from '@/store/actions/ui';

import axios from 'axios';

import { useSelector, useDispatch } from 'react-redux';
import { useState, useCallback } from 'react';
import { useStyles } from '@/styles/poll-view';

import { defineMessages, injectIntl } from 'react-intl';

const messages = defineMessages({
  genericError: {
    id: 'error.generic',
  },
  invalidFormError: {
    id: 'error.invalid-form',
  },
  internalServerError: {
    id: 'error.internal-server',
  },
  personalize: {
    id: 'manage.poll.email.info.personalize',
  },
  placeholder: {
    id: 'manage.poll.email.info.placeholder',
  },
  update: {
    id: 'manage.poll.email.info.update',
  },
  updateSuccess: {
    id: 'manage.poll.email.info.update-success',
  },
});

function PollEmailInfo({ intl, poll, setPoll, setOpened }) {
  const classes = useStyles();

  const dispatch = useDispatch();

  const token = useSelector((state) => state.auth.access);
  const [emailInfo, setEmailInfo] = useState(poll?.email_info ?? '');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setEmailInfo(event.target.value);
  };

  const updatePollEmailInfo = useCallback(async () => {
    if (emailInfo !== poll.email_info) {
      setLoading(true);
      try {
        await axios.put(
          `/api/polls/update/email/${poll.id}`,
          {
            email_info: emailInfo,
          },
          {
            headers: {
              Authorization: `JWT ${token}`,
            },
          }
        );

        const newPoll = poll;
        newPoll.email_info = emailInfo;
        setPoll({ ...newPoll });
        dispatch(notify(intl.formatMessage(messages.updateSuccess), 'success'));
      } catch ({ response: { status } }) {
        let info;
        if (status === 422) info = messages.invalidFormError;
        else if (status === 500) info = messages.internalServerError;
        else info = messages.genericError;
        notify(intl.formatMessage(info), 'error');
      }
    } else {
      dispatch(notify(intl.formatMessage(messages.updateSuccess), 'success'));
    }
    setLoading(false);
    setOpened(false);
  }, [poll, token, intl, emailInfo, setPoll, setOpened, dispatch]);

  return (
    <div align="center">
      <Card className={classes.root}>
        <CardContent>
          <Typography variant="button" display="block" gutterBottom>
            {intl.formatMessage(messages.personalize)}
          </Typography>

          <Divider style={{ marginBottom: 20, marginTop: 20 }} />

          <TextField
            autoComplete="off"
            multiline
            rows={4}
            value={emailInfo ?? ''}
            onChange={handleChange}
            variant="outlined"
            style={{ width: '100%' }}
            placeholder={intl.formatMessage(messages.placeholder)}
          />
        </CardContent>
        <CardActions style={{ marginTop: 10 }}>
          <Button
            variant="contained"
            className={classes.button}
            onClick={updatePollEmailInfo}
            style={{ width: '50%' }}
          >
            {loading ? (
              <CircularProgress size={22} />
            ) : (
              intl.formatMessage(messages.update)
            )}
          </Button>
        </CardActions>
      </Card>
    </div>
  );
}

export default injectIntl(PollEmailInfo);
