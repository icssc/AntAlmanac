import React, { Fragment, PureComponent } from 'react';
import { Map, TileLayer, withLeaflet } from 'react-leaflet';
import buildingCatalogue from './static/buildingCatalogue';
import locations from '../SectionTable/static/locations.json';
import AppStore from '../../stores/AppStore';
import DayTabs from './MapTabsAndSearchBar';
import MapMarkerPopup from './MapMarkerPopup';
import Locate from 'leaflet.locatecontrol';

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
        currentScheduleIndex: AppStore.getCurrentScheduleIndex(),
    };

    updateCurrentScheduleIndex = () => {
        this.setState({ currentScheduleIndex: AppStore.getCurrentScheduleIndex() });
    };

    updateEventsInCalendar = () => {
        this.setState({
            eventsInCalendar: AppStore.getEventsInCalendar(),
        });
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

        this.state.eventsInCalendar.forEach((event) => {
            // Filter out those in a different schedule or those not on a certain day (mon, tue, etc)
            if (
                !event.scheduleIndices.includes(this.state.currentScheduleIndex) ||
                !event.start.toString().includes(DAYS[this.state.day])
            )
                return;

            // Get building code, get id of building code, which will get us the building data from buildingCatalogue
            const buildingCode = event.bldg.split(' ')[0];
            const id = locations[buildingCode];
            const locationData = buildingCatalogue[id];
            const courseString = `${event.title} ${event.sectionType} @ ${event.bldg}`;

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
                >
                    <Fragment>
                        <hr />
                        Class: {`${event.title} ${event.sectionType}`}
                        <br />
                        Room: {event.bldg.split(' ')[1]}
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

                    {this.createMarkers()}

                    {this.state.selected ? (
                        <MapMarkerPopup
                            image={this.state.selected_img}
                            location={this.state.selected}
                            lat={this.state.lat}
                            lng={this.state.lng}
                            acronym={this.state.selected_acronym}
                            markerColor="#FF0000"
                        />
                    ) : null}
                </Map>
            </Fragment>
        );
    }
}
