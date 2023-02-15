import { useRef, useState } from 'react'
import L from 'leaflet'
import type { Map, LatLngTuple } from 'leaflet'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet-routing-machine'
import { Autocomplete, Box, Tab, Tabs, TextField, Typography } from '@mui/material'
import { useScheduleStore } from '$stores/schedule'
import { getMarkersFromCourses } from '$lib/map'
import buildingCatalogue from '$lib/buildingCatalogue'
import type Building from '$lib/building'
import CourseMarker from './Marker'
import CourseRoutes from './Routes'

const ACCESS_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'

const attribution =
  '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors | Images from <a href="https://map.uci.edu/?id=463">UCI Map</a>'

const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${ACCESS_TOKEN}`

/**
 * empty day is alias for "All Days"
 */
const days = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']

/**
 * map of all course locations on UCI campus
 */
export default function CourseMap() {
  const { schedules, scheduleIndex } = useScheduleStore()
  const map = useRef<Map | null>(null)
  const [tab, setTab] = useState(0)
  const [selected, setSelected] = useState<Building | null>(null)

  const today = days[tab]

  function handleChange(_event: React.SyntheticEvent, newValue: number) {
    setTab(newValue)
  }

  function handleSearch(_event: React.SyntheticEvent, value: Building | null) {
    if (!value) {
      return
    }
    setSelected(value)
    const location = L.latLng(value.lat, value.lng)
    map.current?.setView(location, 18)
  }

  /**
   * unique buildings
   */
  const uniqueBuildings = Object.values(buildingCatalogue).filter(
    (building, index, self) => self.findIndex((foundBuilding) => building.name === foundBuilding.name) === index
  )

  /**
   * extract a bunch of relevant metadata from courses into a top-level object for MapMarkers
   */
  const markers = getMarkersFromCourses(schedules[scheduleIndex].courses)

  /**
   * only get markers for courses happening today
   */
  const markersToday = markers.filter((marker) => marker.start.toString().includes(today))

  /**
   * unique array of markers that occur today
   */
  const uniqueMarkers = markersToday.filter(
    (marker, index, self) => self.findIndex((foundMarker) => marker.key === foundMarker.key) === index
  )

  /**
   * group every two markers as [start, destination] tuples
   */
  const startDestPairs = uniqueMarkers.reduce((acc, cur, index) => {
    acc.push([cur])
    if (index > 0) {
      acc[index - 1].push(cur)
    }
    return acc
  }, [] as (typeof uniqueMarkers)[])

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Box>
        <Tabs value={tab} onChange={handleChange} variant="fullWidth" centered>
          {days.map((day, index) => (
            <Tab key={index} label={day || 'All'} />
          ))}
        </Tabs>
        <Autocomplete
          options={uniqueBuildings}
          getOptionLabel={(option) => option.name || ''}
          onChange={handleSearch}
          renderInput={(params) => <TextField {...params} label="Search for a place" variant="filled" />}
        />
      </Box>

      <Box sx={{ flexGrow: 1, width: '100%' }}>
        <MapContainer ref={map} center={[33.6459, -117.842717]} zoom={16} style={{ height: '100%' }}>
          <TileLayer attribution={attribution} url={url} tileSize={512} maxZoom={21} zoomOffset={-1} />

          {/* draw out routes if the user is viewing a specific day */}
          {today !== '' &&
            startDestPairs.map((startDestPair) => {
              const latLngTuples = startDestPair.map((marker) => [marker.lat, marker.lng] as LatLngTuple)
              const color = startDestPair[0]?.color
              /**
               * previous renders of the routes will be left behind if the keys aren't unique
               */
              const key = Math.random().toString(36).substring(7)
              return <CourseRoutes key={key} latLngTuples={latLngTuples} color={color} />
            })}

          {/* draw a marker for each class */}
          {uniqueMarkers.map((marker, index) => (
            <CourseMarker {...marker} key={index} label={today ? index + 1 : undefined} stackIndex={index}>
              <hr />
              <Typography variant="body2">Class: {`${marker.title} ${marker.sectionType}`}</Typography>
              <Typography variant="body2">Room: {marker.bldg.split(' ').slice(-1)}</Typography>
            </CourseMarker>
          ))}

          {/* render an additional marker if the user searched up a location */}
          {selected && (
            <CourseMarker
              {...selected}
              label="!"
              color="red"
              location={selected.name}
              image={selected.imageURLs?.[0]}
            />
          )}
        </MapContainer>
      </Box>
    </Box>
  )
}
