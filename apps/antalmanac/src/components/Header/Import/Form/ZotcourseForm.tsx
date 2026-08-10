import { Box, DialogContentText, TextField } from '@mui/material';

interface ZotcourseFormProps {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ZotcourseForm({ value, onChange }: ZotcourseFormProps) {
    return (
        <Box>
            <DialogContentText>
                Paste your Zotcourse schedule name below to import it into AntAlmanac.
            </DialogContentText>
            <TextField
                fullWidth
                multiline
                margin="dense"
                type="text"
                label="Zotcourse Schedule"
                placeholder="Paste here"
                color="secondary"
                value={value}
                onChange={onChange}
            />
            <br />
        </Box>
    );
}
