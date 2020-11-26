import React, { useEffect, useState, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Redirect } from 'react-router'
import { Link } from "react-router-dom";
import { connect } from 'react-redux';
import { pollOptions, userGroups, deletePoll } from '../store/actions/ui';

import axios from 'axios';

import {
    Divider, CardActions,
    CardContent, Card,
    Button, Typography,
    InputLabel, Select, MenuItem, Grid,
} from '@material-ui/core';

const useStyles = makeStyles({
    root: {
        width: '40%',
        justifyContent: 'center',
        textAlign: 'center',
        marginLeft: '30%',
        marginTop: '5%'
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },
    paper: {
        height: '100%',
        verticalAlign: 'middle',
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
    },
});

function Poll({ match, polls, token, pollOptions, options, userGroups, groups, deletePoll }) {

    const poll_id = Number(match.params.uid);
    const [poll, setPoll] = useState({ fields: [] });
    const [group, setGroup] = useState('');
    const [deleted, setDeleted] = useState(false);

    const classes = useStyles();

    const submit = useCallback(async () => {
        const group_id = groups[group - 1].pk
        const data = {
            poll_id,
            group_id,
        }
        try {
            await axios.post('/api/tokens/create_from_group', data, {
                headers: {
                    Authorization: `JWT ${token}`
                }
            });
        }
        catch ({ response }) {
            alert(response.data.message);
        }
    }, [poll_id, groups, token, group]);

    const delete_poll = useCallback(async () => {
        const data = {
            poll_id,
        }

        const res = await axios.post('/api/poll/delete', data, {
            headers: {
                Authorization: `JWT ${token}`
            }
        });
        alert(res.data.message);
        await deletePoll(poll_id);
        setDeleted(true);
    }, [poll_id, token, deletePoll]);

    useEffect(() => {
        if (polls) {
            const p = polls.filter(poll => Number(poll.pk) === poll_id)[0];
            setPoll(p);
        }

        if (!options || Number(options[0].fields.poll) !== poll_id) {
            pollOptions(poll_id)
        }

        if (!groups) {
            userGroups();
        }

    }, [poll_id, polls, options, pollOptions, groups, userGroups]);


    return (
        deleted ? <Redirect to='/' /> :
            <Card className={classes.root}>
                <CardContent>
                    <Typography noWrap variant="h5" component="h2">
                        {poll.fields.name}
                    </Typography>
                    <Typography noWrap className={classes.pos} color="textSecondary">
                        {poll.fields.description}
                    </Typography>
                    <Divider style={{ marginBottom: 10, marginTop: 10 }} />
                    <Typography variant="overline" display="block" gutterBottom>
                        Deadline: <br /> {poll.fields.deadline}
                    </Typography>
                    <Typography variant="overline" display="block" gutterBottom>
                        Voto Secreto:  {poll.fields.secret_vote ? 'Sim' : 'Não'}
                    </Typography>

                    <Typography variant="overline" display="block" gutterBottom>
                        Opções:
                </Typography>

                    {!options ? null : options.map((row, index) => (
                        <Typography variant="overline" display="block" gutterBottom key={index}>
                            {row.fields.name}
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
                                    {group.fields.name}
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
                    <Button size="small"><Link to='/' className={classes.link}>Voltar</Link></Button>
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
    polls: state.ui.polls,
    options: state.ui.options,
    groups: state.ui.groups,
    token: state.auth.access
}), { pollOptions, userGroups, deletePoll })(Poll);
