import { control } from 'leaflet';
import 'leaflet.locatecontrol';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export default function UserLocator() {
    const map = useMap();

    useEffect(() => {
        const userLocator = control.locate({
            position: 'topleft',
            flyTo: true,
        });

        userLocator.addTo(map);
    }, [map]);

    return null;
}
