import { FormControlLabel, Switch, TextField } from '@material-ui/core';
import { ChangeEvent, PureComponent } from 'react';

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

    handleUpperDivChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            this.handleCourseNumbers('100-199');
        } else {
            this.handleCourseNumbers('');
        }
    };

    handleNumbersChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        this.handleCourseNumbers(event.target.value);
    };

    handleCourseNumbers = (eventCourseNumbers: string) => {
        const url = new URL(window.location.href);
        const urlParam = new URLSearchParams(url.search);
        urlParam.delete('courseNumber');

        this.setState({ courseNumber: eventCourseNumbers });
        RightPaneStore.updateFormValue('courseNumber', eventCourseNumbers);
        if (eventCourseNumbers !== '') {
            urlParam.append('courseNumber', eventCourseNumbers);
        }

        const param = urlParam.toString();
        const new_url = `${param.trim() ? '?' : ''}${param}`;
        history.replaceState({ url: 'url' }, 'url', '/' + new_url);
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
                    onChange={this.handleNumbersChange}
                    helperText="ex. 6B, 17, 30-40"
                />

                <FormControlLabel
                    control={
                        <Switch
                            onChange={this.handleUpperDivChange}
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
