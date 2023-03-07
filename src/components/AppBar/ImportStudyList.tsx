import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
} from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { PostAdd } from '@material-ui/icons';
import { PureComponent } from 'react';

import { openSnackbar } from '$actions/AppStoreActions';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { addCoursesMultiple, combineSOCObjects, getCourseInfo, queryWebsoc } from '$lib/helpers';
import AppStore from '$stores/AppStore';

import TermSelector from '../RightPane/CoursePane/SearchForm/TermSelector';
import RightPaneStore from '../RightPane/RightPaneStore';

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
}

class ImportStudyList extends PureComponent<ImportStudyListProps, ImportStudyListState> {
    state: ImportStudyListState = {
        isOpen: false,
        selectedTerm: RightPaneStore.getFormData().term,
        studyListText: '',
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

    handleClose = (doImport: boolean) => {
        this.setState({ isOpen: false }, async () => {
            document.removeEventListener('keydown', this.enterEvent, false);
            if (doImport) {
                const sectionCodes = this.state.studyListText.match(/\d{5}/g);
                if (!sectionCodes) {
                    openSnackbar('error', 'Cannot import an empty/invalid Study List.');
                    return;
                }
                const currSchedule = AppStore.getCurrentScheduleIndex();
                try {
                    const sectionsAdded = addCoursesMultiple(
                        getCourseInfo(
                            combineSOCObjects(
                                await Promise.all(
                                    sectionCodes
                                        .reduce((result: string[][], item, index) => {
                                            // WebSOC queries can have a maximum of 10 course codes in tandem
                                            const chunkIndex = Math.floor(index / 10);
                                            result[chunkIndex]
                                                ? result[chunkIndex].push(item)
                                                : (result[chunkIndex] = [item]);
                                            return result;
                                        }, []) // https://stackoverflow.com/a/37826698
                                        .map((sectionCode: string[]) =>
                                            queryWebsoc({
                                                term: this.state.selectedTerm,
                                                sectionCodes: sectionCode.join(','),
                                            })
                                        )
                                )
                            )
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

    render() {
        const { classes } = this.props;
        return (
            <>
                {/* TODO after mui v5 migration: change icon to ContentPasteGo */}
                <Button onClick={this.handleOpen} color="inherit" startIcon={<PostAdd />}>
                    Import
                </Button>
                <Dialog open={this.state.isOpen}>
                    <DialogTitle>Import Schedule</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Paste the contents of your Study List below to import it into AntAlmanac.
                            <br />
                            To find your Study List, go to{' '}
                            <a href={'https://www.reg.uci.edu/cgi-bin/webreg-redirect.sh'}>WebReg</a> or{' '}
                            <a href={'https://www.reg.uci.edu/access/student/welcome/'}>StudentAccess</a>, and click on
                            Study List once you&apos;ve logged in. Copy everything below the column names (Code, Dept,
                            etc.) under the Enrolled Classes section.
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
