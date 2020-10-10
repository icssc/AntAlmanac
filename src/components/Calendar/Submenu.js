import React, { Fragment, Suspense } from 'react';
import {
  Menu,
  MenuItem,
  MenuList,
  IconButton,
  Typography,
} from '@material-ui/core';
import { MoreVert } from '@material-ui/icons';
import CustomEventsDialog from '../CustomEvents/Popup';
import FinalSwitch from './FinalSwitch';
import ClearSchedButton from './ClearSchedButton';

const Sharing = React.lazy(() => import('./Sharing'));

class Submenu extends React.Component {
  state = {
    anchorEl: null,
  };

  handleClick = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    const events = this.props.eventsInCalendar;

    let result = [];
    let finalSchedule = [];
    for (let item of events)
      if (
        !item.isCustomEvent &&
        result.find(function(element) {
          return element.courseCode === item.courseCode;
        }) === undefined
      )
        result.push(item);

    for (let course of result) {
      if (course.section !== undefined) {
        let final = course.section.finalExam;

        if (final.length > 5) {
          let [, , , date, start, startMin, end, endMin, ampm] = final.match(
            /([A-za-z]+) *(\d{1,2}) *([A-za-z]+) *(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(p?)/
          );
          start = parseInt(start, 10);
          startMin = parseInt(startMin, 10);
          end = parseInt(end, 10);
          endMin = parseInt(endMin, 10);
          date = [
            date.includes('M'),
            date.includes('Tu'),
            date.includes('W'),
            date.includes('Th'),
            date.includes('F'),
          ];
          if (ampm === 'p' && end !== 12) {
            start += 12;
            end += 12;
            if (start > end) start -= 12;
          }

          date.forEach((shouldBeInCal, index) => {
            if (shouldBeInCal)
              finalSchedule.push({
                title: course.title,
                courseType: 'Fin',
                courseCode: course.courseCode,
                location: course.location,
                color: course.color,
                isCustomEvent: false,
                start: new Date(2018, 0, index + 1, start, startMin),
                end: new Date(2018, 0, index + 1, end, endMin),
              });
          });
        }
      }
    }

    const { anchorEl } = this.state;

    return (
      <Fragment>
        <IconButton onClick={this.handleClick}>
          <MoreVert fontSize="small" />
        </IconButton>
        <Menu
          id="submenu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <MenuList>
            <MenuItem disableGutters>
              <CustomEventsDialog
                onAddCustomEvent={this.props.onAddCustomEvent}
                handleSubmenuClose={this.handleClose}
              />
            </MenuItem>
            <MenuItem>
              <FinalSwitch
                displayFinal={this.props.displayFinal}
                schedule={finalSchedule}
                showFinalSchedule={this.props.showFinalSchedule}
              />
            </MenuItem>
            <MenuItem disableGutters>
              <ClearSchedButton
                handleSubmenuClose={this.handleClose}
                handleClearSchedule={this.props.handleClearSchedule}
                currentScheduleIndex={this.props.currentScheduleIndex}
              />
            </MenuItem>
            <MenuItem disableGutters>
              <Suspense
                fallback={
                  <Typography variant="h5" style={{ margin: 10 }}>
                    Holup...
                  </Typography>
                }
              >
                <Sharing onTakeScreenshot={this.props.onTakeScreenshot} />
              </Suspense>
            </MenuItem>
          </MenuList>
        </Menu>
      </Fragment>
    );
  }
}

export default Submenu;
