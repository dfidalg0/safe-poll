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
    PASSWORD_RESET_CONFIRM_FAIL,
    PASSWORD_RESET_CONFIRM_SUCESS,
    PASSWORD_RESET_FAIL,
    PASSWORD_RESET_SUCESS
} from './types';

import axios from 'axios';


export const signup = (name, email, password, re_password) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const body = JSON.stringify({ name, email, password, re_password });

    try {
        const res = await axios.post('/auth/users/', body, config);
        dispatch({
            type: SIGNUP_SUCESS,
            payload: res.data
        })

        dispatch(login(email, password));
        dispatch(load_user());

    } catch (err) {
        dispatch({
            type: SIGNUP_FAIL,
            payload: err.response.data
        })
    }
};

export const checkAuthenticated = () => async dispatch => {
    if (localStorage.getItem('access')) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        const body = JSON.stringify({ token: localStorage.getItem('access') });

        try {
            const res = await axios.post('/auth/jwt/verify/', body, config)
            if (res.data.code !== 'token_not_valid') {
                dispatch({
                    type: AUTHENTICATED_SUCCESS
                });
            } else {
                dispatch({
                    type: AUTHENTICATED_FAIL
                });
            }
        } catch (err) {
            dispatch({
                type: AUTHENTICATED_FAIL,
                payload: err.response.data
            });
        }

    } else {
        dispatch({
            type: AUTHENTICATED_FAIL
        });
    }
};

export const load_user = () => async dispatch => {
    if (localStorage.getItem('access')) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `JWT ${localStorage.getItem('access')}`,
                'Accept': 'application/json'
            }
        };
        try {
            const res = await axios.get('/auth/users/me/', config);
            dispatch({
                type: USER_LOADED_SUCESS,
                payload: res.data
            });
        } catch (err) {
            dispatch({
                type: USER_LOADED_FAIL,
                payload: err.response.data
            });
        }
    } else {
        dispatch({
            type: USER_LOADED_FAIL
        });
    }
};

export const login = (email, password) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const body = JSON.stringify({ email, password });

    try {
        const res = await axios.post('/auth/jwt/create/', body, config);
        dispatch({
            type: LOGIN_SUCESS,
            payload: res.data
        })

        dispatch(load_user());

    } catch (err) {
        dispatch({
            type: LOGIN_FAIL,
            payload: err.response.data
        })
    }
};

export const reset_password = (email) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const body = JSON.stringify({ email });

    try {
        await axios.post('/auth/users/reset_password/', body, config);
        dispatch({
            type: PASSWORD_RESET_SUCESS
        });
    } catch (err) {
        dispatch({
            type: PASSWORD_RESET_FAIL,
            payload: err.response.data
        });
    }
}

export const reset_password_confirm = (uid, token, new_password, re_new_password) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const body = JSON.stringify({ uid, token, new_password, re_new_password });

    try {
        await axios.post('/auth/users/reset_password_confirm/', body, config);
        dispatch({
            type: PASSWORD_RESET_CONFIRM_SUCESS
        });
    } catch (err) {
        let payload_response
        if(err.response.token !== undefined){
            payload_response = err.response.data.concat(err.response.token)
        } else {
            payload_response = err.response.data
        }
        dispatch({
            type: PASSWORD_RESET_CONFIRM_FAIL,
            payload: payload_response
        });
    }
}

export const logout = () => dispatch => {
    dispatch({
        type: LOGOUT
    });
};