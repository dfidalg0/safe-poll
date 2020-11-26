import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Link } from "react-router-dom";
import { connect } from 'react-redux';
import { pollOptions, userGroups } from '../store/actions/ui';

import {
    Divider, CardActions,
    CardContent, Card,
    Button, Typography,
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

function Poll({ match, polls, pollOptions, options, userGroups, groups }) {

    const uid = match.params.uid;
    const [poll, setPoll] = useState({ fields: [] });

    const classes = useStyles();

    useEffect(() => {
        if (polls) {
            const p = polls.filter(poll => Number(poll.pk) === Number(uid))[0];
            setPoll(p);
        }

        if (!options || Number(options[0].fields.poll) !== Number(uid)) {
            pollOptions(uid)
        }

        if(!groups){
            userGroups();
        }

    }, [uid, polls, options, pollOptions, groups, userGroups]);

    return (
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
                    <Typography variant="overline" display="block" gutterBottom>
                        {row.fields.name}
                    </Typography>
                ))}
            </CardContent>
            <CardActions>
                <Button size="small"><Link to='/' className={classes.link}>Voltar</Link></Button>
            </CardActions>
        </Card>
    )
};

export default connect(state => ({
    polls: state.ui.polls,
    options: state.ui.options,
    groups: state.ui.groups
}), { pollOptions, userGroups })(Poll);
