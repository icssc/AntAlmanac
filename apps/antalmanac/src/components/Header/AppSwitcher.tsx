import { EventNote, Route, UnfoldMore } from '@mui/icons-material';
import {
    Button,
    ButtonGroup,
    CircularProgress,
    ListItemIcon,
    ListSubheader,
    MenuItem,
    MenuList,
    Popover,
    Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import type { MouseEventHandler } from 'react';

import { Logo } from '$components/Header/Logo';
import {
    SETTINGS_POPOVER_BG,
    SETTINGS_POPOVER_MENU_HOVER_BG,
    SETTINGS_POPOVER_MENU_SELECTED_BG,
} from '$components/Header/headerStyles';
import { BLUE, PLANNER_LINK } from '$src/globals';
import appStore from '$stores/AppStore';

type AppSwitcherProps = {
    isMobile: boolean;
};

/** Selected/hover use lighter shades than SETTINGS_POPOVER_BG so feedback is visible */
const darkMenuSx = {
    '&.Mui-selected': { bgcolor: SETTINGS_POPOVER_MENU_SELECTED_BG },
    '&.Mui-selected:hover': { bgcolor: SETTINGS_POPOVER_MENU_HOVER_BG },
    '&:hover': { bgcolor: SETTINGS_POPOVER_MENU_HOVER_BG },
} as const;

export function AppSwitcher({ isMobile }: AppSwitcherProps) {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [plannerLoading, setPlannerLoading] = useState(false);
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const platform = window.location.pathname.split('/')[1] === 'planner' ? 'Planner' : 'Scheduler';

    const handlePlannerClick: MouseEventHandler<HTMLElement> = (event) => {
        if (plannerLoading) return;

        if (appStore.hasUnsavedChanges()) {
            const shouldLeave = window.confirm(
                'You have unsaved changes. Are you sure you want to leave without saving?'
            );

            if (!shouldLeave) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }

            // user chose to leave, suppress beforeunload warning
            appStore.unsavedChanges = false;
        }

        setPlannerLoading(true);
    };

    useEffect(() => {
        const handlePageShow = (event: PageTransitionEvent) => {
            if (event.persisted) {
                setPlannerLoading(false);
            }
        };

        window.addEventListener('pageshow', handlePageShow);
        return () => window.removeEventListener('pageshow', handlePageShow);
    }, []);

    const plannerIcon = plannerLoading ? <CircularProgress size={20} color="inherit" /> : <Route />;

    if (isMobile) {
        return (
            <>
                <Button
                    onClick={(event) => setAnchorEl(event.currentTarget)}
                    endIcon={<UnfoldMore />}
                    sx={{
                        minWidth: 'auto',
                        p: 0.5,
                        color: 'white',
                        '& .MuiTouchRipple-child': {
                            borderRadius: 0.5,
                            bgcolor: 'white',
                        },
                    }}
                >
                    <Logo />
                </Button>

                <Popover
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    onClose={() => setAnchorEl(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                >
                    <MenuList
                        subheader={
                            <ListSubheader
                                component="div"
                                sx={{
                                    lineHeight: '30px',
                                    ...(isDark && { bgcolor: SETTINGS_POPOVER_BG }),
                                }}
                            >
                                Switch Apps
                            </ListSubheader>
                        }
                        sx={{
                            width: 200,
                            ...(isDark && { bgcolor: SETTINGS_POPOVER_BG }),
                        }}
                    >
                        <MenuItem
                            component="a"
                            href="/"
                            selected={platform === 'Scheduler'}
                            onClick={() => setAnchorEl(null)}
                            sx={{
                                minHeight: 'fit-content',
                                textDecoration: 'none',
                                color: 'inherit',
                                ...(isDark && darkMenuSx),
                            }}
                        >
                            <ListItemIcon>
                                <EventNote />
                            </ListItemIcon>
                            <Typography fontSize="15px" fontWeight={500}>
                                Scheduler
                            </Typography>
                        </MenuItem>
                        <MenuItem
                            component="a"
                            href={PLANNER_LINK}
                            selected={platform === 'Planner'}
                            onClick={(event) => {
                                handlePlannerClick(event);
                                if (!event.defaultPrevented) {
                                    setAnchorEl(null);
                                }
                            }}
                            disabled={plannerLoading}
                            sx={{
                                minHeight: 'fit-content',
                                textDecoration: 'none',
                                color: 'inherit',
                                ...(isDark && darkMenuSx),
                            }}
                        >
                            <ListItemIcon>{plannerIcon}</ListItemIcon>
                            <Typography fontSize="15px" fontWeight={500}>
                                Planner
                            </Typography>
                        </MenuItem>
                    </MenuList>
                </Popover>
            </>
        );
    }

    return (
        <>
            <Logo />
            <ButtonGroup variant="outlined" color="inherit">
                <Button
                    variant="contained"
                    startIcon={<EventNote />}
                    sx={{
                        boxShadow: 'none',
                        bgcolor: 'white',
                        color: BLUE,
                        fontWeight: 500,
                        fontSize: 14,
                        py: 0.4,
                        '&:hover': { bgcolor: 'grey.100' },
                    }}
                >
                    Scheduler
                </Button>
                <Button
                    component="a"
                    href={PLANNER_LINK}
                    startIcon={plannerIcon}
                    onClick={handlePlannerClick}
                    disabled={plannerLoading}
                    sx={{
                        boxShadow: 'none',
                        color: 'white',
                        fontWeight: 500,
                        fontSize: 14,
                        py: 0.4,
                        textDecoration: 'none',
                    }}
                >
                    Planner
                </Button>
            </ButtonGroup>
        </>
    );
}
