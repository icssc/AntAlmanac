import Leaflet from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import { Button, Link, Typography } from '@mui/material'
import { DirectionsWalk as DirectionsWalkIcon } from '@mui/icons-material'

const GOOGLE_MAPS_URL = 'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination='
const IMAGE_CMS_URL = 'https://cms.concept3d.com/map/lib/image-cache/i.php?mapId=463&image='

/**
 * returns a leaflet DivIcon that can replace the marker's default blue icon
 */
function getMarkerIcon(color = '', stackIndex = 1, label: any = '') {
  return Leaflet.divIcon({
    /**
     * Adds offset for marker for stacking markers
     */
    iconAnchor: [0, 14 + 16 * stackIndex],

    /** Adds offset for popup for stacking markers
     */
    popupAnchor: [0, -21 - 16 * stackIndex],

    /**
     * removes styling added by leaflet classes
     */
    className: '',

    /**
     * what the marker will look like
     */
    html: `<div style="position:relative;">
             <span style="background-color: ${color};
                   width: 1.75rem;
                   height: 1.75rem;
                   display: block;
                   left: -1rem;
                   top: -1rem;
                   position: absolute;
                   border-radius: 1.9rem 1.9rem 0;
                   transform: rotate(45deg);
                   border: 1px solid #FFFFFF">
             </span>
             <div style="position: absolute;
                         width: 1.75rem;
                         height: 1.75rem;
                         left: -1rem;
                         top: -0.75rem;
                         text-align: center; 
                         color: white" >
                   ${label || ''}
             </div>
           </div>`,
  })
}

interface Props {
  lat: number
  lng: number
  color?: string
  image?: string
  location?: string
  acronym?: string
  stackIndex?: number
  label?: any
  children?: React.ReactNode
}

/**
 * returns a custom map marker + popup with course info
 */
export default function CourseMarker({
  lat,
  lng,
  color,
  image,
  location,
  acronym,
  stackIndex,
  label,
  children,
}: Props) {
  return (
    <Marker position={[lat, lng]} icon={getMarkerIcon(color, stackIndex, label)} zIndexOffset={stackIndex}>
      <Popup>
        {location ? (
          <Link
            href={`http://www.classrooms.uci.edu/classrooms/${acronym}`}
            target="_blank"
            rel="noopener noreferrer"
            textAlign="center"
          >
            {location}
          </Link>
        ) : (
          <Typography>{location}</Typography>
        )}

        {image && <img src={`${IMAGE_CMS_URL}${image}`} alt="Building Snapshot" style={{ width: '100%' }} />}

        {children}

        <Button
          variant="contained"
          color="inherit"
          startIcon={<DirectionsWalkIcon />}
          href={`${GOOGLE_MAPS_URL}${lat},${lng}`}
          target="_blank"
          sx={{ alignSelf: 'center' }}
        >
          Directions
        </Button>
      </Popup>
    </Marker>
  )
}
