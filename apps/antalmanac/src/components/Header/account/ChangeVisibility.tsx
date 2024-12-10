import {
    Box,
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    Typography,
} from '@mui/material';
import { useState } from 'react';

export function ChangeVisibility() {
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Box sx={{ width: '50%' }}>
            <Button sx={{ width: '100%' }} variant="contained" onClick={handleOpen}>
                Change Visibility
            </Button>

            <Dialog open={open} onClose={handleClose} maxWidth={'lg'}>
                <DialogTitle>Change Account Visibility</DialogTitle>

                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Alert severity="warning">
                        <Typography>Changing account visibility allows other users to view your schedules.</Typography>
                    </Alert>

                    <FormControl>
                        <FormLabel>Visibility</FormLabel>
                        <RadioGroup row defaultValue={'private'}>
                            <FormControlLabel value="private" control={<Radio />} label="Private" />
                            <FormControlLabel value="shared" control={<Radio />} label="Shared" />
                            <FormControlLabel value="public" control={<Radio />} label="Public" />
                        </RadioGroup>
                    </FormControl>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
