import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Popover from '@material-ui/core/Popover';
import { SketchPicker } from 'react-color'
const styles = theme => ({
  typography: {
    margin: theme.spacing.unit * 2,
  },
  fab: {
    margin: theme.spacing.unit,
  },
  extendedIcon: {
    marginRight: theme.spacing.unit,
  },
});

class CPicker extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
        anchorEl: null,
        color: this.props.event.color
      };
  }
  handleClick = event => {
    if (!event)  event = window.event;
    event.cancelBubble = true;
    if (event.stopPropagation) event.stopPropagation();

    this.setState({
      anchorEl: event.currentTarget,
    });
  };

  handleClose = event => {
    if (!event)  event = window.event;
    event.cancelBubble = true;
    if (event.stopPropagation) event.stopPropagation();
    this.setState({
      anchorEl: null
    });
    console.log('fdfdf')
;  };
  handleChange = (color) => {
    this.setState({ color: color.hex },()=>{ this.props.colorChange(this.props.event,this.state.color);
    })
  };

  render() {
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (

  <td bgcolor={this.props.event.color}  aria-owns={open ? 'simple-popper' : undefined}
          aria-haspopup="true"
          onClick={e => {this.handleClick(e)}}>

        <Popover
          id="simple-popper"
          open={open}
          anchorEl={anchorEl}
          onClose={this.handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
        <SketchPicker color={this.state.color}

         onChange={ this.handleChange }/>        </Popover>
     </td>
    );
  }
}

CPicker.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CPicker);
