import React, { PureComponent } from 'react';
import { Button, Popover } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { withStyles } from '@material-ui/core/styles';
import { PETERPORTAL_GRAPHQL_ENDPOINT } from '../../api/endpoints';
import { XAxis, YAxis, CartesianGrid, BarChart, Bar, ResponsiveContainer } from 'recharts';
import CourseInfoButton from './CourseInfoButton';

const styles = {
    button: {
        backgroundColor: '#385EB1',
        color: '#fff',
    },
    gpaTitle: {
        marginTop: '.5rem',
        textAlign: 'center',
        fontWeight: 500,
        fontSize: '1.2rem',
        marginRight: '4rem',
        marginLeft: '4rem',
    },
    skeleton: {
        padding: '4px',
    },
};

class GradeInfoBar extends PureComponent {
    state = {
        loading: true,
        anchorEl: null,
        graphTitle: null,
        gradeData: null,
    };

    togglePopover = async (currentTarget) => {
        if (Boolean(this.state.anchorEl)) {
            this.setState({ anchorEl: false });
            return;
        }
        this.setState({ anchorEl: currentTarget });

        if (this.state.loading === false) {
            return;
        }
        const { deptCode, courseNumber } = this.props;
        try {
            let querystring = `
            {   allgrades: grades(department: "${deptCode}", number: "${courseNumber}", ) {
                    aggregate {
                        sum_grade_a_count
                        sum_grade_b_count
                        sum_grade_c_count
                        sum_grade_d_count
                        sum_grade_f_count
                        sum_grade_p_count
                        sum_grade_np_count
                        average_gpa
                    }
                },
            }`;
            let query = JSON.stringify({
                query: querystring,
            });
            const response = await fetch(`${PETERPORTAL_GRAPHQL_ENDPOINT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: query,
            });

            if (response.ok) {
                const jsonResp = await response.json();
                let courseGrades = jsonResp.data.allgrades.aggregate;
                if (courseGrades.average_gpa === null) {
                    throw new Error('Grades are not available for this class.');
                }
                this.setState({
                    graphTitle: `Grade Distribution | Average GPA: ${courseGrades.average_gpa.toFixed(2)}`,
                });
                delete courseGrades.average_gpa;
                let data = [];
                for (const [key, value] of Object.entries(courseGrades)) {
                    // format data for display in chart
                    // key formatting: sum_grade_a_count -> A
                    data.push({ name: key.split('_')[2].toUpperCase(), all: value });
                }
                this.setState({ loading: false, gradeData: data });
            }
        } catch (e) {
            this.setState({
                anchorEl: currentTarget,
                gradeData: null,
                loading: false,
                graphTitle: 'Grades are not available for this class.',
            });
        }
    };

    render() {
        const { text, icon, classes, isMobileScreen } = this.props;
        return (
            <>
                <Button
                    className={classes.button}
                    startIcon={!isMobileScreen && icon}
                    variant="contained"
                    size="small"
                    onClick={(event) => {
                        const currentTarget = event.currentTarget;
                        this.togglePopover(currentTarget);
                    }}
                >
                    {text}
                </Button>
                <Popover
                    anchorEl={this.state.anchorEl}
                    open={Boolean(this.state.anchorEl)}
                    onClose={() => this.togglePopover(null)}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                >
                    {this.getPopoverContent()}
                </Popover>
            </>
        );
    }

    getPopoverContent = () => {
        const { classes, isMobileScreen } = this.props;
        if (this.state.loading) {
            return (
                <div className={this.props.classes.skeleton}>
                    <p>
                        <Skeleton variant="text" animation="wave" height={30} width={100} />
                    </p>
                </div>
            );
        } else {
            const { deptCode, courseNumber } = this.props;
            const encodedDept = encodeURIComponent(deptCode);

            return (
                <div style={{ marginTop: '5px' }}>
                    <div className={classes.gpaTitle}>{this.state.graphTitle}</div>
                    {this.state.gradeData && (
                        <ResponsiveContainer width={isMobileScreen ? 300 : 500} height={isMobileScreen ? 200 : 300}>
                            <BarChart data={this.state.gradeData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} width={40} />
                                <Bar dataKey="all" fill="#5182ed" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                    <div style={{ marginBottom: '5px', textAlign: 'center' }}>
                        <CourseInfoButton
                            text="Zotistics"
                            redirectLink={`https://zotistics.com/?&selectQuarter=&selectYear=&selectDep=${encodedDept}&classNum=${courseNumber}&code=&submit=Submit`}
                        />
                    </div>
                </div>
            );
        }
    };
}

export default withStyles(styles)(GradeInfoBar);
