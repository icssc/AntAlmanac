import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Button, Collapse, Typography } from '@mui/material';
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
            <Button onClick={handleExpand} sx={{ textTransform: 'none', display: 'flex', justifyContent: 'start' }}>
                <Typography noWrap>Advanced Search Options</Typography>
                {open ? <ExpandLess /> : <ExpandMore />}
            </Button>
            <Collapse in={open}>
                <AdvancedSearchTextFields />
            </Collapse>
        </>
    );
}