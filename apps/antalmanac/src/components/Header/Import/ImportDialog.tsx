import {
    addCustomEvent,
    addCourse,
    importScheduleWithUsername,
    mergeShortCourseSchedules,
} from '$actions/AppStoreActions';
import { TermSelector } from '$components/RightPane/CoursePane/SearchForm/TermSelector';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchParams/hooks';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { trpc, trpcReact } from '$lib/api/trpc';
import { QueryZotcourseError } from '$lib/customErrors';
import { warnMultipleTerms } from '$lib/helpers';
import { processZotcourseResponse } from '$lib/zotcourse';
import { BLUE } from '$src/globals';
import AppStore from '$stores/AppStore';
import { useSessionStore } from '$stores/SessionStore';
import { useDevModeStore } from '$stores/SettingsStore';
import { openSnackbar } from '$stores/SnackbarStore';
import {
    type AlertColor,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    Stack,
    Tab,
    Tabs,
    Tooltip,
} from '@mui/material';
import { type AATerm, type AACourse, type ShortCourseSchedule } from '@packages/antalmanac-types';
import { usePostHog } from 'posthog-js/react';
import { type ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';

import { ExportForm } from './Form/ExportForm';
import { JsonImportForm } from './Form/JsonImportForm';
import { StudyListForm } from './Form/StudyListForm';
import { UsernameForm } from './Form/UsernameForm';
import { ZotcourseForm } from './Form/ZotcourseForm';
import { ImportSource } from './types';

interface ImportDialogProps {
    open: boolean;
    onClose: () => void;
    onAlertDialog: (title: string, severity: AlertColor, username: string) => void;
    autoImportUsername?: string;
}

export function ImportDialog({ open, onClose, onAlertDialog, autoImportUsername }: ImportDialogProps) {
    const [term] = useCourseSearchParam('term');
    const [importSource, setImportSource] = useState('studylist');
    const [studyListText, setStudyListText] = useState('');
    const [zotcourseScheduleName, setZotcourseScheduleName] = useState('');
    const [aaUsername, setAAUsername] = useState('');
    const [dialogTab, setDialogTab] = useState<'import' | 'export'>('import');
    const [exportSchedules, setExportSchedules] = useState<ShortCourseSchedule[]>([]);
    const [exportSelectedIndices, setExportSelectedIndices] = useState<Set<number>>(new Set());
    const [importedSchedules, setImportedSchedules] = useState<ShortCourseSchedule[]>([]);
    const [selectedScheduleIndices, setSelectedScheduleIndices] = useState<Set<number>>(new Set());

    const sessionIsValid = useSessionStore((state) => state.sessionIsValid);
    const devMode = useDevModeStore((store) => store.devMode);
    const postHog = usePostHog();
    const { mutateAsync: fetchZotcourse } = trpcReact.zotcourse.getUserData.useMutation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const effectiveImportSource =
        !devMode && importSource === ImportSource.JSON_IMPORT ? ImportSource.STUDY_LIST_IMPORT : importSource;

    useEffect(() => {
        if (autoImportUsername) {
            setAAUsername(autoImportUsername);
            setImportSource(ImportSource.AA_USERNAME_IMPORT);
        }
    }, [autoImportUsername]);

    const handleClose = useCallback(() => {
        setImportedSchedules([]);
        setSelectedScheduleIndices(new Set());
        setDialogTab('import');
        setExportSelectedIndices(new Set());
        setExportSchedules([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onClose();
    }, [onClose]);

    const addCoursesMultiple = (courseInfo: Record<string, AACourse>, term: AATerm, scheduleIndex: number) => {
        let sectionsAdded = 0;

        for (const [sectionCode, course] of Object.entries(courseInfo)) {
            const section = course.sections.find((s) => s.sectionCode === sectionCode);
            if (!section) {
                continue;
            }
            addCourse(section, { ...course, term }, scheduleIndex, true, postHog);
            sectionsAdded += 1;
        }

        const terms = AppStore.termsInSchedule(term);
        if (terms.size > 1) {
            warnMultipleTerms(terms);
        }

        return sectionsAdded;
    };

    const uploadSectionCodes = async (
        sectionCodes: string[],
        currentSchedule: number,
        source: typeof ImportSource.STUDY_LIST_IMPORT | typeof ImportSource.ZOT_COURSE_IMPORT
    ) => {
        try {
            const courseInfo = await trpc.websoc.getCourseInfo.query({
                year: term.year,
                quarter: term.quarter,
                sectionCodes: sectionCodes.join(','),
            });

            const sectionsAdded = addCoursesMultiple(courseInfo, term, currentSchedule);

            logAnalytics(postHog, {
                category: analyticsEnum.nav,
                action:
                    source === ImportSource.STUDY_LIST_IMPORT
                        ? analyticsEnum.nav.actions.IMPORT_STUDY_LIST
                        : analyticsEnum.nav.actions.IMPORT_ZOTCOURSE,
                customProps: {
                    percentImported: sectionsAdded / (sectionCodes.length || 1),
                },
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
                    `Failed to import any classes! Please make sure that you pasted the correct ${
                        source === ImportSource.STUDY_LIST_IMPORT ? 'Study List' : 'Zotcourse Schedule'
                    }.`
                );
            }
        } catch (e) {
            openSnackbar(
                'error',
                `An error occurred while trying to import the ${
                    source === ImportSource.STUDY_LIST_IMPORT ? 'Study List' : 'Zotcourse Schedule'
                }.`
            );
            console.error(e);
        }
    };

    const handleSubmit = async () => {
        const currentSchedule = AppStore.getCurrentScheduleIndex();
        let sectionCodes: string[] | null = null;

        switch (effectiveImportSource) {
            case ImportSource.ZOT_COURSE_IMPORT:
                try {
                    if (!zotcourseScheduleName) {
                        throw new QueryZotcourseError('Cannot import an empty Zotcourse schedule name');
                    }

                    const response = await fetchZotcourse({ scheduleName: zotcourseScheduleName });

                    if (!response.success) {
                        throw new QueryZotcourseError('Cannot import an invalid Zotcourse');
                    }

                    const zotcourseImport = processZotcourseResponse(response.data);
                    sectionCodes = zotcourseImport.codes;
                    for (const event of zotcourseImport.customEvents) {
                        addCustomEvent(event, [currentSchedule]);
                    }
                    uploadSectionCodes(sectionCodes, currentSchedule, ImportSource.ZOT_COURSE_IMPORT);
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
                uploadSectionCodes(sectionCodes, currentSchedule, ImportSource.STUDY_LIST_IMPORT);
                break;
            case ImportSource.AA_USERNAME_IMPORT: {
                const importStatus = await importScheduleWithUsername(aaUsername, postHog);
                if (importStatus.error) {
                    onAlertDialog(
                        importStatus.error instanceof Error ? importStatus.error.message : 'Error importing schedule',
                        'error',
                        aaUsername
                    );
                } else if (importStatus.imported) {
                    onAlertDialog(`Note: "${aaUsername}" has already been imported`, 'info', aaUsername);
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
            effectiveImportSource !== ImportSource.AA_USERNAME_IMPORT &&
            effectiveImportSource !== ImportSource.JSON_IMPORT
        ) {
            openSnackbar(
                'error',
                `Cannot import an empty ${
                    effectiveImportSource === ImportSource.ZOT_COURSE_IMPORT ? 'Zotcourse Schedule' : 'Study List'
                }.`
            );
            handleClose();
            return;
        }
        setStudyListText('');
        setImportedSchedules([]);
        setSelectedScheduleIndices(new Set());
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        handleClose();
    };

    const handleExport = () => {
        if (exportSelectedIndices.size === 0) {
            openSnackbar('error', 'Please select at least one schedule to export.');
            return;
        }

        try {
            const schedulesToExport = exportSchedules.filter((_, index) => exportSelectedIndices.has(index));

            const exportData = {
                schedules: schedulesToExport,
            };

            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], {
                type: 'application/json',
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `antalmanac-schedules-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            openSnackbar('success', `Successfully exported ${schedulesToExport.length} schedule(s)!`);
            handleClose();
        } catch (error) {
            console.error('Export error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to export schedules.';
            openSnackbar('error', errorMessage);
        }
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

    return (
        <Dialog open={open} onClose={handleClose}>
            {devMode && (
                <Tabs
                    value={dialogTab}
                    onChange={(_, newValue) => {
                        setDialogTab(newValue);
                        if (newValue === 'export') {
                            const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState();
                            setExportSchedules(scheduleSaveState.schedules);
                            setExportSelectedIndices(new Set(scheduleSaveState.schedules.map((_, index) => index)));
                        }
                    }}
                    textColor="secondary"
                    indicatorColor="secondary"
                    sx={(theme) => ({ borderBottom: 1, borderColor: theme.vars.palette.divider })}
                >
                    <Tab label="Import" value="import" />
                    <Tab label="Export" value="export" />
                </Tabs>
            )}
            <DialogTitle>{dialogTab === 'export' ? 'Export Schedules' : 'Import Schedule'}</DialogTitle>
            <DialogContent>
                {dialogTab === 'export' ? (
                    <ExportForm
                        schedules={exportSchedules}
                        selectedIndices={exportSelectedIndices}
                        onSelectedIndicesChange={setExportSelectedIndices}
                    />
                ) : (
                    <>
                        <FormControl>
                            <RadioGroup
                                name="changeImportSource"
                                aria-label="changeImportSource"
                                value={effectiveImportSource}
                                onChange={handleImportSourceChange}
                            >
                                <FormControlLabel
                                    value={ImportSource.STUDY_LIST_IMPORT}
                                    control={<Radio color="secondary" />}
                                    label="From Study List"
                                />
                                <FormControlLabel
                                    value={ImportSource.ZOT_COURSE_IMPORT}
                                    control={<Radio color="secondary" />}
                                    label="From Zotcourse"
                                />
                                <Tooltip title="Import from your unique user ID" placement="right">
                                    <FormControlLabel
                                        value={ImportSource.AA_USERNAME_IMPORT}
                                        control={<Radio color="secondary" />}
                                        label="From AntAlmanac unique user ID"
                                        disabled={!sessionIsValid}
                                    />
                                </Tooltip>
                                {devMode && (
                                    <Tooltip title="Import from your schedule data" placement="right">
                                        <FormControlLabel
                                            value={ImportSource.JSON_IMPORT}
                                            control={<Radio color="secondary" />}
                                            label="From JSON File"
                                        />
                                    </Tooltip>
                                )}
                            </RadioGroup>
                        </FormControl>

                        {effectiveImportSource === ImportSource.STUDY_LIST_IMPORT && (
                            <StudyListForm value={studyListText} onChange={handleStudyListTextChange} />
                        )}
                        {effectiveImportSource === ImportSource.ZOT_COURSE_IMPORT && (
                            <ZotcourseForm value={zotcourseScheduleName} onChange={handleZotcourseScheduleNameChange} />
                        )}
                        {effectiveImportSource === ImportSource.AA_USERNAME_IMPORT && (
                            <UsernameForm
                                value={aaUsername}
                                onChange={handleAAUsernameChange}
                                onSubmit={handleSubmit}
                            />
                        )}

                        {effectiveImportSource !== ImportSource.AA_USERNAME_IMPORT &&
                            effectiveImportSource !== ImportSource.JSON_IMPORT && (
                                <Stack spacing={1}>
                                    <DialogContentText>
                                        Make sure you also have the right term selected.
                                    </DialogContentText>
                                    <TermSelector />
                                </Stack>
                            )}

                        {effectiveImportSource === ImportSource.JSON_IMPORT && (
                            <JsonImportForm
                                importedSchedules={importedSchedules}
                                selectedScheduleIndices={selectedScheduleIndices}
                                onSchedulesChange={setImportedSchedules}
                                onIndicesChange={setSelectedScheduleIndices}
                                fileInputRef={fileInputRef}
                            />
                        )}
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="inherit">
                    Cancel
                </Button>
                {dialogTab === 'export' ? (
                    <Button
                        onClick={handleExport}
                        color="primary"
                        variant="contained"
                        disabled={exportSelectedIndices.size === 0}
                        sx={{ backgroundColor: BLUE }}
                    >
                        Export ({exportSelectedIndices.size})
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} color="inherit">
                        Import
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
