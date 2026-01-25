import { ContentPaste } from '@mui/icons-material';
import { Tooltip, Button } from '@mui/material';
import { useCallback, useState } from 'react';

import AppStore from '$stores/AppStore';

export function Export() {
    const [skeletonMode, _setSkeletonMode] = useState(AppStore.getSkeletonMode());

    const handleOpen = useCallback(() => {
        console.log('Exporting schedule data');
    }, []);

    return (
        <Tooltip title="Export your schedule data to a JSON file">
            <Button
                onClick={handleOpen}
                color="inherit"
                startIcon={<ContentPaste />}
                disabled={skeletonMode}
                id="export-button"
            >
                Export
            </Button>
        </Tooltip>
    );
}
