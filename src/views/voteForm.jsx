import classes from '../styles/home.module.css';
import { logout } from '../store/actions/auth'
import React, { useState, useEffect, useCallback } from 'react';
import { Avatar, makeStyles, Button, Container, Radio, RadioGroup, FormLabel, FormControl, FormControlLabel, FormHelperText } from '@material-ui/core';
import { connect } from 'react-redux';
import LoadingScreen from '@/components/loading-screen';
import { useStyles } from '@/styles/form'
import queryString from 'query-string';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { notify } from '@/store/actions/ui';
import axios from 'axios';

function Vote({ logout, isAuthenticated, match, location}) {
	const newStyle = makeStyles((theme) => ({
        root: {
            backgroundColor: theme.palette.background.paper,
            minWidth: '30vw',
            maxWidth: '50vw',
            color: 'black'
        },
    }));

    const classes = useStyles(),
    	  [mark, setMark] = useState(''),
    	  [error, setError] = useState(true),
    	  [poll, setPoll] = useState(null),
    	  [candidates, setCandidates] = useState(null),
    	  [note, setNote] = useState('Deixe apenas um candidato marcado.'),
    	  [loading, setLoading] = useState(true),
    	  dispatch = useDispatch(),
    	  router = useHistory(),
    	  setup = newStyle();

    const handleChange = (event) => {
        setMark(event.target.value);
        setError(false);
        setNote('Um candidato foi marcado.')
    };

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
            await axios.post('/api/votes/compute', data);
            dispatch(notify('Voto registrado com sucesso', 'success'));
        }
        catch ({ response }) {
            dispatch(notify(response.data.message, 'error'));
        }
    }, [poll, mark, token, dispatch]);

   	useEffect(() => {
   		const fetchData = async () => {
            try {
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
   	});

   	const setOptions = () => {
   		let options = [];
   		for(var i=0; i<candidates.length; i++){
   			options.push(
   				<FormControlLabel
                    value={"opt"+candidates[i].id}
                    control={<Radio />}
                    label={candidates[i].name}
                />
   			)
   		}
   		return options;
   	};

   	if(loading) return <LoadingScreen />
    return (
        <Container className={setup.root} maxWidth="xs">
            <div className={classes.paper}>
                <Avatar className={classes.avatar} />
                <form className={classes.form} noValidate onSubmit={submit}>
                    <FormControl error={error} component="fieldset" className={classes.formControl}>
                        <FormLabel component="legend">Escolha seu candidato na eleição {poll.title}: {poll.description}</FormLabel>
                        <RadioGroup color="primary" value={mark} onChange={handleChange}>
                          {setOptions()}
                        </RadioGroup>
                        <FormHelperText>{note}</FormHelperText>
                    </FormControl>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                    >
                        Enviar voto
                    </Button>
                </form>
                <p></p>
            </div>
        </Container>
    );
};

const mapStateToProps = state => ({
    isAuthenticated: Boolean(state.auth.access),
    error: state.auth.error
});

export default connect(mapStateToProps, { logout })(Vote);
