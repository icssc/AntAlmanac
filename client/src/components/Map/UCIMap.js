import React, { Component, Fragment, PureComponent } from 'react';
import { Map, TileLayer, withLeaflet } from 'react-leaflet';
import buildingCatalogue from './buildingCatalogue';
import locations from '../SectionTable/static/locations.json';
import AppStore from '../../stores/AppStore';
import DayTabs from './MapTabsAndSearchBar';
import MapMarkerPopup from './MapMarkerPopup';
import Locate from 'leaflet.locatecontrol';

const coordsInArr = (arr, coords) => {
    const coords_str = JSON.stringify(coords);
    return arr.some((ele) => JSON.stringify(ele) === coords_str);
};

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

export default class UCIMap extends PureComponent {
    state = {
        lat: 33.6459,
        lng: -117.842717,
        zoom: 16,
        markers: [],
        day: 0,
        selected: null,
        selected_img: '',
        selected_url: '',
        selected_acronym: '',
        eventsInCalendar: AppStore.getEventsInCalendar(),
        currentScheduleIndex: AppStore.getCurrentScheduleIndex(),
    };

    updateCurrentScheduleIndex = () => {
        this.setState({
            currentScheduleIndex: AppStore.getCurrentScheduleIndex(),
        });
    };

    updateEventsInCalendar = () => {
        this.setState({
            eventsInCalendar: AppStore.getEventsInCalendar(),
        });
    };

    componentDidMount = () => {
        AppStore.on('addedCoursesChange', this.updateEventsInCalendar);
        AppStore.on(
            'currentScheduleIndexChange',
            this.updateCurrentScheduleIndex
        );
    };

    componentWillUnmount = () => {
        AppStore.removeListener(
            'addedCoursesChange',
            this.updateEventsInCalendar
        );
        AppStore.removeListener(
            'currentScheduleIndexChange',
            this.updateCurrentScheduleIndex
        );
    };

    createMarkers = () => {
        let trace = [];

        this.state.eventsInCalendar.forEach((event) => {
            //filter out those in a different schedule or those not on a certain day (mon, tue, etc)
            if (
                !event.scheduleIndices.includes(
                    this.state.currentScheduleIndex
                ) ||
                !event.start.toString().includes(DAYS[this.state.day])
            )
                return;

            //try catch for finding the location of classes
            let lat = null;
            let lng = null;
            let loc = null;
            let acronym = null;

            try {
                loc = buildingCatalogue.find((entry) => {
                    return entry.id === locations[event.bldg.split(' ')[0]];
                });
                lat = loc.lat;
                lng = loc.lng;
                acronym = event.bldg.split(' ')[0];
            } catch (e) {
                return;
            }

            //collect all the events for the map
            trace.push({
                lat: lat,
                lng: lng,
                color: event.color,
                blding: loc.label,
                acronym: acronym.toLowerCase(),
                url: loc.url,
                img: loc.img,
                sections: [
                    event.title + ' ' + event.sectionType,
                    event.bldg.split(' ')[1],
                ],
            });
        });

        // Tracks coords to shift the marker appropriately
        let usedCoords = [];

        // Tracks courses that have already been pinned on the map, so there are
        // no duplicates
        let pinnedCourses = [];

        let markers = []; //to put into a list of markers
        let lngTemp = 0;

        trace.forEach((item) => {
            // Current course is already pinned on map
            if (pinnedCourses.includes(item.sections[0])) return;

            lngTemp = item.lng;
            while (coordsInArr(usedCoords, [item.lat, lngTemp])) {
                lngTemp += 0.00015;
            }

            usedCoords.push([item.lat, lngTemp]);
            pinnedCourses.push(item.sections[0]);

            markers.push(
                <MapMarkerPopup
                    image={item.img}
                    markerColor={item.color}
                    location={item.blding}
                    lat={item.lat}
                    lng={item.lng}
                    acronym={item.acronym}
                >
                    <Fragment>
                        <hr />
                        Class: {item.sections[0]}
                        <br />
                        Room:{' '}
                        {item.url ? (
                            <a
                                href={`http://www.classrooms.uci.edu/classrooms/${item.acronym}/${item.acronym}-${item.sections[1]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {item.sections[1]}
                            </a>
                        ) : (
                            item.sections[1]
                        )}
                    </Fragment>
                </MapMarkerPopup>
            );
        });

        return markers;
    };

    handleSearch = (event, newValue) => {
        if (newValue) {
            let temp = newValue.label.split(' ').pop();
            temp = temp.slice(1, temp.length - 1);

            this.setState({
                lat: newValue.lat,
                lng: newValue.lng,
                selected: newValue.label,
                selected_acronym: temp,
                zoom: 18,
            });

            // If there is an image, add the image and url
            if (newValue.img) {
                this.setState({
                    selected_img: newValue.img,
                    selected_url: newValue.url,
                });
            } else {
                this.setState({ selected_img: '', selected_url: '' });
            }
        } else {
            this.setState({ selected: null });
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
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors | Images from <a href="https://map.uci.edu/?id=463">UCI Map</a>'
                        url="https://api.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"
                        // url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
                    />

                    {this.createMarkers()}

                    {this.state.selected ? (
                        <MapMarkerPopup
                            url={this.state.selected_url}
                            image={this.state.selected_img}
                            location={this.state.selected}
                            lat={this.state.lat}
                            lng={this.state.lng}
                            acronym={this.state.selected_acronym}
                            markerColor="#FF0000"
                        />
                    ) : (
                        <Fragment />
                    )}
                </Map>
            </Fragment>
        );
    }
}
