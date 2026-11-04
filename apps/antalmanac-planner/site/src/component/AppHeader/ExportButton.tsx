import { IosShare, Link, Print } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider } from '@mui/material';
import { useState } from 'react';

import { useSaveRoadmap } from '../../hooks/planner';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setShowToast, setToastMsg, setToastSeverity } from '../../store/slices/roadmapSlice';
import trpc from '../../trpc';

const ExportButton = () => {
    const dispatch = useAppDispatch();
    const [showModal, setShowModal] = useState(false);
    const currentPlan = useAppSelector((state) => state.roadmap.plans[state.roadmap.currentPlanIndex]);
    const { handler: saveRoadmap } = useSaveRoadmap();

    const handleClose = () => {
        setShowModal(false);
    };

    const handlePrint = () => {
        setShowModal(false);
        setTimeout(() => window.print(), 500);
    };

    const handleShareURL = async () => {
        const saveResult = await saveRoadmap();
        if (!saveResult?.success) return;

        const resolvedPlanId = saveResult.plannerIdLookup?.[currentPlan.id] ?? currentPlan.id;
        if (resolvedPlanId <= 0) {
            dispatch(setToastMsg('Save your roadmap before sharing it'));
            dispatch(setToastSeverity('error'));
            dispatch(setShowToast(true));
            return;
        }

        const shareId =
            currentPlan.shareId ?? (await trpc.roadmaps.ensureShareId.mutate({ plannerId: resolvedPlanId })).shareId;
        // Export is available on every page, so build the link from the site root rather than the current path
        const url = new URL(`/planner/share/${shareId}`, window.location.origin);
        await navigator.clipboard.writeText(url.toString());
        setShowModal(false);
        dispatch(setToastMsg('Share URL copied to clipboard!'));
        dispatch(setToastSeverity('success'));
        dispatch(setShowToast(true));
    };

    return (
        <>
            <Button
                className="header-button"
                variant="text"
                size="medium"
                color="inherit"
                startIcon={<IosShare />}
                onClick={() => setShowModal(true)}
            >
                Export
            </Button>
            <Dialog open={showModal} onClose={handleClose} className="changelog-modal" maxWidth="xs" fullWidth>
                <DialogTitle>Export Roadmap</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handlePrint}
                            startIcon={<Print />}
                            fullWidth
                        >
                            Export to PDF
                        </Button>
                        <Divider />

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleShareURL}
                            fullWidth
                            startIcon={<Link />}
                        >
                            Share via URL
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button variant="text" color="inherit" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="contained" color="primary" onClick={() => {}}>
                        Export
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ExportButton;
