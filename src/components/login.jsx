import React, { useState } from 'react';
import { Avatar, Button, TextField, Link, Grid, Typography, Container } from '@material-ui/core'
import { connect } from 'react-redux';
import { login } from '../actions/auth'
import DisplayAlert from './displayAlert'
import { useStyles } from '../styles/form'


function Login({ login, error }) {
    const classes = useStyles();
    const [data, setData] = useState({
        email: '',
        password: ''
    });

    const { email, password } = data;
    const onChange = e => setData({ ...data, [e.target.name]: e.target.value });

    const onSubmit = e => {
        e.preventDefault();
        login(email, password);
    };

    return (
        <Container className={classes.app} maxWidth="xs">
            <div className={classes.paper}>
                {DisplayAlert(error)}
                <Avatar className={classes.avatar}>
                </Avatar>
                <Typography component="h1" variant="h5" className={classes.typography} >
                    Entrar
        </Typography>
                <form className={classes.form} noValidate onSubmit={e => onSubmit(e)}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        type="email"
                        label="Email"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        onChange={e => onChange(e)}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Senha"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        onChange={e => onChange(e)}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                    >
                        Entrar
          </Button>
                    <Grid container>
                        <Grid item xs>
                            <Link href="/resetar-senha" variant="body2">
                                Esqueceu sua senha?
              </Link>
                        </Grid>

                    </Grid>
                </form>
                <p></p>
            </div>
        </Container>
    );
}

const mapStateToProps = state => ({
    error: state.auth.error
});

export default connect(mapStateToProps, { login })(Login);