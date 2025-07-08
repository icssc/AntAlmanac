import { ChangeEvent, useCallback, useEffect, useState } from 'react';

import { LabelledTextField } from '$components/RightPane/CoursePane/SearchForm/LabelledInputs/LabeledTextField';
import RightPaneStore from '$components/RightPane/RightPaneStore';

export function CourseNumberSearchBar() {
    const [value, setValue] = useState(() => RightPaneStore.getFormData().courseNumber);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;

        setValue(newValue);
        RightPaneStore.updateFormValue('courseNumber', newValue);

        const url = new URL(window.location.href);
        const urlParam = new URLSearchParams(url.search);
        urlParam.delete('courseNumber');

        if (newValue) {
            urlParam.set('courseNumber', newValue);
        }

        const param = urlParam.toString();
        const new_url = `${param.trim() ? '?' : ''}${param}`;
        history.replaceState({ url: 'url' }, 'url', '/' + new_url);
    };

    const resetField = useCallback(() => {
        setValue(() => RightPaneStore.getFormData().courseNumber);
    }, []);

    useEffect(() => {
        RightPaneStore.on('formReset', resetField);

        return () => {
            RightPaneStore.off('formReset', resetField);
        };
    }, [resetField]);

    return (
        <LabelledTextField
            label="Course Number(s)"
            textFieldProps={{
                type: 'search',
                value,
                onChange: handleChange,
                placeholder: 'ex. 6B, 17, 30-40',
                fullWidth: true,
                sx: {
                    minWidth: 200,
                },
            }}
            isAligned={true}
        />
    );
}
