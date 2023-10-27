import { PureComponent } from 'react';

import RightPaneStore from '../RightPaneStore';
import { SectionTableProps } from './SectionTable.types';
import SectionTableLazyWrapper from './SectionTableLazyWrapper';
import { queryWebsoc } from '$lib/websoc';

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
        };

        const jsonResp = await queryWebsoc(params);

        this.setState({
            courseDetails: jsonResp.schools[0].departments[0].courses[0],
        });
    }

    render() {
        return <SectionTableLazyWrapper {...this.props} courseDetails={this.state.courseDetails} />;
    }
}

export default GeDataFetchProvider;
