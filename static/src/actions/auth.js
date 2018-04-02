import { browserHistory } from 'react-router';

import {
    LOGIN_USER_SUCCESS,
    LOGIN_USER_FAILURE,
    LOGIN_USER_REQUEST,
    LOGOUT_USER,
    REGISTER_USER_FAILURE,
    REGISTER_USER_REQUEST,
    REGISTER_USER_SUCCESS,
} from '../constants/index';

import * as types from '../constants/index'

import { parseJSON } from '../utils/misc';
import { get_token, create_user } from '../utils/http_functions';
import * as API from '../utils/http_functions';
import { push } from 'react-router-redux';


export function loginUserSuccess(token) {
    localStorage.setItem('token', token);
    return {
        type: LOGIN_USER_SUCCESS,
        payload: {
            token,
        },
    };
}

export function registerGoogle() {

}

export function redirectAndGetUserData(redirectTo) {
    return (dispatch) => {
        API.user_profile().then(res => {
            if (res.status === 200) {
                dispatch({
                    type: types.REDIRECT_AND_USER_DATA,
                    payload: {
                        user_profile: res.data.profile,
                    }
                })
            }else{
                dispatch({
                    type: types.REDIRECT_AND_USER_DATA_ERROR,
                    payload: {
                        login_error_message: res.data['error'] | "There was a problem logging in",
                    }
                })
            }

            dispatch(push({ pathname: redirectTo }))
        }).catch(err => {
            dispatch({
                type: types.REDIRECT_AND_USER_DATA_ERROR,
                payload: {
                    login_error_message: "There was a problem logging in",
                }
            })

            dispatch(push({ pathname: redirectTo }))
        })
    }
}

export function getUserData() {
    return (dispatch) => {
        API.user_profile().then(res => {
            if(res.status === 200){
                dispatch({
                    type: types.GOT_USER_DATA,
                    payload: {
                        user_profile: res.data.profile
                    }
                })
            }else{
                dispatch({
                    type: types.GOT_USER_DATA_FAIL
                })
            }
        }).catch(err => {
            dispatch({
                type: types.GOT_USER_DATA_FAIL
            })
        })
    }
}

export function getUserLikes() {
    return (dispatch) => {
        API.user_profile_likes().then(res => {
            if(res.status === 200){
                dispatch({
                    type: types.GOT_USER_LIKES,
                    payload: {
                        user_profile: res.data.profile,
                        module_likes: res.data.module_likes,
                        school_likes: res.data.school_likes,
                        staff_likes: res.data.staff_likes
                    }
                })
            }else{
                dispatch({
                    type: types.GOT_USER_LIKES_FAIL
                })
            }
        }).catch(err => {
            dispatch({
                type: types.GOT_USER_LIKES_FAIL
            })
        })
    }
}

export function getUserRecommendations() {
    return (dispatch) => {
        API.user_recommendations().then(res => {
            if(res.status === 200){
                dispatch({
                    type: types.GOT_USER_RECOMMENDATIONS,
                    payload: {
                        recommended_modules: res.data.recommended_modules || [],
                    }
                })
            }else{
                dispatch({
                    type: types.GOT_USER_RECOMMENDATIONS_FAIL
                })
            }
        }).catch(err => {
            dispatch({
                type: types.GOT_USER_RECOMMENDATIONS_FAIL
            })
        })
    }
}

export function dismissDialog(name) {
    return {
        type: types.DISMISS_DIALOG,
        payload: {
            dialog_name: name
        }
    }
}


export function loginUserFailure(error) {
    localStorage.removeItem('token');
    return {
        type: LOGIN_USER_FAILURE,
        payload: {
            status: error.response.status,
            statusText: error.response.statusText,
        },
    };
}

export function loginUserRequest() {
    return {
        type: LOGIN_USER_REQUEST,
    };
}

export function logout() {
    return (dispatch) => {
        dispatch({
            type: types.LOGOUT_USER,
        })

        API.logout().then(res => {
            if (res.data['logout_success']) {
                dispatch({
                    type: types.SERVER_LOGOUT_SUCCESS
                })
            }else{
                dispatch({
                    type: types.SERVER_LOGOUT_FAIL
                })
            }
        }).catch(err => {
            dispatch({
                type: types.SERVER_LOGOUT_FAIL
            })
        })
    }
    
}

export function logoutAndRedirect() {
    return (dispatch) => {
        dispatch(logout());
        browserHistory.push('/');
    };
}

export function redirectToRoute(route) {
    return () => {
        browserHistory.push(route);
    };
}

export function loginUser(email, password) {
    return function (dispatch) {
        dispatch(loginUserRequest());
        return get_token(email, password)
            .then(parseJSON)
            .then(response => {
                try {
                    dispatch(loginUserSuccess(response.token));
                    browserHistory.push('/main');
                } catch (e) {
                    alert(e);
                    dispatch(loginUserFailure({
                        response: {
                            status: 403,
                            statusText: 'Invalid token',
                        },
                    }));
                }
            })
            .catch(error => {
                dispatch(loginUserFailure({
                    response: {
                        status: 403,
                        statusText: 'Invalid username or password',
                    },
                }));
            });
    };
}


export function registerUserRequest() {
    return {
        type: REGISTER_USER_REQUEST,
    };
}

export function registerUserSuccess(token) {
    localStorage.setItem('token', token);
    return {
        type: REGISTER_USER_SUCCESS,
        payload: {
            token,
        },
    };
}

export function registerUserFailure(error) {
    localStorage.removeItem('token');
    return {
        type: REGISTER_USER_FAILURE,
        payload: {
            status: error.response.status,
            statusText: error.response.statusText,
        },
    };
}

export function registerUser(email, password) {
    return function (dispatch) {
        dispatch(registerUserRequest());
        return create_user(email, password)
            .then(parseJSON)
            .then(response => {
                try {
                    dispatch(registerUserSuccess(response.token));
                    browserHistory.push('/main');
                } catch (e) {
                    dispatch(registerUserFailure({
                        response: {
                            status: 403,
                            statusText: 'Invalid token',
                        },
                    }));
                }
            })
            .catch(error => {
                dispatch(registerUserFailure({
                    response: {
                        status: 403,
                        statusText: 'User with that email already exists',
                    },
                }
                ));
            });
    };
}
