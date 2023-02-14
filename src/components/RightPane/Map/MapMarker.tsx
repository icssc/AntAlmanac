import { Button } from '@material-ui/core';
import WalkIcon from '@material-ui/icons/DirectionsWalk';
import Leaflet from 'leaflet';
import React, {ReactElement, useEffect, useRef, useState} from 'react';
import { Marker, Popup } from 'react-leaflet';

import analyticsEnum, { logAnalytics } from '../../../analytics';

const GOOGLE_MAPS_URL = 'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=';
const IMAGE_CMS_URL = 'https://cms.concept3d.com/map/lib/image-cache/i.php?mapId=463&image=';

interface MapMarkerProps {
    index: string;
    stackIndex: number;
    acronym: string;
    location: string;
    lat: number;
    lng: number;
    markerColor: string;
    image?: string;
    children?: ReactElement;
    openPopup?: boolean;
}

type MarkerRef = React.MutableRefObject<Marker|null>;

const MapMarker = ({
    index,
    markerColor,
    stackIndex,
    image,
    location,
    lat,
    lng,
    acronym,
    children,
    openPopup
}: MapMarkerProps) => {
    /**@param color rgb hex color string */
    const getMarkerIcon = (color: string) => {
        return Leaflet.divIcon({
            iconAnchor: [0, 14 + 16 * stackIndex], // Adds offset for marker for stacking markers
            popupAnchor: [0, -21 - 16 * stackIndex], // Adds offset for popup for stacking markers
            className: '',
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
                            ${index}
                        </div>
                    </div>`,
        });
    };
    let locationString;

    if (acronym) {
        locationString = (
            <a href={`http://www.classrooms.uci.edu/classrooms/${acronym}`} target="_blank" rel="noopener noreferrer">
                {location}
            </a>
        );
    } else {
        locationString = location;
    }

    const [markerRef, updateMarkerRef] = useState(useRef(null));

    function _openPopup(_markerRef: MarkerRef) {
        console.log('openPopup', _markerRef?.current);

        // To give the map time to pan
        setTimeout(() => {
            _markerRef?.current?.fireLeafletEvent('click', null);
        }, 300)

    }

    useEffect(() => {
        _openPopup(markerRef);
    }, [markerRef, openPopup, lat, lng, location]);

    return (
        <Marker
            position={[lat, lng]}
            icon={getMarkerIcon(markerColor)}
            zIndexOffset={-stackIndex} // alter ZIndex so markers show above other markers in order of stack
            ref={markerRef}
            onClick={() => {
                logAnalytics({
                    category: analyticsEnum.map.title,
                    action: analyticsEnum.map.actions.CLICK_PIN,
                });
            }}
        >
            <Popup>
                {locationString}

                <br />

                {image ? (
                    <img src={`${IMAGE_CMS_URL}${image}`} alt="Building Snapshot" style={{ width: '100%' }} />
                ) : null}

                {children}

                <br />

                <Button
                    variant="contained"
                    size="small"
                    startIcon={<WalkIcon />}
                    href={`${GOOGLE_MAPS_URL}${lat},${lng}`}
                    target="_blank"
                >
                    Directions
                </Button>
            </Popup>
        </Marker>
    );
};

export default MapMarker;
