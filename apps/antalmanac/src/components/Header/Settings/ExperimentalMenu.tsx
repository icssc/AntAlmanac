import actionTypesStore from '$actions/ActionTypesStore';
import { autoSaveSchedule } from '$actions/AppStoreActions';
import { getLocalStorageUserId } from '$lib/localStorage';
import appStore from '$stores/AppStore';
import { scheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { useSessionStore } from '$stores/SessionStore';
import { useAutoSaveStore, useDevModeStore, usePreviewStore } from '$stores/SettingsStore';
import { Help } from '@mui/icons-material';
import { Box, Stack, Switch, Tooltip, Typography } from '@mui/material';
import { usePostHog } from 'posthog-js/react';

export function ExperimentalMenu() {
    const [previewMode, setPreviewMode] = usePreviewStore((store) => [store.previewMode, store.setPreviewMode]);
    const [autoSave, setAutoSave] = useAutoSaveStore((store) => [store.autoSave, store.setAutoSave]);
    const { sessionIsValid, session } = useSessionStore();
    const { setOpenAutoSaveWarning } = scheduleComponentsToggleStore();
    const [devMode, setDevMode] = useDevModeStore((store) => [store.devMode, store.setDevMode]);

    const postHog = usePostHog();

    const handlePreviewChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPreviewMode(event.target.checked);
    };

    const handleAutoSaveChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setAutoSave(event.target.checked);

        if (!event.target.checked) {
            return;
        }

        if (!sessionIsValid || !session) {
            setOpenAutoSaveWarning(true);
            return;
        }

        const savedUserID = getLocalStorageUserId();

        if (!savedUserID) {
            return;
        }

        actionTypesStore.emit('autoSaveStart');
        await autoSaveSchedule(savedUserID, { postHog });
        appStore.unsavedChanges = false;
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
