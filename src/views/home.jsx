import classes from '../styles/home.module.css';
import { Button } from '@material-ui/core';
import Display from '../components/display';
import { connect } from 'react-redux'
import { checkAuthenticated, load_user } from '../actions/auth'
import { useEffect } from 'react';
import { logout } from '../actions/auth'
import LoginSignUp from '../components/loginSignUp'


function Home({ checkAuthenticated, load_user, logout, isAuthenticated }) {
    useEffect(() => {
        checkAuthenticated();
        load_user();
    });

    function notAuthenticatedButtons() {
        return (
           <LoginSignUp />
        );
    };

    function authenticatedButtons() {
        return (
            <Button
                variant="contained"
                size="large"
                className={classes.button}
                onClick={logout}
            >
                Logout
            </Button>
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
            <body className={classes.header}>
                
            </body>

        </div >
    );
};

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps, { checkAuthenticated, load_user, logout })(Home);
