import { TextField } from '@mui/material'
import { useSearchStore } from '$stores/search'

export default function CourseNumberInput() {
  const courseNumber = useSearchStore((store) => store.form.courseNumber)
  const setField = useSearchStore((store) => store.setField)

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setField('courseNumber', e.target.value)
  }

  return (
    <TextField
      label="Course Number(s)"
      type="search"
      value={courseNumber}
      onChange={handleChange}
      helperText="ex. 6B, 17, 30-40"
    />
  )
}
