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
import { useState } from 'react';

import { Logo } from '$components/Header/Logo';
import { BLUE } from '$src/globals';

type AppSwitcherProps = {
    isMobile: boolean;
};

export function AppSwitcher({ isMobile }: AppSwitcherProps) {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [plannerLoading, setPlannerLoading] = useState(false);

    const platform = window.location.pathname.split('/')[1] === 'planner' ? 'Planner' : 'Scheduler';

    const handlePlannerClick = () => {
        if (plannerLoading) return;
        setPlannerLoading(true);
    };

    const plannerIcon = plannerLoading ? <CircularProgress size={16} color="inherit" /> : <Route />;

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
                            <ListSubheader component="div" sx={{ lineHeight: '30px' }}>
                                Switch Apps
                            </ListSubheader>
                        }
                        sx={{ width: 200 }}
                    >
                        <MenuItem
                            component="a"
                            href="/"
                            selected={platform === 'Scheduler'}
                            onClick={() => setAnchorEl(null)}
                            sx={{ minHeight: 'fit-content', textDecoration: 'none', color: 'inherit' }}
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
                            href="/planner"
                            selected={platform === 'Planner'}
                            onClick={() => {
                                handlePlannerClick();
                                setAnchorEl(null);
                            }}
                            disabled={plannerLoading}
                            sx={{ minHeight: 'fit-content', textDecoration: 'none', color: 'inherit' }}
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
                    href="/planner"
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
