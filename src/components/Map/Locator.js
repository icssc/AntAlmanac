import { Component } from 'react';
import { withLeaflet } from 'react-leaflet';
import Locate from 'leaflet.locatecontrol';

class LocateControl extends Component {
  componentDidMount() {
    const { options } = this.props;
    const { map } = this.props.leaflet;

    const lc = new Locate(options);
    lc.addTo(map);
  }

  render() {
    return null;
  }
}

export default withLeaflet(LocateControl);
