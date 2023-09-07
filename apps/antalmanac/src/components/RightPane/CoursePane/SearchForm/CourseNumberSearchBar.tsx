import { TextField } from '@material-ui/core';
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

    handleChange = (event: ChangeEvent<HTMLInputElement>) => {
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
