import { useEffect } from 'react';
import L from 'leaflet';
import type { LatLngTuple } from 'leaflet';
import { useMap } from 'react-leaflet';
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

  useEffect(() => {
    /**
     * create a new plan with the waypoints
     */
    const plan = L.Routing.plan(waypoints, {
      addWaypoints: false,
      createMarker: () => false,
    });

    /**
     * plug in the plan into a router to draw
     */
    const route = L.Routing.control({
      plan,
      routeWhileDragging: true,
      router: L.Routing.mapbox(ACCESS_TOKEN, {
        profile: 'mapbox/walking',

        // default for reference:
        // serviceUrl: 'https://api.mapbox.com/directions/v5',
        // profile: 'mapbox/driving',
        // useHints: false
      }),
      routeLine(route) {
        return L.Routing.line(route, {
          addWaypoints: true,
          extendToWaypoints: true,
          missingRouteTolerance: 0,
          styles: [{ color: props.color }],
        });
      },
    }).addTo(map);

    /**
     * hides the textbox with the steps to navigate, e.g. {@link https://i.stack.imgur.com/4e6EJ.png}
     */
    route.hide();

    return () => {
      map.removeControl(route);
    };
  }, []);

  /**
   * doesn't need to render any UI
   */
  return null;
}
