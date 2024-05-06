import './Map.css';

import { Box, Paper, Tab, Tabs, Typography } from '@mui/material';
import { Marker, type Map, type LatLngTuple } from 'leaflet';
import { Fragment, useEffect, useRef, useCallback, useState, createRef, useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useSearchParams, useNavigate } from 'react-router-dom';
import 'leaflet-routing-machine';

import LocationMarker from './Marker';
import ClassRoutes from './Routes';
import UserLocator from './UserLocator';

import type { CourseEvent } from '$components/Calendar/CourseCalendarEvent';
import { BuildingSelect, ExtendedBuilding } from '$components/inputs/building-select';
import { TILES_URL } from '$lib/api/endpoints';
import buildingCatalogue, { Building } from '$lib/buildingCatalogue';
import locationIds from '$lib/location_ids';
import { notNull } from '$lib/utils';
import AppStore from '$stores/AppStore';

const ATTRIBUTION_MARKUP =
    '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors | Images from <a href="https://map.uci.edu/?id=463">UCI Map</a>';

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

    const courseBuildings = courseEvents.flatMap((event) => event.locations.map((location) => location.building));

    const allBuildingCodes = [...courseBuildings];

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

export function getCustomEventPerBuilding() {
    const customEvents = AppStore.getCustomEventsInCalendar();

    const customEventBuildings = customEvents.map((e) => e.building).filter(notNull);

    // convert all digit to name in customEventBuilding  for example: 83096  ->  ICS
    for (let i = 0; i < customEventBuildings.length; i++) {
        customEventBuildings[i] =
            Object.keys(locationIds).find((key) => locationIds[key] === parseInt(customEventBuildings[i])) || '';
    }

    const allBuildingCodes = [...customEventBuildings];

    const uniqueBuildingCodes = new Set(allBuildingCodes);

    const validBuildingCodes = [...uniqueBuildingCodes].filter(
        (buildingCode) => buildingCatalogue[locationIds[buildingCode]] != null
    );

    interface localCustomEventType {
        title: string;
        start: Date;
        end: Date;
        days: string[];
        customEventID: number;
        color?: string | undefined;
        building?: string | undefined;
    }

    const customEventPerBuilding: Record<string, (localCustomEventType & Building & MarkerContent)[]> = {};
    for (let i = 0; i < validBuildingCodes.length; i++) {
        customEventPerBuilding[validBuildingCodes[i]] = customEvents
            .filter((event) => {
                return (
                    Object.keys(locationIds).find(
                        (key) => locationIds[key] === parseInt(event.building ? event.building : '')
                    ) == validBuildingCodes[i]
                );
            })
            .map((event) => {
                const locationData = buildingCatalogue[locationIds[validBuildingCodes[i]]];
                const key = `${event.title} @ ${event.building}`;
                const acronym = locationData.name.substring(
                    locationData.name.indexOf('(') + 1,
                    locationData.name.indexOf(')')
                );
                const markerCustomEventData = {
                    key,
                    image: locationData.imageURLs[0],
                    acronym,
                    markerColor: event.color ? event.color : '',
                    location: locationData.name,
                    ...locationData,
                    ...event,
                };
                return markerCustomEventData;
            });
    }
    return customEventPerBuilding;
}

/**
 * Map of all course locations on UCI campus.
 */
export default function CourseMap() {
    const navigate = useNavigate();
    const map = useRef<Map | null>(null);
    const markerRef = createRef<Marker>();
    const [searchParams] = useSearchParams();
    const [selectedDayIndex, setSelectedDay] = useState(0);
    const [markers, setMarkers] = useState(getCoursesPerBuilding());
    const [customEventMarkers, setCustomEventMarkers] = useState(getCustomEventPerBuilding());
    const [calendarEvents, setCalendarEvents] = useState(AppStore.getEventsInCalendar());

    useEffect(() => {
        const updateAllMarkers = () => {
            setMarkers(getCoursesPerBuilding());
            setCustomEventMarkers(getCustomEventPerBuilding());
        };

        AppStore.on('addedCoursesChange', updateAllMarkers);
        AppStore.on('customEventsChange', updateAllMarkers);
        AppStore.on('currentScheduleIndexChange', updateAllMarkers);
        AppStore.on('colorChange', updateAllMarkers);

        return () => {
            AppStore.removeListener('addedCoursesChange', updateAllMarkers);
            AppStore.removeListener('customEventsChange', updateAllMarkers);
            AppStore.removeListener('currentScheduleIndexChange', updateAllMarkers);
            AppStore.removeListener('colorChange', updateAllMarkers);
        };
    }, []);

    useEffect(() => {
        const updateCalendarEvents = () => {
            setCalendarEvents(AppStore.getEventsInCalendar());
        };

        AppStore.on('addedCoursesChange', updateCalendarEvents);
        AppStore.on('customEventsChange', updateCalendarEvents);
        AppStore.on('currentScheduleIndexChange', updateCalendarEvents);

        return () => {
            AppStore.removeListener('addedCoursesChange', updateCalendarEvents);
            AppStore.removeListener('customEventsChange', updateCalendarEvents);
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
    }, [markerRef, searchParams]);

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
        const hasWeekendEvent = calendarEvents.some((event) => weekendIndices.includes(event.start.getDay()));
        return hasWeekendEvent ? FULL_WEEK : WORK_WEEK;
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

    const customEventMarkersToDisplay = useMemo(() => {
        const markerValues = Object.keys(customEventMarkers)
            .flatMap((markerKey) => customEventMarkers[markerKey])
            .filter((marker, i, arr) => arr.findIndex((other) => other.key === marker.key) === i);

        const markersToday =
            today === 'All'
                ? markerValues
                : markerValues.filter((event) => {
                      return event.days.some((day) => day && today.includes(day));
                  });

        return markersToday.sort((a, b) => {
            const startDateA = new Date(`1970-01-01T${a.start}`);
            const startDateB = new Date(`1970-01-01T${b.start}`);
            return startDateA.getTime() - startDateB.getTime();
        });
    }, [customEventMarkers, today]);

    /**
     * Every two markers grouped as [start, destination] tuples for the routes.
     */
    const startDestPairs = useMemo(() => {
        const allEvents = [...markersToDisplay, ...customEventMarkersToDisplay];
        return allEvents.reduce(
            (acc, cur, index) => {
                acc.push([cur]);
                if (index > 0) {
                    acc[index - 1].push(cur);
                }
                return acc;
            },
            [] as (typeof allEvents)[]
        );
    }, [markersToDisplay, customEventMarkersToDisplay]);

    return (
        <Box
            sx={{ width: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%' }}
            id="map-pane"
        >
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

                <TileLayer
                    attribution={ATTRIBUTION_MARKUP}
                    url={`https://${TILES_URL}/{z}/{x}/{y}.png`}
                    tileSize={512}
                    maxZoom={21}
                    minZoom={15}
                    zoomOffset={-1}
                />

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
                                label={today === 'All' ? undefined : (index + 1).toString()}
                                stackIndex={coursesSameBuildingPrior.length}
                            >
                                <Box>
                                    <Typography variant="body1">
                                        <span style={{ fontWeight: 'bold' }}>Class:</span> {marker.title}{' '}
                                        {marker.sectionType}
                                    </Typography>
                                    <Typography variant="body1">
                                        <span style={{ fontWeight: 'bold' }}>
                                            Room{allRoomsInBuilding.length > 1 && 's'}:
                                        </span>{' '}
                                        {marker.locations[0].building} {allRoomsInBuilding.join('/')}
                                    </Typography>
                                </Box>
                            </LocationMarker>
                        </Fragment>
                    );
                })}

                {/* Draw a marker for each custom Event that occurs today. */}
                {customEventMarkersToDisplay.map((customEventMarkers, index) => {
                    const customEventSameBuildingPrior = customEventMarkersToDisplay.slice(0, index);

                    return (
                        <Fragment key={Object.values(customEventMarkers).join('')}>
                            <LocationMarker
                                {...customEventMarkers}
                                label={'E'}
                                stackIndex={customEventSameBuildingPrior.length}
                            >
                                <Box>
                                    <Typography variant="body1">
                                        <span style={{ fontWeight: 'bold' }}>Event:</span> {customEventMarkers.title}
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
