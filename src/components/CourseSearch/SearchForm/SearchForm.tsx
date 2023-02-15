import { Box, Button } from '@mui/material'
import { useSearchStore } from '$stores/search'
import TermSelect from './TermSelect'
import FuzzySearch from './FuzzySearch'
import DepartmentSelect from './DepartmentSelect'
import GeSelect from './GeSelect'
import CourseNumberInput from './CourseNumberInput'
import SectionCodeInput from './SectionCodeInput'

export default function SearchForm() {
  const setShowResults = useSearchStore((store) => store.setShowResults)

  function handleClick() {
    setShowResults(true)
  }

  return (
    <Box sx={{ padding: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <TermSelect />
      <FuzzySearch />
      <DepartmentSelect />
      <GeSelect />
      <CourseNumberInput />
      <SectionCodeInput />
      <Button onClick={handleClick} variant="contained">
        Search
      </Button>
    </Box>
  )
}
