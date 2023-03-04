import { useState, useEffect } from 'react'

/**
 * script status
 */
type Status = 'loading' | 'idle' | 'loading' | 'ready' | 'error'

/**
 * dynamically load a script on the page
 * @see {@link https://github.com/MSalmanTariq/react-google-one-tap-login/blob/main/src/useScript.ts}
 */
export default function useScript(src: string) {
  const [status, setStatus] = useState<Status>(src ? 'loading' : 'idle')

  useEffect(() => {
    /**
     * attempt find existing script element: may have been added by another intance of this hook
     */
    let script: HTMLScriptElement | null = document.querySelector(`script[src="${src}"]`)

    if (script) {
      setStatus((script.getAttribute('data-status') || 'idle') as Status)
    } else {
      script = document.createElement('script')
      script.src = src
      script.async = true
      script.setAttribute('data-status', 'loading')
      document.body.appendChild(script)

      /**
       * Store status in attribute on script
       * This can be read by other instances of this hook
       */
      const setAttributeFromEvent = (event: Event) => {
        if (script) {
          script.setAttribute('data-status', event.type === 'load' ? 'ready' : 'error')
        }
      }

      script.addEventListener('load', setAttributeFromEvent)
      script.addEventListener('error', setAttributeFromEvent)
    }

    const setStateFromEvent = (event: Event) => {
      setStatus(event.type === 'load' ? 'ready' : 'error')
    }

    // Add event listeners to script
    script.addEventListener('load', setStateFromEvent)
    script.addEventListener('error', setStateFromEvent)

    // Remove event listeners from script on cleanup
    return () => {
      if (script) {
        script.removeEventListener('load', setStateFromEvent)
        script.removeEventListener('error', setStateFromEvent)
      }
    }
  }, [src])

  return status
}
