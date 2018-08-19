// import React from 'react';
// import PropTypes from 'prop-types';
// import { withStyles } from '@material-ui/core/styles';
// import FormLabel from '@material-ui/core/FormLabel';
// import FormControl from '@material-ui/core/FormControl';
// import FormGroup from '@material-ui/core/FormGroup';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import Checkbox from '@material-ui/core/Checkbox';

// const styles = theme => ({
//   root: {
//     display: 'flex',
//   },
//   formControl: {
//     margin: theme.spacing.unit * 3,
//   },
// });

// class CheckboxesGroup extends React.Component {
//   state = {
//     mon: false,
//     tues: false,
//     wed: false,
//     thurs: false,
//     fri: false,
//   };

//   handleChange = day => event => {
//     this.setState({ [day]: event.target.checked });
//   };

//   render() {
//     const { classes } = this.props;
//     const { mon, tues, wed, thurs, fri } = this.state;

//     return (
//       <div className={classes.root}>
//         <FormControl component="fieldset" className={classes.formControl}>
//           <FormLabel component="legend">Days Assigned</FormLabel>
//           <FormGroup>
//             <FormControlLabel
//               control={
//                 <Checkbox checked={mon} onChange={this.handleChange('mon')} value="mon" />
//               }
//               label="Monday"
//             />
//             <FormControlLabel
//               control={
//                 <Checkbox checked={tues} onChange={this.handleChange('tues')} value="tues" />
//               }
//               label="Tuesday"
//             />
//             <FormControlLabel
//               control={
//                 <Checkbox checked={wed} onChange={this.handleChange('wed')} value="wed" />
//               }
//               label="Wednesday"
//             />
//             <FormControlLabel
//               control={
//                 <Checkbox checked={thurs} onChange={this.handleChange('thurs')} value="thurs" />
//               }
//               label="Thursday"
//             />
//             <FormControlLabel
//               control={
//                 <Checkbox checked={fri} onChange={this.handleChange('fri')} value="fri" />
//               }
//               label="Friday"
//             />
//           </FormGroup>
//         </FormControl>
//       </div>
//     );
//   }
// }

// CheckboxesGroup.propTypes = {
//   classes: PropTypes.object.isRequired,
// };

// export default withStyles(styles)(CheckboxesGroup);

import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import green from "@material-ui/core/colors/green";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

const styles = {
  root: {
    color: green[600],
    "&$checked": {
      color: green[500]
    }
  },
  checked: {},
  size: {
    width: 40,
    height: 40
  },
  sizeIcon: {
    fontSize: 20
  }
};

class CheckboxLabels extends React.Component {
  state = {
    checkedA: false,
    checkedB: false,
    checkedC: false,
    checkedD: false,
    checkedE: false
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.checked });
  };

  render() {
    const { classes } = this.props;

    return (
      <FormGroup row>
        <FormControlLabel
          control={
            <Checkbox
              checked={this.state.checkedA}
              onChange={this.handleChange("checkedA")}
              value="checkedA"
            />
          }
          label="Monday"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={this.state.checkedB}
              onChange={this.handleChange("checkedB")}
              value="checkedB"
            />
          }
          label="Tuesday"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={this.state.checkedC}
              onChange={this.handleChange("checkedC")}
              value="checkedC"
            />
          }
          label="Wednesday"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={this.state.checkedD}
              onChange={this.handleChange("checkedD")}
              value="checkedD"
            />
          }
          label="Thursday"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={this.state.checkedE}
              onChange={this.handleChange("checkedE")}
              value="checkedE"
            />
          }
          label="Friday"
        />
      </FormGroup>
    );
  }
}

CheckboxLabels.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CheckboxLabels);
