import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { useSearchStore } from '$stores/search'
import { termData } from '$lib/termData'

export default function TermSelect() {
  const term = useSearchStore((store) => store.form.term)
  const setField = useSearchStore((store) => store.setField)

  function handleChange(e: SelectChangeEvent<string>) {
    setField('term', e.target.value)
  }

  return (
    <FormControl fullWidth>
      <InputLabel>Term</InputLabel>
      <Select value={term} onChange={handleChange} label="Term">
        {termData.map((term, index) => (
          <MenuItem key={index} value={term.shortName}>
            {term.longName}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
