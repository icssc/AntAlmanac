import React, { Component, Fragment } from "react";
import BigCalendar from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "../../../node_modules/@material-ui/core/IconButton/IconButton";
import { ChevronLeft, ChevronRight, Add } from "@material-ui/icons";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import DialogSelect from "../CustomEvents/Popup";
import DomPic from '../AlmanacGraph/DomPic'
import domModel from '../AlmanacGraph/domModel'

BigCalendar.momentLocalizer(moment);

const CustomEvent = ({ event }) => (
  <div>
    <div style={{ marginTop: 4, marginBottom: 4, overflow: "hidden" }}>
      <div style={{ fontWeight: 500, float: "left" }}>{event.title}</div>
      <div style={{ float: "right" }}>{event.type}</div>
    </div>
    <div style={{ clear: "left" }}>{event.location}</div>
  </div>
);

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

  render() {
    return (
      <div  id="cal">
        <Paper style={{ overflow: "allow", marginBottom: 5 }}>
          <Toolbar variant="dense" style={{ backgroundColor: "#5191d6" }}>
            <IconButton onClick={() => this.props.onScheduleChange(0)}>
              <ChevronLeft />
            </IconButton>
            <IconButton onClick={() => this.props.onScheduleChange(1)}>
              <ChevronRight />
            </IconButton>
            <Typography variant="subheading" style={{ flexGrow: 1 }}>
              {"Schedule " + (this.props.currentScheduleIndex + 1)}
            </Typography>
            <DomPic/>
            <domModel/>
            <DialogSelect
              onAddCustomEvent={this.props.onAddCustomEvent}
              setID={this.props.setID}
            />
          </Toolbar>
        </Paper>

        <Paper style={{ overflow: "auto", maxHeight: "80vh" }}>
          <BigCalendar
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
            components={{ event: CustomEvent }}
            onSelectEvent={event =>
              this.props.onClassDelete(event.courseID, event.courseTerm)
            }
          />
        </Paper>
      </div>
    );
  }
}

export default Calendar;
