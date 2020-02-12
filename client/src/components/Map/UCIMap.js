import React, { Component, Fragment, PureComponent } from 'react';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import yellowpages from './yellowpages';
import locations from '../SectionTable/static/locations.json';
import Locator from './Locator';
import MuiDownshift from 'mui-downshift';
import { Tab, Tabs, Fab } from '@material-ui/core';
import WalkIcon from '@material-ui/icons/DirectionsWalk';
import AppStore from '../../stores/AppStore';

function coordsInArr(arr, coords) {
    let coords_str = JSON.stringify(coords);

    let contains = arr.some(function(ele) {
        return JSON.stringify(ele) === coords_str;
    });

    return contains;
}

const locateOptions = {
    position: 'topleft',
    strings: {
        title: 'Look for your lost soul',
    },
    flyTo: true,
};

const DAYS = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const GMAPURL =
    'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=';

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
        filteredItems: yellowpages,
        eventsInCalendar: [],
        currentScheduleIndex: AppStore.getCurrentScheduleIndex(),
    };

    calendarizeCourseEvents = () => {
        const addedCourses = AppStore.getAddedCourses();
        const courseEventsInCalendar = [];

        for (const course of addedCourses) {
            for (const meeting of course.section.meetings) {
                const timeString = meeting.time.replace(/\s/g, '');

                if (timeString !== 'TBA') {
                    let [
                        ,
                        startHr,
                        startMin,
                        endHr,
                        endMin,
                        ampm,
                    ] = timeString.match(
                        /(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(p?)/
                    );

                    startHr = parseInt(startHr, 10);
                    startMin = parseInt(startMin, 10);
                    endHr = parseInt(endHr, 10);
                    endMin = parseInt(endMin, 10);

                    let dates = [
                        meeting.days.includes('M'),
                        meeting.days.includes('Tu'),
                        meeting.days.includes('W'),
                        meeting.days.includes('Th'),
                        meeting.days.includes('F'),
                    ];

                    if (ampm === 'p' && endHr !== 12) {
                        startHr += 12;
                        endHr += 12;
                        if (startHr > endHr) startHr -= 12;
                    }

                    dates.forEach((shouldBeInCal, index) => {
                        if (shouldBeInCal) {
                            const newEvent = {
                                color: course.color,
                                // term: term,
                                title:
                                    course.deptCode + ' ' + course.courseNumber,
                                courseTitle: course.courseTitle,
                                bldg: meeting.bldg,
                                instructors: course.section.instructors,
                                sectionCode: course.section.sectionCode,
                                sectionType: course.section.sectionType,
                                start: new Date(
                                    2018,
                                    0,
                                    index + 1,
                                    startHr,
                                    startMin
                                ),
                                end: new Date(
                                    2018,
                                    0,
                                    index + 1,
                                    endHr,
                                    endMin
                                ),
                                isCustomEvent: false,
                                scheduleIndices: course.scheduleIndices,
                            };

                            courseEventsInCalendar.push(newEvent);
                        }
                    });
                }
            }
        }

        this.setState(
            {
                eventsInCalendar: courseEventsInCalendar,
            },
            () => {
                console.log(this.state.eventsInCalendar);
            }
        );
    };

    filterLocations = (changes) => {
        if (typeof changes.inputValue === 'string') {
            const filteredItems = yellowpages.filter((item) =>
                item.label
                    .toLowerCase()
                    .includes(changes.inputValue.toLowerCase())
            );
            this.setState({ filteredItems: filteredItems });
        }
    };

    updateCurrentScheduleIndex = () => {
        this.setState({
            currentScheduleIndex: AppStore.getCurrentScheduleIndex(),
        });
    };

    componentDidMount = () => {
        AppStore.on('addedCoursesChange', this.calendarizeCourseEvents);
        AppStore.on(
            'currentScheduleIndexChange',
            this.updateCurrentScheduleIndex
        );
        this.calendarizeCourseEvents();
    };

    createMarkers = () => {
        let trace = [];

        this.state.eventsInCalendar.forEach((event) => {
            //filter out those in a different sched
            if (
                !event.scheduleIndices.includes(this.state.currentScheduleIndex)
            )
                return;
            //filter out those not on a certain day (mon, tue, etc)
            if (!event.start.toString().includes(DAYS[this.state.day])) return;

            //try catch for finding the location of classes
            let coords = [];
            let lat = null;
            let lng = null;
            let loc = null;
            let acronym = null;
            try {
                loc = yellowpages.find((entry) => {
                    return entry.id === locations[event.bldg.split(' ')[0]];
                });
                lat = loc.lat;
                lng = loc.lng;
                acronym = event.bldg.split(' ')[0];
            } catch (e) {
                console.log(e);
                return;
            }

            //hotfix for when some events have undefined colors

            //collect all the events for the map
            trace.push({
                lat: lat,
                lng: lng,
                color: event.color,
                blding: loc.label,
                acronym: acronym,
                url: loc.url,
                img: loc.img,
                sections: [
                    event.title + ' ' + event.sectionType,
                    event.bldg.split(' ')[1],
                ],
            });
        });

        // Tracks coords to shift the marker appropritately
        let usedCoords = [];

        // Tracks courses that have already been pinned on the map, so there are
        // no duplicates
        let pinnedCourses = [];

        let markers = []; //to put into a list of markers
        let lngTemp = 0;

        trace.forEach((item, index) => {
            // Current course is already pinned on map
            if (pinnedCourses.includes(item.sections[0])) return;

            lngTemp = item.lng;
            while (coordsInArr(usedCoords, [item.lat, lngTemp])) {
                lngTemp += 0.00015;
            }

            usedCoords.push([item.lat, lngTemp]);
            pinnedCourses.push(item.sections[0]);

            // Makes acronym able to be used in the URL for classrooms
            item.acronym = item.acronym.toLowerCase();

            markers.push(
                <Marker
                    position={[item.lat, lngTemp]}
                    icon={L.divIcon({
                        className: 'my-custom-pin',
                        iconAnchor: [0, 14],
                        labelAnchor: [-3.5, 0],
                        popupAnchor: [0, -21],
                        html: `<div style="position:relative;
                  left: -1rem;
                  top: -1rem;">
                    <span style="background-color: ${item.color};
                      width: 1.75rem;
                      height: 1.75rem;
                      position: absolute;
                      border-radius: 1.9rem 1.9rem 0;
                      transform: rotate(45deg);
                      border: 1px solid #FFFFFF" >
                    </span>
                    <div style="position: absolute;
                      width: 1.75rem;
                      height: 1.75rem;
                      top: 0.25rem;
                      text-align: center" >
                      ${this.state.day ? index + 1 : ''}
                    </div>
                  <div>`,
                    })}
                >
                    <Popup>
                        {item.url ? (
                            <a
                                href={
                                    'http://www.classrooms.uci.edu/classrooms/' +
                                    item.acronym
                                }
                                target="_blank"
                            >
                                {' '}
                                {item.blding}{' '}
                            </a>
                        ) : (
                            item.blding
                        )}

                        <br />

                        {item.img ? (
                            <img
                                src={
                                    'https://www.myatlascms.com/map/lib/image-cache/i.php?mapId=463&image=' +
                                    item.img +
                                    '&w=900&h=508&r=1'
                                }
                                alt="Building Snapshot"
                                style={{ width: '100%' }}
                            />
                        ) : null}

                        {
                            <Fragment>
                                <hr />
                                Class: {item.sections[0]}
                                <br />
                                Room:{' '}
                                {item.url ? (
                                    <a
                                        href={
                                            'http://www.classrooms.uci.edu/classrooms/' +
                                            item.acronym +
                                            '/' +
                                            item.acronym +
                                            '-' +
                                            item.sections[1]
                                        }
                                        target="_blank"
                                    >
                                        {item.sections[1]}
                                    </a>
                                ) : (
                                    item.sections[1]
                                )}
                            </Fragment>
                        }

                        <br />
                        <br />
                        <Fab
                            variant="extended"
                            aria-label="delete"
                            size="small"
                            href={GMAPURL + item.lat + ',' + item.lng}
                            target="_blank"
                            format="centered"
                        >
                            <WalkIcon /> Walk Here
                        </Fab>
                    </Popup>
                </Marker>
            );
        });
        return markers;
    };

    handleSearch = (selected) => {
        if (selected) {
            let temp = selected.label.split(' ').pop();
            temp = temp.slice(1, temp.length - 1);

            this.setState({
                lat: selected.lat,
                lng: selected.lng,
                selected: selected.label,
                selected_acronym: temp,
                zoom: 18,
            });

            // If there is an image, add the image and url
            if (selected.img) {
                this.setState({ selected_img: selected.img });
                this.setState({ selected_url: selected.url });
            } else {
                this.setState({ selected_img: '' });
                this.setState({ selected_url: '' });
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
                    <div
                        style={{
                            // position: 'sticky',
                            zIndex: 1000,
                            marginLeft: 45,
                            marginRight: 45,
                            marginTop: 11,
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                        }}
                    >
                        <Tabs
                            value={this.state.day}
                            onChange={(event, newValue) => {
                                this.setState({ day: newValue });
                            }}
                            indicatorColor="primary"
                            textColor="primary"
                            variant="standard"
                            scrollButtons="auto"
                            centered
                        >
                            <Tab
                                label="All"
                                style={{
                                    minWidth: '10%',
                                    backgroundColor: '#FFFFFF',
                                }}
                            />
                            <Tab
                                label="Mon"
                                style={{
                                    minWidth: '10%',
                                    backgroundColor: '#FFFFFF',
                                }}
                            />
                            <Tab
                                label="Tue"
                                style={{
                                    minWidth: '10%',
                                    backgroundColor: '#FFFFFF',
                                }}
                            />
                            <Tab
                                label="Wed"
                                style={{
                                    minWidth: '10%',
                                    backgroundColor: '#FFFFFF',
                                }}
                            />
                            <Tab
                                label="Thu"
                                style={{
                                    minWidth: '10%',
                                    backgroundColor: '#FFFFFF',
                                }}
                            />
                            <Tab
                                label="Fri"
                                style={{
                                    minWidth: '10%',
                                    backgroundColor: '#FFFFFF',
                                }}
                            />
                        </Tabs>
                    </div>

                    <div
                        style={{
                            minWidth: '60%',
                            position: 'relative',
                            marginLeft: '15%',
                            marginRight: '15%',
                            marginTop: 5,
                            backgroundColor: '#FFFFFF',
                            zIndex: 1000,
                        }}
                    >
                        <MuiDownshift
                            items={this.state.filteredItems}
                            onStateChange={this.filterLocations}
                            getInputProps={() => ({
                                // Downshift requires this syntax to pass down these props to the text field
                                label: '  Search for...',
                                required: true,
                            })}
                            onChange={this.handleSearch}
                            menuItemCount={window.innerWidth > 960 ? 6 : 3}
                        />
                    </div>

                    <Locator options={locateOptions} />

                    <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors | Images from <a href="https://map.uci.edu/?id=463">UCI Map</a>'
                        //url = "https://api.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"
                        url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
                    />

                    {this.createMarkers()}

                    {this.state.selected ? (
                        <Marker
                            position={[this.state.lat, this.state.lng]}
                            icon={L.divIcon({
                                className: 'my-custom-pin',
                                iconAnchor: [0, 14],
                                labelAnchor: [-3.5, 0],
                                popupAnchor: [0, -21],
                                html: `<span style="background-color: #FF0000;
                            width: 1.75rem;
                            height: 1.75rem;
                            display: block;
                            left: -1rem;
                            top: -1rem;
                            position: relative;
                            border-radius: 1.9rem 1.9rem 0;
                            transform: rotate(45deg);
                            border: 1px solid #FFFFFF" />`,
                            })}
                        >
                            <Popup>
                                {this.state.selected_url ? (
                                    <a
                                        href={
                                            'http://www.classrooms.uci.edu/classrooms/' +
                                            this.state.selected_acronym
                                        }
                                        target="_blank"
                                    >
                                        {' '}
                                        {this.state.selected}{' '}
                                    </a>
                                ) : (
                                    this.state.selected
                                )}
                                <br />
                                {this.state.selected_img ? (
                                    <img
                                        src={
                                            'https://www.myatlascms.com/map/lib/image-cache/i.php?mapId=463&image=' +
                                            this.state.selected_img +
                                            '&w=900&h=508&r=1'
                                        }
                                        alt="Building Snapshot"
                                        style={{ width: '100%' }}
                                    />
                                ) : null}

                                <br />
                                <br />
                                <Fab
                                    variant="extended"
                                    aria-label="walk-nav"
                                    size="small"
                                    href={
                                        GMAPURL +
                                        this.state.lat +
                                        ',' +
                                        this.state.lng
                                    }
                                    target="_blank"
                                    format="centered"
                                >
                                    <WalkIcon /> Walk Here
                                </Fab>
                            </Popup>
                        </Marker>
                    ) : (
                        <Fragment />
                    )}
                </Map>
            </Fragment>
        );
    }
}
