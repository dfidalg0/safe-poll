import { Button } from '@material-ui/core';

import CreatePoll from '../components/create-poll';
import UserPolls from '../components/user-polls';

import classes from '../styles/home.module.css';

import { connect } from 'react-redux';
import { logout } from '../store/actions/auth';
import { userGroups } from '../store/actions/ui'

import { Link } from "react-router-dom";

import { useState, useEffect } from 'react';

/**
 * @param {{
 *   logout: () => ReturnType<typeof logout>
 *   userGroups: () => ReturnType<ReturnType<typeof userGroups>>
 * }}
 */
function Dashboard({ logout, userGroups, groups }){
    const [createOpen, setCreateOpen] = useState(false);

    useEffect(() => {
        if (!groups) {
            userGroups();
        }

    }, [groups, userGroups]);

    return (
        <div className={classes.app}>
            <header className={classes.header}>
                <UserPolls />
                <CreatePoll open={createOpen} onClose={() => setCreateOpen(false)} />
                <Button
                    variant="contained"
                    size="large"
                    className={classes.button}
                    onClick={() => setCreateOpen(true)}
                    style={{ marginBottom: '40px' }}
                >
                    Criar
                </Button>
                <Button
                    component={Link} to="/group/new"
                    variant="contained"
                    size="large"
                    style={{ marginBottom: '40px' }}
                >
                    Novo Grupo
                </Button>
                <Button
                    variant="contained"
                    size="large"
                    className={classes.button}
                    onClick={logout}
                >
                    Logout
                </Button>
            </header>
        </div >
    );
}


export default connect(
    null,
    { logout, userGroups }
)(Dashboard);
