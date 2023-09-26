import { Button, Tooltip } from '@material-ui/core';
import { logAnalytics } from '$lib/analytics'; // adjust the import path as needed
import analyticsEnum from '$lib/analytics'; // adjust the import path as needed

interface FinalsButtonProps {
    showFinalsSchedule: boolean;
    toggleDisplayFinalsSchedule: () => void;
}

const FinalsButton = ({ showFinalsSchedule, toggleDisplayFinalsSchedule }: FinalsButtonProps) => {
    return (
        <Tooltip title="Toggle showing finals schedule">
            <Button
                id="finalButton"
                variant={showFinalsSchedule ? 'contained' : 'outlined'}
                onClick={() => {
                    logAnalytics({
                        category: analyticsEnum.calendar.title,
                        action: analyticsEnum.calendar.actions.DISPLAY_FINALS,
                    });
                    toggleDisplayFinalsSchedule();
                }}
                size="small"
                color={showFinalsSchedule ? 'primary' : 'default'}
            >
                Finals
            </Button>
        </Tooltip>
    );
};

export default FinalsButton;
