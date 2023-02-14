import type { LatLngTuple } from 'leaflet';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Typography } from '@mui/material';
import { useScheduleStore } from '$stores/schedule';
import { getMarkersFromCourses } from '$lib/map';
import MapMarker from './Marker';
import PathMaker from './PathMaker';

const ACCESS_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
const attribution =
  '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors | Images from <a href="https://map.uci.edu/?id=463">UCI Map</a>';
const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${ACCESS_TOKEN}`;

export default function CourseMap() {
  const { schedules, scheduleIndex } = useScheduleStore();

  /**
   * extract a bunch of relevant metadata from courses into a top-level object for MapMarkers
   */
  const markers = getMarkersFromCourses(schedules[scheduleIndex].courses);

  const today = ''

  const markersToday = markers.filter((marker) => marker.start.toString().includes(today));

  /**
   * creates unique array of markers that occur today
   */
  const uniqueMarkers = markersToday.filter(
    (marker, index, self) => self.findIndex((foundMarker) => marker.key === foundMarker.key) === index
  )

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
    <MapContainer center={[33.6459, -117.842717]} zoom={16} maxZoom={19} style={{ height: '100%' }}>
      <TileLayer attribution={attribution} url={url} tileSize={512} zoomOffset={-1} />
      {startDestPairs.map((startDestPair, index) => {
        const latLngTuples = startDestPair.map((marker) => [marker.lat, marker.lng] as LatLngTuple);
        const color = startDestPair[0].color
        return <PathMaker key={index} latLngTuples={latLngTuples} color={color} />;
      })}
      {markersToday.map((marker, index) => (
        <MapMarker {...marker} key={index} stackIndex={0}>
          <hr />
          <Typography variant="body2">Class: {`${marker.title} ${marker.sectionType}`}</Typography>
          <Typography variant="body2">Room: {marker.bldg.split(' ').slice(-1)}</Typography>
        </MapMarker>
      ))}
    </MapContainer>
  );
}
