import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid'; import { fetchUserPolls } from '../store/actions/ui';
import { connect } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
    root: {
        width: '70%',
        height: '50%',
        overflowY: 'scroll',
        overflowX: 'hidden',
        marginBottom: '30px',
        fontSize: '12pt',
        backgroundColor: '#D3D3D3'
    },
    paper: {
        padding: theme.spacing(1.5),
        textAlign: 'center',
        color: 'black',
        borderRadius: 0,
        backgroundColor: '#D3D3D3',
    },
    tableHead: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: 'black',
        backgroundColor: '#808080',
        borderRadius: 0
    },
    link: {
        color: 'black',
    }
}));


function UserPolls({ fetchUserPolls, polls }) {

    const classes = useStyles();

    useEffect(() => {
        if (!polls) {
            fetchUserPolls();
        }
    }, [polls, fetchUserPolls]);

    function FormRow(poll) {
        return (
            <React.Fragment>
                <Grid item xs={5} >
                    <Typography noWrap className={classes.paper}><Link to={'/polls/mine/'+ poll.poll.pk} className={classes.link}>{poll.poll.fields.name}</Link></Typography>
                </Grid>

                <Grid item xs={5}>
                    <Typography noWrap className={classes.paper}>{poll.poll.fields.description}</Typography>

                </Grid>
                <Grid item xs={2} >
                    <Typography className={classes.paper}>{poll.poll.fields.deadline}</Typography>

                </Grid>
            </React.Fragment>
        );
    }

    return (
        <div className={classes.root}>
            <Grid container spacing={0.5}>
                <Grid container item xs={12} spacing={0}>
                    <React.Fragment>
                        <Grid item xs={5}>
                            <Paper className={classes.tableHead}>Título</Paper>
                        </Grid>
                        <Grid item xs={5}>
                            <Paper className={classes.tableHead}>Descrição</Paper>
                        </Grid>
                        <Grid item xs={2}>
                            <Paper className={classes.tableHead}>Deadline</Paper>
                        </Grid>

                    </React.Fragment>
                </Grid>
                {!polls ? null : polls.map((row) => (
                    <Grid container item xs={12} spacing={0}>
                        <FormRow poll={row} />
                    </Grid>
                ))}
            </Grid>
        </div>
    );
}


export default connect(state => ({
    polls: state.ui.polls
}), { fetchUserPolls })(UserPolls);


