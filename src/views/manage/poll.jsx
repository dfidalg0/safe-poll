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
  Tooltip,
  Fab,
  Dialog,
  LinearProgress,
  TextField,
  InputAdornment
} from '@material-ui/core';

import { Fragment } from 'react';

// Ícones
import AddIcon from '@material-ui/icons/Add';
import EmailIcon from '@material-ui/icons/Email';
import { DeleteOutline as DeleteIcon, FileCopyOutlined as CopyIcon } from '@material-ui/icons';

import { Link } from 'react-router-dom';
import { fetchUserGroups, deletePoll } from '@/store/actions/items';
import { notify } from '@/store/actions/ui';

import LoadingScreen from '@/components/loading-screen';
import VotesTable from '@/components/votes-table';

import axios from 'axios';

import { useRouteMatch, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState, useCallback, useContext } from 'react';
import { useStyles } from '@/styles/poll-view';
import { useConfirm } from '@/utils/confirm-dialog';

import reduce from 'lodash.reduce';
import { format } from 'date-fns';
import { defineMessages, injectIntl } from 'react-intl';
import EmailItem from './../../components/poll-email-item';
import AddInvidualEmails from './../../components/poll-add-invidual-email';
import { LocaleContext } from './../../components/language-wrapper';

import copy from 'copy-to-clipboard';

const messages = defineMessages({
  finish: {
    id: 'manage.poll.finish',
  },
  addEmails: {
    id: 'manage.poll.add-emails',
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
  electionNotFinishedError: {
    id: 'error.election-not-finished',
  },
  internalServerError: {
    id: 'error.internal-server',
  },
  genericError: {
    id: 'error.generic',
  },
  invalidFormError: {
    id: 'error.invalid-form',
  },
  successDeletePoll: {
    id: 'success-message.delete-election',
  },
});

function Poll({ intl }) {
  const [loading, setLoading] = useState(true);
  const [loadingSendEmails, setLoadingSendEmails] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [poll, setPoll] = useState(null);
  const [emails, setEmails] = useState(null);
  const [emailsAddOpen, setEmailsAddOpen] = useState(false);

  const dispatch = useDispatch();

  const router = useHistory();
  const languageContext = useContext(LocaleContext);

  const { uid } = useRouteMatch().params;

  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.access);

  const [result, setResult] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const { data: poll } = await axios.get(`/api/polls/get/${uid}/`, {
        headers: {
          Authorization: `JWT ${token}`
        }
      });

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
    } catch ({ response: { status } }) {
      let info;
      if (status === 404) info = messages.electionNotFinishedError;
      else if (status === 500) info = messages.internalServerError;
      else info = messages.genericError;
      dispatch(notify(intl.formatMessage(info), 'error'));
      router.replace('/manage');
    } finally {
      setLoading(false);
    }
  }, [uid, user, dispatch, router, token, intl]);

  const finishPoll = useCallback(async () => {
    try {
      await axios.put(
        `/api/polls/update/${poll.id}`,
        {
          deadline: new Date().toJSON().slice(0, 10),
        },
        {
          headers: {
            Authorization: `JWT ${token}`,
          },
        }
      );

      window.location.reload();
    } catch ({ response: { status } }) {
      let info;
      if (status === 422) info = messages.invalidFormError;
      else if (status === 500) info = messages.internalServerError;
      else info = messages.genericError;
      notify(intl.formatMessage(info), 'error');
    }
  }, [poll, token, intl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [group, setGroup] = useState('');

  const classes = useStyles();

  const groups = useSelector((state) => state.items.groups);

  const submit = useCallback(async () => {
    setLoadingAdd(true);
    const group_id = groups[group - 1].id;

    try {
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
        dispatch(
          notify(intl.formatMessage(messages.addGroupSuccess), 'success')
        );
      }

      setLoadingAdd(false);
    } catch {
      dispatch(notify(intl.formatMessage(messages.genericError), 'error'));
    }
  }, [poll, groups, token, group, dispatch, emails, intl]);

  const confirm = useConfirm();

  const delete_poll = useCallback(async () => {
    const check = await confirm(intl.formatMessage(messages.deletePoll));

    if (!check) {
      return;
    }

    try {
      await axios.delete(`/api/polls/delete/${poll.id}/`, {
        headers: {
          Authorization: `JWT ${token}`,
        },
      });
      dispatch(
        notify(intl.formatMessage(messages.successDeletePoll), 'success')
      );
      dispatch(deletePoll(poll.id));
      router.replace('/manage');
    } catch {
      dispatch(notify(intl.formatMessage(messages.genericError), 'error'));
    }
  }, [poll, token, dispatch, confirm, router, intl]);

  const send_email_to_everyone = useCallback(async () => {
    setLoadingSendEmails(true);
    try {
      const res = await axios.post(
        '/api/emails/send',
        {
          poll_id: poll.id,
          language: languageContext.locale,
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
    } catch ({ response: { status } }) {
      setLoadingSendEmails(false);
      let info;
      if (status === 404) info = messages.pollNotFoundError;
      else if (status === 422) info = messages.invalidFormError;
      else if (status === 400) info = messages.pollDeadlineError;
      else info = messages.errorGeneric;
      dispatch(notify(intl.formatMessage(info), 'warning'));
    }
  }, [
    poll,
    setLoadingSendEmails,
    dispatch,
    token,
    intl,
    languageContext.locale,
  ]);

  useEffect(() => {
    if (!groups) {
      dispatch(fetchUserGroups());
    }
  }, [groups, dispatch]);

  if (loading) return <LoadingScreen />;

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography noWrap variant="h5" component="h2">
          {poll.title}
        </Typography>
        <Typography noWrap className={classes.pos} color="textSecondary">
          {poll.description}
        </Typography>
        <Divider style={{ marginBottom: 10, marginTop: 10 }} />
        <Typography variant="overline" display="block" gutterBottom>
          {intl.formatMessage(messages.deadline)} <br />{' '}
          {format(
            poll.deadline,
            languageContext.locale === 'pt-BR' ||
              languageContext.locale === 'es-ES'
              ? 'dd/MM/yyyy'
              : 'MM/dd/yyyy'
          )}
        </Typography>

        {poll.deadline > new Date() ? (
          <>
            <Button onClick={finishPoll}>
              {intl.formatMessage(messages.finish)}
            </Button>
          </>
        ) : null}

        <Typography variant="overline" display="block" gutterBottom>
          {intl.formatMessage(messages.secretVote)}
          {': '}
          {poll.secret_vote
            ? intl.formatMessage(messages.yes)
            : intl.formatMessage(messages.no)}
        </Typography>
        <Typography variant="overline" display="block" gutterBottom>
          {intl.formatMessage(messages.candidates)}
        </Typography>

        {poll.options.map((option, index) => (
          <Typography
            variant="overline"
            display="block"
            gutterBottom
            key={index}
          >
            {option.name}
          </Typography>
        ))}

        <Divider style={{ marginBottom: 10, marginTop: 10 }} />

        {poll.deadline > new Date() ? (
          poll.permanent_token? <>
            <Grid item xs={12} style={{ marginBottom: '10px' }}>
              Convide pessoas para votar através do link
            </Grid>
            <Grid item xs={12}>
              <TextField
                InputProps={{
                  readOnly: true,
                  endAdornment: <InputAdornment position="end" >
                    <CopyIcon
                      onClick={() => copy(`https://safe-poll.herokuapp.com/polls/${poll.id}/vote?token=${poll.permanent_token}&perm=true`)}
                      style={{ cursor: 'pointer' }}
                    />
                  </InputAdornment>
                }}
                defaultValue={`https://safe-poll.herokuapp.com/polls/${poll.id}/vote?token=${poll.permanent_token}&perm=true`}
              />
            </Grid>
            <Grid item xs={12} style={{ marginBottom: '10px' }}>
              <Button onClick={async () => {
                try {
                  await axios.delete(`/api/polls/${poll.id}/permanent-token/delete`, {
                    headers: {
                      Authorization: `JWT ${token}`
                    }
                  });

                  setPoll({
                    ...poll,
                    permanent_token: null
                  });
                }
                catch (err) {
                  dispatch(notify(err.response.data.message, 'error'));
                }
              }}>
                Destruir link
              </Button>
            </Grid>
          </> :
          <>
            {poll.secret_vote ? <Grid item xs={12}>
              <Button onClick={async () => {
                try {
                  const { data } = await axios.put(`/api/polls/${poll.id}/permanent-token/set`, null, {
                    headers: {
                      Authorization: `JWT ${token}`
                    }
                  });

                  setPoll({
                    ...poll,
                    permanent_token: data.token
                  });
                }
                catch (err) {
                  console.log(err.response);
                  dispatch(notify(err.response.data.message, 'error'));
                }
              }}>
                Mudar para link de acesso
              </Button>
            </Grid> : null}
            <Grid item xs={12}>
              <InputLabel htmlFor="type" style={{ padding: 10 }}>
                {intl.formatMessage(messages.group)}
              </InputLabel>
            </Grid>
            <Grid item xs={12}>
              <Select
                id="type"
                className={classes.field}
                required
                value={group}
                variant="outlined"
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
                variant="contained"
                className={classes.button}
                onClick={submit}
                disabled={group === ''}
                size="large"
              >
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
                    variant="contained"
                    className={classes.button}
                    onClick={send_email_to_everyone}
                    endIcon={<EmailIcon />}
                    disabled={emails.length === 0}
                    size="large"
                    style={{ width: '50%' }}
                  >
                    {intl.formatMessage(messages.sendEmails)}
                  </Button>
                </Tooltip>
              )}

              <Tooltip
                title={intl.formatMessage(messages.addEmails)}
                aria-label="add"
              >
                <Fab
                  color="primary"
                  size="small"
                  style={{ marginLeft: 20 }}
                  onClick={() => setEmailsAddOpen(true)}
                >
                  <AddIcon style={{ fontSize: 18 }} />
                </Fab>
              </Tooltip>

              <Dialog
                onClose={() => setEmailsAddOpen(false)}
                aria-labelledby="simple-dialog-title"
                open={emailsAddOpen}
              >
                <AddInvidualEmails
                  groups={groups}
                  emails={emails}
                  setEmails={setEmails}
                  pollId={poll.id}
                  setOpened={setEmailsAddOpen}
                />
              </Dialog>
            </Grid>

            {emails.map((email, index) => (
              <EmailItem
                email={email}
                token={token}
                emails={emails}
                poll={poll}
                setEmails={setEmails}
                key={index}
              />
            ))}
          </>
        ) : (
          <>
            <Grid container alignItems="center" alignContent="center">
              <Grid item xs={12}>
                <Typography variant="h6">
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
                      variant="determinate"
                      value={
                        (100 * (result.counting_votes[o.id] || 0)) /
                        (result.total || 1)
                      }
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="caption">
                      {result.counting_votes[o.id] || 0}{' '}
                      {intl.formatMessage(messages.votes)} (
                      {(
                        (100 * (result.counting_votes[o.id] || 0)) /
                        (result.total || 1)
                      ).toFixed(2)}
                      %)
                    </Typography>
                  </Grid>
                </Fragment>
              ))}
            </Grid>
            {!poll.secret_vote && (
              <>
                <div style={{ marginTop: '20px' }}>
                  <VotesTable poll={poll} />
                </div>
                <Divider style={{ marginTop: '43px' }} />
              </>
            )}
          </>
        )}
      </CardContent>
      <CardActions style={{ marginTop: '-17px' }}>
        <Button size="small">
          <Link to="/manage" className={classes.link}>
            {intl.formatMessage(messages.back)}
          </Link>
        </Button>
        <Grid container justify="flex-end">
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
