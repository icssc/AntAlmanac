import React, { PureComponent } from 'react';
import SectionTableLazyWrapper from './SectionTableLazyWrapper';
import RightPaneStore from '../RightPaneStore';
import { queryWebsoc } from '../../../helpers';
import { SectionTableProps } from './SectionTable.types';

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
