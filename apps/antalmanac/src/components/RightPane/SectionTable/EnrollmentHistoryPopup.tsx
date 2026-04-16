import { useIsMobile } from '$hooks/useIsMobile';
import { EnrollmentHistory } from '$lib/enrollmentHistory';
import { useThemeStore } from '$stores/SettingsStore';
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
import { useState, useMemo, useCallback } from 'react';
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
    enrollmentHistory?: EnrollmentHistory[] | null;
    loading?: boolean;
}

function graphKey(enrollment: EnrollmentHistory) {
    return `${enrollment.year}-${enrollment.quarter}-${enrollment.instructors.join('|')}`;
}

export function EnrollmentHistoryPopup({
    department,
    courseNumber,
    preferredInstructors = [],
    enrollmentHistory,
    loading = false,
}: EnrollmentHistoryPopupProps) {
    const [selectedInstructorOverride, setSelectedInstructorOverride] = useState<string>();
    const [selectedGraphKey, setSelectedGraphKey] = useState<string>();

    const isMobile = useIsMobile();

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

        return [ALL_INSTRUCTORS_OPTION, ...Array.from(instructors).sort((a, b) => a.localeCompare(b))] as const;
    }, [enrollmentHistory]);
    const defaultSelectedInstructor = useMemo(() => {
        const preferredInstructor = preferredInstructors.find((instructor) => instructorOptions.includes(instructor));
        return preferredInstructor ?? ALL_INSTRUCTORS_OPTION;
    }, [instructorOptions, preferredInstructors]);
    const selectedInstructor = useMemo(() => {
        if (selectedInstructorOverride && instructorOptions.includes(selectedInstructorOverride)) {
            return selectedInstructorOverride;
        }
        return defaultSelectedInstructor;
    }, [defaultSelectedInstructor, instructorOptions, selectedInstructorOverride]);

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
        if (selectedGraphKey) {
            const selectedIndex = filteredEnrollmentHistory.findIndex(
                (enrollment) => graphKey(enrollment) === selectedGraphKey
            );
            if (selectedIndex >= 0) {
                return selectedIndex;
            }
        }
        return filteredEnrollmentHistory.length - 1;
    }, [filteredEnrollmentHistory, selectedGraphKey]);

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
        if (!filteredEnrollmentHistory?.length || activeGraphIndex === 0) {
            return;
        }
        setSelectedGraphKey(graphKey(filteredEnrollmentHistory[activeGraphIndex - 1]));
    }, [activeGraphIndex, filteredEnrollmentHistory]);

    const handleForward = useCallback(() => {
        if (!filteredEnrollmentHistory?.length || activeGraphIndex === filteredEnrollmentHistory.length - 1) {
            return;
        }
        setSelectedGraphKey(graphKey(filteredEnrollmentHistory[activeGraphIndex + 1]));
    }, [activeGraphIndex, filteredEnrollmentHistory]);

    const handleSelectInstructor = useCallback((event: SelectChangeEvent<string>) => {
        setSelectedInstructorOverride(event.target.value);
        // Clear explicit graph selection so newly filtered data defaults to newest quarter.
        setSelectedGraphKey(undefined);
    }, []);

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
                    <LineChart
                        data={lineChartData}
                        style={{ cursor: 'pointer' }}
                        margin={{ top: 8, right: 16, left: 4 }}
                    >
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
