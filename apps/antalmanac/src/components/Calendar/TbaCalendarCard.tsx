import { useIsMobile } from '$hooks/useIsMobile';
import { BLUE } from '$src/globals';
import AppStore from '$stores/AppStore';
import { useThemeStore } from '$stores/SettingsStore';
import { Close, InfoOutlined } from '@mui/icons-material';
import { Alert, AlertTitle, Box, Fade, IconButton, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';

interface TbaSection {
    deptCode: string;
    courseNumber: string;
    sectionCode: string;
}

const CARD_POSITION_SX = {
    position: 'absolute' as const,
    bottom: 16,
    right: 16,
    zIndex: 1,
};

function TbaCircleButton({ onClick }: { onClick: () => void }) {
    return (
        <Box sx={CARD_POSITION_SX}>
            <Box
                onClick={onClick}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: BLUE,
                    boxShadow: 2,
                    cursor: 'pointer',
                }}
            >
                <Typography variant="button" sx={{ fontWeight: 600, letterSpacing: 1, color: 'white' }}>
                    TBA
                </Typography>
            </Box>
        </Box>
    );
}

function TbaExpandedCard({ tbaSections, onToggle }: { tbaSections: TbaSection[]; onToggle: () => void }) {
    const theme = useTheme();
    const isDark = useThemeStore((store) => store.isDark);
    const isMobile = useIsMobile();
    return (
        <Alert
            icon={<InfoOutlined fontSize="small" sx={{ color: isDark ? theme.palette.common.white : BLUE }} />}
            severity="info"
            variant="outlined"
            sx={{
                width: '100%',
                bgcolor: theme.palette.background.paper,
                borderColor: BLUE,
                color: isDark ? theme.palette.common.white : 'inherit',
                borderWidth: 2,
                alignItems: 'center',
                py: 0.5,
                px: 0.5,
                '& .MuiAlert-icon': {
                    padding: 0.5,
                    margin: 0,
                },
                '& .MuiAlert-message': {
                    padding: 0.5,
                    width: '100%',
                },

                '& .MuiAlert-action': {
                    padding: 0,
                    margin: 0,
                    alignSelf: 'flex-start',
                },
            }}
            action={
                <IconButton size="small" onClick={onToggle} sx={{ p: 0.5 }}>
                    <Close fontSize="small" />
                </IconButton>
            }
        >
            {isMobile ? (
                <AlertTitle sx={{ typography: 'subtitle2', my: 'auto' }}>TBA added:</AlertTitle>
            ) : (
                <AlertTitle sx={{ typography: 'subtitle2', my: 'auto' }}>TBA section added:</AlertTitle>
            )}

            <Box sx={{ gap: 0.5 }}>
                {tbaSections.map((section) => (
                    <Typography
                        key={`${section.deptCode}-${section.courseNumber}-${section.sectionCode}`}
                        variant="body2"
                    >
                        {isMobile
                            ? `${section.deptCode} ${section.courseNumber}`
                            : `${section.deptCode} ${section.courseNumber} — ${section.sectionCode}`}
                    </Typography>
                ))}
            </Box>
        </Alert>
    );
}

export function TbaCalendarCard() {
    const [tbaSections, setTbaSections] = useState<TbaSection[]>([]);
    const [collapsed, setCollapsed] = useState(true);
    const visible = tbaSections.length > 0;
    const isMobile = useIsMobile();

    useEffect(() => {
        const updateTbaSections = () => {
            const scheduleIndex = AppStore.getCurrentScheduleIndex();
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

    const handleToggleCollapse = () => {
        setCollapsed((prev) => !prev);
    };

    if (!visible) {
        return null;
    }

    return (
        <Box data-html2canvas-ignore>
            {collapsed && <TbaCircleButton onClick={handleToggleCollapse} />}
            <Fade in={!collapsed} timeout={250} mountOnEnter unmountOnExit>
                <Box sx={{ ...CARD_POSITION_SX, width: '100%', maxWidth: isMobile ? 140 : 180 }}>
                    <TbaExpandedCard tbaSections={tbaSections} onToggle={handleToggleCollapse} />
                </Box>
            </Fade>
        </Box>
    );
}
