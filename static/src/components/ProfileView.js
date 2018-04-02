/* eslint camelcase: 0, no-underscore-dangle: 0 */

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper';
import * as authActions from '../actions/auth';
import * as dataActions from '../actions/data';
import ModulePreview from './ModulePreview';
import StaffCard from './Cards/Staff';
import LikeButton from './Cards/LikeButton';
import Icon from 'react-fontawesome';
import DocumentTitle from 'react-document-title';
import Avatar from './Cards/Avatar';
import { Link } from 'react-router';
import FlipMove from 'react-flip-move';
import TextTruncate from 'react-text-truncate';

import _QueryString from 'query-string';

function mapStateToProps(state) {
    let curr_loc = state.routing.locationBeforeTransitions;
    let tab = 'modules'
    if (curr_loc !== null) {
        let params = _QueryString.parse(curr_loc.search)
        if ('tab' in params) {
            tab = params['tab']
        }
    }

    return {
        user_profile: state.auth.user_profile,
        user_logged_in: state.auth.user_logged_in,
        module_likes: state.auth.module_likes,
        staff_likes: state.auth.staff_likes,
        school_likes: state.auth.school_likes,
        tab: tab,
        curr_route: state.routing.locationBeforeTransitions.pathname
    };
}

function mapDispatchToProps(dispatch) {
    return {
        dataActions: bindActionCreators(dataActions, dispatch),
        authActions: bindActionCreators(authActions, dispatch)
    }
}

const btn_style = {
    width: '33.33%'
};

const style = {
    marginTop: 50,
    paddingBottom: 50,
    paddingTop: 25,
    width: '100%',
    textAlign: 'center',
    display: 'inline-block',
};

@connect(mapStateToProps, mapDispatchToProps)
export default class ProfileView extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            unlikedModules: [],
            unlikedSchools: [],
            unlikedStaff: []
        }
    }

    componentWillMount() {
        this.props.authActions.getUserLikes();
    }

    componentWillReceiveProps(nextProps) { }

    handleTabClick(e) {
        e.preventDefault()
        this.props.dataActions.switchTab(e.target.value, this.props.curr_route);
    }

    handleModuleUnlike(e) {
        e.preventDefault();
        let item_id = e.target.value;
        this.props.dataActions.unlikeItem('module', item_id);
        this.setState(prevState => ({
            unlikedModules: [...prevState.unlikedModules, item_id]
        }));
    }

    handleSchoolUnlike(e) {
        e.preventDefault();
        let item_id = e.target.value;
        this.props.dataActions.unlikeItem('school', item_id);
        this.setState(prevState => ({
            unlikedSchools: [...prevState.unlikedSchools, item_id]
        }));
    }

    handleStaffUnlike(e) {
        e.preventDefault();
        let item_id = e.target.value;
        this.props.dataActions.unlikeItem('staff', item_id);
        this.setState(prevState => ({
            unlikedStaff: [...prevState.unlikedStaff, item_id]
        }));
    }

    render() {
        let documentTitle = 'My Profile | UCD Modules';
        let { user_profile, module_likes, staff_likes, school_likes } = this.props;


        return (

            <DocumentTitle title={documentTitle} >
                {this.props.user_logged_in ?

                    <div className="col-md-12">
                        <div className="jumbotron" style={{ height: '340px' }}>
                            <Avatar src={user_profile.picture_url} size={150} style={{ margin: '0 auto' }} />
                            <h3 style={{ textAlign: 'center' }}>{user_profile.name}</h3>
                            <hr />
                            <h4 style={{ textAlign: 'center' }}>{user_profile.email}</h4>
                        </div>

                        <br />

                        <h2>My Likes</h2>
                        <hr />

                        <div className="btn-group btn-group-toggle col-sm-12" data-toggle="buttons" style={{ width: '100%' }} >
                            <button
                                className={"btn btn-primary btn-lg " + (this.props.tab === 'modules' ? "active" : "")}
                                style={{ width: '33.33%' }}
                                value='modules'
                                onClick={this.handleTabClick.bind(this)}
                            >
                                Modules
                            <span className="badge badge-primary badge-pill" style={{ marginLeft: '15px' }}>{module_likes.length - this.state.unlikedModules.length}</span>
                            </button>
                            <button
                                className={"btn btn-primary btn-lg " + (this.props.tab === 'schools' ? "active" : "")}
                                style={{ width: '33.33%' }}
                                value='schools'
                                onClick={this.handleTabClick.bind(this)}
                            >
                                Schools
                            <span className="badge badge-primary badge-pill" style={{ marginLeft: '15px' }}>{school_likes.length - this.state.unlikedSchools.length}</span>
                            </button>
                            <button
                                className={"btn btn-primary btn-lg " + (this.props.tab === 'staff' ? "active" : "")}
                                style={{ width: '33.33%' }}
                                value='staff'
                                onClick={this.handleTabClick.bind(this)}
                            >
                                Staff
                            <span className="badge badge-primary badge-pill" style={{ marginLeft: '15px' }}>{staff_likes.length - this.state.unlikedStaff.length}</span>
                            </button>
                        </div>

                        <br />
                        <br />
                        <br />
                        <br />

                        <div className="col-sm-12">
                            {{
                                'staff': (
                                    <FlipMove duration={750} easing="ease-out">
                                    {
                                        [].concat(staff_likes)
                                        .filter(elem => !this.state.unlikedStaff.includes(elem.url_name))
                                        .sort((a, b) => a.last_name > b.last_name)
                                        .map(member => {
                                            if (member.name !== 'Unknown') {
                                                // return <StaffCard member={member} key={member.id} showUnlike={true} value={member.url_name} unlikeMethod={this.handleStaffUnlike.bind(this)} />;
                                                return <div className="col-md-4 col-lg-2 col-xs-6" key={member.id} style={{ textAlign: 'center', margin: '15px 0' }}>
                                                    <div className="card">
                                                        <div style={{ padding: '15px 0' }}>
                                                            <Avatar src={member.image_url} size={100} style={{ margin: '15px auto' }} />
                                                        </div>
                                                        <div className="card-footer">
                                                            <h6><Link to={'/staff/' + member.url_name}><TextTruncate line={1} text={member.name} /></Link></h6>
                                                        </div>
                                                        <div className="card-footer">
                                                            <button type="button" className="btn btn-link" style={{ color: '#e74c3c' }} value={member.url_name} onClick={this.handleStaffUnlike.bind(this)}><Icon name='times' style={{ marginRight: '7px' }} />Unlike</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                        })
                                    }
                                    </FlipMove>
                                ),
                                'schools': (
                                    <FlipMove duration={750} easing="ease-out">
                                    {
                                        [].concat(school_likes)
                                        .filter(elem => !this.state.unlikedSchools.includes(elem.url_name))
                                        .sort((a, b) => a.name > b.name)
                                        .map(school => {
                                            return <div key={school.id}>
                                                <div className="card">
                                                    <div className="card-body" style={{ marginLeft: '15px', marginRight: '15px' }}>
                                                        <h4 className="card-title">
                                                            <div className="d-flex w-100 justify-content-between">
                                                                <Link to={'/school/' + school.url_name} >
                                                                    <b>{school.name}</b>
                                                                </Link>
                                                                <button type="button" className="btn btn-link" style={{ color: '#e74c3c', marginTop: '-7px' }} value={school.url_name} onClick={this.handleSchoolUnlike.bind(this)}><Icon name='times' style={{ marginRight: '7px' }} />Unlike</button>
                                                            </div>
                                                        </h4>

                                                    </div>
                                                </div>
                                                <br />
                                            </div>;
                                        })
                                    }
                                    </FlipMove>
                                ),
                                'modules': (
                                    <FlipMove duration={750} easing="ease-out">
                                        {
                                            [].concat(module_likes)
                                            .filter(elem => !this.state.unlikedModules.includes(elem.code))
                                            .sort((a, b) => a.code_number > b.code_number)
                                            .map(module => {
                                                return <div key={module.id}>
                                                    <div className="card">
                                                        <div className="card-body" style={{ marginLeft: '15px', marginRight: '15px' }}>

                                                            <h4 className="card-title">
                                                                <div className="d-flex w-100 justify-content-between">
                                                                    <Link to={'/modules/' + module.code} >
                                                                        <b>{module.code}</b>: {module.long_title}
                                                                    </Link>
                                                                    <button type="button" className="btn btn-link" style={{ color: '#e74c3c', marginTop: '-7px' }} value={module.code} onClick={this.handleModuleUnlike.bind(this)}><Icon name='times' style={{ marginRight: '7px' }} />Unlike</button>
                                                                </div>
                                                            </h4>

                                                        </div>
                                                    </div>
                                                    <br />
                                                </div>
                                            })
                                        }
                                    </FlipMove>
                                ),
                            }[this.props.tab || 'modules']}
                        </div>
                    </div>

                    :
                    <div className="col-md-12">
                        <div className="alert e alert-warning">
                            <p className="mb-0">Please login to view your profile</p>
                        </div>
                    </div>}
            </ DocumentTitle>
        )



    }
}