/* eslint new-cap: 0 */

import React from 'react';
import { Route } from 'react-router';

/* containers */
import { App } from './containers/App';
import { HomeContainer } from './containers/HomeContainer';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import ProtectedView from './components/ProtectedView';
import Analytics from './components/Analytics';
import NotFound from './components/NotFound';
import ModuleView from './components/ModuleView';
import SchoolView from './components/SchoolView';
import AllSchoolsView from './components/AllSchoolsView';
import AllStaffView from './components/AllStaffView';
import StaffView from './components/StaffView';

import { DetermineAuth } from './components/DetermineAuth';
import { requireAuthentication } from './components/AuthenticatedComponent';
import { requireNoAuthentication } from './components/notAuthenticatedComponent';
import SearchView from './components/SearchView';
import ProfileView from './components/ProfileView';
import HomeView from './components/HomeView';

export default (
    <Route path="/" component={App}>
        <Route path="modules/:code" component={requireNoAuthentication(ModuleView)} />
        <Route path="school/:school_id" component={requireNoAuthentication(SchoolView)} />
        <Route path="schools" component={requireNoAuthentication(AllSchoolsView)} />
        <Route path="staff/:staff_id" component={requireNoAuthentication(StaffView)} />
        {/* <Route path="staff" component={requireNoAuthentication(AllStaffView)} /> */}
        <Route path="search" component={requireNoAuthentication(SearchView)} />
        <Route path="main" component={requireAuthentication(ProtectedView)} />
        {/* <Route path="login" component={requireNoAuthentication(LoginView)} /> */}
        {/* <Route path="register" component={requireNoAuthentication(RegisterView)} /> */}
        <Route path="home" component={requireNoAuthentication(HomeView)} />
        <Route path="profile" component={requireNoAuthentication(ProfileView)} />
        {/* <Route path="analytics" component={requireAuthentication(Analytics)} /> */}
        <Route path="*" component={DetermineAuth(NotFound)} />
        
    </Route>
);
