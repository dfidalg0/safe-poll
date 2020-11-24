import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Link } from "react-router-dom";
import { connect } from 'react-redux';
import { pollOptions } from '../store/actions/ui';

const useStyles = makeStyles({
    root: {
        width: '50%',
        justifyContent: 'center',
        textAlign: 'center',
        marginLeft: '25%',
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
});

function Poll({ match, polls, pollOptions, options }) {
    const uid = match.params.uid;
    const [poll, setPoll] = useState({ fields: [] });

    useEffect(() => {
        if (polls) {
            const p = polls.filter(poll => poll.pk === Number(uid))[0];
            setPoll(p);
        }

        if (!options || options[0].pk !== uid){
            pollOptions(uid)
        }

    }, [uid, polls, options, pollOptions]);

    const classes = useStyles();

    return (
        <Card className={classes.root}>
            <CardContent>
                <Typography noWrap variant="h5" component="h2">
                    {poll.fields.name}
                </Typography>
                <Typography noWrap className={classes.pos} color="textSecondary">
                    {poll.fields.description}
                </Typography>

                <Typography className={classes.title} color="textSecondary" gutterBottom>
                    <b>Deadline:</b> <br /> {poll.fields.deadline}
                </Typography>
                <Typography className={classes.title} color="textSecondary" gutterBottom>
                    <b>Voto Secreto: </b> {poll.fields.secret_vote ? 'Sim' : 'Não'}
                </Typography>

                <Typography className={classes.title} color="textSecondary" gutterBottom>
                    <b>Opções: </b>
                </Typography>

                {!options ? null : options.map((row, index) => (
                    <Typography className={classes.title} color="textSecondary" gutterBottom key={index}>
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
    options: state.ui.options
}), { pollOptions })(Poll);
