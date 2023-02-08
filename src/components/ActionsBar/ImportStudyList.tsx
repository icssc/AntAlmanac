import { useState } from 'react';
import { useSnackbar } from 'notistack';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputLabel,
  Link,
  TextField,
} from '@mui/material';
import { ContentPasteGo as ContentPasteGoIcon } from '@mui/icons-material';
import { useScheduleStore } from '$lib/stores/schedule';
import { Section, AASection } from '$lib/peterportal.types';
import { analyticsEnum, logAnalytics } from '$lib/analytics';
import { courseNumAsDecimal } from '$lib/helpers';

export interface AppStoreCourse {
  color: string;
  courseComment: string;
  courseNumber: string; //i.e. 122a
  courseTitle: string;
  deptCode: string;
  prerequisiteLink: string;
  scheduleIndices: number[];
  section: AASection;
  term: string;
}

export const termsInSchedule = (courses: AppStoreCourse[], term: string, scheduleIndex: number) =>
  new Set([
    term,
    ...courses.filter((course) => course.scheduleIndices.includes(scheduleIndex)).map((course) => course.term),
  ]);

export const addCourse = (
  section: Section,
  courseDetails: CourseDetails,
  term: string,
  scheduleIndex: number,
  color?: string,
  quiet?: boolean
) => {
  logAnalytics({
    category: analyticsEnum.classSearch.title,
    action: analyticsEnum.classSearch.actions.ADD_COURSE,
    label: courseDetails.deptCode,
    value: courseNumAsDecimal(courseDetails.courseNumber),
  });
  const addedCourses = AppStore.getAddedCourses();
  const terms = termsInSchedule(addedCourses, term, scheduleIndex);
  let existingCourse;

  for (const course of addedCourses) {
    if (course.section.sectionCode === section.sectionCode && term === course.term) {
      existingCourse = course;
      if (course.scheduleIndices.includes(scheduleIndex)) {
        return course.color;
      } else {
        break;
      }
    }
  }

  if (terms.size > 1 && !quiet) warnMultipleTerms(terms);

  if (color === undefined) {
    const setOfUsedColors = new Set(addedCourses.map((course) => course.color));

    color = arrayOfColors.find((materialColor) => {
      if (!setOfUsedColors.has(materialColor)) return materialColor;
      else return undefined;
    });

    if (color === undefined) color = '#5ec8e0';
  }

  const scheduleNames = AppStore.getScheduleNames();
  if (existingCourse === undefined) {
    const newCourse: AppStoreCourse = {
      color: color,
      term: term,
      deptCode: courseDetails.deptCode,
      courseNumber: courseDetails.courseNumber,
      courseTitle: courseDetails.courseTitle,
      courseComment: courseDetails.courseComment,
      prerequisiteLink: courseDetails.prerequisiteLink,
      scheduleIndices: scheduleIndex === scheduleNames.length ? [...scheduleNames.keys()] : [scheduleIndex],
      section: { ...section, color: color },
    };
    AppStore.addCourse(newCourse);
  } else {
    const newSection = {
      ...existingCourse,
      scheduleIndices:
        scheduleIndex === scheduleNames.length
          ? [...scheduleNames.keys()]
          : existingCourse.scheduleIndices.concat(scheduleIndex),
    };
    AppStore.addSection(newSection);
  }
  return color;
};

export interface CourseDetails {
  deptCode: string;
  courseNumber: string;
  courseTitle: string;
  courseComment: string;
  prerequisiteLink: string;
}

interface CourseInfo {
  courseDetails: CourseDetails;
  section: Section;
}

export const addCoursesMultiple = (
  courseInfo: { [sectionCode: string]: CourseInfo },
  term: string,
  scheduleIndex: number
) => {
  let sectionsAdded = 0;
  for (const section of Object.values(courseInfo)) {
    addCourse(section.section, section.courseDetails, term, scheduleIndex, undefined, true);
    ++sectionsAdded;
  }
  const terms = termsInSchedule(AppStore.getAddedCourses(), term, scheduleIndex);
  if (terms.size > 1) warnMultipleTerms(terms);
  return sectionsAdded;
};

/**
 * button that opens up modal to import study list
 */
export default function ImportStudyList() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  // const currentScheduleIndex = useScheduleStore((state) => state.currentScheduleIndex);

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setValue(event.target.value);
  }

  function handleClose() {
    setOpen(false);
  }

  function handleKeydown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleImport();
    }
  }

  function handleError(error: Error) {
    enqueueSnackbar('An error occurred while trying to import the Study List.', {
      variant: 'error',
    });
    console.error(error);
  }

  function handleImport() {
    this.setState({ isOpen: false }, async () => {
      const sectionCodes = value.match(/\d{5}/g);
      if (!sectionCodes) {
        enqueueSnackbar('Cannot import an empty/invalid Study List.', { variant: 'error' });
        return;
      }
      try {
        // const sectionsAdded = addCoursesMultiple(
        //   getCourseInfo(
        //     combineSOCObjects(
        //       await Promise.all(
        //         sectionCodes
        //           .reduce((result: string[][], item, index) => {
        //             // WebSOC queries can have a maximum of 10 course codes in tandem
        //             const chunkIndex = Math.floor(index / 10);
        //             result[chunkIndex] ? result[chunkIndex].push(item) : (result[chunkIndex] = [item]);
        //             return result;
        //           }, []) // https://stackoverflow.com/a/37826698
        //           .map((sectionCode: string[]) =>
        //             queryWebsoc({
        //               term: this.state.selectedTerm,
        //               sectionCodes: sectionCode.join(','),
        //             })
        //           )
        //       )
        //     )
        //   ),
        //   this.state.selectedTerm,
        //   currSchedule
        // );
        // logAnalytics({
        //   category: analyticsEnum.nav.title,
        //   action: analyticsEnum.nav.actions.IMPORT_STUDY_LIST,
        //   value: sectionsAdded / (sectionCodes.length || 1),
        // });
        // if (sectionsAdded === sectionCodes.length) {
        //   openSnackbar('success', `Successfully imported ${sectionsAdded} of ${sectionsAdded} classes!`);
        // } else if (sectionsAdded !== 0) {
        //   openSnackbar(
        //     'warning',
        //     `Successfully imported ${sectionsAdded} of ${sectionCodes.length} classes.
        //                Please make sure that you selected the correct term and that none of your classes are missing.`
        //   );
        // } else {
        //   openSnackbar(
        //     'error',
        //     'Failed to import any classes! Please make sure that you pasted the correct Study List.'
        //   );
        // }
      } catch (e) {
        handleError(e);
      }
      setValue('');
    });
  }

  return (
    <>
      {/* TODO after mui v5 migration: change icon to ContentPasteGo */}
      <Button onClick={this.handleOpen} color="inherit" startIcon={<ContentPasteGoIcon />}>
        Import
      </Button>
      <Dialog open={open}>
        <DialogTitle>Import Schedule</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Paste the contents of your Study List below to import it into AntAlmanac.
            <br />
            To find your Study List, go to{' '}
            <Link href={'https://www.reg.uci.edu/cgi-bin/webreg-redirect.sh'}>WebReg</Link> or{' '}
            <Link href={'https://www.reg.uci.edu/access/student/welcome/'}>StudentAccess</Link>, and click on Study List
            once you&apos;ve logged in. Copy everything below the column names (Code, Dept, etc.) under the Enrolled
            Classes section.
            {/* &apos; is an apostrophe (') */}
          </DialogContentText>
          <br />
          <InputLabel>Study List</InputLabel>
          <TextField
            autoFocus
            fullWidth
            multiline
            margin="dense"
            type="text"
            placeholder="Paste here"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeydown}
          />
          <br />
          <DialogContentText>Make sure you also have the right term selected.</DialogContentText>
          <br />
          {/* <TermSelector changeState={this.onTermSelectorChange} fieldName={'selectedTerm'} /> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleImport} color="primary">
            Import
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// import { ContentPasteGo } from '@mui/icons-material';
// import {
//     Button,
//     Dialog,
//     DialogActions,
//     DialogContent,
//     DialogContentText,
//     DialogTitle,
//     Link,
//     TextField,
// } from '@mui/material';
// import InputLabel from '@mui/material/InputLabel';
// import { ClassNameMap } from '@mui/styles/withStyles';
// import React, { PureComponent } from 'react';
//
// import { openSnackbar } from '../../actions/AppStoreActions';
// import analyticsEnum, { logAnalytics } from '../../analytics';
// import { addCoursesMultiple, combineSOCObjects, getCourseInfo, queryWebsoc } from '../../helpers';
// import AppStore from '../../stores/AppStore';
// import TermSelector from '../RightPane/CoursePane/SearchForm/TermSelector';
// import RightPaneStore from '../RightPane/RightPaneStore';
//
// const styles = {
//     inputLabel: {
//         'font-size': '9px',
//     },
// };
//
// interface ImportStudyListProps {
//     classes: ClassNameMap;
// }
//
// interface ImportStudyListState {
//     isOpen: boolean;
//     selectedTerm: string;
//     studyListText: string;
// }
//
// class ImportStudyList extends PureComponent<ImportStudyListProps, ImportStudyListState> {
//     state: ImportStudyListState = {
//         isOpen: false,
//         selectedTerm: RightPaneStore.getFormData().term,
//         studyListText: '',
//     };
//
//     onTermSelectorChange = (field: string, value: string) => {
//         this.setState({ selectedTerm: value });
//     };
//
//     handleError = (error: Error) => {
//         openSnackbar('error', 'An error occurred while trying to import the Study List.');
//         console.error(error);
//     };
//
//     handleOpen = () => {
//         this.setState({ isOpen: true });
//     };
//
//     handleClose = (doImport: boolean) => {
//         this.setState({ isOpen: false }, async () => {
//             document.removeEventListener('keydown', this.enterEvent, false);
//             if (doImport) {
//                 const sectionCodes = this.state.studyListText.match(/\d{5}/g);
//                 if (!sectionCodes) {
//                     openSnackbar('error', 'Cannot import an empty/invalid Study List.');
//                     return;
//                 }
//                 const currSchedule = AppStore.getCurrentScheduleIndex();
//                 try {
//                     const sectionsAdded = addCoursesMultiple(
//                         getCourseInfo(
//                             combineSOCObjects(
//                                 await Promise.all(
//                                     sectionCodes
//                                         .reduce((result: string[][], item, index) => {
//                                             // WebSOC queries can have a maximum of 10 course codes in tandem
//                                             const chunkIndex = Math.floor(index / 10);
//                                             result[chunkIndex]
//                                                 ? result[chunkIndex].push(item)
//                                                 : (result[chunkIndex] = [item]);
//                                             return result;
//                                         }, []) // https://stackoverflow.com/a/37826698
//                                         .map((sectionCode: string[]) =>
//                                             queryWebsoc({
//                                                 term: this.state.selectedTerm,
//                                                 sectionCodes: sectionCode.join(','),
//                                             })
//                                         )
//                                 )
//                             )
//                         ),
//                         this.state.selectedTerm,
//                         currSchedule
//                     );
//                     logAnalytics({
//                         category: analyticsEnum.nav.title,
//                         action: analyticsEnum.nav.actions.IMPORT_STUDY_LIST,
//                         value: sectionsAdded / (sectionCodes.length || 1),
//                     });
//                     if (sectionsAdded === sectionCodes.length) {
//                         openSnackbar('success', `Successfully imported ${sectionsAdded} of ${sectionsAdded} classes!`);
//                     } else if (sectionsAdded !== 0) {
//                         openSnackbar(
//                             'warning',
//                             `Successfully imported ${sectionsAdded} of ${sectionCodes.length} classes.
//                         Please make sure that you selected the correct term and that none of your classes are missing.`
//                         );
//                     } else {
//                         openSnackbar(
//                             'error',
//                             'Failed to import any classes! Please make sure that you pasted the correct Study List.'
//                         );
//                     }
//                 } catch (e) {
//                     if (e instanceof Error) this.handleError(e);
//                 }
//             }
//             this.setState({ studyListText: '' });
//         });
//     };
//
//     enterEvent = (event: KeyboardEvent) => {
//         const charCode = event.which ? event.which : event.keyCode;
//         // enter (13) or newline (10)
//         if (charCode === 13 || charCode === 10) {
//             event.preventDefault();
//             this.handleClose(true);
//         }
//     };
//
//     componentDidUpdate(prevProps: ImportStudyListProps, prevState: ImportStudyListState) {
//         if (!prevState.isOpen && this.state.isOpen) {
//             document.addEventListener('keydown', this.enterEvent, false);
//         } else if (prevState.isOpen && !this.state.isOpen) {
//             document.removeEventListener('keydown', this.enterEvent, false);
//         }
//     }
//
//     render() {
//         return (
//             <>
//                 {/* TODO after mui v5 migration: change icon to ContentPasteGo */}
//                 <Button onClick={this.handleOpen} color="inherit" startIcon={<ContentPasteGo />}>
//                     Import
//                 </Button>
//                 <Dialog open={this.state.isOpen}>
//                     <DialogTitle>Import Schedule</DialogTitle>
//                     <DialogContent>
//                         <DialogContentText>
//                             Paste the contents of your Study List below to import it into AntAlmanac.
//                             <br />
//                             To find your Study List, go to{' '}
//                             <Link href={'https://www.reg.uci.edu/cgi-bin/webreg-redirect.sh'}>WebReg</Link> or{' '}
//                             <Link href={'https://www.reg.uci.edu/access/student/welcome/'}>StudentAccess</Link>, and click on
//                             Study List once you&apos;ve logged in. Copy everything below the column names (Code, Dept, etc.)
//                             under the Enrolled Classes section.
//                             {/* &apos; is an apostrophe (') */}
//                         </DialogContentText>
//                         <br />
//                         <InputLabel sx={styles.inputLabel}>Study List</InputLabel>
//                         <TextField
//                             // eslint-disable-next-line jsx-a11y/no-autofocus
//                             autoFocus
//                             fullWidth
//                             multiline
//                             margin="dense"
//                             type="text"
//                             placeholder="Paste here"
//                             value={this.state.studyListText}
//                             onChange={(event) => this.setState({ studyListText: event.target.value })}
//                         />
//                         <br />
//                         <DialogContentText>Make sure you also have the right term selected.</DialogContentText>
//                         <br />
//                         <TermSelector changeState={this.onTermSelectorChange} fieldName={'selectedTerm'} />
//                     </DialogContent>
//                     <DialogActions>
//                         <Button onClick={() => this.handleClose(false)} color="primary">
//                             Cancel
//                         </Button>
//                         <Button onClick={() => this.handleClose(true)} color="primary">
//                             Import
//                         </Button>
//                     </DialogActions>
//                 </Dialog>
//             </>
//         );
//     }
// }
//
// export default ImportStudyList
