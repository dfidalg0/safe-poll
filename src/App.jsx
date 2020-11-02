import {
    BrowserRouter as Router,
    Route,
    Switch
} from 'react-router-dom';

import Home from './views/home';
import ResetPassword from './views/resetPassword';
import ResetPasswordConfirm from './views/resetPasswordConfirm';

import { Provider } from 'react-redux';
import store from './store';

const App = () =>
    <Provider store={store}>
        <Router>
            <Switch>
                <Route path="/" exact component={Home} />
                <Route exact path="/resetar-senha" component={ResetPassword} />
                <Route exact path="/password/reset/confirm/:uid/:token" component={ResetPasswordConfirm} />
            </Switch>
        </Router>
    </Provider>

export default App;
