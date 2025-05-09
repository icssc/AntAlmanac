import {
    Box,
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
    TextField,
    Tooltip,
} from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import { PostAdd } from '@material-ui/icons';
import { CourseInfo } from '@packages/antalmanac-types';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';

import { addCustomEvent, openSnackbar, addCourse } from '$actions/AppStoreActions';
import { TermSelector } from '$components/RightPane/CoursePane/SearchForm/TermSelector';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { QueryZotcourseError } from '$lib/customErrors';
import { warnMultipleTerms } from '$lib/helpers';
import { WebSOC } from '$lib/websoc';
import { ZotcourseResponse, queryZotcourse } from '$lib/zotcourse';
import AppStore from '$stores/AppStore';
import { useThemeStore } from '$stores/SettingsStore';

export function Import() {
    const [open, setOpen] = useState(false);
    const [importSource, setImportSource] = useState('studylist');
    const [studyListText, setStudyListText] = useState('');
    const [zotcourseScheduleName, setZotcourseScheduleName] = useState('');

    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());

    const { isDark } = useThemeStore();

    const handleOpen = useCallback(() => {
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    const handleSubmit = async () => {
        const currentSchedule = AppStore.getCurrentScheduleIndex();

        const isZotcourseImport = importSource === 'zotcourse';
        let sectionCodes: string[] | null = null;

        if (isZotcourseImport) {
            try {
                const zotcourseImport: ZotcourseResponse = await queryZotcourse(zotcourseScheduleName);
                sectionCodes = zotcourseImport.codes;
                for (const event of zotcourseImport.customEvents) {
                    addCustomEvent(event, [currentSchedule]);
                }
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
        } else {
            // Is importing from Study List
            sectionCodes = studyListText.match(/\d{5}/g);
        }

        if (!sectionCodes) {
            openSnackbar('error', `Cannot import an empty ${isZotcourseImport ? 'Zotcourse' : 'Study List'}.`);
            handleClose();
            return;
        }

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

            logAnalytics({
                category: analyticsEnum.nav.title,
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

        setStudyListText('');
        handleClose();
    };

    const addCoursesMultiple = (
        courseInfo: { [sectionCode: string]: CourseInfo },
        term: string,
        scheduleIndex: number
    ) => {
        for (const section of Object.values(courseInfo)) {
            addCourse(section.section, section.courseDetails, term, scheduleIndex, true);
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

    useEffect(() => {
        const handleSkeletonModeChange = () => {
            setSkeletonMode(AppStore.getSkeletonMode());
        };

        AppStore.on('skeletonModeChange', handleSkeletonModeChange);

        return () => {
            AppStore.off('skeletonModeChange', handleSkeletonModeChange);
        };
    }, []);

    return (
        <>
            {/* TODO after mui v5 migration: change icon to ContentPasteGo */}
            <Tooltip title="Import a schedule from your Study List">
                <Button
                    onClick={handleOpen}
                    color="inherit"
                    startIcon={<PostAdd />}
                    disabled={skeletonMode}
                    id="import-button"
                >
                    Import
                </Button>
            </Tooltip>
            <Dialog open={open} onClose={handleClose}>
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
                                value="studylist"
                                control={<Radio color="primary" />}
                                label="From Study List"
                            />
                            <FormControlLabel
                                value="zotcourse"
                                control={<Radio color="primary" />}
                                label="From Zotcourse"
                            />
                        </RadioGroup>
                    </FormControl>
                    {importSource === 'studylist' ? (
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
                    ) : (
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

                    <DialogContentText>Make sure you also have the right term selected.</DialogContentText>
                    <TermSelector />
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
        </>
    );
}
