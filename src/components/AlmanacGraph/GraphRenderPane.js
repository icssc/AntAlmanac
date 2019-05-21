import React, { Component, Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Button, Snackbar } from '@material-ui/core';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';

const styles = () => ({
  multiline: {
    whiteSpace: 'pre',
  },
  table: {
    borderCollapse: 'collapse',
    boxSizing: 'border-box',
    width: '100%',
    marginTop: '0.285rem',

    '& thead': {
      position: 'sticky',

      '& th': {
        border: '1px solid rgb(222, 226, 230)',
        fontSize: '0.85rem',
        fontWeight: '500',
        color: 'rgba(0, 0, 0, 0.54)',
        textAlign: 'left',
        verticalAlign: 'bottom',
      },
    },
  },
  tr: {
    fontSize: '0.85rem',
    '&:nth-child(odd)': {
      backgroundColor: '#f5f5f5',
    },

    '& td': {
      border: '1px solid rgb(222, 226, 230)',
      textAlign: 'left',
      verticalAlign: 'top',
    },
  },
});

class GraphRenderPane extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      graph: null,
      reported: false,
      disableReport: false,
    };
  }

  componentDidMount() {
    if (this.props.length < 4) {
      this.setState({ open: true }, () => {
        this.fetchGraph(
          this.props.quarter,
          this.props.year,
          this.props.section.classCode
        );
      });
    }
  }

  componentDidUpdate(prevProps, prevState, prevContext) {
    if (prevProps !== this.props && this.props.length < 4) {
      this.setState({ open: true }, () => {
        this.fetchGraph(
          this.props.quarter,
          this.props.year,
          this.props.section.classCode
        );
      });
    }
  }

  handleOpen = () => {
    this.setState({ open: !this.state.open }, () => {
      if (this.state.open && this.state.graph === null)
        this.fetchGraph(
          this.props.quarter,
          this.props.year,
          this.props.section.classCode
        );
    });
  };

  fetchGraph(quarter, year, code) {
    // const url = `https://l5qp88skv9.execute-api.us-west-1.amazonaws.com/dev/${quarter}/${year}/${code}`;
    const url = `https://bgu0fypajc.execute-api.us-west-1.amazonaws.com/prod/${quarter}/${year}/${code}`;

    fetch(url, { signal: this.signal })
      .then((resp) => resp.text())
      .then((resp) => {
        this.setState({ graph: { __html: resp } });
      });
  }

  render() {
    const { classes } = this.props;
    return (
      <Fragment>
        <table className={classes.table}>
          <tbody>
            <tr className={classes.tr}>
              <th>Toggle Graph</th>
              <th>Type</th>
              <th>Instructors</th>
              <th>Times</th>
              <th>Places</th>
              <th>Max Capacity</th>
            </tr>
            <tr className={classes.tr}>
              <td style={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  onClick={() => this.handleOpen()}
                  style={{
                    marginTop: 3,
                    backgroundColor: '#72a9ed',
                    boxShadow: 'none',
                    width: '90%',
                  }}
                >
                  {this.state.open ? 'CLOSE' : 'OPEN'}
                </Button>
              </td>
              <td className={classes.multiline}>
                {`${this.props.section.classType}
Section: ${this.props.section.sectionCode}
Units: ${this.props.section.units}`}
              </td>
              <td className={classes.multiline}>
                {this.props.section.instructors.join('\n')}
              </td>
              <td className={classes.multiline}>
                {this.props.section.meetings
                  .map((meeting) => meeting[0])
                  .join('\n')}
              </td>
              <td className={classes.multiline}>
                {this.props.section.meetings
                  .map((meeting) => meeting[1])
                  .join('\n')}
              </td>
              <td>{this.props.section.maxCapacity}</td>
            </tr>
          </tbody>
        </table>
        {
          <Fragment>
            {this.state.open ? (
              <Fragment>
                <Button
                  onClick={() => {
                    ReactGA.event({
                      category: 'Bad_Description',
                      action:
                        this.props.quarter +
                        ' ' +
                        this.props.year +
                        ' ' +
                        this.props.section.classCode,
                      label: 'Wrong Graph',
                    });
                    this.setState({ reported: true, disableReport: true });
                  }}
                  style={{ width: '100%', color: 'red' }}
                  disabled={this.state.disableReport}
                >
                  Please click here to automatically report an inaccurate graph
                  description below
                </Button>
                <div
                  style={{ width: '100%', textAlign: 'center' }}
                  dangerouslySetInnerHTML={this.state.graph}
                />
              </Fragment>
            ) : (
              <Fragment />
            )}
          </Fragment>
        }
        <hr />

        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          open={this.state.reported}
          autoHideDuration={1500}
          onClose={() => this.setState({ reported: false })}
          ContentProps={{ 'aria-describedby': 'message-id' }}
          message={<span id="message-id">Report sent!</span>}
        />
      </Fragment>
    );
  }
}

GraphRenderPane.propTypes = {
  section: PropTypes.shape({
    meetings: PropTypes.array,
    classCode: PropTypes.string,
    classType: PropTypes.string,
    sectionCode: PropTypes.string,
    units: PropTypes.string,
    instructors: PropTypes.array,
    numCurrentlyEnrolled: PropTypes.string,
    maxCapacity: PropTypes.string,
    numOnWaitlist: PropTypes.string,
    numNewOnlyReserved: PropTypes.string,
    restrictions: PropTypes.string,
    status: PropTypes.string,
  }),
  length: PropTypes.number,
  quarter: PropTypes.string,
  year: PropTypes.string,
};

export default withStyles(styles)(GraphRenderPane);
