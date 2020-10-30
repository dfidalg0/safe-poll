import {
    BrowserRouter as Router,
    Route,
    Switch
} from 'react-router-dom';

import Home from './views/home';

const App = () => <Router>
    <Switch>
        <Route path="/" exact component={Home} />
    </Switch>
</Router>

export default App;
