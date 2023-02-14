import { useEffect } from 'react';
import L from 'leaflet';
import type { LatLngTuple } from 'leaflet';
import { useMap } from 'react-leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

const ACCESS_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

interface Props {
  /**
   * waypoints needs to be L.Routing.Waypoint [] or LatLng[] when creating a L.Routing.plan
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
export default function CourseRoutes(props: Props) {
  const map = useMap();

  const latLngTuples = props.latLngTuples || [];

  /**
   * convert each tuple to an actual LatLng object
   */
  const waypoints = latLngTuples.map((latLngTuple) => L.latLng(latLngTuple));

  useEffect(() => {
    /**
     * create a new router that can calculate and render the walking paths to the map
     */
    const router = L.Routing.control({
      router: L.Routing.mapbox(ACCESS_TOKEN, { profile: 'mapbox/walking' }),

      plan: L.Routing.plan(waypoints, {
        addWaypoints: false,
        createMarker: () => false,
      }),

      routeLine(route) {
        const line = L.Routing.line(route, {
          addWaypoints: false,
          extendToWaypoints: true,
          missingRouteTolerance: 0,
          styles: [{ color: props.color }],
        });
        return line;
      },
    });

    /**
     * add the router and all of its lines to the map
     */
    router.addTo(map);

    /**
     * hides the textbox with the steps to navigate, e.g. {@link https://i.stack.imgur.com/4e6EJ.png}
     */
    router.hide();

    return () => {
      /**
       * the map will continue to live after this component dies;
       * make sure the router with all of its lines is removed with the component
       */
      router.remove();
    };
  }, []);

  /**
   * doesn't need to render any UI
   */
  return null;
}
