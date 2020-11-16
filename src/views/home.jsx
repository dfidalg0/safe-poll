import classes from '../styles/home.module.css';
import { Button } from '@material-ui/core';
import Display from '../components/display';
import { connect } from 'react-redux'
import { checkAuthenticated, load_user, logout } from '../store/actions/auth'
import { useState, useEffect } from 'react';
import LoginSignUp from '../components/loginSignUp'
import CreatePoll from '../components/create-poll';

function Home({ checkAuthenticated, load_user, logout, isAuthenticated }) {
    const [createOpen, setCreateOpen] = useState(false);

    useEffect(() => {
        checkAuthenticated();
        load_user();
    }, [checkAuthenticated, load_user]);

    function notAuthenticatedButtons() {
        return (
           <LoginSignUp />
        );
    };

    function authenticatedButtons() {
        return (
            <>
                <CreatePoll open={createOpen} onClose={() => setCreateOpen(false)}/>
                <Button
                    variant="contained"
                    size="large"
                    className={classes.button}
                    onClick={() => setCreateOpen(true)}
                    style={{marginBottom: '40px'}}
                >
                    Criar
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
    isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps, { checkAuthenticated, load_user, logout })(Home);
