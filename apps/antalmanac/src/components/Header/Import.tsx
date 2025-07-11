import { ContentPasteGo } from '@mui/icons-material';
import {
    AlertColor,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormControlLabel,
    InputLabel,
    Radio,
    RadioGroup,
    Stack,
    TextField,
    Tooltip,
} from '@mui/material';
import { CourseInfo } from '@packages/antalmanac-types';
import { usePostHog } from 'posthog-js/react';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
    addCustomEvent,
    openSnackbar,
    addCourse,
    importScheduleWithUsername,
    importValidatedSchedule,
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
import { BLUE } from '$src/globals';
import AppStore from '$stores/AppStore';
import { scheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore } from '$stores/SettingsStore';

enum ImportSource {
    ZOT_COURSE_IMPORT = 'zotcourse',
    STUDY_LIST_IMPORT = 'studylist',
    AA_USERNAME_IMPORT = 'username',
}

export function Import() {
    const [alertDialogTitle, setAlertDialogTitle] = useState('');
    const [alertDialogSeverity, setAlertDialogSeverity] = useState<AlertColor>('error');
    const [alertDialog, setAlertDialog] = useState(false);
    const [importSource, setImportSource] = useState('studylist');
    const [studyListText, setStudyListText] = useState('');
    const [zotcourseScheduleName, setZotcourseScheduleName] = useState('');
    const [aaUsername, setAAUsername] = useState('');

    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());

    const { sessionIsValid } = useSessionStore();
    const { openImportDialog, setOpenImportDialog } = scheduleComponentsToggleStore();

    const { isDark } = useThemeStore();

    const postHog = usePostHog();

    const handleOpen = useCallback(() => {
        setOpenImportDialog(true);
    }, [setOpenImportDialog]);

    const handleClose = useCallback(() => {
        setOpenImportDialog(false);
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
            default:
                openSnackbar('error', 'Invalid import source.');
                handleClose();
                return;
        }

        if (!sectionCodes && importSource !== ImportSource.AA_USERNAME_IMPORT) {
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

    return (
        <>
            <Tooltip title="Import a schedule from your Study List">
                <Button
                    onClick={handleOpen}
                    color="inherit"
                    startIcon={<ContentPasteGo />}
                    disabled={skeletonMode}
                    id="import-button"
                >
                    Import
                </Button>
            </Tooltip>
            <Dialog open={openImportDialog} onClose={handleClose}>
                <DialogTitle>Import Schedule</DialogTitle>
                <DialogContent>
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
                        </RadioGroup>
                    </FormControl>
                    {importSource === ImportSource.STUDY_LIST_IMPORT && (
                        <Box>
                            <DialogContentText>
                                Paste the contents of your Study List below to import it into AntAlmanac.
                                <br />
                                To find your Study List, go to{' '}
                                <a href={'https://www.reg.uci.edu/cgi-bin/webreg-redirect.sh'}>WebReg</a> or{' '}
                                <a href={'https://www.reg.uci.edu/access/student/welcome/'}>StudentAccess</a>, and click
                                on Study List once you&apos;ve logged in. Copy everything below the column names (Code,
                                Dept, etc.) under the Enrolled Classes section.
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

                    {importSource !== ImportSource.AA_USERNAME_IMPORT && (
                        <Stack spacing={1}>
                            <DialogContentText>Make sure you also have the right term selected.</DialogContentText>
                            <TermSelector />
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color={isDark ? 'secondary' : 'primary'}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color={isDark ? 'secondary' : 'primary'}>
                        Import
                    </Button>
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
