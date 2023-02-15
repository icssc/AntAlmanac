import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { useSearchStore } from '$stores/search'
import geList from '$lib/ge'

export default function GeSelect() {
  const ge = useSearchStore((store) => store.form.ge)
  const setField = useSearchStore((store) => store.setField)

  function handleChange(e: SelectChangeEvent<string>) {
    setField('ge', e.target.value)
  }

  return (
    <FormControl fullWidth>
      <InputLabel>General Education</InputLabel>
      <Select value={ge} onChange={handleChange} label="General Education">
        {geList.map((ge) => (
          <MenuItem key={ge.value} value={ge.value}>
            {ge.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
