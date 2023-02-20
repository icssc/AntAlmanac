import { useState } from 'react'
import { Box, Button, Popover, Typography } from '@mui/material'
import { InfoOutlined as InfoOutlinedIcon } from '@mui/icons-material'
import { useRestQuery } from '$hooks/useRestQuery'
import type { AACourse } from '$lib/peterportal.types'

/**
 * button that opens a popup with all summary info about the course,
 * e.g. course description, prerequistes, etc.
 */
export default function CourseSummaryButton(props: { course: AACourse }) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }

  const courseId = encodeURIComponent(
    `${props.course.deptCode.replace(/\s/g, '')}${props.course.courseNumber.replace(/\s/g, '')}`
  )

  const query = useRestQuery(courseId)

  return (
    <>
      <Button variant="contained" color="white" size="small" onClick={handleClick} startIcon={<InfoOutlinedIcon />}>
        {`${props.course?.deptCode} ${props.course?.courseNumber} | ${props.course?.courseTitle}`}
      </Button>
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ maxWidth: 500, padding: 2 }}>
          <Typography fontWeight="bold">{query.data?.title}</Typography>
          <br />
          <Typography variant="body2">{query.data?.description}</Typography>
          {query.data?.prerequisite_text && (
            <>
              <br />
              <Typography variant="body2">Prerequisites: {query.data?.prerequisite_text}</Typography>
            </>
          )}
          {query.data?.prerequisite_for && (
            <>
              <br />
              <Typography variant="body2">Prerequisite for: {query.data?.prerequisite_for}</Typography>
            </>
          )}
          {query.data?.ge_list && (
            <>
              <br />
              <Typography variant="body2"> General Education Categories: {query.data?.ge_list}</Typography>
            </>
          )}
        </Box>
      </Popover>
    </>
  )
}
