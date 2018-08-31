import React, {Component} from 'react';
import AddCircle from '@material-ui/icons/AddCircle'
import IconButton from "@material-ui/core/IconButton/IconButton";

class SectionTable extends Component {
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return this.props.courseDetails !== nextProps.courseDetails;
    }

    render() {
        const sectionInfo = this.props.courseDetails.sections;

        return (
            <table>
                <thead>
                <tr>
                    <th className='no_border'>{}</th>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Sec</th>
                    <th>Units</th>
                    <th>Instructors</th>
                    <th>Time</th>
                    <th>Place</th>
                    <th>Enrollment</th>
                    <th>Restrictions</th>
                    <th>Status</th>
                </tr>
                </thead>
                <tbody>
                {sectionInfo.map((section) => {
                    return (
                        <tr>
                            <td className='no_border'>
                                <IconButton color='primary'
                                            onClick={() => this.props.onAddClass(section, this.props.courseDetails.name)}><AddCircle/></IconButton>
                            </td>
                            <td>{section.classCode}</td>
                            <td>{section.classType}</td>
                            <td>{section.sectionCode}</td>
                            <td>{section.units}</td>
                            <td className='multiline'>{section.instructors.join('\n')}</td>
                            <td className='multiline'>{section.meetings.map(meeting => meeting[0]).join('\n')}</td>
                            <td className='multiline'>{section.meetings.map(meeting => meeting[1]).join('\n')}</td>
                            <td className='multiline'>
                                {
                                    `${section.numCurrentlyEnrolled[0]}/${section.maxCapacity}
WL: ${section.numOnWaitlist}
NOR: ${section.numNewOnlyReserved}`
                                }
                            </td>
                            <td>{section.restrictions}</td>
                            <td className={section.status}>{section.status}</td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        );
    }
}
//TODO: Convert CSS Sheet to JSS
export default SectionTable;