import { Close, TipsAndUpdates, Warning } from '@mui/icons-material';
import {
    Stack,
    Backdrop,
    Box,
    SpeedDial,
    SpeedDialAction,
    type SvgIconProps,
    Tooltip,
    IconButton,
} from '@mui/material';
import { useCallback, useState } from 'react';

import { FeedbackAction } from '$components/HelpMenu/actions/FeedbackAction';
import { HelpBoxAction } from '$components/HelpMenu/actions/HelpBoxAction';
import { PatchNotesAction } from '$components/HelpMenu/actions/PatchNotesAction';
import { TutorialAction } from '$components/HelpMenu/actions/TutorialAction';
import { useIsMobile } from '$hooks/useIsMobile';
import { BLUE } from '$src/globals';
import { scheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { useThemeStore } from '$stores/SettingsStore';

export type HelpMenuAction = {
    icon: React.ReactElement<SvgIconProps>;
    name: string;
    disableOnMobile?: boolean;
    onClick: VoidFunction;
} | null;

export function HelpMenu() {
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);
    const { openAutoSaveWarning, setOpenAutoSaveWarning } = scheduleComponentsToggleStore();

    const isDark = useThemeStore((state) => state.isDark);

    const handleOpenAutoSaveWarning = () => {
        setOpenAutoSaveWarning(!openAutoSaveWarning);
    };

    const actions = [FeedbackAction(), TutorialAction(), PatchNotesAction(), HelpBoxAction()]
        // Two passes to help Typescript infer type
        .filter((action) => !!action)
        .filter((action) => !isMobile || !action.disableOnMobile) satisfies NonNullable<HelpMenuAction>[];

    const handleClick = useCallback(() => setOpen((prev) => !prev), []);
    const handleClose = useCallback(() => setOpen(false), []);

    const handleClickAction = useCallback(
        (e: React.MouseEvent, action: VoidFunction) => {
            e.stopPropagation();
            handleClose();
            action();
        },
        [handleClose]
    );

    return (
        <Stack
            sx={{
                position: 'fixed',
                bottom: isMobile ? 65 : 16, // Magic number
                right: 8,
            }}
            spacing={1}
            alignItems="center"
        >
            <Backdrop
                sx={{
                    zIndex: 1000, // If there's a higher zIndex than this, then that other zIndex is the real problem
                }}
                open={open}
                onClick={handleClose}
            />

            <SpeedDial
                ariaLabel="Help Menu"
                icon={
                    <Tooltip title="Help Menu" placement="left">
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '100%',
                                height: '100%',
                            }}
                        >
                            {open ? <Close /> : <TipsAndUpdates />}
                        </Box>
                    </Tooltip>
                }
                onClick={handleClick}
                open={open}
                FabProps={{
                    size: 'medium',
                    sx: {
                        backgroundColor: BLUE,
                    },
                }}
            >
                {actions.map((action) => (
                    <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        tooltipOpen
                        onClick={(e) => {
                            handleClickAction(e, action.onClick);
                        }}
                        sx={{ whiteSpace: 'nowrap' }}
                    />
                ))}
            </SpeedDial>

            <IconButton
                aria-label="warning"
                color="warning"
                size="large"
                onClick={handleOpenAutoSaveWarning}
                sx={{
                    bgcolor: isDark ? 'warning.dark' : 'warning.main',
                    color: 'white',
                    height: '4rem',
                    width: '4rem',
                    padding: 0,
                    '&:hover': {
                        bgcolor: isDark ? 'warning.dark' : 'warning.main',
                    },
                }}
            >
                <Warning />
            </IconButton>
        </Stack>
    );
}
