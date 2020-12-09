import {
    Divider, CardActions,
    CardContent, Card,
    Button, Typography, CircularProgress,
    InputLabel, Select, MenuItem, Grid,
    IconButton,
    Paper, Tooltip, Fab,
    Dialog, TextField
} from '@material-ui/core';

// Ícones
import AddIcon from '@material-ui/icons/Add';
import EmailIcon from '@material-ui/icons/Email';
import CheckIcon from '@material-ui/icons/Check';
import {
    DeleteOutline as DeleteIcon,
} from '@material-ui/icons';

import { Link } from "react-router-dom";
import { fetchUserGroups, deletePoll } from '@/store/actions/items';
import { notify } from '@/store/actions/ui';

import LoadingScreen from '@/components/loading-screen';

import axios from 'axios';

import { useRouteMatch, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useStyles } from '@/styles/poll-view';
import { useConfirm } from '@/utils/confirm-dialog';

import isEmail from 'validator/lib/isEmail';


export default function Poll() {

    function EmailItem({ email }) {
        const [loadingSend, setLoadingSend] = useState(false);
        const [loadingDelete, setLoadingDelete] = useState(false);

        const delete_email = async (email) => {
            setLoadingDelete(true);
            try {
                const res = await axios.post('/api/polls/emails/delete', {
                    'email': email,
                    poll_id: poll.id
                },
                    {
                        headers: {
                            Authorization: `JWT ${token}`
                        }
                    });
                setLoadingDelete(false);
                const new_emails = emails.filter(e => e !== email);
                setEmails(new_emails);
                dispatch(notify(res.data.message, 'success'));
            } catch ({ response: { data } }) {
                setLoadingDelete(false);
                dispatch(notify(data.message, 'warning'));
            }
        };

        const send_email = async (email) => {
            setLoadingSend(true);
            try {
                await axios.post('/api/emails/send-list', {
                    poll_id: poll.id,
                    users_emails_list: [email]
                }, {
                    headers: {
                        Authorization: `JWT ${token}`
                    }
                });
                setLoadingSend(false);
                dispatch(notify('Email enviado para ' + email))
            } catch ({ response: { data } }) {
                setLoadingSend(false);
                dispatch(notify(data.message, 'warning'))
            }

        }

        return (
            <Grid container style={{ justifyContent: 'center', marginBottom: 10 }}>
                <Grid item xs={12} sm={8}>
                    <Paper className={classes.paper}><Typography>{email}</Typography></Paper>
                </Grid>

                {poll.emails_voted.indexOf(email) > -1 ?
                    <Grid item xs={12} sm={2} >
                        <IconButton>
                            <CheckIcon className={classes.checkIcon} />
                        </IconButton>
                    </Grid>
                    :
                    <Grid item xs={6} sm={1} >
                        {loadingDelete ? <IconButton><CircularProgress size={18} /></IconButton> :
                            <IconButton onClick={() => delete_email(email)}>
                                <DeleteIcon className={classes.deleteIcon} />
                            </IconButton>}
                    </Grid>
                }
                {poll.emails_voted.indexOf(email) > -1 ?
                    null :
                    <Grid item xs={6} sm={1} >
                        {loadingSend ? <IconButton><CircularProgress size={18} /></IconButton> :
                            <Tooltip title="Enviar e-mail individual">
                                <IconButton onClick={() => send_email(email)}>
                                    <EmailIcon className={classes.emailIcon} />
                                </IconButton>
                            </Tooltip>}
                    </Grid>
                }
            </Grid>
        )
    };

    function AddInvidualEmails() {
        const classes = useStyles();

        const [addedEmails, setAddedEmails] = useState([]);

        // novo email a ser adicionado
        const [newEmail, setNewEmail] = useState('');

        // Estado de erros de validação dos emails
        const [newEmailError, setNewEmailError] = useState(false);


        // Ref para a caixa de texto de novo email (usada para autofocus)
        const newEmailRef = useRef();

        const createEmail = useCallback(() => {
            if (newEmail && !newEmailError) {
                setAddedEmails(addedEmails => [...addedEmails, newEmail]);
                setNewEmail('');
            }
        }, [newEmailError, newEmail]);

        const deleteEmail = useCallback(index => {
            const newEmails = [...addedEmails];
            newEmails.splice(index, 1);
            setAddedEmails(newEmails);
        }, [addedEmails]);

        useEffect(() => {
            if (emails.includes(newEmail) || addedEmails.includes(newEmail) || !isEmail(newEmail)) {
                setNewEmailError(true);
            } else {
                setNewEmailError(false);
            }
        }, [newEmail, addedEmails]);

        const token = useSelector(state => state.auth.access);

        const dispatch = useDispatch();

        const submit = useCallback(async () => {
            const data = {
                'email_list': addedEmails,
                'poll_id': poll.id
            }
            try {
                const res = await axios.post('/api/tokens/create', data, {
                    headers: {
                        Authorization: `JWT ${token}`
                    }
                });
                dispatch(notify(res.data.added_emails.length + ' emails foram adicionados!', 'success'));
                setEmails(emails.concat(res.data.added_emails))
            }
            catch ({ response }) {
                dispatch(notify(response.data.message, 'error'));
            }
        }, [addedEmails, token, dispatch]);

        return !groups ? <LoadingScreen /> : (
            <div align="center">
                <Card className={classes.root}>
                    <CardContent>
                        <Typography variant="button" display="block" gutterBottom >
                            Adicionar e-mails:
                        </Typography>

                        <Divider style={{ marginBottom: 20, marginTop: 20 }} />
                        {addedEmails.map((email, index) =>
                            <Grid container key={index} style={{ justifyContent: 'center', marginBottom: 10 }}>
                                <Grid item xs={12} sm={8}>
                                    <Paper className={classes.paper}><Typography>{email}</Typography></Paper>
                                </Grid>

                                <Grid item xs={12} sm={1} >
                                    <IconButton onClick={
                                        () => deleteEmail(index)
                                    }>
                                        <DeleteIcon className={classes.deleteIcon} />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        )}

                        <Grid container style={{ justifyContent: 'center' }}>
                            <Grid item xs={8}>
                                <TextField
                                    autoComplete="off"
                                    inputRef={newEmailRef}
                                    className={classes.option}
                                    variant="outlined"
                                    value={newEmail}
                                    error={newEmail === '' ? false : newEmailError}
                                    helperText={isEmail(newEmail) && newEmailError ? 'Email já cadastrado' : null}
                                    onChange={e => setNewEmail(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') createEmail();
                                    }}
                                    InputProps={{
                                        className: classes.input
                                    }}
                                    style={{ width: '100%', textAlign: 'center' }}
                                />
                            </Grid>
                            <Grid item xs={1}>
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
                            justify='flex-end'
                            alignItems="center"
                        >
                            <Grid item>
                                <Button variant="contained" className={classes.button}
                                    onClick={submit}
                                    disabled={addedEmails.length === 0}
                                >
                                    Adicionar
                            </Button>
                            </Grid>
                        </Grid>
                    </CardActions>
                </Card >
            </div >
        )
    };

    const [loading, setLoading] = useState(true);
    const [loadingSendEmails, setLoadingSendEmails] = useState(false);
    const [loadingAdd, setLoadingAdd] = useState(false);
    const [poll, setPoll] = useState(null);
    const [emails, setEmails] = useState(null);
    const [emailsAddOpen, setEmailsAddOpen] = useState(false);

    const dispatch = useDispatch();

    const router = useHistory();

    const { uid } = useRouteMatch().params;

    const user = useSelector(state => state.auth.user);
    const token = useSelector(state => state.auth.access);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: poll } = await axios.get(`/api/polls/get/${uid}/`);
                if (user.id !== poll.admin)
                    router.replace('/manage');
                else setPoll(poll);

                const { data } = await axios.get(`/api/polls/emails/${uid}`, {
                    headers: {
                        Authorization: `JWT ${token}`
                    }
                });
                setEmails(data.emails);
            }
            catch ({ response: { data } }) {
                dispatch(notify(data.message, 'error'));
                router.replace('/manage');
            }
            finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [uid, user, dispatch, router, token]);

    const [group, setGroup] = useState('');

    const classes = useStyles();

    const groups = useSelector(state => state.items.groups);

    const submit = useCallback(async () => {
        setLoadingAdd(true);
        const group_id = groups[group - 1].id

        const { data } = await axios.post('/api/tokens/create-from-group', {
            poll_id: poll.id,
            group_id,
        }, {
            headers: {
                Authorization: `JWT ${token}`
            }
        });

        var new_emails = data.added_emails.filter(email => !emails.includes(email) && !poll.emails_voted.includes(email))

        if (new_emails.length === 0) {
            dispatch(notify('Os emails deste grupo já estão cadastrados', 'warning'))
        } else {
            setEmails(emails.concat(new_emails));
            dispatch(notify('Grupo adicionado com sucesso', 'success'))
        }

        setLoadingAdd(false);
    }, [poll, groups, token, group, dispatch, emails]);

    const confirm = useConfirm();

    const delete_poll = useCallback(async () => {
        const check = await confirm('Esta eleição será apagada e todos os votos serão perdidos.');

        if (!check){
            return;
        }

        const res = await axios.delete(`/api/polls/delete/${poll.id}/`, {
            headers: {
                Authorization: `JWT ${token}`
            }
        });
        dispatch(notify(res.data.message, 'success'));
        dispatch(deletePoll(poll.id));
        router.replace('/manage');
    }, [poll, token, dispatch, confirm, router]);

    const send_email_to_everyone = useCallback(async () => {
        setLoadingSendEmails(true);
        try {
            await axios.post('/api/emails/send', {
                poll_id: poll.id,
            }, {
                headers: {
                    Authorization: `JWT ${token}`
                }
            });
            setLoadingSendEmails(false);
            dispatch(notify('Emails enviados!'))
        } catch ({ response: { data } }) {
            setLoadingSendEmails(false);
            dispatch(notify(data.message, 'warning'))
        }
    }, [poll, setLoadingSendEmails, dispatch, token])

    useEffect(() => {
        if (!groups) {
            dispatch(fetchUserGroups());
        }

    }, [groups, dispatch]);

    if (loading) return <LoadingScreen />

    return (
        <Card className={classes.root}>
            <CardContent>
                <Typography noWrap variant="h5" component="h2">
                    {poll.title}
                </Typography>
                <Typography noWrap className={classes.pos} color="textSecondary">
                    {poll.description}
                </Typography>
                <Divider style={{ marginBottom: 10, marginTop: 10 }} />
                <Typography variant="overline" display="block" gutterBottom>
                    Deadline: <br /> {poll.deadline}
                </Typography>
                <Typography variant="overline" display="block" gutterBottom>
                    Voto Secreto:  {poll.secret_vote ? 'Sim' : 'Não'}
                </Typography>
                <Typography variant="overline" display="block" gutterBottom>
                    Opções:
                </Typography>

                {poll.options.map((option, index) => (
                    <Typography variant="overline" display="block" gutterBottom key={index}>
                        {option.name}
                    </Typography>
                ))}

                <Divider style={{ marginBottom: 10, marginTop: 10 }} />

                <Grid item xs={12}>
                    <InputLabel htmlFor="type" style={{ padding: 10 }}>
                        Grupo
                    </InputLabel>
                    <Select id="type"
                        className={classes.field}
                        required
                        value={group}
                        variant="outlined"
                        onChange={e => setGroup(e.target.value)}
                        style={{ width: '50%' }}
                    >
                        {!groups ? null : groups.map((group, index) =>
                            <MenuItem value={index + 1} key={index}>
                                {group.name}
                            </MenuItem>
                        )}
                    </Select>
                </Grid>
                <Grid item style={{ marginTop: 20 }}>
                    <Button variant="contained" className={classes.button}
                        onClick={submit}
                        disabled={group === ''}
                        size='large'
                        style={{ width: '40%' }}
                    >   {loadingAdd ? <CircularProgress size={22} /> : 'Adicionar'}
                    </Button>
                </Grid>
                <Divider style={{ marginBottom: 20, marginTop: 20 }} />
                <Grid item style={{ marginTop: 20, marginBottom: 20 }}>
                    {loadingSendEmails ? <CircularProgress size={22} /> :
                        <Tooltip title="Enviar links de votação para todos os cadastrados">
                            <Button variant="contained" className={classes.button}
                                onClick={send_email_to_everyone}
                                endIcon={<EmailIcon />}
                                disabled={emails.length === 0}
                                size='large'
                                style={{ width: '50%' }}
                            >    Enviar emails
                    </Button>
                        </Tooltip>
                    }

                    <Tooltip title="Adicionar e-mails" aria-label="add">
                        <Fab color="primary" size='small' style={{ marginLeft: 20 }} onClick={() => setEmailsAddOpen(true)}>
                            <AddIcon style={{ fontSize: 18 }} />
                        </Fab>
                    </Tooltip>

                    <Dialog onClose={() => setEmailsAddOpen(false)} aria-labelledby="simple-dialog-title" open={emailsAddOpen}>
                        <AddInvidualEmails />
                    </Dialog>
                </Grid>


                {emails.map((email, index) =>
                    <EmailItem email={email} key={index} />
                )}
            </CardContent>
            <CardActions>
                <Button size="small">
                    <Link to='/manage' className={classes.link}>
                        Voltar
                    </Link>
                </Button>
                <Grid container justify="flex-end">
                    <Button
                        className={classes.button}
                        onClick={delete_poll}
                        endIcon={<DeleteIcon className={classes.deleteIcon} />}
                    >
                        Excluir
                    </Button>
                </Grid>
            </CardActions>
        </Card >
    )
};
