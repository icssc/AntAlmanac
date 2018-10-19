import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import availableQuarters from './availableQuarters.json'
//----------------------------------
// imports for rendering the graph
import SimpleTab from './UITabs'
//---------------------------------

const styles = theme => ({
  paper: {
    position: 'relative',
    width: theme.spacing.unit * 50,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,

  },
});

class AlmanacGraph extends React.Component {
  state = {
    open: false,
  };

  handleOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { classes } = this.props;

    const style =
        {
          position: 'static',
          float:"right",
          margin: '5px',
          width: "9%",
          height: "15",
          color:'white',
        };

    return (
        <React.Fragment>
            <Button
              onClick={this.handleOpen}
              style={{ backgroundColor: "#5191d6", marginLeft: 7 }}>
                Open the Almanac
            </Button>

            <Modal
              aria-labelledby="simple-modal-title"
              aria-describedby="simple-modal-description"
              open={this.state.open} onClose={this.handleClose}>
                  <SimpleTab code={this.props.courseCode}  term = {this.props.term} courseDetails={this.props.courseDetails}/>
              </Modal>

        </React.Fragment>
    );
  }
}

AlmanacGraph.propTypes = {
  classes: PropTypes.object.isRequired,
};

// We need an intermediary variable for handling the recursive nesting.
const AlmanacGraphWrapped = withStyles(styles)(AlmanacGraph);
export default AlmanacGraphWrapped;
