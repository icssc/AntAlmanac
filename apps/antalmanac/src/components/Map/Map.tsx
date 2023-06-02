import './Map.css';

import { Fragment, useEffect, useRef, useCallback, useState, createRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import L, { type Map, type LatLngTuple } from 'leaflet';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet-routing-machine';
import { Autocomplete, Box, Paper, Tab, Tabs, TextField, Typography } from '@mui/material';
import ClassRoutes from './Routes';
import LocationMarker from './Marker';
import UserLocator from './UserLocator';
import AppStore from '$stores/AppStore';
import locationIds from '$lib/location_ids';
import buildingCatalogue from '$lib/buildingCatalogue';
import type { Building } from '$lib/buildingCatalogue';
import type { CourseEvent } from '$components/Calendar/CourseCalendarEvent';

const ACCESS_TOKEN = 'pk.eyJ1IjoicGVkcmljIiwiYSI6ImNsZzE0bjk2ajB0NHEzanExZGFlbGpwazIifQ.l14rgv5vmu5wIMgOUUhUXw';

const ATTRIBUTION_MARKUP =
    '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors | Images from <a href="https://map.uci.edu/?id=463">UCI Map</a>';

const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${ACCESS_TOKEN}`;

/**
 * empty day is alias for "All Days"
 */
const days = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

interface MarkerContent {
    key: string;
    image: string;
    acronym: string;
    markerColor: string;
    location: string;
}

/**
 * Get an array of courses that occur in every building.
 * Each course's info is used to render a marker to the map.
 */
export function getCoursesPerBuilding() {
    const courseEvents = AppStore.getCourseEventsInCalendar();

    const allBuildingCodes = courseEvents.map((event) => event.bldg.split(' ').slice(0, -1).join(' '));

    const uniqueBuildingCodes = new Set(allBuildingCodes);

    const validBuildingCodes = [...uniqueBuildingCodes].filter(
        (buildingCode) => buildingCatalogue[locationIds[buildingCode]] != null
    );

    const coursesPerBuilding: Record<string, (CourseEvent & Building & MarkerContent)[]> = {};

    validBuildingCodes.forEach((buildingCode) => {
        coursesPerBuilding[buildingCode] = courseEvents
            .filter((event) => event.bldg.split(' ').slice(0, -1).join(' ') === buildingCode)
            .map((event) => {
                const locationData = buildingCatalogue[locationIds[buildingCode]];
                const key = `${event.title} ${event.sectionType} @ ${event.bldg}`;
                const acronym = locationData.name.substring(
                    locationData.name.indexOf('(') + 1,
                    locationData.name.indexOf(')')
                );
                const markerData = {
                    key,
                    image: locationData.imageURLs[0],
                    acronym,
                    markerColor: event.color,
                    location: locationData.name,
                    ...locationData,
                    ...event,
                };
                return markerData;
            });
    });
    return coursesPerBuilding;
}

/**
 * Get unique building names for the MUI Autocomplete.
 * A building with a duplicate name will have a higher index then a `findIndex` for another building with the same name.
 */
const buildings = Object.entries(buildingCatalogue).filter(
    ([_, building], index, array) =>
        array.findIndex(([_, otherBuilding]) => otherBuilding.name === building.name) === index
);

/**
 * Map of all course locations on UCI campus.
 */
export default function CourseMap() {
    const navigate = useNavigate();
    const map = useRef<Map | null>(null);
    const markerRef = createRef<L.Marker>();
    const [searchParams] = useSearchParams();
    const [selectedDayIndex, setSelectedDay] = useState(0);
    const [markers, setMarkers] = useState(getCoursesPerBuilding());

    const updateMarkers = useCallback(() => {
        setMarkers(getCoursesPerBuilding());
    }, [setMarkers, getCoursesPerBuilding]);

    useEffect(() => {
        AppStore.on('addedCoursesChange', updateMarkers);
        AppStore.on('currentScheduleIndexChange', updateMarkers);
        return () => {
            AppStore.removeListener('addedCoursesChange', updateMarkers);
            AppStore.removeListener('currentScheduleIndexChange', updateMarkers);
        };
    }, [AppStore, updateMarkers]);

    useEffect(() => {
        const locationID = Number(searchParams.get('location') ?? 0);
        const building = locationID in buildingCatalogue ? buildingCatalogue[locationID] : undefined;

        if (building == null) return;

        setTimeout(() => {
            map.current?.flyTo([building.lat + 0.001, building.lng], 18, { duration: 250, animate: false });
            markerRef.current?.openPopup();
        }, 250);
    }, [searchParams]);

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setSelectedDay(newValue);
    };

    const handleSearch = (_event: React.SyntheticEvent, value: [string, Building] | null) => {
        navigate(`/map?location=${value?.[0]}`);
    };

    const locationID = Number(searchParams.get('location') ?? 0);

    const building = locationID in buildingCatalogue ? buildingCatalogue[locationID] : undefined;

    const today = days[selectedDayIndex];

    /**
     * Get markers for unique courses (identified by  section ID) that occur today, sorted by start time.
     * A duplicate section code found later in the array will have a higher index.
     */
    const markersToDisplay = Object.keys(markers)
        .flatMap((markerKey) => markers[markerKey].filter((course) => course.start.toString().includes(today)))
        .sort((a, b) => a.start.getTime() - b.start.getTime())
        .filter(
            (a, index, array) => array.findIndex((otherCourse) => otherCourse.sectionCode === a.sectionCode) === index
        );

    /**
     * Every two markers grouped as [start, destination] tuples for the routes.
     */
    const startDestPairs = markersToDisplay.reduce((acc, cur, index) => {
        acc.push([cur]);
        if (index > 0) {
            acc[index - 1].push(cur);
        }
        return acc;
    }, [] as (typeof markersToDisplay)[]);

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
                        options={buildings}
                        getOptionLabel={(option) => option[1].name ?? ''}
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
                         * Previous renders of the routes will be left behind if the keys aren't unique.
                         */
                        const key = Math.random().toString(36).substring(7);
                        return <ClassRoutes key={key} latLngTuples={latLngTuples} color={color} />;
                    })}

                {/* Draw a marker for each class that occurs today. */}
                {markersToDisplay.map((marker, index) => {
                    // Find all courses that occur in the same building prior to this one to stack them properly.
                    const coursesSameBuildingPrior = markersToDisplay
                        .slice(0, index)
                        .filter((m) => m.bldg === marker.bldg);

                    return (
                        <Fragment key={Object.values(marker).join('')}>
                            <LocationMarker
                                {...marker}
                                label={today ? index + 1 : undefined}
                                stackIndex={coursesSameBuildingPrior.length}
                            >
                                <Box>
                                    <Typography variant="body2">
                                        Class: {marker.title} {marker.sectionType}
                                    </Typography>
                                    <Typography variant="body2">Room: {marker.bldg.split(' ').slice(-1)}</Typography>
                                </Box>
                            </LocationMarker>
                        </Fragment>
                    );
                })}

                {/* Render an additional marker if the user searched up a location. */}
                {/* A unique key based on the building is used to make sure the previous marker un-renders. */}
                {building && (
                    <LocationMarker
                        key={building.name}
                        {...building}
                        label="!"
                        color="red"
                        location={building.name}
                        image={building.imageURLs?.[0]}
                        ref={markerRef}
                    />
                )}
            </MapContainer>
        </Box>
    );
}
