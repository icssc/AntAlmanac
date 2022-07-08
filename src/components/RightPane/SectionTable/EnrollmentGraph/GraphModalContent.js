import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { FormControl, InputLabel, MenuItem, Paper, Select, Typography } from '@material-ui/core';
import GraphRenderPane from './GraphRenderPane';
import { queryWebsoc } from '../../../../helpers';
import { termData, defaultTerm } from '../../../../termData';

const styles = {
    paper: {
        position: 'absolute',
        overflow: 'auto',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '65%',
        height: '90%',
        padding: '8px',
    },
    courseNotOfferedContainer: {
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    flex: { flexGrow: 1 },
};

class GraphModalContent extends PureComponent {
    state = {
        pastTerm: termData[defaultTerm + 1].shortName,
        pastSections: null,
    };

    componentDidMount = async () => {
        await this.fetchCourseData();
    };

    fetchCourseData = async () => {
        const params = {
            department: this.props.courseDetails.deptCode,
            term: this.state.pastTerm,
            courseTitle: this.props.courseDetails.courseTitle,
            courseNumber: this.props.courseDetails.courseNumber,
        };

        const response = await queryWebsoc(params);

        const jsonResp = await response.json();

        const pastSections = jsonResp.schools.reduce((accumulator, school) => {
            school.departments.forEach((dept) => {
                dept.courses.forEach((course) => {
                    course.sections.forEach((section) => {
                        if (section.units !== '0') accumulator.push(section);
                    });
                });
            });

            return accumulator;
        }, []);

        this.setState({ pastSections });
    };

    handleChange = (event) => {
        this.setState({ pastTerm: event.target.value }, () => this.fetchCourseData());
    };

    render() {
        const { classes } = this.props;

        let whatToDisplay;

        if (this.state.pastSections === null) {
            whatToDisplay = <div className={classes.courseNotOfferedContainer}>Loading...</div>;
        } else if (this.state.pastSections.length === 0) {
            whatToDisplay = (
                <div className={classes.courseNotOfferedContainer}>
                    <Typography variant="h5">{`This course wasn't offered in ${this.state.pastTerm}`}</Typography>
                </div>
            );
        } else {
            whatToDisplay = this.state.pastSections.map((pastSection) => {
                return <GraphRenderPane pastTerm={this.state.pastTerm} pastSection={pastSection} />;
            });
        }

        return (
            <Paper className={classes.paper}>
                <Typography variant="h5" className={classes.flex}>
                    {`Historical Enrollment for  ${this.props.courseDetails.deptCode} ${this.props.courseDetails.courseNumber}`}
                </Typography>

                <FormControl fullWidth>
                    <InputLabel>Term</InputLabel>
                    <Select value={this.state.pastTerm} onChange={this.handleChange}>
                        {termData
                            .slice(defaultTerm + 2, defaultTerm + 8)
                            .filter((q) => !q.shortName.includes('Summer'))
                            .reverse()
                            .map((q) => (
                                <MenuItem value={q.shortName}>{q.longName}</MenuItem>
                            ))}
                    </Select>
                </FormControl>
                {whatToDisplay}
            </Paper>
        );
    }
}

export default withStyles(styles)(GraphModalContent);
