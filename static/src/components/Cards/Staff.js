import React from 'react';
import { Link } from 'react-router';
import TextTruncate from 'react-text-truncate';
import Icon from 'react-fontawesome';
import { connect } from 'react-redux';
import * as dataActions from '../../actions/data';
import { bindActionCreators } from 'redux';
import Avatar from './Avatar';

function mapStateToProps(state) {
    return {}
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(dataActions, dispatch);
}

const number_style = {
    fontWeight: '400',
    padding: '10px 14px',
    color: '#86929e'
}

@connect(mapStateToProps, mapDispatchToProps)
export default class ModulePreview extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let member = this.props.member;
        return (
            <div className="col-md-4 col-lg-2 col-xs-6" key={member.id} style={{ textAlign: 'center', margin: '15px 0' }}>
                <div className="card">
                    <div style={{ padding: '15px 0' }}>
                        <Avatar src={member.image_url} size={100} style={{ margin: '15px auto' }} isPortrait={member.image_portrait} />
                    </div>
                    <div className="card-footer">
                        <h5><Link to={'/staff/'+member.url_name}><TextTruncate line={1} text={member.name} /></Link></h5>
                    </div>
                    { this.props.showUnlike ?
                        <div className="card-footer">
                            <button type="button" className="btn btn-link" style={{color: '#e74c3c'}}><Icon name='times' style={{marginRight: '7px'}}/>Unlike</button>
                        </div>
                        :
                        <div></div>
                    }
                </div>
            </div>
        );

    }
}