import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import toRenderProps from 'recompose/toRenderProps';
import withState from 'recompose/withState';
import course_info from './course_info.json';
import { MoreVert } from '@material-ui/icons';
import ReactGA from 'react-ga';
const WithState = toRenderProps(withState('anchorEl', 'updateAnchorEl', null));

const styles = (theme) => ({
  typography: {
    margin: theme.spacing.unit * 2,
  },
});

function RenderPropsPopover(props) {
  const { classes, name, courseDetails } = props;

  function deptInfo() {
    let a = undefined;
    try {
      a = course_info[courseDetails.name[0]][courseDetails.name[1]];
    } catch (err) {
      return "We couldn't find this course in the General Catalogue for 2018-19!";
    }

    return a;
  }

  return (
    <WithState>
      {({ anchorEl, updateAnchorEl }) => {
        const open = Boolean(anchorEl);
        return (
          <React.Fragment>
            <Button
              variant="contained"
              style={{ backgroundColor: '#72a9ed', boxShadow: 'none' }}
              onClick={(event) => {
                ReactGA.event({
                  category: 'Course_info',
                  action: courseDetails.name[0] + ' ' + courseDetails.name[1],
                });
                updateAnchorEl(event.currentTarget);
              }}
            >
              {name}&nbsp;&nbsp;
              <MoreVert fontSize="small" />
            </Button>
            <Popover
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
              <Typography className={classes.typography}>
                <div
                  style={{ margin: 10, maxWidth: 500 }}
                  className="course_info"
                  dangerouslySetInnerHTML={{
                    __html: deptInfo(),
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
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(RenderPropsPopover);
