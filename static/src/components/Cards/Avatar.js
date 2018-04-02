import React from 'react';

import LazyLoad from 'react-lazyload';
import Icon from 'react-fontawesome';

export default class Avatar extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let size = this.props.size || '50'

        let prop_style = this.props.style || {}

        let style = {
            width: size + 'px',
            height: size + 'px',
            ...prop_style
        }

        let class_name = this.props.isPortrait ? "circle-img img-circle circle-img-portrait" : "circle-img img-circle circle-img-landscape"


        return (
            <LazyLoad height={size} offset={400}>
                <div className={class_name} style={style}>

                    <img src={this.props.src} />

                </div>
            </LazyLoad>
        );

    }
}