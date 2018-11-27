import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Popover from "@material-ui/core/Popover";
import toRenderProps from "recompose/toRenderProps";
import withState from "recompose/withState";
import course_info from "./course_info.json";
const WithState = toRenderProps(withState("anchorEl", "updateAnchorEl", null));

const styles = theme => ({
  typography: {
    margin: theme.spacing.unit * 2
  }
});

function RenderPropsPopover(props) {
  const { classes, name, courseDetails } = props;

  function deptInfo() {
    var a = undefined;
    try {
      a = course_info[courseDetails.name[0]][courseDetails.name[1]];
    } catch (err) {}

    return a;
  }

  return (
    <WithState>
      {({ anchorEl, updateAnchorEl }) => {
        const open = Boolean(anchorEl);
        return (
          <React.Fragment>
            <Button
              aria-owns={open ? "render-props-popover" : undefined}
              aria-haspopup="true"
              variant="contained"
              color="primary"
              onClick={event => {
                updateAnchorEl(event.currentTarget);
              }}
            >
              {name}&nbsp;&nbsp;&nbsp;&nbsp;
            </Button>
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
              }}
            >
              <Typography className={classes.typography}>
                <div
                  style={{ margin: 10 }}
                  className="course_info"
                  dangerouslySetInnerHTML={{
                    __html: deptInfo()
                  }}
                />
              </Typography>
            </Popover>
          </React.Fragment>
        );
      }}
    </WithState>
  );
}

RenderPropsPopover.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(RenderPropsPopover);
