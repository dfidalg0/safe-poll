import { Button } from '@material-ui/core';

import Display from '../components/display';
import CreatePoll from '../components/create-poll';

import classes from '../styles/home.module.css';

import { connect } from 'react-redux';
import { logout } from '../store/actions/auth';

import { useState } from 'react';

/**
 * @param {{
 *   logout: () => ReturnType<typeof logout>
 * }}
 */
function Dashboard({ logout }){
    const [createOpen, setCreateOpen] = useState(false);

    return (
        <div className={classes.app}>
            <header className={classes.header}>
                <Display />
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
            </header>
        </div>
    );
}

export default connect(
    null,
    { logout }
)(Dashboard);
