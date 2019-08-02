import React, { Component, Fragment } from 'react';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import yellowpages from './yellowpages';
import locations from '../CoursePane/locations.json';
import Locator from './Locator';
import MuiDownshift from 'mui-downshift';
import { Tab, Tabs } from '@material-ui/core/';

const locateOptions = {
  position: 'topleft',
  strings: {
    title: 'Look for your lost soul',
  },
  flyTo: true,
};

const DAYS = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export default class UCIMap extends Component<{}, State> {
  state = {
    lat: 33.6459,
    lng: -117.842717,
    zoom: 16,
    markers: [],
    day: 0,
    selected: null,
    filteredItems: yellowpages,
  };

  filerLocations = (changes) => {
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
      let coords = [];
      let loc = null;
      try {
        loc = yellowpages.find((entry) => {
          return entry.id === locations[event.location.split(' ')[0]];
        });
        coords = [loc.lat, loc.lng];
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
        coords: coords,
        color: pin_color,
        blding: blding,
        sections: [
          event.title + ' ' + event.courseType,
          event.location.split(' ')[1],
        ],
      });
    });
    // console.log(trace);

    let markers = []; //to put into a list of markers
    trace.forEach((item) => {
      let atThisBuilding = trace.filter((section) => {
        return section.blding === item.blding;
      });
      atThisBuilding = atThisBuilding.filter((thing, index) => {
        return (
          index ===
          atThisBuilding.findIndex((obj) => {
            return JSON.stringify(obj) === JSON.stringify(thing);
          })
        );
      });
      markers.push(
        <Marker
          position={item.coords}
          icon={L.divIcon({
            className: 'my-custom-pin',
            iconAnchor: [0, 14],
            labelAnchor: [-3.5, 0],
            popupAnchor: [0, -21],
            html: `<span style="background-color: ${item.color};
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
            Building: {item.blding}
            {atThisBuilding.map((section) => {
              return (
                <Fragment>
                  <hr />
                  Class: {section.sections[0]}
                  <br />
                  Room: {section.sections[1]}
                </Fragment>
              );
            })}
          </Popup>
        </Marker>
      );
    });
    return markers;
  };

  handleSearch = (selected) => {
    if (selected) {
      this.setState({
        lat: selected.lat,
        lng: selected.lng,
        selected: selected.label,
        zoom: 18,
      });
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
          maxZoom={20}
          style={{ height: '100%' }}
        >
          <div
            style={{
              // position: 'sticky',
              zIndex: 1000,
              marginLeft: 20,
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
                style={{ minWidth: 32, backgroundColor: '#FFFFFF' }}
              />
              <Tab
                label="Mon"
                style={{ minWidth: 32, backgroundColor: '#FFFFFF' }}
              />
              <Tab
                label="Tue"
                style={{ minWidth: 32, backgroundColor: '#FFFFFF' }}
              />
              <Tab
                label="Wed"
                style={{ minWidth: 32, backgroundColor: '#FFFFFF' }}
              />
              <Tab
                label="Thu"
                style={{ minWidth: 32, backgroundColor: '#FFFFFF' }}
              />
              <Tab
                label="Fri"
                style={{ minWidth: 32, backgroundColor: '#FFFFFF' }}
              />
            </Tabs>
          </div>

          <div
            style={{
              width: '58%',
              position: 'relative',
              marginLeft: window.innerWidth > 960 ? 160 : 45,
              marginTop: 5,
              backgroundColor: '#FFFFFF',
              zIndex: 1000,
            }}
          >
            <MuiDownshift
              items={this.state.filteredItems}
              onStateChange={this.filerLocations}
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
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
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
              <Popup>Building: {this.state.selected}</Popup>
            </Marker>
          ) : (
            <Fragment />
          )}
        </Map>
      </Fragment>
    );
  }
}
