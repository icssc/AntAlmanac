import React, {Component} from 'react';
import Paper from '@material-ui/core/Paper'
import CourseExpansionPanel from "./CourseExpansionPanel";
import data from './sample_course_data.json';

console.log(data.departments[0].courses);

class CoursePane extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Paper>
                {data.departments[0].courses.map((course, index) => {
                    return (<CourseExpansionPanel key={index} courseData={course}/>)
                })}
            </Paper>
        );
    }
}

export default CoursePane;

