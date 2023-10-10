import './Map.css';

import { Fragment, useEffect, useRef, useCallback, useState, createRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import L, { type Map, type LatLngTuple } from 'leaflet';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet-routing-machine';
import { Box, Paper, Tab, Tabs, Typography } from '@mui/material';
import ClassRoutes from './Routes';
import LocationMarker from './Marker';
import UserLocator from './UserLocator';
import AppStore from '$stores/AppStore';
import locationIds from '$lib/location_ids';
import buildingCatalogue, { Building } from '$lib/buildingCatalogue';
import type { CourseEvent } from '$components/Calendar/CourseCalendarEvent';
import { BuildingSelect, ExtendedBuilding } from '$components/inputs/building-select';
import { notNull } from '$lib/utils';

const ACCESS_TOKEN = 'pk.eyJ1IjoicGVkcmljIiwiYSI6ImNsZzE0bjk2ajB0NHEzanExZGFlbGpwazIifQ.l14rgv5vmu5wIMgOUUhUXw';

const ATTRIBUTION_MARKUP =
    '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors | Images from <a href="https://map.uci.edu/?id=463">UCI Map</a>';

const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${ACCESS_TOKEN}`;

const WORK_WEEK = ['All', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const FULL_WEEK = ['All', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const weekendIndices = [0, 6];

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
    const customEvents = AppStore.getCustomEvents();

    const courseBuildings = courseEvents.flatMap((event) => event.locations.map((location) => location.building));
    const customEventBuildings = customEvents.map((e) => e.building).filter(notNull);

    const allBuildingCodes = [...courseBuildings, ...customEventBuildings];

    console.log({ allBuildingCodes });

    const uniqueBuildingCodes = new Set(allBuildingCodes);

    const validBuildingCodes = [...uniqueBuildingCodes].filter(
        (buildingCode) => buildingCatalogue[locationIds[buildingCode]] != null
    );

    const coursesPerBuilding: Record<string, (CourseEvent & Building & MarkerContent)[]> = {};

    validBuildingCodes.forEach((buildingCode) => {
        coursesPerBuilding[buildingCode] = courseEvents
            .filter((event) => event.locations.map((location) => location.building).includes(buildingCode))
            .map((event) => {
                const locationData = buildingCatalogue[locationIds[buildingCode]];
                const key = `${event.title} ${event.sectionType} @ ${event.locations[0]}`;
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
 * Map of all course locations on UCI campus.
 */
export default function CourseMap() {
    const navigate = useNavigate();
    const map = useRef<Map | null>(null);
    const markerRef = createRef<L.Marker>();
    const [searchParams] = useSearchParams();
    const [selectedDayIndex, setSelectedDay] = useState(0);
    const [markers, setMarkers] = useState(getCoursesPerBuilding());
    const [calendarEvents, setCalendarEvents] = useState(AppStore.getCourseEventsInCalendar());

    useEffect(() => {
        const updateMarkers = () => {
            setMarkers(getCoursesPerBuilding());
        };

        AppStore.on('addedCoursesChange', updateMarkers);
        AppStore.on('currentScheduleIndexChange', updateMarkers);

        return () => {
            AppStore.removeListener('addedCoursesChange', updateMarkers);
            AppStore.removeListener('currentScheduleIndexChange', updateMarkers);
        };
    }, []);

    useEffect(() => {
        const updateCalendarEvents = () => {
            setCalendarEvents(AppStore.getCourseEventsInCalendar());
        };

        AppStore.on('addedCoursesChange', updateCalendarEvents);
        AppStore.on('currentScheduleIndexChange', updateCalendarEvents);

        return () => {
            AppStore.removeListener('addedCoursesChange', updateCalendarEvents);
            AppStore.removeListener('currentScheduleIndexChange', updateCalendarEvents);
        };
    }, []);

    useEffect(() => {
        const locationID = Number(searchParams.get('location') ?? 0);
        const building = locationID in buildingCatalogue ? buildingCatalogue[locationID] : undefined;

        if (building == null) {
            return;
        }

        setTimeout(() => {
            map.current?.flyTo([building.lat + 0.001, building.lng], 18, { duration: 250, animate: false });
            markerRef.current?.openPopup();
        }, 250);
    }, [searchParams]);

    const handleChange = useCallback(
        (_event: React.SyntheticEvent, newValue: number) => {
            setSelectedDay(newValue);
        },
        [setSelectedDay]
    );

    const onBuildingChange = useCallback(
        (building?: ExtendedBuilding | null) => {
            navigate(`/map?location=${building?.id}`);
        },
        [navigate]
    );

    const days = useMemo(() => {
        const hasWeekendCourse = calendarEvents.some((event) => weekendIndices.includes(event.start.getDay()));
        return hasWeekendCourse ? FULL_WEEK : WORK_WEEK;
    }, [calendarEvents]);

    const today = useMemo(() => {
        return days[selectedDayIndex];
    }, [days, selectedDayIndex]);

    const focusedLocation = useMemo(() => {
        const locationID = Number(searchParams.get('location') ?? 0);

        const focusedBuilding = locationID in buildingCatalogue ? buildingCatalogue[locationID] : undefined;

        if (focusedBuilding == null) {
            return undefined;
        }

        const acronym = focusedBuilding.name.substring(
            focusedBuilding?.name.indexOf('(') + 1,
            focusedBuilding?.name.indexOf(')')
        );

        return {
            ...focusedBuilding,
            image: focusedBuilding.imageURLs[0],
            acronym,
            location: focusedBuilding.name,
        };
    }, [searchParams]);

    /**
     * Get markers for unique courses (identified by  section ID) that occur today, sorted by start time.
     * A duplicate section code found later in the array will have a higher index.
     */
    const markersToDisplay = useMemo(() => {
        const markerValues = Object.keys(markers).flatMap((markerKey) => markers[markerKey]);

        const markersToday =
            today === 'All' ? markerValues : markerValues.filter((course) => course.start.toString().includes(today));

        return markersToday
            .sort((a, b) => a.start.getTime() - b.start.getTime())
            .filter((marker, i, arr) => arr.findIndex((other) => other.sectionCode === marker.sectionCode) === i);
    }, [markers, today]);

    /**
     * Every two markers grouped as [start, destination] tuples for the routes.
     */
    const startDestPairs = useMemo(() => {
        return markersToDisplay.reduce((acc, cur, index) => {
            acc.push([cur]);
            if (index > 0) {
                acc[index - 1].push(cur);
            }
            return acc;
        }, [] as (typeof markersToDisplay)[]);
    }, [markersToDisplay]);

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%' }}>
            <MapContainer ref={map} center={[33.6459, -117.842717]} zoom={16} style={{ height: '100%' }}>
                {/* Menu floats above the map. */}
                <Paper sx={{ position: 'relative', mx: 'auto', my: 2, width: '70%', zIndex: 400 }}>
                    <Tabs value={selectedDayIndex} onChange={handleChange} variant="fullWidth" sx={{ minHeight: 0 }}>
                        {days.map((day) => (
                            <Tab key={day} label={day} sx={{ padding: 1, minHeight: 'auto', minWidth: '10%' }} />
                        ))}
                    </Tabs>
                    <BuildingSelect onChange={onBuildingChange} />
                </Paper>

                <TileLayer attribution={ATTRIBUTION_MARKUP} url={url} tileSize={512} maxZoom={21} zoomOffset={-1} />

                <UserLocator />

                {/* Draw out routes if the user is viewing a specific day. */}
                {today !== 'All' &&
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
                    // TODO Handle multiple buildings between class comparisons on markers.
                    const coursesSameBuildingPrior = markersToDisplay
                        .slice(0, index)
                        .filter((m) =>
                            m.locations.map((location) => location.building).includes(marker.locations[0].building)
                        );

                    const allRoomsInBuilding = marker.locations
                        .filter((location) => location.building == marker.locations[0].building)
                        .reduce((roomList, location) => [...roomList, location.room], [] as string[]);

                    return (
                        <Fragment key={Object.values(marker).join('')}>
                            <LocationMarker
                                {...marker}
                                label={today === 'All' ? undefined : index + 1}
                                stackIndex={coursesSameBuildingPrior.length}
                            >
                                <Box>
                                    <Typography variant="body2">
                                        Class: {marker.title} {marker.sectionType}
                                    </Typography>
                                    <Typography variant="body2">
                                        Room{allRoomsInBuilding.length > 1 && 's'}: {marker.locations[0].building}{' '}
                                        {allRoomsInBuilding.join('/')}
                                    </Typography>
                                </Box>
                            </LocationMarker>
                        </Fragment>
                    );
                })}

                {/* Render an additional marker if the user searched up a location. */}
                {/* A unique key based on the building is used to make sure the previous marker un-renders. */}
                {focusedLocation && (
                    <LocationMarker
                        key={focusedLocation.name}
                        {...focusedLocation}
                        label="!"
                        color="red"
                        location={focusedLocation.name}
                        image={focusedLocation.imageURLs?.[0]}
                        ref={markerRef}
                    />
                )}
            </MapContainer>
        </Box>
    );
}
