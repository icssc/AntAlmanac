import { Fragment, useCallback, useRef } from 'react'
import { Box, Divider, List, ListItem, ListItemText, Paper, Skeleton, Typography } from '@mui/material'
import trpc from '$lib/trpc'

/**
 * button that opens a modal with the latest unread news items
 */
export default function Home() {
  const dateStr = typeof Storage === 'undefined' ? undefined : window.localStorage.getItem('newsDate')
  const date = dateStr ? new Date(dateStr) : undefined

  const query = trpc.news.findAll.useInfiniteQuery(
    { date },
    {
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
    },
    [query.data]
  )

  return (
    <>
      <Paper>
        {!query.isLoading && query.data?.pages.length && (
          // LOADED and DATA
          <List sx={{ width: 300, height: 100, overflowY: 'auto' }}>
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
        )}
      </Paper>
    </>
  )
}
