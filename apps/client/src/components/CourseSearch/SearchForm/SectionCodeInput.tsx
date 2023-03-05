import { TextField } from '@mui/material'
import { useSearchStore } from '$stores/search'

export default function SectionCodeInput() {
  const sectionCode = useSearchStore((store) => store.form.sectionCode)
  const setField = useSearchStore((store) => store.setField)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setField('sectionCode', e.target.value)
  }

  return (
    <TextField
      label="Course Code or Range"
      type="search"
      value={sectionCode}
      onChange={handleChange}
      helperText="ex. 14200, 29000-29100"
    />
  )
}
