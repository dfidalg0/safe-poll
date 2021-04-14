import {
  SET_ACCESS_TOKEN,
  LOGIN_SUCESS,
  LOGIN_FAIL,
  USER_LOADED_SUCESS,
  USER_LOADED_FAIL,
  LOGOUT,
  SIGNUP_FAIL,
  PASSWORD_RESET_CONFIRM_FAIL,
  PASSWORD_RESET_CONFIRM_SUCESS,
  PASSWORD_RESET_FAIL,
  PASSWORD_RESET_SUCESS,
} from './types';

import axios from 'axios';

import { decode } from 'jsonwebtoken';

import { setLoading } from '../actions/ui';
import { clearPolls } from '../actions/items';

let refreshTimeout;

export const refreshJWT = (timeout) => (dispatch, getState) => {
  refreshTimeout = setTimeout(async () => {
    const { refresh } = getState().auth;

    try {
      const {
        data: { access },
      } = await axios.post('/auth/jwt/refresh/', {
        refresh,
      });

      dispatch({
        type: SET_ACCESS_TOKEN,
        payload: { access },
      });

      const { exp } = decode(access);

      dispatch(refreshJWT(exp - Math.floor(Date.now() / 1000) - 5 * 60));
    } catch (err) {
      console.error(err);
      dispatch(refreshJWT(30));
    }
  }, timeout * 1000);
};

export const signup = (name, email, password, re_password) => async (
  dispatch
) => {
  const body = { name, email, password, re_password };

  try {
    const res = await axios.post('/auth/users/', body);
    dispatch(login(email, password));
    await dispatch(load_user(res.data.access));
  } catch (err) {
    dispatch({
      type: SIGNUP_FAIL,
      payload: {
        signUp: err.response?.data,
      },
    });
  }
};

export const checkAuthenticated = () => async (dispatch, getState) => {
  const { refresh } = getState().auth;

  if (refresh) {
    const body = { refresh };

    try {
      dispatch(setLoading(true));
      const {
        data: { access },
      } = await axios.post('/auth/jwt/refresh/', body);
      dispatch({
        type: SET_ACCESS_TOKEN,
        payload: { access },
      });
      await dispatch(load_user(access));
    } catch (err) {
      console.error(err.response.data.detail);
    }
  }

  dispatch(setLoading(false));
};

export const load_user = (access) => async (dispatch) => {
  const { exp } = decode(access);

  dispatch(refreshJWT(exp - Math.floor(Date.now() / 1000) - 5 * 60));

  const config = {
    headers: {
      Authorization: `JWT ${access}`,
      Accept: 'application/json',
    },
  };
  try {
    const res = await axios.get('/auth/users/me/', config);
    dispatch({
      type: USER_LOADED_SUCESS,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: USER_LOADED_FAIL,
      payload: err.response.data,
    });
  }
};

export const login = (email, password) => async (dispatch) => {
  const body = { email, password };

  try {
    dispatch(setLoading(true));
    const res = await axios.post('/auth/jwt/create/', body);

    dispatch({
      type: LOGIN_SUCESS,
      payload: res.data,
    });

    await dispatch(load_user(res.data.access));
  } catch (err) {
    dispatch({
      type: LOGIN_FAIL,
      payload: {
        login: err.response.data,
      },
    });
  } finally {
    dispatch(setLoading(false));
  }
};

export const googleLogin = googleUser => async dispatch => {
  const { id_token: token } = googleUser.getAuthResponse();

  try {
    dispatch(setLoading(true));
    const res = await axios.post('/auth/google', { token });

    dispatch({
      type: LOGIN_SUCESS,
      payload: res.data,
    });

    await dispatch(load_user(res.data.access));
  }
  catch (err){
    dispatch({
      type: LOGIN_FAIL,
      payload: {
        login: err.response.data,
      },
    });
  }
  finally {
    dispatch(setLoading(false));
  }
}

export const reset_password = (email, locale) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const body = JSON.stringify({ email, language: locale });

  try {
    await axios.post('/api/users/reset_password', body, config);
    dispatch({
      type: PASSWORD_RESET_SUCESS,
    });
  } catch (err) {
    dispatch({
      type: PASSWORD_RESET_FAIL,
      payload: {
        resetPassword: err.response.data,
      },
    });
  }
};

export const reset_password_confirm = (
  uid,
  token,
  new_password,
  re_new_password,
  language
) => async (dispatch) => {
  const body = { uid, token, new_password, re_new_password, language };

  try {
    await axios.post('/api/users/reset_password_confirm', body);
    dispatch({
      type: PASSWORD_RESET_CONFIRM_SUCESS,
    });
  } catch (err) {
    let payload_response;
    if (err.response.token !== undefined) {
      payload_response = err.response.data.concat(err.response.token);
    } else {
      payload_response = err.response.data;
    }
    dispatch({
      type: PASSWORD_RESET_CONFIRM_FAIL,
      payload: payload_response,
    });
  }
};

export const logout = () => (dispatch) => {
  clearTimeout(refreshTimeout);

  dispatch(clearPolls());

  dispatch({
    type: LOGOUT,
  });
};
