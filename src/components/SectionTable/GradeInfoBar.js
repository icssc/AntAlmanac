import React, { useState } from 'react';
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

const GradeInfoBar = (props) => {
    const { deptCode, courseNumber, text, icon, classes, isMobileScreen } = props;

    const [loading, setLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const [graphTitle, setGraphTitle] = useState(null);
    const [gradeData, setGradeData] = useState(null);

    const togglePopover = async (currentTarget) => {
        if (Boolean(anchorEl)) {
            setAnchorEl(false);
            return;
        }
        setAnchorEl(currentTarget);

        if (loading === false) {
            return;
        }

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
                setGraphTitle(`Grade Distribution | Average GPA: ${courseGrades.average_gpa.toFixed(2)}`);
                delete courseGrades.average_gpa;
                let data = [];
                for (const [key, value] of Object.entries(courseGrades)) {
                    // format data for display in chart
                    // key formatting: sum_grade_a_count -> A
                    data.push({ name: key.split('_')[2].toUpperCase(), all: value });
                }
                setLoading(false);
                setGradeData(data);
            }
        } catch (e) {
            setLoading(false);
            setAnchorEl(currentTarget);
            setGraphTitle('Grades are not available for this class.');
        }
    };

    const getPopoverContent = () => {
        if (loading) {
            return (
                <div className={classes.skeleton}>
                    <p>
                        <Skeleton variant="text" animation="wave" height={30} width={100} />
                    </p>
                </div>
            );
        } else {
            const encodedDept = encodeURIComponent(deptCode);

            return (
                <div style={{ marginTop: '5px' }}>
                    <div className={classes.gpaTitle}>{graphTitle}</div>
                    {gradeData && (
                        <ResponsiveContainer width={isMobileScreen ? 300 : 500} height={isMobileScreen ? 200 : 300}>
                            <BarChart data={gradeData}>
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

    return (
        <>
            <Button
                className={classes.button}
                startIcon={!isMobileScreen && icon}
                variant="contained"
                size="small"
                onClick={(event) => {
                    const currentTarget = event.currentTarget;
                    togglePopover(currentTarget);
                }}
            >
                {text}
            </Button>
            <Popover
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => togglePopover(null)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                {getPopoverContent()}
            </Popover>
        </>
    );
};

export default withStyles(styles)(GradeInfoBar);
