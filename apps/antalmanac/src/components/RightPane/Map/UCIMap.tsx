import Leaflet, { Control, LeafletMouseEvent } from 'leaflet';
import React, { PureComponent } from 'react';
import { LeafletContext, Map, Marker, Polyline, TileLayer, withLeaflet } from 'react-leaflet';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import AppStore from '$lib/stores/AppStore';
import { CalendarEvent, CourseEvent } from '../../Calendar/CourseCalendarEvent';
import locations from '../SectionTable/static/locations.json';
import MapMarker from './MapMarker';
import MapMenu from './MapMenu';
import Building from './static/building';
import buildingCatalogue from './static/buildingCatalogue';
import { Coord, MapBoxResponse } from './static/mapbox';


// TODO investigate less jank ways of doing this if at all possible

class LocateControl extends PureComponent<{ leaflet: LeafletContext }> {
    componentDidMount() {
        const { map } = this.props.leaflet;

        const lc = new Control.Locate({
            position: 'topleft',
            strings: {
                title: 'Look for your lost soul',
            },
            flyTo: true,
        });
        lc.addTo(map as Leaflet.Map);
    }

    render() {
        return null;
    }
}

const LocateControlLeaflet = withLeaflet(LocateControl);

const DAYS = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const ACCESS_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
const ATTRIBUTION_MARKUP =
    '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors | Images from <a href="https://map.uci.edu/?id=463">UCI Map</a>';
const DIRECTIONS_ENDPOINT = 'https://api.mapbox.com/directions/v5/mapbox/walking/';

interface UCIMapState {
    lat: number;
    lng: number;
    zoom: number;
    day: number;
    selected: string | null;
    selected_img: string;
    selected_acronym: string;
    eventsInCalendar: CalendarEvent[];
    poly: Polyline[];
    info_markers: [string[], string, string][];
    info_marker: Marker | null;
    pins: Record<string, [CourseEvent, number][]>;
}
export default class UCIMap extends PureComponent {
    state: UCIMapState = {
        lat: 33.6459,
        lng: -117.842717,
        zoom: 16,
        day: 0,
        selected: null,
        selected_img: '',
        selected_acronym: '',
        eventsInCalendar: AppStore.getEventsInCalendar(),
        poly: [],
        info_markers: [],
        info_marker: null,
        pins: {},
    };

    generateRoute = async (day: number) => {
        // Clear any existing route on the map
        this.setState({ poly: [], info_marker: null });

        if (day) {
            let index = 0;
            let coords = ''; // lat and lng of markers to be passed to api
            const coords_array: Coord[] = []; // lat and lng of markers to be used later
            const colors: string[] = [];
            const courses = new Set();

            // Filter out those in a different schedule or those not on a certain day (mon, tue, etc)
            this.state.eventsInCalendar
                .filter(
                    (event) =>
                        !(
                            (
                                event.isCustomEvent ||
                                !event.scheduleIndices.includes(AppStore.getCurrentScheduleIndex()) ||
                                !event.start.toString().includes(DAYS[day]) ||
                                courses.has(event.sectionCode) || // Remove duplicate courses that appear in the calendar
                                !courses.add(event.sectionCode)
                            ) // Adds to the set and return false
                        )
                )
                .sort((event, event2) => event.start.getTime() - event2.start.getTime())
                .forEach((event) => {
                    if (event.isCustomEvent) return;
                    // Get building code, get id of building code, which will get us the building data from buildingCatalogue
                    const buildingCode = event.bldg.split(' ').slice(0, -1).join(' ') as keyof typeof locations;
                    const id = locations[buildingCode] as keyof typeof buildingCatalogue;
                    const locationData = buildingCatalogue[id];

                    if (locationData === undefined) return;

                    colors.push(event.color);

                    if (coords) {
                        coords += ';';
                    }
                    coords += `${locationData.lng},${locationData.lat}`;
                    coords_array.push([locationData.lat, locationData.lng]);

                    index++;
                });
            if (index > 1) {
                const url = new URL(DIRECTIONS_ENDPOINT + encodeURIComponent(coords));

                url.search = new URLSearchParams({
                    alternatives: 'false',
                    geometries: 'geojson',
                    steps: 'false',
                    access_token: ACCESS_TOKEN,
                }).toString();

                const response = await fetch(url, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });
                const obj = await response.json() as MapBoxResponse;
                const coordinates = obj['routes'][0]['geometry']['coordinates']; // The coordinates for the lines of the routes
                const waypoints = obj['waypoints']; // The waypoints we specified in the request
                let waypointIndex = 0;
                const path: Coord[][] = [
                    [[waypoints[waypointIndex]['location'][1], waypoints[waypointIndex]['location'][0]]],
                ]; // Path is a list of paths for each waypoint. For example, path[0] is the path to waypoint 0, path[1] is the path from 0 to 1... etc.

                const poly = []; // Arrays of polyline to be added to map
                const info_markers = [];

                if (
                    waypoints[0]['location'][0] !== waypoints[1]['location'][0] ||
                    waypoints[0]['location'][1] !== waypoints[1]['location'][1]
                ) {
                    poly.push(
                        <Polyline
                            key="start"
                            color={colors[0]}
                            positions={[path[0][0], coords_array[0]]}
                            dashArray="4"
                        />
                    ); // Draw a dashline from waypoint 0 to start of route
                }
                for (const [lat, lng] of coordinates) {
                    path[waypointIndex].push([lng, lat]); // Creates a path using lat and lng of coordinates until lat and lng matches one of the waypoint's coordinates
                    if (
                        lat === waypoints[waypointIndex]['location'][0] &&
                        lng === waypoints[waypointIndex]['location'][1]
                    ) {
                        path.push([[lng, lat]]);
                        if (waypointIndex !== 0) {
                            if (
                                waypoints[waypointIndex - 1]['location'][0] !== lat || // Skip waypoints that are on the same location
                                waypoints[waypointIndex - 1]['location'][1] !== lng
                            ) {
                                // TODO: If anyone wants to fix this ts-ignore in the future go ahead
                                // the `this` parameter actually refers to the Polyline object this function is being passed to.
                                // the `options property of this comes from the props of that Polyline, specifically `map` and `index`
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore needs to be ignored because function definitions are not allowed in strict mode. This fix has to involve converting this function to an arrow function and not relying on accessing the index from the specific Polyline that it's being called from with the `this` parameter.
                                // eslint-disable-next-line no-inner-declarations
                                function setInfoMarker(
                                    this: { options: { map: UCIMap; index: typeof waypointIndex } },
                                    event: LeafletMouseEvent
                                ) {
                                    const [color, duration, miles] =
                                        this.options.map.state.info_markers[this.options.index - 1];
                                    this.options.map.setState({
                                        info_marker: (
                                            <Marker
                                                position={event.latlng}
                                                opacity={1.0}
                                                icon={Leaflet.divIcon({
                                                    iconAnchor: [0, 14],
                                                    popupAnchor: [0, -21],
                                                    className: '',
                                                    iconSize: [1000, 14],
                                                    html: `<div style="position:relative; top:-200%; left:2px; pointer-events: none; background-color: white; border-left-color: ${color.toString()}; border-left-style: solid; width: fit-content; border-left-width: 5px; padding-left: 10px; padding-right: 10px; padding-top: 4px; padding-bottom: 4px;">
                                                        <span style="color:${color.toString()}">
                                                        ${duration} 
                                                        </span>
                                                        <br>
                                                        <span style="color:#888888">
                                                        ${miles}
                                                        </span>
                                                    </div>`,
                                                })}
                                            ></Marker>
                                        ),
                                    });
                                }
                                poly.push(
                                    <Polyline
                                        key={poly.length}
                                        zIndexOffset={100}
                                        color={colors[waypointIndex - 1]}
                                        positions={path[waypointIndex]}
                                        index={waypointIndex}
                                        map={this}
                                        onmouseover={setInfoMarker}
                                        onmouseout={() => {
                                            this.setState({ info_marker: null });
                                        }}
                                        onmousemove={setInfoMarker}
                                    />
                                ); // Draw path from last waypoint to next waypoint

                                poly.push(
                                    <Polyline
                                        key={poly.length}
                                        color={colors[waypointIndex - 1]}
                                        positions={[
                                            path[waypointIndex][path[waypointIndex].length - 1],
                                            coords_array[waypointIndex],
                                        ]}
                                        dashArray="4"
                                    />
                                ); // Draw a dashed line directly to waypoint
                                const duration =
                                    obj['routes'][0]['legs'][waypointIndex - 1]['duration'] > 30
                                        ? Math.round(
                                              obj['routes'][0]['legs'][waypointIndex - 1]['duration'] / 60
                                          ).toString() + ' min'
                                        : '<1 min';
                                const miles =
                                    (
                                        Math.floor(
                                            obj['routes'][0]['legs'][waypointIndex - 1]['distance'] / 1.609 / 10
                                        ) / 100
                                    ).toString() + ' mi';
                                // Add marker info (colors, duration, mile)
                                info_markers.push([colors[waypointIndex - 1], duration, miles]);
                            }
                        }
                        waypointIndex++;
                    }
                }
                this.setState({ poly: poly, info_markers: info_markers, info_marker: null });
            }
        }
    };

    updateCurrentScheduleIndex = () => {
        this.createMarkers(this.state.day);
        void this.generateRoute(this.state.day);
    };

    updateEventsInCalendar = () => {
        this.setState({
            eventsInCalendar: AppStore.getEventsInCalendar(),
        });
        this.createMarkers(this.state.day);
        void this.generateRoute(this.state.day);
    };

    componentDidMount = () => {
        logAnalytics({
            category: analyticsEnum.map.title,
            action: analyticsEnum.map.actions.OPEN,
        });
        this.createMarkers(this.state.day);
        AppStore.on('addedCoursesChange', this.updateEventsInCalendar);
        AppStore.on('currentScheduleIndexChange', this.updateCurrentScheduleIndex);
    };

    componentWillUnmount = () => {
        AppStore.removeListener('addedCoursesChange', this.updateEventsInCalendar);
        AppStore.removeListener('currentScheduleIndexChange', this.updateCurrentScheduleIndex);
    };

    createMarkers = (day: number) => {
        const pins: typeof this.state.pins = {};
        const courses = new Set();
        // Tracks courses that have already been pinned on the map, so there are no duplicates

        // Filter out those in a different schedule or those not on a certain day (mon, tue, etc)
        this.state.eventsInCalendar
            .filter(
                (event) =>
                    !(
                        (
                            event.isCustomEvent ||
                            !event.scheduleIndices.includes(AppStore.getCurrentScheduleIndex()) ||
                            !event.start.toString().includes(DAYS[day]) ||
                            courses.has(event.sectionCode) || // Remove duplicate courses that appear in the calendar
                            !courses.add(event.sectionCode)
                        ) // Adds to the set and return false
                    )
            )
            .sort((event, event2) => event.start.getTime() - event2.start.getTime())
            .forEach((event, index) => {
                if (event.isCustomEvent) return;
                const buildingCode = event.bldg.split(' ').slice(0, -1).join(' ');
                if (buildingCode in pins) {
                    pins[buildingCode].push([event, index + 1]);
                } else {
                    pins[buildingCode] = [[event, index + 1]];
                }
            }); // Creates a map between buildingCodes to pins to determine stacks and store in pins
        this.setState({ pins: pins });
    };

    drawMarkers = () => {
        const markers = [];
        const pins = this.state.pins;
        for (const buildingCode in pins) {
            // Get building code, get id of building code, which will get us the building data from buildingCatalogue
            const id = locations[buildingCode as keyof typeof locations] as keyof typeof buildingCatalogue;
            const locationData = buildingCatalogue[id];
            const courses = pins[buildingCode];
            for (let index = courses.length - 1; index >= 0; index--) {
                const [event, eventIndex] = courses[index];
                const courseString = `${event.title} ${event.sectionType} @ ${event.bldg}`;
                if (locationData === undefined) return;

                // Acronym, if it exists, is in between parentheses
                const acronym = locationData.name.substring(
                    locationData.name.indexOf('(') + 1,
                    locationData.name.indexOf(')')
                );

                markers.push(
                    <MapMarker
                        key={courseString}
                        image={locationData.imageURLs[0]}
                        markerColor={event.color}
                        location={locationData.name}
                        lat={locationData.lat}
                        lng={locationData.lng}
                        acronym={acronym}
                        index={this.state.day ? eventIndex.toString() : ''}
                        stackIndex={courses.length - 1 - index}
                    >
                        <>
                            <hr />
                            Class: {`${event.title} ${event.sectionType}`}
                            <br />
                            Room: {event.bldg.split(' ').slice(-1)}
                        </>
                    </MapMarker>
                );
            }
        }
        return markers;
    };

    handleSearch = (event: React.ChangeEvent<unknown>, searchValue: Building | null) => {
        if (searchValue) {
            // Acronym, if it exists, is in between parentheses
            const acronym = searchValue.name.substring(
                searchValue.name.indexOf('(') + 1,
                searchValue.name.indexOf(')')
            );

            this.setState({
                lat: searchValue.lat,
                lng: searchValue.lng,
                selected: searchValue.name,
                selected_acronym: acronym,
                zoom: 18,
            });

            // If there is an image, add the image and url
            this.setState({
                selected_img: searchValue.imageURLs.length !== 0 ? searchValue.imageURLs[0] : null,
            });
        } else {
            this.setState({ selected: null, selected_img: null, selected_acronym: null });
        }
    };

    render() {
        return (
            <Map
                center={[this.state.lat, this.state.lng]}
                zoom={this.state.zoom}
                maxZoom={19}
                style={{ height: '100%' }}
            >
                <MapMenu
                    day={this.state.day}
                    setDay={(day) => {
                        this.createMarkers(day);
                        void this.generateRoute(day);
                        this.setState({ day: day });
                    }}
                    handleSearch={this.handleSearch}
                />

                <LocateControlLeaflet />

                <TileLayer
                    attribution={ATTRIBUTION_MARKUP}
                    url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${ACCESS_TOKEN}`}
                    tileSize={512}
                    zoomOffset={-1}
                />

                {this.state.poly}

                {this.state.info_marker}

                {this.drawMarkers()}

                {this.state.selected ? (
                    <MapMarker
                        image={this.state.selected_img}
                        location={this.state.selected}
                        lat={this.state.lat}
                        lng={this.state.lng}
                        acronym={this.state.selected_acronym}
                        markerColor="#FF0000"
                        index="!"
                        stackIndex={this.state.selected_acronym in this.state.pins ? -1 : 0}
                    />
                ) : null}
            </Map>
        );
    }
}
