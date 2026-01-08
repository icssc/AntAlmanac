import { Collapse, IconButton, Alert, AlertTitle, Box, Typography, useTheme } from '@mui/material';
import { ExpandMore, InfoOutlined } from '@mui/icons-material';
import { useEffect, useMemo, useState } from 'react';
import AppStore from '$stores/AppStore';
import { getLocalStorageTempSaveData } from '$lib/localStorage';
import { setTempSaveData } from '$stores/localTempSaveDataHelpers';
import { useIsMobile } from '$hooks/useIsMobile';

interface TbaSection {
  courseTitle: string;
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
            courseTitle: course.courseTitle,
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
    const raw = getLocalStorageTempSaveData();
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      const openIndex = parsed.openTbaCard;

      setCollapsed(openIndex !== scheduleIndex);
    } catch {
      setCollapsed(false);
    }
  }, [scheduleIndex]);

  useEffect(() => {
    setVisible(tbaSections.length > 0);
  }, [tbaSections]);

  useEffect(() => {
    if (visible) {
      setCollapsed(false);
      setTempSaveData({
      currentScheduleIndex: scheduleIndex,
      openTbaCard: scheduleIndex,
    });
    }
  }, [visible, scheduleIndex]);

  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      setTempSaveData({
        currentScheduleIndex: scheduleIndex,
        openTbaCard: next ? null : scheduleIndex,
      });
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
        zIndex: (theme) => theme.zIndex.drawer - 1,
        width: '35%',
      }}
    >
      <Alert
        icon={<InfoOutlined fontSize="small" />}
        severity="info"
        variant="outlined"
        sx={{
          bgcolor: theme.palette.background.paper,
          py: 0.5,
          px: 1,
          width: '100%',
        }}
        action={
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <IconButton size="small" onClick={handleToggleCollapse}>
            <ExpandMore
              fontSize="small"
              sx={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}
            />
          </IconButton>
        </Box>
        }
      >
        <AlertTitle sx={{ fontSize: '0.9rem', my: 'auto'}}>
          You've added TBA sections:
        </AlertTitle>

        <Collapse in={!collapsed} timeout="auto" unmountOnExit>
          <Box sx={{ gap: 0.5}}>
            {tbaSections.map((section, idx) => (
              <Typography key={`${section.courseTitle}-${section.sectionCode}-${idx}`} variant="body2">
                {section.courseTitle} — {section.sectionCode}
              </Typography>
            ))}
          </Box>
        </Collapse>
      </Alert>
    </Box>
  );
}