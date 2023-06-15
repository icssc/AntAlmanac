import { FormControl, InputLabel, ListItemText, MenuItem, Select, TextField } from '@material-ui/core';
import { ChangeEvent, PureComponent } from 'react';

import RightPaneStore from '../../RightPaneStore';

const courseLevelList: { level: string; label: string }[] = [
    { level: '0', label: 'Any Course Division' },
    { level: '1-99', label: 'Lower Division Only' },
    { level: '100-199', label: 'Upper Division Only' },
    { level: '200-999', label: 'Graduate/Professional Only' },
];

interface CourseNumberSearchBarState {
    courseNumber: string;
    courseLevel: string;
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
        courseLevel: '',
    };

    handleDivChange = (event: ChangeEvent<{ name?: string | undefined; value: unknown }>) => {
        this.setState({ courseLevel: event.target.value as string }, () => {
            switch (event.target.value as string) {
                case '0':
                    this.handleCourseNumbers('');
                    break;
                case '1-99':
                    this.handleCourseNumbers('1-99');
                    break;
                case '100-199':
                    this.handleCourseNumbers('100-199');
                    break;
                case '200-999':
                    this.handleCourseNumbers('200-999');
                    break;
            }
        });
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
                    style={{ marginRight: 15 }}
                />

                <FormControl style={{ minWidth: 75 }}>
                    <InputLabel>Course Level</InputLabel>
                    <Select
                        value={this.state.courseLevel}
                        renderValue={(selected) =>
                            courseLevelList.find((item) => item.level === selected)?.label as string
                        }
                        onChange={this.handleDivChange}
                        fullWidth
                    >
                        {courseLevelList.map((level) => {
                            return (
                                <MenuItem key={level.level} value={level.level}>
                                    <ListItemText>{level.label}</ListItemText>
                                </MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>
            </>
        );
    }
}

export default CourseNumberSearchBar;
