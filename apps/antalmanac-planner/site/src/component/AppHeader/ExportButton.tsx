import { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider } from '@mui/material';
import { IosShare, Link, Print } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useSaveRoadmap } from '../../hooks/planner';
import trpc from '../../trpc';
import { setShowToast, setToastMsg, setToastSeverity } from '../../store/slices/roadmapSlice';

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
    const url = new URL(window.location.href);
    url.pathname = url.pathname.replace(/\/$/, '') + `/share/${shareId}`;
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
            <Button variant="contained" color="primary" onClick={handlePrint} startIcon={<Print />} fullWidth>
              Export to PDF
            </Button>
            <Divider />

            <Button variant="contained" color="primary" onClick={handleShareURL} fullWidth startIcon={<Link />}>
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
