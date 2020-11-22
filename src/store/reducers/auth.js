import {
    LOGIN_SUCESS,
    LOGIN_FAIL,
    USER_LOADED_SUCESS,
    USER_LOADED_FAIL,
    SET_ACCESS_TOKEN,
    LOGOUT,
    SIGNUP_FAIL,
    PASSWORD_RESET_FAIL,
    PASSWORD_RESET_SUCESS,
    PASSWORD_RESET_CONFIRM_SUCESS,
    PASSWORD_RESET_CONFIRM_FAIL
} from '../actions/types';

const initialState = {
    access: null,
    refresh: localStorage.getItem('refresh'),
    user: null,
    error: null
};

export default function rootReducer(state = initialState, { type, payload }) {
    switch (type) {

        case SET_ACCESS_TOKEN:
            return {
                ...state,
                access: payload.access
            }

        case LOGIN_SUCESS:
            localStorage.setItem('refresh', payload.refresh);
            return {
                ...state,
                access: payload.access,
                refresh: payload.refresh
            }

        case USER_LOADED_SUCESS:
            return {
                ...state,
                user: payload
            }

        case USER_LOADED_FAIL:
            return {
                ...state,
                user: null
            }

        case SIGNUP_FAIL:
        case LOGIN_FAIL:
        case LOGOUT:
            localStorage.removeItem('refresh');
            return {
                ...state,
                access: null,
                refresh: null,
                user: null,
                error: payload,
            }

        case PASSWORD_RESET_FAIL:
        case PASSWORD_RESET_SUCESS:
        case PASSWORD_RESET_CONFIRM_SUCESS:
        case PASSWORD_RESET_CONFIRM_FAIL:
            return {
                ...state,
                error: payload
            }
        default:
            return state
    }
}
