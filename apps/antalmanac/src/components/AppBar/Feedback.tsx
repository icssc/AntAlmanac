import { Button, Tooltip } from '@mui/material';
import { Assignment } from '@mui/icons-material';

export default function Feedback() {
    return (
        <Tooltip title="Give Us Feedback!">
            <Button
                onClick={() => {
                    window.open('https://forms.gle/k81f2aNdpdQYeKK8A', '_blank');
                }}
                color="inherit"
                startIcon={<Assignment />}
            >
                Feedback
            </Button>
        </Tooltip>
    );
};
