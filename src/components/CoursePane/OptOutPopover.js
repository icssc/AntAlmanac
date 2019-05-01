import React from 'react';
import PropTypes from 'prop-types';
import Popover from '@material-ui/core/Popover';
import { withStyles } from '@material-ui/core/styles';
import toRenderProps from "recompose/toRenderProps";
import withState from "recompose/withState";
import { Settings } from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";

const WithState = toRenderProps(withState("anchorEl", "updateAnchorEl", null));

const styles = theme => ({
    padding: theme.spacing.unit * '10px',
});
function OptOutPopover(props) {
  return (
    <WithState>
      {({ anchorEl, updateAnchorEl }) => {
        const open = Boolean(anchorEl);
        return (
          <React.Fragment>
            <IconButton
              aria-owns={open ? "render-props-popover" : undefined}
              aria-haspopup="true"
              variant="contained"
              onClick={event => {
                updateAnchorEl(event.currentTarget);
              }}
            >
              <Settings style={{color:'white'}}/>
            </IconButton>
            <Popover
              id="render-props-popover"
              open={open}
              anchorEl={anchorEl}
              onClose={() => {
                updateAnchorEl(null);
              }}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center"
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center"
              }} f
            >
            <FormControl style={{marginTop: 16, marginLeft: 16}} component="fieldset" >
              <FormLabel component="legend">Instructor Evaluations</FormLabel>
              <RadioGroup
                aria-label="InstructorEvals"
                name="gender2"
                defaultValue="eatereval"
                style={{margin: 8}}
                value={props.destination} 
              >
                <FormControlLabel
                  value="rmp"
                  control={<Radio color="primary" />}
                  label="View on RateMyProfessor"
                  labelPlacement="end"
                  onChange={props.handleSelectRMP}
                />
                <FormControlLabel
                  value="eatereval"
                  control={<Radio color="primary" />}
                  label="View on EaterEvals"
                  labelPlacement="end"
                  onChange={props.handleSelectEE}
                />
              </RadioGroup>
            </FormControl>

            </Popover>
          </React.Fragment>
        );
      }}
    </WithState>
  );
}

OptOutPopover.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(OptOutPopover);