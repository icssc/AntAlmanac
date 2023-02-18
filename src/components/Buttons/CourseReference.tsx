import { useState } from 'react'
import { Button, Popover } from '@mui/material'
import analyticsEnum, { logAnalytics } from '$lib/analytics'

interface Props {
  title: string
  href?: string
  icon: React.ReactElement
  children?: React.ReactElement
  analyticsAction: string
}

/**
 * can link to another page with more info if href is provided,
 * or open popup with additional info about a course
 */
export default function CourseReferenceButton(props: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>()

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    logAnalytics({
      category: analyticsEnum.classSearch.title,
      action: props.analyticsAction,
    })
    if (props.href) {
      window.open(props.href)
    } else {
      setAnchorEl(event.currentTarget)
    }
  }

  function handleClose() {
    setAnchorEl(undefined)
  }

  return (
    <>
      <Button variant="contained" size="small" onClick={handleClick} startIcon={props.icon}>
        {props.title}
      </Button>
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {props.children}
      </Popover>
    </>
  )
}
