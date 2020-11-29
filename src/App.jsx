import {
    BrowserRouter as Router,
    Switch
} from 'react-router-dom';

import ConditionRoute from '@/components/condition-route';

import Home from '@/views/home';
import ResetPassword from '@/views/resetPassword';
import ResetPasswordConfirm from '@/views/resetPasswordConfirm';
import Dashboard from '@/views/manage';

import LoadingScreen from '@/components/loading-screen';

import { connect } from 'react-redux';
import { checkAuthenticated } from '@/store/actions/auth';
import { fetchUserGroups } from '@/store/actions/ui';

import { useEffect } from 'react';

/**
 * @param {{
 *   loading: boolean;
 *   isAuthenticated: boolean;
 *   checkAuthenticated: () => ReturnType<ReturnType<typeof checkAuthenticated>>;
 *   fetchUserGroups: () => ReturnType<ReturnType<typeof fetchUserGroups>>;
 * }}
 */
function App({ loading, checkAuthenticated, isAuthenticated, fetchUserGroups }){
    useEffect(() => {
        checkAuthenticated();
    }, [checkAuthenticated]);

    useEffect(() => {
        if (isAuthenticated){
            fetchUserGroups();
        }
    }, [isAuthenticated, fetchUserGroups]);

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
            </Switch>
        </Router>
}


export default connect(
    state => ({
        loading: state.ui.loading,
        isAuthenticated: Boolean(state.auth.access)
    }),
    { checkAuthenticated, fetchUserGroups }
)(App);
