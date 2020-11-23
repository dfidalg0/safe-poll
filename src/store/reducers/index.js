import { combineReducers } from 'redux';

// Redutores base
import auth from './auth';
import ui from './ui';

export default combineReducers({
    auth, ui
});
