import { Fragment, useState } from 'react'
import { Notifications as NotificationsIcon } from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Tooltip,
} from '@mui/material'
import { analyticsEnum, logAnalytics } from '$lib/analytics'

interface Props {
  /**
   * whether this button is in a MUI List and should be a ListItem;
   * otherwise assumed to be in Menu and renders as MenuItem
   */
  listItem?: boolean
}

/**
 * notification bell that opens a modal with notifications
 */
export default function Notifications(props?: Props) {
  const [open, setOpen] = useState(false)

  function handleOpen(_e: React.MouseEvent<HTMLElement, MouseEvent>) {
    setOpen(true)
    logAnalytics({
      category: analyticsEnum.nav.title,
      action: analyticsEnum.nav.actions.CLICK_NOTIFICATIONS,
    })
  }

  function handleClose(_e: React.MouseEvent<HTMLElement, MouseEvent>) {
    setOpen(false)
  }

  const WrapperElement = props?.listItem ? ListItem : Fragment
  const ClickElement = props?.listItem ? ListItemButton : MenuItem

  return (
    <WrapperElement>
      <Tooltip title="Notifications Registered">
        <ClickElement onClick={handleOpen} dense={!props?.listItem} href="">
          <ListItemIcon>
            <NotificationsIcon />
          </ListItemIcon>
          <ListItemText>Notifications</ListItemText>
        </ClickElement>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} scroll="paper">
        <DialogTitle>Notifications You&apos;ve Registered For</DialogTitle>

        <DialogContent dividers={true}>
          <DialogContentText>
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
              'You have not registered for SMS notifications on this PC!'
            )}
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </WrapperElement>
  )
}
