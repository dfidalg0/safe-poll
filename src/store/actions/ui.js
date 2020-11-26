import {
    SET_LOADING, SET_POLLS, PUSH_POLL,
    SET_OPTIONS, SET_GROUPS, PUSH_GROUP,
    DELETE_POLL
} from './types';
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

export const setGroups = (groups) => ({
    type: SET_GROUPS,
    groups
});

export const setOptions = (options) => ({
    type: SET_OPTIONS,
    options
});

export const pushPoll = (poll) => ({
    type: PUSH_POLL,
    poll
})

export const pushGrup = (group) => ({
    type: PUSH_GROUP,
    group
})

export const deletePoll = (poll_id) => ({
    type: DELETE_POLL,
    poll_id
})

export const fetchUserPolls = () => async (dispatch, getState) => {
    var state = getState();
    const token = state.auth.access;
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

export const pollOptions = (id) => async (dispatch) => {
    try {
        const res = await axios.get('/api/polls/options/' + id + '/');

        dispatch(setOptions(res.data.options));
    }
    catch ({ response: { data } }) {
        alert('Erro: ' + data.message);
    }
};

export const userGroups = () => async (dispatch, getState) => {
    var state = getState();
    const token = state.auth.access;
    try {
        const res = await axios.get('/api/groups/mine', {
            headers: {
                Authorization: `JWT ${token}`
            }
        });

        dispatch(setGroups(res.data.groups));
    }
    catch ({ response: { data } }) {
        alert('Erro: ' + data.message);
    }
};

