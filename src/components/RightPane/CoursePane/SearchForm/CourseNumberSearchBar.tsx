import { TextField } from '@mui/material';
import React, { ChangeEvent, PureComponent } from 'react';

import RightPaneStore from '../../RightPaneStore';

interface CourseNumberSearchBarState {
    courseNumber: string;
}

class CourseNumberSearchBar extends PureComponent<Record<string,never>, CourseNumberSearchBarState> {
    state = {
        courseNumber: RightPaneStore.getFormData().courseNumber,
    };

    handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        this.setState({ courseNumber: event.target.value });
        RightPaneStore.updateFormValue('courseNumber', event.target.value);
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
                    variant="standard"
                />
            </div>
        );
    }
}

export default CourseNumberSearchBar;
