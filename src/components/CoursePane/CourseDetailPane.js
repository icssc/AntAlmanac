import React, {Component} from 'react';
import {IconButton, Typography} from "@material-ui/core";
import {ArrowBack} from '@material-ui/icons';
import SectionTable from "./SectionTable";
import "./sectiontable.css";
import course_info from "./course_info.json";
import Paper from "@material-ui/core/Paper";
import AlmanacGraphWrapped from "../AlmanacGraph/AlmanacGraph";

class CourseDetailPane extends Component {
    render() {
        return (
            <div style={{
                overflow: 'auto',
                height: '100%',
                backgroundColor: 'white'}}>
                <Paper style={{
                    overflow: 'auto',
                    display: 'inline'
                }}>
                    <IconButton style={{marginRight: 24}} onClick={this.props.onDismissDetails}>
                        <ArrowBack/>
                    </IconButton>

                    <Typography variant='title' style={{flexGrow: '2', marginTop: 12}}>
                        {this.props.courseDetails.name[0] + ' ' + this.props.courseDetails.name[1]}
                    </Typography>

                    <AlmanacGraphWrapped term = {this.props.term} courseDetails={this.props.courseDetails}/>
                </Paper>

                <div
                    style={{ margin: 20 }}
                    className="course_info"
                    dangerouslySetInnerHTML={{
                        __html:
                            course_info[this.props.courseDetails.name[0]][this.props.courseDetails.name[1]]
                    }}
                />

                <SectionTable style={{marginTop: 12}}
                              courseDetails={this.props.courseDetails}
                              onAddClass={this.props.onAddClass}/>
            </div>
        );
    }
}

export default CourseDetailPane;
