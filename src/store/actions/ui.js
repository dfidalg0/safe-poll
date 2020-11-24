import { SET_LOADING, SET_POLLS, PUSH_POLL } from './types';
import axios from 'axios';

/**
 * @param {boolean} loading
 */
export const setLoading = loading => ({
    type: SET_LOADING,
    payload: { loading }
});

export const setPolls = (polls) => ({
    type: SET_POLLS,
    polls
});

export const pushPoll = (poll) => ({
    type: PUSH_POLL,
    poll
})

export const fetchUserPolls = () => async (dispatch, getState) => {
    var state = getState();
    const token = state.auth.access;
    console.log(token);
    try {
        const res = await axios.get('/api/polls/mine', {
            headers: {
                Authorization: `JWT ${token}`
            }
        });

        dispatch(setPolls(res.data.polls));
    }
    catch ({ response: { data } }) {
        alert('Erro: ' + data.message);
    }
};

