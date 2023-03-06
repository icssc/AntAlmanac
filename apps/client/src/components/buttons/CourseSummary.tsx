import { useState } from 'react'
import { Box, Button, Popover, Typography } from '@mui/material'
import { InfoOutlined as InfoOutlinedIcon } from '@mui/icons-material'
import type { WebsocCourse } from 'peterportal-api-next-types'
import { useRestQuery } from '$hooks/useRestQuery'

interface Props {
  course: WebsocCourse
}

/**
 * button that opens a popup with all summary info about the course,
 * e.g. course description, prerequistes, etc.
 */
export default function CourseSummaryButton({ course }: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>()
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(undefined)
  }
  const courseId = encodeURIComponent(`${course.deptCode.replace(/\s/g, '')}${course.courseNumber.replace(/\s/g, '')}`)
  const query = useRestQuery(courseId)

  return (
    <>
      <Button
        variant="contained"
        size="small"
        onClick={handleClick}
        startIcon={<InfoOutlinedIcon />}
        sx={{ flexShrink: 0 }}
      >
        {`${course?.deptCode} ${course?.courseNumber} | ${course?.courseTitle}`}
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
