import { Fragment, useState } from 'react'
import {
  Badge,
  Box,
  Divider,
  MenuItem,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Popover,
  Tooltip,
  Typography,
} from '@mui/material'
import { Skeleton } from '@mui/lab'
import { RssFeed as RssFeedIcon } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { NEWS_ENDPOINT } from '$lib/api/endpoints'
import { analyticsEnum, logAnalytics } from '$lib/analytics'

interface NewsItem {
  title: string
  body: string
  date: string
  _id: string
}

interface Props {
  /**
   * whether this button is in a MUI List and should be a ListItem;
   * otherwise assumed to be in Menu and renders as MenuItem
   */
  listItem?: boolean
}

/**
 * button that opens a modal with news items
 */
export default function News(props?: Props) {
  const [anchorEl, setAnchorEl] = useState<Element>()
  const [showDot, setShowDot] = useState(false)

  const query = useQuery({
    queryKey: [NEWS_ENDPOINT],

    async queryFn() {
      const newsItems = await fetch(NEWS_ENDPOINT).then((res) => res.json())
      const sortedNewsItems: NewsItem[] = newsItems.news.sort((a: NewsItem, b: NewsItem) =>
        a.date < b.date ? 1 : a.date > b.date ? 1 : 0
      )
      return sortedNewsItems
    },

    onSuccess(data) {
      if (typeof Storage == 'undefined' || !data.length) {
        return
      }
      const latestNewsId = data[0]['_id']
      const latestNewsIdChecked = window.localStorage.getItem('latestNewsIdChecked')
      if (latestNewsIdChecked == null || latestNewsIdChecked != latestNewsId) {
        setShowDot(true)
      }
      window.localStorage.setItem('latestNewsIdChecked', latestNewsId)
    },

    // TODO: add error handling
    onError(err) {
      console.log(err)
    },
  })

  function handleOpen(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    e.preventDefault()
    e.stopPropagation()
    setAnchorEl(e.currentTarget)
    logAnalytics({
      category: analyticsEnum.nav.title,
      action: analyticsEnum.nav.actions.CLICK_NEWS,
    })
  }

  function handleClose(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    e.preventDefault()
    e.stopPropagation()
    setAnchorEl(undefined)
  }

  const WrapperElement = props?.listItem ? ListItem : Fragment
  const ClickElement = props?.listItem ? ListItemButton : MenuItem

  return (
    <WrapperElement>
      <Tooltip title="See Latest Updates">
        <ClickElement onClick={handleOpen} dense={!props?.listItem} href="">
          <ListItemIcon>
            <Badge variant="dot" overlap="circular" color="error" invisible={!showDot}>
              <RssFeedIcon />
            </Badge>
          </ListItemIcon>
          <ListItemText>News</ListItemText>
        </ClickElement>
      </Tooltip>

      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Paper sx={{ width: 300 }}>
          {query.isLoading ? (
            // LOADING
            <Box sx={{ padding: 2 }}>
              <Skeleton variant="text" animation="wave" width="69.420%" />
              <Skeleton variant="text" animation="wave" />
              <Skeleton variant="text" animation="wave" width="42.069%" />
            </Box>
          ) : query.data?.length ? (
            // LOADED and DATA
            <List sx={{ width: 300, height: 300, overflowY: 'auto' }} disablePadding dense>
              {query.data?.map((newsItem, index) => (
                <Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={newsItem.title}
                      secondary={
                        <>
                          <Typography variant="body2">{newsItem.body}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {newsItem.date}
                          </Typography>
                        </>
                      }
                    />
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
    </WrapperElement>
  )
}
