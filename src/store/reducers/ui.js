import {
    SET_LOADING,
    SET_NOTIFICATION,
    CLEAR_NOTIFICATION
} from '../actions/types';

const baseState = {
    loading: true,
    notifcation: null
}

export default function reducer(state = baseState, { type, payload }) {
    switch (type) {
        case SET_LOADING:
            return { ...state, loading: payload.loading };
        case SET_NOTIFICATION:
            return { ...state, notification: {
                msg: payload.msg,
                variant: payload.variant
            } };
        case CLEAR_NOTIFICATION:
            return { ...state, notification: null };
        default:
            return state;
    }
}
