import React, { PureComponent } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
} from '@material-ui/core';
import { queryWebsoc } from '../../helpers';
import RightPaneStore from '../../stores/RightPaneStore';
import { addCourse, openSnackbar } from '../../actions/AppStoreActions';
import AppStore from '../../stores/AppStore';
import { GetApp } from '@material-ui/icons';
import { termData } from '../../termData';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';

class ImportStudyList extends PureComponent {
    state = {
        isOpen: false,
        selectedTerm: RightPaneStore.getFormData().term,
        studyListText: '',
    };

    handleChange = (event) => {
        this.setState({ selectedTerm: event.target.value });
    };

    handleError = (error) => {
        openSnackbar('error', 'An error occurred while trying to import the Study List.');
        console.error(error);
    };

    handleOpen = () => {
        this.setState({ isOpen: true });
    };

    handleClose = async (doImport) => {
        this.setState({ isOpen: false }, () => {
            document.removeEventListener('keydown', this.enterEvent, false);
            this.setState({ studyListText: '' });
        });
        if (doImport) {
            document.removeEventListener('keydown', this.enterEvent, false);
            if (!this.state.studyListText.match(/\d{5}/g)) {
                openSnackbar('error', 'Cannot import an empty/invalid Study List.');
                return;
            }
            const currSchedule = AppStore.getCurrentScheduleIndex();
            const sectionCodes = this.state.studyListText.match(/\d{5}/g);
            let sectionsAdded = 0;
            try {
                (
                    await Promise.all(
                        sectionCodes
                            .reduce((result, item, index) => {
                                // WebSOC queries can have a maximum of 10 course codes in tandem
                                const chunkIndex = Math.floor(index / 10);
                                result[chunkIndex] ? result[chunkIndex].push(item) : (result[chunkIndex] = [item]);
                                return result;
                            }, []) // https://stackoverflow.com/a/37826698
                            .map((sectionCode) =>
                                queryWebsoc({ term: this.state.selectedTerm, sectionCodes: sectionCode.join(',') })
                            )
                    )
                ).forEach((response) => {
                    response.schools
                        .map((school) => school.departments)
                        .flat()
                        .map((dept) => dept.courses)
                        .flat()
                        .forEach((course) => {
                            course.sections.forEach((section) => {
                                addCourse(section, course, this.state.selectedTerm, currSchedule);
                                ++sectionsAdded;
                            });
                        });
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
                this.handleError(e);
            }
        }
    };

    enterEvent = (event) => {
        const charCode = event.which ? event.which : event.keyCode;
        // enter (13) or newline (10)
        if (charCode === 13 || charCode === 10) {
            event.preventDefault();
            this.handleClose(true);
        }
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!prevState.isOpen && this.state.isOpen) {
            document.addEventListener('keydown', this.enterEvent, false);
        } else if (prevState.isOpen && !this.state.isOpen) {
            document.removeEventListener('keydown', this.enterEvent, false);
        }
    }

    render() {
        return (
            <>
                <Button onClick={this.handleOpen} color="inherit" startIcon={<GetApp />}>
                    Import
                </Button>
                <Dialog open={this.state.isOpen}>
                    <DialogTitle>Import Schedule</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Paste the contents of your Study List below to import it into AntAlmanac. Make sure you have
                            the right term selected below.
                        </DialogContentText>
                        <InputLabel>Term</InputLabel>
                        <Select value={this.state.selectedTerm} onChange={this.handleChange}>
                            {termData.map((term) => (
                                <MenuItem value={term.shortName}>{term.longName}</MenuItem>
                            ))}
                        </Select>
                        <br />
                        <InputLabel>Study List</InputLabel>
                        <TextField
                            autoFocus
                            fullWidth
                            multiline
                            margin="dense"
                            type="text"
                            placeholder="Paste here"
                            value={this.state.studyListText}
                            onChange={(event) => this.setState({ studyListText: event.target.value })}
                        />
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

export default ImportStudyList;
