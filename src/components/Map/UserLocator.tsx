import L from 'leaflet'
import 'leaflet.locatecontrol'
import { useEffect } from 'react'
import { createElementHook, createElementObject, useLeafletContext } from '@react-leaflet/core'
import type { LeafletContextInterface } from '@react-leaflet/core'

function createUserLocator(_props: any, context: LeafletContextInterface) {
  const userLocator = createElementObject(
    L.control.locate({
      position: 'topleft',
      flyTo: true,
      strings: {
        title: 'Look for your lost soul',
      },
    }),
    context)

    return userLocator
}

/**
 * we use react-leaflet's core API to manage lifecycle of leaflet elements properly
 * @see {@link https://react-leaflet.js.org/docs/core-architecture/#element-hook-factory}
 */
const useUserLocator = createElementHook(createUserLocator)

/**
 * initializes leaflet locator to locate the user
 */
export default function UserLocator() {
  const context = useLeafletContext()
  const elementRef = useUserLocator(null, context)

  useEffect(() => {
    elementRef.current.instance.addTo(context.map)
    return () => {
      elementRef.current.instance.remove()
    }
  }, [])

  return null
}
