import { ScheduleList } from '$components/Header/Import/Form/ScheduleList';
import { openSnackbar } from '$stores/SnackbarStore';
import { CloudUpload } from '@mui/icons-material';
import { Box, DialogContentText, InputLabel, Paper, Stack, Typography } from '@mui/material';
import { type ShortCourseSchedule } from '@packages/antalmanac-types';
import { type RefObject, useCallback, useRef, useState } from 'react';

interface JsonImportFormProps {
    importedSchedules: ShortCourseSchedule[];
    selectedScheduleIndices: Set<number>;
    onSchedulesChange: (schedules: ShortCourseSchedule[]) => void;
    onIndicesChange: (indices: Set<number>) => void;
    fileInputRef: RefObject<HTMLInputElement | null>;
}

export function JsonImportForm({
    importedSchedules,
    selectedScheduleIndices,
    onSchedulesChange,
    onIndicesChange,
    fileInputRef,
}: JsonImportFormProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
    const dragCounterRef = useRef(0);

    const validateCourse = useCallback(
        (
            course: Record<string, unknown>,
            scheduleIndex: number,
            courseIndex: number
        ): { valid: boolean; error?: string } => {
            if (!course.sectionCode || typeof course.sectionCode !== 'string') {
                return {
                    valid: false,
                    error: `Schedule ${scheduleIndex + 1}, Course ${
                        courseIndex + 1
                    } is missing required field: sectionCode`,
                };
            }
            if (!course.term || typeof course.term !== 'string') {
                return {
                    valid: false,
                    error: `Schedule ${scheduleIndex + 1}, Course ${courseIndex + 1} is missing required field: term`,
                };
            }
            if (!course.color || typeof course.color !== 'string') {
                return {
                    valid: false,
                    error: `Schedule ${scheduleIndex + 1}, Course ${courseIndex + 1} is missing required field: color`,
                };
            }
            return { valid: true };
        },
        []
    );

    const validateCustomEvent = useCallback(
        (
            customEvent: Record<string, unknown>,
            scheduleIndex: number,
            eventIndex: number
        ): { valid: boolean; error?: string } => {
            if (!customEvent.customEventId && customEvent.customEventID === undefined) {
                return {
                    valid: false,
                    error: `Schedule ${scheduleIndex + 1}, Custom Event ${
                        eventIndex + 1
                    } is missing required field: customEventId or customEventID`,
                };
            }
            if (!customEvent.start || typeof customEvent.start !== 'string') {
                return {
                    valid: false,
                    error: `Schedule ${scheduleIndex + 1}, Custom Event ${
                        eventIndex + 1
                    } is missing required field: start`,
                };
            }
            if (!customEvent.end || typeof customEvent.end !== 'string') {
                return {
                    valid: false,
                    error: `Schedule ${scheduleIndex + 1}, Custom Event ${
                        eventIndex + 1
                    } is missing required field: end`,
                };
            }
            if (!customEvent.days || !Array.isArray(customEvent.days)) {
                return {
                    valid: false,
                    error: `Schedule ${scheduleIndex + 1}, Custom Event ${
                        eventIndex + 1
                    } is missing required field: days (must be an array)`,
                };
            }
            return { valid: true };
        },
        []
    );

    const validateSchedule = useCallback(
        (schedule: Record<string, unknown>, scheduleIndex: number): { valid: boolean; error?: string } => {
            if (!schedule.scheduleName || typeof schedule.scheduleName !== 'string') {
                return {
                    valid: false,
                    error: `Schedule ${scheduleIndex + 1} is missing required field: scheduleName`,
                };
            }
            if (!schedule.courses || !Array.isArray(schedule.courses)) {
                return {
                    valid: false,
                    error: `Schedule ${scheduleIndex + 1} is missing required field: courses (must be an array)`,
                };
            }

            for (let j = 0; j < schedule.courses.length; j++) {
                const course = schedule.courses[j] as Record<string, unknown>;
                const courseValidation = validateCourse(course, scheduleIndex, j);
                if (!courseValidation.valid) {
                    return courseValidation;
                }
            }

            if (schedule.customEvents && Array.isArray(schedule.customEvents)) {
                for (let k = 0; k < schedule.customEvents.length; k++) {
                    const customEvent = schedule.customEvents[k] as Record<string, unknown>;
                    const eventValidation = validateCustomEvent(customEvent, scheduleIndex, k);
                    if (!eventValidation.valid) {
                        return eventValidation;
                    }
                }
            }

            return { valid: true };
        },
        [validateCourse, validateCustomEvent]
    );

    const validateScheduleData = useCallback(
        (scheduleData: unknown): { valid: boolean; error?: string } => {
            if (!scheduleData || typeof scheduleData !== 'object') {
                return {
                    valid: false,
                    error: 'Invalid schedule data format. Schedule data must be an object.',
                };
            }

            const data = scheduleData as { schedules?: unknown };
            if (!data.schedules || !Array.isArray(data.schedules)) {
                return {
                    valid: false,
                    error: 'Invalid schedule data format. Schedules must be an array.',
                };
            }

            for (let i = 0; i < data.schedules.length; i++) {
                const schedule = data.schedules[i] as Record<string, unknown>;
                const scheduleValidation = validateSchedule(schedule, i);
                if (!scheduleValidation.valid) {
                    return scheduleValidation;
                }
            }

            return { valid: true };
        },
        [validateSchedule]
    );

    const handleFileInputChange = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file) {
                if (file.type === 'application/json' || file.name.endsWith('.json')) {
                    setSelectedFileName(file.name);

                    try {
                        const fileText = await file.text();
                        const importedScheduleData = JSON.parse(fileText);

                        const validation = validateScheduleData(importedScheduleData);
                        if (!validation.valid) {
                            openSnackbar('error', validation.error || 'Invalid schedule data format.');
                            setSelectedFileName(null);
                            onSchedulesChange([]);
                            onIndicesChange(new Set());
                            if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                            }
                            return;
                        }

                        if (importedScheduleData.schedules && Array.isArray(importedScheduleData.schedules)) {
                            if (importedScheduleData.schedules.length === 0) {
                                openSnackbar('error', 'No schedules found in the imported file.');
                                setSelectedFileName(null);
                                onSchedulesChange([]);
                                onIndicesChange(new Set());
                                if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                }
                                return;
                            }

                            onSchedulesChange(importedScheduleData.schedules);
                            onIndicesChange(
                                new Set(importedScheduleData.schedules.map((_: unknown, index: number) => index))
                            );
                        } else {
                            openSnackbar('error', 'Invalid schedule data format.');
                            setSelectedFileName(null);
                            onSchedulesChange([]);
                            onIndicesChange(new Set());
                            if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                            }
                        }
                    } catch (error) {
                        console.error('JSON parse error:', error);
                        const errorMessage = error instanceof Error ? error.message : 'Failed to parse JSON file.';
                        openSnackbar('error', errorMessage);
                        setSelectedFileName(null);
                        onSchedulesChange([]);
                        onIndicesChange(new Set());
                        if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                        }
                    }
                } else {
                    openSnackbar('error', 'Please select a valid JSON file.');
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                    setSelectedFileName(null);
                    onSchedulesChange([]);
                    onIndicesChange(new Set());
                }
            }
        },
        [validateScheduleData, onSchedulesChange, onIndicesChange, fileInputRef]
    );

    const handleDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer.types.includes('Files')) {
            setIsDragging(true);
        }
    }, []);

    const handleDragEnter = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        dragCounterRef.current += 1;
        if (event.dataTransfer.types.includes('Files')) {
            setIsDragging(true);
        }
    }, []);

    const handleDragLeave = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        dragCounterRef.current -= 1;
        if (dragCounterRef.current === 0) {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback(
        async (event: React.DragEvent<HTMLLabelElement>) => {
            event.preventDefault();
            event.stopPropagation();
            dragCounterRef.current = 0;
            setIsDragging(false);

            const file = event.dataTransfer.files?.[0];
            if (file) {
                if (file.type === 'application/json' || file.name.endsWith('.json')) {
                    setSelectedFileName(file.name);
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    if (fileInputRef.current) {
                        fileInputRef.current.files = dataTransfer.files;
                    }

                    try {
                        const fileText = await file.text();
                        const importedScheduleData = JSON.parse(fileText);

                        const validation = validateScheduleData(importedScheduleData);
                        if (!validation.valid) {
                            openSnackbar('error', validation.error || 'Invalid schedule data format.');
                            setSelectedFileName(null);
                            onSchedulesChange([]);
                            onIndicesChange(new Set());
                            return;
                        }

                        if (importedScheduleData.schedules && Array.isArray(importedScheduleData.schedules)) {
                            if (importedScheduleData.schedules.length === 0) {
                                openSnackbar('error', 'No schedules found in the imported file.');
                                setSelectedFileName(null);
                                onSchedulesChange([]);
                                onIndicesChange(new Set());
                                return;
                            }

                            onSchedulesChange(importedScheduleData.schedules);
                            onIndicesChange(
                                new Set(importedScheduleData.schedules.map((_: unknown, index: number) => index))
                            );
                        } else {
                            openSnackbar('error', 'Invalid schedule data format.');
                            setSelectedFileName(null);
                            onSchedulesChange([]);
                            onIndicesChange(new Set());
                        }
                    } catch (error) {
                        console.error('JSON parse error:', error);
                        const errorMessage = error instanceof Error ? error.message : 'Failed to parse JSON file.';
                        openSnackbar('error', errorMessage);
                        setSelectedFileName(null);
                        onSchedulesChange([]);
                        onIndicesChange(new Set());
                    }
                } else {
                    openSnackbar('error', 'Please drop a valid JSON file.');
                    setSelectedFileName(null);
                    onSchedulesChange([]);
                    onIndicesChange(new Set());
                }
            }
        },
        [validateScheduleData, onSchedulesChange, onIndicesChange, fileInputRef]
    );

    return (
        <Box>
            <DialogContentText>
                Upload your schedule data JSON file here to import it into AntAlmanac.
            </DialogContentText>

            <InputLabel
                style={{
                    fontSize: '9px',
                    marginTop: '16px',
                    marginBottom: '8px',
                }}
            >
                Schedule Data JSON File
            </InputLabel>

            <input
                ref={fileInputRef}
                id="json-file-input"
                type="file"
                accept=".json,application/json"
                style={{ display: 'none' }}
                onChange={handleFileInputChange}
            />

            <label
                htmlFor="json-file-input"
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{ display: 'block', cursor: 'pointer' }}
                aria-label="Upload JSON schedule file"
            >
                <Paper
                    sx={(theme) => ({
                        border: '2px dashed',
                        borderColor:
                            isDragging || selectedFileName
                                ? theme.vars.palette.secondary.main
                                : theme.vars.palette.divider,
                        backgroundColor: isDragging
                            ? theme.vars.palette.action.hover
                            : theme.vars.palette.background.paper,
                        padding: 3,
                        textAlign: 'center',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            borderColor: theme.vars.palette.secondary.main,
                            backgroundColor: theme.vars.palette.action.hover,
                        },
                    })}
                >
                    <Stack spacing={2} alignItems="center">
                        <CloudUpload
                            sx={(theme) => ({
                                fontSize: 48,
                                color:
                                    isDragging || selectedFileName
                                        ? theme.vars.palette.secondary.main
                                        : theme.vars.palette.text.secondary,
                            })}
                        />
                        {selectedFileName ? (
                            <>
                                <Typography
                                    variant="body1"
                                    sx={{ color: (theme) => theme.vars.palette.secondary.main }}
                                    fontWeight="medium"
                                >
                                    {selectedFileName}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ color: (theme) => theme.vars.palette.text.secondary }}
                                >
                                    Click to select a different file
                                </Typography>
                            </>
                        ) : (
                            <>
                                <Typography variant="body1" sx={{ color: (theme) => theme.vars.palette.text.primary }}>
                                    Drag and drop your JSON file here
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ color: (theme) => theme.vars.palette.text.secondary }}
                                >
                                    or click to browse
                                </Typography>
                            </>
                        )}
                    </Stack>
                </Paper>
            </label>

            {importedSchedules.length > 0 && (
                <Box sx={{ marginTop: 3 }}>
                    <DialogContentText sx={{ marginBottom: 2 }}>
                        Select which schedules you would like to import:
                    </DialogContentText>
                    <ScheduleList
                        schedules={importedSchedules}
                        selectedIndices={selectedScheduleIndices}
                        onSelectedIndicesChange={onIndicesChange}
                    />
                </Box>
            )}
        </Box>
    );
}
