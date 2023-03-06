import { useState } from 'react'
import { SketchPicker } from 'react-color'
import type { ColorResult } from 'react-color'
import { ColorLens } from '@mui/icons-material'
import { IconButton, Popover, Tooltip } from '@mui/material'
import { changeCourseColor } from '$stores/schedule/course'
import { changeCustomEventColor } from '$stores/schedule/custom'
import { analyticsEnum, logAnalytics } from '$lib/analytics'

interface Props {
  color: string
  analyticsCategory: string
  term?: string

  /**
   * true: this object has a customEventID
   * false: this object has a term and sectionCode.
   */
  isCustomEvent?: boolean

  /**
   * Not undefined when isCustomEvent is true
   */
  customEventID?: number

  /**
   * Not undefined  when isCustomEvent is false
   */
  sectionCode?: string
}

/**
 * color picker button that changes the color of the provided course or custom event
 */
export default function ColorPicker({
  color,
  analyticsCategory,
  term,
  isCustomEvent,
  customEventID,
  sectionCode,
}: Props) {
  const [value, setValue] = useState(color)
  const [anchorEl, setAnchorEl] = useState<HTMLElement>()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setAnchorEl(e?.currentTarget)
    logAnalytics({
      category: analyticsCategory,
      action: analyticsEnum.calendar.actions.CHANGE_COURSE_COLOR,
    })
  }

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    setAnchorEl(undefined)
  }

  const handleChange = (e: ColorResult) => {
    if (isCustomEvent && customEventID) {
      changeCustomEventColor(customEventID, e.hex)
    }
    if (sectionCode && term) {
      changeCourseColor(sectionCode, term, e.hex)
    }
    setValue(e.hex)
  }

  return (
    <>
      <Tooltip title="Change Event Color">
        <IconButton sx={{ color: value }} onClick={handleClick} size="large">
          <ColorLens fontSize="small" />
        </IconButton>
      </Tooltip>
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <SketchPicker color={value} onChange={handleChange} />
      </Popover>
    </>
  )
}
