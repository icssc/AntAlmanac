import { Fragment, useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Tooltip,
} from '@mui/material'
import { Info as InfoIcon } from '@mui/icons-material'
import { analyticsEnum, logAnalytics } from '$lib/analytics'

interface Props {
  /**
   * whether this button is in a MUI List and should be a ListItem;
   * otherwise assumed to be in Menu and renders as MenuItem
   */
  listItem?: boolean
}

/**
 * button that opens a modal with information about the project
 */
export default function About(props: Props) {
  const [open, setOpen] = useState(false)

  function handleOpen() {
    setOpen(true)
    logAnalytics({
      category: analyticsEnum.nav.title,
      action: analyticsEnum.nav.actions.CLICK_ABOUT,
    })
  }

  function handleClose() {
    setOpen(false)
  }

  const WrapperElement = props.listItem ? ListItem : Fragment
  const ClickElement = props.listItem ? ListItemButton : MenuItem

  return (
    <>
      <WrapperElement>
        <Tooltip title="About Us">
          <ClickElement onClick={handleOpen} dense={!props?.listItem} href="">
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText>About</ListItemText>
          </ClickElement>
        </Tooltip>
      </WrapperElement>

      <Dialog open={open}>
        <DialogTitle>About</DialogTitle>

        <DialogContent>
          <DialogContentText>
            AntAlmanac is a schedule planning tool for UCI students.
            <br />
            <br />
            Interested in helping out? Join our{' '}
            <Link target="_blank" href="https://discord.gg/GzF76D7UhY" color="secondary">
              Discord
            </Link>{' '}
            or checkout the{' '}
            <Link target="_blank" href="https://github.com/icssc/AntAlmanac" color="secondary">
              code on GitHub
            </Link>
            .
            <br />
            <br />
            This website is maintained by the{' '}
            <Link target="_blank" href="https://studentcouncil.ics.uci.edu/" color="secondary">
              ICS Student Council
            </Link>{' '}
            Projects Committee and built by students from the UCI community.
            <br />
            <br />
            <Link target="_blank" href="https://github.com/icssc/AntAlmanac/contributors">
              <Box
                component="img"
                src="https://contrib.rocks/image?repo=icssc/antalmanac"
                width={'100%'}
                alt="AntAlmanac Contributors"
              />
            </Link>
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
