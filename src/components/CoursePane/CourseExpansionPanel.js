import React, {Component} from 'react';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SectionTable from "./SectionTable";

class CourseExpansionPanel extends Component {
    render() {
        const name = this.props.courseData.name;

        return (
            <ExpansionPanel>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                    <Typography>{name[0]} {name[1]}</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <SectionTable handleAddClass={this.props.handleAddClass} courseData={this.props.courseData}/>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        );
    }
}

export default CourseExpansionPanel;

