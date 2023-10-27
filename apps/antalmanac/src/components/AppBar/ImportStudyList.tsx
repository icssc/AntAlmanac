import {
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
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { PostAdd } from '@material-ui/icons';
import { PureComponent } from 'react';

import TermSelector from '../RightPane/CoursePane/SearchForm/TermSelector';
import RightPaneStore from '../RightPane/RightPaneStore';
import { addCustomEvent, openSnackbar } from '$actions/AppStoreActions';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { warnMultipleTerms } from '$lib/helpers';
import AppStore from '$stores/AppStore';
import { getCourseInfo, queryWebsoc } from '$lib/course-helpers';
import { CourseInfo } from '$lib/course_data.types';
import { addCourse } from '$actions/AppStoreActions';
import { ZotCourseResponse, queryZotCourse } from '$lib/zotcourse';

const styles = {
    inputLabel: {
        'font-size': '9px',
    },
};

interface ImportStudyListProps {
    classes: ClassNameMap;
}

interface ImportStudyListState {
    isOpen: boolean;
    selectedTerm: string;
    studyListText: string;
    zotcourseScheduleName: string;
    importSource: string;
}

class ImportStudyList extends PureComponent<ImportStudyListProps, ImportStudyListState> {
    state: ImportStudyListState = {
        isOpen: false,
        selectedTerm: RightPaneStore.getFormData().term,
        studyListText: '',
        zotcourseScheduleName: '',
        importSource: 'studylist',
    };

    onTermSelectorChange = (field: string, value: string) => {
        this.setState({ selectedTerm: value });
    };

    handleError = (error: Error) => {
        openSnackbar('error', 'An error occurred while trying to import the Study List.');
        console.error(error);
    };

    handleOpen = () => {
        this.setState({ isOpen: true });
    };

    addCoursesMultiple = (
        courseInfo: { [sectionCode: string]: CourseInfo },
        term: string,
        scheduleIndex: number
    ) => {
        for (const section of Object.values(courseInfo)) {
            addCourse(section.section, section.courseDetails, term, scheduleIndex, true);
        }
        const terms = AppStore.termsInSchedule(term);
        if (terms.size > 1) warnMultipleTerms(terms);
        return Object.values(courseInfo).length;
    };

    handleClose = (doImport: boolean) => {
        this.setState({ isOpen: false }, async () => {
            document.removeEventListener('keydown', this.enterEvent, false);
            if (doImport) {
                const currSchedule = AppStore.getCurrentScheduleIndex();
                let zotcourseImport: ZotCourseResponse | null = null;
                if (this.state.importSource === 'zotcourse') {
                    try {
                        zotcourseImport = await queryZotCourse(this.state.zotcourseScheduleName);
                    } catch (e) {
                        /* empty */
                    }
                }
                const sectionCodes = zotcourseImport ? zotcourseImport.codes : this.state.studyListText.match(/\d{5}/g);
                if (!sectionCodes) {
                    openSnackbar('error', 'Cannot import an empty/invalid Study List/Zotcourse.');
                    return;
                }
                // Import Custom Events from zotcourse
                if (zotcourseImport) {
                    const events = zotcourseImport.customEvents;
                    for (const event of events) {
                        addCustomEvent(event, [currSchedule]);
                    }
                }

                try {
                    const sectionsAdded = this.addCoursesMultiple(
                        getCourseInfo(
                            await queryWebsoc({
                                term: this.state.selectedTerm,
                                sectionCodes: sectionCodes.join(','),
                            })
                        ),
                        this.state.selectedTerm,
                        currSchedule
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
                            `Successfully imported ${sectionsAdded} of ${sectionCodes.length} classes. 
                        Please make sure that you selected the correct term and that none of your classes are missing.`
                        );
                    } else {
                        openSnackbar(
                            'error',
                            'Failed to import any classes! Please make sure that you pasted the correct Study List.'
                        );
                    }
                } catch (e) {
                    if (e instanceof Error) this.handleError(e);
                }
            }
            this.setState({ studyListText: '' });
        });
    };

    enterEvent = (event: KeyboardEvent) => {
        const charCode = event.which ? event.which : event.keyCode;
        // enter (13) or newline (10)
        if (charCode === 13 || charCode === 10) {
            event.preventDefault();
            this.handleClose(true);
        }
    };

    componentDidUpdate(prevProps: ImportStudyListProps, prevState: ImportStudyListState) {
        if (!prevState.isOpen && this.state.isOpen) {
            document.addEventListener('keydown', this.enterEvent, false);
        } else if (prevState.isOpen && !this.state.isOpen) {
            document.removeEventListener('keydown', this.enterEvent, false);
        }
    }

    toggleImportSource(radioGroupEvent: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ importSource: radioGroupEvent.target.value });
    }

    render() {
        const { classes } = this.props;

        return (
            <>
                {/* TODO after mui v5 migration: change icon to ContentPasteGo */}
                <Tooltip title="Import a schedule from your Study List">
                    <Button onClick={this.handleOpen} color="inherit" startIcon={<PostAdd />}>
                        Import
                    </Button>
                </Tooltip>
                <Dialog
                    open={this.state.isOpen}
                    onClose={() =>
                        this.setState({ isOpen: false, studyListText: '' }, async () => {
                            document.removeEventListener('keydown', this.enterEvent, false);
                        })
                    }
                >
                    <DialogTitle>Import Schedule</DialogTitle>
                    <DialogContent>
                        <FormControl>
                            <RadioGroup
                                name="changeImportSource"
                                aria-label="changeImportSource"
                                value={this.state.importSource}
                                onChange={(event) => {
                                    this.toggleImportSource(event);
                                }}
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
                        {this.state.importSource === 'studylist' ? (
                            <div>
                                <DialogContentText>
                                    Paste the contents of your Study List below to import it into AntAlmanac.
                                    <br />
                                    To find your Study List, go to{' '}
                                    <a href={'https://www.reg.uci.edu/cgi-bin/webreg-redirect.sh'}>WebReg</a> or{' '}
                                    <a href={'https://www.reg.uci.edu/access/student/welcome/'}>StudentAccess</a>, and
                                    click on Study List once you&apos;ve logged in. Copy everything below the column
                                    names (Code, Dept, etc.) under the Enrolled Classes section.
                                    {/* &apos; is an apostrophe (') */}
                                </DialogContentText>
                                <InputLabel className={classes.inputLabel}>Study List</InputLabel>
                                <TextField
                                    // eslint-disable-next-line jsx-a11y/no-autofocus
                                    autoFocus
                                    fullWidth
                                    multiline
                                    margin="dense"
                                    type="text"
                                    placeholder="Paste here"
                                    value={this.state.studyListText}
                                    onChange={(event) => this.setState({ studyListText: event.target.value })}
                                />
                                <br />
                            </div>
                        ) : (
                            <div>
                                <DialogContentText>
                                    Paste your Zotcourse schedule name below to import it into AntAlmanac.
                                    {/* &apos; is an apostrophe (') */}
                                </DialogContentText>
                                <InputLabel className={classes.inputLabel}>Zotcourse Schedule</InputLabel>
                                <TextField
                                    // eslint-disable-next-line jsx-a11y/no-autofocus
                                    autoFocus
                                    fullWidth
                                    multiline
                                    margin="dense"
                                    type="text"
                                    placeholder="Paste here"
                                    value={this.state.zotcourseScheduleName}
                                    onChange={(event) => this.setState({ zotcourseScheduleName: event.target.value })}
                                />
                                <br />
                            </div>
                        )}

                        <DialogContentText>Make sure you also have the right term selected.</DialogContentText>
                        <TermSelector changeState={this.onTermSelectorChange} fieldName={'selectedTerm'} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.handleClose(false)} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={() => this.handleClose(true)} color="primary">
                            Import
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    }
}

export default withStyles(styles)(ImportStudyList);
