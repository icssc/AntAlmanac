import { Typography } from '@mui/material';
import { useCallback, useEffect } from 'react';

import { AdvancedSearchTextFields } from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/AdvancedSearchTextFields';
import RightPaneStore from '$components/RightPane/RightPaneStore';

export function AdvancedSearch() {
    const resetField = useCallback(() => {
        const stateObj = { url: 'url' };
        const url = new URL(window.location.href);
        const urlParam = new URLSearchParams(url.search);

        const formData = RightPaneStore.getFormData();
        for (const key of Object.keys(formData)) {
            urlParam.delete(key);
        }

        const param = urlParam.toString();
        const new_url = `${param.trim() ? '?' : ''}${param}`;
        history.replaceState(stateObj, 'url', '/' + new_url);
    }, []);

    useEffect(() => {
        RightPaneStore.on('formReset', resetField);

        return () => {
            RightPaneStore.off('formReset', resetField);
        };
    }, [resetField]);

    return (
        <>
            <Typography noWrap>Advanced Search Options</Typography>
            <AdvancedSearchTextFields />
        </>
    );
}
