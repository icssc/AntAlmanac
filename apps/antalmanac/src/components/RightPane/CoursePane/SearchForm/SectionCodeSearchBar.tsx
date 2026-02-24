import { LabeledTextField } from "$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledTextField";
import RightPaneStore from "$components/RightPane/RightPaneStore";
import { ChangeEvent, PureComponent } from "react";

class SectionCodeSearchBar extends PureComponent {
    updateSectionCodeAndGetFormData() {
        RightPaneStore.updateFormValue("sectionCode", RightPaneStore.getUrlSectionCodeValue());
        return RightPaneStore.getFormData().sectionCode;
    }

    getSectionCode() {
        return RightPaneStore.getUrlSectionCodeValue()
            ? this.updateSectionCodeAndGetFormData()
            : RightPaneStore.getFormData().sectionCode;
    }

    state = {
        sectionCode: this.getSectionCode(),
    };

    handleChange = (event: ChangeEvent<{ value: string }>) => {
        this.setState({ sectionCode: event.target.value });
        RightPaneStore.updateFormValue("sectionCode", event.target.value);
        const stateObj = { url: "url" };
        const url = new URL(window.location.href);
        const urlParam = new URLSearchParams(url.search);
        urlParam.delete("sectionCode");
        if (event.target.value) {
            urlParam.append("sectionCode", event.target.value);
        }
        const param = urlParam.toString();
        const new_url = `${param.trim() ? "?" : ""}${param}`;
        history.replaceState(stateObj, "url", "/" + new_url);
    };

    componentDidMount() {
        RightPaneStore.on("formReset", this.resetField);
    }

    componentWillUnmount() {
        RightPaneStore.removeListener("formReset", this.resetField);
    }

    resetField = () => {
        this.setState({ sectionCode: RightPaneStore.getFormData().sectionCode });
    };

    render() {
        return (
            <LabeledTextField
                label="Section Code"
                textFieldProps={{
                    value: this.state.sectionCode,
                    onChange: this.handleChange,
                    type: "search",
                    placeholder: "ex. 14200, 29000-29100",
                    fullWidth: true,
                }}
                isAligned={true}
            />
        );
    }
}

export default SectionCodeSearchBar;
