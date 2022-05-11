import React, { PureComponent } from 'react';
import { Button, Popover } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { withStyles } from '@material-ui/core/styles';
import { PETERPORTAL_GRAPHQL_ENDPOINT } from '../../api/endpoints';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, BarChart, Bar, Legend, Tooltip } from 'recharts';
import { exception } from 'react-ga';

const styles = {
    button: {
        marginRight: '4px',
        backgroundColor: '#385EB1',
        color: '#fff',
    },
    gpaTitle: {
        marginTop: '.5rem',
        textAlign: 'center',
        fontWeight: 500,
        fontSize: '1.2rem',
    },
};

class GradeInfoBar extends PureComponent {
    // const isMobileScreen = useMediaQuery('(max-width: 750px)');
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
            // const courseId = encodeURIComponent(
            //     `${deptCode.replace(/\s/g, '')}${courseNumber.replace(/\s/g, '')}`
            //     );
            let query = JSON.stringify({
                query: `
                { grades(department: "${deptCode}", number: "${courseNumber}") {
                        aggregate{
                            sum_grade_a_count
                            sum_grade_b_count
                            sum_grade_c_count
                            sum_grade_d_count
                            sum_grade_f_count
                            sum_grade_p_count
                            sum_grade_np_count
                            average_gpa
                        }
                    }
                }`,
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
                console.log('hello');
                const jsonResp = await response.json();
                console.log(jsonResp);
                let aggGrades = jsonResp.data.grades.aggregate;
                if (aggGrades.average_gpa === null) {
                    throw 'Grades not available for this class.';
                }
                this.setState({ graphTitle: `Average GPA: ${aggGrades.average_gpa.toFixed(2)}` });
                delete aggGrades.average_gpa;
                let data = [];
                for (const [key, value] of Object.entries(aggGrades)) {
                    // format data for display in chart
                    // key: sum_grade_a_count -> A
                    data.push({ name: key.split('_')[2].toUpperCase(), value: value });
                }
                console.log(data);
                this.setState({ loading: false, gradeData: data });
            }
        } catch (e) {
            this.setState({
                anchorEl: currentTarget,
                gradeData: null,
                loading: false,
                graphTitle: 'Grades not available for this class.',
            });
        }
    };

    render() {
        const { text } = this.props;
        return (
            <>
                <Button
                    // startIcon={!isMobileScreen && icon}
                    variant="contained"
                    size="small"
                    style={{
                        marginRight: '4px',
                        backgroundColor: '#385EB1',
                        color: '#fff',
                    }}
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
        const { classes } = this.props;
        if (this.state.loading) {
            return (
                <div className={this.props.classes.skeleton}>
                    <p>
                        <Skeleton variant="text" animation="wave" height={30} width={100} />
                    </p>
                </div>
            );
        } else {
            return (
                <div style={{ margin: '5px' }}>
                    <div className={classes.gpaTitle}>Grade Distribution | {this.state.graphTitle}</div>
                    {this.state.gradeData && (
                        <BarChart width={550} height={300} data={this.state.gradeData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Bar dataKey="value" fill="#5182ed" />
                        </BarChart>
                    )}
                </div>
            );
        }
    };
}

export default withStyles(styles)(GradeInfoBar);
