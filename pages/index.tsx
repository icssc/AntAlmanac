import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Box, Tab, Tabs, useMediaQuery } from '@mui/material'
const Calendar = dynamic(() => import('$components/Calendar'), { ssr: false })
const CourseSearch = dynamic(() => import('$components/CourseSearch'), { ssr: false })
const AddedCourses = dynamic(() => import('$components/AddedCourses'), { ssr: false })
const Map = dynamic(() => import('$components/Map'), { ssr: false })

/**
 * home page
 */
export default function Home() {
  const isMobileScreen = useMediaQuery('(max-width:750px)')
  const [mobileTab, setMobileTab] = useState(0)
  const [tab, setTab] = useState(0)

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
  if (isMobileScreen) {
    return (
      <>
        <Tabs value={mobileTab} onChange={handleMobileTabChange} variant="fullWidth">
          <Tab label="Calendar" />
          <Tab label="Courses" />
        </Tabs>
        <Box sx={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
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
    <Box sx={{ display: 'flex', height: 'calc(100vh - 100px)' }}>
      <Box sx={{ width: '50%', overflowY: 'auto' }}>
        <Calendar />
      </Box>
      {/** the Box with Map MUST be flexed; since the Map uses flexGrow to size its height */}
      <Box sx={{ width: '50%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
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
