import { CloudUpload, ContentPasteGo } from '@mui/icons-material';
import {
    AlertColor,
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormControlLabel,
    InputLabel,
    Paper,
    Radio,
    RadioGroup,
    Stack,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { CourseInfo, ShortCourseSchedule } from '@packages/antalmanac-types';
import { usePostHog } from 'posthog-js/react';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import {
    addCustomEvent,
    openSnackbar,
    addCourse,
    importScheduleWithUsername,
    importValidatedSchedule,
    mergeShortCourseSchedules,
} from '$actions/AppStoreActions';
import { AlertDialog } from '$components/AlertDialog';
import { TermSelector } from '$components/RightPane/CoursePane/SearchForm/TermSelector';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { QueryZotcourseError } from '$lib/customErrors';
import { warnMultipleTerms } from '$lib/helpers';
import {
    getLocalStorageDataCache,
    getLocalStorageOnFirstSignin,
    getLocalStorageUserId,
    removeLocalStorageOnFirstSignin,
    removeLocalStorageUserId,
} from '$lib/localStorage';
import { WebSOC } from '$lib/websoc';
import { ZotcourseResponse, queryZotcourse } from '$lib/zotcourse';
import { BLUE, DODGER_BLUE } from '$src/globals';
import AppStore from '$stores/AppStore';
import { scheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore, useJsonImportExportStore } from '$stores/SettingsStore';

enum ImportSource {
    ZOT_COURSE_IMPORT = 'zotcourse',
    STUDY_LIST_IMPORT = 'studylist',
    AA_USERNAME_IMPORT = 'username',
    JSON_IMPORT = 'json',
}

export function Import() {
    const [alertDialogTitle, setAlertDialogTitle] = useState('');
    const [alertDialogSeverity, setAlertDialogSeverity] = useState<AlertColor>('error');
    const [alertDialog, setAlertDialog] = useState(false);
    const [importSource, setImportSource] = useState('studylist');
    const [studyListText, setStudyListText] = useState('');
    const [zotcourseScheduleName, setZotcourseScheduleName] = useState('');
    const [aaUsername, setAAUsername] = useState('');
    const [dialogTab, setDialogTab] = useState<'import' | 'export'>('import');
    const [exportSchedules, setExportSchedules] = useState<ShortCourseSchedule[]>([]);
    const [exportSelectedIndices, setExportSelectedIndices] = useState<Set<number>>(new Set());

    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());

    const { sessionIsValid } = useSessionStore();
    const { openImportDialog, setOpenImportDialog } = scheduleComponentsToggleStore();
    const jsonImportExport = useJsonImportExportStore((store) => store.jsonImportExport);

    const { isDark } = useThemeStore();

    const postHog = usePostHog();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
    const dragCounterRef = useRef(0);
    const [importedSchedules, setImportedSchedules] = useState<ShortCourseSchedule[]>([]);
    const [selectedScheduleIndices, setSelectedScheduleIndices] = useState<Set<number>>(new Set());

    const handleOpen = useCallback(() => {
        setOpenImportDialog(true);
    }, [setOpenImportDialog]);

    const handleClose = useCallback(() => {
        setOpenImportDialog(false);
        setSelectedFileName(null);
        setIsDragging(false);
        dragCounterRef.current = 0;
        setImportedSchedules([]);
        setSelectedScheduleIndices(new Set());
        setDialogTab('import');
        setExportSelectedIndices(new Set());
        setExportSchedules([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [setOpenImportDialog]);

    const handleSubmit = async () => {
        const currentSchedule = AppStore.getCurrentScheduleIndex();
        const term = RightPaneStore.getFormData().term;
        let sectionCodes: string[] | null = null;

        switch (importSource) {
            case ImportSource.ZOT_COURSE_IMPORT:
                try {
                    const zotcourseImport: ZotcourseResponse = await queryZotcourse(zotcourseScheduleName);
                    sectionCodes = zotcourseImport.codes;
                    for (const event of zotcourseImport.customEvents) {
                        addCustomEvent(event, [currentSchedule]);
                    }
                    uploadSectionCodes(sectionCodes, term, currentSchedule);
                } catch (e) {
                    if (e instanceof QueryZotcourseError) {
                        openSnackbar('error', e.message);
                    } else {
                        openSnackbar('error', 'Could not import from Zotcourse.');
                    }
                    console.error(e);
                    handleClose();
                    return;
                }
                break;
            case ImportSource.STUDY_LIST_IMPORT:
                sectionCodes = studyListText.match(/\d{5}/g);

                if (!sectionCodes || sectionCodes.length === 0) break;
                uploadSectionCodes(sectionCodes, term, currentSchedule);
                break;
            case ImportSource.AA_USERNAME_IMPORT: {
                const importStatus = await importScheduleWithUsername(aaUsername);
                if (importStatus.error) {
                    setAlertDialog(true);
                    setAlertDialogSeverity('error');
                    if (importStatus.error instanceof Error) {
                        setAlertDialogTitle(importStatus.error.message);
                    } else {
                        setAlertDialogTitle('Error importing schedule');
                    }
                } else if (importStatus.imported) {
                    setAlertDialog(true);
                    setAlertDialogSeverity('info');
                    setAlertDialogTitle(`Note: "${aaUsername}" has already been imported`);
                }
                break;
            }

            case ImportSource.JSON_IMPORT: {
                if (importedSchedules.length === 0) {
                    openSnackbar('error', 'Please select a JSON file to import.');
                    return;
                }

                if (selectedScheduleIndices.size === 0) {
                    openSnackbar('error', 'Please select at least one schedule to import.');
                    return;
                }

                try {
                    const schedulesToImport = importedSchedules.filter((_, index) =>
                        selectedScheduleIndices.has(index)
                    );
                    const currentScheduleState = AppStore.schedule.getScheduleAsSaveState();

                    mergeShortCourseSchedules(currentScheduleState.schedules, schedulesToImport, '');
                    currentScheduleState.scheduleIndex = currentScheduleState.schedules.length - 1;

                    await AppStore.loadSchedule(currentScheduleState);
                    openSnackbar('success', `Successfully imported ${schedulesToImport.length} schedule(s)!`);
                } catch (error) {
                    console.error('JSON import error:', error);
                    const errorMessage = error instanceof Error ? error.message : 'Failed to import schedules.';
                    openSnackbar('error', errorMessage);
                    handleClose();
                    return;
                }
                break;
            }

            default:
                openSnackbar('error', 'Invalid import source.');
                handleClose();
                return;
        }

        if (
            !sectionCodes &&
            importSource !== ImportSource.AA_USERNAME_IMPORT &&
            importSource !== ImportSource.JSON_IMPORT
        ) {
            openSnackbar(
                'error',
                `Cannot import an empty ${
                    importSource === ImportSource.ZOT_COURSE_IMPORT ? 'Zotcourse' : 'Study List'
                }.`
            );
            handleClose();
            return;
        }
        setStudyListText('');
        setSelectedFileName(null);
        setImportedSchedules([]);
        setSelectedScheduleIndices(new Set());
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        handleClose();
    };

    const handleCloseAlertDialog = () => {
        setAlertDialog(false);
        setOpenImportDialog(true);
    };

    const handleImportAnyways = () => {
        importValidatedSchedule(aaUsername);
        setOpenImportDialog(false);
        setAlertDialog(false);
    };

    const uploadSectionCodes = async (sectionCodes: string[], term: string, currentSchedule: number) => {
        try {
            const term = RightPaneStore.getFormData().term;

            const sectionsAdded = addCoursesMultiple(
                await WebSOC.getCourseInfo({
                    term,
                    sectionCodes: sectionCodes.join(','),
                }),
                term,
                currentSchedule
            );

            logAnalytics(postHog, {
                category: analyticsEnum.nav,
                action: analyticsEnum.nav.actions.IMPORT_STUDY_LIST,
                value: sectionsAdded / (sectionCodes.length || 1),
            });

            if (sectionsAdded === sectionCodes.length) {
                openSnackbar('success', `Successfully imported ${sectionsAdded} of ${sectionsAdded} classes!`);
            } else if (sectionsAdded !== 0) {
                openSnackbar(
                    'warning',
                    `Only successfully imported ${sectionsAdded} of ${sectionCodes.length} classes. 
                        Please make sure that you selected the correct term and that none of your classes are missing.`
                );
            } else {
                openSnackbar(
                    'error',
                    'Failed to import any classes! Please make sure that you pasted the correct Study List.'
                );
            }
        } catch (e) {
            openSnackbar('error', 'An error occurred while trying to import the Study List.');
            console.error(e);
        }
    };

    const addCoursesMultiple = (
        courseInfo: { [sectionCode: string]: CourseInfo },
        term: string,
        scheduleIndex: number
    ) => {
        for (const section of Object.values(courseInfo)) {
            addCourse(section.section, section.courseDetails, term, scheduleIndex, true, postHog);
        }

        const terms = AppStore.termsInSchedule(term);
        if (terms.size > 1) {
            warnMultipleTerms(terms);
        }

        return Object.values(courseInfo).length;
    };

    const handleImportSourceChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setImportSource(event.currentTarget.value);
    }, []);

    const handleStudyListTextChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setStudyListText(event.currentTarget.value);
    }, []);

    const handleZotcourseScheduleNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setZotcourseScheduleName(event.currentTarget.value);
    }, []);

    const handleAAUsernameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setAAUsername(event.currentTarget.value);
    }, []);

    const validateCourse = useCallback(
        (
            course: Record<string, unknown>,
            scheduleIndex: number,
            courseIndex: number
        ): { valid: boolean; error?: string } => {
            if (!course.sectionCode || typeof course.sectionCode !== 'string') {
                return {
                    valid: false,
                    error: `Schedule ${scheduleIndex + 1}, Course ${courseIndex + 1} is missing required field: sectionCode`,
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
                    error: `Schedule ${scheduleIndex + 1}, Custom Event ${eventIndex + 1} is missing required field: customEventId or customEventID`,
                };
            }
            if (!customEvent.title || typeof customEvent.title !== 'string') {
                return {
                    valid: false,
                    error: `Schedule ${scheduleIndex + 1}, Custom Event ${eventIndex + 1} is missing required field: title`,
                };
            }
            if (!customEvent.start || typeof customEvent.start !== 'string') {
                return {
                    valid: false,
                    error: `Schedule ${scheduleIndex + 1}, Custom Event ${eventIndex + 1} is missing required field: start`,
                };
            }
            if (!customEvent.end || typeof customEvent.end !== 'string') {
                return {
                    valid: false,
                    error: `Schedule ${scheduleIndex + 1}, Custom Event ${eventIndex + 1} is missing required field: end`,
                };
            }
            if (!customEvent.days || !Array.isArray(customEvent.days)) {
                return {
                    valid: false,
                    error: `Schedule ${scheduleIndex + 1}, Custom Event ${eventIndex + 1} is missing required field: days (must be an array)`,
                };
            }
            if (!customEvent.color || typeof customEvent.color !== 'string') {
                return {
                    valid: false,
                    error: `Schedule ${scheduleIndex + 1}, Custom Event ${eventIndex + 1} is missing required field: color`,
                };
            }
            if (!('building' in customEvent)) {
                return {
                    valid: false,
                    error: `Schedule ${scheduleIndex + 1}, Custom Event ${eventIndex + 1} is missing required field: building`,
                };
            }
            return { valid: true };
        },
        []
    );

    const validateSchedule = useCallback(
        (schedule: Record<string, unknown>, scheduleIndex: number): { valid: boolean; error?: string } => {
            if (!schedule.scheduleName || typeof schedule.scheduleName !== 'string') {
                return { valid: false, error: `Schedule ${scheduleIndex + 1} is missing required field: scheduleName` };
            }
            if (!('scheduleNote' in schedule)) {
                return { valid: false, error: `Schedule ${scheduleIndex + 1} is missing required field: scheduleNote` };
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
                return { valid: false, error: 'Invalid schedule data format. Schedule data must be an object.' };
            }

            const data = scheduleData as { schedules?: unknown };
            if (!data.schedules || !Array.isArray(data.schedules)) {
                return { valid: false, error: 'Invalid schedule data format. Schedules must be an array.' };
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
                            setImportedSchedules([]);
                            setSelectedScheduleIndices(new Set());
                            if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                            }
                            return;
                        }

                        if (importedScheduleData.schedules && Array.isArray(importedScheduleData.schedules)) {
                            if (importedScheduleData.schedules.length === 0) {
                                openSnackbar('error', 'No schedules found in the imported file.');
                                setSelectedFileName(null);
                                setImportedSchedules([]);
                                setSelectedScheduleIndices(new Set());
                                if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                }
                                return;
                            }

                            setImportedSchedules(importedScheduleData.schedules);
                            setSelectedScheduleIndices(
                                new Set(importedScheduleData.schedules.map((_: unknown, index: number) => index))
                            );
                        } else {
                            openSnackbar('error', 'Invalid schedule data format.');
                            setSelectedFileName(null);
                            setImportedSchedules([]);
                            setSelectedScheduleIndices(new Set());
                            if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                            }
                        }
                    } catch (error) {
                        console.error('JSON parse error:', error);
                        const errorMessage = error instanceof Error ? error.message : 'Failed to parse JSON file.';
                        openSnackbar('error', errorMessage);
                        setSelectedFileName(null);
                        setImportedSchedules([]);
                        setSelectedScheduleIndices(new Set());
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
                    setImportedSchedules([]);
                    setSelectedScheduleIndices(new Set());
                }
            }
        },
        [validateScheduleData]
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
                            setImportedSchedules([]);
                            setSelectedScheduleIndices(new Set());
                            return;
                        }

                        if (importedScheduleData.schedules && Array.isArray(importedScheduleData.schedules)) {
                            if (importedScheduleData.schedules.length === 0) {
                                openSnackbar('error', 'No schedules found in the imported file.');
                                setSelectedFileName(null);
                                setImportedSchedules([]);
                                setSelectedScheduleIndices(new Set());
                                return;
                            }

                            setImportedSchedules(importedScheduleData.schedules);
                            setSelectedScheduleIndices(
                                new Set(importedScheduleData.schedules.map((_: unknown, index: number) => index))
                            );
                        } else {
                            openSnackbar('error', 'Invalid schedule data format.');
                            setSelectedFileName(null);
                            setImportedSchedules([]);
                            setSelectedScheduleIndices(new Set());
                        }
                    } catch (error) {
                        console.error('JSON parse error:', error);
                        const errorMessage = error instanceof Error ? error.message : 'Failed to parse JSON file.';
                        openSnackbar('error', errorMessage);
                        setSelectedFileName(null);
                        setImportedSchedules([]);
                        setSelectedScheduleIndices(new Set());
                    }
                } else {
                    openSnackbar('error', 'Please drop a valid JSON file.');
                    setSelectedFileName(null);
                    setImportedSchedules([]);
                    setSelectedScheduleIndices(new Set());
                }
            }
        },
        [validateScheduleData]
    );

    const handleFirstTimeSignin = useCallback(async () => {
        const newUserFlag = getLocalStorageOnFirstSignin() ?? '';
        if (newUserFlag !== '') {
            const savedUserId = getLocalStorageUserId();
            if (savedUserId) setAAUsername(savedUserId);
            handleOpen();
            removeLocalStorageOnFirstSignin();
            removeLocalStorageUserId();
            setImportSource(ImportSource.AA_USERNAME_IMPORT);
        }
    }, [handleOpen]);

    useEffect(() => {
        const handleSkeletonModeChange = () => {
            setSkeletonMode(AppStore.getSkeletonMode());
        };
        if (sessionIsValid && getLocalStorageDataCache() === null) {
            handleFirstTimeSignin();
        }
        AppStore.on('skeletonModeChange', handleSkeletonModeChange);

        return () => {
            AppStore.off('skeletonModeChange', handleSkeletonModeChange);
        };
    }, [handleFirstTimeSignin, sessionIsValid]);

    useEffect(() => {
        if (!jsonImportExport && importSource === ImportSource.JSON_IMPORT) {
            setImportSource(ImportSource.STUDY_LIST_IMPORT);
        }
    }, [jsonImportExport, importSource]);

    // Load schedules when export tab is opened
    useEffect(() => {
        if (openImportDialog && dialogTab === 'export') {
            const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState();
            setExportSchedules(scheduleSaveState.schedules);
            setExportSelectedIndices(new Set(scheduleSaveState.schedules.map((_, index) => index)));
        }
    }, [openImportDialog, dialogTab]);

    return (
        <>
            <Tooltip
                title={jsonImportExport ? 'Import or export schedule data' : 'Import a schedule from your Study List'}
            >
                <Button
                    onClick={handleOpen}
                    color="inherit"
                    sx={{ fontSize: 'inherit' }}
                    startIcon={<ContentPasteGo />}
                    disabled={skeletonMode}
                    id="import-button"
                >
                    {jsonImportExport ? 'Import/Export' : 'Import'}
                </Button>
            </Tooltip>
            <Dialog open={openImportDialog} onClose={handleClose} maxWidth="sm" fullWidth>
                {jsonImportExport && (
                    <Tabs
                        value={dialogTab}
                        onChange={(_, newValue) => setDialogTab(newValue)}
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        <Tab label="Import" value="import" />
                        <Tab label="Export" value="export" />
                    </Tabs>
                )}
                <DialogTitle>{dialogTab === 'export' ? 'Export Schedules' : 'Import Schedule'}</DialogTitle>
                <DialogContent>
                    {dialogTab === 'export' ? (
                        <>
                            <DialogContentText sx={{ mb: 2 }}>
                                Select which schedules you want to export. The exported file will be in JSON format and
                                can be imported back into AntAlmanac.
                            </DialogContentText>

                            {exportSchedules.length > 0 && (
                                <>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={
                                                    exportSelectedIndices.size === exportSchedules.length &&
                                                    exportSchedules.length > 0
                                                }
                                                indeterminate={
                                                    exportSelectedIndices.size > 0 &&
                                                    exportSelectedIndices.size < exportSchedules.length
                                                }
                                                onChange={() => {
                                                    if (exportSelectedIndices.size === exportSchedules.length) {
                                                        setExportSelectedIndices(new Set());
                                                    } else {
                                                        setExportSelectedIndices(
                                                            new Set(exportSchedules.map((_, index) => index))
                                                        );
                                                    }
                                                }}
                                            />
                                        }
                                        label={
                                            <Typography variant="subtitle2" fontWeight="medium">
                                                Select All ({exportSelectedIndices.size} of {exportSchedules.length})
                                            </Typography>
                                        }
                                        sx={{ marginBottom: 1 }}
                                    />
                                    <Box
                                        sx={{
                                            maxHeight: 300,
                                            overflow: 'auto',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 1,
                                            p: 1,
                                        }}
                                    >
                                        <Stack spacing={1}>
                                            {exportSchedules.map((schedule, index) => (
                                                <Paper
                                                    key={index}
                                                    sx={{
                                                        p: 1.5,
                                                        border: exportSelectedIndices.has(index)
                                                            ? `2px solid ${DODGER_BLUE}`
                                                            : '2px solid transparent',
                                                        backgroundColor: exportSelectedIndices.has(index)
                                                            ? 'action.selected'
                                                            : 'background.paper',
                                                        transition: 'all 0.2s ease-in-out',
                                                    }}
                                                >
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={exportSelectedIndices.has(index)}
                                                                onChange={() => {
                                                                    setExportSelectedIndices((prev) => {
                                                                        const newSet = new Set(prev);
                                                                        if (newSet.has(index)) {
                                                                            newSet.delete(index);
                                                                        } else {
                                                                            newSet.add(index);
                                                                        }
                                                                        return newSet;
                                                                    });
                                                                }}
                                                            />
                                                        }
                                                        label={
                                                            <Box>
                                                                <Typography variant="body2" fontWeight="medium">
                                                                    {schedule.scheduleName}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {schedule.courses.length} course(s),{' '}
                                                                    {schedule.customEvents.length} custom event(s)
                                                                </Typography>
                                                            </Box>
                                                        }
                                                    />
                                                </Paper>
                                            ))}
                                        </Stack>
                                    </Box>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <FormControl>
                                <RadioGroup
                                    name="changeImportSource"
                                    aria-label="changeImportSource"
                                    value={importSource}
                                    onChange={handleImportSourceChange}
                                >
                                    <FormControlLabel
                                        value={ImportSource.STUDY_LIST_IMPORT}
                                        control={<Radio color="primary" />}
                                        label="From Study List"
                                    />
                                    <FormControlLabel
                                        value={ImportSource.ZOT_COURSE_IMPORT}
                                        control={<Radio color="primary" />}
                                        label="From Zotcourse"
                                    />
                                    <Tooltip title="Import from your unique user ID" placement="right">
                                        <FormControlLabel
                                            value={ImportSource.AA_USERNAME_IMPORT}
                                            control={<Radio color="primary" />}
                                            label="From AntAlmanac unique user ID"
                                            disabled={!sessionIsValid}
                                        />
                                    </Tooltip>
                                    {jsonImportExport && (
                                        <Tooltip title="Import from your schedule data" placement="right">
                                            <FormControlLabel
                                                value={ImportSource.JSON_IMPORT}
                                                control={<Radio color="primary" />}
                                                label="From JSON File"
                                            />
                                        </Tooltip>
                                    )}
                                </RadioGroup>
                            </FormControl>
                            {importSource === ImportSource.STUDY_LIST_IMPORT && (
                                <Box>
                                    <DialogContentText>
                                        Paste the contents of your Study List below to import it into AntAlmanac.
                                        <br />
                                        To find your Study List, go to{' '}
                                        <a href={'https://www.reg.uci.edu/cgi-bin/webreg-redirect.sh'}>
                                            WebReg
                                        </a> or{' '}
                                        <a href={'https://www.reg.uci.edu/access/student/welcome/'}>StudentAccess</a>,
                                        and click on Study List once you&apos;ve logged in. Copy everything below the
                                        column names (Code, Dept, etc.) under the Enrolled Classes section.
                                    </DialogContentText>
                                    <InputLabel style={{ fontSize: '9px' }}>Study List</InputLabel>
                                    <TextField
                                        fullWidth
                                        multiline
                                        margin="dense"
                                        type="text"
                                        placeholder="Paste here"
                                        value={studyListText}
                                        onChange={handleStudyListTextChange}
                                    />
                                    <br />
                                </Box>
                            )}
                            {importSource === ImportSource.ZOT_COURSE_IMPORT && (
                                <Box>
                                    <DialogContentText>
                                        Paste your Zotcourse schedule name below to import it into AntAlmanac.
                                    </DialogContentText>
                                    <InputLabel style={{ fontSize: '9px' }}>Zotcourse Schedule</InputLabel>
                                    <TextField
                                        fullWidth
                                        multiline
                                        margin="dense"
                                        type="text"
                                        placeholder="Paste here"
                                        value={zotcourseScheduleName}
                                        onChange={handleZotcourseScheduleNameChange}
                                    />
                                    <br />
                                </Box>
                            )}
                            {importSource === ImportSource.AA_USERNAME_IMPORT && (
                                <Box
                                    component="form"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSubmit();
                                    }}
                                >
                                    <DialogContentText>
                                        Paste your unique user ID here to import your schedule(s).
                                    </DialogContentText>
                                    <InputLabel style={{ fontSize: '9px' }}>AntAlmanac Schedule Name</InputLabel>
                                    <TextField
                                        fullWidth
                                        margin="dense"
                                        type="text"
                                        placeholder="Paste here"
                                        value={aaUsername}
                                        onChange={handleAAUsernameChange}
                                    />
                                    <br />
                                </Box>
                            )}

                            {importSource !== ImportSource.AA_USERNAME_IMPORT &&
                                importSource !== ImportSource.JSON_IMPORT && (
                                    <Stack spacing={1}>
                                        <DialogContentText>
                                            Make sure you also have the right term selected.
                                        </DialogContentText>
                                        <TermSelector />
                                    </Stack>
                                )}
                            {importSource === ImportSource.JSON_IMPORT && (
                                <Box>
                                    <DialogContentText>
                                        Upload your schedule data JSON file here to import it into AntAlmanac.
                                    </DialogContentText>

                                    <InputLabel style={{ fontSize: '9px', marginTop: '16px', marginBottom: '8px' }}>
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
                                            sx={{
                                                border: '2px dashed',
                                                borderColor: isDragging || selectedFileName ? DODGER_BLUE : 'divider',
                                                backgroundColor: isDragging ? 'action.hover' : 'background.paper',
                                                padding: 3,
                                                textAlign: 'center',
                                                transition: 'all 0.2s ease-in-out',
                                                '&:hover': {
                                                    borderColor: DODGER_BLUE,
                                                    backgroundColor: 'action.hover',
                                                },
                                            }}
                                        >
                                            <Stack spacing={2} alignItems="center">
                                                <CloudUpload
                                                    sx={{
                                                        fontSize: 48,
                                                        color:
                                                            isDragging || selectedFileName
                                                                ? DODGER_BLUE
                                                                : 'text.secondary',
                                                    }}
                                                />
                                                {selectedFileName ? (
                                                    <>
                                                        <Typography
                                                            variant="body1"
                                                            sx={{ color: DODGER_BLUE }}
                                                            fontWeight="medium"
                                                        >
                                                            {selectedFileName}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Click to select a different file
                                                        </Typography>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Typography variant="body1" color="text.primary">
                                                            Drag and drop your JSON file here
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
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
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={
                                                            selectedScheduleIndices.size === importedSchedules.length &&
                                                            importedSchedules.length > 0
                                                        }
                                                        indeterminate={
                                                            selectedScheduleIndices.size > 0 &&
                                                            selectedScheduleIndices.size < importedSchedules.length
                                                        }
                                                        onChange={() => {
                                                            if (
                                                                selectedScheduleIndices.size ===
                                                                importedSchedules.length
                                                            ) {
                                                                setSelectedScheduleIndices(new Set());
                                                            } else {
                                                                setSelectedScheduleIndices(
                                                                    new Set(importedSchedules.map((_, index) => index))
                                                                );
                                                            }
                                                        }}
                                                    />
                                                }
                                                label={
                                                    <Typography variant="subtitle2" fontWeight="medium">
                                                        Select All ({selectedScheduleIndices.size} of{' '}
                                                        {importedSchedules.length})
                                                    </Typography>
                                                }
                                                sx={{ marginBottom: 1 }}
                                            />
                                            <Box
                                                sx={{
                                                    maxHeight: 300,
                                                    overflow: 'auto',
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    borderRadius: 1,
                                                    p: 1,
                                                }}
                                            >
                                                <Stack spacing={1}>
                                                    {importedSchedules.map((schedule, index) => (
                                                        <Paper
                                                            key={index}
                                                            sx={{
                                                                p: 1.5,
                                                                border: selectedScheduleIndices.has(index)
                                                                    ? `2px solid ${DODGER_BLUE}`
                                                                    : '2px solid transparent',
                                                                backgroundColor: selectedScheduleIndices.has(index)
                                                                    ? 'action.selected'
                                                                    : 'background.paper',
                                                                transition: 'all 0.2s ease-in-out',
                                                            }}
                                                        >
                                                            <FormControlLabel
                                                                control={
                                                                    <Checkbox
                                                                        checked={selectedScheduleIndices.has(index)}
                                                                        onChange={() => {
                                                                            setSelectedScheduleIndices((prev) => {
                                                                                const newSet = new Set(prev);
                                                                                if (newSet.has(index)) {
                                                                                    newSet.delete(index);
                                                                                } else {
                                                                                    newSet.add(index);
                                                                                }
                                                                                return newSet;
                                                                            });
                                                                        }}
                                                                    />
                                                                }
                                                                label={
                                                                    <Box>
                                                                        <Typography variant="body2" fontWeight="medium">
                                                                            {schedule.scheduleName}
                                                                        </Typography>
                                                                        <Typography
                                                                            variant="caption"
                                                                            color="text.secondary"
                                                                        >
                                                                            {schedule.courses.length} course(s),{' '}
                                                                            {schedule.customEvents.length} custom
                                                                            event(s)
                                                                        </Typography>
                                                                    </Box>
                                                                }
                                                            />
                                                        </Paper>
                                                    ))}
                                                </Stack>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color={isDark ? 'secondary' : 'primary'}>
                        Cancel
                    </Button>
                    {dialogTab === 'export' ? (
                        <Button
                            onClick={() => {
                                if (exportSelectedIndices.size === 0) {
                                    openSnackbar('error', 'Please select at least one schedule to export.');
                                    return;
                                }

                                try {
                                    const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState();
                                    const schedulesToExport = scheduleSaveState.schedules.filter((_, index) =>
                                        exportSelectedIndices.has(index)
                                    );

                                    const exportData = {
                                        schedules: schedulesToExport,
                                    };

                                    const jsonString = JSON.stringify(exportData, null, 2);
                                    const blob = new Blob([jsonString], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = `antalmanac-schedules-${new Date().toISOString().split('T')[0]}.json`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    URL.revokeObjectURL(url);

                                    openSnackbar(
                                        'success',
                                        `Successfully exported ${schedulesToExport.length} schedule(s)!`
                                    );
                                    handleClose();
                                } catch (error) {
                                    console.error('Export error:', error);
                                    const errorMessage =
                                        error instanceof Error ? error.message : 'Failed to export schedules.';
                                    openSnackbar('error', errorMessage);
                                }
                            }}
                            color={isDark ? 'secondary' : 'primary'}
                            variant="contained"
                            disabled={exportSelectedIndices.size === 0}
                        >
                            Export ({exportSelectedIndices.size})
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} color={isDark ? 'secondary' : 'primary'}>
                            Import
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            <AlertDialog
                title={alertDialogTitle}
                open={alertDialog}
                onClose={handleCloseAlertDialog}
                severity={alertDialogSeverity}
            >
                {alertDialogSeverity === 'error' ? (
                    <Box>
                        If you think this is a mistake please submit a{' '}
                        <Link to="https://forms.gle/k81f2aNdpdQYeKK8A">bug report</Link>
                    </Box>
                ) : (
                    <Stack direction="row" justifyContent="center">
                        <Button
                            onClick={handleImportAnyways}
                            color="primary"
                            variant="contained"
                            size="large"
                            sx={{ backgroundColor: BLUE }}
                        >
                            Import Anyways
                        </Button>
                    </Stack>
                )}
            </AlertDialog>
        </>
    );
}
