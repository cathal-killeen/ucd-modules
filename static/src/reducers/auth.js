import jwtDecode from 'jwt-decode';

import { createReducer } from '../utils/misc';
import {
    LOGIN_USER_SUCCESS,
    LOGIN_USER_FAILURE,
    LOGIN_USER_REQUEST,
    LOGOUT_USER,
    REGISTER_USER_FAILURE,
    REGISTER_USER_REQUEST,
    REGISTER_USER_SUCCESS,
} from '../constants/index';

import * as types from '../constants/index';

const initialState = {
    token: null,
    userName: null,
    isAuthenticated: false,
    isAuthenticating: false,
    statusText: null,
    isRegistering: false,
    isRegistered: false,
    registerStatusText: null,
    user_profile: {},
    user_logged_in: false,
    login_error: false,
    login_error_message: "",
    show_success_dialog: false,
    got_user_likes: false,
    module_likes: [],
    school_likes: [],
    staff_likes: [],
    recommended_modules: []
};

export default createReducer(initialState, {
    [types.GOT_USER_DATA]: (state, payload) =>
        Object.assign({}, state, {
            user_profile: payload.user_profile,
            user_logged_in: true,
            login_error: false,
            login_error_message: "",
            show_success_dialog: false,
        }),
    [types.GOT_USER_DATA_FAIL]: (state, payload) =>
        Object.assign({}, state, {
            user_profile: {},
            user_logged_in: false,
            login_error: false,
            login_error_message: "",
            show_success_dialog: false,
        }),
    [types.GOT_USER_LIKES]: (state, payload) =>
        Object.assign({}, state, {
            user_profile: payload.user_profile,
            user_logged_in: true,
            login_error: false,
            login_error_message: "",
            show_success_dialog: false,
            module_likes: payload.module_likes || [],
            staff_likes: payload.staff_likes || [],
            school_likes: payload.school_likes || [],
            got_user_likes: true,
        }),
    [types.GOT_USER_LIKES_FAIL]: (state, payload) =>
        Object.assign({}, state, {
            module_likes: [],
            staff_likes: [],
            school_likes: [],
            got_user_likes: false
        }),
    [types.GOT_USER_RECOMMENDATIONS]: (state, payload) =>
        Object.assign({}, state, {
            recommended_modules: payload.recommended_modules
        }),
    [types.GOT_USER_RECOMMENDATIONS_FAIL]: (state, payload) =>
        Object.assign({}, state, {
            recommended_modules: []
        }),
    [types.LOGOUT_USER]: (state) =>
        Object.assign({}, state, {
            user_profile: {},
            user_logged_in: false,
            login_error: false,
            login_error_message: "",
            show_success_dialog: false,
            got_user_likes: false,
            module_likes: [],
            school_likes: [],
            staff_likes: [],
            recommended_modules: []
        }),
    [types.REDIRECT_AND_USER_DATA]: (state, payload) =>
        Object.assign({}, state, {
            user_profile: payload.user_profile,
            user_logged_in: true,
            login_error: false,
            login_error_message: "",
            show_success_dialog: true,
        }),
    [types.REDIRECT_AND_USER_DATA_ERROR]: (state, payload) =>
        Object.assign({}, state, {
            user_profile: {},
            user_logged_in: false,
            login_error: true,
            login_error_message: payload.login_error_message,
            show_success_dialog: false,
        }),
    [types.DISMISS_DIALOG]: (state, payload) => {
        switch (payload.dialog_name) {
            case 'error':
                return Object.assign({}, state, {
                    login_error: false,
                    login_error_message: "",
                })
            case 'success':
                return Object.assign({}, state, {
                    show_success_dialog: false,
                })
            default:
                return state
        }
    },
    [LOGIN_USER_REQUEST]: (state) =>
        Object.assign({}, state, {
            isAuthenticating: true,
            statusText: null,
        }),
    [LOGIN_USER_SUCCESS]: (state, payload) =>
        Object.assign({}, state, {
            isAuthenticating: false,
            isAuthenticated: true,
            token: payload.token,
            userName: jwtDecode(payload.token).email,
            statusText: 'You have been successfully logged in.',
        }),
    [LOGIN_USER_FAILURE]: (state, payload) =>
        Object.assign({}, state, {
            isAuthenticating: false,
            isAuthenticated: false,
            token: null,
            userName: null,
            statusText: `Authentication Error: ${payload.status} ${payload.statusText}`,
        }),
    [REGISTER_USER_SUCCESS]: (state, payload) =>
        Object.assign({}, state, {
            isAuthenticating: false,
            isAuthenticated: true,
            isRegistering: false,
            token: payload.token,
            userName: jwtDecode(payload.token).email,
            registerStatusText: 'You have been successfully logged in.',
        }),
    [REGISTER_USER_REQUEST]: (state) =>
        Object.assign({}, state, {
            isRegistering: true,
        }),
    [REGISTER_USER_FAILURE]: (state, payload) =>
        Object.assign({}, state, {
            isAuthenticated: false,
            token: null,
            userName: null,
            registerStatusText: `Register Error: ${payload.status} ${payload.statusText}`,
        }),
});
