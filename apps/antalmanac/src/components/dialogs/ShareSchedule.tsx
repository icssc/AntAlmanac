import { ContentCopy, Check } from '@mui/icons-material';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    IconButton,
    Typography,
    Alert,
    CircularProgress,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState, useCallback, useEffect } from 'react';

import trpc from '$lib/api/trpc';
import AppStore from '$stores/AppStore';
import { useSessionStore } from '$stores/SessionStore';

interface ShareScheduleDialogProps {
    open: boolean;
    onClose: () => void;
    index: number;
    fullWidth?: boolean;
}

export default function ShareScheduleDialog({ open, onClose, index, fullWidth }: ShareScheduleDialogProps) {
    const [scheduleId, setScheduleId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const { session, sessionIsValid } = useSessionStore();
    const { enqueueSnackbar } = useSnackbar();

    const scheduleName = AppStore.schedule.getScheduleName(index);

    useEffect(() => {
        if (open && scheduleName) {
            setLoading(true);
            setError(null);
            setScheduleId(null);
            setCopied(false);

            const fetchScheduleId = async () => {
                try {
                    if (!sessionIsValid || !session) {
                        setError('Please sign in to share schedules');
                        setLoading(false);
                        return;
                    }

                    // Get user ID from session
                    const userAndAccount = await trpc.userData.getUserAndAccountBySessionToken.query({
                        token: session,
                    });
                    const userId = userAndAccount.users.id;

                    // Get schedule ID
                    const id = await trpc.userData.getScheduleIdByName.query({
                        userId,
                        scheduleName,
                    });

                    setScheduleId(id);
                    setLoading(false);
                } catch (err) {
                    console.error('Error fetching schedule ID:', err);
                    setError('Failed to get schedule ID. Please try again.');
                    setLoading(false);
                }
            };

            fetchScheduleId();
        }
    }, [open, scheduleName, session, sessionIsValid]);

    const shareUrl = scheduleId ? `${window.location.origin}/share/${scheduleId}` : '';

    const handleCopy = useCallback(async () => {
        if (!shareUrl) return;

        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            enqueueSnackbar('Link copied to clipboard!', { variant: 'success' });
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            enqueueSnackbar('Failed to copy link', { variant: 'error' });
        }
    }, [shareUrl, enqueueSnackbar]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth={fullWidth} maxWidth="sm">
            <DialogTitle>Share Schedule</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Share &quot;{scheduleName}&quot; with others by sending them this link:
                </Typography>

                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
                        <CircularProgress size={24} />
                    </Box>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {!loading && !error && scheduleId && (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <TextField
                            fullWidth
                            value={shareUrl}
                            InputProps={{
                                readOnly: true,
                            }}
                            size="small"
                        />
                        <IconButton onClick={handleCopy} color={copied ? 'success' : 'default'}>
                            {copied ? <Check /> : <ContentCopy />}
                        </IconButton>
                    </Box>
                )}

                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    Anyone with this link can view your schedule.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
