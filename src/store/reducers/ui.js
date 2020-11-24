import { SET_LOADING, SET_POLLS, PUSH_POLL, SET_OPTIONS } from '../actions/types';

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
        default:
            return state;
    }
}
