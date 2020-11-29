import { Link } from 'react-router-dom';

import classes from '@/styles/home.module.css';

import { Button } from '@material-ui/core';

import CreatePoll from '@/components/create-poll';
import UserPolls from '@/components/user-polls';

import { useDispatch } from 'react-redux';
import { logout } from '@/store/actions/auth';

import { useState } from 'react';
import { useRouteMatch } from 'react-router-dom'

export default function Dashboard (){
    const dispatch = useDispatch();

    const { url } = useRouteMatch();

    const [createOpen, setCreateOpen] = useState(false);

    return <>
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
            component={Link} to={`${url}/group/new`}
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
            onClick={() => dispatch(logout())}
        >
            Logout
        </Button>
    </>
}
