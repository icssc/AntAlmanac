import { useState } from 'react'
import { Notifications as NotificationsIcon } from '@mui/icons-material'
import { Box, Button, Divider, IconButton, List, ListItem, Paper, Popover, Tooltip, Typography } from '@mui/material'
import { analyticsEnum, logAnalytics } from '$lib/analytics'

/**
 * notification bell that opens a modal with notifications
 */
export default function Notifications() {
  const [anchorEl, setAnchorEl] = useState<Element>()

  const handleOpen = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setAnchorEl(e.currentTarget)
    logAnalytics({
      category: analyticsEnum.nav.title,
      action: analyticsEnum.nav.actions.CLICK_NOTIFICATIONS,
    })
  }

  const handleClose = (_e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setAnchorEl(undefined)
  }

  const query: any = {}

  return (
    <>
      <Tooltip title="Notifications Registered">
        <IconButton onClick={handleOpen}>
          <NotificationsIcon />
        </IconButton>
      </Tooltip>

      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Paper>
          <Box>
            <Typography variant="h5" sx={{ m: 2 }}>
              Notifications You&apos;ve Registered For
            </Typography>
            <Divider sx={{ my: 1 }} />
            {query.data?.phoneNumber ? (
              <Box>
                Watchlist for {query.data.phoneNumber}:
                <List>
                  {query.data.smsNotificationList.map((section, index) => (
                    <ListItem key={index}>
                      {section.courseTitle}: {section.sectionCode}
                    </ListItem>
                  ))}
                </List>
              </Box>
            ) : (
              <Typography sx={{ m: 2 }}>You have not registered for SMS notifications on this PC!</Typography>
            )}
            <Divider sx={{ my: 1 }} />
          </Box>

          <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose}>Close</Button>
          </Box>
        </Paper>
      </Popover>
    </>
  )
}
