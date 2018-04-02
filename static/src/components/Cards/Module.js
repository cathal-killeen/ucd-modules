import React from 'react';
import { Link } from 'react-router';
import TextTruncate from 'react-text-truncate';

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
        let module = this.props.module

        return (
            <div>
                <div className="card">
                    <div className="card-body" style={{ marginLeft: '15px', marginRight: '15px' }}>
                        <h4 className="card-title">
                            <Link to={'/modules/' + module.code} >
                                <b>{module.code}</b>
                            </Link>
                            <Link to={'/modules/' + module.code} >
                                <TextTruncate line={1} text={`${module.short_title}`} />
                            </Link>
                        </h4>
                        <Link to={'/school/' + module.school} >
                            <b><h5 className="card-subtitle mb-2 text-muted">{module.school}</h5></b>
                        </Link>
                        <span className="card-text">
                            <TextTruncate line={4} text={module.description} />
                        </span>
                    </div>
                </div>
                <br />
            </div>
        );

    }
}