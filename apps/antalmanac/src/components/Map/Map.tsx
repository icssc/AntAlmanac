import 'leaflet/dist/leaflet.css';
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css';
import './Map.css';
import { Box, Paper, Tab, Tabs, Typography } from '@mui/material';
import { type CustomEventId } from '@packages/antalmanac-types';
import { Marker, type Map, type LatLngTuple } from 'leaflet';
import dynamic from 'next/dynamic';
import { usePostHog } from 'posthog-js/react';
import { Fragment, useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useSearchParams, useNavigate } from 'react-router-dom';

import { LocationMarker } from './Marker';

const Routes = dynamic(() => import('./Routes').then((m) => ({ default: m.Routes })), { ssr: false });

import {
    isCourseEvent,
    isCustomEvent,
    type CalendarEvent,
    type CourseEvent,
    type CustomEvent,
} from '$components/Calendar/types';
import { BuildingSelect, type ExtendedBuilding } from '$components/inputs/BuildingSelect';
import { UserLocator } from '$components/Map/UserLocator';
import { useSectionThemeAssignments } from '$hooks/useSectionThemeAssignments';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { MAPBOX_PROXY_TILES_ENDPOINT } from '$lib/api/endpoints';
import buildingCatalogue, { type Building } from '$lib/locations/buildingCatalogue';
import locationIds, { buildingCodeFromLocationNumericId } from '$lib/locations/locations';
import { applyThemeToCalendarEvents } from '$lib/sectionThemes';
import { notNull } from '$lib/utils';
import AppStore from '$stores/AppStore';
import { scheduleSectionKey } from '$stores/scheduleHelpers';
import { useThemeStore } from '$stores/SettingsStore';

function getBuildingNameAcronym(name: string): string {
    const open = name.indexOf('(');
    const close = name.indexOf(')');
    if (open === -1 || close === -1 || close <= open) {
        return '';
    }
    return name.substring(open + 1, close);
}

const ATTRIBUTION_MARKUP =
    '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors | Images from <a href="https://map.uci.edu/?id=463">UCI Map</a>';

const WORK_WEEK = ['All', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const FULL_WEEK = ['All', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const weekendIndices = [0, 6];
const CAMPUS_CENTER: LatLngTuple = [33.6459, -117.842717];
const CAMPUS_BOUND_DELTA = 0.018;
const CAMPUS_BOUNDS: [LatLngTuple, LatLngTuple] = [
    [CAMPUS_CENTER[0] - CAMPUS_BOUND_DELTA, CAMPUS_CENTER[1] - CAMPUS_BOUND_DELTA],
    [CAMPUS_CENTER[0] + CAMPUS_BOUND_DELTA, CAMPUS_CENTER[1] + CAMPUS_BOUND_DELTA],
];

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
export function getCoursesPerBuilding(courseEvents: CourseEvent[] = AppStore.getCourseEventsInCalendar()) {
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
                const acronym = getBuildingNameAcronym(locationData.name);
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

export function getCustomEventPerBuilding(customEvents: CustomEvent[] = AppStore.getCustomEventsInCalendar()) {
    const customEventBuildings = customEvents.map((e) => e.building).filter(notNull);

    // convert all digit to name in customEventBuilding  for example: 83096  ->  ICS
    for (let i = 0; i < customEventBuildings.length; i++) {
        const numericId = Number.parseInt(customEventBuildings[i], 10);
        customEventBuildings[i] =
            (Number.isNaN(numericId) ? undefined : buildingCodeFromLocationNumericId(numericId)) ?? '';
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
        customEventID: CustomEventId;
        color?: string | undefined;
        building?: string | undefined;
    }

    const customEventPerBuilding: Record<string, (localCustomEventType & Building & MarkerContent)[]> = {};
    for (let i = 0; i < validBuildingCodes.length; i++) {
        customEventPerBuilding[validBuildingCodes[i]] = customEvents
            .filter((event) => {
                const raw = event.building ?? '';
                const numericId = Number.parseInt(raw, 10);
                const code =
                    raw === '' || Number.isNaN(numericId) ? undefined : buildingCodeFromLocationNumericId(numericId);
                return code === validBuildingCodes[i];
            })
            .map((event) => {
                const locationData = buildingCatalogue[locationIds[validBuildingCodes[i]]];
                const key = `${event.title} @ ${event.building}`;
                const acronym = getBuildingNameAcronym(locationData.name);
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
export function CourseMap() {
    const navigate = useNavigate();
    const map = useRef<Map | null>(null);
    const markerRef = useRef<Marker | null>(null);
    const [searchParams] = useSearchParams();
    const [selectedDayIndex, setSelectedDay] = useState(0);

    const [rawCalendarEvents, setRawCalendarEvents] = useState(() => AppStore.getEventsInCalendar());

    const { setting, palette, assignments } = useSectionThemeAssignments();

    const themedEvents = useMemo<CalendarEvent[]>(
        () => applyThemeToCalendarEvents(rawCalendarEvents, setting, assignments, palette),
        [rawCalendarEvents, setting, assignments, palette]
    );

    const calendarEvents = themedEvents;

    const markers = useMemo(() => getCoursesPerBuilding(themedEvents.filter(isCourseEvent)), [themedEvents]);
    const customEventMarkers = useMemo(
        () => getCustomEventPerBuilding(themedEvents.filter(isCustomEvent)),
        [themedEvents]
    );
    const postHog = usePostHog();
    const isDark = useThemeStore((store) => store.isDark);

    useEffect(() => {
        logAnalytics(postHog, {
            category: analyticsEnum.map,
            action: analyticsEnum.map.actions.OPEN,
        });
    }, [postHog]);

    useEffect(() => {
        const updateFromStore = () => {
            setRawCalendarEvents(AppStore.getEventsInCalendar());
        };

        AppStore.on('addedCoursesChange', updateFromStore);
        AppStore.on('customEventsChange', updateFromStore);
        AppStore.on('currentScheduleIndexChange', updateFromStore);
        AppStore.on('colorChange', updateFromStore);

        return () => {
            AppStore.removeListener('addedCoursesChange', updateFromStore);
            AppStore.removeListener('customEventsChange', updateFromStore);
            AppStore.removeListener('currentScheduleIndexChange', updateFromStore);
            AppStore.removeListener('colorChange', updateFromStore);
        };
    }, []);

    useEffect(() => {
        const locationID = Number(searchParams.get('location') ?? 0);
        const building = locationID in buildingCatalogue ? buildingCatalogue[locationID] : undefined;

        if (building == null) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            map.current?.flyTo([building.lat + 0.001, building.lng], 18, { duration: 250, animate: false });
            markerRef.current?.openPopup();
        }, 250);

        return () => {
            window.clearTimeout(timeoutId);
        };
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

        const acronym = getBuildingNameAcronym(focusedBuilding.name);

        return {
            ...focusedBuilding,
            image: focusedBuilding.imageURLs[0],
            acronym,
            location: focusedBuilding.name,
        };
    }, [searchParams]);

    /**
     * Get markers for unique courses (identified by term + section code) that occur today, sorted by start time.
     * A duplicate section found later in the array will have a higher index.
     */
    const markersToDisplay = useMemo(() => {
        const markerValues = Object.keys(markers).flatMap((markerKey) => markers[markerKey]);

        const markersToday =
            today === 'All' ? markerValues : markerValues.filter((course) => course.start.toString().includes(today));

        return markersToday
            .sort((a, b) => a.start.getTime() - b.start.getTime())
            .filter(
                (marker, i, arr) =>
                    arr.findIndex(
                        (other) =>
                            scheduleSectionKey(other.term, other.sectionCode) ===
                            scheduleSectionKey(marker.term, marker.sectionCode)
                    ) === i
            );
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
            <MapContainer
                ref={map}
                center={CAMPUS_CENTER}
                zoom={16}
                style={{ height: '100%' }}
                maxBounds={CAMPUS_BOUNDS}
                maxBoundsViscosity={1}
            >
                {/* Menu floats above the map. */}
                <Paper sx={{ position: 'relative', mx: 'auto', my: 2, width: '70%', zIndex: 400 }}>
                    <Tabs
                        value={selectedDayIndex}
                        onChange={handleChange}
                        variant="fullWidth"
                        sx={{ minHeight: 0 }}
                        textColor="secondary"
                        indicatorColor="secondary"
                    >
                        {days.map((day) => (
                            <Tab key={day} label={day} sx={{ padding: 1, minHeight: 'auto', minWidth: '10%' }} />
                        ))}
                    </Tabs>
                    <BuildingSelect onChange={onBuildingChange} variant="filled" />
                </Paper>

                <TileLayer
                    key={isDark ? 'dark' : 'light'}
                    attribution={ATTRIBUTION_MARKUP}
                    url={`${MAPBOX_PROXY_TILES_ENDPOINT}/${isDark ? 'dark-v11' : 'streets-v11'}/512/{z}/{x}/{y}@2x`}
                    tileSize={512}
                    maxZoom={21}
                    minZoom={15}
                    zoomOffset={-1}
                />

                <UserLocator />

                {/* Draw out routes if the user is viewing a specific day. */}
                {today !== 'All' &&
                    startDestPairs.map((startDestPair, pairIndex) => {
                        const latLngTuples = startDestPair.map((marker) => [marker.lat, marker.lng] as LatLngTuple);
                        const latLngKey = latLngTuples.map((t) => `${t[0]},${t[1]}`).join('|');
                        const key = `route-${pairIndex}-${latLngKey}`;
                        const color = startDestPair[0]?.color;
                        return <Routes key={key} latLngTuples={latLngTuples} color={color} />;
                    })}

                {/* Draw a marker for each class that occurs today. */}
                {(() => {
                    const stackCountByPrimaryBuilding: Record<string, number> = {};
                    return markersToDisplay.map((marker, index) => {
                        const primaryBuilding = marker.locations[0].building;
                        const stackIndex = stackCountByPrimaryBuilding[primaryBuilding] ?? 0;
                        stackCountByPrimaryBuilding[primaryBuilding] = stackIndex + 1;

                        const allRoomsInBuilding = marker.locations
                            .filter((location) => location.building === primaryBuilding)
                            .reduce((roomList, location) => [...roomList, location.room], [] as string[]);

                        return (
                            <Fragment key={scheduleSectionKey(marker.term, marker.sectionCode)}>
                                <LocationMarker
                                    {...marker}
                                    label={today === 'All' ? undefined : (index + 1).toString()}
                                    stackIndex={stackIndex}
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
                    });
                })()}

                {/* Draw a marker for each custom Event that occurs today. */}
                {customEventMarkersToDisplay.map((customEventMarkers, index) => {
                    const customEventSameBuildingPrior = customEventMarkersToDisplay.slice(0, index);

                    return (
                        <Fragment key={customEventMarkers.key}>
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
