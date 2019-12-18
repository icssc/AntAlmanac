import React, { Component, Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import querystring from 'querystring';
import { Help, Image } from '@material-ui/icons';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';
import {
    Modal,
    Button,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Tooltip,
} from '@material-ui/core';
import GraphRenderPane from './GraphRenderPane';

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

class AlmanacGraph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            term: '2018 Fall',
            sections: this.props.courseDetails.sections,
            length: 0,
        };
        console.log(this.props)

        this.handleOpen = this.handleOpen.bind(this);
        this.handleClose = this.handleClose.bind(this);

        this.handleChange = this.handleChange.bind(this);
    }

    handleOpen() {
      this.setState({
        open: true,
      })
      console.log(this.props)
    }

    // fetchCourseData() {
    //     const params = {
    //         department: this.props.courseDetails.name[0],
    //         term: this.state.term,
    //         courseTitle: this.props.courseDetails.name[2],
    //         courseNum: this.props.courseDetails.name[1],
    //     };
    //
    //     const url =
    //         'https://fanrn93vye.execute-api.us-west-1.amazonaws.com/latest/api/websoc?' +
    //         querystring.stringify(params);
    //
    //     fetch(url.toString())
    //         .then((resp) => resp.json())
    //         .then((json) => {
    //             const sections = json.reduce((accumulator, school) => {
    //                 school.departments.forEach((dept) => {
    //                     dept.courses.forEach((course) => {
    //                         course.sections.forEach((section) => {
    //                             if (section.units !== '0')
    //                                 accumulator.push(section);
    //                         });
    //                     });
    //                 });
    //
    //                 return accumulator;
    //             }, []);
    //
    //             this.setState({ length: sections.length }, () => {
    //                 this.setState({ sections: sections });
    //             });
    //         });
    // }

    handleChange(event) {
        this.setState({ [event.target.name]: event.target.value })
    }

    handleOpen() {
        console.log(this.props)
        this.setState({ open: true });
        ReactGA.event({
            category: 'Pass_enrollment',
            action:
                this.props.courseDetails.deptCode +
                ' ' +
                this.props.courseDetails.courseNumber,
            label: this.state.term,
        });
    }

    handleClose() {
        this.setState({ open: false });
    }

    render() {
        return (
            <Fragment>
                <Typography className={this.props.classes.flex} />
                <Button
                    variant="contained"
                    onClick={this.handleOpen}
                    style={{ backgroundColor: '#f8f17c', boxShadow: 'none' }}
                >
                    Past Enrollment&nbsp;&nbsp;
                    <Image fontSize="small" />
                </Button>

                <Modal open={this.state.open} onClose={this.handleClose}>
                    <Paper className={this.props.classes.paper}>
                        <Typography
                            variant="title"
                            className={this.props.classes.flex}
                        >
                            {'Historical Enrollments for ' +
                                this.props.courseDetails.deptCode +
                                ' ' +
                                this.props.courseDetails.courseNumber +
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
                            Because graphs are meh, we asked our AI to provide
                            descriptions for them! Our AI is still young, so
                            these descriptions may be wrong; please always use
                            them with the graphs and report any that is
                            inaccurate!
                        </Typography>

                        <br />

                        <FormControl fullWidth>
                            <InputLabel htmlFor="term-select">Term</InputLabel>
                            <Select
                                value={this.state.term}
                                onChange={this.handleChange}
                                inputProps={{ name: 'term', id: 'term-select' }}
                            >
                                <MenuItem value={'2019 Winter'}>
                                    2019 Winter Quarter
                                </MenuItem>
                                <MenuItem value={'2018 Fall'}>
                                    2018 Fall Quarter
                                </MenuItem>
                                <MenuItem value={'2018 Spring'}>
                                    2018 Spring Quarter
                                </MenuItem>
                                <MenuItem value={'2018 Winter'}>
                                    2018 Winter Quarter
                                </MenuItem>
                            </Select>
                        </FormControl>

                        <br />
                        <br />

                        {this.state.sections.length === 0 ? (
                            <div
                                className={
                                    this.props.classes.courseNotOfferedContainer
                                }
                            >
                                <Typography variant="h5">
                                    {'This course was not offered in ' +
                                        this.state.term}
                                </Typography>
                            </div>
                        ) : (
                            <div>
                                {this.state.sections.map((section) => {
                                    return (
                                        <GraphRenderPane
                                            section={section}
                                            quarter={this.state.term[5].toLowerCase()}
                                            year={this.state.term.substring(
                                                2,
                                                4
                                            )}
                                            length={this.state.length}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </Paper>
                </Modal>
            </Fragment>
        );
    }
}

AlmanacGraph.propTypes = {
    courseDetails: PropTypes.shape({
        name: PropTypes.array,
        comment: PropTypes.string,
        sections: PropTypes.object,
        prerequisiteLink: PropTypes.string,
    }),
};

export default withStyles(styles)(AlmanacGraph);
