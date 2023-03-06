import { useSnackbar } from 'notistack'
import { Delete as DeleteIcon } from '@mui/icons-material'
import {
  Box,
  Button,
  IconButton,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import { analyticsEnum, logAnalytics } from '$lib/analytics'
import { deleteCourse } from '$stores/schedule/course'
import type { CourseCalendarEvent } from '$stores/schedule/calendar'
import ColorPicker from '$components/buttons/ColorPicker'
import location_ids from '$lib/location_ids'

function genMapLink(location: string) {
  try {
    const locationId = location_ids[location.split(' ')[0] as keyof typeof location_ids]
    return `https://map.uci.edu/?id=463#!m/${locationId}`
  } catch (err) {
    return 'https://map.uci.edu/'
  }
}

interface Props {
  event: CourseCalendarEvent
  closePopover?: () => void
}

export default function CourseEventDetails({ event, closePopover }: Props) {
  const { term, instructors, sectionCode, title, finalExam, bldg } = event
  const { enqueueSnackbar } = useSnackbar()

  const handleClickCopy = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.stopPropagation()
    e.preventDefault()
    logAnalytics({
      category: analyticsEnum.calendar.title,
      action: analyticsEnum.calendar.actions.COPY_COURSE_CODE,
    })
    navigator.clipboard.writeText(sectionCode)
    enqueueSnackbar('Section code copied to clipboard', { variant: 'success' })
  }

  const handleDelete = () => {
    deleteCourse(sectionCode, term)
    logAnalytics({
      category: analyticsEnum.calendar.title,
      action: analyticsEnum.calendar.actions.DELETE_COURSE,
    })
    closePopover?.()
  }

  return (
    <Paper sx={{ padding: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography fontWeight={600} color="primary">
          {title}
        </Typography>
        <Tooltip title="Delete Course">
          <IconButton size="small" onClick={handleDelete}>
            <DeleteIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </Box>

      <TableContainer>
        <Table size="small" sx={{ '.MuiTableCell-root': { px: 0, py: 0.5, border: 'none' }, padding: 0 }}>
          <TableBody>
            <TableRow>
              <TableCell sx={{ verticalAlign: 'top' }}>Section code</TableCell>
              <Tooltip title="Click to copy course code" placement="right">
                <TableCell align="right">
                  <Button onClick={handleClickCopy} sx={{ p: 0 }}>
                    {sectionCode}
                  </Button>
                </TableCell>
              </Tooltip>
            </TableRow>

            <TableRow>
              <TableCell sx={{ verticalAlign: 'top' }}>Term</TableCell>
              <TableCell align="right">{term}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell sx={{ verticalAlign: 'top' }}>Instructors</TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'pre' }}>
                {instructors.join('\n')}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell sx={{ verticalAlign: 'top' }}>Location</TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'pre' }}>
                {bldg !== 'TBA' ? (
                  <Link href={genMapLink(bldg)} target="_blank" rel="noopener noreferrer">
                    {bldg}
                  </Link>
                ) : (
                  bldg
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Final</TableCell>
              <TableCell align="right">{finalExam}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Color</TableCell>
              <TableCell align="right">
                <ColorPicker
                  color={event.color}
                  isCustomEvent={event.isCustomEvent}
                  sectionCode={event.sectionCode}
                  analyticsCategory={analyticsEnum.calendar.title}
                  term={term}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
