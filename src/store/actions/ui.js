import { SET_LOADING } from './types';

/**
 * @param {boolean} loading
 */
export const setLoading = loading => ({
    type: SET_LOADING,
    payload: { loading }
});
