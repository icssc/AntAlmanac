import { useIsMobile } from "$hooks/useIsMobile";
import { DepartmentEnrollmentHistory, EnrollmentHistory } from "$lib/enrollmentHistory";
import { useThemeStore } from "$stores/SettingsStore";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { Box, IconButton, Skeleton, Tooltip, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from "recharts";

type PopupHeaderCallback = () => void;

interface PopupHeaderProps {
    graphWidth: number;
    graphIndex: number;
    handleForward: PopupHeaderCallback;
    handleBack: PopupHeaderCallback;
    popupTitle: string;
    enrollmentHistory: EnrollmentHistory[];
}

function PopupHeader({
    graphWidth,
    graphIndex,
    handleForward,
    handleBack,
    popupTitle,
    enrollmentHistory,
}: PopupHeaderProps) {
    const isMobile = useIsMobile();

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
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
            <Typography
                sx={{
                    fontWeight: 500,
                    fontSize: isMobile ? "0.8rem" : "1rem",
                    textAlign: "center",
                }}
            >
                {popupTitle}
            </Typography>
            <Tooltip title="Newer Graph">
                <span>
                    <IconButton
                        onClick={handleForward}
                        disabled={graphIndex === enrollmentHistory.length - 1}
                    >
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
}

export function EnrollmentHistoryPopup({ department, courseNumber }: EnrollmentHistoryPopupProps) {
    const [loading, setLoading] = useState(true);
    const [enrollmentHistory, setEnrollmentHistory] = useState<EnrollmentHistory[]>();
    const [graphIndex, setGraphIndex] = useState(0);

    const isMobile = useIsMobile();

    const deptEnrollmentHistory = useMemo(
        () => new DepartmentEnrollmentHistory(department),
        [department],
    );

    const graphWidth = useMemo(() => (isMobile ? 250 : 450), [isMobile]);
    const graphHeight = useMemo(() => (isMobile ? 175 : 250), [isMobile]);
    const popupTitle = useMemo(() => {
        if (enrollmentHistory == null) {
            return "No past enrollment data found for this course";
        }

        const currEnrollmentHistory = enrollmentHistory[graphIndex];
        return `${department} ${courseNumber} | ${currEnrollmentHistory.year} ${
            currEnrollmentHistory.quarter
        } | ${currEnrollmentHistory.instructors.join(", ")}`;
    }, [courseNumber, department, enrollmentHistory, graphIndex]);
    const isDark = useThemeStore((state) => state.isDark);
    const axisColor = isDark ? "#fff" : "#111";
    const tooltipDateColor = "#111";

    const handleBack = useCallback(() => {
        setGraphIndex((prev) => prev - 1);
    }, []);

    const handleForward = useCallback(() => {
        setGraphIndex((prev) => prev + 1);
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

    if (loading) {
        return (
            <Box padding={1}>
                <Skeleton variant="text" animation="wave" height={graphHeight} width={graphWidth} />
            </Box>
        );
    }

    if (enrollmentHistory == null) {
        return (
            <Box padding={1}>
                <Typography variant="body1" align="center">
                    {popupTitle}
                </Typography>
            </Box>
        );
    }

    const lineChartData = enrollmentHistory[graphIndex].days;

    return (
        <Box sx={{ padding: 0.5 }}>
            <PopupHeader
                graphWidth={graphWidth}
                graphIndex={graphIndex}
                handleForward={handleForward}
                handleBack={handleBack}
                popupTitle={popupTitle}
                enrollmentHistory={enrollmentHistory}
            />
            <Box sx={{ display: "flex", height: graphHeight, width: graphWidth }}>
                <ResponsiveContainer width="95%" height="95%">
                    <LineChart data={lineChartData} style={{ cursor: "pointer" }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: axisColor }} />
                        <YAxis tick={{ fontSize: 12, fill: axisColor }} width={40} />
                        <RechartsTooltip labelStyle={{ color: tooltipDateColor }} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="totalEnrolled"
                            stroke="#8884d8"
                            name="Enrolled"
                            dot={{ r: 2 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="maxCapacity"
                            stroke="#82ca9d"
                            name="Max"
                            dot={{ r: 2 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="waitlist"
                            stroke="#ffc658"
                            name="Waitlist"
                            dot={{ r: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Box>
        </Box>
    );
}
