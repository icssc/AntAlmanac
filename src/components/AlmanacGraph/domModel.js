import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import html2canvas from 'html2canvas';
 function rand() {
  return Math.round(Math.random() * 20) - 10;
}
 function getModalStyle() {
  const top = 50 + rand();
  const left = 50 + rand();
   return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
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
 class domMoedl extends React.Component {
  state = {
    open: false,
  };
   handleOpen = () => {
    this.setState({ open: true });
  };
   handleClose = () => {
    this.setState({ open: false });
  };
   snap = ()=>{
     html2canvas(document.getElementById("cal")).then(function(canvas) {
        let img = canvas.toDataURL("image/png")
        let lnk = document.getElementById('cal2');
    });
   }
   render() {
    const { classes } = this.props;
     return (
      <div>
        <Button onClick={this.handleOpen}>Open Modal</Button>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.open}
          onClose={this.handleClose}
        >
          <div id="cal2" style={getModalStyle()} className={classes.paper}>
            {this.snap()}
          </div>
        </Modal>
      </div>
    );
  }
}
 domMoedl.propTypes = {
  classes: PropTypes.object.isRequired,
};
 // We need an intermediary variable for handling the recursive nesting.
const SimpleModalWrapped = withStyles(styles)(domMoedl);
 export default SimpleModalWrapped;
