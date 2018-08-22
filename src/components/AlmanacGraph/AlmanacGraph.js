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
  
  //UnComment to display graph here then add an img tag inside the Model component
/*
   // will the graph from the call back function in Fetch Graph.js
   componentDidMount(){
    // create an object x and add it to the state
    getGraph( (x) => {this.setState({x});} )
  }
*/

  render() {
    const { classes } = this.props;
    return (
        <React.Fragment>
            <Button onClick={this.handleOpen}>Graph</Button>
          
            <Modal
              aria-labelledby="simple-modal-title"
              aria-describedby="simple-modal-description"
              open={this.state.open} onClose={this.handleClose}>     
                 <SimpleTab/>
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
