import React, { Component, Suspense } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Help } from '@material-ui/icons';
// import PropTypes from 'prop-types';
import {
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Tooltip,
} from '@material-ui/core';
import loadingGif from '../CoursePane/loading.mp4';

const GraphRenderPane = React.lazy(() => import('./GraphRenderPane'));

const styles = (theme) => ({
  paper: {
    position: 'absolute',
    overflow: 'auto',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '65%',
    height: '90%',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
  },
  courseNotOfferedContainer: {
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex: { flexGrow: 1 },
});

class GraphModalContent extends Component {
  render() {
    return (
      <Paper className={this.props.classes.paper}>
        <Typography variant="title" className={this.props.classes.flex}>
          {'Historical Enrollments for ' +
            this.props.courseDetails.name[0] +
            ' ' +
            this.props.courseDetails.name[1] +
            '   '}
          <Tooltip title="Need Help with Graphs?">
            <a
              href="https://www.ics.uci.edu/~rang1/AntAlmanac/index.html#support"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'red' }}
            >
              <Help fontSize="48px" />
            </a>
          </Tooltip>
        </Typography>

        <br />

        <Typography variant="subtitle1">
          <b>BETA:</b> AI Graph Descriptions
        </Typography>
        <Typography variant="body1">
          Because graphs are meh, we asked our AI to provide descriptions for
          them! Our AI is still young, so these descriptions may be wrong;
          please always use them with the graphs and report any that is
          inaccurate!
        </Typography>

        <br />

        <FormControl fullWidth>
          <InputLabel htmlFor="term-select">Term</InputLabel>
          <Select
            value={this.props.term}
            onChange={this.props.handleChange}
            inputProps={{ name: 'term', id: 'term-select' }}
          >
            <MenuItem value={'2019 Winter'}>2019 Winter Quarter</MenuItem>
            <MenuItem value={'2018 Fall'}>2018 Fall Quarter</MenuItem>
            <MenuItem value={'2018 Spring'}>2018 Spring Quarter</MenuItem>
            <MenuItem value={'2018 Winter'}>2018 Winter Quarter</MenuItem>
          </Select>
        </FormControl>

        <br />
        <br />

        {this.props.sections.length === 0 ? (
          <div className={this.props.classes.courseNotOfferedContainer}>
            <Typography variant="h5">
              {'This course was not offered in ' + this.props.term}
            </Typography>
          </div>
        ) : (
          <div>
            {this.props.sections.map((section) => {
              return (
                <Suspense
                  fallback={
                    <div
                      style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'white',
                      }}
                    >
                      <video autoPlay loop>
                        <source src={loadingGif} type="video/mp4" />
                      </video>
                    </div>
                  }
                >
                  <GraphRenderPane
                    section={section}
                    quarter={this.props.term[5].toLowerCase()}
                    year={this.props.term.substring(2, 4)}
                    length={this.props.length}
                  />
                </Suspense>
              );
            })}
          </div>
        )}
      </Paper>
    );
  }
}

export default withStyles(styles)(GraphModalContent);
