import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

const styles = {
  container: {
    display: 'flex',
    height: '100%',

    border: '1px solid #ddd',
  },

  dayboxes: {
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'auto',

    '& > div': {
      flexGrow: 1,
      display: 'flex',
      alignItems: 'center',
      borderBottom: '1px solid gray',
      width: 'calc(1vw * 160)',
      position: 'relative',
    },
  },

  daylabels: {
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'center',
    padding: 2,

    '& > div': {
      flexGrow: 1,
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      height: `calc((100vh - 96px - 12px -48px)/5)`,
    },
  },
};

const CustomEvent = (props) => {
  const actualEvent = props.event;
  const startString = actualEvent.start.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endString = actualEvent.end.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (!actualEvent.isCustomEvent)
    return (
      <div style={{ fontSize: '0.6rem', padding: 1, color: 'white' }}>
        <div style={{ fontSize: '0.6rem', fontWeight: 500 }}>
          {startString.substring(0, startString.length - 2) +
            ' - ' +
            endString.substring(0, endString.length - 2)}
        </div>
        <div style={{ fontWeight: 500 }}>{actualEvent.title}</div>
        <div>{actualEvent.courseType}</div>
        <div>{actualEvent.location}</div>
      </div>
    );
  else
    return (
      <div
        style={{
          fontSize: '0.6rem',
          padding: 1,
          color: 'white',
          fontWeight: 500,
        }}
      >
        {actualEvent.title}
      </div>
    );
};

class MobileCalendar extends Component {
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.container}>
        <div className={classes.daylabels}>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
        </div>
        <div className={classes.dayboxes}>
          <div>
            {this.props.classEventsInCalendar.map((event) => {
              if (event.start !== 'tba' && event.start.getDay() === 1) {
                const style = {
                  width: `${(Math.floor((event.end - event.start) / 1000 / 60) /
                    60) *
                    6.5}%`,
                  left: `${(event.start.getHours() - 6) / 0.16 +
                    (event.start.getMinutes() / 60) * 6.25}%`,
                  height: '90%',
                  position: 'absolute',
                  borderRadius: 4,
                  backgroundColor: event.color,
                };
                return (
                  <div
                    onClick={(clickEvent) =>
                      this.props.onSelectEvent(event, clickEvent)
                    }
                    style={style}
                  >
                    <CustomEvent event={event} />
                  </div>
                );
              }
              return null;
            })}
          </div>

          <div>
            {this.props.classEventsInCalendar.map((event) => {
              if (event.start !== 'tba' && event.start.getDay() === 2) {
                const style = {
                  width: `${(Math.floor((event.end - event.start) / 1000 / 60) /
                    60) *
                    6.25}%`,
                  left: `${(event.start.getHours() - 6) / 0.16 +
                    (event.start.getMinutes() / 60) * 6.25}%`,
                  height: '90%',
                  position: 'absolute',
                  borderRadius: 4,
                  backgroundColor: event.color,
                };
                return (
                  <div
                    onClick={(clickEvent) =>
                      this.props.onSelectEvent(event, clickEvent)
                    }
                    style={style}
                  >
                    <CustomEvent event={event} />
                  </div>
                );
              }
              return null;
            })}
          </div>

          <div>
            {this.props.classEventsInCalendar.map((event) => {
              if (event.start !== 'tba' && event.start.getDay() === 3) {
                const style = {
                  width: `${(Math.floor((event.end - event.start) / 1000 / 60) /
                    60) *
                    6.25}%`,
                  left: `${(event.start.getHours() - 6) / 0.16 +
                    (event.start.getMinutes() / 60) * 6.25}%`,
                  height: '90%',
                  position: 'absolute',
                  borderRadius: 4,
                  backgroundColor: event.color,
                };
                return (
                  <div
                    onClick={(clickEvent) =>
                      this.props.onSelectEvent(event, clickEvent)
                    }
                    style={style}
                  >
                    <CustomEvent event={event} />
                  </div>
                );
              }
              return null;
            })}
          </div>

          <div>
            {this.props.classEventsInCalendar.map((event) => {
              if (event.start !== 'tba' && event.start.getDay() === 4) {
                const style = {
                  width: `${(Math.floor((event.end - event.start) / 1000 / 60) /
                    60) *
                    6.25}%`,
                  left: `${(event.start.getHours() - 6) / 0.16 +
                    (event.start.getMinutes() / 60) * 6.25}%`,
                  height: '90%',
                  position: 'absolute',
                  borderRadius: 4,
                  backgroundColor: event.color,
                };
                return (
                  <div
                    onClick={(clickEvent) =>
                      this.props.onSelectEvent(event, clickEvent)
                    }
                    style={style}
                  >
                    <CustomEvent event={event} />
                  </div>
                );
              }
              return null;
            })}
          </div>

          <div>
            {this.props.classEventsInCalendar.map((event) => {
              if (event.start !== 'tba' && event.start.getDay() === 5) {
                const style = {
                  width: `${(Math.floor((event.end - event.start) / 1000 / 60) /
                    60) *
                    6.25}%`,
                  left: `${(event.start.getHours() - 6) / 0.16 +
                    (event.start.getMinutes() / 60) * 6.25}%`,
                  height: '90%',
                  position: 'absolute',
                  borderRadius: 4,
                  backgroundColor: event.color,
                  marginTop: 2,
                  marginBottom: 2,
                };

                return (
                  <div
                    onClick={(clickEvent) =>
                      this.props.onSelectEvent(event, clickEvent)
                    }
                    style={style}
                  >
                    <CustomEvent event={event} />
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(MobileCalendar);
