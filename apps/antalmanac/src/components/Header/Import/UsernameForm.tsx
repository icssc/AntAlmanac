import { Box, DialogContentText, InputLabel, TextField } from '@mui/material';

interface UsernameFormProps {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
}

export function UsernameForm({ value, onChange, onSubmit }: UsernameFormProps) {
    return (
        <Box
            component="form"
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
        >
            <DialogContentText>Paste your unique user ID here to import your schedule(s).</DialogContentText>
            <InputLabel style={{ fontSize: '9px' }}>AntAlmanac Schedule Name</InputLabel>
            <TextField
                fullWidth
                margin="dense"
                type="text"
                placeholder="Paste here"
                color="secondary"
                value={value}
                onChange={onChange}
            />
            <br />
        </Box>
    );
}
