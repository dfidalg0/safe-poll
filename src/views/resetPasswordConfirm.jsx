import React, { useState } from 'react';
import { Avatar, Breadcrumbs, Link, Button, CssBaseline, TextField, Typography, Container } from '@material-ui/core'
import { connect } from 'react-redux';
import { reset_password_confirm } from '../actions/auth'
import DisplayAlert from '../components/displayAlert'
import { Alert } from '@material-ui/lab'
import { useStyles } from '../styles/form'


function ResetPasswordConfirm({ match, reset_password_confirm, error }) {
    const classes = useStyles();
    const [passwordReset, setPasswordReset] = useState(false);
    const [data, setData] = useState({
        new_password: '',
        re_new_password: ''
    });

    const { new_password, re_new_password } = data;
    const onChange = e => setData({ ...data, [e.target.name]: e.target.value });

    const onSubmit = e => {
        e.preventDefault();
        if (new_password === re_new_password) {
            const uid = match.params.uid;
            const token = match.params.token;
            reset_password_confirm(uid, token, new_password, re_new_password);
            setPasswordReset(true);
        } else {
            alert("As senhas não coincidem");
        }

    };

    function DisplaySucessAlert(error) {
        if (error === undefined) {
            if (passwordReset) {
                return (
                    <Alert className={classes.alert} style={{marginBottom: '30px'}}severity="success">Sua senha foi alterada com sucesso!</Alert>
                );
            } else return null;

        } else {
            return null;
        }
    }

    return (
        <Container className={classes.app} maxWidth="xs">
            <CssBaseline />
            <Breadcrumbs className={classes.breadcrumb} >
                <Link color="inherit" href="/">
                    Página Inicial </Link>
                <Typography color="textPrimary">Alterar Senha</Typography>
            </Breadcrumbs>
            <div className={classes.paper}>
                {DisplayAlert(error)}
                {DisplaySucessAlert(error)}
                <Avatar className={classes.avatar}>
                </Avatar>
                <Typography component="h1" variant="h5" className={classes.typography} >
                    Alterar Senha
        </Typography>
                <form className={classes.form} noValidate onSubmit={e => onSubmit(e)}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="new_password"
                        label="Nova Senha"
                        type="password"
                        id="new_password"
                        autoComplete="current-password"
                        onChange={e => onChange(e)}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="re_new_password"
                        label="Digite Novamente"
                        type="password"
                        id="re_new_password"
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
                        Confirmar
          </Button>
                </form>
                <p></p>
            </div>
        </Container>
    );
}

const mapStateToProps = state => ({
    error: state.auth.error
});

export default connect(mapStateToProps, { reset_password_confirm })(ResetPasswordConfirm);