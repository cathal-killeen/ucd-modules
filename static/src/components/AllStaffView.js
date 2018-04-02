/* eslint camelcase: 0, no-underscore-dangle: 0 */

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actionCreators from '../actions/auth';
import * as dataActions from '../actions/data';
import { Link } from 'react-router';
import LazyLoad from 'react-lazyload'

import StaffCard from './Cards/Staff';
import DocumentTitle from 'react-document-title';


function mapStateToProps(state) {
    return {
        token: state.auth.token,
        userName: state.auth.userName,
        isAuthenticated: state.auth.isAuthenticated,
        staff: state.data.all_staff,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(dataActions, dispatch);
}

const style = {
    marginTop: 50,
    paddingBottom: 50,
    paddingTop: 25,
    width: '100%',
    textAlign: 'center',
    display: 'inline-block',
};

@connect(mapStateToProps, mapDispatchToProps)
export default class AllStaffView extends React.Component {

    constructor(props) {
        super(props);

    }

    componentWillMount() {
        this.props.getAllStaff()
    }

    componentWillReceiveProps(nextProps) { }

    render() {
        let staff = this.props.staff
        return (
            <DocumentTitle title={'UCD Staff | UCD Modules'} >
            <div className="col-md-12">
                <h1>UCD Staff</h1>
                <hr />
                {
                    [].concat(staff)
                        .sort((a, b) => a.last_name > b.last_name)
                        .map(member => {
                            if (member.name !== 'Unknown') {
                                return <StaffCard member={member} key={member.id} />
                            }
                        })

                }
            </div>
            </DocumentTitle>
        );

    }
}