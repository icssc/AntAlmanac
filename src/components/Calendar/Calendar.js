import React, { Component } from "react";
import BigCalendar from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import { Toolbar, Typography, Paper, Tooltip } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton/IconButton";
import {
  ChevronLeft,
  ChevronRight,
  Undo,
  OpenInBrowser,
  Delete
} from "@material-ui/icons";
import "./calendar.css";
import DialogSelect from "../CustomEvents/Popup";
import DomPic from "./DomPic";

BigCalendar.momentLocalizer(moment);

const CustomEvent = ({ event }) => {
  if (!event.customize)
    return (
      <div>
        <div style={{ marginTop: 4, marginBottom: 4, overflow: "hidden" }}>
          <div style={{ fontWeight: 500, float: "left" }}>{event.title}</div>
        </div>
        <div>{event.type + " " + event.location}</div>
      </div>
    );
  else {
    return (
      <div>
        <div style={{ marginTop: 4, marginBottom: 4, overflow: "hidden" }}>
          <div style={{ fontWeight: 500, float: "left" }}>{event.title}</div>
        </div>
      </div>
    );
  }
};

class Calendar extends Component {
  static eventStyleGetter(event, start, end, isSelected) {
    return {
      style: {
        backgroundColor: event.color,
        fontFamily: "Roboto",
        fontSize: 14,
        cursor: "pointer",
        borderRadius: 2
      }
    };
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return (
      this.props.classEventsInCalendar !== nextProps.classEventsInCalendar ||
      this.props.currentScheduleIndex !== nextProps.currentScheduleIndex
    );
  }
  //sorry boss
  // moreInfoURL = events => {
  //   let url =
  //     "https://www.reg.uci.edu/perl/WebSoc?YearTerm=2019-03&ShowFinals=1&ShowComments=1&CourseCodes=";
  //   for (let event of events) {
  //     url += event.courseID;
  //     url += "%2C";
  //   }
  //   window.open(url);
  // };

  render() {
    return (
      <div>
        <Paper style={{ overflow: "auto", marginBottom: 8 }}>
          <Toolbar variant="dense" style={{ backgroundColor: "#5191d6" }}>
            <IconButton onClick={() => this.props.onScheduleChange(0)}>
              <ChevronLeft />
            </IconButton>
            <Typography variant="subheading">
              {this.props.currentScheduleIndex + 1}
            </Typography>
            <IconButton onClick={() => this.props.onScheduleChange(1)}>
              <ChevronRight />
            </IconButton>
            <Typography style={{ flexGrow: 1 }} />
            <Tooltip title="Undo Last Delete">
              <IconButton onClick={this.props.clickToUndo}>
                <Undo />
              </IconButton>
            </Tooltip>
            <DomPic />
            <Tooltip title="More Info on Selected Classes">
              <IconButton onClick={this.props.moreInfoF}>
                <OpenInBrowser />
              </IconButton>
            </Tooltip>
            <DialogSelect
              onAddCustomEvent={this.props.onAddCustomEvent}
              setID={this.props.setID}
            />
            <Tooltip title="Clear All">
              <IconButton onClick={this.props.clear}>
                <Delete />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </Paper>
        <Paper id="screenshot">
          <div>
            <BigCalendar
              style={{ maxHeight: "80vh" }}
              toolbar={false}
              formats={{
                timeGutterFormat: (date, culture, localizer) =>
                  date.getMinutes() > 0
                    ? ""
                    : localizer.format(date, "h A", culture),
                dayFormat: "ddd"
              }}
              defaultView={BigCalendar.Views.WORK_WEEK}
              views={["work_week"]}
              step={15}
              timeslots={2}
              defaultDate={new Date(2018, 0, 1)}
              min={new Date(2018, 0, 1, 7)}
              max={new Date(2018, 0, 1, 23)}
              events={this.props.classEventsInCalendar}
              eventPropGetter={Calendar.eventStyleGetter}
              showMultiDayTimes={false}
              components={{ event: CustomEvent }}
              onSelectEvent={event =>
                this.props.onClassDelete(
                  event.courseID,
                  event.courseTerm,
                  event.customize
                )
              }
            />
          </div>
        </Paper>
      </div>
    );
  }
}

export default Calendar;
