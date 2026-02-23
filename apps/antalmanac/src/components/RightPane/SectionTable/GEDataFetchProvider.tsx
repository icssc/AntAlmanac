import { PureComponent } from 'react';

import RightPaneStore from '$components/RightPane/RightPaneStore';
import { SectionTableProps } from '$components/RightPane/SectionTable/SectionTable.types';
import SectionTableLazyWrapper from '$components/RightPane/SectionTable/SectionTableLazyWrapper';
import { WebSOC } from '$lib/websoc';

/**
 * If we remove this class, when you search a department+GE combo, only the lectures show up, not the discussions.
 * This is because all the non-lecture sections don't have the GE specified so the initial search that included the
 * GE criteria will miss them.
 */
class GeDataFetchProvider extends PureComponent<SectionTableProps> {
    state = {
        courseDetails: this.props.courseDetails,
    };

    async componentDidMount() {
        const formData = RightPaneStore.getFormData();

        const params = {
            department: this.props.courseDetails.deptCode,
            term: formData.term,
            ge: 'ANY',
            courseNumber: this.props.courseDetails.courseNumber,
            courseTitle: this.props.courseDetails.courseTitle,
            instructorName: formData.instructor,
            units: formData.units,
            endTime: formData.endTime,
            startTime: formData.startTime,
            fullCourses: formData.coursesFull,
            building: formData.building,
            room: formData.room,
            division: formData.division,
            excludeRestrictionCodes: formData.excludeRestrictionCodes.split('').join(','),
            days: formData.days.split(/(?=[A-Z])/).join(','),
        };

        const jsonResp = await WebSOC.query(params);

        this.setState({
            courseDetails: jsonResp.schools[0].departments[0].courses[0],
        });
    }

    render() {
        return <SectionTableLazyWrapper {...this.props} courseDetails={this.state.courseDetails} />;
    }
}

export default GeDataFetchProvider;
