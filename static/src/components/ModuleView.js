/* eslint camelcase: 0, no-underscore-dangle: 0 */

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper';
import * as actionCreators from '../actions/auth';
import * as dataActions from '../actions/data';
import Avatar from './Cards/Avatar';
import { Link } from 'react-router';
import WordCloud from './Cards/WordCloud';
import Icon from 'react-fontawesome';
import { PieChart } from 'react-chartkick';
import DocumentTitle from 'react-document-title';
import SimilarModule from './Cards/Module';
import LikeButton from './Cards/LikeButton';


function mapStateToProps(state) {
    return {
        token: state.auth.token,
        userName: state.auth.userName,
        isAuthenticated: state.auth.isAuthenticated,
        code: state.data.code,
        single_module: state.data.single_module,
        module_coordinator: state.data.module_coordinator,
        module_keywords: state.data.module_keywords,
        module_workload: state.data.module_workload,
        module_assessment: state.data.module_assessment,
        similar_modules: state.data.similar_modules,
        pathname: state.routing.locationBeforeTransitions.pathname,
        curr_module_liked: state.data.curr_module_liked,
        curr_staff_liked: state.data.curr_staff_liked
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
export default class ModuleView extends React.Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.getSingleModule(this.props.params.code)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.pathname !== this.props.pathname) {
            this.props.getSingleModule(nextProps.params.code)
        }
    }

    render() {
        let officialLink = `www.ucd.ie/modules/${this.props.params.code}`;

        let workloadItems = this.props.module_workload.filter(item => item.title.indexOf('Total Workload') === -1);

        let workloadData = workloadItems.map(item => [item.title, item.hours]);

        let assessmentData = this.props.module_assessment.map(item => [item.title, item.percentage]);

        let workloadTotal = 0;
        workloadItems.forEach(item => workloadTotal += parseInt(item.hours));

        let documentTitle = `${this.props.params.code} | UCD Modules`;
        if (this.props.single_module.hasOwnProperty('long_title')) {
            documentTitle = `${this.props.params.code}: ${this.props.single_module.long_title} | UCD Modules`;
        }


        return (
            <DocumentTitle title={documentTitle} >
                <div className="col-md-12">
                <div className="d-flex w-100 justify-content-between">  
                    <h1><b>{this.props.params.code}</b>: {this.props.single_module.long_title}</h1>
                    <h1><LikeButton style={{padding:'0 0'}} type={'module'} item_id={this.props.single_module.code} liked={this.props.curr_module_liked} item_name={this.props.single_module.code} /></h1>
                    </div>
                    <hr />
                    <div className="col-md-5">
                        <div className="list-group">
                            <div className="list-group-item">
                                <div className="d-flex w-100 justify-content-between">
                                    <h6 className="list-group-item-heading">Module Coordinator</h6>
                                    <LikeButton type={'staff'} item_id={this.props.module_coordinator.url_name} liked={this.props.curr_staff_liked} item_name={this.props.module_coordinator.name}/>
                                </div>

                                <Avatar src={this.props.module_coordinator.image_url} size={100} style={{ margin: '15px auto' }} isPortrait={this.props.module_coordinator.image_portrait} />
                                <span className="list-group-item-text" style={{ textAlign: 'center' }}>
                                    <p style={{ textAlign: 'center', fontWeight: 'bold' }}>{this.props.module_coordinator.short_title}</p>

                                    <h4><Link to={'/staff/' + this.props.module_coordinator.url_name}>{this.props.module_coordinator.name}</Link></h4>
                                </span>
                            </div>
                        </div>
                        <div className="list-group">
                            <div className="list-group-item">
                                <h6 className="list-group-item-heading">Official UCD Page</h6>
                                <p className="list-group-item-text"><a href={`http://${officialLink}`} target='_blank'>{officialLink}</a><Icon style={{ marginLeft: '9px' }} name='external-link' /></p>
                            </div>
                        </div>
                        <div className="list-group">
                            <div className="list-group-item">
                                <h6 className="list-group-item-heading">Code</h6>
                                <p className="list-group-item-text"><b>{this.props.single_module.code}</b></p>
                            </div>
                            <div className="list-group-item">
                                <h6 className="list-group-item-heading">School</h6>
                                <p className="list-group-item-text"><Link to={'school/' + this.props.single_module.school}>{this.props.single_module.school}</Link></p>
                            </div>
                            <div className="list-group-item">
                                <h6 className="list-group-item-heading">Subject</h6>
                                <p className="list-group-item-text">{this.props.single_module.subject}</p>
                            </div>
                        </div>
                        <div className="list-group">
                            <div className="list-group-item">
                                <h6 className="list-group-item-heading">Credits</h6>
                                <p className="list-group-item-text">{this.props.single_module.credits}</p>
                            </div>
                        </div>
                        <div className="list-group">
                            <div className="list-group-item">
                                <h6 className="list-group-item-heading">Level</h6>
                                <p className="list-group-item-text">{this.props.single_module.level}</p>
                            </div>
                            <div className="list-group-item">
                                <h6 className="list-group-item-heading">Semester</h6>
                                <p className="list-group-item-text">{this.props.single_module.semester}</p>
                            </div>
                        </div>
                        {
                            workloadData.length > 0 ?
                                <div className="list-group">
                                    <div className="list-group-item">
                                        <h6 className="list-group-item-heading">Workload</h6>
                                        <PieChart data={workloadData} />
                                    </div>
                                    <div className="list-group-item">
                                        <h6 className="list-group-item-heading">Total Workload</h6>
                                        <p className="list-group-item-text">{workloadTotal} hours</p>
                                    </div>
                                </div>
                                :
                                <div></div>
                        }
                        {
                            assessmentData.length > 0 ?
                                <div className="list-group">
                                    <div className="list-group-item">
                                        <h6 className="list-group-item-heading">Assessment</h6>
                                        <PieChart data={assessmentData} />
                                    </div>
                                </div>
                                :
                                <div></div>
                        }
                    </div>
                    <div className="col-md-7">
                        <div className="card bg-light mb-3">
                            <div className="card-header">Description</div>
                            <div className="card-body">
                                <p className="card-text">
                                    {this.props.single_module.description}
                                </p>
                            </div>
                        </div>
                        <br />
                        <div className="card bg-light mb-3">
                            <div className="card-header">Learning Outcomes</div>
                            <div className="card-body">
                                <p className="card-text">{this.props.single_module.learning_outcomes}</p>
                            </div>
                        </div>
                        <br />
                        <WordCloud wordDict={this.props.module_keywords} />
                    </div>
                    <br />
                    <br />
                    <br />
                    <br />
                    {
                        this.props.similar_modules.length > 0 ?
                            <div>
                                <div className='col-xs-12 col-md-12'>
                                    <h3 style={{}}><em>Similar Modules to <b>{this.props.params.code}</b></em></h3>
                                    <hr />
                                    <div>
                                        {
                                            this.props.similar_modules.sort((a, b) => a.index > b.index).map(similar => {

                                                return <div className='col-md-4' key={similar.index}>
                                                    <SimilarModule module={similar.module} />
                                                </div>
                                            })
                                        }
                                    </div>
                                </div>
                            </div>
                            : <div></div>
                    }

                </div>
            </DocumentTitle>
        );

    }
}