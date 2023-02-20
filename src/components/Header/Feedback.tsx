import { Fragment } from 'react'
import { ListItem, ListItemButton, ListItemIcon, ListItemText, MenuItem, Tooltip } from '@mui/material'
import { Assignment as AssignmentIcon } from '@mui/icons-material'

interface Props {
  /**
   * whether this button is in a MUI List; otherwise assumed to be in Menu
   */
  list?: boolean
}

/**
 * button that links to a feedback form
 */
export default function Feedback(props?: Props) {
  const WrapperElement = props?.list ? ListItem : Fragment
  const ClickElement = props?.list ? ListItemButton : MenuItem
  const clickerProps = props?.list ? {} : { component: 'a', dense: true }

  return (
    <WrapperElement>
      <Tooltip title="Give Us Feedback">
        <ClickElement {...clickerProps} href="https://forms.gle/k81f2aNdpdQYeKK8A" target="_blank">
          <ListItemIcon>
            <AssignmentIcon />
          </ListItemIcon>
          <ListItemText>Feedback</ListItemText>
        </ClickElement>
      </Tooltip>
    </WrapperElement>
  )
}
