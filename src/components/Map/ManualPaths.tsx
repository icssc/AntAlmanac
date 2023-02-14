import { useState, useEffect } from 'react';
import L from 'leaflet';
import type { LatLngTuple } from 'leaflet';
import { useMap, Polyline } from 'react-leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

const ACCESS_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

interface Props {
  /**
   * waypoints needs to be L.Routing.Waypoint [] or LatLng[] when given L.Routing.plan
   * for ease of use from outside, pass in a valid LatLngTuple[], and convert to LatLng inside
   * @example [[33.6405, -117.8443], [33.6405, -117.8443]]
   */
  latLngTuples: LatLngTuple[];

  /**
   * color of line for this route
   */
  color?: string;
}

/**
 * given waypoints of a route and a color for the route, draw a route to the map
 */
export default function PathMaker(props: Props) {
  const map = useMap();

  const latLngTuples = props.latLngTuples || [];

  /**
   * convert each tuple to an actual LatLng object
   */
  const waypoints = latLngTuples.map((latLngTuple) => L.latLng(latLngTuple));
  /**
   * if you wanted to manually calculate and render routes
   */
  const [routes, setRoutes] = useState<L.Routing.IRoute[]>([]);

  const manualRoute = L.Routing.mapbox(ACCESS_TOKEN, {
    serviceUrl: 'https://api.mapbox.com/directions/v5',
    profile: 'mapbox/walking',
  });

  manualRoute.route(
    waypoints.map((w) => new L.Routing.Waypoint(w, 'no', {})),
    (...args: any) => {
      const [err, route] = args as [Error | null, L.Routing.IRoute | null];
      if (!err && route) {
        console.log('here');
        setRoutes((prevRoutes) => [...prevRoutes, route]);
      }
    }
  );

  const yes = routes.map((obj) => {
    let coordinates = obj['routes'][0]['geometry']['coordinates']; // The coordinates for the lines of the routes
    let waypoints = obj['waypoints']; // The waypoints we specified in the request
    let waypointIndex = 0; // The current waypoint we are building a path from

    // Path is a list of paths for each waypoint. For example, path[0] is the path to waypoint 0, path[1] is the path from 0 to 1... etc.
    let path: L.LatLngExpression[][] = [[[
        waypoints?.[waypointIndex].lat || 0,
        waypoints?.[waypointIndex].lng || 0,
    ]]]

    return {
      zIndexOffset: 100,
      color: 'red', // colors[waypointIndex - 1],
      positions: path[waypointIndex],
      index: waypointIndex,
    };
  });

  return <div>{yes.map(y => (
    <Polyline positions={y.positions} />
  ))}</div>
}
