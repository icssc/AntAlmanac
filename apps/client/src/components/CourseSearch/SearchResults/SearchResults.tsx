import LazyLoad from 'react-lazyload'
import { Box, IconButton } from '@mui/material'
import { ArrowBack as ArrowBackIcon, Refresh as RefreshIcon } from '@mui/icons-material'
import { useSearchStore } from '$stores/search'
import useSettingsStore from '$stores/settings'
import { useWebsocQuery } from '$hooks/useWebsocQuery'
import Schedule from '$components/Schedule'
// import type { AACourse, AASection, Department, School, WebsocResponse } from '$lib/peterportal.types'
import type { WebsocAPIResponse } from 'peterportal-api-next-types'

/**
 * renders the list of course search results
 */
export default function CourseList() {
  const { form, getParams, showResults, setShowResults } = useSearchStore()
  const { isDarkMode } = useSettingsStore()

  const query = useWebsocQuery(getParams(), { enabled: showResults })
  const transformedData: WebsocAPIResponse['schools'] = []

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
