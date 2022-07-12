import React, { PureComponent } from 'react';
import { TextField } from '@material-ui/core';
import { updateFormValue } from '../../../../actions/RightPaneActions';
import RightPaneStore from '../../../../stores/RightPaneStore';

class CourseNumberSearchBar extends PureComponent {
    state = {
        courseNumber: RightPaneStore.getFormData().courseNumber,
    };

    handleChange = (event) => {
        this.setState({ courseNumber: event.target.value });
        updateFormValue('courseNumber', event.target.value);
    };

    componentDidMount() {
        RightPaneStore.on('formReset', this.resetField);
    }

    componentWillUnmount() {
        RightPaneStore.removeListener('formReset', this.resetField);
    }

    resetField = () => {
        this.setState({ courseNumber: RightPaneStore.getFormData().courseNumber });
    };

    render() {
        return (
            <div>
                <TextField
                    label="Course Number(s)"
                    type="search"
                    value={this.state.courseNumber}
                    onChange={this.handleChange}
                    helperText="ex. 6B, 17, 30-40"
                />
            </div>
        );
    }
}

export default CourseNumberSearchBar;
