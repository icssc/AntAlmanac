import dayjs from 'dayjs'
import { Fragment, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Badge, Box, Button, Divider, List, ListItem, Paper, Popover, Tooltip, Typography } from '@mui/material'
import { RssFeed } from '@mui/icons-material'
import { Skeleton } from '@mui/lab'
import analyticsEnum, { logAnalytics } from '$lib/analytics'
import { NEWS_ENDPOINT } from '$lib/api/endpoints'

/**
 * a news item returned by the API
 */
interface NewsItem {
  title: string
  body: string

  /**
   * TODO: what format is this in?
   */
  date: string

  /**
   * mongoose object id
   */
  _id: string
}

/**
 * button that opens a modal with news items
 */
export default function NewsModal() {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)
  const [showDot, setShowDot] = useState(false)

  function closePopper() {
    setAnchorEl(null)
  }

  const query = useQuery({
    queryKey: [NEWS_ENDPOINT],
    async queryFn() {
      const json = await fetch(NEWS_ENDPOINT).then((res) => res.json())
      const sortedNewsItems = json.news.sort((a: NewsItem, b: NewsItem) =>
        a.date < b.date ? 1 : a.date > b.date ? 1 : 0
      )
      if (typeof Storage !== 'undefined' && sortedNewsItems.length !== 0) {
        const idOfLatestNewsItem = sortedNewsItems[0]['_id']
        const idOfLatestCheckedNewsItem = window.localStorage.getItem('idOfLatestCheckedNewsItem')
        if (idOfLatestCheckedNewsItem === null || idOfLatestNewsItem !== idOfLatestCheckedNewsItem) {
          setShowDot(true)
        }
      }
      return sortedNewsItems as NewsItem[]
    },
  })

  function openPopup(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    logAnalytics({
      category: analyticsEnum.nav.title,
      action: analyticsEnum.nav.actions.CLICK_NEWS,
    })

    setAnchorEl(e.currentTarget)

    if (typeof Storage !== 'undefined' && query.data?.length) {
      window.localStorage.setItem('idOfLatestCheckedNewsItem', query.data[0]['_id'])
      setShowDot(false)
    }
  }

  return (
    <div>
      <Tooltip title="See latest updates">
        <Badge variant="dot" overlap="circular" color="error" invisible={!showDot} sx={{ right: '5%' }}>
          <Button onClick={openPopup} color="inherit" startIcon={<RssFeed />}>
            News
          </Button>
        </Badge>
      </Tooltip>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={closePopper}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Paper>
          <List sx={{ maxWidth: 300, maxHeight: 300 }} disablePadding dense>
            {query.isLoading ? (
              // LOADING
              <Box sx={{ padding: '4px' }}>
                <Box>
                  <Skeleton variant="text" animation="wave" height={30} width="50%" />
                </Box>
                <Box>
                  <Skeleton variant="text" animation="wave" />
                </Box>
                <Box>
                  <Skeleton variant="text" animation="wave" width="20%" />
                </Box>
              </Box>
            ) : query.data?.length ? (
              // LOADED and DATA
              query.data?.map((newsItem, index) => (
                <Fragment key={index}>
                  <ListItem alignItems="flex-start" sx={{ display: 'flex', flexDirection: 'column' }} dense>
                    <Typography variant="body1">{newsItem.title}</Typography>
                    <Typography variant="body2">{newsItem.body}</Typography>
                    <Typography variant="caption" gutterBottom color="textSecondary">
                      {dayjs(newsItem.date, 'MMMM Do YYYY', 'en-us').toString()}
                    </Typography>
                  </ListItem>
                  {index < query.data.length - 1 ? <Divider /> : null}
                </Fragment>
              ))
            ) : (
              // LOADED and NO DATA
              <ListItem alignItems="flex-start" sx={{ display: 'flex', flexDirection: 'column' }} dense>
                <Typography variant="body2" gutterBottom>
                  No new announcements!
                </Typography>
              </ListItem>
            )}
          </List>
        </Paper>
      </Popover>
    </div>
  )
}
