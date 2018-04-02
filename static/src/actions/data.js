import * as types from '../constants/index';
import { parseJSON } from '../utils/misc';
import { data_about_user, search_query, get_module, get_school } from '../utils/http_functions';
import * as API from '../utils/http_functions';
import { logoutAndRedirect } from './auth';

import { push } from 'react-router-redux'

export function receiveProtectedData(data) {
    return {
        type: types.RECEIVE_PROTECTED_DATA,
        payload: {
            data,
        },
    };
}

export function fetchProtectedDataRequest() {
    return {
        type: types.FETCH_PROTECTED_DATA_REQUEST,
    };
}

export function fetchProtectedData(token) {
    return (dispatch) => {
        dispatch(fetchProtectedDataRequest());
        data_about_user(token)
            .then(parseJSON)
            .then(response => {
                dispatch(receiveProtectedData(response.result));
            })
            .catch(error => {
                if (error.status === 401) {
                    dispatch(logoutAndRedirect(error));
                }
            });
    };
}

export function getSingleModule(code) {
    return (dispatch) => {
        if (code.length > 0) {
            // reset module info so old info doesnt reside on page
            dispatch({type: types.RESET_MODULE});
            API.get_module(code)
                .then(res => {
                    console.log('res', res)
                    if (res.status === 200) {
                        dispatch({
                            type: types.SINGLE_MODULE,
                            payload: {
                                module: res.data.module,
                                module_coordinator: res.data.module_coordinator,
                                code: res.data.code,
                                module_liked: res.data.module_liked,
                                staff_liked: res.data.staff_liked
                            }
                        })
                    } else {
                        dispatch({
                            type: SINGLE_MODULE_NOT_FOUND,
                        })
                    }

                }).catch(err => {
                    console.log(err) // testing -- should add different action if something goes wrong
                })
            API.get_module_alt(code)
                .then(res => {
                    if(res.status === 200) {
                        dispatch({
                            type: types.SINGLE_MODULE_ALT,
                            payload: {
                                module_workload: res.data.workload,
                                module_assessment: res.data.assessment,
                                module_schedule: res.data.schedule,
                                module_keywords: res.data.keywords,
                                similar_modules: res.data.similar_modules
                            }
                        })
                    }else{
                        dispatch({
                            type: types.SINGLE_MODULE_ALT_NOT_FOUND
                        })
                    }
                })
        }
    }
}

export function likeItem(type, item_id) {
    return (dispatch) => {
        API.like(type,item_id).then(res => {
            if (res.status === 200) {
                dispatch({
                    type: types.LIKE_ITEM_SUCCESS,
                    payload: {
                        item_id: item_id,
                        like_type: type
                    }
                })
                API.build_recommendations().then(res => {
                    if(res.status === 200) dispatch({type: types.BUILT_RECOMMENDATIONS, payload: {}})  
                    else dispatch({type: types.BUILD_RECOMMENDATIONS_FAIL, payload: {}})  
                }).catch(e => {
                    dispatch({type: types.BUILD_RECOMMENDATIONS_FAIL, payload: {}})  
                })
            }else{
                dispatch({
                    type: types.LIKE_ITEM_FAIL,
                    payload: {
                        item_id: item_id,
                        like_type: type
                    }
                })
            }
        }).catch(err => {
            console.log(err);
            dispatch({
                type: types.LIKE_ITEM_FAIL,
                payload: {
                    item_id: item_id,
                    like_type: type
                }
            })
        })
    }
}


export function unlikeItem(type, item_id) {
    return (dispatch) => {
        API.unlike(type,item_id).then(res => {
            if (res.status === 200) {
                dispatch({
                    type: types.UNLIKE_ITEM_SUCCESS,
                    payload: {
                        item_id: item_id,
                        like_type: type
                    }
                })
                API.build_recommendations().then(res => {
                    if(res.status === 200) dispatch({type: types.BUILT_RECOMMENDATIONS, payload: {}})  
                    else dispatch({type: types.BUILD_RECOMMENDATIONS_FAIL, payload: {}})  
                }).catch(e => {
                    dispatch({type: types.BUILD_RECOMMENDATIONS_FAIL, payload: {}})  
                })
            }else{
                dispatch({
                    type: types.UNLIKE_ITEM_FAIL,
                    payload: {
                        item_id: item_id,
                        like_type: type
                    }
                })
            }
        }).catch(err => {
            console.log(err);
            dispatch({
                type: types.UNLIKE_ITEM_FAIL,
                payload: {
                    item_id: item_id,
                    like_type: type
                }
            })
        })
    }
}

export function getSchool(school_id) {
    return (dispatch) => {
        get_school(school_id)
            .then(res => {
                if (res.status === 200) {
                    dispatch({
                        type: types.SCHOOL,
                        payload: {
                            school: res.data.school,
                            school_modules: res.data.modules,
                            school_staff: res.data.staff,
                            school_subjects: [],
                            school_liked: res.data.school_liked
                        }
                    })
                } else {
                    dispatch({
                        type: types.SCHOOL_NOT_FOUND,
                    })
                }
            }).catch(err => {
                console.log(err) // testing -- should add different action if something goes wrong
            })
    }
}

export function getSchools() {
    return (dispatch) => {

        API.get_schools()
            .then(res => {
                if (res.status === 200) {
                    dispatch({
                        type: types.ALL_SCHOOLS,
                        payload: {
                            all_schools: res.data.schools,
                        }
                    })
                } else {
                    //
                }
            }).catch(err => {
                console.log(err) // testing -- should add different action if something goes wrong
            })
    }
}

export function getAllStaff() {
    return (dispatch) => {
        API.get_staff()
            .then(res => {
                if (res.status === 200) {
                    dispatch({
                        type: types.ALL_STAFF,
                        payload: {
                            all_staff: res.data.staff
                        }
                    })
                } else {
                    //
                }
            }).catch(err => {
                console.log(err) // testing -- should add different action if something goes wrong
            })
    }
}

export function getStaffMember(staff_id) {
    return (dispatch) => {
        API.get_staff_member(staff_id)
            .then(res => {
                if (res.status === 200) {
                    dispatch({
                        type: types.STAFF_MEMBER,
                        payload: {
                            staff_member: res.data.staff_member,
                            staff_school: res.data.staff_school,
                            staff_modules: res.data.staff_modules,
                            staff_liked: res.data.staff_liked
                        }
                    })
                } else {
                    dispatch({
                        type: types.STAFF_MEMBER_NOT_FOUND
                    })
                }
            }).catch(err => {
                console.log(err) // testing -- should add different action if something goes wrong
            })
    }
}


export function redirectToSearch(query) {
    return push({ pathname: '/search', search: '?q=' + query })
}

export function switchTab(tab_name, curr_route) {
    return push({ search: '?tab=' + tab_name, pathname: curr_route })
}

export function navigateTo(pathname, search) {
    return push({ pathname, search });
}

export function fetchSearchQuery(query) {
    return (dispatch) => {
        dispatch({type: types.START_SEARCH, payload: {query: query}})
        search_query(query)
            .then(response => {
                dispatch({
                    type: types.SEARCH_RESULTS,
                    payload: {
                        query: query,
                        results: response.data.modules || [],
                    }
                })
            })
            .catch(error => {
                dispatch({
                    type: types.SEARCH_RESULTS,
                    payload: {
                        query: query,
                        results: [],
                        no_results: true
                    }
                })
                console.log(error) // testing -- should add different action if something goes wrong
            })
    }
}
