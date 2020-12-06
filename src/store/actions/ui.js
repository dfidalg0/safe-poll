import {
    SET_LOADING,
    SET_NOTIFICATION,
    CLEAR_NOTIFICATION
} from './types';

/**
 * @param {boolean} loading
 */
export const setLoading = loading => ({
    type: SET_LOADING,
    payload: { loading }
});

/**
 * @param {string} msg
 * @param {'error' | 'success' | 'info' | 'warning'} variant
 */
export const notify = (msg, variant = 'info') => ({
    type: SET_NOTIFICATION,
    payload: {
        msg, variant
    }
});

export const clearNotify = () => ({
    type: CLEAR_NOTIFICATION
});
