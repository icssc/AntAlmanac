import { useEffect, useRef, useState } from 'react'
import Split from 'react-split'
import { Box, Tab, Tabs, useMediaQuery, useTheme } from '@mui/material'
import {
  FormatListBulleted as BulletListIcon,
  MoreVert as MoreVertIcon,
  MyLocation as MyLocationIcon,
  Search as SearchIcon,
} from '@mui/icons-material'
import useInitializeSchedule from '$hooks/useInitializeSchedule'
import Calendar from '$components/Calendar'
import CourseSearch from '$components/CourseSearch'
import AddedCourses from '$components/AddedCourses'
import Map from '$components/Map'

/**
 * home page
 */
export default function Home() {
  useInitializeSchedule()

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileTab, setMobileTab] = useState(0)
  const [tab, setTab] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  /**
   * lol
   */
  useEffect(() => {
    if (ref.current) {
      document.querySelector('.gutter')?.appendChild(ref.current)
    }
  }, [])

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
              <Tabs value={tab} onChange={handleTabChange} variant="fullWidth" sx={{ height: 48 }}>
                <Tab
                  label="Course Search"
                  icon={<SearchIcon />}
                  iconPosition="start"
                  sx={{ minHeight: 0, height: 48 }}
                />
                <Tab
                  label="Added Courses"
                  icon={<BulletListIcon />}
                  iconPosition="start"
                  sx={{ minHeight: 0, height: 48 }}
                />
                <Tab label="Map" icon={<MyLocationIcon />} iconPosition="start" sx={{ minHeight: 0, height: 48 }} />
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
    <>
      <Split
        sizes={[50, 50]}
        minSize={100}
        expandToMin={false}
        gutterSize={10}
        gutterAlign="center"
        snapOffset={30}
        dragInterval={1}
        direction="horizontal"
        cursor="col-resize"
        style={{ display: 'flex' }}
        gutterStyle={() => ({
          backgroundColor: theme.palette.primary.main,
          width: '10px'
        })}
      >
        <Box sx={{ overflowY: 'auto' }} onDragOver={(e) => e.preventDefault()}>
          <Calendar />
        </Box>

        {/** the Box with Map MUST be flexed; since the Map uses flexGrow to size its height */}
        <Box
          sx={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
          onDragOver={(e) => e.preventDefault()}
        >
          <Tabs value={tab} onChange={handleTabChange} variant="fullWidth" sx={{ height: 48 }}>
            <Tab label="Course Search" icon={<SearchIcon />} iconPosition="start" sx={{ minHeight: 0, height: 48 }} />
            <Tab
              label="Added Courses"
              icon={<BulletListIcon />}
              iconPosition="start"
              sx={{ minHeight: 0, height: 48 }}
            />
            <Tab label="Map" icon={<MyLocationIcon />} iconPosition="start" sx={{ minHeight: 0, height: 48 }} />
          </Tabs>
          {tab === 0 && <CourseSearch />}
          {tab === 1 && <AddedCourses />}
          {tab === 2 && <Map />}
        </Box>
      </Split>

      <Box ref={ref}>
        <MoreVertIcon fontSize="small" />
      </Box>
    </>
  )
}
