import React, {Component, Fragment} from "react";
import {withStyles} from "@material-ui/core/styles";
import {Tooltip} from "@material-ui/core";
import querystring from "querystring";
import {Help} from "@material-ui/icons";
import PropTypes from 'prop-types';

import {
    Modal,
    Button,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography
} from "@material-ui/core";
import GraphRenderPane from "./GraphRenderPane";

const styles = theme => ({
    paper: {
        position: "absolute",
        overflow: "auto",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "75%",
        height: "85%",
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing.unit * 4
    },
    courseNotOfferedContainer: {
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    flex: {flexGrow: 1}
});

class AlmanacGraph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            term: "2018 Spring",
            sections: [],
            length: 0
        };
        this.handleOpen = this.handleOpen.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.fetchCourseData = this.fetchCourseData.bind(this);
        this.handleChange = this.handleChange.bind(this);

        this.fetchCourseData();
    }

    fetchCourseData() {
        const params = {
            department: this.props.courseDetails.name[0],
            term: this.state.term,
            courseTitle: this.props.courseDetails.name[2],
            courseNum: this.props.courseDetails.name[1]
        };

        const url =
            "https://j4j70ejkmg.execute-api.us-west-1.amazonaws.com/latest/api/websoc?" +
            querystring.stringify(params);

        fetch(url.toString())
            .then(resp => resp.json())
            .then(json => {
                const sections = json.reduce((accumulator, school) => {
                    school.departments.forEach(dept => {
                        dept.courses.forEach(course => {
                            course.sections.forEach(section => {
                                if (section.units !== "0") accumulator.push(section);
                            });
                        });
                    });

                    return accumulator;
                }, []);

                this.setState({length: sections.length}, () => {
                    this.setState({sections: sections});
                });
            });
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value}, () =>
            this.fetchCourseData()
        );
    }

    handleOpen() {
        this.setState({open: true});
    }

    handleClose() {
        this.setState({open: false});
    }

    render() {
        return (
            <Fragment>
                <Typography className={this.props.classes.flex}/>
                <Button variant="contained" color="secondary" onClick={this.handleOpen} style={{opacity: 0.8}}>
                    Past Enrollment
                </Button>

                <Modal open={this.state.open} onClose={this.handleClose}>
                    <Paper className={this.props.classes.paper}>
                        <Typography variant="title" className={this.props.classes.flex}>
                            {"Historical Enrollments for " +
                            this.props.courseDetails.name[0] +
                            " " +
                            this.props.courseDetails.name[1] +
                            "   "}
                            <Tooltip title="Need Help with Graphs?">
                                <a
                                    href="https://www.ics.uci.edu/~rang1/AntAlmanac/index.html#support"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{color: "red"}}
                                >
                                    <Help fontSize="48px"/>
                                </a>
                            </Tooltip>
                        </Typography>

                        <FormControl fullWidth>
                            <InputLabel htmlFor="term-select">Term</InputLabel>
                            <Select
                                value={this.state.term}
                                onChange={this.handleChange}
                                inputProps={{name: "term", id: "term-select"}}
                            >
                                <MenuItem value={"2019 Winter"}>2019 Winter Quarter</MenuItem>
                                <MenuItem value={"2018 Fall"}>2018 Fall Quarter</MenuItem>
                                <MenuItem value={"2018 Spring"}>2018 Spring Quarter</MenuItem>
                                <MenuItem value={"2018 Winter"}>2018 Winter Quarter</MenuItem>
                            </Select>
                        </FormControl>

                        {this.state.sections.length === 0 ? (
                            <div className={this.props.classes.courseNotOfferedContainer}>
                                <Typography variant="h1">
                                    {"This course was not offered in " + this.state.term}
                                </Typography>
                            </div>
                        ) : (
                            <div>
                                {this.state.sections.map(section => {
                                    return (
                                        <GraphRenderPane
                                            section={section}
                                            quarter={this.state.term[5].toLowerCase()}
                                            year={this.state.term.substring(2, 4)}
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
        prerequisiteLink: PropTypes.string
    })
};

export default withStyles(styles)(AlmanacGraph);
