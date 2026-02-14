import { ChangeEvent, useCallback, useEffect, useState } from 'react';

import { LabeledTextField } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledTextField';
import RightPaneStore from '$components/RightPane/RightPaneStore';

const updateSectionCodeAndGetFormData = () => {
    RightPaneStore.updateFormValue('sectionCode', RightPaneStore.getUrlSectionCodeValue());
    return RightPaneStore.getFormData().sectionCode;
};

const getSectionCode = () => {
    return RightPaneStore.getUrlSectionCodeValue()
        ? updateSectionCodeAndGetFormData()
        : RightPaneStore.getFormData().sectionCode;
};

const SectionCodeSearchBar = () => {
    const [sectionCode, setSectionCode] = useState(getSectionCode);

    const handleChange = (event: ChangeEvent<{ value: string }>) => {
        setSectionCode(event.target.value);
        RightPaneStore.updateFormValue('sectionCode', event.target.value);
        const stateObj = { url: 'url' };
        const url = new URL(window.location.href);
        const urlParam = new URLSearchParams(url.search);
        urlParam.delete('sectionCode');
        if (event.target.value) {
            urlParam.append('sectionCode', event.target.value);
        }
        const param = urlParam.toString();
        const new_url = `${param.trim() ? '?' : ''}${param}`;
        history.replaceState(stateObj, 'url', '/' + new_url);
    };

    const resetField = useCallback(() => {
        setSectionCode(RightPaneStore.getFormData().sectionCode);
    }, []);

    useEffect(
        () => {
            RightPaneStore.on('formReset', resetField);
            return () => {
                RightPaneStore.removeListener('formReset', resetField);
            };
        },
        // resetField is the only dependency and doesn't change
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    return (
        <LabeledTextField
            label="Section Code"
            textFieldProps={{
                value: sectionCode,
                onChange: handleChange,
                type: 'search',
                placeholder: 'ex. 14200, 29000-29100',
                fullWidth: true,
            }}
            isAligned={true}
        />
    );
};

export default SectionCodeSearchBar;
