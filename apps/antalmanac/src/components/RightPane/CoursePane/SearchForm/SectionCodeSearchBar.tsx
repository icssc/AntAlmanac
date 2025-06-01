import { ChangeEvent, PureComponent } from 'react';

import { AdornedTextField } from '$components/RightPane/CoursePane/SearchForm/AdornedInputs/AdornedTextField';
import RightPaneStore from '$components/RightPane/RightPaneStore';

class SectionCodeSearchBar extends PureComponent {
    updateCourseCodeAndGetFormData() {
        RightPaneStore.updateFormValue('sectionCode', RightPaneStore.getUrlCourseCodeValue());
        return RightPaneStore.getFormData().sectionCode;
    }

    getSectionCode() {
        return RightPaneStore.getUrlCourseCodeValue()
            ? this.updateCourseCodeAndGetFormData()
            : RightPaneStore.getFormData().sectionCode;
    }

    state = {
        sectionCode: this.getSectionCode(),
    };

    handleChange = (event: ChangeEvent<{ value: string }>) => {
        this.setState({ sectionCode: event.target.value });
        RightPaneStore.updateFormValue('sectionCode', event.target.value);
        const stateObj = { url: 'url' };
        const url = new URL(window.location.href);
        const urlParam = new URLSearchParams(url.search);
        urlParam.delete('courseCode');
        if (event.target.value) {
            urlParam.append('courseCode', event.target.value);
        }
        const param = urlParam.toString();
        const new_url = `${param.trim() ? '?' : ''}${param}`;
        history.replaceState(stateObj, 'url', '/' + new_url);
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
            <AdornedTextField
                label="Course Code"
                textFieldProps={{
                    value: this.state.sectionCode,
                    onChange: this.handleChange,
                    type: 'search',
                    placeholder: 'ex. 14200, 29000-29100',
                }}
                formControlProps={{
                    fullWidth: true,
                    sx: {
                        minWidth: 400,
                    },
                }}
                isAligned={true}
            />
        );
    }
}

export default SectionCodeSearchBar;
