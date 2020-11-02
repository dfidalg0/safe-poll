import React, { useState } from 'react';
import { Breadcrumbs, Button, CssBaseline, TextField, Link, Typography, Container } from '@material-ui/core'
import { connect } from 'react-redux';
import { reset_password } from '../actions/auth'
import { Alert } from '@material-ui/lab'
import { useStyles } from '../styles/form'

function ResetPassword({ reset_password }) {
    const classes = useStyles();
    const [sent, setSent] = useState(false);
    const [email, setEmail] = useState('');

    const onChange = e => setEmail(e.target.value);

    const onSubmit = e => {
        e.preventDefault();
        reset_password(email);
        setSent(true);
    };

    function displayMessage() {
        if (sent) {
            return (
                <Alert className={classes.alert} severity="info">Se o email inserido corresponder a alguma conta, instruções de recuperação serão enviadas.</Alert>
            );
        } else {
            return null
        }
    };

    return (
        <Container className={classes.app} maxWidth="xs">

            <Breadcrumbs className={classes.breadcrumb} >
                <Link color="inherit" href="/">
                    Página Inicial </Link>
                <Typography color="textPrimary">Resetar Senha</Typography>
            </Breadcrumbs>
            <CssBaseline />
            
            {displayMessage()}
            <div className={classes.paper}>
                <Typography component="h1" variant="h5" className={classes.typography} >
                    Resetar Senha
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

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                    >
                        Recuperar Senha
          </Button>
                </form>
                <p></p>
            </div>
        </Container>
    );
}

export default connect(null, { reset_password })(ResetPassword);