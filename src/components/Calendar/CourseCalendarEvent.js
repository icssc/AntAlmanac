import React from 'react';
import {Paper} from "@material-ui/core";
import {withStyles} from "@material-ui/core/es/styles";
import PropTypes from "prop-types";
import ColorPicker from '../App/colorPicker.js';
import {Delete} from '@material-ui/icons';

const styles = {
  container: {
    padding: '0.5rem',
    minWidth: '15rem'
  },
  title: {
    fontSize: '0.9rem',
    fontWeight: 500
  },
  icon: {
    cursor: 'pointer'
  },
  titleBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: "center"
  },
  table: {
    border: "none",
    width: '100%',
    borderCollapse: "collapse",
    fontSize: '0.9rem'
  },
  alignToTop: {
    verticalAlign: 'top'
  },
  rightCells: {
    textAlign: 'right'
  },
  multiline: {
    whiteSpace: 'pre'
  },
  colorPicker: {
    float: 'right',
    cursor: 'pointer',
    '& > div': {
      height: '1.5rem',
      width: '1.5rem',
      borderRadius: '50%'
    }
  }
};

const CourseCalendarEvent = (props) => {
  const {classes, courseInMoreInfo} = props;
  const {section, name, final} = courseInMoreInfo;

  return (
    <div>
      <Paper className={classes.container}>
        <div className={classes.titleBar}>
          <span className={classes.title}>{name[2]}</span>
          <Delete className={classes.icon} onClick={props.onClassDelete} />
        </div>
        <table className={classes.table}>
          <tbody>
          <tr>
            <td className={classes.alignToTop}>Instructors</td>
            <td className={classes.multiline + " " + classes.rightCells}>{section.instructors.join("\n")}</td>
          </tr>
          <tr>
            <td>Final</td>
            <td className={classes.rightCells}>{final}</td>
          </tr>
          <tr>
            <td>Color</td>
            <td className={classes.colorPicker}><ColorPicker event={courseInMoreInfo} onColorChange={props.onColorChange}/></td>
          </tr>
          </tbody>
        </table>
      </Paper>
    </div>
  );
};

CourseCalendarEvent.propTypes = {
  courseInMoreInfo: PropTypes.object.isRequired,
  onClassDelete: PropTypes.func.isRequired,
  onColorChange: PropTypes.func.isRequired,
};

export default withStyles(styles)(CourseCalendarEvent);