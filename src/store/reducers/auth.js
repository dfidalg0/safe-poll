import {
    LOGIN_SUCESS,
    LOGIN_FAIL,
    USER_LOADED_SUCESS,
    USER_LOADED_FAIL,
    AUTHENTICATED_SUCCESS,
    AUTHENTICATED_FAIL,
    LOGOUT,
    SIGNUP_SUCESS,
    SIGNUP_FAIL,
    PASSWORD_RESET_FAIL,
    PASSWORD_RESET_SUCESS,
    PASSWORD_RESET_CONFIRM_SUCESS,
    PASSWORD_RESET_CONFIRM_FAIL
} from '../actions/types';

const initialState = {
    access: localStorage.getItem('access'),
    refresh: localStorage.getItem('refresh'),
    isAuthenticated: null,
    user: null
};

export default function rootReducer(state = initialState, action) {
    const { type, payload } = action;

    switch (type) {

        case SIGNUP_SUCESS:
            return {
                ...state,
                isAuthenticated: false
            }

        case AUTHENTICATED_SUCCESS:
            return {
                ...state,
                isAuthenticated: true
            }

        case AUTHENTICATED_FAIL:
            return {
                ...state,
                isAuthenticated: false
            }

        case LOGIN_SUCESS:
            localStorage.setItem('access', payload.access)
            return {
                ...state,
                isAuthenticated: true,
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
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            return {
                ...state,
                access: null,
                refresh: null,
                isAuthenticated: false,
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
