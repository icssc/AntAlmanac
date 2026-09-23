import { Box, DialogContentText, Link as MuiLink, TextField } from '@mui/material';

interface StudyListFormProps {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function StudyListForm({ value, onChange }: StudyListFormProps) {
    return (
        <Box>
            <DialogContentText>
                Paste the contents of your Study List below to import it into AntAlmanac.
                <br />
                To find your Study List, go to{' '}
                <MuiLink
                    href="https://www.reg.uci.edu/cgi-bin/webreg-redirect.sh"
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                >
                    WebReg
                </MuiLink>{' '}
                or{' '}
                <MuiLink
                    href="https://www.reg.uci.edu/access/student/welcome/"
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                >
                    StudentAccess
                </MuiLink>
                , and click on Study List once you&apos;ve logged in. Copy everything below the column names (Code,
                Dept, etc.) under the Enrolled Classes section.
            </DialogContentText>
            <TextField
                fullWidth
                multiline
                margin="dense"
                type="text"
                label="Study List"
                placeholder="Paste here"
                color="secondary"
                value={value}
                onChange={onChange}
            />
            <br />
        </Box>
    );
}
