import * as types from '../constants';
import { createReducer } from '../utils/misc';

const initialState = {
    data: null,
    isFetching: false,
    loaded: false,
    search_results: [],
    search_query: '',
    module_code: '',
    single_module: {},
    module_coordinator: {},
    module_keywords: {},
    module_workload: [],
    module_schedule: [],
    module_assessment: [],
    similar_modules: [],
    module_found: false,
    module_alt_found: false,
    school: {},
    school_found: false,
    all_schools: [],
    school_modules: [],
    school_staff: [],
    school_subjects: [],
    all_staff: [],
    staff_member: {},
    staff_school: {},
    staff_modules: [],
    staff_member_found: false,
    search_in_progress: false,
    curr_module_liked: false,
    curr_school_liked: false,
    curr_staff_liked: false
};

export default createReducer(initialState, {
    [types.LOGOUT_USER]: (state, payload) =>
        Object.assign({}, state, {
            curr_module_liked: false,
            curr_school_liked: false,
            curr_staff_liked: false
        }),
    [types.LIKE_ITEM_SUCCESS]: (state, payload) => {
        switch (payload.like_type) {
            case 'module':
                return Object.assign({}, state, {
                    curr_module_liked: true
                })
            case 'staff':
                return Object.assign({}, state, {
                    curr_staff_liked: true
                })
            case 'school':
                return Object.assign({}, state, {
                    curr_school_liked: true
                })
            default:
                return state
        }
    },
    [types.UNLIKE_ITEM_SUCCESS]: (state, payload) => {
        switch (payload.like_type) {
            case 'module':
                return Object.assign({}, state, {
                    curr_module_liked: false
                })
            case 'staff':
                return Object.assign({}, state, {
                    curr_staff_liked: false
                })
            case 'school':
                return Object.assign({}, state, {
                    curr_school_liked: false
                })
            default:
                return state
        }
    },
    [types.RECEIVE_PROTECTED_DATA]: (state, payload) =>
        Object.assign({}, state, {
            data: payload.data,
            isFetching: false,
            loaded: true,
        }),
    [types.FETCH_PROTECTED_DATA_REQUEST]: (state) =>
        Object.assign({}, state, {
            isFetching: true,
        }),
    [types.START_SEARCH]: (state, payload) =>
        Object.assign({}, state, {
            search_results: [],
            search_query: payload.query,
            search_in_progress: true,
        }),
    [types.SEARCH_RESULTS]: (state, payload) =>
        Object.assign({}, state, {
            search_results: payload.results,
            search_query: payload.query,
            search_in_progress: false
        }),
    [types.SINGLE_MODULE]: (state, payload) =>
        Object.assign({}, state, {
            single_module: payload.module,
            module_coordinator: payload.module_coordinator,
            module_code: payload.code,
            module_found: true,
            curr_module_liked: payload.module_liked,
            curr_staff_liked: payload.staff_liked
        }),
    [types.SINGLE_MODULE_ALT]: (state, payload) =>
        Object.assign({}, state, {
            module_workload: payload.module_workload,
            module_assessment: payload.module_assessment,
            module_schedule: payload.module_schedule,
            module_keywords: payload.module_keywords,
            similar_modules: payload.similar_modules,
            module_alt_found: true,
        }),
    [types.SINGLE_MODULE_ALT_NOT_FOUND]: (state) =>
        Object.assign({}, state, {
            module_alt_found: false,
            module_workload: [],
            module_assessment: [],
            module_schedule: [],
            module_keywords: {},
            similar_modules: []
        }),
    [types.SINGLE_MODULE_NOT_FOUND]: (state) =>
        Object.assign({}, state, {
            module_found: false,
            single_module: {},
            module_coordinator: {},
            module_code: "",
        }),
    [types.RESET_MODULE]: (state) =>
        Object.assign({}, state, {
            module_found: false,
            single_module: {},
            module_coordinator: {},
            module_code: "",
            module_workload: [],
            module_assessment: [],
            module_schedule: [],
            module_keywords: {},
            similar_modules: [],
            curr_module_liked: false,
            curr_staff_liked: false,
        }),
    [types.SCHOOL]: (state, payload) =>
        Object.assign({}, state, {
            school: payload.school,
            school_found: true,
            school_modules: payload.school_modules,
            school_staff: payload.school_staff,
            school_subjects: payload.school_subjects,
            curr_school_liked: payload.school_liked
        }),
    [types.SCHOOL_NOT_FOUND]: (state, payload) =>
        Object.assign({}, state, {
            school_found: false,
            school: {},
            school_modules: [],
            school_staff: [],
            school_subjects: [],
            curr_school_liked: false
        }),
    [types.ALL_SCHOOLS]: (state, payload) =>
        Object.assign({}, state, {
            all_schools: payload.all_schools
        }),
    [types.ALL_STAFF]: (state, payload) =>
        Object.assign({}, state, {
            all_staff: payload.all_staff
        }),
    [types.STAFF_MEMBER]: (state, payload) =>
        Object.assign({}, state, {
            staff_member: payload.staff_member,
            staff_school: payload.staff_school,
            staff_modules: payload.staff_modules,
            staff_member_found: true,
            curr_staff_liked: payload.staff_liked
        }),
    [types.STAFF_MEMBER_NOT_FOUND]: (state, payload) =>
        Object.assign({}, state, {
            staff_member_found: false,
            staff_member: {},
            staff_school: {},
            staff_modules: [],
            curr_staff_liked: false
        })

});
