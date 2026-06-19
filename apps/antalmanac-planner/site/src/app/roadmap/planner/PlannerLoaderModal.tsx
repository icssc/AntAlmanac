'use client';
import { FC } from 'react';
import { SavedRoadmap } from '@peterportal/types';
import { Button, Dialog, DialogContent, DialogContentText, DialogTitle, Divider } from '@mui/material';

// relative time of last roadmap edit
const getRelativeTime = (timestamp: string | undefined) => {
  if (!timestamp) return undefined;
  const diff = new Date(timestamp).getTime() - Date.now();
  if (!Number.isFinite(diff)) return undefined;
  const seconds = Math.round(diff / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (Math.abs(seconds) < 60) return rtf.format(seconds, 'second');
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute');
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');
  return rtf.format(days, 'day');
};

// count planners + courses + lastEdited
const countRoadmapStats = (roadmap: SavedRoadmap) => {
  const lastEdited = roadmap?.timestamp ? new Date(roadmap.timestamp).toLocaleString() : undefined;
  const roadmapCount = roadmap.planners.length;
  const courseCount = roadmap.planners
    .flatMap((planner) => planner.content)
    .flatMap((year) => year.quarters)
    .reduce((total, quarter) => total + quarter.courses.length, 0);

  return { lastEdited, roadmapCount, courseCount };
};

interface PlannerLoaderProps {
  open: boolean;
  onClose: (value: boolean) => void;
  overrideLoading: boolean;
  accountLoading: boolean;
  initialAccountRoadmap: SavedRoadmap | null;
  initialLocalRoadmap: SavedRoadmap | null;
  overrideAccountRoadmap: () => void;
  syncAccount: () => void;
}

const PlannerLoaderModal: FC<PlannerLoaderProps> = ({
  open: showSyncModal,
  onClose: setShowSyncModal,
  overrideLoading,
  accountLoading,
  initialAccountRoadmap,
  initialLocalRoadmap,
  overrideAccountRoadmap,
  syncAccount,
}) => {
  // stats for synced roadmap
  const {
    lastEdited: syncedLastEdited,
    roadmapCount: syncedRoadmapCount,
    courseCount: syncedCourseCount,
  } = initialAccountRoadmap ? countRoadmapStats(initialAccountRoadmap) : { roadmapCount: 0, courseCount: 0 };

  const {
    lastEdited: localLastEdited,
    roadmapCount: localRoadmapCount,
    courseCount: localCourseCount,
  } = initialLocalRoadmap ? countRoadmapStats(initialLocalRoadmap) : { roadmapCount: 0, courseCount: 0 };

  return (
    <Dialog
      open={showSyncModal}
      onClose={() => {
        setShowSyncModal(false);
      }}
    >
      <DialogTitle>Roadmap Out of Sync</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This device's saved roadmap has newer changes than the one saved to your account. Where would you like to load
          your roadmap from?
        </DialogContentText>
        <Divider sx={{ my: 4 }} />
        {/* Displayed Info */}
        <div
          className="displayed-info"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginTop: '12px',
            marginBottom: '12px',
          }}
        >
          {/* 'This Device' column */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <DialogContentText>
              <strong>This Device</strong>
            </DialogContentText>
            <DialogContentText>
              Last edited: <strong>{getRelativeTime(localLastEdited)}</strong>
            </DialogContentText>
            <DialogContentText>
              <strong>{localRoadmapCount}</strong> roadmaps
            </DialogContentText>
            <DialogContentText>
              <strong>{localCourseCount}</strong> courses
            </DialogContentText>
            <Button
              loading={overrideLoading}
              disabled={overrideLoading || accountLoading}
              color="error"
              variant="contained"
              onClick={overrideAccountRoadmap}
              sx={{ marginTop: 4, alignSelf: 'flex-start' }}
            >
              This Device
            </Button>
            <DialogContentText sx={{ marginTop: 2, fontSize: 12, color: 'var(--mui-palette-error-main)' }}>
              Warning: Loading from this device can override your synced account data.
            </DialogContentText>
          </div>
          {/* 'My Account' column */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <DialogContentText>
              <strong>My Account</strong>
            </DialogContentText>
            <DialogContentText>
              Last edited: <strong>{getRelativeTime(syncedLastEdited)}</strong>
            </DialogContentText>
            <DialogContentText>
              <strong>{syncedRoadmapCount}</strong> roadmaps
            </DialogContentText>
            <DialogContentText>
              <strong>{syncedCourseCount}</strong> courses
            </DialogContentText>
            <Button
              loading={accountLoading}
              disabled={overrideLoading || accountLoading}
              variant="contained"
              onClick={syncAccount}
              sx={{ marginTop: 4, alignSelf: 'flex-start' }}
            >
              My Account
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlannerLoaderModal;
