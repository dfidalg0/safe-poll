import React, { useEffect } from 'react';
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
    const [page, setPage] = React.useState(0);
    const rowsPerPage = 10;

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

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
            <Grid container spacing={0} style={{ backgroundColor: 'lightgray' }}>
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
                {!polls ? null : polls.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <Grid container item xs={12} spacing={0} key={index}>
                        <FormRow poll={row} />
                    </Grid>
                ))}

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


