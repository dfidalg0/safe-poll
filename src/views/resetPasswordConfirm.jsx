import {
    Avatar, Breadcrumbs, Link,
    Button, CssBaseline, TextField,
    Typography, Container, CircularProgress
} from '@material-ui/core'
import { Alert } from '@material-ui/lab';

import DisplayAlert from '@/components/displayAlert';

import { reset_password_confirm } from '@/store/actions/auth';
import { notify } from '@/store/actions/ui';

import { useDispatch, useSelector } from 'react-redux';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useStyles } from '@/styles/form';


export default function ResetPasswordConfirm() {
    const classes = useStyles();

    const [loading, setLoading] = useState(false);

    const [passwordReset, setPasswordReset] = useState(false);

    const [data, setData] = useState({
        new_password: '',
        re_new_password: ''
    });

    const { new_password, re_new_password } = data;
    const onChange = useCallback(e => setData(data => ({
        ...data, [e.target.name]: e.target.value
    })), []);

    const { uid, token } = useRouteMatch().params;

    const dispatch = useDispatch();

    const router = useHistory();

    const onSubmit = useCallback(async e => {
        e.preventDefault();
        if (new_password === re_new_password) {
            setLoading(true);
            await dispatch(reset_password_confirm(
                uid, token,
                new_password, re_new_password
            ));
            setPasswordReset(true);
            setLoading(false);
        }
        else {
            dispatch(notify("As senhas não coincidem", 'error'));
        }
    }, [new_password, re_new_password, dispatch, uid, token]);

    const error = useSelector(state => state.auth.error);

    useEffect(() => {
        if (passwordReset && !error)
            setTimeout(() => {
                dispatch(notify('Senha alterada com succeso', 'success'));
                router.replace('/');
            }, 2000);
    }, [router, passwordReset, error, dispatch])

    const DisplaySucessAlert = useCallback(error => {
        if (!error) {
            if (passwordReset) {
                return (
                    <Alert className={classes.alert}
                        style={{marginBottom: '30px'}}
                        severity="success"
                    >
                        Sua senha foi alterada com sucesso! <br />
                        Redirecionando para a página de Login...
                    </Alert>
                );
            }
            else return null;

        } else {
            return null;
        }
    }, [passwordReset, classes]);

    return (
        <Container className={classes.app} maxWidth="xs">
            <CssBaseline />
            <Breadcrumbs className={classes.breadcrumb} >
                <Link color="inherit" to="/">
                    Página Inicial
                </Link>
                <Typography color="textPrimary">Alterar Senha</Typography>
            </Breadcrumbs>
            <div className={classes.paper}>
                {DisplayAlert(error)}
                {DisplaySucessAlert(error)}
                <Avatar className={classes.avatar} />
                {loading &&
                    <CircularProgress size={45}
                        className={classes.progress}
                    />
                }
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
                        disabled={loading}
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
                        disabled={loading}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        disabled={loading}
                    >
                        Confirmar
                    </Button>
                </form>
                <p></p>
            </div>
        </Container>
    );
}
