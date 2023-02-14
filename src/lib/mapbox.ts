// generated with https://jvilk.com/MakeTypes/
// with some fields omitted for simplicity since we don't use them.
// see below for a complete response object

export type Coord = [number, number];

/**
 * Response from mapbox API. This interface omits some fields. Read the top
 * of the file this is defined in for more details.
 */
export interface MapBoxResponse {
  routes: MapBoxRoute[];
  waypoints: MapBoxWaypoint[];
  code: string;
  uuid: string;
}

interface MapBoxRoute {
  country_crossed: boolean;
  weight_name: string;
  weight: number;
  duration: number;
  distance: number;
  legs: MapBoxLeg[];
  geometry: MapBoxGeometry;
}

interface MapBoxLeg {
  weight: number;
  duration: number;
  distance: number;
  summary: string;
}

interface MapBoxGeometry {
  coordinates: Coord[];
  type: 'LineString' | string;
}

interface MapBoxWaypoint {
  distance: number;
  name: string;
  location: Coord;
}

/**
 * @example
 * {
 *     "routes": [
 *         {
 *             "country_crossed": false,
 *             "weight_name": "pedestrian",
 *             "weight": 625.466,
 *             "duration": 572.243,
 *             "distance": 776.796,
 *             "legs": [
 *                 {
 *                     "via_waypoints": [],
 *                     "admins": [
 *                         {
 *                             "iso_3166_1_alpha3": "USA",
 *                             "iso_3166_1": "US"
 *                         }
 *                     ],
 *                     "weight": 327.933,
 *                     "duration": 311.088,
 *                     "steps": [],
 *                     "distance": 432.797,
 *                     "summary": ""
 *                 },
 *                 {
 *                     "via_waypoints": [],
 *                     "admins": [
 *                         {
 *                             "iso_3166_1_alpha3": "USA",
 *                             "iso_3166_1": "US"
 *                         }
 *                     ],
 *                     "weight": 297.533,
 *                     "duration": 261.155,
 *                     "steps": [],
 *                     "distance": 344,
 *                     "summary": "Ring Mall"
 *                 }
 *             ],
 *             "geometry": {
 *                 "coordinates": [
 *                     [
 *                         -117.844889,
 *                         33.646415
 *                     ],
 *                     [
 *                         -117.844589,
 *                         33.646421
 *                     ],
 *                     [
 *                         -117.844229,
 *                         33.646294
 *                     ],
 *                     [
 *                         -117.844279,
 *                         33.646014
 *                     ],
 *                     [
 *                         -117.844256,
 *                         33.645616
 *                     ],
 *                     [
 *                         -117.844182,
 *                         33.645408
 *                     ],
 *                     [
 *                         -117.843934,
 *                         33.645086
 *                     ],
 *                     [
 *                         -117.843731,
 *                         33.644936
 *                     ],
 *                     [
 *                         -117.843308,
 *                         33.644728
 *                     ],
 *                     [
 *                         -117.842946,
 *                         33.644664
 *                     ],
 *                     [
 *                         -117.842425,
 *                         33.644672
 *                     ],
 *                     [
 *                         -117.842433,
 *                         33.644575
 *                     ],
 *                     [
 *                         -117.842153,
 *                         33.644491
 *                     ],
 *                     [
 *                         -117.841804,
 *                         33.644508
 *                     ],
 *                     [
 *                         -117.842153,
 *                         33.644491
 *                     ],
 *                     [
 *                         -117.842433,
 *                         33.644575
 *                     ],
 *                     [
 *                         -117.842522,
 *                         33.644417
 *                     ],
 *                     [
 *                         -117.842512,
 *                         33.644165
 *                     ],
 *                     [
 *                         -117.842757,
 *                         33.64385
 *                     ],
 *                     [
 *                         -117.842814,
 *                         33.643675
 *                     ],
 *                     [
 *                         -117.843038,
 *                         33.643636
 *                     ],
 *                     [
 *                         -117.843127,
 *                         33.643506
 *                     ],
 *                     [
 *                         -117.842586,
 *                         33.643502
 *                     ],
 *                     [
 *                         -117.842227,
 *                         33.643539
 *                     ],
 *                     [
 *                         -117.841879,
 *                         33.643628
 *                     ],
 *                     [
 *                         -117.84182,
 *                         33.643586
 *                     ],
 *                     [
 *                         -117.841796,
 *                         33.643488
 *                     ]
 *                 ],
 *                 "type": "LineString"
 *             }
 *         }
 *     ],
 *     "waypoints": [
 *         {
 *             "distance": 7.605,
 *             "name": "",
 *             "location": [
 *                 -117.844889,
 *                 33.646415
 *             ]
 *         },
 *         {
 *             "distance": 18.317,
 *             "name": "",
 *             "location": [
 *                 -117.841804,
 *                 33.644508
 *             ]
 *         },
 *         {
 *             "distance": 27.221,
 *             "name": "",
 *             "location": [
 *                 -117.841796,
 *                 33.643488
 *             ]
 *         }
 *     ],
 *     "code": "Ok",
 *     "uuid": "C7-Bjr3JEovL1OLrCxonTrOqBSBrvFNJIc2oKS5wneKwPF4BfogxQw=="
 * }
 */
