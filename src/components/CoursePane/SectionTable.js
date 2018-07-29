import React, {Component} from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper'

class SectionTable extends Component {
    constructor(props) {
        super(props);
    }

    static withLinebreak(arr) {
        return arr.map(item => {
            return (<div>{item}<br/></div>);
        })
    }

    render() {
        const sectionInfo = this.props.sectionInfo;

        return (
            <Paper>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Code</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Sec</TableCell>
                            <TableCell>Units</TableCell>
                            <TableCell>Instructors</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>Place</TableCell>
                            <TableCell>Final</TableCell>
                            <TableCell>Max</TableCell>
                            <TableCell>Enr</TableCell>
                            <TableCell>WL</TableCell>
                            <TableCell>Nor</TableCell>
                            <TableCell>Restr</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sectionInfo.map((section, index) => {
                            return (
                                <TableRow key={index}>
                                    <TableCell>{section.classCode}</TableCell>
                                    <TableCell>{section.classType}</TableCell>
                                    <TableCell>{section.sectionCode}</TableCell>
                                    <TableCell>{section.units}</TableCell>
                                    <TableCell>{SectionTable.withLinebreak(section.instructors)}</TableCell>
                                    <TableCell>{SectionTable.withLinebreak(section.meetings.map(meeting => meeting[0]))}</TableCell>
                                    <TableCell>{SectionTable.withLinebreak(section.meetings.map(meeting => meeting[1]))}</TableCell>
                                    <TableCell>{section.finalExam}</TableCell>
                                    <TableCell>{section.maxCapacity}</TableCell>
                                    <TableCell>{section.numCurrentlyEnrolled[0]}</TableCell>
                                    <TableCell>{section.numOnWaitlist}</TableCell>
                                    <TableCell>{section.numNewOnlyReserved}</TableCell>
                                    <TableCell>{section.restrictions}</TableCell>
                                    <TableCell>{section.status}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Paper>
        );
    }
}

export default SectionTable;