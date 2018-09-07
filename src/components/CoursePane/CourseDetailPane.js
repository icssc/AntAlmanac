import React, {Component, Fragment} from 'react';
import {IconButton, Typography} from "@material-ui/core";
import {ArrowBack} from '@material-ui/icons';
import SectionTable from "./SectionTable";
import './sectiontable.css'
import AlmanacGraphWrapped from "../AlmanacGraph/AlmanacGraph";

class CourseDetailPane extends Component {

    getCourseCode = () =>{
        const code= [];
        this.props.courseDetails.sections.map(elem =>{
           
            if(elem.classType === 'Lec')
                code.push(elem.classCode);
            
        });
        return code;
    }

    render() {
    
        return (
            <div style={{
                overflow: 'auto',
                height: '100%',
                backgroundColor: 'white'}}>
                <div style={{
                    display: 'inline-flex'
                }}>
                    <IconButton style={{marginRight: 24}} onClick={this.props.onDismissDetails}>
                        <ArrowBack/>
                    </IconButton>

                    <Typography variant='title' style={{flexGrow: '1', marginTop: 12}}>
                        {this.props.courseDetails.name[0] + ' ' + this.props.courseDetails.name[1]}
                    </Typography>
                    
                </div>
                <AlmanacGraphWrapped courseCode={this.getCourseCode()}  term = {this.props.term} courseDetails={this.props.courseDetails}/>
                <SectionTable style={{marginTop: 12}}
                              courseDetails={this.props.courseDetails}
                              onAddClass={this.props.onAddClass}/>
            </div>
        );
    }
}

export default CourseDetailPane;