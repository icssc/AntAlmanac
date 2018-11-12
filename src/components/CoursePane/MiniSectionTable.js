import React, {Component} from 'react';
import "./sectiontable.css";

class MiniSectionTable extends Component {
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return this.props.courseDetails !== nextProps.courseDetails;
    }

    render() {
        const sectionInfo = this.props.courseDetails.sections;

        return (
            <table>
                <thead>
                <tr>
                    <th>Type</th>
                    <th>Instructors</th>
                    <th>Times</th>
                    <th>Places</th>
                    <th>Enrollment</th>
                    <th>Status</th>
                </tr>
                </thead>
                <tbody>
                {sectionInfo.map((section) => {
                    return (
                        <tr>
                            <td className='multiline'>
                                {
                                    `${section.classType}
Section: ${section.sectionCode}
Units: ${section.units}`
                                }</td>
                            <td className='multiline'>{section.instructors.join('\n')}</td>
                            <td className='multiline'>{section.meetings.map(meeting => meeting[0]).join('\n')}</td>
                            <td className='multiline'>{section.meetings.map(meeting => meeting[1]).join('\n')}</td>
                            <td className='multiline'>
                                <strong>{`${section.numCurrentlyEnrolled[0]} / ${section.maxCapacity}`}</strong>
                                {`
WL: ${section.numOnWaitlist}
NOR: ${section.numNewOnlyReserved}`
                                }
                            </td>
                            <td className={section.status}>{section.status}</td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        );
    }
}

export default MiniSectionTable;