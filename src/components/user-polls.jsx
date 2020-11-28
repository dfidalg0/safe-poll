import { useState, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Grid, Typography } from '@material-ui/core';

import TablePagination from '@material-ui/core/TablePagination';
import { fetchUserPolls } from '../store/actions/ui';
import { connect } from 'react-redux';

import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
    root: {
        width: '80%',
        overflowX: 'hidden',
        marginBottom: '30px',
        fontSize: '12pt',
        backgroundColor: 'white',
        borderRadius: 10,
    },
    paper: {
        padding: theme.spacing(1.5),
        textAlign: 'center',
        color: 'black',
        borderRadius: 0,
        backgroundColor: 'lightgray',
    },
    tableHead: {
        padding: theme.spacing(2),
        marginBottom: 2,
        textAlign: 'center',
        color: 'black',
        backgroundColor: 'lightslategray',
        borderRadius: 0
    },
    link: {
        color: 'black',
    }
}));


function UserPolls({ fetchUserPolls, polls }) {
    const classes = useStyles();

    const [page, setPage] = useState(0);

    const rowsPerPage = 9;

    const handleChangePage = useCallback((_, newPage) => {
        setPage(newPage);
    }, []);

    useEffect(() => {
        if (!polls) {
            fetchUserPolls();
        }
    }, [polls, fetchUserPolls]);

    const FormRow = useCallback(({ poll }) => {
        return (
            <>
                <Grid item xs={5} >
                    <Typography noWrap className={classes.paper}>
                        <Link to={'/polls/mine/' + poll.id}
                            className={classes.link}
                        >
                            {poll.title}
                        </Link>
                    </Typography>
                </Grid>
                <Grid item xs={5}>
                    <Typography noWrap className={classes.paper}>
                        {poll.description}
                    </Typography>

                </Grid>
                <Grid item xs={2} >
                    <Typography className={classes.paper}>
                        {new Date(poll.deadline).toLocaleDateString()}
                    </Typography>

                </Grid>
            </>
        );
    }, [classes]);

    return (
        <div className={classes.root}>
            <Grid container spacing={0} style={{ backgroundColor: 'lightgray' }}>
                <Grid container item xs={12} spacing={0}>
                    <>
                        <Grid item xs={5}>
                            <Paper className={classes.tableHead}>Título</Paper>
                        </Grid>
                        <Grid item xs={5}>
                            <Paper className={classes.tableHead}>Descrição</Paper>
                        </Grid>
                        <Grid item xs={2}>
                            <Paper className={classes.tableHead}>Deadline</Paper>
                        </Grid>

                    </>
                </Grid>
                {!polls || polls.length === 0 ?
                    <Grid container style={{width: '100%', padding: 20}}>
                        <Typography style={{
                            textAlign: 'center',
                            color: 'black',
                            width: '100%'
                        }}>
                            Nenhuma eleição cadastrada!
                        </Typography>
                    </Grid> :
                    polls.slice(
                        page * rowsPerPage, page * rowsPerPage + rowsPerPage
                    ).map((poll, index) => (
                        <Grid container item xs={12} spacing={0} key={index}>
                            <FormRow poll={poll} />
                        </Grid>
                    ))
                }

                <TablePagination style={{ textAlign: 'center', background: 'lightslategray', width: '100%' }}
                    component="div"
                    labelRowsPerPage=''
                    count={polls ? polls.length : 0}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onChangePage={handleChangePage}
                    rowsPerPageOptions={[]}
                />
            </Grid>
        </div>
    );
}

export default connect(state => ({
    polls: state.ui.polls
}), { fetchUserPolls })(UserPolls);
