import { ExpandMore, InfoOutlined } from '@mui/icons-material';
import { Collapse, IconButton, Alert, AlertTitle, Box, Typography, Fade } from '@mui/material';
import { useEffect, useState } from 'react';

import { BLUE } from '$src/globals';
//import { lightBlue } from '@mui/material/colors';
import AppStore from '$stores/AppStore';

interface TbaSection {
    deptCode: string;
    courseNumber: string;
    sectionCode: string;
}

interface TbaCalendarCardProps {
    screenshotTrigger?: number;
}

function TbaCircleButton({ onClick }: { onClick: () => void }) {
    return (
        <Box
            sx={{
                position: 'absolute',
                bottom: 16,
                left: 'auto',
                right: 16,
                zIndex: 1,
            }}
        >
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

function TbaExpandedCard({
    tbaSections,
    collapsed,
    onToggle,
}: {
    tbaSections: TbaSection[];
    collapsed: boolean;
    onToggle: () => void;
}) {
    return (
        <Box
            sx={{
                position: 'absolute',
                bottom: 16,
                left: 'auto',
                right: 16,
                zIndex: 1,
                width: { s: '30%', md: '25%' },
            }}
        >
            <Alert
                icon={<InfoOutlined fontSize="small" />}
                severity="info"
                variant="filled"
                sx={{
                    width: '100%',
                    alignItems: collapsed ? 'center' : 'flex-start',
                    py: 1,
                    px: 1,
                    bgcolor: BLUE,
                    '& .MuiAlert-icon': {
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
                    <IconButton size="small" onClick={onToggle} sx={{ paddingLeft: 0 }}>
                        <ExpandMore
                            fontSize="small"
                            sx={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}
                        />
                    </IconButton>
                }
            >
                <AlertTitle sx={{ fontSize: '0.9rem', my: 'auto' }}>TBA sections added:</AlertTitle>

                <Collapse in={!collapsed} timeout="auto" unmountOnExit>
                    <Box sx={{ gap: 0.5 }}>
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

export default function TbaCalendarCard({ screenshotTrigger }: TbaCalendarCardProps) {
    const [tbaSections, setTbaSections] = useState<TbaSection[]>([]);
    const [collapsed, setCollapsed] = useState(true);
    const visible = tbaSections.length > 0;

    const scheduleIndex = AppStore.getCurrentScheduleIndex();

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

    const handleToggleCollapse = () => {
        setCollapsed((prev) => !prev);
    };

    if (!visible) {
        return null;
    }

    return (
        <>
            {collapsed && <TbaCircleButton onClick={handleToggleCollapse} />}
            <Fade in={!collapsed} timeout={250} mountOnEnter unmountOnExit>
                <Box>
                    <TbaExpandedCard tbaSections={tbaSections} collapsed={collapsed} onToggle={handleToggleCollapse} />
                </Box>
            </Fade>
        </>
    );
}
