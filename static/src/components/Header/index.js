import React, { Component } from 'react';
import { browserHistory, Redirect } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import AppBar from 'material-ui/AppBar';
import LeftNav from 'material-ui/Drawer';
import FlatButton from 'material-ui/FlatButton';
import Divider from 'material-ui/Divider';
import { Link } from 'react-router';
import { Modal, Dropdown, MenuItem } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import Avatar from '../Cards/Avatar';
import ProfileDropdown from '../Cards/ProfileDropdown';

import * as actionCreators from '../../actions/auth';
import * as dataActions from '../../actions/data'

import QueryString from 'query-string';

function mapStateToProps(state) {
    let curr_loc = state.routing.locationBeforeTransitions;
    let query = "";
    let redirectPath = false;
    if (curr_loc !== null) {
        let params = QueryString.parse(curr_loc.search)
        console.log(params)
        if ('q' in params) {
            query = params['q']
        }
        if ('redirectTo' in params) {
            redirectPath = params['redirectTo']
        }
    }

    return {
        token: state.auth.token,
        userName: state.auth.userName,
        isAuthenticated: state.auth.isAuthenticated,
        routing: state.routing.locationBeforeTransitions,
        query: query,
        redirectPath: redirectPath,
        auth: state.auth,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        authActions: bindActionCreators(actionCreators, dispatch),
        dataActions: bindActionCreators(dataActions, dispatch),
    }
}

@connect(mapStateToProps, mapDispatchToProps)
export default class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            searchQuery: "",
            fireRedirect: false,
            showModal: false
        };

    }

    componentWillMount() {
        if (this.props.query.length > 0) {
            this.setState({
                searchQuery: this.props.query
            })
        }

        if (this.props.redirectPath) {
            this.props.authActions.redirectAndGetUserData(this.props.redirectPath);
        }

        if(!this.props.auth.user_logged_in) {
            this.props.authActions.getUserData();
        }
    }

    dispatchNewRoute(route) {
        browserHistory.push(route);
        this.setState({
            open: false,
        });

    }

    componentWillReceiveProps(newProps) {
        if (newProps.redirectPath) {
            this.props.authActions.redirectAndGetUserData(newProps.redirectPath)
        }
    }


    handleClickOutside() {
        this.setState({
            open: false,
        });
    }


    logout(e) {
        e.preventDefault();
        this.props.auth.logoutAndRedirect();
        this.setState({
            open: false,
        });
    }

    openNav() {
        this.setState({
            open: true,
        });
    }

    handleClose() {
        this.setState({ showModal: false });
    }

    handleShow() {
        this.setState({ showModal: true });
    }

    signoutMethod() {
        this.props.authActions.logout();
    }

    handleSubmit(e) {
        e.preventDefault();
        //alert('A name was submitted: ' + this.state.searchQuery);
        if (this.state.searchQuery.length > 0) {
            if (this.props.routing.pathname === '/search') {
                this.props.dataActions.fetchSearchQuery(this.state.searchQuery)
            }
            this.props.dataActions.redirectToSearch(this.state.searchQuery)
            // this.setState({
            //     fireRedirect: true
            // })
        }
    }

    handleChange(e) {
        this.setState({ searchQuery: e.target.value });
    }

    dismissError() {
        this.props.authActions.dismissDialog('error');
    }

    dismissSuccess() {
        this.props.authActions.dismissDialog('success');
    }

    render() {
        let redirectTo = "";

        if (this.props.routing['pathname']) {
            redirectTo = "?redirectTo=" + this.props.routing.pathname;
        }

        return (
            <div>

                <nav className="navbar navbar-expand-lg navbar-dark bg-primary navbar-fixed-top">
                    <Link className="navbar-brand" to={'/'}><b>UCD Modules</b></Link>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarColor01">
                        <ul className="navbar-nav mr-auto">
                            <li className={"nav-item " + (this.props.routing.pathname === '/schools' ? "active" : "")}>
                                <Link className="nav-link" to={'/schools'}>Schools</Link>
                            </li>
                            {/* <li className={"nav-item " + (this.props.routing.pathname === '/staff' ? "active" : "")}>
                                <Link className="nav-link" to={'/staff'}>Staff</Link>
                            </li> */}
                            <li style={{ marginTop: '9px', marginLeft: '30px' }}>
                                <form className="form-inline my-2 my-lg-0" style={{ textAlign: 'center', display: 'block' }} onSubmit={this.handleSubmit.bind(this)}>

                                    <input className="form-control mr-sm-2" placeholder="Search by module, school, subject or keywords" type="text" id='searchbar'
                                        value={this.state.searchQuery}
                                        onChange={this.handleChange.bind(this)}
                                    ></input>

                                    <button className="btn btn-secondary my-2 my-sm-0" type="submit">Search</button>
                                </form>
                            </li>
                        </ul>
                    </div>
                    <div className="my-2 my-lg-0">
                        {
                            this.props.auth.user_logged_in
                                ?
                                <ProfileDropdown profile={this.props.auth.user_profile} signoutMethod={this.signoutMethod.bind(this)} />
                                :
                                <button className="btn btn-info" onClick={this.handleShow.bind(this)}><b>Login</b></button>
                        }
                    </div>
                </nav>
                <br />
                <br />
                <br />
                <br />
                <br />

                {
                    this.props.auth.show_success_dialog ?
                        <div className="container">
                            <div className="alert alert-dismissible alert-success" style={{ margin: '15px' }}>
                                <button style={{ marginTop: '-5px' }} type="button" className="close" onClick={this.dismissSuccess.bind(this)}>&times;</button>
                                You are now logged in as <strong>{this.props.auth.user_profile.email}</strong>.
                                </div>
                        </div> :
                        <div></div>
                }

                {
                    this.props.auth.login_error ?
                        <div className="container">
                            <div className="alert alert-dismissible alert-danger" style={{ margin: '15px' }}>
                                <button style={{ marginTop: '-5px' }} type="button" className="close" onClick={this.dismissError.bind(this)}>&times;</button>
                                {this.props.auth.login_error_message}
                            </div>
                        </div> :
                        <div></div>

                }

                <Modal bsSize='large' show={this.state.showModal} onHide={this.handleClose.bind(this)} style={{ marginTop: '10%' }}>
                    <Modal.Header closeButton>
                    </Modal.Header>
                    <Modal.Body style={{ textAlign: 'center' }}>
                        <h1>Sign in or register for UCD Modules</h1>
                        <br />
                        <h4>Use your account to save your favourite modules, schools and module coordinators.
                            Recieve module recommendations personalised for you.</h4>
                        <br />
                        <h5 className="text-muted">Use your Google Account (@ucdconnect.ie or @ucd.ie) to connect to UCD Modules.</h5>
                        <br />
                        <a href={"/api/login" + redirectTo} className="btn btn-danger btn-lg"><b><FontAwesome name="google" style={{ marginRight: '20px' }} />Connect with Google</b></a>
                        <br />
                        <br />
                        <br />
                        <br />
                    </Modal.Body>
                </Modal>

            </div>

        );
    }
}

Header.propTypes = {
    logoutAndRedirect: React.PropTypes.func,
    isAuthenticated: React.PropTypes.bool,
};