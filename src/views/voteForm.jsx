import {
  Avatar,
  Button,
  Container,
  Radio,
  RadioGroup,
  FormLabel,
  FormControl,
  FormControlLabel,
  FormHelperText,
  CircularProgress,
  Typography,
  Grid,
  Checkbox,
  MenuItem,
} from '@material-ui/core';

import LoadingScreen from '@/components/loading-screen';

import queryString from 'query-string';
import axios from 'axios';

import { notify } from '@/store/actions/ui';

import { useDispatch } from 'react-redux';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useStyles } from '@/styles/form';
import { defineMessages, injectIntl } from 'react-intl';
import { Alert } from "@material-ui/lab";
import { LocaleSelector } from './../components/language-wrapper';

const messages = defineMessages({
  chooseCandidate: {
    id: 'vote-form.choose-candidate',
  },
  sendVote: {
    id: 'vote-form.send-vote',
  },
  confirm: {
    id: 'vote-form.confirm',
  },
  candidateChoosen: {
    id: 'vote-form.candidate-choosen',
  },
  invalidOptionError: {
    id: 'error.option-not-found',
  },
  invalidCredentialsError: {
    id: 'error.invalid-credentials',
  },
  invalidFormError: {
    id: 'error.invalid-form',
  },
  genericError: {
    id: 'error.generic',
  },
  nonSecretVoteReminder: {
    id: 'vote-form.nonSecretVote',
  },
  secretVoteReminder: {
    id: 'vote-form.secretVote',
  },
});

function Vote({ location, intl }) {
  const classes = useStyles(),
    [mark, setMark] = useState(''),
    [error, setError] = useState(true),
    [poll, setPoll] = useState(null),
    [candidates, setCandidates] = useState(null),
    [loading, setLoading] = useState(true),
    dispatch = useDispatch(),
    router = useHistory(),
    [selected, setSelected] = useState(new Set());

  const handleChange = useCallback((event) => {
    setMark(event.target.value);
    setError(false);
  }, []);

  const handleCheckboxChange = (op) => {
    let newSet = selected;
    if (selected.has(op)) {
      newSet.delete(op);
    } else {
      newSet.add(op);
    }
    setSelected(new Set([...newSet]));
  };

  const result = queryString.parse(location.search),
    id = useParams().id,
    token = result.token;

  const submit = useCallback(async () => {
    
    const data = {
      poll_id: poll.id,
      option_id: (Array.from(selected)) ,
      token,
    };
    if(poll.id === 1)
      data["option_id"] = [Number(mark.slice(3))];
    try {
      setLoading(true);
      await axios.post('/api/votes/compute', data);
      dispatch(notify(intl.formatMessage(messages.confirm), 'success'));
      router.replace('/');
    } catch ({ response: {status} }) {
      let info;
      if (status === 404) {
        info = messages.invalidOptionError;
      } else if (status === 422) {
        info = messages.invalidFormError;
      } else if (status === 401) {
        info = messages.invalidCredentialsError;
      } else {
        info = messages.genericError;
      }
      dispatch(notify(intl.formatMessage(info), 'error'));
      setLoading(false);
    }
  }, [poll, mark, selected, token, dispatch, router, intl]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: poll } = await axios.get(`/api/polls/get/${id}/`);
        setPoll(poll);
        setCandidates(poll.options);
      } catch ({ response: { data } }) {
        dispatch(notify(data.message, 'error'));
        router.replace('/manage');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, router, id]);

  if (!poll || !candidates) return <LoadingScreen />;


  if (poll.type === 1) 
  return (
    <Grid container direction='column'>
      <Grid item>
        <LocaleSelector />
      </Grid>
      {poll.secret_vote
          ? <Alert severity="info">{intl.formatMessage(messages.secretVoteReminder)}</Alert>
          : <Alert severity="info">{intl.formatMessage(messages.nonSecretVoteReminder)}</Alert>
      }
      <Grid item>
        <Container className={classes.root} maxWidth='xs'>
          <div className={classes.paper}>
            <Avatar className={classes.avatar} />
            {loading && (
              <CircularProgress style={{ marginTop: '-51px' }} size={45} />
            )}
            <Typography variant='h6'>{poll.title}</Typography>
            <Typography variant='body1'>{poll.description}</Typography>
            <form className={classes.form} noValidate>
              <FormControl
                error={error}
                component='fieldset'
                className={classes.formControl}
                disabled={loading}
              >
                <FormLabel component='legend'>
                  {intl.formatMessage(messages.chooseCandidate)}
                </FormLabel>
                <RadioGroup
                  color='primary'
                  value={mark}
                  onChange={handleChange}
                > 
                  {candidates.map((candidate, i) => (
                    <FormControlLabel
                      key={i}
                      value={'opt' + candidate.id}
                      control={<Radio />}
                      label={candidate.name}
                    />
                  ))}      
                </RadioGroup>
                <FormHelperText>
                  {mark !== ''
                    ? intl.formatMessage(messages.candidateChoosen)
                    : null}
                </FormHelperText>
              </FormControl>

              <Button
                fullWidth
                variant='contained'
                color='primary'
                className={classes.submit}
                disabled={loading || !mark}
                onClick={submit}
              >
                {intl.formatMessage(messages.sendVote)}
              </Button>
            </form>
            <p></p>
          </div>
        </Container>
      </Grid>
    </Grid>
  );

  if (poll.type === 2) 
  return (
    <Grid container direction='column'>
      <Grid item>
        <LocaleSelector />
      </Grid>
      {poll.secret_vote
          ? <Alert severity="info">{intl.formatMessage(messages.secretVoteReminder)}</Alert>
          : <Alert severity="info">{intl.formatMessage(messages.nonSecretVoteReminder)}</Alert>
      }
      <Grid item>
        <Container className={classes.root} maxWidth='xs'>
          <div className={classes.paper}>
            <Avatar className={classes.avatar} />
            {loading && (
              <CircularProgress style={{ marginTop: '-51px' }} size={45} />
            )}
            <Typography variant='h6'>{poll.title}</Typography>
            <Typography variant='body1'>{poll.description}</Typography>
            <form className={classes.form} noValidate>
              <FormControl
                error={error}
                component='fieldset'
                className={classes.formControl}
                disabled={loading}
              >
                <FormLabel component='legend'>
                  {intl.formatMessage(messages.chooseCandidate)}
                </FormLabel>
                {candidates.map((candidate) => (
                <MenuItem key={candidate.id}>
                  <Grid container alignContent="center" alignItems="center">
                    <Grid item>
                      <Checkbox
                        checked={selected.has(candidate.id)}
                        onChange={() => handleCheckboxChange(candidate.id)}
                        value={candidate.id}
                      />
                    </Grid>
                    <Grid item>{candidate.name}</Grid>
                  </Grid>
                </MenuItem>
          ))}
                <FormHelperText>
                  {selected.size === 0
                    ? intl.formatMessage(messages.candidateChoosen)
                    : null}
                </FormHelperText>
              </FormControl>

              <Button
                fullWidth
                variant='contained'
                color='primary'
                className={classes.submit}
                disabled={loading || !selected}
                onClick={submit}
              >
                {intl.formatMessage(messages.sendVote)}
              </Button>
            </form>
            <p></p>
          </div>
        </Container>
      </Grid>
    </Grid>
  );


}

export default injectIntl(Vote);
