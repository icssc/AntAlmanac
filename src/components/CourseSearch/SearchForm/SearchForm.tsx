import { useState } from 'react'
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Button,
  FormGroup,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import { ExpandMore as ExpandMoreIcon, Tune as TuneIcon } from '@mui/icons-material'
import { useSearchStore } from '$stores/search'
import TermSelect from './TermSelect'
import FuzzySearch from './FuzzySearch'
import DepartmentSelect from './DepartmentSelect'
import GeSelect from './GeSelect'
import CourseNumberInput from './CourseNumberInput'
import SectionCodeInput from './SectionCodeInput'
import AdvancedSearch from './AdvancedSearch'
import HelpBox from './HelpBox'
import PrivacyBanner from './PrivacyBanner'

export default function SearchForm() {
  const setShowResults = useSearchStore((store) => store.setShowResults)
  const reset = useSearchStore((store) => store.reset)

  const [showLegacySearch, setShowLegacySearch] = useState(false)

  function handleClick() {
    setShowResults(true)
  }

  function toggleShowLegacySearch() {
    setShowLegacySearch((prev) => !prev)
  }

  return (
    <Box sx={{ height: '100%', padding: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormGroup sx={{ display: 'flex', gap: 2 }}>
        <TermSelect />
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FuzzySearch />
          <Tooltip title="Manual Search">
            <IconButton onClick={toggleShowLegacySearch}>
              <TuneIcon></TuneIcon>
            </IconButton>
          </Tooltip>
        </Box>
      </FormGroup>

      {showLegacySearch && (
        <>
          <FormGroup sx={{ display: 'flex', gap: 2 }}>
            <DepartmentSelect />
            <GeSelect />
            <CourseNumberInput />
            <SectionCodeInput />
          </FormGroup>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Show Advanced Options</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <AdvancedSearch />
            </AccordionDetails>
          </Accordion>
          <Box sx={{ display: 'flex', gap: 4, my: 2 }}>
            <Button onClick={handleClick} variant="contained" sx={{ width: '50%' }}>
              Search
            </Button>
            <Button onClick={reset} sx={{ width: '50%' }} color="error" variant="contained">
              Reset
            </Button>
          </Box>
        </>
      )}

      <Box sx={{ flex: 1 }} />

      <HelpBox />
      <PrivacyBanner />
    </Box>
  )
}
