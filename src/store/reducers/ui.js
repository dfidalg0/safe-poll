import { SET_LOADING } from '../actions/types';

const baseState = {
    loading: true
}

export default function reducer(state = baseState, { type, payload }){
    switch (type){
    case SET_LOADING:
        return { ...state, loading: payload.loading };
    default:
        return state;
    }
}
