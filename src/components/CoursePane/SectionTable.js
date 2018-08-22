import React, {Component, Fragment} from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import AddCircle from '@material-ui/icons/AddCircle'
import IconButton from "@material-ui/core/IconButton/IconButton";

class SectionTable extends Component {
    constructor(props) {
        super(props);
    }

    static withLinebreak(arr) {
        return arr.map((item, index) => {
            return (<Fragment key={index}>{item}<br/></Fragment>);
        })
    }

    render() {
        const sectionInfo = this.props.courseData.sections;

        return (
            <Table padding='none'>
                <TableHead>
                    <TableRow>
                        <TableCell>{}</TableCell>
                        <TableCell>Code</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Sec</TableCell>
                        <TableCell>Units</TableCell>
                        <TableCell>Instructors</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Place</TableCell>
                        <TableCell>Enrollment</TableCell>
                        <TableCell>Restr</TableCell>
                        <TableCell>Status</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sectionInfo.map((section) => {
                        return (
                            <TableRow key={section.classCode}>
                                <TableCell>
                                    <IconButton aria-label="Add Class"
                                                onClick={() => this.props.handleAddClass(section, this.props.courseData.name)}><AddCircle/></IconButton>
                                </TableCell>
                                <TableCell>{section.classCode}</TableCell>
                                <TableCell>{section.classType}</TableCell>
                                <TableCell>{section.sectionCode}</TableCell>
                                <TableCell>{section.units}</TableCell>
                                <TableCell>{SectionTable.withLinebreak(section.instructors)}</TableCell>
                                <TableCell
                                   >{SectionTable.withLinebreak(section.meetings.map(meeting => meeting[0]))}</TableCell>
                                <TableCell
                                   >{SectionTable.withLinebreak(section.meetings.map(meeting => meeting[1]))}</TableCell>
                                <TableCell><p>
                                    {section.numCurrentlyEnrolled[0]}/{section.maxCapacity}<br/>
                                    WL: {section.numOnWaitlist}<br/>
                                    NOR: {section.numNewOnlyReserved}
                                </p>
                                </TableCell>
                                <TableCell>{section.restrictions}</TableCell>
                                <TableCell>{section.status}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        );
    }
}

export default SectionTable;