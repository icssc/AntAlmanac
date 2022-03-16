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
import store from '../../stores/RightPaneStore';
import { addCourse, clearSchedules, openSnackbar } from '../../actions/AppStoreActions';
import AppStore from '../../stores/AppStore';
import { GetApp } from '@material-ui/icons';

class ImportStudyList extends PureComponent {
    state = {
        isOpen: false,
        selectedTerm: null,
        studyListText: '',
    };

    handleError = (error) => {
        openSnackbar('error', 'An error occurred while trying to import the Study List.');
        console.error(error);
    };

    handleOpen = () => {
        this.setState({ isOpen: true, selectedTerm: store.getFormData().term });
    };

    handleClose = (doImport) => {
        this.setState({ isOpen: false }, () => {
            document.removeEventListener('keydown', this.enterEvent, false);
            this.setState({ studyListText: '' });
        });
        if (doImport) {
            document.removeEventListener('keydown', this.enterEvent, false);
            if (!(this.state.studyListText && this.state.studyListText.match(/\d{5}/g))) {
                openSnackbar('error', 'Cannot import an empty/invalid Study List.');
                return;
            }
            const currIndex = AppStore.getCurrentScheduleIndex();
            try {
                Promise.all(
                    this.state.studyListText
                        .split('\n')
                        .map((line) => line.match(/\d{5}/g))
                        .filter((id) => id)
                        .flat()
                        .reduce((result, item, index) => {
                            // WebSOC queries can have a maximum of 8 course codes in tandem
                            const chunkIndex = Math.floor(index / 8);
                            if (!result[chunkIndex]) {
                                result[chunkIndex] = [];
                            }
                            result[chunkIndex].push(item);
                            return result;
                        }, []) // https://stackoverflow.com/a/37826698
                        .map((sectionCode) =>
                            queryWebsoc({ term: this.state.selectedTerm, sectionCodes: sectionCode.join(',') })
                        )
                )
                    .then((r) => {
                        r.forEach((response) => {
                            response.schools
                                .map((school) => school.departments)
                                .flat()
                                .map((dept) => dept.courses)
                                .flat()
                                .forEach((course) => {
                                    course.sections.forEach((section) =>
                                        addCourse(section, course, this.state.selectedTerm, currIndex)
                                    );
                                });
                        });
                        openSnackbar('success', 'Study List successfully imported!');
                    })
                    .catch((e) => this.handleError(e));
            } catch (e) {
                this.handleError(e);
            }
        }
    };

    enterEvent = (event) => {
        const charCode = event.which ? event.which : event.keyCode;
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
                            Paste the contents of your Study List below to import it into AntAlmanac.
                        </DialogContentText>
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
