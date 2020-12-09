import {
    SET_POLLS, PUSH_POLL,
    SET_OPTIONS, SET_GROUPS, PUSH_GROUP, DELETE_GROUP,
    DELETE_POLL, CLEAR_POLLS
} from './types';

import axios from 'axios';

import { notify } from './ui';

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

export const pushGroup = (group) => ({
    type: PUSH_GROUP,
    group
})

export const deletePoll = (poll_id) => ({
    type: DELETE_POLL,
    poll_id
});

export const deleteGroup = (group_id) => ({
    type: DELETE_GROUP,
    group_id
});

export const clearPolls = () => ({
    type: CLEAR_POLLS
});

export const fetchUserPolls = () => async (dispatch, getState) => {
    var state = getState();
    const token = state.auth.access;
    try {
        const { data: polls } = await axios.get('/api/polls/mine', {
            headers: {
                Authorization: `JWT ${token}`
            }
        });

        polls.sort((a, b) => a.deadline < b.deadline ? -1 : 1);

        dispatch(setPolls(polls));
    }
    catch ({ response: { data } }) {
        dispatch(notify('Erro: ' + data.message, 'error'));
    }
};

export const pollOptions = (id) => async (dispatch) => {
    try {
        const res = await axios.get('/api/polls/get/' + id + '/');

        dispatch(setOptions(res.data.options));
    }
    catch ({ response: { data } }) {
        dispatch(notify('Erro: ' + data.message, 'error'));
    }
};

export const fetchUserGroups = () => async (dispatch, getState) => {
    var state = getState();
    const token = state.auth.access;
    try {
        const res = await axios.get('/api/groups/mine', {
            headers: {
                Authorization: `JWT ${token}`
            }
        });

        dispatch(setGroups(res.data));
    }
    catch ({ response: { data } }) {
        dispatch(notify('Erro: ' + data.message, 'error'));
    }
};
