import React, {Component, Fragment} from 'react';
import Paper from '@material-ui/core/Paper'
import CourseExpansionPanel from "./CourseExpansionPanel";
// import data from './sample_course_data.json';

class CoursePane extends Component {
    constructor(props) {
        super(props);
        this.state = {courseData: null, loaded: false};
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return this.state !== nextState || nextProps.formData !== this.props.formData;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {dept, term, ge} = this.props.formData;

        if (prevProps !== this.props) {
            const url = new URL("https://websocserver.herokuapp.com/");

            const params = {department: dept, term: term, GE: ge};
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

            fetch(url.toString()).then((resp) => {
                    return resp.json();
                }
            ).then((jsonObj) => this.setState({courseData: jsonObj[0].departments[0].courses, loaded: true}));
        }
    }

    render() {
        return (
            <Fragment>
                {this.state.loaded && this.state.courseData.map((course, index) => {
                    return (<CourseExpansionPanel handleAddClass={this.props.handleAddClass} key={index} courseData={course}/>)
                })}
            </Fragment>
        );
    }
}

export default CoursePane;

