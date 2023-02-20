import { useRef, useState } from 'react'
import { Box, Tab, Tabs, useMediaQuery, useTheme } from '@mui/material'
import Calendar from '$components/Calendar'
import CourseSearch from '$components/CourseSearch'
import AddedCourses from '$components/AddedCourses'
import Map from '$components/Map'

/**
 * home page
 */
export default function Home() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileTab, setMobileTab] = useState(0)
  const [tab, setTab] = useState(0)
  const [left, setLeft] = useState('50%')
  const [right, setRight] = useState('50%')
  const ref = useRef<HTMLDivElement>(null)

  /**
   * on mobile, switch between calendar and classes panel
   */
  function handleMobileTabChange(_event: React.SyntheticEvent, newValue: number) {
    setMobileTab(newValue)
  }

  /**
   * switch between tabs within the classes panel
   */
  function handleTabChange(_event: React.SyntheticEvent, newValue: number) {
    setTab(newValue)
  }

  function handleDrag(e: React.DragEvent<HTMLDivElement>) {
    if (!ref.current) {
      return
    }
    if (e.clientX) {
      setLeft(`${e.clientX}px`)
      setRight(`${ref.current.clientWidth - e.clientX}px`)
    }
  }

  /**
   * on mobile screen, only either the calendar or class panel can be visible at once
   */
  if (isMobile) {
    return (
      <>
        <Tabs value={mobileTab} onChange={handleMobileTabChange} variant="fullWidth">
          <Tab label="Calendar" />
          <Tab label="Courses" />
        </Tabs>
        <Box
          sx={{
            height: 'calc(100vh - 112px)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          {mobileTab === 0 && <Calendar />}
          {mobileTab === 1 && (
            <>
              <Tabs value={tab} onChange={handleTabChange} variant="fullWidth">
                <Tab label="Course Search" />
                <Tab label="Added Courses" />
                <Tab label="Map" />
              </Tabs>
              {tab === 0 && <CourseSearch />}
              {tab === 1 && <AddedCourses />}
              {tab === 2 && <Map />}
            </>
          )}
        </Box>
      </>
    )
  }

  /**
   * on larger than mobile, both panels are split
   */
  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }} ref={ref}>
      <Box sx={{ width: left, overflowY: 'auto' }} onDragOver={(e) => e.preventDefault()}>
        <Calendar />
      </Box>

      <Box
        sx={{
          width: 5,
          padding: 0,
          minWidth: 0,
          background: theme.palette.primary.main,
          height: '100%',
          cursor: 'col-resize',
        }}
        onDrag={handleDrag}
        onDragOver={(e) => e.preventDefault()}
        draggable
      />

      {/** the Box with Map MUST be flexed; since the Map uses flexGrow to size its height */}
      <Box
        sx={{ width: right, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
        onDragOver={(e) => e.preventDefault()}
      >
        <Tabs value={tab} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Course Search" />
          <Tab label="Added Courses" />
          <Tab label="Map" />
        </Tabs>
        {tab === 0 && <CourseSearch />}
        {tab === 1 && <AddedCourses />}
        {tab === 2 && <Map />}
      </Box>
    </Box>
  )
}
