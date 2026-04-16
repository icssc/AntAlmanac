import { ArrowBack, ArrowForward } from '@mui/icons-material';
import {
    Box,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Skeleton,
    Tooltip,
    Typography,
    type SelectChangeEvent,
} from '@mui/material';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    LineChart,
    Line,
    CartesianGrid,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    Legend,
} from 'recharts';

import { useIsMobile } from '$hooks/useIsMobile';
import { DepartmentEnrollmentHistory, EnrollmentHistory } from '$lib/enrollmentHistory';
import { useThemeStore } from '$stores/SettingsStore';

type PopupHeaderCallback = () => void;
const ALL_INSTRUCTORS_OPTION = '__all_instructors__';

interface PopupHeaderProps {
    graphWidth: number;
    graphIndex: number;
    handleForward: PopupHeaderCallback;
    handleBack: PopupHeaderCallback;
    popupTitle: string;
    historyCount: number;
}

function PopupHeader({
    graphWidth,
    graphIndex,
    handleForward,
    handleBack,
    popupTitle,
    historyCount,
}: PopupHeaderProps) {
    const isMobile = useIsMobile();

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: graphWidth,
            }}
        >
            <Tooltip title="Older Graph">
                {/* In order for a tooltip to work properly with disabled buttons, we need to wrap the button in a span */}
                <span>
                    <IconButton onClick={handleBack} disabled={graphIndex === 0}>
                        <ArrowBack />
                    </IconButton>
                </span>
            </Tooltip>
            <Typography sx={{ fontWeight: 500, fontSize: isMobile ? '0.8rem' : '1rem', textAlign: 'center' }}>
                {popupTitle}
            </Typography>
            <Tooltip title="Newer Graph">
                <span>
                    <IconButton onClick={handleForward} disabled={graphIndex === historyCount - 1}>
                        <ArrowForward />
                    </IconButton>
                </span>
            </Tooltip>
        </Box>
    );
}

interface EnrollmentHistoryPopupProps {
    department: string;
    courseNumber: string;
    preferredInstructors?: string[];
}

export function EnrollmentHistoryPopup({ department, courseNumber, preferredInstructors = [] }: EnrollmentHistoryPopupProps) {
    const [loading, setLoading] = useState(true);
    const [enrollmentHistory, setEnrollmentHistory] = useState<EnrollmentHistory[]>();
    const [selectedInstructor, setSelectedInstructor] = useState(ALL_INSTRUCTORS_OPTION);
    const [graphIndex, setGraphIndex] = useState(0);
    const hasAppliedDefaultInstructor = useRef(false);

    const isMobile = useIsMobile();

    const deptEnrollmentHistory = useMemo(() => new DepartmentEnrollmentHistory(department), [department]);

    const graphWidth = useMemo(() => (isMobile ? 250 : 450), [isMobile]);
    const graphHeight = useMemo(() => (isMobile ? 175 : 250), [isMobile]);
    const instructorOptions = useMemo(() => {
        if (!enrollmentHistory) {
            return [];
        }

        const instructors = new Set<string>();
        for (const quarterHistory of enrollmentHistory) {
            for (const instructor of quarterHistory.instructors) {
                if (instructor && instructor !== 'STAFF') {
                    instructors.add(instructor);
                }
            }
        }

        return [ALL_INSTRUCTORS_OPTION, ...Array.from(instructors).sort((a, b) => a.localeCompare(b))];
    }, [enrollmentHistory]);

    const filteredEnrollmentHistory = useMemo(() => {
        if (!enrollmentHistory) {
            return undefined;
        }

        if (selectedInstructor === ALL_INSTRUCTORS_OPTION) {
            return enrollmentHistory;
        }

        return enrollmentHistory.filter((quarterHistory) => quarterHistory.instructors.includes(selectedInstructor));
    }, [enrollmentHistory, selectedInstructor]);

    const selectedInstructorLabel = useMemo(
        () => (selectedInstructor === ALL_INSTRUCTORS_OPTION ? 'all instructors' : selectedInstructor),
        [selectedInstructor]
    );
    const activeGraphIndex = useMemo(() => {
        if (!filteredEnrollmentHistory?.length) {
            return 0;
        }
        return Math.min(graphIndex, filteredEnrollmentHistory.length - 1);
    }, [filteredEnrollmentHistory, graphIndex]);

    const popupTitle = useMemo(() => {
        if (enrollmentHistory == null) {
            return 'No past enrollment data found for this course';
        }

        if (!filteredEnrollmentHistory?.length) {
            return `No past enrollment data found for ${selectedInstructorLabel}.`;
        }

        const currEnrollmentHistory = filteredEnrollmentHistory[activeGraphIndex];
        return `${department} ${courseNumber} | ${currEnrollmentHistory.year} ${
            currEnrollmentHistory.quarter
        } | ${currEnrollmentHistory.instructors.join(', ')}`;
    }, [
        activeGraphIndex,
        courseNumber,
        department,
        enrollmentHistory,
        filteredEnrollmentHistory,
        selectedInstructorLabel,
    ]);
    const isDark = useThemeStore((state) => state.isDark);
    const axisColor = isDark ? '#fff' : '#111';
    const tooltipDateColor = isDark ? '#f5f5f5' : '#111';
    const tooltipBackgroundColor = isDark ? '#1f1f1f' : '#fff';

    const handleBack = useCallback(() => {
        setGraphIndex((prev) => Math.max(prev - 1, 0));
    }, []);

    const handleForward = useCallback(() => {
        setGraphIndex((prev) => {
            const maxGraphIndex = filteredEnrollmentHistory?.length ? filteredEnrollmentHistory.length - 1 : 0;
            return Math.min(prev + 1, maxGraphIndex);
        });
    }, [filteredEnrollmentHistory]);

    const handleSelectInstructor = useCallback((event: SelectChangeEvent<string>) => {
        setSelectedInstructor(event.target.value);
    }, []);

    useEffect(() => {
        if (!loading) {
            return;
        }

        deptEnrollmentHistory.find(courseNumber).then((data) => {
            if (data) {
                setEnrollmentHistory(data);
                // The graph index is the last past enrollment graph since we want to show
                // the most recent quarter's graph
                setGraphIndex(data.length - 1);
            }
            setLoading(false);
        });
    }, [loading, deptEnrollmentHistory, courseNumber]);

    useEffect(() => {
        if (!instructorOptions.length || hasAppliedDefaultInstructor.current) {
            return;
        }

        const preferredInstructor = preferredInstructors.find((instructor) => instructorOptions.includes(instructor));
        if (preferredInstructor) {
            setSelectedInstructor(preferredInstructor);
            hasAppliedDefaultInstructor.current = true;
            return;
        }

        setSelectedInstructor(ALL_INSTRUCTORS_OPTION);
        hasAppliedDefaultInstructor.current = true;
    }, [instructorOptions, preferredInstructors]);

    useEffect(() => {
        if (!filteredEnrollmentHistory?.length) {
            setGraphIndex(0);
            return;
        }
        // Default to the newest quarter in the active instructor filter.
        setGraphIndex(filteredEnrollmentHistory.length - 1);
    }, [filteredEnrollmentHistory]);

    if (loading) {
        return (
            <Box padding={1}>
                <Skeleton variant="text" animation="wave" height={graphHeight} width={graphWidth} />
            </Box>
        );
    }

    if (enrollmentHistory == null || !filteredEnrollmentHistory?.length) {
        return (
            <Box padding={1}>
                <Typography variant="body1" align="center">
                    {popupTitle}
                </Typography>
            </Box>
        );
    }

    const lineChartData = filteredEnrollmentHistory[activeGraphIndex].days;

    return (
        <Box sx={{ padding: 0.5 }}>
            <PopupHeader
                graphWidth={graphWidth}
                graphIndex={activeGraphIndex}
                handleForward={handleForward}
                handleBack={handleBack}
                popupTitle={popupTitle}
                historyCount={filteredEnrollmentHistory.length}
            />
            {instructorOptions.length > 1 ? (
                <Box sx={{ paddingX: 1, paddingBottom: 0.5, width: graphWidth }}>
                    <FormControl size="small" fullWidth>
                        <InputLabel id="enrollment-instructor-filter-label">Instructor</InputLabel>
                        <Select
                            labelId="enrollment-instructor-filter-label"
                            value={selectedInstructor}
                            label="Instructor"
                            onChange={handleSelectInstructor}
                        >
                            <MenuItem value={ALL_INSTRUCTORS_OPTION}>All instructors</MenuItem>
                            {instructorOptions
                                .filter((option) => option !== ALL_INSTRUCTORS_OPTION)
                                .map((instructorOption) => (
                                    <MenuItem key={instructorOption} value={instructorOption}>
                                        {instructorOption}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>
                </Box>
            ) : null}
            <Box sx={{ display: 'flex', height: graphHeight, width: graphWidth }}>
                <ResponsiveContainer width="95%" height="95%">
                    <LineChart data={lineChartData} style={{ cursor: 'pointer' }} margin={{ top: 8, right: 16, left: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: axisColor }} />
                        <YAxis tick={{ fontSize: 12, fill: axisColor }} width={48} />
                        <RechartsTooltip
                            labelStyle={{ color: tooltipDateColor }}
                            contentStyle={{
                                backgroundColor: tooltipBackgroundColor,
                                borderRadius: 8,
                                border: `1px solid ${isDark ? '#3a3a3a' : '#d8d8d8'}`,
                            }}
                            itemStyle={{ color: tooltipDateColor }}
                        />
                        <Legend wrapperStyle={{ fontSize: isMobile ? 11 : 12 }} />
                        <Line
                            type="monotone"
                            dataKey="totalEnrolled"
                            stroke="#3366CC"
                            name="Enrolled"
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="maxCapacity"
                            stroke="#2E8B57"
                            name="Capacity"
                            strokeWidth={2}
                            strokeDasharray="6 4"
                            dot={false}
                            activeDot={{ r: 3 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="waitlist"
                            stroke="#D97706"
                            name="Waitlist"
                            strokeWidth={2}
                            dot={false}
                            connectNulls
                            activeDot={{ r: 3 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Box>
        </Box>
    );
}
