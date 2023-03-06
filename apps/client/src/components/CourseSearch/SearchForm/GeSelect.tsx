import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { useSearchStore } from '$stores/search'

const geList: { value: string; label: string }[] = [
  { value: 'ANY', label: "All: Don't filter for GE" },
  { value: 'GE-1A', label: 'GE Ia (1a): Lower Division Writing' },
  { value: 'GE-1B', label: 'GE Ib (1b): Upper Division Writing' },
  { value: 'GE-2', label: 'GE II (2): Science and Technology' },
  { value: 'GE-3', label: 'GE III (3): Social and Behavioral Sciences' },
  { value: 'GE-4', label: 'GE IV (4): Arts and Humanities' },
  { value: 'GE-5A', label: 'GE Va (5a): Quantitative Literacy' },
  { value: 'GE-5B', label: 'GE Vb (5b): Formal Reasoning' },
  { value: 'GE-6', label: 'GE VI (6): Language other than English' },
  { value: 'GE-7', label: 'GE VII (7): Multicultural Studies' },
  { value: 'GE-8', label: 'GE VIII (8): International/Global Issues' },
]

export default function GeSelect() {
  const formGe = useSearchStore((store) => store.form.ge)
  const setField = useSearchStore((store) => store.setField)

  const handleChange = (e: SelectChangeEvent<string>) => {
    setField('ge', e.target.value)
  }

  return (
    <FormControl fullWidth>
      <InputLabel>General Education</InputLabel>
      <Select value={formGe} onChange={handleChange} label="General Education">
        {geList.map((ge) => (
          <MenuItem key={ge.value} value={ge.value}>
            {ge.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
