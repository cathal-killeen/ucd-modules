/* eslint camelcase: 0, no-underscore-dangle: 0 */

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper';
import * as actionCreators from '../actions/auth';
import * as dataActions from '../actions/data';
import ModulePreview from './ModulePreview';
import Avatar from './Cards/Avatar';
import Icon from 'react-fontawesome';
import { Link } from 'react-router';
import DocumentTitle from 'react-document-title';
import LikeButton from './Cards/LikeButton';

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
        token: state.auth.token,
        userName: state.auth.userName,
        isAuthenticated: state.auth.isAuthenticated,
        staff_member_found: state.data.staff_member_found,
        staff_member: state.data.staff_member,
        staff_school: state.data.staff_school,
        staff_modules: state.data.staff_modules,
        tab: tab,
        curr_route: state.routing.locationBeforeTransitions.pathname,
        curr_staff_liked: state.data.curr_staff_liked
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(dataActions, dispatch);
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
export default class StaffView extends React.Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.getStaffMember(this.props.params.staff_id)
    }

    componentWillReceiveProps(nextProps) { }

    // handleTabClick(e) {
    //     e.preventDefault()
    //     this.props.switchTab(e.target.value, this.props.curr_route);
    // }

    render() {
        let { staff_member, staff_school, staff_member_found } = this.props;

        let school_name = '';
        let color_code = '44,62,80'

        if (staff_member_found) {
            school_name = 'School of ' + staff_school.name;
            if (
                staff_school.name.indexOf('Centre') !== -1 ||
                staff_school.name.indexOf('Academy') !== -1 ||
                staff_school.name.indexOf('Institute') !== -1 ||
                staff_school.name.indexOf('Beijing') !== -1 ||
                staff_school.name.indexOf('Admin') !== -1
            ) {
                school_name = staff_school.name;
            }

            if (staff_school.color_code) color_code = staff_school.color_code
        }

        return (
            this.props.staff_member_found ?
                <DocumentTitle title={staff_member.name + " | UCD Modules"} >
                    <div className="col-md-12">
                        <div className="jumbotron " style={
                            {
                                backgroundImage: "url('" + staff_school.image_url + "')",
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: 'cover',
                                height: '395px',
                                boxShadow: 'inset 0 0 0 2000px rgb(' + color_code + ',0.9)'
                            }
                        }>
                            <p className='lead' style={{ textAlign: 'right' }} ><LikeButton liked={this.props.curr_staff_liked} type={'staff'} item_id={staff_member.url_name} like_style={'white'}/></p>
                            <Avatar src={staff_member.image_url} size={150} style={{ margin: '0 auto' }} isPortrait={staff_member.image_portrait} />
                            <h4 style={{ textAlign: 'center', color: 'white' }}>{staff_member.title}</h4>
                            <h3 style={{ textAlign: 'center', color: 'white', marginTop: '0' }}>{staff_member.name}</h3>
                            <hr />
                            <Link to={'/school/' + staff_school.url_name}><h4 style={{ textAlign: 'center', color: 'white' }}>{school_name}</h4></Link>

                        </div>

                        <br />
                        <br />
                        <br />
                        <br />

                        <div className="col-sm-12">
                            {{
                                'subjects': (<div />),
                                'modules': (
                                    [].concat(this.props.staff_modules)
                                        .sort((a, b) => a.code_number > b.code_number)
                                        .map(module => {
                                            return <ModulePreview key={module.id} module={module} hide_meta_bar={true} />
                                        })
                                ),
                            }[this.props.tab || 'modules']}
                        </div>
                    </div>
                </DocumentTitle>
                :
                <div className="col-md-12">
                </div>
        )



    }
}