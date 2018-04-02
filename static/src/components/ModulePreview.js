import React from 'react';
import { Link } from 'react-router';
import TextTruncate from 'react-text-truncate';
import Icon from 'react-fontawesome';

const number_style = {
    fontWeight: '400',
    padding: '10px 14px',
    color: '#86929e'
}

export default class ModulePreview extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let module = this.props.module;
        return (
            <div>

                <div className="card">
                    <div className="card-body" style={{ marginLeft: '15px', marginRight: '15px' }}>
                        <Link to={'/modules/' + module.code} >
                            <h3 className="card-title"><b>{module.code}</b>: {module.long_title}</h3>
                        </Link>
                        <div style={{ marginTop: '10px' }}>
                        <Link to={'/school/' + module.school}>
                        <h4 className="card-subtitle mb-2 text-muted" >
                            {module.school}
                            </h4>
                        </Link>
                        </div>

                        <div className="card-text" style={{ marginTop: '8px' }}>
                            <TextTruncate line={3} text={module.description} />
                        </div>
                        <div>
                            {
                                this.props.hide_meta_bar ?
                                    <div></div>
                                    :
                                    <div>
                                        <h5 style={{marginTop:'18px'}}>
                                            <Link to={'/staff/' + module.module_coordinator}>{module.module_coordinator}</Link>
                                        </h5>
                                    </div>

                            }
                        </div>
                    </div>
                </div>

                <br />
            </div>
        );

    }
}