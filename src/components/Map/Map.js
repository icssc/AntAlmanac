import React, { Component } from 'react';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import buildingInfo from './buildingInfo.json';
import Locator from './Locator';
import { MyLocation } from '@material-ui/icons';

type State = {
  lat: number,
  lng: number,
  zoom: number,
};

const locateOptions = {
  position: 'topleft',
  strings: {
    title: 'Looking for your lost soul',
  },
  flyTo: true,
  // onActivate: () => {} // callback before engine starts retrieving locations
};

export default class UCIMap extends Component<{}, State> {
  state = {
    lat: 33.6459,
    lng: -117.842717,
    zoom: 17,
    markers: [],
  };

  createMarkers = () => {
    let markers = [];

    this.props.eventsInCalendar.forEach((event) => {
      if (event.scheduleIndex !== this.props.currentScheduleIndex) return;

      let coords = '';
      try {
        coords = buildingInfo[event.location.split(' ')[0]].coord;
      } catch (e) {
        return;
      }

      markers.push(
        <Marker
          position={coords}
          icon={L.divIcon({
            className: 'my-custom-pin',
            iconAnchor: [0, 14],
            labelAnchor: [-3.5, 0],
            popupAnchor: [0, -21],
            html: `<span style="background-color: ${event.color};
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
      <Map
        center={[this.state.lat, this.state.lng]}
        zoom={this.state.zoom}
        maxZoom={19}
      >
        <Locator options={locateOptions}>
          <MyLocation style={{ height: 30 }} />
        </Locator>

        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          //url = "https://api.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"
          url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
        />

        {this.createMarkers()}
      </Map>
    );
  }
}
