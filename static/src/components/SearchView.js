/* eslint camelcase: 0, no-underscore-dangle: 0 */

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper';
import * as actionCreators from '../actions/auth';
import * as dataActions from '../actions/data';

import QueryString from 'query-string';
import ModulePreview from './ModulePreview';
import DocumentTitle from 'react-document-title';



function mapStateToProps(state) {
    let curr_loc = state.routing.locationBeforeTransitions;
    let query = state.data.search_query
    if (curr_loc !== null){
        let params = QueryString.parse(curr_loc.search)
        console.log(params)
        if('q' in params){
            query = params['q']
        }
    }

    return {
        token: state.auth.token,
        userName: state.auth.userName,
        isAuthenticated: state.auth.isAuthenticated,
        search_results: state.data.search_results,
        query: query,
        search_in_progress: state.data.search_in_progress
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
export default class SearchView extends React.Component {

    constructor(props) {
        super(props);

    }

    componentWillMount() {
        this.props.fetchSearchQuery(this.props.query)
    }

    componentWillReceiveProps(nextProps) {
        console.log(nextProps)
    }

    render() {
        let search_results = this.props.search_results;
        let query = this.props.query;

        let result_description = "";
        if(this.props.search_in_progress){
            result_description = "Searching for '" + query + "'...";
        }else if(search_results.length <= 0){
            result_description = "No results were found for '" + query + "'";
        }else if(search_results.length === 1){
            result_description = "1 result was found for '" + query + "'";
        }else{
            result_description = search_results.length + " results were found for '" + query + "'";
        }

        let documentTitle = 'Search UCD Modules';
        if(this.props.query.length > 0) documentTitle = `'${query}' | Search UCD Modules`
            
        return (
            <DocumentTitle title={documentTitle} >
            <div className="col-md-12">
                <div className="well well-sm" style={{textAlign:'center'}}>
                    {result_description}
                </div>
                
                {
                    [].concat(search_results)
                        .sort((a, b) => a.index > b.index)
                        .map(data => {
                        return <ModulePreview key={data.index} module={data.module} />
                        // return <h4 key={data.index}>{data.module.code}: {data.module.long_title}</h4>
                    })
                }
            </div>
            </DocumentTitle>
        );

    }
}