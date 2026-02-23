import { loginUser } from "$actions/AppStoreActions";
import GoogleIcon from "@mui/icons-material/Google";
import { Alert, Button, Dialog, DialogContent, DialogTitle, Stack } from "@mui/material";

interface SignInDialogProps {
    open: boolean;
    isDark: boolean;
    feature: "Load" | "Save" | "Notification";
    onClose: () => void;
}

export function SignInDialog(props: SignInDialogProps) {
    const { onClose, open, isDark } = props;

    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth={"xl"}
            fullScreen={true}
            sx={{
                "& .MuiDialog-paper": {
                    width: "fit-content",
                    height: "fit-content",
                    borderRadius: "0.5rem",
                },
                padding: "1rem",
            }}
        >
            <DialogTitle>
                {props.feature === "Notification" ? "Sign in to Use Notifications" : "Save"}
            </DialogTitle>
            <DialogContent>
                <Stack spacing={1}>
                    {props.feature === "Save" && (
                        <Alert
                            severity="info"
                            variant={isDark ? "outlined" : "standard"}
                            sx={{ fontSize: "small" }}
                        >
                            All changes made will be saved to your Google account
                        </Alert>
                    )}
                    <Button
                        onClick={loginUser}
                        startIcon={<GoogleIcon />}
                        color="primary"
                        variant="contained"
                        size="large"
                    >
                        Sign in with Google
                    </Button>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
