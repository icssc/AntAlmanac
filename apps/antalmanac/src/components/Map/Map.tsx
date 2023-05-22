import './Map.css';

import { Fragment, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import type { Map, LatLngTuple } from 'leaflet';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet-routing-machine';
import { Autocomplete, Box, Paper, Tab, Tabs, TextField, Typography } from '@mui/material';
import AppStore from '$stores/AppStore';
import locationIds from '$lib/location_ids';
import buildingCatalogue from '$lib/buildingCatalogue';
import type { Building } from '$lib/buildingCatalogue';
import LocationMarker from './Marker';
import CourseRoutes from './Routes';
import UserLocator from './UserLocator';
import type { CourseEvent } from '$components/Calendar/CourseCalendarEvent';

const ACCESS_TOKEN = 'pk.eyJ1IjoicGVkcmljIiwiYSI6ImNsZzE0bjk2ajB0NHEzanExZGFlbGpwazIifQ.l14rgv5vmu5wIMgOUUhUXw';

const ATTRIBUTION_MARKUP =
    '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors | Images from <a href="https://map.uci.edu/?id=463">UCI Map</a>';

const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${ACCESS_TOKEN}`;

/**
 * empty day is alias for "All Days"
 */
const days = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

interface Yeet {
    key: string;
    image: string;
    acronym: string;
    markerColor: string;
    location: string;
}

/**
 * extracts all metadata from courses to the top level in preparation to use in the map
 */
export function getMarkersFromCourses() {
    const courseEvents = AppStore.getCourseEventsInCalendar();

    const uniqueBuildingCodes = new Set(courseEvents.map((event) => event.bldg.split(' ').slice(0, -1).join(' ')));

    /**
     * Each building has an array of courses that occur in the building.
     */
    const pins: Record<string, (CourseEvent & Building & Yeet)[]> = {};

    /**
     * Associate each building code to courses that have a matching building code.
     */
    uniqueBuildingCodes.forEach((buildingCode) => {
        pins[buildingCode] = courseEvents
            /**
             * Get course events that occur in this building.
             */
            .filter((event) => {
                const eventBuildingCode = event.bldg.split(' ').slice(0, -1).join(' ');
                return eventBuildingCode === buildingCode;
            })

            /**
             * Filter out non-existent matches.
             */
            .filter(() => buildingCatalogue[locationIds[buildingCode]])
            .map((event) => {
                const locationData = buildingCatalogue[locationIds[buildingCode]];
                const key = `${event.title} ${event.sectionType} @ ${event.bldg}`;
                const acronym = locationData.name.substring(
                    locationData.name.indexOf('(') + 1,
                    locationData.name.indexOf(')')
                );

                const aponia = {
                    key,
                    image: locationData.imageURLs[0],
                    acronym,
                    markerColor: event.color,
                    location: locationData.name,
                    ...locationData,
                    ...event,
                };

                return aponia;
            });
    });

    return pins;
}

/**
 * Unique buildings. TODO, FIXME: this should already be a unique array??
 */
const uniqueBuildings = Object.values(buildingCatalogue).filter(
    (building, index, self) => self.findIndex((foundBuilding) => building.name === foundBuilding.name) === index
);

/**
 * map of all course locations on UCI campus
 */
export default function CourseMap() {
    const map = useRef<Map | null>(null);
    const [selectedDayIndex, setSelectedDay] = useState(0);
    const [selected, setSelected] = useState<Building>();
    const [searchParams] = useSearchParams();

    /**
     * Whenever search params changes, update the selected location if possible.
     */
    useEffect(() => {
        const location = +(searchParams.get('location') ?? 0);

        if (!(location in buildingCatalogue)) return;

        const building = buildingCatalogue[location];

        setSelected(building);

        /** TODO FIXME: this is alright, but I don't really like it. */
        setTimeout(() => {
            map.current?.setView(L.latLng(building.lat, building.lng), 18);
        });
    }, [searchParams]);

    /**
     * Extract a bunch of relevant metadata from courses into a top-level object for MapMarkers.
     */
    const [markers, setMarkers] = useState(getMarkersFromCourses());

    const updateMarkers = () => {
        setMarkers(getMarkersFromCourses());
    };

    useEffect(() => {
        AppStore.on('addedCoursesChange', updateMarkers);
        AppStore.on('currentScheduleIndexChange', updateMarkers);
        return () => {
            AppStore.removeListener('addedCoursesChange', updateMarkers);
            AppStore.removeListener('currentScheduleIndexChange', updateMarkers);
        };
    }, []);

    const today = days[selectedDayIndex];

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setSelectedDay(newValue);
    };

    const handleSearch = (_event: React.SyntheticEvent, value: Building | null) => {
        if (!value) {
            setSelected(undefined);
        } else if (map.current) {
            setSelected(value);
            const location = L.latLng(value.lat, value.lng);
            map.current.setView(location, 18);
        }
    };

    /**
     * Markers for all courses happening today, sorted by start time.
     */
    const markersToday = Object.keys(markers)
        .flatMap((markerKey) => markers[markerKey].filter((course) => course.start.toString().includes(today)))
        .sort((a, b) => a.start.getTime() - b.start.getTime());

    /**
     * Group every two markers as [start, destination] tuples.
     */
    const startDestPairs = markersToday.reduce((acc, cur, index) => {
        acc.push([cur]);
        if (index > 0) {
            acc[index - 1].push(cur);
        }
        return acc;
    }, [] as (typeof markersToday)[]);

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%' }}>
            <MapContainer ref={map} center={[33.6459, -117.842717]} zoom={16} style={{ height: '100%' }}>
                {/** Menu floats above the map. */}
                <Paper sx={{ zIndex: 400, position: 'relative', my: 2, mx: 6.942, marginX: '15%', marginY: 8 }}>
                    <Tabs value={selectedDayIndex} onChange={handleChange} variant="fullWidth" sx={{ minHeight: 0 }}>
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

                <TileLayer attribution={ATTRIBUTION_MARKUP} url={url} tileSize={512} maxZoom={21} zoomOffset={-1} />

                <UserLocator />

                {/* Draw out routes if the user is viewing a specific day. */}
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

                {/* Draw a marker for each class that occurs today. */}
                {markersToday.map((marker, index) => (
                    <Fragment key={Object.values(marker).join('')}>
                        <LocationMarker {...marker} label={today ? index + 1 : undefined} stackIndex={index}>
                            <hr />
                            <Typography variant="body2">Class: {`${marker.title} ${marker.sectionType}`}</Typography>
                            <Typography variant="body2">Room: {marker.bldg.split(' ').slice(-1)}</Typography>
                        </LocationMarker>
                    </Fragment>
                ))}

                {/* Render an additional marker if the user searched up a location. */}
                {selected && (
                    <LocationMarker
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
