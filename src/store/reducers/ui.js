import {
    SET_LOADING, SET_POLLS, PUSH_POLL,
    SET_OPTIONS, SET_GROUPS, PUSH_GROUP,
    DELETE_POLL, CLEAR_POLLS
} from '../actions/types';

const baseState = {
    loading: true,
    polls: null
}

export default function reducer(state = baseState, action) {
    switch (action.type) {
        case SET_LOADING:
            return { ...state, loading: action.payload.loading };
        case SET_POLLS:
            return { ...state, polls: action.polls };
        case PUSH_POLL:
            return state.polls ?
                { ...state, polls: [action.poll, ...state.polls] } :
                state;
        case SET_OPTIONS:
            return { ...state, options: action.options };
        case SET_GROUPS:
            return { ...state, groups: action.groups };
        case PUSH_GROUP:
            return state.groups ?
                { ...state, groups: [action.group, ...state.groups] } :
                { ...state, groups: [action.group]}
        case DELETE_POLL:
            const newPolls = state.polls.filter( poll => poll.id !== action.poll_id);
            return  { ...state, polls: newPolls};
        case CLEAR_POLLS:
            return { ...state, polls: null };
        default:
            return state;
    }
}
