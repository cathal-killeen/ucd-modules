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
import StaffCard from './Cards/Staff';
import LikeButton from './Cards/LikeButton';
import Icon from 'react-fontawesome';
import DocumentTitle from 'react-document-title';

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
        school: state.data.school,
        school_found: state.data.school_found,
        school_modules: state.data.school_modules,
        school_staff: state.data.school_staff,
        tab: tab,
        curr_route: state.routing.locationBeforeTransitions.pathname,
        curr_school_liked: state.data.curr_school_liked
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
export default class SchoolView extends React.Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.getSchool(this.props.params.school_id)
    }

    componentWillReceiveProps(nextProps) { }

    handleTabClick(e) {
        e.preventDefault()
        this.props.switchTab(e.target.value, this.props.curr_route);
    }

    render() {
        let school = this.props.school
        let school_name = '';
        let color_code = '44,62,80'
        if (this.props.school_found) {
            school_name = 'School of ' + school.name;
            if (
                school.name.indexOf('Centre') !== -1 ||
                school.name.indexOf('Academy') !== -1 ||
                school.name.indexOf('Institute') !== -1 ||
                school.name.indexOf('Beijing') !== -1 ||
                school.name.indexOf('Admin') !== -1
            ) {
                school_name = school.name;
            }

            if (school.color_code) color_code = school.color_code
        }

        let documentTitle = 'UCD Modules';
        if(school_name.length > 0) documentTitle = school_name + " | UCD Modules";



        return (
            this.props.school_found ?
            <DocumentTitle title={documentTitle} >
                <div className="col-md-12">
                    {/* <h1></h1> */}
                    <div className="jumbotron " style={
                        {
                            backgroundImage: "url('" + school.image_url + "')",
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: 'cover',
                            height: '310px',
                            boxShadow: 'inset 0 0 0 2000px rgb(' + color_code + ',0.83)'
                        }
                    }>
                        {/* <img className="card-img" src={school.image_url} alt="Card image" /> */}

                        {/* <div className="card-img-overlay"> */}
                        <p className='lead' style={{textAlign: 'right'}} ><LikeButton liked={this.props.curr_school_liked} type={'school'} item_id={school.url_name} like_style={'white'}/></p>
                        <h1 style={{ textAlign: 'center', color: 'white' }}>{school_name}</h1>
                        
                        {/* </div> */}
                    </div>

                    <div className="btn-group btn-group-toggle col-sm-12" data-toggle="buttons" style={{ width: '100%' }} >
                        <button
                            className={"btn btn-primary btn-lg " + (this.props.tab === 'modules' ? "active" : "")}
                            style={{ width: '50%' }}
                            value='modules'
                            onClick={this.handleTabClick.bind(this)}
                        >
                            Modules
                            <span className="badge badge-primary badge-pill" style={{ marginLeft: '15px' }}>{school.count_modules}</span>
                        </button>
                        {/* <button
                            className={"btn btn-primary btn-lg " + (this.props.tab === 'subjects' ? "active" : "")}
                            style={{ width: '33.33%' }}
                            value='subjects'
                            onClick={this.handleTabClick.bind(this)}
                        >
                            Subjects
                            <span className="badge badge-primary badge-pill" style={{ marginLeft: '15px' }}>{school.count_subjects}</span>
                        </button> */}
                        <button
                            className={"btn btn-primary btn-lg " + (this.props.tab === 'staff' ? "active" : "")}
                            style={{ width: '50%' }}
                            value='staff'
                            onClick={this.handleTabClick.bind(this)}
                        >
                            Staff
                            <span className="badge badge-primary badge-pill" style={{ marginLeft: '15px' }}>{school.count_staff}</span>
                        </button>
                    </div>

                    <br />
                    <br />
                    <br />
                    <br />

                    <div className="col-sm-12">
                        {{
                            'staff': (
                                [].concat(this.props.school_staff)
                                    .sort((a, b) => a.last_name > b.last_name)
                                    .map(member => {
                                        if (member.name !== 'Unknown') {
                                            return <StaffCard member={member} key={member.id} />
                                        }
                                    })
                                ),
                            'subjects': (<div />),
                            'modules': (
                                [].concat(this.props.school_modules)
                                .sort((a, b) => a.code_number > b.code_number)
                                .map(module => {
                                    return <ModulePreview key={module.id} module={module} />
                                })
                            ),
                        }[this.props.tab || 'modules']}
                    </div>
                </div>
                </ DocumentTitle>
                :
                <div className="col-md-12">
                </div>
        )



    }
}