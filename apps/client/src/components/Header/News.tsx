import { Fragment, useState } from 'react'
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

  const clientDateStr = typeof Storage === 'undefined' ? undefined : window.localStorage.getItem('newsDate')
  const clientDate = clientDateStr ? new Date(clientDateStr) : undefined

  const query = trpc.news.findAll.useQuery(clientDate, {
    onSuccess(data) {
      if (data.length) {
        const serverDate = data[0].date
        if (clientDateStr == null || new Date(clientDateStr) < serverDate) {
          setShowDot(true)
        }
      }
    },
  })

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

  const saveLatestRead = () => {
    if (typeof Storage !== 'undefined' && query.data?.[0]) {
      window.localStorage.setItem('newsDate', query.data[0].date.toLocaleString())
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
          {!query.isLoading && query.data?.length ? (
            // LOADED and DATA
            <List sx={{ width: 300, overflowY: 'auto' }} disablePadding dense>
              {query.data?.map(news => (
                <Fragment key={news.id}>
                  <ListItem>
                    <ListItemText>
                      <Typography>{news.title}</Typography>
                      <Typography variant="body2">{news.body}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {news.date.toLocaleString()}
                      </Typography>
                    </ListItemText>
                  </ListItem>
                  <Divider />
                </Fragment>
              ))}
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
