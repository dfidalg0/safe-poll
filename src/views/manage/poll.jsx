import {
  Divider,
  CardActions,
  CardContent,
  Card,
  Button,
  Typography,
  CircularProgress,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Fab,
  Dialog,
  TextField,
  LinearProgress,
} from '@material-ui/core';

import { Fragment } from 'react';

// Ícones
import AddIcon from '@material-ui/icons/Add';
import EmailIcon from '@material-ui/icons/Email';
import CheckIcon from '@material-ui/icons/Check';
import { DeleteOutline as DeleteIcon } from '@material-ui/icons';

import { Link } from 'react-router-dom';
import { fetchUserGroups, deletePoll } from '@/store/actions/items';
import { notify } from '@/store/actions/ui';

import LoadingScreen from '@/components/loading-screen';

import axios from 'axios';

import { useRouteMatch, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useStyles } from '@/styles/poll-view';
import { useConfirm } from '@/utils/confirm-dialog';

import isEmail from 'validator/lib/isEmail';

import reduce from 'lodash.reduce';
import { defineMessages, injectIntl } from 'react-intl';

const messages = defineMessages({
  individualEmailSent: {
    id: 'manage.poll.individual-email-sent',
  },
  sendIndividualEmail: {
    id: 'manage.poll.send-invidual-email',
  },
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
  emailsAlreadyAdded: {
    id: 'manage.poll.group-emails-already-added',
  },
  addGroupSuccess: {
    id: 'manage.poll.added-group-success',
  },
  deletePoll: {
    id: 'manage.poll.delete-election',
  },
  everyoneHasVoted: {
    id: 'manage.poll.everyone-has-voted',
  },
  failEmails: {
    id: 'manage.poll.some-emails-couldnot-be-sent',
  },
  deadline: {
    id: 'manage.create-poll.deadline',
  },
  secretVote: {
    id: 'manage.create-poll.secretVote',
  },
  candidates: {
    id: 'manage.create-poll.candidates',
  },
  delete: {
    id: 'manage.delete',
  },
  back: {
    id: 'manage.back',
  },
  emailsSuccessfullySent: {
    id: 'manage.poll.emails-successfully-sent',
  },
  result: {
    id: 'manage.poll.result',
  },
  votes: {
    id: 'manage.poll.votes',
  },
  sendLinks: {
    id: 'manage.poll.send-links',
  },
  group: {
    id: 'manage.poll.group',
  },
  sendEmails: {
    id: 'manage.poll.send-emails',
  },
  yes: {
    id: 'manage.yes',
  },
  no: {
    id: 'manage.no',
  },
});

function Poll({ intl }) {
  function EmailItem({ email }) {
    const [loadingSend, setLoadingSend] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

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
          notify(intl.formatMessage(messages.individualEmailSent) + email)
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
                <Tooltip
                  title={intl.formatMessage(messages.sendIndividualEmail)}
                >
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

  function AddInvidualEmails() {
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
    }, [newEmail, addedEmails]);

    const token = useSelector((state) => state.auth.access);

    const dispatch = useDispatch();

    const submit = useCallback(async () => {
      const data = {
        email_list: addedEmails,
        poll_id: poll.id,
      };
      try {
        const res = await axios.post('/api/tokens/create', data, {
          headers: {
            Authorization: `JWT ${token}`,
          },
        });
        dispatch(
          notify(
            res.data.added_emails.length +
              intl.formatMessage(messages.addedEmailsSuccess),
            'success'
          )
        );
        setEmails(emails.concat(res.data.added_emails));
      } catch ({ response }) {
        dispatch(notify(response.data.message, 'error'));
      }
    }, [addedEmails, token, dispatch]);

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

  const [loading, setLoading] = useState(true);
  const [loadingSendEmails, setLoadingSendEmails] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [poll, setPoll] = useState(null);
  const [emails, setEmails] = useState(null);
  const [emailsAddOpen, setEmailsAddOpen] = useState(false);

  const dispatch = useDispatch();

  const router = useHistory();

  const { uid } = useRouteMatch().params;

  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.access);

  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: poll } = await axios.get(`/api/polls/get/${uid}/`);

        poll.deadline = new Date(Number(new Date(poll.deadline)) + 10800000);

        if (user.id !== poll.admin) router.replace('/manage');
        else {
          poll.deadline = new Date(poll.deadline);
          setPoll(poll);
        }

        if (poll.deadline > new Date()) {
          const { data } = await axios.get(`/api/polls/emails/${uid}`, {
            headers: {
              Authorization: `JWT ${token}`,
            },
          });
          setEmails(data.emails);
        } else {
          const { data: result } = await axios.get(
            `/api/polls/get/${uid}/result`,
            {
              headers: {
                Authorization: `JWT ${token}`,
              },
            }
          );
          result.total = reduce(
            result.counting_votes,
            (res, val) => res + val,
            0
          );
          setResult(result);
        }
      } catch ({ response: { data } }) {
        dispatch(notify(data.message, 'error'));
        router.replace('/manage');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uid, user, dispatch, router, token]);

  const [group, setGroup] = useState('');

  const classes = useStyles();

  const groups = useSelector((state) => state.items.groups);

  const submit = useCallback(async () => {
    setLoadingAdd(true);
    const group_id = groups[group - 1].id;

    const { data } = await axios.post(
      '/api/tokens/create-from-group',
      {
        poll_id: poll.id,
        group_id,
      },
      {
        headers: {
          Authorization: `JWT ${token}`,
        },
      }
    );

    var new_emails = data.added_emails.filter(
      (email) => !emails.includes(email) && !poll.emails_voted.includes(email)
    );

    if (new_emails.length === 0) {
      dispatch(
        notify(intl.formatMessage(messages.emailsAlreadyAdded), 'warning')
      );
    } else {
      setEmails(emails.concat(new_emails));
      dispatch(notify(intl.formatMessage(messages.addGroupSuccess), 'success'));
    }

    setLoadingAdd(false);
  }, [poll, groups, token, group, dispatch, emails, intl]);

  const confirm = useConfirm();

  const delete_poll = useCallback(async () => {
    const check = await confirm(intl.formatMessage(messages.deletePoll));

    if (!check) {
      return;
    }

    const res = await axios.delete(`/api/polls/delete/${poll.id}/`, {
      headers: {
        Authorization: `JWT ${token}`,
      },
    });
    dispatch(notify(res.data.message, 'success'));
    dispatch(deletePoll(poll.id));
    router.replace('/manage');
  }, [poll, token, dispatch, confirm, router, intl]);

  const send_email_to_everyone = useCallback(async () => {
    setLoadingSendEmails(true);
    try {
      const res = await axios.post(
        '/api/emails/send',
        {
          poll_id: poll.id,
        },
        {
          headers: {
            Authorization: `JWT ${token}`,
          },
        }
      );
      setLoadingSendEmails(false);
      if (res.status === 202 && res.data.faltam_votar === 0) {
        dispatch(notify(intl.formatMessage(messages.everyoneHasVoted)));
      } else if (
        res.status === 202 &&
        res.data.failed_emails.failed_to_send.length > 0
      ) {
        dispatch(notify(intl.formatMessage(messages.failEmails), 'warning'));
      } else {
        dispatch(
          notify(intl.formatMessage(messages.emailsSuccessfullySent), 'success')
        );
      }
    } catch ({ response: { data } }) {
      setLoadingSendEmails(false);
      dispatch(notify(data.message, 'warning'));
    }
  }, [poll, setLoadingSendEmails, dispatch, token, intl]);

  useEffect(() => {
    if (!groups) {
      dispatch(fetchUserGroups());
    }
  }, [groups, dispatch]);

  if (loading) return <LoadingScreen />;

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography noWrap variant='h5' component='h2'>
          {poll.title}
        </Typography>
        <Typography noWrap className={classes.pos} color='textSecondary'>
          {poll.description}
        </Typography>
        <Divider style={{ marginBottom: 10, marginTop: 10 }} />
        <Typography variant='overline' display='block' gutterBottom>
          {intl.formatMessage(messages.deadline)} <br />{' '}
          {poll.deadline.toLocaleDateString()}
        </Typography>
        <Typography variant='overline' display='block' gutterBottom>
          {intl.formatMessage(messages.secretVote)}
          {': '}
          {poll.secret_vote
            ? intl.formatMessage(messages.yes)
            : intl.formatMessage(messages.no)}
        </Typography>
        <Typography variant='overline' display='block' gutterBottom>
          {intl.formatMessage(messages.candidates)}
        </Typography>

        {poll.options.map((option, index) => (
          <Typography
            variant='overline'
            display='block'
            gutterBottom
            key={index}
          >
            {option.name}
          </Typography>
        ))}

        <Divider style={{ marginBottom: 10, marginTop: 10 }} />

        {poll.deadline > new Date() ? (
          <>
            <Grid item xs={12}>
              <InputLabel htmlFor='type' style={{ padding: 10 }}>
                {intl.formatMessage(messages.group)}
              </InputLabel>
            </Grid>
            <Grid item xs={12}>
              <Select
                id='type'
                className={classes.field}
                required
                value={group}
                variant='outlined'
                onChange={(e) => setGroup(e.target.value)}
              >
                {!groups
                  ? null
                  : groups.map((group, index) => (
                      <MenuItem value={index + 1} key={index}>
                        {group.name}
                      </MenuItem>
                    ))}
              </Select>
            </Grid>
            <Grid item style={{ marginTop: 20 }}>
              <Button
                variant='contained'
                className={classes.button}
                onClick={submit}
                disabled={group === ''}
                size='large'
              >
                {' '}
                {loadingAdd ? (
                  <CircularProgress size={22} />
                ) : (
                  intl.formatMessage(messages.add)
                )}
              </Button>
            </Grid>
            <Divider style={{ marginBottom: 20, marginTop: 20 }} />
            <Grid item style={{ marginTop: 20, marginBottom: 20 }}>
              {loadingSendEmails ? (
                <CircularProgress size={22} />
              ) : (
                <Tooltip title={intl.formatMessage(messages.sendLinks)}>
                  <Button
                    variant='contained'
                    className={classes.button}
                    onClick={send_email_to_everyone}
                    endIcon={<EmailIcon />}
                    disabled={emails.length === 0}
                    size='large'
                    style={{ width: '50%' }}
                  >
                    {intl.formatMessage(messages.sendEmails)}
                  </Button>
                </Tooltip>
              )}

              <Tooltip
                title={intl.formatMessage(messages.addEmails)}
                aria-label='add'
              >
                <Fab
                  color='primary'
                  size='small'
                  style={{ marginLeft: 20 }}
                  onClick={() => setEmailsAddOpen(true)}
                >
                  <AddIcon style={{ fontSize: 18 }} />
                </Fab>
              </Tooltip>

              <Dialog
                onClose={() => setEmailsAddOpen(false)}
                aria-labelledby='simple-dialog-title'
                open={emailsAddOpen}
              >
                <AddInvidualEmails />
              </Dialog>
            </Grid>

            {emails.map((email, index) => (
              <EmailItem email={email} key={index} />
            ))}
          </>
        ) : (
          <Grid container alignItems='center' alignContent='center'>
            <Grid item xs={12}>
              <Typography variant='h6'>
                {intl.formatMessage(messages.result)}
              </Typography>
            </Grid>
            {poll.options.map((o, i) => (
              <Fragment key={i}>
                <Grid item xs={3}>
                  {result.winners.includes(o.id) ? (
                    <strong>{o.name}</strong>
                  ) : (
                    o.name
                  )}
                </Grid>
                <Grid item xs={6}>
                  <LinearProgress
                    variant='determinate'
                    value={
                      (100 * (result.counting_votes[o.id] || 0)) /
                      (result.total || 1)
                    }
                  />
                </Grid>
                <Grid item xs={3}>
                  <Typography variant='caption'>
                    {result.counting_votes[o.id] || 0}{' '}
                    {intl.formatMessage(messages.votes)} (
                    {(100 * (result.counting_votes[o.id] || 0)) /
                      (result.total || 1)}
                    %)
                  </Typography>
                </Grid>
              </Fragment>
            ))}
          </Grid>
        )}
      </CardContent>
      <CardActions>
        <Button size='small'>
          <Link to='/manage' className={classes.link}>
            {intl.formatMessage(messages.back)}
          </Link>
        </Button>
        <Grid container justify='flex-end'>
          <Button
            className={classes.button}
            onClick={delete_poll}
            endIcon={<DeleteIcon className={classes.deleteIcon} />}
          >
            {intl.formatMessage(messages.delete)}
          </Button>
        </Grid>
      </CardActions>
    </Card>
  );
}

export default injectIntl(Poll);
