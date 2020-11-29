import classes from '@/styles/home.module.css';

import { connect } from 'react-redux';
import { fetchUserGroups } from '@/store/actions/ui'

import {
    Route,
    Switch
} from "react-router-dom";

import EmailsGroup from './emailsGroup';
import Poll from './poll';
import Dashboard from './dashboard';

import { useEffect } from 'react';
import { useRouteMatch } from 'react-router-dom'

/**
 * @param {{
 *   logout: () => ReturnType<typeof logout>
 *   fetchUserGroups: () => ReturnType<ReturnType<typeof fetchUserGroups>>
 * }}
 */
function Main({ fetchUserGroups, groups }){
    useEffect(() => {
        if (!groups) {
            fetchUserGroups();
        }

    }, [groups, fetchUserGroups]);

    const { url } = useRouteMatch();

    return <div className={classes.app}>
        <header className={classes.header}>
            <Switch>
                <Route exact path={url}
                    component={Dashboard}
                />
                <Route exact path={`${url}/group/new`}
                    component={EmailsGroup}
                />
                <Route exact path={`${url}/polls/:uid`}
                    component={Poll}
                />
            </Switch>
        </header>
    </div >;
}


export default connect(
    null,
    { fetchUserGroups }
)(Main);
