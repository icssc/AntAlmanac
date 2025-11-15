import { List, ListItem, ListItemText, Collapse, IconButton, Alert, AlertTitle, Box } from '@mui/material';
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
  const [collapsed, setCollapsed] = useState(false);
  const [visible, setVisible] = useState(false);

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

  useEffect(() => {
    const wasCollapsed = localStorage.getItem(COLLAPSE_KEY(scheduleIndex)) === '1';
    setCollapsed(wasCollapsed);
  }, [scheduleIndex]);

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

  useEffect(() => {
    setVisible(tbaSections.length > 0);
  }, [tbaSections]);
  
  useEffect(() => {
    if (visible) {
      setCollapsed(false);
      localStorage.setItem(COLLAPSE_KEY(scheduleIndex), '0');
    }
  }, [visible, scheduleIndex]);

  if (!visible) return null;

  const handleToggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY(scheduleIndex), next ? '1' : '0');
      return next;
    });
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 16,
        left: { xs: 16, sm: 'auto' },
        right: { xs: 'auto', sm: 16 },
        zIndex: theme => theme.zIndex.modal - 1,
        width: '22rem',
      }}
    >
      <Alert
        icon={<InfoOutlined fontSize="small" />}
        severity="info"
        variant="outlined"
        sx={{
          bgcolor: 'rgba(255,255,255,0.9)',
          py: 0.5,
          px: 1,
          width: '100%',
        }}
        action={
        <IconButton size="small" onClick={handleToggleCollapse}>
            {collapsed ? <ExpandMore fontSize="small" /> : <ExpandMore fontSize="small" sx={{ transform: 'rotate(180deg)' }} />}
        </IconButton>
        }
      >
        <AlertTitle sx={{ fontSize: '1em' }}>
          You've got sections with TBA times:
        </AlertTitle>

        <Collapse in={!collapsed} timeout="auto" unmountOnExit>
          <List dense disablePadding sx={{mt: 0.25, py: 0.25, whiteSpace: 'nowrap'}}>
            {tbaSections.map((c, idx) => (
              <ListItem key={`${c.courseTitle}-${c.sectionCode}-${idx}`} sx={{ py: 0.25 }}>
                <ListItemText
                  primary={`${c.courseTitle} — ${c.sectionCode}`}
                  primaryTypographyProps={{ variant: 'body2' }}
                  sx={{ my: 0 }}
                />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </Alert>
    </Box>
  );
}