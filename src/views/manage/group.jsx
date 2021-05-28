import { makeStyles } from '@material-ui/core/styles';

import { Link } from 'react-router-dom';

import {
  Divider,
  Grid,
  TextField,
  CardActions,
  CardContent,
  Card,
  Button,
  Typography,
  IconButton,
  Paper,
} from '@material-ui/core';

import LoadingScreen from '@/components/loading-screen';
import BulkEmailAdd from '@/components/bulk-add-email';

// Ícones
import {
  DeleteOutline as DeleteIcon,
  Add as AddIcon,
} from '@material-ui/icons';

import axios from 'axios';

import isEmail from 'validator/lib/isEmail';
import isEqual from 'lodash.isequal';

import { notify } from '@/store/actions/ui';

import { deleteGroup } from '@/store/actions/items';

import { useConfirm } from '@/utils/confirm-dialog';

import { useSelector, useDispatch } from 'react-redux';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';

import { useRouteMatch, useHistory } from 'react-router-dom';
import { defineMessages, injectIntl } from 'react-intl';

import { getPath } from '@/utils/routes';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '500px',
    maxWidth: '98%',
    justifyContent: 'center',
    textAlign: 'center',
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  paper: {
    height: '100%',
    verticalAlign: 'middle',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  button: {
    marginRight: 5,
    marginTop: '10px',
    marginBottom: '10px',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.secondary.contrastText,
    },
  },
  deleteIcon: {
    color: '#900a0a',
  },
}));

const messages = defineMessages({
  confirmDelete: {
    id: 'manage.group.confirm-delete',
  },
  back: {
    id: 'manage.back',
  },
  update: {
    id: 'manage.update',
  },
  deleteGroupSuccess: {
    id: 'success-message.group-deleted',
  },
  internalServerError: {
    id: 'error.internal-server',
  },
  groupNotFound: {
    id: 'error.group-not-found',
  },
  genericError: {
    id: 'error.generic',
  },
  invalidForm: {
    id: 'error.invalid-form',
  },
  successfullyUpdated: {
    id: 'success-message.group-updated',
  },
});

function Group({ intl }) {
  const {
    params: { uid },
  } = useRouteMatch();

  const classes = useStyles();

  const [group, setGroup] = useState(null);

  const token = useSelector((state) => state.auth.access);

  const dispatch = useDispatch();

  const router = useHistory();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: group } = await axios.get(`/api/groups/get/${uid}`, {
          headers: {
            Authorization: `JWT ${token}`,
          },
        });

        setGroup(group);
        setEmails(group.emails);
      } catch ({ response: { status } }) {
        let info;
        if (status === 500) info = messages.internalServerError;
        else if (status === 404) info = messages.groupNotFound;
        else info = messages.genericError;
        dispatch(notify(intl.formatMessage(info), 'error'));
        router.replace(getPath('manage'));
      }
    };

    if (!group) fetchData();
  }, [uid, group, token, router, dispatch, intl]);

  const [emails, setEmails] = useState([]);

  const submit = useCallback(async () => {
    try {
      await axios.put(
        `/api/groups/update/${uid}`,
        { emails },
        {
          headers: {
            Authorization: `JWT ${token}`,
          },
        }
      );

      setGroup((group) => ({
        ...group,
        emails,
      }));

      dispatch(
        notify(intl.formatMessage(messages.successfullyUpdated), 'success')
      );
    } catch ({ response: { status } }) {
      let info;
      if (status === 500) info = messages.internalServerError;
      else if (status === 404) info = messages.groupNotFound;
      else info = messages.genericError;
      dispatch(notify(intl.formatMessage(info), 'error'));
    }
  }, [uid, emails, token, dispatch, intl]);

  const confirm = useConfirm();

  const submitDelete = useCallback(async () => {
    const check = await confirm(intl.formatMessage(messages.confirmDelete));

    if (!check) {
      return;
    }

    try {
      await axios.delete(`/api/groups/delete/${uid}`, {
        headers: {
          Authorization: `JWT ${token}`,
        },
      });

      dispatch(deleteGroup(Number(uid)));
      dispatch(
        notify(intl.formatMessage(messages.deleteGroupSuccess), 'success')
      );

      router.replace(getPath('manage'));
    } catch ({ response: { status } }) {
      let info;
      if (status === 500) info = messages.internalServerError;
      else if (status === 404) info = messages.groupNotFound;
      else info = messages.genericError;
      dispatch(notify(intl.formatMessage(info)), 'error');
    }
  }, [dispatch, confirm, uid, router, token, intl]);

  const disabled = useMemo(() => {
    if (!group || !emails.length) return true;

    const a = new Set(emails);
    const b = new Set(group.emails);

    return isEqual(a, b);
  }, [emails, group]);

  // novo email a ser adicionado
  const [newEmail, setNewEmail] = useState('');

  // Estado de erros de validação dos emails
  const [newEmailError, setNewEmailError] = useState(false);

  // Ref para a caixa de texto de novo email (usada para autofocus)
  const newEmailRef = useRef();

  const createEmail = useCallback(() => {
    if (newEmail && !newEmailError) {
      setEmails((emails) => [...emails, newEmail]);
      setNewEmail('');
    }
  }, [newEmailError, newEmail]);

  const deleteEmail = useCallback(
    (index) => {
      const newEmails = [...emails];
      newEmails.splice(index, 1);
      setEmails(newEmails);
    },
    [emails]
  );

  useEffect(() => {
    if (emails.includes(newEmail) || !isEmail(newEmail)) {
      setNewEmailError(true);
    } else {
      setNewEmailError(false);
    }
  }, [newEmail, emails]);

  return !group ? (
    <LoadingScreen />
  ) : (
    <Grid container className={classes.root} justify="center">
      <Card className={classes.root}>
        <CardContent>
          <Typography
            variant="h6"
            display="block"
            gutterBottom
            style={{ marginTop: 10 }}
          >
            <span style={{ marginLeft: '30pt' }}>{group.name}</span>
            <IconButton
              style={{ float: 'right', marginTop: '-5pt', color: '#900a0a' }}
              onClick={submitDelete}
            >
              <DeleteIcon />
            </IconButton>
          </Typography>

          <Divider style={{ marginBottom: 20, marginTop: 20 }} />
          <Typography
            variant="button"
            display="block"
            gutterBottom
            style={{ marginBottom: 20 }}
          >
            Emails:
          </Typography>
          <BulkEmailAdd emails={emails} setEmails={setEmails} />
          {emails.map((email, index) => (
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
                autoComplete="off"
                inputRef={newEmailRef}
                className={classes.option}
                variant="outlined"
                value={newEmail}
                error={newEmail === '' ? false : newEmailError}
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
            direction="row"
            justify="space-between"
            alignItems="center"
          >
            <Grid item>
              <Button>
                <Link to={getPath('manage')} className={classes.link}>
                  {intl.formatMessage(messages.back)}
                </Link>
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                className={classes.button}
                onClick={submit}
                disabled={disabled}
              >
                {intl.formatMessage(messages.update)}
              </Button>
            </Grid>
          </Grid>
        </CardActions>
      </Card>
    </Grid>
  );
}

export default injectIntl(Group);
