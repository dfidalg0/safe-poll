import {
    BrowserRouter as Router,
    Route,
    Switch
} from 'react-router-dom';

import Home from './views/home';
import ResetPassword from './views/resetPassword';
import ResetPasswordConfirm from './views/resetPasswordConfirm';

import LoadingScreen from './components/loading-screen';

import { connect } from 'react-redux';
import { checkAuthenticated } from './store/actions/auth';

import { useEffect } from 'react';

function App({ loading, checkAuthenticated }){
    useEffect(() => {
        checkAuthenticated();
    }, [checkAuthenticated]);

    return loading ?
        <LoadingScreen /> :
        <Router>
            <Switch>
                <Route path="/" exact component={Home} />
                <Route exact path="/resetar-senha" component={ResetPassword} />
                <Route exact path="/password/reset/confirm/:uid/:token" component={ResetPasswordConfirm} />
            </Switch>
        </Router>
}


export default connect(
    state => ({
        loading: state.ui.loading
    }),
    { checkAuthenticated }
)(App);
