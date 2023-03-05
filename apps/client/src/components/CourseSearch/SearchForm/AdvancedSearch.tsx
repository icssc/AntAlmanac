import {
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { useSearchStore } from '$stores/search'
import type { FormValues } from '$stores/search'

export default function AdvancedSearch() {
  const form = useSearchStore((store) => store.form)
  const setField = useSearchStore((store) => store.setField)

  /**
   * returns function that will handle a text change event by setting the form field
   */
  function handleInput(key: keyof FormValues) {
    return (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | SelectChangeEvent<string>) => {
      setField(key, e.target.value)
    }
  }

  /**
   * handle toggling "ONLINE" courses
   */
  function handleToggle(_e: React.ChangeEvent<HTMLInputElement>, checked: boolean) {
    if (checked) {
      setField('building', 'ON')
      setField('room', 'LINE')
    } else {
      setField('building', '')
      setField('room', '')
    }
  }

  return (
    <FormGroup sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
      <TextField
        label="Instructor"
        value={form.instructor}
        onChange={handleInput('instructor')}
        helperText="Last name only"
      />

      <TextField label="Units" value={form.units} onChange={handleInput('units')} helperText="ex. 3, 4, or VAR" />

      <FormControl>
        <InputLabel>Class Full Option</InputLabel>
        <Select value={form.coursesFull} onChange={handleInput('coursesFull')} label="Class Full Option">
          <MenuItem value="ANY">Include all classes</MenuItem>
          <MenuItem value="SkipFullWaitlist">Include full courses if space on waitlist</MenuItem>
          <MenuItem value="SkipFull">Skip full courses</MenuItem>
          <MenuItem value="FullOnly">Show only full or waitlisted courses</MenuItem>
          <MenuItem value="Overenrolled">Show only over-enrolled courses</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="Starts After"
        value={form.startTime}
        onChange={handleInput('startTime')}
        sx={{ width: '130px' }}
      />

      <TextField label="Ends Before" value={form.endTime} onChange={handleInput('endTime')} sx={{ width: '130px' }} />

      <FormControlLabel label="Online Classes Only" control={<Switch onChange={handleToggle} />} />

      <TextField label="Building" value={form.building} onChange={handleInput('building')} />

      <TextField label="Room" value={form.room} onChange={handleInput('room')} />
    </FormGroup>
  )
}
