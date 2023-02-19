import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { useSearchStore } from '$stores/search'
import departments from '$lib/departments'

export default function DepartmentSelect() {
  const dept = useSearchStore((store) => store.form.deptValue)
  const setField = useSearchStore((store) => store.setField)

  function handleChange(e: SelectChangeEvent<string>) {
    setField('deptLabel', e.target.value)
    setField('deptValue', e.target.value)
  }

  return (
    <FormControl fullWidth>
      <InputLabel>Department</InputLabel>
      <Select value={dept} onChange={handleChange} label="Department">
        {departments.map((dept) => (
          <MenuItem key={dept.deptValue} value={dept.deptValue}>
            {dept.deptLabel}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
