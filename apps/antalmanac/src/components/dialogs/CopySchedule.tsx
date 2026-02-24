import { copySchedule } from "$actions/AppStoreActions";
import AppStore from "$stores/AppStore";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    type DialogProps,
    DialogTitle,
    TextField,
} from "@mui/material";
import { usePostHog } from "posthog-js/react";
import { useCallback, useEffect, useState } from "react";

interface CopyScheduleDialogProps extends DialogProps {
    index: number;
}

function CopyScheduleDialog(props: CopyScheduleDialogProps) {
    const { index } = props;
    const { onClose } = props; // destructured separately for memoization.
    const [name, setName] = useState<string>(`Copy of ${AppStore.getScheduleNames()[index]}`);

    const postHog = usePostHog();

    const handleNameChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setName(event.target.value);
    }, []);

    const handleCancel = useCallback(() => {
        onClose?.({}, "escapeKeyDown");
    }, [onClose]);

    const handleCopy = useCallback(() => {
        copySchedule(index, name, undefined, postHog);
        onClose?.({}, "escapeKeyDown");
    }, [index, name, onClose, postHog]);

    const handleScheduleNamesChange = useCallback(() => {
        setName(`Copy of ${AppStore.getScheduleNames()[index]}`);
    }, [index]);

    useEffect(() => {
        handleScheduleNamesChange();
        AppStore.on("scheduleNamesChange", handleScheduleNamesChange);
        return () => {
            AppStore.off("scheduleNamesChange", handleScheduleNamesChange);
        };
    }, [handleScheduleNamesChange]);

    return (
        <Dialog onClose={onClose} {...props}>
            <DialogTitle>Copy Schedule</DialogTitle>
            <DialogContent>
                <Box padding={1}>
                    <TextField fullWidth label="Name" onChange={handleNameChange} value={name} />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel} color="inherit">
                    Cancel
                </Button>
                <Button
                    onClick={handleCopy}
                    variant="contained"
                    color="primary"
                    disabled={name?.trim() === ""}
                >
                    Make a Copy
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default CopyScheduleDialog;
