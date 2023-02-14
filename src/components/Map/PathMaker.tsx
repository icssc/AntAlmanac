import L from 'leaflet';
import type { LatLngTuple } from 'leaflet';
import { useMap } from 'react-leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

const ACCESS_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

/**
 * waypoints needs to be L.Routing.Waypoint [] or LatLng[]
 * for ease of use from outside, pass in a valid LatLngTuple[], and convert to LatLng inside
 */
export default function PathMaker(props: { latLngTuples: LatLngTuple[]; color?: string }) {
  const map = useMap();

  /**
   * @example [[33.6405, -117.8443], [33.6405, -117.8443]]
   */
  const latLngTuples = props.latLngTuples || [];

  /**
   * convert each tuple to an actual LatLng object
   */
  const waypoints = latLngTuples.map((latLngTuple) => L.latLng(latLngTuple));

  /**
   * create a new plan with the waypoints
   */
  const plan = L.Routing.plan(waypoints, {
    routeWhileDragging: true,
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
    }),
    routeLine(route) {
      return L.Routing.line(route, {
        addWaypoints: false,
        extendToWaypoints: true,
        missingRouteTolerance: 0,
        styles: [{ color: props.color }],
      });
    },
  });

  /**
   * draw the route on the map
   */
  route.addTo(map);

  /**
   * hides the textbox with the steps to navigate, e.g. {@link https://i.stack.imgur.com/4e6EJ.png}
   */
  route.hide();

  /**
   * doesn't need to render any UI
   */
  return null;
}
