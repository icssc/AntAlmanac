import { useState } from 'react';
import type { LatLngTuple } from 'leaflet';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet-routing-machine';
import { Tab, Tabs, Typography } from '@mui/material';
import { useScheduleStore } from '$stores/schedule';
import { getMarkersFromCourses } from '$lib/map';
import CourseMarker from './Marker';
import CourseRoutes from './Routes';

const ACCESS_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

const attribution =
  '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors | Images from <a href="https://map.uci.edu/?id=463">UCI Map</a>';

const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${ACCESS_TOKEN}`;

const days = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

/**
 * map of all course locations on UCI campus
 */
export default function CourseMap() {
  const { schedules, scheduleIndex } = useScheduleStore();
  const [tab, setTab] = useState(0);

  const today = days[tab];

  function handleChange(_event: React.SyntheticEvent, newValue: number) {
    setTab(newValue);
  }

  /**
   * extract a bunch of relevant metadata from courses into a top-level object for MapMarkers
   */
  const markers = getMarkersFromCourses(schedules[scheduleIndex].courses);

  /**
   * only get markers for courses happening today
   */
  const markersToday = markers.filter((marker) => marker.start.toString().includes(today));

  /**
   * creates unique array of markers that occur today
   */
  const uniqueMarkers = markersToday.filter(
    (marker, index, self) => self.findIndex((foundMarker) => marker.lat === foundMarker.lat && marker.lng === foundMarker.lng) === index
  );

  /**
   * group every two markers as [start, destination] tuples
   */
  const startDestPairs = uniqueMarkers.reduce((acc, cur, index) => {
    acc.push([cur]);
    if (index > 0) {
      acc[index - 1].push(cur);
    }
    return acc;
  }, [] as (typeof uniqueMarkers)[]);

  return (
    <>
      <Tabs value={tab} onChange={handleChange} variant="fullWidth">
        {days.map((day, index) => (
          <Tab key={index} label={day || 'All'} />
        ))}
      </Tabs>
      <MapContainer center={[33.6459, -117.842717]} zoom={16} style={{ height: '100%' }}>
        <TileLayer attribution={attribution} url={url} tileSize={512} maxZoom={21} zoomOffset={-1} />

        {today !== '' && startDestPairs.map((startDestPair) => {
          const latLngTuples = startDestPair.map((marker) => [marker.lat, marker.lng] as LatLngTuple);
          const color = startDestPair[0]?.color;
          /**
           * previous renders of the routes will be left behind if the keys aren't unique
           */
          const key = Math.random().toString(36).substring(7);
          return <CourseRoutes key={key} latLngTuples={latLngTuples} color={color} />;
        })}

        {uniqueMarkers.map((marker, index) => (
          <CourseMarker {...marker} key={index} index={today ? index + 1 : undefined} stackIndex={index}>
            <hr />
            <Typography variant="body2">Class: {`${marker.title} ${marker.sectionType}`}</Typography>
            <Typography variant="body2">Room: {marker.bldg.split(' ').slice(-1)}</Typography>
          </CourseMarker>
        ))}
      </MapContainer>
    </>
  );
}
