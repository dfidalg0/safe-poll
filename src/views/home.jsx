import classes from '../styles/home.module.css';
import { Button } from '@material-ui/core';
import Display from '../components/display';
import { connect } from 'react-redux'
import { logout } from '../store/actions/auth'
import { userGroups } from '../store/actions/ui'
import { useState, useEffect } from 'react';
import LoginSignUp from '../components/loginSignUp'
import CreatePoll from '../components/create-poll';
import UserPolls from '../components/user-polls';


import { Link } from "react-router-dom";

function Home({ logout, isAuthenticated, userGroups, groups }) {
    const [createOpen, setCreateOpen] = useState(false);

    useEffect(() => {
        if (isAuthenticated && !groups) {
            userGroups();
        }

    }, [groups, userGroups, isAuthenticated]);

    function notAuthenticatedButtons() {
        return (
            <LoginSignUp />
        );
    };
    
    function authenticatedButtons() {
    
        return (
            <>
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

            </>
        );
    }

    const displayButtons = () => {
        if (isAuthenticated) {
            return authenticatedButtons();
        } else {
            return notAuthenticatedButtons();
        }
    }

    return (
        <div className={classes.app}>
            <header className={classes.header}>
                <Display />
                {displayButtons()}
            </header>
        </div >
    );
};

const mapStateToProps = state => ({
    isAuthenticated: Boolean(state.auth.access)
});

export default connect(mapStateToProps, { logout, userGroups })(Home);
