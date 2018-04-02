import React from 'react';

import Icon from 'react-fontawesome';
import { Dropdown, MenuItem } from 'react-bootstrap';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as dataActions from '../../actions/data';



function mapDispatchToProps(dispatch) {
    return bindActionCreators(dataActions, dispatch);
}

@connect(null, mapDispatchToProps)
export default class ProfileDropdown extends React.Component {

    constructor(props) {
        super(props);
    }

    signoutMethod() {
        this.props.signoutMethod()
    }

    goToProfile() {
        this.props.navigateTo('/profile','')
    }

    goToModules() {
        this.props.navigateTo('/profile','?tab=modules')
    }
    goToSchools() {
        this.props.navigateTo('/profile','?tab=schools')
    }
    
    goToStaff() {
        this.props.navigateTo('/profile','?tab=staff')
    }

    render() {
        let size = '25'

        let prop_style = this.props.style || {}
        let profile = this.props.profile;

        let style = {
            width: size + 'px',
            height: size + 'px',
            ...prop_style
        }

        let class_name = this.props.isPortrait ? "circle-img img-circle circle-img-portrait" : "circle-img img-circle circle-img-landscape"


        return (
            <Dropdown id="dropdown-user-info" pullRight>
                <Dropdown.Toggle bsStyle='success' bsSize='large'>
                    <div className='row'>
                        <div className="col-xs-6">
                            <div className={class_name} style={style}>

                                <img src={profile.picture_url} />

                            </div>
                        </div>
                        {/* <div className="col-xs-6"><strong>{profile.first_name}</strong></div> */}
                        <div className="col-xs-6"><Icon name='caret-down' style={{ marginTop: '3px' }} /></div>
                    </div>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <MenuItem header>{profile.email}</MenuItem>
                    <MenuItem onClick={this.goToProfile.bind(this)}>{profile.name}</MenuItem>
                    <MenuItem divider />
                    <MenuItem header>Likes</MenuItem>
                    <MenuItem onClick={this.goToModules.bind(this)}>Modules</MenuItem>
                    <MenuItem onClick={this.goToSchools.bind(this)}>Schools</MenuItem>
                    <MenuItem onClick={this.goToStaff.bind(this)}>Staff</MenuItem>
                    <MenuItem divider />
                    <MenuItem onClick={this.signoutMethod.bind(this)}>Sign Out</MenuItem>
                </Dropdown.Menu>
            </Dropdown>

        );

    }
}