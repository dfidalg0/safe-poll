import classes from '../styles/home.module.css';
import { logout } from '../store/actions/auth'
import React, { useState } from 'react';
import { Avatar, makeStyles, Button, TextField, Link, Grid, Typography, Container, Radio, RadioGroup, FormLabel, FormControl, FormGroup, FormControlLabel, FormHelperText } from '@material-ui/core';
import { connect } from 'react-redux';
import { login } from '@/store/actions/auth'
import DisplayAlert from '../components/displayAlert'
import { useStyles } from '@/styles/form'
import queryString from 'query-string';
import { useParams } from 'react-router-dom';

function Vote({ logout, isAuthenticated, match, location}) {
    const classes = useStyles();
    const [data, setData] = useState('');
    const [error, setError] = useState(true);
    const [note, setNote] = useState('Deixe apenas um candidato marcado.')
    const newStyle = makeStyles((theme) => ({
        root: {
            backgroundColor: theme.palette.background.paper,
            minWidth: '30vw',
            maxWidth: '50vw',
            color: 'black'
        },
    }));
    const setup = newStyle();

    const handleChange = (event) => {
        setData(event.target.value);
        setError(false);
        setNote('Um candidato foi marcado.')
    };

    const onSubmit = e => {
        e.preventDefault();
        //Devo mudar isto, eu sei
        //login(email, password);
    };

    //const result = queryString.parse(location.search);
    const result = useParams();
    return (
        <Container className={setup.root} maxWidth="xs">
            <div className={classes.paper}>
                <Avatar className={classes.avatar} />
                <form className={classes.form} noValidate onSubmit={e => onSubmit(e)}>
                    <FormControl error={error} component="fieldset" className={classes.formControl}>
                        <FormLabel component="legend">Escolha seu candidato na eleição {result.x}</FormLabel>
                        <RadioGroup color="primary" value={data} onChange={handleChange}>
                          <FormControlLabel
                            value="Zezinho"
                            control={<Radio />}
                            label="Zezinho"
                          />
                          <FormControlLabel
                            value="Luisinho"
                            control={<Radio />}
                            label="Luisinho"
                          />
                          <FormControlLabel
                            value="Huguinho"
                            control={<Radio />}
                            label="Huguinho"
                          />
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
