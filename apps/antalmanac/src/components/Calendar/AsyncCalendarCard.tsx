import { List, ListItem, ListItemText, Stack,  Collapse, IconButton, AlertTitle, Snackbar, Alert } from '@mui/material';
import { ExpandMore, InfoOutlined } from '@mui/icons-material';
import { useEffect, useMemo, useState } from 'react';
import AppStore from '$stores/AppStore';

interface TbaSection {
  courseTitle: string;
  sectionCode: string;
}

const COLLAPSE_KEY = (idx: number | null | undefined) =>
  `aa:tbaSnack:collapsed:${idx ?? 'none'}`;

export default function AsyncCalendarCard() {
  const [rev, setRev] = useState(0);
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Re-renders
  useEffect(() => {
    const bump = () => setRev(v => v + 1);
    AppStore.on('addedCoursesChange', bump);
    AppStore.on('removedCoursesChange', bump);
    AppStore.on('clearSchedule', bump);
    AppStore.on('currentScheduleIndexChange', bump);
    return () => {
      AppStore.off('addedCoursesChange', bump);
      AppStore.off('removedCoursesChange', bump);
      AppStore.off('clearSchedule', bump);
      AppStore.off('currentScheduleIndexChange', bump);
    };
  }, []);

  const scheduleIndex = AppStore.getCurrentScheduleIndex();

  // Restore per-schedule collapsed preference
  useEffect(() => {
    const wasCollapsed = localStorage.getItem(COLLAPSE_KEY(scheduleIndex)) === '1';
    setCollapsed(wasCollapsed);
  }, [scheduleIndex]);

  // Compute TBA entries for the current schedule context
  const tbaSections: TbaSection[] = useMemo(() => {
    if (scheduleIndex == null) return [];
    const courses = AppStore.schedule.getCurrentCourses();
    const flagged: TbaSection[] = [];
    for (const course of courses) {
      const section = course.section;
      if (!section) continue;
      const meetings = section.meetings ?? [];
      if (meetings.some((m) => m.timeIsTBA)) {
        flagged.push({
          courseTitle: course.courseTitle,
          sectionCode: section.sectionCode,
        });
      }
    }
    return flagged;
  }, [rev, scheduleIndex]);

  // Open/close behavior driven by TBA presence + dismissal flag
  useEffect(() => {
    setOpen(tbaSections.length > 0);
  }, [tbaSections]);

  if (tbaSections.length === 0) return null;

  const handleToggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY(scheduleIndex), next ? '1' : '0');
      return next;
    });
  };

  return (
    <Snackbar
      key={`tba-${scheduleIndex}`}
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      autoHideDuration={null}
      sx={{ 
        zIndex: theme => theme.zIndex.snackbar - 1, 
        transform: 'translate(40px)'
    }}
    >
      <Alert
        icon={<InfoOutlined fontSize="small" />}
        severity="info"
        variant="outlined"
        sx={{
          bgcolor: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(6px)',
          py: collapsed ? 0.5 : 0.75,
          px: 1,
        }}
        action={
        <IconButton size="small" aria-label="toggle details" onClick={handleToggleCollapse}>
            {collapsed ? <ExpandMore fontSize="small" /> : <ExpandMore fontSize="small" style={{ transform: 'rotate(180deg)' }} />}
        </IconButton>
        }
      >
        <AlertTitle sx={{ mb: collapsed ? 0 : 1, pr: 0.5 }}>
          You’ve got classes with TBA times
        </AlertTitle>

        <Collapse in={!collapsed} timeout="auto" unmountOnExit>
          <List dense disablePadding sx={{mt: 0.25, py: 0.25}}>
            {tbaSections.map((c, idx) => (
              <ListItem key={`${c.courseTitle}-${c.sectionCode}-${idx}`} sx={{ py: 0.25 }}>
                <ListItemText
                  primary={`${c.courseTitle} — ${c.sectionCode}`}
                  secondary="TBA time"
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </Alert>
    </Snackbar>
  );
}