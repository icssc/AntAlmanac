import { TextField } from '@material-ui/core';
import { ChangeEvent, PureComponent } from 'react';

import RightPaneStore from '../../RightPaneStore';

class SectionCodeSearchBar extends PureComponent {
    
    updateCourseCodeAndGetFormData(){
        RightPaneStore.updateFormValue("sectionCode", RightPaneStore.getUrlCourseCodeValue()) 
        return RightPaneStore.getFormData().sectionCode
    };

    getSectionCode(){
        if(RightPaneStore.getUrlCourseCodeValue() != "null" && RightPaneStore.getUrlCourseCodeValue() != "" && RightPaneStore.getUrlCourseCodeValue() != " "){
            return this.updateCourseCodeAndGetFormData()
        }else{
            return RightPaneStore.getFormData().sectionCode
        }
    };

    state = {
        sectionCode: this.getSectionCode(),
    };

    handleChange = (event: ChangeEvent<{ value: string }>) => {
        this.setState({ sectionCode: event.target.value });
        RightPaneStore.updateFormValue('sectionCode', event.target.value);
    
        let stateObj = { url: "url" };
        const url = new URL(window.location.href)
        const urlParam = new URLSearchParams(url.search);
        urlParam.delete('courseCode');
        if (event.target.value != "" && event.target.value != null){
            urlParam.append('courseCode', event.target.value);
            const new_url = `?${urlParam.toString()}`;
            history.replaceState(stateObj, "url", "/" + new_url);
        }else{
            if (urlParam.toString() == "" || urlParam.toString() == null){
                const new_url = `${urlParam.toString()}`;
                history.replaceState(stateObj, "url", "/" + new_url);
            }else{
                const new_url = `?${urlParam.toString()}`;
                history.replaceState(stateObj, "url", "/" + new_url);
            }
        }
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
