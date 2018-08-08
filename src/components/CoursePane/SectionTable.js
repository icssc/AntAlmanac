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
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding='none'>Add</TableCell>
                            <TableCell padding='none'>Code</TableCell>
                            <TableCell padding='none'>Type</TableCell>
                            <TableCell padding='none'>Sec</TableCell>
                            <TableCell padding='none'>Units</TableCell>
                            <TableCell padding='none'>Instructors</TableCell>
                            <TableCell padding='none'>Time</TableCell>
                            <TableCell padding='none'>Place</TableCell>
                            <TableCell padding='none'>Max</TableCell>
                            <TableCell padding='none'>Restr</TableCell>
                            <TableCell padding='none'>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sectionInfo.map((section) => {
                            return (
                                <TableRow key={section.classCode}>
                                    <TableCell padding='none'>
                                        <IconButton aria-label="Add Class"><AddCircle/></IconButton>
                                    </TableCell>
                                    <TableCell padding='none'>{section.classCode}</TableCell>
                                    <TableCell padding='none'>{section.classType}</TableCell>
                                    <TableCell padding='none'>{section.sectionCode}</TableCell>
                                    <TableCell padding='none'>{section.units}</TableCell>
                                    <TableCell padding='none'>{SectionTable.withLinebreak(section.instructors)}</TableCell>
                                    <TableCell padding='none'>{SectionTable.withLinebreak(section.meetings.map(meeting => meeting[0]))}</TableCell>
                                    <TableCell padding='none'>{SectionTable.withLinebreak(section.meetings.map(meeting => meeting[1]))}</TableCell>
                                    <TableCell padding='none'><p>
                                        {section.numCurrentlyEnrolled[0]}/{section.maxCapacity}<br/>
                                        WL: {section.numOnWaitlist}<br/>
                                        NOR: {section.numNewOnlyReserved}
                                        </p>
                                    </TableCell>
                                    <TableCell padding='none'>{section.restrictions}</TableCell>
                                    <TableCell padding='none'>{section.status}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
        );
    }
}

export default SectionTable;