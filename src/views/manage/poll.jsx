import {
    Divider, CardActions,
    CardContent, Card,
    Button, Typography,
    InputLabel, Select, MenuItem, Grid,
} from '@material-ui/core';

import { Link } from "react-router-dom";
import { fetchUserGroups, deletePoll } from '@/store/actions/items';
import { notify } from '@/store/actions/ui';

import LoadingScreen from '@/components/loading-screen';

import axios from 'axios';

import { useRouteMatch, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState, useCallback } from 'react';
import { useStyles } from '@/styles/poll-view';

export default function Poll() {
    const [loading, setLoading] = useState(true);
    const [poll, setPoll] = useState(null);

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
    }, [uid, user, dispatch, router]);

    const [group, setGroup] = useState('');

    const classes = useStyles();

    const groups = useSelector(state => state.items.groups);

    const submit = useCallback(async () => {
        const group_id = groups[group - 1].id
        const data = {
            poll_id: poll.id,
            group_id,
        }
        try {
            await axios.post('/api/tokens/create-from-group', data, {
                headers: {
                    Authorization: `JWT ${token}`
                }
            });

            dispatch(notify('Grupo adicionado com sucesso', 'success'));
        }
        catch ({ response }) {
            dispatch(notify(response.data.message, 'error'));
        }
    }, [poll, groups, token, group, dispatch]);

    const delete_poll = useCallback(async () => {
        const res = await axios.delete(`/api/polls/delete/${poll.id}/`, {
            headers: {
                Authorization: `JWT ${token}`
            }
        });
        dispatch(notify(res.data.message, 'success'));
        dispatch(deletePoll(poll.id));
        router.replace('/manage');
    }, [poll, token, dispatch, router]);

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
                    >
                        Adicionar
                    </Button>
                </Grid>
                <Divider style={{ marginBottom: 20, marginTop: 20 }} />

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
                    >
                        Excluir
                    </Button>
                </Grid>
            </CardActions>
        </Card>
    )
};
