import {
  Avatar,
  Button,
  Container,
  Radio,
  RadioGroup,
  FormLabel,
  FormControl,
  FormControlLabel,
  CircularProgress,
  Typography,
  Grid,
  Checkbox,
  ButtonGroup,
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

import { getPath } from '@/utils/routes';

const messages = defineMessages({
  chooseCandidate: {
    id: 'vote-form.choose-candidate',
  },
  chooseCandidate3: {
    id: 'vote-form.choose-candidate-type-3',
  },
  chooseCandidate6: {
    id: 'vote-form.choose-candidate-type-6',
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
    [selected, setSelected] = useState(new Set()),
    [counters, setCounters] = useState([]);


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
  
  const setCount = (index, newCounter) => {

      const newCounters = Object.assign([], counters);
      newCounters[index] = newCounter;
      
    if(newCounters.reduce((a,b) => a + b , 0) <= poll.votes_number && newCounter >= 0)
      setCounters(newCounters);

  };


  const result = queryString.parse(location.search),
    uid = useParams().uid,
    token = result.token,
    perm = result.perm === 'true' ? true : false;

  const submit = useCallback(async () => {

    const data = {
      poll_id: poll.id,
      option_id: (Array.from(selected)) ,
      token, perm
    };
    if(poll.type === 1 || poll.type === 4)
      data.option_id = [Number(mark.slice(3))];
    

    if(poll.type === 6)
    { 
      var i,j;
      data.option_id = [];
      for (i = 0 ; i < counters.length ; i++) 
        for(j = 0 ; j < counters[i] ; j++ )
          data.option_id.push(candidates[i].id)

    }

    try {
      setLoading(true);
      await axios.post('/api/votes/compute', data);
      dispatch(notify(intl.formatMessage(messages.confirm), 'success'));
      router.replace(getPath('home'));
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
  }, [poll, mark, selected, counters, candidates, token, dispatch, router, intl, perm]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: poll } = await axios.get(`/api/polls/get/${uid}/`);
        setPoll(poll);
        setCandidates(poll.options);
        setCounters(new Array(poll.options.length).fill(0));
      } catch ({ response: { data } }) {
        dispatch(notify(data.message, 'error'));
        router.replace(getPath('manage'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dispatch, router, uid]);

  if (!poll || !candidates) return <LoadingScreen />;

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
                { (poll.type === 1 || poll.type === 4) && (
                  <div>   
                    <FormLabel component='legend'>
                      {intl.formatMessage(messages.chooseCandidate)}
                    </FormLabel>
                    
                    <RadioGroup
                    color='primary'
                    value={mark}
                    onChange={handleChange}
                    >
                      {candidates.map((candidate, i) => (
                        <>
                        <FormControlLabel
                          key={i}
                          value={'opt' + candidate.id}
                          control={<Radio />}
                          label={candidate.name}
                        />
  
                      <Typography
                          variant='caption'
                          className={classes.description}
                      >
                        {candidate.description}
                      </Typography>
                      </>
                     ))}
                    </RadioGroup>
                 </div>
                )}
                { (poll.type === 3 || poll.type === 5) && (
                  <FormLabel component='legend'> 
                    {intl.formatMessage(messages.chooseCandidate3, { nOptions: poll.votes_number })} 
                  </FormLabel>
                )}
                { (poll.type === 2 || poll.type === 3 || poll.type === 5 ) && (
                  <>
                  {candidates.map((candidate, i) => (
                    <>
                    <FormControlLabel
                      key={i}
                      value={'opt' + candidate.id}
                      control={<Checkbox
                        checked={selected.has(candidate.id)}
                        onChange={() => handleCheckboxChange(candidate.id)}
                        value={candidate.id}
                      />}
                      label={candidate.name}
                    />

                    <Typography
                        variant='caption'
                        className={classes.description}
                    >
                      {candidate.description}
                    </Typography>
                    </>     
                  ))}
                </>
                )}
                { (poll.type === 6) && (
                  <div>
                    <FormLabel component='legend'> 
                      {intl.formatMessage(messages.chooseCandidate6, { nOptions: poll.votes_number })} 
                    </FormLabel>
                  {candidates.map((candidate, index) => (
                    
                    <>
                    <div>
                    
                      {candidate.name}
                      <ButtonGroup size="small" style = {{ marginLeft: '250px' }}  >
                      <Button 
                        color="primary"
                        variant="contained"
                        style = {{ height: '23px' }}
                        onClick={()=>setCount(index, counters[index] - 1)} 
                        disabled={loading || !counters[index] }
                      >
                      -
                      </Button>
                      <Button
                      style = {{ height: '23px' }}
                      >
                        {counters[index]}</Button>
                      <Button 
                        color="primary"
                        variant="contained"
                        style = {{ height: '23px' }}
                        onClick={()=>setCount(index, counters[index] + 1)} 
                        disabled={loading || counters.reduce((a,b) => a + b , 0) === poll.votes_number}
                      >
                      +
                      </Button>
                      </ButtonGroup>
                    </div>

                    <Typography
                        variant='caption'
                        className={classes.description}
                    >
                      {candidate.description}
                    </Typography>

                    </>
                  )) }          


                 </div>
                )}
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
