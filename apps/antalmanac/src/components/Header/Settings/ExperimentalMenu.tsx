import actionTypesStore from '$actions/ActionTypesStore';
import { autoSaveSchedule } from '$actions/AppStoreActions';
import { getAuthState } from '$lib/auth/useAuth';
import { useScheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { usePreviewStore, useAutoSaveStore, useDevModeStore } from '$stores/SettingsStore';
import { Help } from '@mui/icons-material';
import { Stack, Box, Typography, Tooltip, Switch } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { useShallow } from 'zustand/react/shallow';

export function ExperimentalMenu() {
    const [previewMode, setPreviewMode] = usePreviewStore(
        useShallow((store) => [store.previewMode, store.setPreviewMode])
    );
    const [autoSave, setAutoSave] = useAutoSaveStore(useShallow((store) => [store.autoSave, store.setAutoSave]));
    const { setOpenAutoSaveWarning } = useScheduleComponentsToggleStore();
    const [devMode, setDevMode] = useDevModeStore(useShallow((store) => [store.devMode, store.setDevMode]));
    const postHog = usePostHog();

    const handlePreviewChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPreviewMode(event.target.checked);
    };

    const handleAutoSaveChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setAutoSave(event.target.checked);

        if (!event.target.checked) {
            return;
        }

        if (!getAuthState().isLoggedIn) {
            setOpenAutoSaveWarning(true);
            return;
        }

        actionTypesStore.emit('autoSaveStart');
        await autoSaveSchedule({ postHog });
        actionTypesStore.emit('autoSaveEnd');
    };

    return (
        <Stack sx={{ width: '100%', display: 'flex', alignItems: 'middle' }}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', width: '1' }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Typography
                        variant="h6"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            alignContent: 'center',
                        }}
                    >
                        Hover to Preview
                    </Typography>
                    <Tooltip title={<Typography>Hover over courses to preview them in your calendar!</Typography>}>
                        <Help />
                    </Tooltip>
                </Box>
                <Switch checked={previewMode} onChange={handlePreviewChange} color="primary" />
            </Box>

            <Box style={{ display: 'flex', justifyContent: 'space-between', width: '1' }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Typography
                        variant="h6"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            alignContent: 'center',
                        }}
                    >
                        Auto Save
                    </Typography>
                    <Tooltip title={<Typography>Auto Save your schedule!</Typography>}>
                        <Help />
                    </Tooltip>
                </Box>
                <Switch checked={autoSave} onChange={handleAutoSaveChange} color="primary" />
            </Box>
            <Box style={{ display: 'flex', justifyContent: 'space-between', width: '1' }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', alignContent: 'center' }}>
                        Dev Mode
                    </Typography>
                    <Tooltip title={<Typography>Enable developer features</Typography>}>
                        <Help />
                    </Tooltip>
                </Box>
                <Switch
                    color={'primary'}
                    value={devMode}
                    checked={devMode}
                    onChange={(event) => setDevMode(event.target.checked)}
                />
            </Box>
        </Stack>
    );
}
