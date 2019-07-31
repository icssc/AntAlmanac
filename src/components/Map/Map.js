import React, { Component, Fragment } from 'react';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import buildingInfo from './buildingInfo.json';
import Locator from './Locator';
import { Tab, Tabs } from '@material-ui/core/';

type State = {
  lat: number,
  lng: number,
  zoom: number,
};

const locateOptions = {
  position: 'topleft',
  strings: {
    title: 'Look for your lost soul',
  },
  flyTo: true,
  // onActivate: () => {} // callback before engine starts retrieving locations
};

const DAYS = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export default class UCIMap extends Component<{}, State> {
  state = {
    lat: 33.6459,
    lng: -117.842717,
    zoom: 16,
    markers: [],
    day: 0,
  };

  handleChangeDay = (event, newValue) => {
    this.setState({ day: newValue });
  };

  createMarkers = () => {
    let markers = [];

    this.props.eventsInCalendar.forEach((event) => {
      if (event.scheduleIndex !== this.props.currentScheduleIndex) return;

      if (!event.start.toString().includes(DAYS[this.state.day])) return;

      let coords = '';
      try {
        coords = buildingInfo[event.location.split(' ')[0]].coord;
      } catch (e) {
        return;
      }
      let pin_color = '';
      if (event.color === undefined) {
        pin_color = '#0000FF';
      } else {
        pin_color = event.color;
      }
      markers.push(
        <Marker
          position={coords}
          icon={L.divIcon({
            className: 'my-custom-pin',
            iconAnchor: [0, 14],
            labelAnchor: [-3.5, 0],
            popupAnchor: [0, -21],
            html: `<span style="background-color: ${pin_color};
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
            Class: {event.title}
            <br />
            Room: {event.location.split(' ')[1]}
            <br />
            Building: {buildingInfo[event.location.split(' ')[0]].name}
          </Popup>
        </Marker>
      );
    });

    return markers;
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
              position: 'sticky',
              zIndex: 1000,
              width: '72%',
              marginTop: 10,
            }}
          >
            <Tabs
              value={this.state.day}
              onChange={this.handleChangeDay}
              indicatorColor="primary"
              textColor="primary"
              variant="standard"
              centered
            >
              <Tab
                label="All"
                style={{ minWidth: 39, backgroundColor: '#FFFFFF' }}
              />
              <Tab
                label="Mon"
                style={{ minWidth: 39, backgroundColor: '#FFFFFF' }}
              />
              <Tab
                label="Tue"
                style={{ minWidth: 39, backgroundColor: '#FFFFFF' }}
              />
              <Tab
                label="Wed"
                style={{ minWidth: 39, backgroundColor: '#FFFFFF' }}
              />
              <Tab
                label="Thu"
                style={{ minWidth: 39, backgroundColor: '#FFFFFF' }}
              />
              <Tab
                label="Fri"
                style={{ minWidth: 39, backgroundColor: '#FFFFFF' }}
              />
            </Tabs>
          </div>

          <Locator options={locateOptions} />

          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            //url = "https://api.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"
            url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
          />

          {this.createMarkers()}
        </Map>
      </Fragment>
    );
  }
}
