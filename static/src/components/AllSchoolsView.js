/* eslint camelcase: 0, no-underscore-dangle: 0 */

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper';
import * as actionCreators from '../actions/auth';
import * as dataActions from '../actions/data';
import { Link } from 'react-router';
import DocumentTitle from 'react-document-title';

import QueryString from 'query-string';
import ModulePreview from './ModulePreview';

import LazyLoad from 'react-lazyload';



function mapStateToProps(state) {
    return {
        token: state.auth.token,
        userName: state.auth.userName,
        isAuthenticated: state.auth.isAuthenticated,
        schools: state.data.all_schools,
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
export default class AllSchoolsView extends React.Component {

    constructor(props) {
        super(props);

    }

    componentWillMount() {
        this.props.getSchools()
    }

    componentWillReceiveProps(nextProps) {}

    render() {
        let schools = this.props.schools

       

        return (
            <DocumentTitle title={'UCD Schools | UCD Modules'} >
            <div className="col-md-12">
                <h1>UCD Schools</h1>
                <hr />
                {
                    [].concat(schools)
                    .sort((a, b) => a.url_name > b.url_name)
                        .map(school => {
                            let school_name = 'School of ' + school.name;
                            if(
                                school.name.indexOf('Centre') !== -1 ||
                                school.name.indexOf('Academy') !== -1 ||
                                school.name.indexOf('Institute') !== -1 ||
                                school.name.indexOf('Beijing') !== -1 ||
                                school.name.indexOf('Admin') !== -1 
                            ){
                                school_name = school.name;
                            }

                            let color_code = '44,62,80'
                            if(school.color_code) color_code = school.color_code
                            return <div className="col-md-6 col-lg-4 col-sm-12" key={school.id}>
                            <LazyLoad height={200} offset={300} >
                                <div className="jumbotron " style={
                                    {
                                        backgroundImage: "url('" + school.image_url + "')",
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'cover',
                                        height: '200px',
                                        boxShadow: 'inset 0 0 0 2000px rgb('+ color_code + ',0.8)',
                                        padding: '50px 15px'
                                    }
                                }>
                                <Link to={'/school/' + school.url_name}>
                                    <h3 style={{ textAlign: 'center', color: 'white' }}>
                                        {school_name}
                                    </h3>
                                </Link>
                                </div>
                            </LazyLoad>
                            </div>
                        })
                }
            </div>
            </DocumentTitle>
        );

    }
}