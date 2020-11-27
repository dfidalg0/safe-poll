import {
    BrowserRouter as Router,
    Switch
} from 'react-router-dom';

import ConditionRoute from './components/condition-route';

import Home from './views/home';
import ResetPassword from './views/resetPassword';
import ResetPasswordConfirm from './views/resetPasswordConfirm';
import Dashboard from './views/dashboard';

import LoadingScreen from './components/loading-screen';

import { connect } from 'react-redux';
import { checkAuthenticated } from './store/actions/auth';

import { useEffect } from 'react';

/**
 * @param {{
 *   loading: boolean;
 *   isAuthenticated: boolean;
 *   checkAuthenticated: () => ReturnType<ReturnType<typeof checkAuthenticated>>
 * }}
 */
function App({ loading, checkAuthenticated, isAuthenticated }){
    useEffect(() => {
        checkAuthenticated();
    }, [checkAuthenticated]);

    return loading ?
        <LoadingScreen /> :
        <Router>
            <Switch>
                <ConditionRoute exact path="/"
                    component={Home}
                    condition={!isAuthenticated}
                    redirect="/dashboard"
                />
                <ConditionRoute exact path="/dashboard"
                    component={Dashboard}
                    condition={isAuthenticated}
                    redirect="/"
                />
                <ConditionRoute exact path="/resetar-senha"
                    component={ResetPassword}
                    condition={!isAuthenticated}
                    redirect="/dashboard"
                />
                <ConditionRoute exact path="/password/reset/confirm/:uid/:token"
                    component={ResetPasswordConfirm}
                    condition={!isAuthenticated}
                    redirect="/dashboard"
                />
            </Switch>
        </Router>
}


export default connect(
    state => ({
        loading: state.ui.loading,
        isAuthenticated: Boolean(state.auth.access)
    }),
    { checkAuthenticated }
)(App);
