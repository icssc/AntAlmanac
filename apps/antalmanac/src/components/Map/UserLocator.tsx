import { control } from 'leaflet';
import 'leaflet.locatecontrol';
import { memo, useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

export const UserLocator = memo(() => {
    const map = useMap();
    const hasCreatedControl = useRef(false);

    useEffect(() => {
        if (!hasCreatedControl.current) {
            const userLocator = control.locate({
                position: 'topleft',
                flyTo: true,
            });

            userLocator.addTo(map);
            hasCreatedControl.current = true;
        }

        // NB: We let the MapContainer handle the cleanup of the control.
    }, [map]);

    return null;
});

UserLocator.displayName = 'UserLocator';
