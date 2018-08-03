import React, {Component} from 'react'
import BigCalendar from 'react-big-calendar'
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";

BigCalendar.momentLocalizer(moment);

class Calendar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            events: [{
                start: new Date(2018, 0, 1, 8),
                end: new Date(2018, 0, 1, 8, 50),
                title: "ICS 33"
            }]
        }
    }

    render() {
        return (
            <BigCalendar
                selectable
                toolbar={false}
                formats={{
                    timeGutterFormat: (date, culture, localizer) => date.getMinutes() > 0 ? '' : localizer.format(date, 'h A', culture),
                    dayFormat: 'ddd'
                }}
                defaultView={BigCalendar.Views.WORK_WEEK}
                views={['work_week']}
                step={15}
                timeslots={2}
                defaultDate={new Date(2018, 0, 1)}
                min={new Date(2018, 0, 1, 8)}
                max={new Date(2018, 0, 1, 22)}
                events={this.state.events}
            />
        )
    }
}

export default Calendar