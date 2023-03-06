import LazyLoad from 'react-lazyload'
import { Box, IconButton } from '@mui/material'
import { ArrowBack as ArrowBackIcon, Refresh as RefreshIcon } from '@mui/icons-material'
import { Course } from '@packages/schemas/schedule'
import { useSearchStore } from '$stores/search'
import useSettingsStore from '$stores/settings'
import { useWebsocQuery } from '$hooks/useWebsocQuery'
import Schedule from '$components/Schedule'
import { useScheduleStore } from '$stores/schedule'
import type { AACourse, AASection, Department, School, WebsocResponse } from '$lib/peterportal.types'

/**
 * flattens the websoc response
 */
function flattenSOCObject(SOCObject: WebsocResponse, courses: Course[] = []) {
  const courseColors = courses.reduce((accumulator, { section }) => {
    accumulator[section.sectionCode] = section.color
    return accumulator
  }, {} as Record<string, string>)

  const reduced = SOCObject?.schools?.reduce((accumulator, school) => {
    accumulator.push(school)
    school.departments.forEach((dept) => {
      accumulator.push(dept)
      dept.courses.forEach((course) => {
        course.sections.forEach((section) => {
          // eslint-disable-next-line no-param-reassign
          ;(section as AASection).color = courseColors[section.sectionCode]
        })
        accumulator.push(course as AACourse)
      })
    })
    return accumulator
  }, [] as (School | Department | AACourse)[])

  return reduced || []
}

/**
 * renders the list of course search results
 */
export default function CourseList() {
  const { form, getParams, showResults, setShowResults } = useSearchStore()
  const { schedules, scheduleIndex } = useScheduleStore()
  const { isDarkMode } = useSettingsStore()

  const courses = schedules[scheduleIndex]?.courses
  const query = useWebsocQuery(getParams(), { enabled: showResults })
  const transformedData = query?.data ? flattenSOCObject(query.data, courses) : []

  const noResultsSrc = isDarkMode ? '/no_results/dark.png' : '/no_results/light.png'
  const loadingSrc = isDarkMode ? '/loading/dark.gif' : '/loading/light.gif'

  /**
   * whether course body needs to manually search for more info
   * @remarks prop drilling goes brrr
   */
  const supplemental = form.ge !== 'ANY'

  const handleRefresh = () => {
    query.refetch()
  }

  const handleBack = () => {
    setShowResults(false)
  }

  return (
    <Box sx={{ padding: 2 }}>
      <Box sx={{ padding: 1 }}>
        <IconButton onClick={handleBack} size="large">
          <ArrowBackIcon />
        </IconButton>
        <IconButton onClick={handleRefresh} size="large">
          <RefreshIcon />
        </IconButton>
      </Box>
      {!query.isFetched && (
        <Box
          sx={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box component="img" src={loadingSrc} alt="Loading!" />
        </Box>
      )}
      {query.isFetched &&
        (transformedData.length ? (
          <Box>
            {transformedData.map((data, index) => {
              const current = transformedData[index]
              const height = 'sections' in current && current.sections ? current.sections.length * 60 + 60 : 200
              return (
                // eslint-disable-next-line react/no-array-index-key
                <LazyLoad once key={index} height={height} offset={500} overflow>
                  <Schedule course={data} supplemental={supplemental} />
                </LazyLoad>
              )
            })}
          </Box>
        ) : (
          <Box
            sx={{
              height: '100%',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box component="img" src={noResultsSrc} alt="No results found :(" />
          </Box>
        ))}
    </Box>
  )
}
