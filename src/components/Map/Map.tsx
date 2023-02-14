import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { useScheduleStore } from '$stores/schedule';
import { getMarkersFromCourses } from '$lib/map';
import MapMarker from './Marker';

const ACCESS_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
const attribution =
  '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors | Images from <a href="https://map.uci.edu/?id=463">UCI Map</a>';
const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${ACCESS_TOKEN}`;

export default function CourseMap() {
  const { schedules, scheduleIndex } = useScheduleStore();

  const markers = getMarkersFromCourses(schedules[scheduleIndex].courses);

  return (
    <MapContainer center={[33.6459, -117.842717]} zoom={16} maxZoom={19} style={{ height: '100%' }}>
      <TileLayer attribution={attribution} url={url} tileSize={512} zoomOffset={-1} />
      {markers.map((marker, index) => (
        <MapMarker {...marker} key={index} stackIndex={0} />
      ))}
    </MapContainer>
  );
}
