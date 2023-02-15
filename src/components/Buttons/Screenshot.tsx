import html2canvas from 'html2canvas'
import { useRef } from 'react'
import { Button, Link, Tooltip, useTheme } from '@mui/material'
import { analyticsEnum, logAnalytics } from '$lib/analytics'

/**
 * you can give it any component that accepts an onClick prop;
 * any additional props are forwarded to this component
 */
interface Props extends Record<string, any> {
  /**
   * provide a React ref to the element to screenshot
   */
  imgRef: React.RefObject<HTMLElement>

  component?: React.ComponentType
  children?: React.ReactNode
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

  const { component, children, imgRef, ...$$restProps } = props
  const ComponentToUse = component ?? Button

  async function handleClick() {
    if (!imgRef.current || !ref.current) {
      return
    }

    logAnalytics({
      category: analyticsEnum.calendar.title,
      action: analyticsEnum.calendar.actions.SCREENSHOT,
    })

    const canvas = await html2canvas(imgRef.current, {
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
        <ComponentToUse onClick={handleClick} {...$$restProps}>
          {children || 'Screenshot'}
        </ComponentToUse>
      </Tooltip>
      <Link sx={{ display: 'none' }} ref={ref} />
    </>
  )
}
