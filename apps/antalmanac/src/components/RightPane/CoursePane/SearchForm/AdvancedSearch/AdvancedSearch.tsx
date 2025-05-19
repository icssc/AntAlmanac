import { useCallback, useEffect, useState } from 'react';

import { AdvancedSearchTextFields } from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/AdvancedSearchTextFields';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { getLocalStorageAdvanced, setLocalStorageAdvanced } from '$lib/localStorage';

export function AdvancedSearch() {
    const [open, setOpen] = useState(() => getLocalStorageAdvanced() === 'expanded');

    const handleExpand = () => {
        setOpen((prev) => {
            setLocalStorageAdvanced(!prev ? 'expanded' : 'notexpanded');
            return !prev;
        });
    };

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
            <AdvancedSearchTextFields />
        </>
    );
}