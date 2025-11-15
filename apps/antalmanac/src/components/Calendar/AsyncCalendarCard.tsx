import { List, ListItem, ListItemText, Collapse, IconButton, Alert, AlertTitle, Box } from '@mui/material';
import { ExpandMore, InfoOutlined } from '@mui/icons-material';
import { useEffect, useMemo, useState } from 'react';
import AppStore from '$stores/AppStore';

interface TbaSection {
  courseTitle: string;
  sectionCode: string;
}

function getCollapseKey(scheduleIndex: number | null | undefined): string {
  return `aa:tbaSnack:collapsed:${scheduleIndex ?? 'none'}`;
}

export default function AsyncCalendarCard() {
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [visible, setVisible] = useState(false);

  const scheduleIndex = AppStore.getCurrentScheduleIndex();

  useEffect(() => {
    const handleUpdate = () => setUpdateTrigger((prev) => prev + 1);
    AppStore.on('addedCoursesChange', handleUpdate);
    AppStore.on('removedCoursesChange', handleUpdate);
    AppStore.on('clearSchedule', handleUpdate);
    AppStore.on('currentScheduleIndexChange', handleUpdate);
    return () => {
      AppStore.off('addedCoursesChange', handleUpdate);
      AppStore.off('removedCoursesChange', handleUpdate);
      AppStore.off('clearSchedule', handleUpdate);
      AppStore.off('currentScheduleIndexChange', handleUpdate);
    };
  }, []);

  useEffect(() => {
    const storedValue = localStorage.getItem(getCollapseKey(scheduleIndex));
    setCollapsed(storedValue === '1');
  }, [scheduleIndex]);

  const tbaSections: TbaSection[] = useMemo(() => {
    if (scheduleIndex == null) return [];

    const courses = AppStore.schedule.getCurrentCourses();
    const sectionsWithTBA: TbaSection[] = [];

    for (const course of courses) {
      const section = course.section;
      if (!section) continue;
      const meetings = section.meetings ?? [];
      if (meetings.some((m) => m.timeIsTBA)) {
        sectionsWithTBA.push({
          courseTitle: course.courseTitle,
          sectionCode: section.sectionCode,
        });
      }
    }
    return sectionsWithTBA;
  }, [updateTrigger, scheduleIndex]);

  useEffect(() => {
    setVisible(tbaSections.length > 0);
  }, [tbaSections]);

  useEffect(() => {
    if (visible) {
      setCollapsed(false);
      localStorage.setItem(getCollapseKey(scheduleIndex), '0');
    }
  }, [visible, scheduleIndex]);

  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const newValue = !prev;
      localStorage.setItem(getCollapseKey(scheduleIndex), newValue ? '1' : '0');
      return newValue;
    });
  };

  if (!visible) return null;

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
          <List dense disablePadding sx={{ mt: 0.25, py: 0.25 }}>
            {tbaSections.map((section, idx) => (
              <ListItem key={`${section.courseTitle}-${section.sectionCode}-${idx}`} sx={{ py: 0.25 }}>
                <ListItemText
                  primary={`${section.courseTitle} — ${section.sectionCode}`}
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