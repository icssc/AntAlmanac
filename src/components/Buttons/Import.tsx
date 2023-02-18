import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { PostAdd as PostAddIcon } from '@mui/icons-material'
import { useSettingsStore } from '$stores/settings'
import { useScheduleStore } from '$stores/schedule'
import { addCourse } from '$stores/schedule/course'
import { combineSOCObjects, getCourseInfo } from '$stores/schedule/import'
import { queryWebsoc } from '$lib/helpers'
import { termData } from '$lib/termData'

/**
 * opens up dialog to save a schedule
 */
export default function ImportScheduleButton() {
  const [open, setOpen] = useState(false)
  const [term, setTerm] = useState('')
  const [studyList, setStudyList] = useState('')
  const { scheduleIndex } = useScheduleStore()
  const isDarkMode = useSettingsStore((store) => store.isDarkMode)

  async function handleSubmit() {
    const sectionCodes = studyList.match(/\d{5}/g)
    if (!sectionCodes) {
      return
    }
    const sectionsAdded = getCourseInfo(
      combineSOCObjects(
        await Promise.all(
          sectionCodes
            .reduce((result: string[][], item, index) => {
              // WebSOC queries can have a maximum of 10 course codes in tandem
              const chunkIndex = Math.floor(index / 10)
              result[chunkIndex] ? result[chunkIndex].push(item) : (result[chunkIndex] = [item])
              return result
            }, []) // https://stackoverflow.com/a/37826698
            .map((sectionCode: string[]) =>
              queryWebsoc({
                term,
                sectionCodes: sectionCode.join(','),
              })
            )
        )
      )
    )
    Object.values(sectionsAdded).forEach((section) => {
      addCourse(section.section, section.courseDetails, scheduleIndex)
    })
    setOpen(false)
  }

  function handleCancel() {
    setOpen(false)
  }

  function handleClick() {
    setOpen(true)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setStudyList(e.target.value)
  }

  function handleTerm(e: SelectChangeEvent<string>) {
    setTerm(e.target.value)
  }

  return (
    <>
      <Button color="inherit" startIcon={<PostAddIcon />} onClick={handleClick}>
        Import
      </Button>
      <Dialog open={open}>
        <DialogTitle>Import Schedule</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Paste the contents of your Study List below to import it into AntAlmanac.
            <br />
            To find your Study List, go to <a href={'https://www.reg.uci.edu/cgi-bin/webreg-redirect.sh'}>
              WebReg
            </a> or <a href={'https://www.reg.uci.edu/access/student/welcome/'}>StudentAccess</a>, and click on Study
            List once you&apos;ve logged in. Copy everything below the column names (Code, Dept, etc.) under the
            Enrolled Classes section.
            {/* &apos; is an apostrophe (') */}
          </DialogContentText>
          <TextField
            fullWidth
            onChange={handleChange}
            autoFocus
            margin="dense"
            type="text"
            placeholder="Paste here"
            label="Study List"
          />
          <FormControl fullWidth>
            <InputLabel>Term</InputLabel>
            <Select value={term} onChange={handleTerm} label="Term">
              {termData.map((term, index) => (
                <MenuItem key={index} value={term.shortName}>
                  {term.longName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color={isDarkMode() ? 'inherit' : 'primary'}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
