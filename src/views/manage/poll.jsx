import {
    Divider, CardActions,
    CardContent, Card,
    Button, Typography,
    InputLabel, Select, MenuItem, Grid,
} from '@material-ui/core';

import { Link, Redirect } from "react-router-dom";
import { connect } from 'react-redux';
import { fetchUserGroups, deletePoll } from '@/store/actions/ui';

import LoadingScreen from '@/components/loading-screen';

import axios from 'axios';

import { useEffect, useState, useCallback } from 'react';
import { useStyles } from '@/styles/poll-view';

function Poll({ match, token, fetchUserGroups, groups, deletePoll, user }) {
    const [loading, setLoading] = useState(true);
    const [poll, setPoll] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const { uid } = match.params;

            try {
                const { data: poll } = await axios.get(`/api/polls/get/${uid}/`);
                if (user.id !== poll.admin)
                    setDeleted(true);
                else setPoll(poll);
            }
            catch({ response: { data } }){
                alert(data.message);
                setDeleted(true);
            }
            finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [match, user]);

    const [group, setGroup] = useState('');
    const [deleted, setDeleted] = useState(false);

    const classes = useStyles();

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
        }
        catch ({ response }) {
            alert(response.data.message);
        }
    }, [poll, groups, token, group]);

    const delete_poll = useCallback(async () => {
        const res = await axios.delete(`/api/polls/delete/${poll.id}/`, {
            headers: {
                Authorization: `JWT ${token}`
            }
        });
        alert(res.data.message);
        deletePoll(poll.id);
        setDeleted(true);
    }, [poll, token, deletePoll]);

    useEffect(() => {
        if (!groups) {
            fetchUserGroups();
        }

    }, [groups, fetchUserGroups]);

    if (loading) return <LoadingScreen />

    return (
        deleted ?
            <Redirect to='/manage' /> :
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

export default connect(state => ({
    groups: state.ui.groups,
    token: state.auth.access,
    user: state.auth.user
}), { fetchUserGroups, deletePoll })(Poll);
