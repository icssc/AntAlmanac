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
import { useTermStore } from '$lib/stores/term';
import { ContentPasteGo as ContentPasteGoIcon } from '@mui/icons-material';
import useAddCoursesMultiple from '$hooks/schedule/useAddCoursesMultiple';
import { useScheduleStore } from '$lib/stores/schedule';
import { analyticsEnum, logAnalytics } from '$lib/analytics';
import { getCourseInfo, combineSOCObjects, queryWebsoc } from '$lib/helpers';

/**
 * button that opens up modal to import study list
 */
export default function ImportStudyList() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const term = useTermStore((state) => state.term);

  const addCoursesMultiple = useAddCoursesMultiple();
  const currentScheduleIndex = useScheduleStore((state) => state.currentScheduleIndex);

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setValue(event.target.value);
  }

  function handleOpen() {
    setOpen(true);
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

  async function handleImport() {
    setOpen(false);
    const sectionCodes = value.match(/\d{5}/g);
    if (!sectionCodes) {
      enqueueSnackbar('Cannot import an empty/invalid Study List.', { variant: 'error' });
      return;
    }
    try {
      const sectionsAdded = addCoursesMultiple(
        getCourseInfo(
          combineSOCObjects(
            await Promise.all(
              sectionCodes
                .reduce((result: string[][], item, index) => {
                  // WebSOC queries can have a maximum of 10 course codes in tandem
                  const chunkIndex = Math.floor(index / 10);
                  result[chunkIndex] ? result[chunkIndex].push(item) : (result[chunkIndex] = [item]);
                  return result;
                }, []) // https://stackoverflow.com/a/37826698
                .map((sectionCode: string[]) =>
                  queryWebsoc({
                    term,
                    sectionCodes: sectionCode.join(','),
                  })
                )
            )
          )
        ),
        term,
        currentScheduleIndex
      );
      logAnalytics({
        category: analyticsEnum.nav.title,
        action: analyticsEnum.nav.actions.IMPORT_STUDY_LIST,
        value: sectionsAdded / (sectionCodes.length || 1),
      });
      if (sectionsAdded === sectionCodes.length) {
        enqueueSnackbar(`Successfully imported ${sectionsAdded} of ${sectionsAdded} classes!`, {
          variant: 'success',
        });
      } else if (sectionsAdded !== 0) {
        enqueueSnackbar(
          `Successfully imported ${sectionsAdded} of ${sectionCodes.length} classes. Please make sure that you selected the correct term and that none of your classes are missing.`,
          {
            variant: 'warning',
          }
        );
      } else {
        enqueueSnackbar('Failed to import any classes! Please make sure that you pasted the correct Study List.', {
          variant: 'error',
        });
      }
    } catch (e) {
      handleError(e);
    }
    setValue('');
  }

  return (
    <>
      <Button onClick={handleOpen} color="inherit" startIcon={<ContentPasteGoIcon />}>
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
