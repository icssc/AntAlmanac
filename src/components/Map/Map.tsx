import './Map.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css';

import { Autocomplete, Box, Paper, Tab, Tabs, TextField, Typography } from '@mui/material';
import type { LatLngTuple, Map } from 'leaflet';
import L from 'leaflet';
import { Fragment, useRef, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';

import type { Building } from '$lib/buildingCatalogue';
import buildingCatalogue from '$lib/buildingCatalogue';
import locationIds from '$lib/location_ids';
import type { Course } from '$lib/types';
import AppStore from '$stores/AppStore';
import type { CourseCalendarEvent } from '$stores/schedule/calendar';
// import { useScheduleStore } from '$stores/schedule'
import { getCourseCalendarEvents } from '$stores/schedule/calendar';

import CourseMarker from './Marker';
import CourseRoutes from './Routes';
import UserLocator from './UserLocator';

/**
 * extracts all metadata from courses to the top level in preparation to use in the map
 */
export function getMarkersFromCourses(courses: Course[]) {
    // const courseEvents = getCourseCalendarEvents(courses)
    const courseEvents = getCourseCalendarEvents(courses);

    const uniqueBuildingCodes = new Set(courseEvents.map((event) => event.bldg.split(' ').slice(0, -1).join(' ')));

    const pins: Record<string, CourseCalendarEvent[]> = {};

    /**
     * associate each building code to courses that have a matching building code
     */
    uniqueBuildingCodes.forEach((buildingCode) => {
        pins[buildingCode] = courseEvents.filter((event) => {
            const eventBuildingCode = event.bldg.split(' ').slice(0, -1).join(' ');
            return eventBuildingCode === buildingCode;
        });
    });

    const result = Object.entries(pins)
        .filter(([buildingCode]) => !!buildingCatalogue[locationIds[buildingCode]])
        .map(([buildingCode, events]) => {
            const locationData = buildingCatalogue[locationIds[buildingCode]];
            const eventLocationData = events.map((event) => {
                const key = `${event.title} ${event.sectionType} @ ${event.bldg}`;
                const acronym = locationData.name.substring(
                    locationData.name.indexOf('(') + 1,
                    locationData.name.indexOf(')')
                );
                return {
                    key,
                    image: locationData.imageURLs[0],
                    acronym,
                    markerColor: event.color,
                    location: locationData.name,
                    ...locationData,
                    ...event,
                };
            });
            const flatEventLocationData = eventLocationData.flat();
            return flatEventLocationData;
        });

    const markers = result.flat();
    const markersByTime = markers.sort((a, b) => a.start.getTime() - b.start.getTime());
    return markersByTime;
}

const ACCESS_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

const attribution =
    '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors | Images from <a href="https://map.uci.edu/?id=463">UCI Map</a>';

const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${ACCESS_TOKEN}`;

/**
 * empty day is alias for "All Days"
 */
const days = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

/**
 * map of all course locations on UCI campus
 */
export default function CourseMap() {
    const map = useRef<Map | null>(null);
    const [tab, setTab] = useState(0);
    const [selected, setSelected] = useState<Building>();

    const today = days[tab];

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
    };

    const handleSearch = (_event: React.SyntheticEvent, value: Building | null) => {
        if (!value) {
            setSelected(undefined);
        } else {
            setSelected(value);
            const location = L.latLng(value.lat, value.lng);
            map.current?.setView(location, 18);
        }
    };

    /**
     * unique buildings
     */
    const uniqueBuildings = Object.values(buildingCatalogue).filter(
        (building, index, self) => self.findIndex((foundBuilding) => building.name === foundBuilding.name) === index
    );

    /**
     * extract a bunch of relevant metadata from courses into a top-level object for MapMarkers
     */
    // const markers = getMarkersFromCourses(schedules[scheduleIndex]?.courses)
    const markers = getMarkersFromCourses(AppStore.getAddedCourses());

    /**
     * only get markers for courses happening today
     */
    const markersToday = markers.filter((marker) => marker.start.toString().includes(today));

    /**
     * unique array of markers that occur today
     */
    const uniqueMarkers = markersToday.filter(
        (marker, index, self) => self.findIndex((foundMarker) => marker.key === foundMarker.key) === index
    );

    /**
     * group every two markers as [start, destination] tuples
     */
    const startDestPairs = uniqueMarkers.reduce((acc, cur, index) => {
        acc.push([cur]);
        if (index > 0) {
            acc[index - 1].push(cur);
        }
        return acc;
    }, [] as (typeof uniqueMarkers)[]);

    return (
        <Box sx={{ height: 1, width: 1, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <MapContainer ref={map} center={[33.6459, -117.842717]} zoom={16} style={{ height: '100%' }}>
                {/** menu floats above the map */}
                <Paper sx={{ zIndex: 400, position: 'relative', my: 2, mx: 6.942, marginX: '15%', marginY: 8 }}>
                    <Tabs value={tab} onChange={handleChange} variant="fullWidth" sx={{ minHeight: 0 }}>
                        {days.map((day) => (
                            <Tab
                                key={day}
                                label={day || 'All'}
                                sx={{ padding: 1, minHeight: 'auto', minWidth: '10%', p: 1 }}
                            />
                        ))}
                    </Tabs>
                    <Autocomplete
                        options={uniqueBuildings}
                        getOptionLabel={(option) => option.name || ''}
                        onChange={handleSearch}
                        renderInput={(params) => <TextField {...params} label="Search for a place" variant="filled" />}
                    />
                </Paper>

                <TileLayer attribution={attribution} url={url} tileSize={512} maxZoom={21} zoomOffset={-1} />

                <UserLocator />

                {/* draw out routes if the user is viewing a specific day */}
                {today !== '' &&
                    startDestPairs.map((startDestPair) => {
                        const latLngTuples = startDestPair.map((marker) => [marker.lat, marker.lng] as LatLngTuple);
                        const color = startDestPair[0]?.color;
                        /**
                         * previous renders of the routes will be left behind if the keys aren't unique
                         */
                        const key = Math.random().toString(36).substring(7);
                        return <CourseRoutes key={key} latLngTuples={latLngTuples} color={color} />;
                    })}

                {/* draw a marker for each class */}
                {uniqueMarkers.map((marker, index) => (
                    <Fragment key={Object.values(marker).join()}>
                        <CourseMarker {...marker} label={today ? index + 1 : undefined} stackIndex={index}>
                            <hr />
                            <Typography variant="body2">Class: {`${marker.title} ${marker.sectionType}`}</Typography>
                            <Typography variant="body2">Room: {marker.bldg.split(' ').slice(-1)}</Typography>
                        </CourseMarker>
                    </Fragment>
                ))}

                {/* render an additional marker if the user searched up a location */}
                {selected && (
                    <CourseMarker
                        {...selected}
                        label="!"
                        color="red"
                        location={selected.name}
                        image={selected.imageURLs?.[0]}
                    />
                )}
            </MapContainer>
        </Box>
    );
}
