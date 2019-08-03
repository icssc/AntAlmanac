import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  Popover,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Typography,
  FormLabel,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import toRenderProps from 'recompose/toRenderProps';
import withState from 'recompose/withState';
import { Settings } from '@material-ui/icons';

//Material UI Popover at top toolbar, allows users to select whether
//staff names link out to RateMyProfessors.com or UCI's EaterEvals.

const WithState = toRenderProps(withState('anchorEl', 'updateAnchorEl', null));

const styles = (theme) => ({
  padding: theme.spacing.unit * '10px',
});
function OptOutPopover(props) {
  return (
    <WithState>
      {({ anchorEl, updateAnchorEl }) => {
        const open = Boolean(anchorEl);
        const sep = props.isDesktop ? 25 : 5;

        return (
          <Fragment>
            <Button
              aria-owns={open ? 'render-props-popover' : undefined}
              aria-haspopup="true"
              onClick={(event) => {
                updateAnchorEl(event.currentTarget);
              }}
              color="inherit"
              style={{ marginLeft: sep, marginRight: sep }}
            >
              {' '}
              {/* For desktop mode only*/}
              <Settings />
              {props.isDesktop ? (
                <Typography color="inherit">&nbsp;&nbsp;Settings</Typography>
              ) : (
                <Fragment />
              )}
            </Button>
            <Popover
              id="render-props-popover"
              open={open}
              anchorEl={anchorEl}
              onClose={() => {
                updateAnchorEl(null);
              }}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
            >
              <FormControl
                style={{ marginTop: 16, marginLeft: 16 }}
                component="fieldset"
              >
                <FormLabel component="legend" style={{ marginTop: 16 }}>
                  Instructor Evaluations
                </FormLabel>
                <RadioGroup
                  aria-label="InstructorEvals"
                  name="gender2"
                  style={{ margin: 8 }}
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
          </Fragment>
        );
      }}
    </WithState>
  );
}

OptOutPopover.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(OptOutPopover);
