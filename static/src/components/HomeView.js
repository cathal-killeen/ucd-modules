/* eslint camelcase: 0, no-underscore-dangle: 0 */

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper';
import * as authActions from '../actions/auth';
import * as dataActions from '../actions/data';
import { Link } from 'react-router';
import DocumentTitle from 'react-document-title';

import QueryString from 'query-string';
import ModulePreview from './ModulePreview';

import LazyLoad from 'react-lazyload';

import Slider from 'react-slick';

import Icon from 'react-fontawesome';

import ModuleCard from './Cards/Module'
import StaffCard from './Cards/Staff'

function SampleNextArrow(props) {
    const { className, style, onClick } = props
    return (
        <div
            className={className}
            style={{ ...style, display: 'block', background: '#D3D3D3' }}
            onClick={onClick}
        ></div>
    );
}

function SamplePrevArrow(props) {
    const { className, style, onClick } = props
    return (
        <div
            className={className}
            style={{ ...style, display: 'block', background: '#D3D3D3' }}
            onClick={onClick}
        ></div>
    );
}

const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    arrows: true,
    lazyload: true,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
}

const staffSliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 4,
    arrows: true,
    lazyload: true,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
}

function mapStateToProps(state) {
    let recommended_modules = state.auth.recommended_modules.filter(el => el.module.description.length > 0);

    let r_series_1 = recommended_modules.filter((el, index) => index % 2);
    let r_series_2 = recommended_modules.filter((el, index) => !(index % 2));

    return {
        schools: state.data.all_schools,
        user_logged_in: state.auth.user_logged_in,
        routing: state.routing.locationBeforeTransitions,
        module_likes: state.auth.module_likes,
        school_likes: state.auth.school_likes,
        staff_likes: state.auth.staff_likes,
        r_series_1,
        r_series_2,
        recs_exist: recommended_modules.length > 0 ? true : false,
        user_profile: state.auth.user_profile
    };
}

function mapDispatchToProps(dispatch) {
    return {
        dataActions: bindActionCreators(dataActions, dispatch),
        authActions: bindActionCreators(authActions, dispatch),
    }
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
export default class HomeView extends React.Component {

    constructor(props) {
        super(props);

    }

    componentWillMount() {
        this.props.dataActions.getSchools();
        this.props.authActions.getUserLikes();
        this.props.authActions.getUserRecommendations();

    }

    componentWillReceiveProps(nextProps) { }

    render() {
        let schools = this.props.schools;

        let redirectTo = "";

        if (this.props.routing['pathname']) {
            redirectTo = "?redirectTo=" + this.props.routing.pathname;
        }

        return (
            <DocumentTitle title={'Home | UCD Modules'} >
                <div className="col-md-12">
                    <div>
                        {
                            this.props.user_logged_in ?
                                <div />
                                :
                                <div className="jumbotron" style={{ textAlign: 'center' }}>
                                    <h1>Welcome to UCD Modules</h1>
                                    <br />
                                    <h3>Search, explore and discover the vast range of modules on offer at UCD.</h3>
                                    <br />
                                    <h4>Login or create an account to save your favourite modules, schools and module co-ordinators.
                            You will also recieve module recommendations personalised for you.</h4>
                                    <br />
                                    <h5 className="text-muted">Use your Google Account (@ucdconnect.ie or @ucd.ie) to connect to UCD Modules</h5>
                                    <br />
                                    <a href={"/api/login" + redirectTo} className="btn btn-danger btn-lg"><b><Icon name="google" style={{ marginRight: '20px' }} />Connect with Google</b></a>
                                    <br />
                                    <br />
                                </div>
                        }
                    </div>
           
                    <div>
                        {
                            this.props.recs_exist ?
                                <div>
                                    <h2>Top Recommendations for {this.props.user_profile['first_name'] || 'You'}</h2>
                                    <hr />
                                    <div>
                                    {
                                        this.props.r_series_1.length > 0 ?
                                            < div >
                                                <div style={{ height: '200px' }}>
                                                    <Slider {...sliderSettings} >
                                                        {
                                                            [].concat(this.props.r_series_1)
                                                                .map(rec => {
                                                                    return <div key={rec.module.code} className="col-sm-4">
                                                                        <ModuleCard module={rec.module} />
                                                                    </div>
                                                                })
                                                        }
                                                    </Slider>
                                                </div>
                                            </div>
                                            :
                                            <div />
                                    }
                                    </div>
                                    <br />
                                    <br />
                                    <br />
                                    <div>
                                    {
                                        this.props.r_series_2.length > 0 ?
                                            < div >
                                                <div style={{ height: '200px' }}>
                                                    <Slider {...sliderSettings} >
                                                        {
                                                            [].concat(this.props.r_series_2)
                                                                .map(rec => {
                                                                    return <div key={rec.module.code} className="col-sm-4">
                                                                        <ModuleCard module={rec.module} />
                                                                    </div>
                                                                })
                                                        }
                                                    </Slider>
                                                </div>
                                            </div>
                                            :
                                            <div />
                                    }
                                    </div>
                                </div>
                                :
                                <div />
                        }
                    </div>
                    <br />
                    <br />
                    <br />
                    <h2>UCD Schools</h2>
                    <hr />
                    <div style={{ height: '220px' }}>
                        <Slider {...sliderSettings} >
                            {
                                [].concat(schools)
                                    .sort((a, b) => a.url_name > b.url_name)
                                    .map(school => {
                                        let school_name = 'School of ' + school.name;
                                        if (
                                            school.name.indexOf('Centre') !== -1 ||
                                            school.name.indexOf('Academy') !== -1 ||
                                            school.name.indexOf('Institute') !== -1 ||
                                            school.name.indexOf('Beijing') !== -1 ||
                                            school.name.indexOf('Admin') !== -1
                                        ) {
                                            school_name = school.name;
                                        }

                                        let color_code = '44,62,80'
                                        if (school.color_code) color_code = school.color_code
                                        return <div className="col-md-6 col-lg-4 col-sm-12" key={school.id}>
                                            {/* <LazyLoad height={200} offset={300} > */}
                                            <div className="jumbotron " style={
                                                {
                                                    backgroundImage: "url('" + school.image_url + "')",
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundSize: 'cover',
                                                    height: '200px',
                                                    boxShadow: 'inset 0 0 0 2000px rgb(' + color_code + ',0.8)',
                                                    padding: '50px 15px'
                                                }
                                            }>
                                                <Link to={'/school/' + school.url_name}>
                                                    <h3 style={{ textAlign: 'center', color: 'white' }}>
                                                        {school_name}
                                                    </h3>
                                                </Link>
                                            </div>
                                            {/* </LazyLoad> */}
                                        </div>
                                    })
                            }
                        </Slider>
                    </div>
                    <br />
                    <br />

                    {/* favourites section */}
                    {
                        this.props.user_logged_in ?
                            <div>
                                {/* schools */}
                                <div>
                                    {
                                        this.props.school_likes.length > 0 ?
                                            < div >
                                                <h2>Your Favourite Schools</h2>
                                                <hr />
                                                <div style={{ height: '220px' }}>
                                                    <Slider {...sliderSettings} >
                                                        {
                                                            [].concat(this.props.school_likes)
                                                                .sort((a, b) => a.url_name > b.url_name)
                                                                .map(school => {
                                                                    let school_name = 'School of ' + school.name;
                                                                    if (
                                                                        school.name.indexOf('Centre') !== -1 ||
                                                                        school.name.indexOf('Academy') !== -1 ||
                                                                        school.name.indexOf('Institute') !== -1 ||
                                                                        school.name.indexOf('Beijing') !== -1 ||
                                                                        school.name.indexOf('Admin') !== -1
                                                                    ) {
                                                                        school_name = school.name;
                                                                    }

                                                                    let color_code = '44,62,80'
                                                                    if (school.color_code) color_code = school.color_code
                                                                    return <div className="col-md-6 col-lg-4 col-sm-12" key={school.id}>
                                                                        {/* <LazyLoad height={200} offset={300} > */}
                                                                        <div className="jumbotron " style={
                                                                            {
                                                                                backgroundImage: "url('" + school.image_url + "')",
                                                                                backgroundRepeat: 'no-repeat',
                                                                                backgroundSize: 'cover',
                                                                                height: '200px',
                                                                                boxShadow: 'inset 0 0 0 2000px rgb(' + color_code + ',0.8)',
                                                                                padding: '50px 15px'
                                                                            }
                                                                        }>
                                                                            <Link to={'/school/' + school.url_name}>
                                                                                <h3 style={{ textAlign: 'center', color: 'white' }}>
                                                                                    {school_name}
                                                                                </h3>
                                                                            </Link>
                                                                        </div>
                                                                        {/* </LazyLoad> */}
                                                                    </div>
                                                                })
                                                        }
                                                    </Slider>
                                                </div>
                                            </div>
                                            :
                                            <div />
                                    }
                                </div>

                                <div>
                                    {
                                        this.props.module_likes.length > 0 ?
                                            < div >
                                                <h2>Your Favourite Modules</h2>
                                                <hr />
                                                <div style={{ height: '220px' }}>
                                                    <Slider {...sliderSettings} >
                                                        {
                                                            [].concat(this.props.module_likes)
                                                                .sort((a, b) => a.code > b.code)
                                                                .map(mod => {
                                                                    return <div key={mod.code} className="col-sm-4">
                                                                        <ModuleCard module={mod} />
                                                                    </div>
                                                                })
                                                        }
                                                    </Slider>
                                                </div>
                                            </div>
                                            :
                                            <div />
                                    }
                                </div>

                                <div>
                                    {
                                        this.props.staff_likes.length > 0 ?
                                            < div >
                                                <h2>Your Favourite Staff</h2>
                                                <hr />
                                                <div style={{ height: '220px' }}>
                                                    <Slider {...staffSliderSettings} >
                                                        {
                                                            [].concat(this.props.staff_likes)
                                                                .sort((a, b) => a.url_name > b.url_name)
                                                                .map(staff => <StaffCard key={staff.id} member={staff} />)
                                                        }
                                                    </Slider>
                                                </div>
                                            </div>
                                            :
                                            <div />
                                    }
                                </div>
                            </div>
                            :
                            <div />
                    }
                </div>
            </DocumentTitle>
        );

    }
}