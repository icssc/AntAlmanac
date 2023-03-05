import { useState } from 'react'
import { Button, Popover } from '@mui/material'
import { analyticsEnum, logAnalytics } from '$lib/analytics'

interface Props {
  title: string
  href?: string
  icon: React.ReactElement
  children?: React.ReactElement
  analyticsAction: string
}

/**
 * button that can open a popup with additional specific info about the course,
 * or link to another page with more info (if href is provided)
 */
export default function CourseReferenceButton({ title, href, icon, children, analyticsAction }: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    logAnalytics({
      category: analyticsEnum.classSearch.title,
      action: analyticsAction,
    })
    if (href) {
      window.open(href)
    } else {
      setAnchorEl(event.currentTarget)
    }
  }

  const handleClose = () => {
    setAnchorEl(undefined)
  }

  return (
    <>
      <Button
        variant="contained"
        size="small"
        onClick={handleClick}
        startIcon={icon}
        sx={{ backgroundColor: '#385EB1', color: '#fff', flexShrink: 0 }}
      >
        {title}
      </Button>
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {children}
      </Popover>
    </>
  )
}
