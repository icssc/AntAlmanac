import { useState } from 'react'
import { SketchPicker } from 'react-color'
import type { ColorResult } from 'react-color'
import { ColorLens } from '@mui/icons-material'
import { IconButton, Popover } from '@mui/material'
import { changeCourseColor } from '$stores/schedule/course'
import { changeCustomEventColor } from '$stores/schedule/custom'
import analyticsEnum, { logAnalytics } from '$lib/analytics'

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
   * defined when isCustomEvent === true
   */
  customEventID?: number

  /**
   * defined when isCustomEvent === false
   */
  sectionCode?: string
}

/**
 * color picker icon button that changes color of a course or custom event
 */
export default function ColorPicker(props: Props) {
  const [color, setColor] = useState(props.color)
  const [anchorEl, setAnchorEl] = useState<HTMLElement>()

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(e?.currentTarget)
    logAnalytics({
      category: props.analyticsCategory,
      action: analyticsEnum.calendar.actions.CHANGE_COURSE_COLOR,
    })
  }

  function handleClose() {
    setAnchorEl(undefined)
  }

  function handleColorChange(e: ColorResult) {
    if (props.customEventID) {
      changeCustomEventColor(props.customEventID, e.hex)
    }
    if (props.sectionCode && props.term) {
      changeCourseColor(props.sectionCode, props.term, e.hex)
    }
    setColor(e.hex)
  }

  return (
    <>
      <IconButton sx={{ color }} onClick={handleClick} size="large">
        <ColorLens fontSize="small" />
      </IconButton>
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <SketchPicker color={color} onChange={handleColorChange} />
      </Popover>
    </>
  )
}
