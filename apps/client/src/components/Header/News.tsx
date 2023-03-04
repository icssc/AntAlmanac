import { Fragment, useCallback, useRef, useState } from 'react'
import {
  Badge,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Popover,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material'
import { Newspaper as NewspaperIcon } from '@mui/icons-material'
import { analyticsEnum, logAnalytics } from '$lib/analytics'
import trpc from '$lib/trpc'

/**
 * button that opens a modal with the latest unread news items
 */
export default function News() {
  const [anchorEl, setAnchorEl] = useState<Element>()
  const [showDot, setShowDot] = useState(false)

  /**
   * get saved date of latest news item read
   */
  const dateStr = typeof Storage === 'undefined' ? undefined : window.localStorage.getItem('newsDate')

  const query = trpc.news.findAll.useInfiniteQuery(
    { date: dateStr ? new Date(dateStr) : undefined },
    {
      onSuccess(data) {
        const serverDate = data.pages.at(-1)?.news?.[0]?.createdAt
        if (dateStr == null || (serverDate && new Date(dateStr) < serverDate)) {
          setShowDot(true)
        }
      },
      getNextPageParam(lastPage) {
        return lastPage.nextCursor
      },
    }
  )

  const observer = useRef<IntersectionObserver>()

  const lastElementRef = useCallback(
    (element: HTMLElement | null) => {
      if (observer.current) {
        observer.current.disconnect()
      }

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && query.hasNextPage) {
          query.fetchNextPage()
        }
      })

      if (element && query.hasNextPage) {
        observer.current.observe(element)
      }
    }, [query.data])

  const handleOpen = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
    e.stopPropagation()
    setAnchorEl(e.currentTarget)
    logAnalytics({
      category: analyticsEnum.nav.title,
      action: analyticsEnum.nav.actions.CLICK_NEWS,
    })
  }

  const handleClose = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
    e.stopPropagation()
    setAnchorEl(undefined)
  }

  /**
   * upon closing the popover, store the date of the most recent news item
   */
  const saveLatestRead = () => {
    if (typeof Storage !== 'undefined' && query.data?.pages?.at(-1)?.news?.[0]) {
      window.localStorage.setItem('newsDate', query.data.pages.at(-1)?.news[0].createdAt.toLocaleString() || '')
    }
    setShowDot(false)
  }

  return (
    <>
      <Tooltip title="See Latest Updates">
        <IconButton onClick={handleOpen}>
          <Badge variant="dot" color="success" invisible={!showDot}>
            <NewspaperIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionProps={{ onExited: saveLatestRead }}
      >
        <Paper sx={{ width: 300 }}>
          {query.isLoading && (
            // LOADING
            <Box sx={{ padding: 2 }}>
              <Skeleton variant="text" animation="wave" width="69.420%" />
              <Skeleton variant="text" animation="wave" />
              <Skeleton variant="text" animation="wave" width="42.069%" />
            </Box>
          )}
          {!query.isLoading && query.data?.pages.length ? (
            // LOADED and DATA
            <List sx={{ width: 300, height: 300, overflowY: 'auto' }} disablePadding dense>
              {query.data?.pages.map((page, i) => (
                <Fragment key={i}>
                  {page.news.map((news) => (
                    <Fragment key={news.id}>
                      <ListItem>
                        <ListItemText>
                          <Typography>{news.title}</Typography>
                          <Typography variant="body2">{news.body}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {news.createdAt.toLocaleString()}
                          </Typography>
                        </ListItemText>
                      </ListItem>
                      <Divider />
                    </Fragment>
                  ))}
                </Fragment>
              ))}
              {query.hasNextPage && <ListItem ref={lastElementRef}>Load More</ListItem>}
            </List>
          ) : (
            // LOADED and NO DATA
            <Typography variant="body2" padding={2}>
              No new announcements!
            </Typography>
          )}
        </Paper>
      </Popover>
    </>
  )
}
