import { TextField } from '@material-ui/core';
import React, { ChangeEvent, PureComponent } from 'react';

import RightPaneStore from '../../RightPaneStore';

const urlParamValue = new URLSearchParams(document.location.search).get("courseCode");
RightPaneStore.updateFormValue("sectionCode",String(urlParamValue))

class SectionCodeSearchBar extends PureComponent {
    state = {
        sectionCode: RightPaneStore.getFormData().sectionCode,
    };

    handleChange = (event: ChangeEvent<{ value: string }>) => {
        this.setState({ sectionCode: event.target.value });
        RightPaneStore.updateFormValue('sectionCode', event.target.value);
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
