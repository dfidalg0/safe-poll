import {
    SET_POLLS, PUSH_POLL,
    SET_OPTIONS, SET_GROUPS, PUSH_GROUP, DELETE_GROUP,
    DELETE_POLL, CLEAR_POLLS
} from '../actions/types';

const baseState = {
    polls: null,
    groups: null
};

export default function reducer(state = baseState, action){
    switch (action.type) {
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
                { ...state, groups: [action.group] }
        case DELETE_POLL:
            const newPolls = state.polls.filter(poll => poll.id !== action.poll_id);
            return { ...state, polls: newPolls };
        case DELETE_GROUP:
            const newGroups = state.groups.filter(g => g.id !== action.group_id);
            return { ...state, groups: newGroups };
        case CLEAR_POLLS:
            return { ...state, polls: null };
        default:
            return state;
    }
}
