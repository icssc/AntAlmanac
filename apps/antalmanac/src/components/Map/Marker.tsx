import { forwardRef, type Ref } from 'react';
import Leaflet from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import { Box, Button, Link, Typography } from '@mui/material';
import { DirectionsWalk as DirectionsWalkIcon } from '@mui/icons-material';

const GOOGLE_MAPS_URL = 'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=';
const IMAGE_CMS_URL = 'https://cms.concept3d.com/map/lib/image-cache/i.php?mapId=463&image=';

/**
 * returns a leaflet DivIcon that can replace the marker's default blue icon
 */
function getMarkerIcon(color = '', stackIndex = 1, label: any = '') {
    return Leaflet.divIcon({
        /**
         * Adds offset to __marker__ for stacking markers.
         */
        iconAnchor: [0, 14 + 16 * stackIndex],

        /**
         * Adds offset to __popup__ for stacking markers.
         */
        popupAnchor: [0, -21 - 16 * stackIndex],

        /**
         * Removes styling added by leaflet classes.
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
    });
}

interface Props {
    lat: number;
    lng: number;
    color?: string;
    image?: string;
    location?: string;
    acronym?: string;
    stackIndex?: number;
    label?: any;
    children?: React.ReactNode;
}

/**
 * Custom map marker + popup with course info.
 */
const LocationMarker = forwardRef(
    ({ lat, lng, color, image, location, acronym, stackIndex, label, children }: Props, ref?: Ref<Leaflet.Marker>) => {
        return (
            <Marker
                ref={ref}
                position={[lat, lng]}
                icon={getMarkerIcon(color, stackIndex, label)}
                zIndexOffset={stackIndex}
            >
                <Popup>
                    <Box
                        sx={{
                            width: 200,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5,
                            justifyContent: 'center',
                            m: 2,
                        }}
                    >
                        <Box>
                            {location ? (
                                <Link
                                    href={`http://www.classrooms.uci.edu/classrooms/${acronym}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    textAlign="center"
                                    variant="h6"
                                >
                                    {location}
                                </Link>
                            ) : (
                                <Typography textAlign="center">{location}</Typography>
                            )}
                        </Box>

                        {image && (
                            <Box sx={{ my: 1, width: 200, height: 200 }}>
                                <Box
                                    component="img"
                                    src={`${IMAGE_CMS_URL}${image}`}
                                    alt="Building Snapshot"
                                    sx={{ width: 1, height: 1, objectFit: 'cover' }}
                                />
                            </Box>
                        )}

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
                    </Box>
                </Popup>
            </Marker>
        );
    }
);

LocationMarker.displayName = 'LocationMarker';

export default LocationMarker;
