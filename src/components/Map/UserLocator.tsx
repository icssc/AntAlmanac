import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.locatecontrol'

/**
 * initializes leaflet locator to locate the user
 */
export default function UserLocator() {
  const map = useMap()

  useEffect(() => {
    const lc = L.control.locate({
      position: 'topleft',
      flyTo: true,
      strings: {
        title: 'Look for your lost soul',
      },
    })

    lc.addTo(map)

    return () => {
      // do we have to remove the control from the map?
      // it throws an error if I try to;
      // it works fine without removing, but in dev mode it'll show up twice 
      // because strict mode will run useEffect twice
      // lc.remove()
    }
  }, [])

  return null
}
