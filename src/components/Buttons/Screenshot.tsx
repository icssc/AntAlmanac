import html2canvas from 'html2canvas'
import { useRef } from 'react'
import { Button, Link, Tooltip, useTheme } from '@mui/material'
import { Panorama as PanoramaIcon } from '@mui/icons-material'
import { analyticsEnum, logAnalytics } from '$lib/analytics'

interface Props {
  /**
   * provide a React ref to the element to screenshot
   */
  imgRef: React.RefObject<HTMLElement>
}

/**
 * button that downloads a screenshot of the element referenced by imgRef
 */
export default function ScreenshotButton(props: Props) {
  const theme = useTheme()

  /**
   * ref to an invisible link used to download the screenshot
   */
  const ref = useRef<HTMLAnchorElement>(null)

  async function handleClick() {
    if (!props.imgRef.current || !ref.current) {
      return
    }

    logAnalytics({
      category: analyticsEnum.calendar.title,
      action: analyticsEnum.calendar.actions.SCREENSHOT,
    })

    const canvas = await html2canvas(props.imgRef.current, {
      scale: 2.5,
      backgroundColor: theme.palette.background.paper,
    })

    ref.current.href = canvas.toDataURL('image/png')
    ref.current.download = 'Schedule.png'
    ref.current.click()
  }

  return (
    <>
      <Tooltip title="Get a screenshot of your schedule">
        <Button onClick={handleClick} variant="outlined" size="small" startIcon={<PanoramaIcon fontSize="small" />}>
          Screenshot
        </Button>
      </Tooltip>
      <Link sx={{ display: 'none' }} ref={ref} />
    </>
  )
}
