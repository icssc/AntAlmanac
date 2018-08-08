import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import availableQuarters from './availableQuarters.json'

const https = require('https');
var url_base = "https://www.ics.uci.edu/~rang1/";

function FetchGraph(quarter, year, code){
  var graph_url = url_base + quarter + year + '/' + code + '.txt';
  https.get(graph_url, (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      return JSON.parse(data).explanation;
    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
}

function getModalStyle() {
  return {
    width: 800,
    height: 600,
    top: 50,
    left: 50,
    transform: `translate(-50, -50)`,
  };
}

const styles = theme => ({
  paper: {
    position: 'absolute',
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

    return (
      <div>
        <Typography gutterBottom>Click to see graph in a modal!</Typography>
        <Button onClick={this.handleOpen}>Open Modal</Button>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.open}
          onClose={this.handleClose}
        >
          <div style={getModalStyle()} className={classes.paper}>
            <Typography variant="title" id="modal-title">
              This should be the graph for ICS 31
            </Typography>
            <img src= {FetchGraph('w','18','36050')}/>
          </div>
        </Modal>
      </div>
    );
  }
}

AlmanacGraph.propTypes = {
  classes: PropTypes.object.isRequired,
};

// We need an intermediary variable for handling the recursive nesting.
const AlmanacGraphWrapped = withStyles(styles)(AlmanacGraph);

export default AlmanacGraphWrapped;
