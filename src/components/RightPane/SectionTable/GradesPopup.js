import React, { useState } from 'react';
import { Skeleton } from '@material-ui/lab';
import { withStyles } from '@material-ui/core/styles';
import { XAxis, YAxis, CartesianGrid, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { queryGrades, isDarkMode } from '../../../helpers';

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

const GradesPopup = ({ deptCode, courseNumber, classes, isMobileScreen }) => {
    const [loading, setLoading] = useState(true);
    const [graphTitle, setGraphTitle] = useState(null);
    const [gradeData, setGradeData] = useState(null);

    const loadGrades = async () => {
        if (loading === false) {
            return;
        }

        try {
            let courseGrades = await queryGrades(deptCode, courseNumber);

            let data = [];
            for (const [key, value] of Object.entries(courseGrades)) {
                // format data for display in chart
                // key formatting: sum_grade_a_count -> A
                if (key !== 'average_gpa') {
                    data.push({ name: key.split('_')[2]?.toUpperCase(), all: value });
                }
            }

            setGraphTitle(`Grade Distribution | Average GPA: ${courseGrades.average_gpa.toFixed(2)}`);
            setGradeData(data);
            setLoading(false);
        } catch (e) {
            console.log(e);
            setLoading(false);
            setGraphTitle('Grades are not available for this class.');
        }
    };

    const width = isMobileScreen ? 300 : 500;
    const height = isMobileScreen ? 200 : 300;

    loadGrades();

    if (loading) {
        return (
            <div className={classes.skeleton}>
                <p>
                    <Skeleton variant="text" animation="wave" height={height} width={width} />
                </p>
            </div>
        );
    } else {
        const encodedDept = encodeURIComponent(deptCode);
        const axisColor = isDarkMode() ? '#fff' : '#111';

        return (
            <div style={{ marginTop: '5px' }}>
                <div className={classes.gpaTitle}>{graphTitle}</div>
                {gradeData && (
                    <ResponsiveContainer width={width} height={height}>
                        <BarChart data={gradeData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: axisColor }} />
                            <YAxis tick={{ fontSize: 12, fill: axisColor }} width={40} />
                            <Bar dataKey="all" fill="#5182ed" />
                        </BarChart>
                    </ResponsiveContainer>
                )}
                <div style={{ margin: '5px', textAlign: 'center' }}>
                    <a
                        href={`https://zotistics.com/?&selectQuarter=&selectYear=&selectDep=${encodedDept}&classNum=${courseNumber}&code=&submit=Submit`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View on Zotistics
                    </a>
                </div>
            </div>
        );
    }
};

export default withStyles(styles)(GradesPopup);
