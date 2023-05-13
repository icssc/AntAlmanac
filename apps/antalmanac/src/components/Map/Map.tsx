import './Map.css'

import { Fragment, useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import L from 'leaflet'
import type { Map, LatLngTuple } from 'leaflet'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet-routing-machine'
import { Autocomplete, Box, Paper, Tab, Tabs, TextField, Typography } from '@mui/material'
import AppStore from '$stores/AppStore';
import locationIds from '$lib/location_ids'
import buildingCatalogue from '$lib/buildingCatalogue'
import type { Building } from '$lib/buildingCatalogue'
import LocationMarker from './Marker'
import CourseRoutes from './Routes'
import UserLocator from './UserLocator'
import type { CourseEvent } from '$components/Calendar/CourseCalendarEvent'

const ACCESS_TOKEN = 'pk.eyJ1IjoicGVkcmljIiwiYSI6ImNsZzE0bjk2ajB0NHEzanExZGFlbGpwazIifQ.l14rgv5vmu5wIMgOUUhUXw';

const ATTRIBUTION_MARKUP =
    '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors | Images from <a href="https://map.uci.edu/?id=463">UCI Map</a>';

const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${ACCESS_TOKEN}`

/**
 * empty day is alias for "All Days"
 */
const days = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']


/**
 * extracts all metadata from courses to the top level in preparation to use in the map
 */
export function getMarkersFromCourses() {
  const courseEvents = AppStore.getCourseEventsInCalendar()

  const uniqueBuildingCodes = new Set(courseEvents.map((event) => event.bldg.split(' ').slice(0, -1).join(' ')))

  /**
   * Each building has an array of courses that occur in the building.
   */
  const pins: Record<string, CourseEvent[]> = {}

  /**
   * associate each building code to courses that have a matching building code
   */
  uniqueBuildingCodes.forEach((buildingCode) => {
    pins[buildingCode] = courseEvents.filter((event) => {
      const eventBuildingCode = event.bldg.split(' ').slice(0, -1).join(' ')
      return eventBuildingCode === buildingCode
    })
  })

  const markers = Object.entries(pins)
    /**
     * Filter out buildings that don't exist in the building catalogue.
     */
    .filter(([buildingCode]) => Boolean(buildingCatalogue[locationIds[buildingCode]]))

    /**
     * FlatMap each building code to an array of course events that occur in the building.
     */
    .flatMap(([buildingCode, courseEvents]) => {
      const locationData = buildingCatalogue[locationIds[buildingCode]]
      const eventLocationData = courseEvents.map((event) => {
        const key = `${event.title} ${event.sectionType} @ ${event.bldg}`
        const acronym = locationData.name.substring(locationData.name.indexOf('(') + 1, locationData.name.indexOf(')'))
        return {
          key,
          image: locationData.imageURLs[0],
          acronym,
          markerColor: event.color,
          location: locationData.name,
          ...locationData,
          ...event,
        }
      })
      return eventLocationData
    })

  const markersByTime = markers.sort((a, b) => a.start.getTime() - b.start.getTime())
  return markersByTime
}

/**
 * map of all course locations on UCI campus
 */
export default function CourseMap() {
  const map = useRef<Map | null>(null)
  const [selectedDayIndex, setSelectedDay] = useState(0)
  const [selected, setSelected] = useState<Building>()
  const [searchParams] = useSearchParams()

  /**
   * Whenever search params changes, update the selected location if possible.
   */
  useEffect(() => {
    const location = +(searchParams.get('location') ?? 0)

    if (!(location in buildingCatalogue)) return

    const building = buildingCatalogue[location]

    setSelected(building)

    map.current?.setView(L.latLng(building.lat, building.lng), 18)
  }, [searchParams])

  const navigate = useNavigate()

  /**
   * extract a bunch of relevant metadata from courses into a top-level object for MapMarkers
   */
  const [markers, setMarkers] = useState(getMarkersFromCourses())

  const updateMarkers = () => {
    setMarkers(getMarkersFromCourses())
  }

  useEffect(() => {
    AppStore.on('addedCoursesChange', updateMarkers);
    AppStore.on('currentScheduleIndexChange', updateMarkers);
    return () => {
      AppStore.removeListener('addedCoursesChange', updateMarkers);
      AppStore.removeListener('currentScheduleIndexChange', updateMarkers);
    }
  }, [])

  const today = days[selectedDayIndex]

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedDay(newValue)
  }

  const handleSearch = (_event: React.SyntheticEvent, value: Building | null) => {
    if (!value) {
      setSelected(undefined)
    } else {
      setSelected(value)
      const location = L.latLng(value.lat, value.lng)
      map.current?.setView(location, 18)
    }
  }

  /**
   * unique buildings
   */
  const uniqueBuildings = Object.values(buildingCatalogue).filter(
    (building, index, self) => self.findIndex((foundBuilding) => building.name === foundBuilding.name) === index
  )

  /**
   * only get markers for courses happening today
   */
  const markersToday = markers.filter((marker) => marker.start.toString().includes(today))

  /**
   * unique array of markers that occur today
   */
  const uniqueMarkersToday = markersToday.filter(
    (marker, index, self) => self.findIndex((foundMarker) => marker.key === foundMarker.key) === index
  )

  /**
   * group every two markers as [start, destination] tuples
   */
  const startDestPairs = uniqueMarkersToday.reduce((acc, cur, index) => {
    acc.push([cur])
    if (index > 0) {
      acc[index - 1].push(cur)
    }
    return acc
  }, [] as (typeof uniqueMarkersToday)[])

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%' }}>
    <button onClick={() => navigate('/?location=83038')}>A</button>
    <button onClick={() => navigate('/?location=83095')}>B</button>
    <button onClick={() => navigate('/?location=83169')}>C</button>
    <button onClick={() => navigate('/')}>Home</button>
      <MapContainer ref={map} center={[33.6459, -117.842717]} zoom={16} style={{ height: '100%' }}>
        {/** menu floats above the map */}
        <Paper sx={{ zIndex: 400, position: 'relative', my: 2, mx: 6.942, marginX: '15%', marginY: 8 }}>
          <Tabs value={selectedDayIndex} onChange={handleChange} variant="fullWidth" sx={{ minHeight: 0 }}>
            {days.map((day) => (
              <Tab key={day} label={day || 'All'} sx={{ padding: 1, minHeight: 'auto', minWidth: '10%', p: 1 }} />
            ))}
          </Tabs>
          <Autocomplete
            options={uniqueBuildings}
            getOptionLabel={(option) => option.name || ''}
            onChange={handleSearch}
            renderInput={(params) => <TextField {...params} label="Search for a place" variant="filled" />}
          />
        </Paper>

        <TileLayer attribution={ATTRIBUTION_MARKUP} url={url} tileSize={512} maxZoom={21} zoomOffset={-1} />

        <UserLocator />

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
        {uniqueMarkersToday.map((marker, index) => (
          <Fragment key={Object.values(marker).join()}>
            <LocationMarker {...marker} label={today ? index + 1 : undefined} stackIndex={index}>
              <hr />
              <Typography variant="body2">Class: {`${marker.title} ${marker.sectionType}`}</Typography>
              <Typography variant="body2">Room: {marker.bldg.split(' ').slice(-1)}</Typography>
            </LocationMarker>
          </Fragment>
        ))}

        {/* render an additional marker if the user searched up a location */}
        {selected && (
          <LocationMarker {...selected} label="!" color="red" location={selected.name} image={selected.imageURLs?.[0]} />
        )}
      </MapContainer>
    </Box>
  )
}
