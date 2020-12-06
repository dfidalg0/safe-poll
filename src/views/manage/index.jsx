import {
    AppBar, Toolbar, Typography, Button, Grid
} from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';

import { useDispatch, useSelector } from 'react-redux';

import { fetchUserGroups } from '@/store/actions/items'
import { logout } from '@/store/actions/auth';

import {
    Route,
    Switch,
    Link
} from "react-router-dom";

import Dashboard from './dashboard';
import EmailsGroup from './emailsGroup';
import Poll from './poll';
import Group from './group';

import { useEffect } from 'react';
import { useRouteMatch, useLocation } from 'react-router-dom'

const useStyles = makeStyles({
    app: {
        textAlign: 'center'
    },
    header: {
        backgroundColor: "#282c34",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "calc(10px + 2vmin)",
        color: "white"
    },
    appBar: {
        backgroundColor: '#0b1016',
        width: '100vw'
    },
    logo: {
        textDecoration: 'none',
        color: 'white',
        flexGrow: 1
    },
    button: {
        color: 'white'
    },
    panel: {
        margin: '30pt 0px 30pt 0px',
    }
});

export default function Main(){
    const classes = useStyles();

    const dispatch = useDispatch();

    const groups = useSelector(state => state.items.groups);

    useEffect(() => {
        if (!groups) {
            dispatch(fetchUserGroups());
        }

    }, [groups, dispatch]);

    const { url } = useRouteMatch();
    const { pathname: path } = useLocation();

    return <>
        <AppBar className={classes.appBar} position="sticky">
            <Toolbar>
                <Link to={url} className={classes.logo}
                    onClick={e => path === url ? e.preventDefault() : null}
                >
                    <Typography variant="h6">
                        SafePoll
                    </Typography>
                </Link>
                <Button
                    className={classes.button}
                    onClick={() => dispatch(logout())}
                >
                    Sair
                </Button>
            </Toolbar>
        </AppBar>
        <Grid container justify="center"
            className={classes.panel}
        >
            <Switch>
                <Route exact path={url}
                    component={Dashboard}
                />
                <Route exact path={`${url}/groups/new`}
                    component={EmailsGroup}
                />
                <Route exact path={`${url}/polls/:uid`}
                    component={Poll}
                />
                <Route exact path={`${url}/groups/:uid`}
                    component={Group}
                />
            </Switch>
        </Grid>
    </>;
}
