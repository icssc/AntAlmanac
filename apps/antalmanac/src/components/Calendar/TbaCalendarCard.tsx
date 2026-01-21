import { Collapse, IconButton, Alert, AlertTitle, Box, Typography, useTheme } from '@mui/material';
import { ExpandMore, InfoOutlined } from '@mui/icons-material';
import { useEffect, useMemo, useState } from 'react';
import AppStore from '$stores/AppStore';
import { useIsMobile } from '$hooks/useIsMobile';

interface TbaSection {
  deptCode: string;
  courseNumber: string;
  sectionCode: string;
}

interface TbaCalendarCardProps {
  screenshotTrigger?: number;
}

export default function TbaCalendarCard({ screenshotTrigger }: TbaCalendarCardProps) {
  const isMobile = useIsMobile();
  const [tbaSections, setTbaSections] = useState<TbaSection[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [visible, setVisible] = useState(false);

  const scheduleIndex = AppStore.getCurrentScheduleIndex();
  const theme = useTheme();

  useEffect(() => {
    const updateTbaSections = () => {
      if (scheduleIndex == null) {
        setTbaSections([]);
        return;
      }

      const courses = AppStore.schedule.getCurrentCourses();
      const sectionsWithTBA: TbaSection[] = [];

      for (const course of courses) {
        const section = course.section;
        if (!section) continue;
        const meetings = section.meetings ?? [];
        if (meetings.some((m) => m.timeIsTBA)) {
          sectionsWithTBA.push({
            deptCode: course.deptCode,
            courseNumber: course.courseNumber,
            sectionCode: section.sectionCode,
          });
        }
      }

      setTbaSections(sectionsWithTBA);
    };

    AppStore.on('addedCoursesChange', updateTbaSections);
    AppStore.on('removedCoursesChange', updateTbaSections);
    AppStore.on('clearSchedule', updateTbaSections);
    AppStore.on('currentScheduleIndexChange', updateTbaSections);

    updateTbaSections();

    return () => {
      AppStore.off('addedCoursesChange', updateTbaSections);
      AppStore.off('removedCoursesChange', updateTbaSections);
      AppStore.off('clearSchedule', updateTbaSections);
      AppStore.off('currentScheduleIndexChange', updateTbaSections);
    };
  }, []);

  useEffect(() => {
    if (screenshotTrigger != null) {
      setCollapsed(false);
    }
  }, [screenshotTrigger]);

  useEffect(() => {
    setVisible(tbaSections.length > 0);
  }, [tbaSections]);

  useEffect(() => {
    if (visible) {
      setCollapsed(false);
    }
  }, [visible]);

  const handleToggleCollapse = () => {
    setCollapsed((prev) => !prev);
      const next = !prev;
      return next;
    });
  };

  if (!visible || isMobile) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 16,
        left: 'auto',
        right: 16,
        zIndex: 1,
        width: '30%',
      }}
    >
      <Alert
        icon={<InfoOutlined fontSize="small" />}
        severity="info"
        variant="outlined"
        sx={{
          bgcolor: theme.palette.background.paper,
          width: '100%',
          alignItems: collapsed ? 'center' : 'flex-start',
          py: 1,
          px: 1,
          '& .MuiAlert-message': {
            padding: 0,
            width: '100%',
          },

          '& .MuiAlert-action': {
            padding: 0,
            margin: 0,
            alignSelf: 'flex-start',
          },
        }}
        action={
          <IconButton size="small" onClick={handleToggleCollapse}>
            <ExpandMore
              fontSize="small"
              sx={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}
            />
          </IconButton>
        }
      >
        <AlertTitle sx={{ fontSize: '0.9rem', my: 'auto'}}>
          TBA sections added:
        </AlertTitle>

        <Collapse in={!collapsed} timeout="auto" unmountOnExit>
          <Box sx={{ gap: 0.5}}>
            {tbaSections.map((section, idx) => (
              <Typography key={`${section.deptCode}-${section.sectionCode}-${idx}`} variant="body2">
                {section.deptCode} {section.courseNumber} — {section.sectionCode}
              </Typography>
            ))}
          </Box>
        </Collapse>
      </Alert>
    </Box>
  );
}