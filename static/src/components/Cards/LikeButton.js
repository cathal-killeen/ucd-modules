import React from 'react';
import { connect } from 'react-redux';
import * as dataActions from '../../actions/data';
import { bindActionCreators } from 'redux';
import Icon from 'react-fontawesome';

function mapStateToProps(state) {
    return {}
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(dataActions, dispatch);
}

@connect(mapStateToProps, mapDispatchToProps)
export default class LikeButton extends React.Component {

    constructor(props) {
        super(props);
    }

    handleLike() {
        console.log('like')
        this.props.likeItem(this.props.type, this.props.item_id);
    }

    handleUnlike() {
        console.log('unlike')
        this.props.unlikeItem(this.props.type, this.props.item_id);
    }

    render() {
        

        return (
            this.props.liked ?
                <button className="btn btn-link" style={{padding: '0 4px', color: (this.props.like_style === 'white') ? 'white':'#FFBF00'}} onClick={this.handleUnlike.bind(this)}><Icon size='2x' name='star' /></button>
            :
                <button className="btn btn-link" style={{padding: '0 4px', color: (this.props.like_style === 'white') ? 'white':'#FFBF00'}} onClick={this.handleLike.bind(this)}><Icon size='2x' name='star-o' /></button>
        );

    }
}