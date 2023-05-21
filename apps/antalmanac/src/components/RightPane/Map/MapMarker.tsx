import { Button } from '@material-ui/core';
import WalkIcon from '@material-ui/icons/DirectionsWalk';
import Leaflet from 'leaflet';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import { Marker, Popup } from 'react-leaflet';

import analyticsEnum, { logAnalytics } from '$lib/analytics';

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

type MarkerRef = React.MutableRefObject<Marker | null>;

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
    openPopup,
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
    let locationLinkElement;

    if (acronym) {
        locationLinkElement = (
            <a href={`http://www.classrooms.uci.edu/classrooms/${acronym}`} target="_blank" rel="noopener noreferrer">
                {location}
            </a>
        );
    } else {
        locationLinkElement = location;
    }
    
    const markerRef = useState(useRef(null))[0];

    function _openPopup(_markerRef: MarkerRef) {
        // To give the map time to pan
        setTimeout(() => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            _markerRef?.current?.fireLeafletEvent('click', null);
        }, 300);
    }

    useEffect(() => {
        if (openPopup) _openPopup(markerRef);
    }, [markerRef, openPopup, lat, lng, location]);

    function handleKeyPress(event: { key: string; }) {
        if(event.key === 'Escape' && markerRef.current){
            //@ts-ignore
            markerRef.current.leafletElement.closePopup();
        }
        return () => {
            document.removeEventListener('keydown', handleKeyPress, false)
        };
    }

    function escListener () {
        document.addEventListener('keydown', handleKeyPress, false)
    }

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
                escListener();
            }}
        >
            <Popup>
                {locationLinkElement}

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
