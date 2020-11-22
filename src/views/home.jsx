import classes from '../styles/home.module.css';
import { Button } from '@material-ui/core';
import Display from '../components/display';
import { connect } from 'react-redux'
import { logout } from '../store/actions/auth'
import { useState } from 'react';
import LoginSignUp from '../components/loginSignUp'
import CreatePoll from '../components/create-poll';

function Home({ logout, isAuthenticated }) {
    const [createOpen, setCreateOpen] = useState(false);

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
    isAuthenticated: Boolean(state.auth.access)
});

export default connect(mapStateToProps, { logout })(Home);
