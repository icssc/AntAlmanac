import { FormControlLabel, Switch, TextField } from '@material-ui/core';
import { ChangeEvent, PureComponent } from 'react';

import { Box } from '@mui/material';
import RightPaneStore from '../../RightPaneStore';

interface CourseNumberSearchBarState {
    courseNumber: string;
}

class CourseNumberSearchBar extends PureComponent<Record<string, never>, CourseNumberSearchBarState> {
    updateCourseNumAndGetFormData() {
        RightPaneStore.updateFormValue('courseNumber', RightPaneStore.getUrlCourseNumValue());
        return RightPaneStore.getFormData().courseNumber;
    }

    getCourseNumber() {
        return RightPaneStore.getUrlCourseNumValue().trim()
            ? this.updateCourseNumAndGetFormData()
            : RightPaneStore.getFormData().courseNumber;
    }

    state = {
        courseNumber: this.getCourseNumber(),
    };

    handleChange = (name: string) => (event: ChangeEvent<HTMLInputElement>) => {
        if (name === 'upper') {
            if (event.target.checked) {
                this.setState({ courseNumber: '100-199' });
                RightPaneStore.updateFormValue('courseNumber', '100-199');
                const url = new URL(window.location.href);
                const urlParam = new URLSearchParams(url.search);
                urlParam.delete('courseNumber');

                urlParam.append('courseNumber', '100-199');
                const param = urlParam.toString();
                const new_url = `${param.trim() ? '?' : ''}${param}`;
                history.replaceState({ url: 'url' }, 'url', '/' + new_url);
            } else {
                this.setState({ courseNumber: '' });
                RightPaneStore.updateFormValue('courseNumber', '');
                const url = new URL(window.location.href);
                const urlParam = new URLSearchParams(url.search);
                urlParam.delete('courseNumber');

                const param = urlParam.toString();
                const new_url = `${param.trim() ? '?' : ''}${param}`;
                history.replaceState({ url: 'url' }, 'url', '/' + new_url);
            }
        } else {
            this.setState({ courseNumber: event.target.value });
            RightPaneStore.updateFormValue('courseNumber', event.target.value);
            const url = new URL(window.location.href);
            const urlParam = new URLSearchParams(url.search);
            urlParam.delete('courseNumber');
            if (event.target.value) {
                urlParam.append('courseNumber', event.target.value);
            }
            const param = urlParam.toString();
            const new_url = `${param.trim() ? '?' : ''}${param}`;
            history.replaceState({ url: 'url' }, 'url', '/' + new_url);
        }
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
            <>
                <TextField
                    label="Course Number(s)"
                    type="search"
                    value={this.state.courseNumber}
                    onChange={this.handleChange('number')}
                    helperText="ex. 6B, 17, 30-40"
                />

                <FormControlLabel
                    control={
                        <Switch
                            onChange={this.handleChange('upper')}
                            value="100-199"
                            color="primary"
                            checked={this.state.courseNumber === '100-199'}
                        />
                    }
                    labelPlacement="top"
                    label="Upper Div Only"
                />
            </>
        );
    }
}

export default CourseNumberSearchBar;
