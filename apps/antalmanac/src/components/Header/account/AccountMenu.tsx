import { Box, Button, Popover, Typography } from '@mui/material';
import { useState } from 'react';

import { ChangeVisibility } from '$components/Header/account/ChangeVisibility';

export function AccountMenu() {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <Button
                onClick={handleClick}
                sx={{
                    backgroundColor: 'green',
                    borderRadius: '100%',
                    width: 24,
                    height: 24,
                    minWidth: 24,
                    paddingX: 1,
                }}
            />

            <Popover
                open={Boolean(anchorEl)}
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
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        padding: 2,
                        backgroundColor: 'background.paper',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 1,
                            minWidth: 300,
                        }}
                    >
                        <Box
                            sx={{
                                backgroundColor: 'green',
                                borderRadius: '100%',
                                width: 32,
                                height: 32,
                            }}
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography sx={{ fontWeight: 600 }}>Peter Anteater</Typography>
                            <Typography sx={{ opacity: '50%' }}>panteater@uci.edu</Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                        <Button sx={{ width: '50%' }} variant="contained">
                            Manage Friends
                        </Button>

                        <ChangeVisibility />
                    </Box>

                    <Box sx={{ marginLeft: 'auto' }}>
                        <Button variant="text">
                            <Typography>Log Out</Typography>
                        </Button>
                    </Box>
                </Box>
            </Popover>
        </div>
    );
}
