import { forwardRef, type Ref } from 'react';
import Leaflet from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { DirectionsWalk as DirectionsWalkIcon, Info } from '@mui/icons-material';

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
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            width: 250,
                        }}
                    >
                        {image && (
                            <Box
                                height={150}
                                borderRadius={'0.75rem 0.75rem 0 0'}
                                component="img"
                                src={`${IMAGE_CMS_URL}${image}`}
                                alt="Building Snapshot"
                                sx={{
                                    objectFit: 'cover',
                                }}
                            />
                        )}

                        <Box display="flex" flexDirection="column" mx={2} my={1.25} gap={1}>
                            <Box display="flex" flexDirection="column" gap={0.5}>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                    <Typography fontSize={'1.25rem'} lineHeight={1.25} fontWeight={600}>
                                        {location}
                                    </Typography>
                                    {location && (
                                        <IconButton
                                            href={`http://www.classrooms.uci.edu/classrooms/${acronym}`}
                                            target="_blank"
                                            size="medium"
                                            sx={{ padding: 0 }}
                                        >
                                            <Info fontSize="large" color="primary" />
                                        </IconButton>
                                    )}
                                </Box>

                                {children}
                            </Box>

                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<DirectionsWalkIcon color="secondary" />}
                                href={`${GOOGLE_MAPS_URL}${lat},${lng}`}
                                target="_blank"
                                sx={{ alignSelf: 'center', width: '100%', borderRadius: '0.75rem' }}
                            >
                                <Typography
                                    color="secondary"
                                    fontSize={'1.25rem'}
                                    letterSpacing={1.25}
                                    fontWeight={500}
                                >
                                    Directions
                                </Typography>
                            </Button>
                        </Box>
                    </Box>
                </Popup>
            </Marker>
        );
    }
);

LocationMarker.displayName = 'LocationMarker';

export default LocationMarker;
