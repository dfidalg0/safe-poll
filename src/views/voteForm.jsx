import {
    Avatar, Button, Container,
    Radio, RadioGroup, FormLabel,
    FormControl, FormControlLabel,
    FormHelperText, CircularProgress,
    Typography
} from '@material-ui/core';

import LoadingScreen from '@/components/loading-screen';

import queryString from 'query-string';
import axios from 'axios';

import { notify } from '@/store/actions/ui';

import { useDispatch } from 'react-redux';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useStyles } from '@/styles/form'

export default function Vote({ location}) {
    const classes = useStyles(),
    	  [mark, setMark] = useState(''),
    	  [error, setError] = useState(true),
    	  [poll, setPoll] = useState(null),
    	  [candidates, setCandidates] = useState(null),
    	  [note, setNote] = useState('Deixe apenas um candidato marcado.'),
    	  [loading, setLoading] = useState(true),
    	  dispatch = useDispatch(),
    	  router = useHistory();

    const handleChange = useCallback(event => {
        setMark(event.target.value);
        setError(false);
        setNote('Um candidato foi marcado.')
    }, []);

    const result = queryString.parse(location.search),
    	  id = useParams().id,
    	  token = result.token;

    const submit = useCallback(async () => {
        const data = {
            poll_id: poll.id,
            option_id: Number(mark.slice(3)),
            token,
        }
        try {
            setLoading(true);
            await axios.post('/api/votes/compute', data);
            dispatch(notify('Voto registrado com sucesso', 'success'));
            router.replace('/');
        }
        catch ({ response }) {
            dispatch(notify(response.data.message, 'error'));
            setLoading(false);
        }
    }, [poll, mark, token, dispatch, router]);

   	useEffect(() => {
   		const fetchData = async () => {
            try {
                setLoading(true);
                const { data: poll } = await axios.get(`/api/polls/get/${id}/`);
                setPoll(poll);
                setCandidates(poll.options);
            }
            catch({ response: { data } }){
                dispatch(notify(data.message, 'error'));
                router.replace('/manage');
            }
            finally {
                setLoading(false);
            }
        }

        fetchData();
   	}, [dispatch, router, id]);

    if (!poll || !candidates) return <LoadingScreen />;

    return (
        <Container className={classes.root} maxWidth="xs">
            <div className={classes.paper}>
                <Avatar className={classes.avatar} />
                {loading && <CircularProgress style={{ marginTop: '-51px' }} size={45}/>}
                <Typography variant="h6">
                    {poll.title}
                </Typography>
                <Typography variant="body1">
                    {poll.description}
                </Typography>
                <form className={classes.form} noValidate>
                    <FormControl error={error}
                        component="fieldset"
                        className={classes.formControl}
                        disabled={loading}
                    >
                        <FormLabel component="legend">
                            Escolha seu candidato:
                        </FormLabel>
                        <RadioGroup color="primary" value={mark} onChange={handleChange}>
                            {candidates.map((candidate, i) => <FormControlLabel
                                key={i}
                                value={"opt" + candidate.id}
                                control={<Radio />}
                                label={candidate.name}
                            />)}
                        </RadioGroup>
                        <FormHelperText>{note}</FormHelperText>
                    </FormControl>

                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        disabled={loading || !mark}
                        onClick={submit}
                    >
                        Enviar voto
                    </Button>
                </form>
                <p></p>
            </div>
        </Container>
    );
};
