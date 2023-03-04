import { useState } from 'react'
import { NotificationsOutlined as NotificationsIcon } from '@mui/icons-material'
import { Box, IconButton, List, ListItem, Popover, Tooltip, Typography } from '@mui/material'
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

  const handleClose = () => {
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
        <Typography variant="h5" color="primary" fontWeight="600" sx={{ m: 2 }}>
          Registered Notifications
        </Typography>
        {query.data?.phoneNumber ? (
          <Box>
            Watchlist for {query.data.phoneNumber}:
            <List>
              {query.data.smsNotificationList.map((section) => (
                <ListItem key={section.sectionCode}>
                  {section.courseTitle}: {section.sectionCode}
                </ListItem>
              ))}
            </List>
          </Box>
        ) : (
          <Typography sx={{ m: 2 }}>You have not registered for SMS notifications on this PC!</Typography>
        )}
      </Popover>
    </>
  )
}
