import React, { PureComponent } from 'react';
import { TextField } from '@material-ui/core';
import { updateFormValue } from '../../actions/RightPaneActions';
import RightPaneStore from '../../stores/RightPaneStore';

class SectionCodeSearchBar extends PureComponent {
    state = {
        sectionCode: RightPaneStore.getFormData().sectionCode,
    };

    handleChange = (event) => {
        this.setState({ sectionCode: event.target.value });
        updateFormValue('sectionCode', event.target.value);
    };

    componentDidMount() {
        RightPaneStore.on('formReset', this.resetField);
    }

    componentWillUnmount() {
        RightPaneStore.removeListener('formReset', this.resetField);
    }

    resetField = () => {
        this.setState({ sectionCode: RightPaneStore.getFormData().sectionCode });
    };

    render() {
        return (
            <div>
                <TextField
                    label="Course Code or Range"
                    value={this.state.sectionCode}
                    onChange={this.handleChange}
                    type="search"
                    helperText="ex. 14200, 29000-29100"
                    fullWidth
                />
            </div>
        );
    }
}

export default SectionCodeSearchBar;
