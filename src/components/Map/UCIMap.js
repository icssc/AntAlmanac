import React, { Component, Fragment } from 'react';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import yellowpages from './yellowpages';
import locations from '../CoursePane/locations.json';
import Locator from './Locator';
import MuiDownshift from 'mui-downshift';
import { Tab, Tabs, Fab } from '@material-ui/core/';
import WalkIcon from '@material-ui/icons/DirectionsWalk';

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

export default class UCIMap extends Component<{}, State> {
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
  };

  filterLocations = (changes) => {
    if (typeof changes.inputValue === 'string') {
      const filteredItems = yellowpages.filter((item) =>
        item.label.toLowerCase().includes(changes.inputValue.toLowerCase())
      );
      this.setState({ filteredItems: filteredItems });
    }
  };

  createMarkers = () => {
    let trace = [];

    this.props.eventsInCalendar.forEach((event) => {
      //filter out those in a different sched
      if (event.scheduleIndex !== this.props.currentScheduleIndex) return;
      //filter out those not on a certain day (mon, tue, etc)
      if (!event.start.toString().includes(DAYS[this.state.day])) return;

      //try catch for finding the location of classes
      let lat = null;
      let lng = null;
      let loc = null;
      let acronym = null;
      try {
        loc = yellowpages.find((entry) => {
          return entry.id === locations[event.location.split(' ')[0]];
        });
        lat = loc.lat;
        lng = loc.lng;
        acronym = event.location.split(' ')[0];
      } catch (e) {
        return;
      }

      //hotfix for when some events have undefined colors
      let pin_color = '';
      if (event.color === undefined) {
        pin_color = '#0000FF';
      } else {
        pin_color = event.color;
      }
      const blding = loc.label;

      //collect all the events for the map
      trace.push({
        lat: lat,
        lng: lng,
        color: pin_color,
        blding: blding,
        acronym: acronym,
        url: loc.url,
        img: loc.img,
        sections: [
          event.title + ' ' + event.courseType,
          event.location.split(' ')[1],
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
                  'http://www.classrooms.uci.edu/classrooms/' + item.acronym
                }
                target="_blank"
                rel="noopener noreferrer"
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
                    rel="noopener noreferrer"
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
                style={{ minWidth: '10%', backgroundColor: '#FFFFFF' }}
              />
              <Tab
                label="Mon"
                style={{ minWidth: '10%', backgroundColor: '#FFFFFF' }}
              />
              <Tab
                label="Tue"
                style={{ minWidth: '10%', backgroundColor: '#FFFFFF' }}
              />
              <Tab
                label="Wed"
                style={{ minWidth: '10%', backgroundColor: '#FFFFFF' }}
              />
              <Tab
                label="Thu"
                style={{ minWidth: '10%', backgroundColor: '#FFFFFF' }}
              />
              <Tab
                label="Fri"
                style={{ minWidth: '10%', backgroundColor: '#FFFFFF' }}
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
              {...this.props}
              // inputRef={(node) => {
              //   this.input = node;
              // }}
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
            attribution='&amp;copy<a href="https://www.mapbox.com/" target="_blank" rel="noopener noreferrer">Mapbox</a> | Building images from <a href="https://map.uci.edu/?id=463" target="_blank" rel="noopener noreferrer">UCI Map</a>'
            // url = "https://api.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"
            // url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
            url="https://api.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"
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
                    rel="noopener noreferrer"
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
                  href={GMAPURL + this.state.lat + ',' + this.state.lng}
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
