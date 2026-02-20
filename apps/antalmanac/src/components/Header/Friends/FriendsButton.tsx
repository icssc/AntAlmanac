import { People } from '@mui/icons-material';
import { Button, Popover } from '@mui/material';
import { useState } from 'react';

import { FriendsMenu } from './FriendsMenu';

// import AppStore from '$stores/AppStore';

export function FriendsButton() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    // const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    return (
        <>
            <Button
                variant="text"
                startIcon={<People />}
                color="inherit"
                onClick={handleClick}
                // disabled={skeletonMode}
                sx={{ fontSize: 'inherit' }}
            >
                Friends
            </Button>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                slotProps={{
                    paper: {
                        sx: {
                            width: {
                                xs: 350,
                                sm: 400,
                                md: 425,
                            },
                            p: '16px 20px',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'background.default',
                        },
                    },
                }}
            >
                <FriendsMenu />
            </Popover>
        </>
    );
}
