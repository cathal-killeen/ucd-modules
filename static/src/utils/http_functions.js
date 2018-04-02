/* eslint camelcase: 0 */

import axios from 'axios';

export function user_profile() {
    return axios.get('/api/profile');
}

export function user_profile_likes() {
    return axios.get('/api/profile/likes');
}

export function user_recommendations() {
    return axios.get('/api/profile/recommendations');
}

export function build_recommendations() {
    return axios.get('/api/build_recommendations');
}

export function logout() {
    return axios.post('/api/logout')
}

export function like(type, item_id) {
    return axios.post('/api/like', {
        type,
        item_id
    })
}

export function unlike(type, item_id) {
    return axios.post('/api/unlike', {
        type,
        item_id
    })
}

export function search_query (query) {
    return axios.get('/api/search', {
        params: {
          q: query
        }
    })
}

export function get_school (school_id) {
    return axios.get('/api/school/' + school_id)
}

export function get_schools () {
    return axios.get('/api/schools')
}

export function get_staff () {
    return axios.get('/api/staff')
}

export function get_staff_member (staff_id) {
    return axios.get('/api/staff/' + staff_id)
}

export function get_module (code) {
    return axios.get('/api/modules/' + code)
}

export function get_module_alt (code) {
    return axios.get('/api/modules_alt/' + code)
}