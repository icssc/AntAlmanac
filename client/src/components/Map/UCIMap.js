import React, { Fragment, PureComponent } from 'react';
import { Map, TileLayer, withLeaflet, Polyline, Marker } from 'react-leaflet';
import buildingCatalogue from './static/buildingCatalogue';
import locations from '../SectionTable/static/locations.json';
import AppStore from '../../stores/AppStore';
import DayTabs from './MapTabsAndSearchBar';
import MapMarkerPopup from './MapMarkerPopup';
import Locate from 'leaflet.locatecontrol';
import Leaflet from 'leaflet';

class LocateControl extends PureComponent {
    componentDidMount() {
        const { map } = this.props.leaflet;

        const lc = new Locate({
            position: 'topleft',
            strings: {
                title: 'Look for your lost soul',
            },
            flyTo: true,
        });
        lc.addTo(map);
    }

    render() {
        return null;
    }
}

LocateControl = withLeaflet(LocateControl);

const DAYS = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const ACCESS_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
const ATTRIBUTION_MARKUP =
    '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors | Images from <a href="https://map.uci.edu/?id=463">UCI Map</a>';
const DIRECTIONS_ENDPOINT = 'https://api.mapbox.com/directions/v5/mapbox/walking/';

export default class UCIMap extends PureComponent {
    state = {
        lat: 33.6459,
        lng: -117.842717,
        zoom: 16,
        markers: [],
        day: 0,
        selected: null,
        selected_img: '',
        selected_acronym: '',
        eventsInCalendar: AppStore.getEventsInCalendar(),
        poly: [],
        info_markers: [],
        info_marker: null,
    };

    generateRoute = (day) => {
        // Clear any existing route on the map
        this.setState({ poly: [], info_marker: null });

        if (day) {
            let index = 0;
            let coords = ''; // lat and lng of markers to be passed to api
            let coords_array = []; // lat and lng of markers to be used later
            let colors = [];

            // Filter out those in a different schedule or those not on a certain day (mon, tue, etc)
            this.state.eventsInCalendar
                .filter(
                    (event) =>
                        !(
                            event.isCustomEvent ||
                            !event.scheduleIndices.includes(AppStore.getCurrentScheduleIndex()) ||
                            !event.start.toString().includes(DAYS[day])
                        )
                )
                .sort((event, event2) => event.start - event2.start)
                .forEach((event) => {
                    // Get building code, get id of building code, which will get us the building data from buildingCatalogue
                    const buildingCode = event.bldg.split(' ').slice(0, -1).join(' ');
                    const id = locations[buildingCode];
                    const locationData = buildingCatalogue[id];

                    if (locationData === undefined) return;

                    colors.push(event.color);

                    if (coords) {
                        coords += ';';
                    }
                    coords += locationData.lng + ',' + locationData.lat;
                    coords_array.push([locationData.lat, locationData.lng]);

                    index++;
                });
            if (index > 1) {
                var url = new URL(DIRECTIONS_ENDPOINT + encodeURIComponent(coords));

                url.search = new URLSearchParams({
                    alternatives: false,
                    geometries: 'geojson',
                    steps: false,
                    access_token: ACCESS_TOKEN,
                }).toString();

                fetch(url, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                }).then((response) => {
                    response.json().then((obj) => {
                        let coordinates = obj['routes'][0]['geometry']['coordinates']; // The coordinates for the lines of the routes
                        let waypoints = obj['waypoints']; // The waypoints we specified in the request
                        let waypointIndex = 0; // The current waypoint we are building a path from
                        let path = [
                            [[waypoints[waypointIndex]['location'][1], waypoints[waypointIndex]['location'][0]]],
                        ]; // Path is a list of paths for each waypoint. For example, path[0] is the path to waypoint 0, path[1] is the path from 0 to 1... etc.

                        let poly = []; // Arrays of polyline to be added to map
                        let info_markers = [];

                        poly.push(
                            <Polyline color={colors[0]} positions={[path[0][0], coords_array[0]]} dashArray="4" />
                        ); // Draw a dashline from waypoint 0 to start of route

                        for (let [lat, lng] of coordinates) {
                            path[waypointIndex].push([lng, lat]); // Creates a path using lat and lng of coordinates until lat and lng matches one of the waypoint's coordinates
                            if (
                                lat === waypoints[waypointIndex]['location'][0] &&
                                lng === waypoints[waypointIndex]['location'][1]
                            ) {
                                path.push([[lng, lat]]);
                                if (waypointIndex !== 0) {
                                    function setInfoMarker(event) {
                                        let [color, duration, miles] = this.options.map.state.info_markers[
                                            this.options.index - 1
                                        ];
                                        this.options.map.setState({
                                            info_marker: (
                                                <Marker
                                                    position={event.latlng}
                                                    opacity={1.0}
                                                    icon={Leaflet.divIcon({
                                                        iconAnchor: [0, 14],
                                                        labelAnchor: [-3.5, 0],
                                                        popupAnchor: [0, -21],
                                                        className: '',
                                                        iconSize: [1000, 14],
                                                        html: `<div style="position:relative; top:-200%; left:2px; pointer-events: none; background-color: white; border-left-color: ${color}; border-left-style: solid; width: fit-content; border-left-width: 5px; padding-left: 10px; padding-right: 10px; padding-top: 4px; padding-bottom: 4px;">
                                                            <span style="color:${color}">
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
                                            zIndexOffset={100}
                                            color={colors[waypointIndex - 1]}
                                            positions={path[waypointIndex]}
                                            index={waypointIndex}
                                            map={this}
                                            onmouseover={setInfoMarker}
                                            onmouseout={function () {
                                                this.options.map.setState({ info_marker: null });
                                            }}
                                            onmousemove={setInfoMarker}
                                        />
                                    ); // Draw path from last waypoint to next waypoint

                                    poly.push(
                                        <Polyline
                                            color={colors[waypointIndex - 1]}
                                            positions={[
                                                path[waypointIndex][path[waypointIndex].length - 1],
                                                coords_array[waypointIndex],
                                            ]}
                                            dashArray="4"
                                        />
                                    ); // Draw a dashed line directly to waypoint
                                    let duration =
                                        obj['routes'][0]['legs'][waypointIndex - 1]['duration'] > 30
                                            ? Math.round(
                                                  obj['routes'][0]['legs'][waypointIndex - 1]['duration'] / 60
                                              ).toString() + ' min'
                                            : '<1 min';
                                    let miles =
                                        (
                                            Math.floor(
                                                obj['routes'][0]['legs'][waypointIndex - 1]['distance'] / 1.609 / 10
                                            ) / 100
                                        ).toString() + ' mi';
                                    // Add marker info (colors, duration, mile)
                                    info_markers.push([colors[waypointIndex - 1], duration, miles]);
                                }
                                waypointIndex++;
                            }
                        }
                        this.setState({ poly: poly, info_markers: info_markers, info_marker: null });
                    });
                });
            }
        }
    };

    updateCurrentScheduleIndex = () => {
        this.generateRoute(this.state.day);
    };

    updateEventsInCalendar = () => {
        this.setState({
            eventsInCalendar: AppStore.getEventsInCalendar(),
        });
        this.generateRoute(this.state.day);
    };

    componentDidMount = () => {
        AppStore.on('addedCoursesChange', this.updateEventsInCalendar);
        AppStore.on('currentScheduleIndexChange', this.updateCurrentScheduleIndex);
    };

    componentWillUnmount = () => {
        AppStore.removeListener('addedCoursesChange', this.updateEventsInCalendar);
        AppStore.removeListener('currentScheduleIndexChange', this.updateCurrentScheduleIndex);
    };

    createMarkers = () => {
        const markers = [];

        // Tracks courses that have already been pinned on the map, so there are no duplicates
        let pinnedCourses = new Set();
        let index = 0;

        // Filter out those in a different schedule or those not on a certain day (mon, tue, etc)
        this.state.eventsInCalendar
            .filter(
                (event) =>
                    !(
                        event.isCustomEvent ||
                        !event.scheduleIndices.includes(AppStore.getCurrentScheduleIndex()) ||
                        !event.start.toString().includes(DAYS[this.state.day])
                    )
            )
            .sort((event, event2) => event.start - event2.start)
            .forEach((event) => {
                // Get building code, get id of building code, which will get us the building data from buildingCatalogue
                const buildingCode = event.bldg.split(' ').slice(0, -1).join(' ');
                const id = locations[buildingCode];
                const locationData = buildingCatalogue[id];
                const courseString = `${event.title} ${event.sectionType} @ ${event.bldg}`;

                index++; // always increment index to account for courses within the same building
                if (locationData === undefined || pinnedCourses.has(courseString)) return;

                // Acronym, if it exists, is in between parentheses
                const acronym = locationData.name.substring(
                    locationData.name.indexOf('(') + 1,
                    locationData.name.indexOf(')')
                );

                pinnedCourses.add(courseString);

                markers.push(
                    <MapMarkerPopup
                        image={locationData.imageURLs[0]}
                        markerColor={event.color}
                        location={locationData.name}
                        lat={locationData.lat}
                        lng={locationData.lng}
                        acronym={acronym}
                        index={this.state.day ? index.toString() : ''}
                    >
                        <Fragment>
                            <hr />
                            Class: {`${event.title} ${event.sectionType}`}
                            <br />
                            Room: {event.bldg.split(' ').slice(-1)}
                        </Fragment>
                    </MapMarkerPopup>
                );
            });
        return markers;
    };

    handleSearch = (event, searchValue) => {
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
            <Fragment>
                <Map
                    center={[this.state.lat, this.state.lng]}
                    zoom={this.state.zoom}
                    maxZoom={19}
                    style={{ height: '100%' }}
                >
                    <DayTabs
                        day={this.state.day}
                        setDay={(day) => {
                            this.setState({ day: day });
                            this.generateRoute(day);
                        }}
                        handleSearch={this.handleSearch}
                    />

                    <LocateControl />

                    <TileLayer
                        attribution={ATTRIBUTION_MARKUP}
                        url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${ACCESS_TOKEN}`}
                        tileSize={512}
                        zoomOffset={-1}
                    />

                    {this.state.poly}

                    {this.state.info_marker}

                    {this.createMarkers()}

                    {this.state.selected ? (
                        <MapMarkerPopup
                            image={this.state.selected_img}
                            location={this.state.selected}
                            lat={this.state.lat}
                            lng={this.state.lng}
                            acronym={this.state.selected_acronym}
                            markerColor="#FF0000"
                            index=""
                        />
                    ) : null}
                </Map>
            </Fragment>
        );
    }
}
