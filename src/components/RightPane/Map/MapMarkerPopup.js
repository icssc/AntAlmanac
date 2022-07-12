import React, { PureComponent } from 'react';
import WalkIcon from '@material-ui/icons/DirectionsWalk';
import { Marker, Popup } from 'react-leaflet';
import PropTypes from 'prop-types';
import { Button } from '@material-ui/core';
import Leaflet from 'leaflet';
import analyticsEnum, { logAnalytics } from '../../../analytics';

const GOOGLE_MAPS_URL = 'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=';
const IMAGE_CMS_URL = 'https://cms.concept3d.com/map/lib/image-cache/i.php?mapId=463&image=';

class MapMarkerPopup extends PureComponent {
    getMarkerIcon = (color) => {
        return Leaflet.divIcon({
            iconAnchor: [0, 14 + 16 * this.props.stackIndex], // Adds offset for marker for stacking markers
            labelAnchor: [-3.5, 0],
            popupAnchor: [0, -21 - 16 * this.props.stackIndex], // Adds offset for popup for stacking markers
            className: '',
            html: `<div style="position:relative;">
                        <span style="background-color: ${color};
                                        width: 1.75rem;
                                        height: 1.75rem;
                                        display: block;
                                        left: -1rem;
                                        top: -1rem;
                                        position: absolute;
                                        border-radius: 1.9rem 1.9rem 0;
                                        transform: rotate(45deg);
                                        border: 1px solid #FFFFFF">
                        </span>
                        <div style="position: absolute;
                                        width: 1.75rem;
                                        height: 1.75rem;
                                        left: -1rem;
                                        top: -0.75rem;
                                        text-align: center; 
                                        color: white" >
                            ${this.props.index}
                        </div>
                    </div>`,
        });
    };

    render() {
        let locationString;

        if (this.props.acronym) {
            locationString = (
                <a
                    href={`http://www.classrooms.uci.edu/classrooms/${this.props.acronym}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {this.props.location}
                </a>
            );
        } else {
            locationString = this.props.location;
        }

        return (
            <Marker
                position={[this.props.lat, this.props.lng]}
                icon={this.getMarkerIcon(this.props.markerColor)}
                zIndexOffset={-this.props.stackIndex} // alter ZIndex so markers show above other markers in order of stack
                onClick={() =>
                    logAnalytics({
                        category: analyticsEnum.map.title,
                        action: analyticsEnum.map.actions.CLICK_PIN,
                    })
                }
            >
                <Popup>
                    {locationString}

                    <br />

                    {this.props.image ? (
                        <img
                            src={`${IMAGE_CMS_URL}${this.props.image}`}
                            alt="Building Snapshot"
                            style={{ width: '100%' }}
                        />
                    ) : null}

                    {this.props.children}

                    <br />

                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<WalkIcon />}
                        href={`${GOOGLE_MAPS_URL}${this.props.lat},${this.props.lng}`}
                        target="_blank"
                        format="centered"
                    >
                        Directions
                    </Button>
                </Popup>
            </Marker>
        );
    }
}

MapMarkerPopup.propTypes = {
    markerColor: PropTypes.string.isRequired,
    image: PropTypes.string,
    location: PropTypes.string.isRequired,
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    acronym: PropTypes.string.isRequired,
};

export default MapMarkerPopup;
