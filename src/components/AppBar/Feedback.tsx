import React, {FunctionComponent} from 'react';
import { Assignment } from '@material-ui/icons';
import { Button, Tooltip} from '@material-ui/core';

const Feedback: FunctionComponent = () => {
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
    )
}

export default Feedback