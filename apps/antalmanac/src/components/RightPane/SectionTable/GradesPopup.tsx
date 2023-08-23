import { Theme } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap, Styles } from '@material-ui/core/styles/withStyles';
import { Skeleton } from '@material-ui/lab';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { isDarkMode, queryGrades } from '$lib/helpers';

const styles: Styles<Theme, object> = {
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

interface GradesPopupProps {
    deptCode: string;
    courseNumber: string;
    classes: ClassNameMap;
    isMobileScreen: boolean;
    showLink?: boolean;
}

interface GradeData {
    name: string;
    all: number;
}

const GradesPopup = ({ deptCode, courseNumber, classes, isMobileScreen, showLink = true }: GradesPopupProps) => {
    const [loading, setLoading] = useState(true);
    const [graphTitle, setGraphTitle] = useState<string | null>(null);
    const [gradeData, setGradeData] = useState<GradeData[] | null>(null);

    const loadGrades = async () => {
        if (loading === false) {
            return;
        }

        try {
            const courseGrades = await queryGrades(deptCode, courseNumber);

            const data = [];
            for (const [key, value] of Object.entries(courseGrades)) {
                // format data for display in chart
                // key formatting: sum_grade_a_count -> A
                if (key !== 'averageGPA') {
                    data.push({ name: key.split('_')[2]?.toUpperCase(), all: value as number });
                }
            }

            setGraphTitle(`Grade Distribution | Average GPA: ${courseGrades.averageGPA.toFixed(2)}`);
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

    void loadGrades();

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
                {showLink && (
                    <div style={{ margin: '5px', textAlign: 'center' }}>
                        <a
                            href={`https://zotistics.com/?&selectQuarter=&selectYear=&selectDep=${encodedDept}&classNum=${courseNumber}&code=&submit=Submit`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View on Zotistics
                        </a>
                    </div>
                )}
            </div>
        );
    }
};

export default withStyles(styles)(GradesPopup);
