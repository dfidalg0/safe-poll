import {
    Grow as GrowTransition
} from '@material-ui/core';

import {
    BrowserRouter as Router,
    Switch,
    Route
} from 'react-router-dom';

import { useSnackbar } from 'notistack';

import ConditionRoute from '@/components/condition-route';

import Home from '@/views/home';
import ResetPassword from '@/views/resetPassword';
import ResetPasswordConfirm from '@/views/resetPasswordConfirm';
import Dashboard from '@/views/manage';
import Vote from '@/views/voteForm';

import LoadingScreen from '@/components/loading-screen';

import { useSelector, useDispatch } from 'react-redux';
import { checkAuthenticated } from '@/store/actions/auth';
import { fetchUserGroups } from '@/store/actions/items';
import { clearNotify } from '@/store/actions/ui';

import { useEffect } from 'react';

export default function App(){
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(checkAuthenticated());
    }, [dispatch]);

    const isAuthenticated = useSelector(state => Boolean(state.auth.access));

    useEffect(() => {
        if (isAuthenticated){
            dispatch(fetchUserGroups());
        }
    }, [isAuthenticated, dispatch]);

    const { enqueueSnackbar } = useSnackbar();

    const notif = useSelector(state => state.ui.notification);

    useEffect(() => {
        if (notif){
            enqueueSnackbar(notif.msg, {
                variant: notif.variant,
                anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'center'
                },
                TransitionComponent: GrowTransition
            });
            dispatch(clearNotify());
        }
    }, [notif, enqueueSnackbar, dispatch]);

    const loading = useSelector(state => state.ui.loading);

    return loading ?
        <LoadingScreen /> :
        <Router>
            <Switch>
                {/* Nesse caso, não usamos o exact, pois essa rota servirá
                    para dar match em /manage/polls/*, /manage/groups/*, etc..
                    Como especificado em views/manage/index.jsx
                */}
                <ConditionRoute path="/manage"
                    component={Dashboard}
                    condition={isAuthenticated}
                    redirect="/"
                />
                <ConditionRoute exact path="/"
                    component={Home}
                    condition={!isAuthenticated}
                    redirect="/manage"
                />
                <ConditionRoute exact path="/resetar-senha"
                    component={ResetPassword}
                    condition={!isAuthenticated}
                    redirect="/manage"
                />
                <ConditionRoute exact path="/password/reset/confirm/:uid/:token"
                    component={ResetPasswordConfirm}
                    condition={!isAuthenticated}
                    redirect="/manage"
                />
                <Route exact path='/polls/vote/:x/:y'
                    component={Vote}
                />
            </Switch>
        </Router>
}
