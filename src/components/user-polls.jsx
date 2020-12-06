import { useState, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    Paper, Grid, Typography,
    Button, Tooltip, IconButton,
    TablePagination
} from '@material-ui/core';

import {
    Add as AddIcon,
    InfoOutlined as InfoIcon
} from '@material-ui/icons';

import CreatePoll from '@/components/create-poll';

import { Link } from "react-router-dom";

import { fetchUserPolls } from '@/store/actions/items';
import { useSelector, useDispatch } from 'react-redux';

import { useTheme, useMediaQuery } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '90%',
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
    },
    createButton: {
        marginBottom: '10pt',
        marginRight: '20pt'
    },
    tooltip: {
        maxWidth: 'min(60vw, 400px)'
    }
}));


export default function UserPolls() {
    const classes = useStyles();

    const [page, setPage] = useState(0);

    const rowsPerPage = 9;

    const [createOpen, setCreateOpen] = useState(false);

    const handleChangePage = useCallback((_, newPage) => {
        setPage(newPage);
    }, []);

    const polls = useSelector(state => state.items.polls);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!polls) {
            dispatch(fetchUserPolls());
        }
    }, [polls, dispatch]);

    const [tooltip, setTooltip] = useState(0);

    const theme = useTheme();

    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

    const FormRow = useCallback(({ poll }) => {
        const deadline = new Date(poll.deadline);

        const twoDaysLeft = Number(deadline) - Date.now() < 2 * 24 * 3600 * 1000;

        const showDesc = !isDesktop ? tooltip === poll.id : undefined;

        return (
            <>
                <Grid item xs={5} sm={6} >
                    <Typography noWrap className={classes.paper}>
                        <Link to={'/manage/polls/' + poll.id}
                            className={classes.link}
                        >
                            {poll.title}
                        </Link>
                    </Typography>
                </Grid>
                <Grid item xs={1}>
                    <Tooltip title={poll.description} placement="left"
                        arrow className={classes.tooltip}
                        open={showDesc}
                    >
                        <IconButton onClick={() => setTooltip(showDesc ? 0 : poll.id)}>
                            <InfoIcon />
                        </IconButton>
                    </Tooltip>
                </Grid>
                <Grid item xs={6} sm={5} >
                    <Typography className={classes.paper} style={{
                        color: twoDaysLeft ? 'red' : undefined
                    }}>
                        {deadline.toLocaleDateString()}
                    </Typography>

                </Grid>
            </>
        );
    }, [classes, tooltip, isDesktop]);

    return <>
        <CreatePoll open={createOpen} onClose={() => setCreateOpen(false)} />
        <Typography variant="h6" style={{ color: '#b0b3b2' }}>
            Minhas Eleições
        </Typography>
        <div className={classes.root}>
            <Grid container spacing={0} style={{ backgroundColor: 'lightgray' }}>
                <Grid container item xs={12} spacing={0}>
                    <>
                        <Grid item xs={7}>
                            <Paper className={classes.tableHead}>Título</Paper>
                        </Grid>
                        <Grid item xs={5}>
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

                <Grid container justify="flex-end">
                    <Button onClick={() => setCreateOpen(true)}
                        className={classes.createButton}
                        endIcon={<AddIcon />}
                    >
                        Criar
                    </Button>
                </Grid>

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
    </>;
}