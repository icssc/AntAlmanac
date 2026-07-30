import { FC, useState, useEffect, useCallback } from 'react';
import Chart from './Chart';
import './GradeDist.scss';

import { CourseGQLData, ProfessorGQLData } from '../../types/types';
import { GradesRaw, QuarterName } from '@peterportal/types';
import trpc from '../../trpc';
import { Autocomplete, Card, CardContent, MenuItem, Select, Skeleton, TextField, Typography } from '@mui/material';
import MostUsedTags from './MostUsedTags';
import { getAggregateGradeData, getDiffAndColor } from '../../helpers/gradeDist';
import { shortenQuarter } from '../../helpers/util';
import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import { useAppSelector } from '../../store/hooks';
import { getAvgDifficulty, getAvgRating } from '../../helpers/reviews';

interface GradeDistProps {
    course?: CourseGQLData;
    professor?: ProfessorGQLData;
    minify?: boolean;
}

interface Entry {
    value: string;
    text: string;
}

type ChartTypes = 'bar' | 'pie';

const ALL_INSTRUCTORS = { value: 'ALL', text: 'All Instructors' };

const quarterOrder: QuarterName[] = ['Winter', 'Spring', 'Summer1', 'Summer10wk', 'Summer2', 'Fall'];

export async function fetchGradeDistData(props: GradeDistProps): Promise<GradesRaw> {
    let requests: Promise<GradesRaw>[];
    // course context
    if (props.course) {
        const params = {
            department: props.course.department,
            number: props.course.courseNumber,
        };
        requests = [trpc.courses.grades.query(params)];
    } else if (props.professor) {
        requests = props.professor.shortenedNames.map((name) => trpc.professors.grades.query({ name }));
    } else {
        return [];
    }

    const res = await Promise.all(requests);
    return res.flat();
}

const GradeDist: FC<GradeDistProps> = (props) => {
    /*
     * Initialize a GradeDist block on the webpage.
     * @param props attributes received from the parent element
     */

    const [gradeDistData, setGradeDistData] = useState<GradesRaw>();
    const [chartType, setChartType] = useState<ChartTypes>('bar');
    const [lastQuarter, setLastQuarter] = useState('');
    const [selectedQuarter, setSelectedQuarter] = useState('');
    const [currentProf, setCurrentProf] = useState('');
    const [profEntries, setProfEntries] = useState<Entry[]>();
    const [currentCourse, setCurrentCourse] = useState('');
    const [courseEntries, setCourseEntries] = useState<Entry[]>();
    const [quarterEntries, setQuarterEntries] = useState<Entry[]>();

    const reviews = useAppSelector((state) => state.review.reviews);

    const fetchGradeData = useCallback(() => {
        fetchGradeDistData(props)
            .then(setGradeDistData)
            .catch((error) => {
                setGradeDistData([]);
                console.error(error.response);
            });
    }, [props]);

    // reset any data from a previous course or professor, get new data for course or professor
    useEffect(() => {
        setGradeDistData(null!);
        fetchGradeData();
    }, [fetchGradeData]);

    /*
     * Create an array of objects to feed into the professor dropdown menu.
     * @return an array of JSON objects recording professor's names
     */
    const createProfEntries = useCallback(() => {
        const professors: Set<string> = new Set();
        const result: Entry[] = [ALL_INSTRUCTORS];

        gradeDistData!.forEach((match) => match.instructors.forEach((prof) => professors.add(prof)));

        Array.from(professors)
            .sort((a, b) => a.localeCompare(b))
            .forEach((professor) => result.push({ value: professor, text: professor }));

        setProfEntries(result);
        setCurrentProf(result[0].value);
    }, [gradeDistData]);

    /*
     * Create an array of objects to feed into the course dropdown menu.
     * @return an array of JSON objects recording course's names
     */
    const createCourseEntries = useCallback(() => {
        const courses: Set<string> = new Set();
        const result: Entry[] = [];

        gradeDistData!.forEach((match) => courses.add(match.department + ' ' + match.courseNumber));

        Array.from(courses)
            .sort((a, b) => a.localeCompare(b))
            .forEach((course) => result.push({ value: course, text: course }));

        setCourseEntries(result);
        setCurrentCourse(result[0].text);
    }, [gradeDistData]);

    // update list of professors/courses when new course/professor is detected
    useEffect(() => {
        if (gradeDistData?.length) {
            if (props.course) {
                createProfEntries();
            } else if (props.professor) {
                createCourseEntries();
            }
        }
    }, [gradeDistData, createCourseEntries, createProfEntries, props.course, props.professor]);

    /*
     * Create an array of objects to feed into the quarter dropdown menu.
     * @return an array of JSON objects recording each quarter
     */
    const createQuarterEntries = useCallback(() => {
        const quarters: Set<string> = new Set();
        const result: Entry[] = [{ value: 'ALL', text: 'All Quarters' }];

        gradeDistData!
            .filter((entry) => {
                const profMatch = currentProf === 'ALL' || entry.instructors.includes(currentProf);
                const courseMatch = entry.department + ' ' + entry.courseNumber == currentCourse;

                return profMatch || courseMatch;
            })
            .forEach((data) => quarters.add(data.quarter + ' ' + data.year));
        quarters.forEach((quarter) => result.push({ value: quarter, text: quarter }));

        setQuarterEntries(
            result.sort((a, b) => {
                if (a.value === 'ALL') {
                    return -1;
                }
                if (b.value === 'ALL') {
                    return 1;
                }
                const [thisQuarter, thisYear] = a.value.split(' ') as [QuarterName, string];
                const [thatQuarter, thatYear] = b.value.split(' ') as [QuarterName, string];
                if (thisYear === thatYear) {
                    return quarterOrder.indexOf(thatQuarter) - quarterOrder.indexOf(thisQuarter);
                } else {
                    return Number.parseInt(thatYear, 10) - Number.parseInt(thisYear, 10);
                }
            }),
        );
        setSelectedQuarter(result[0].value);
        setLastQuarter(result[1].value);
    }, [currentCourse, currentProf, gradeDistData]);

    // update list of quarters when new professor/course is chosen
    useEffect(() => {
        if ((currentProf || currentCourse) && gradeDistData?.length) {
            createQuarterEntries();
        }
    }, [currentProf, currentCourse, createQuarterEntries, gradeDistData]);

    const profCourseOptions = props.course ? profEntries : courseEntries;
    const profCourseSelectedValue = props.course ? currentProf : currentCourse;
    const updateProfCourse = (value: string | null) => {
        if (props.course) setCurrentProf(value!);
        else setCurrentCourse(value!);
    };

    const selectedQuarterName = quarterEntries?.find((q) => q.value === selectedQuarter)?.text ?? 'Quarter';
    const gradeDistReady =
        !!gradeDistData?.length &&
        !!quarterEntries?.length &&
        !!selectedQuarter &&
        (selectedQuarter === 'ALL' || !!lastQuarter);
    const failed = gradeDistData && gradeDistData.length === 0;
    const stillFetching = !gradeDistReady && !failed;

    const optionsRow = (
        <div className="gradedist-menu">
            {props.minify && (
                <div className="gradedist-filter">
                    <Select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value as ChartTypes)}
                        renderValue={() => 'Chart Type'}
                    >
                        <MenuItem key="bar" value="bar">
                            Bar
                        </MenuItem>
                        <MenuItem key="pie" value="pie">
                            Pie
                        </MenuItem>
                    </Select>
                </div>
            )}

            <div className="gradedist-filter">
                <Autocomplete
                    disableClearable
                    options={profCourseOptions ?? [ALL_INSTRUCTORS]}
                    value={profCourseOptions?.find((q) => q.value === profCourseSelectedValue) ?? ALL_INSTRUCTORS}
                    onChange={(_, newValue) => updateProfCourse(newValue?.value ?? null)}
                    getOptionLabel={(option) => option.text}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    renderInput={(params) => (
                        <TextField {...params} size="small" placeholder={props.course ? 'Instructor' : 'Course'} />
                    )}
                />
            </div>

            <div className="gradedist-filter">
                <Select
                    value={selectedQuarter}
                    onChange={(e) => setSelectedQuarter(e.target.value)}
                    renderValue={() => {
                        return selectedQuarterName;
                    }}
                    displayEmpty
                >
                    {quarterEntries?.map((q) => {
                        return (
                            <MenuItem key={q.value} value={q.value}>
                                {q.text}
                            </MenuItem>
                        );
                    })}
                </Select>
            </div>
        </div>
    );

    if (gradeDistReady) {
        const graphProps = {
            gradeData: gradeDistData,
            quarter: selectedQuarter,
            course: currentCourse,
            professor: currentProf,
        };
        const aggregateGradeData = getAggregateGradeData(gradeDistData, currentProf, selectedQuarter, currentCourse);
        const lastQuarterAggregateGradeData = getAggregateGradeData(
            gradeDistData,
            currentProf,
            lastQuarter,
            currentCourse,
        );

        const { diff: gpaDiff, color: gpaColor } = getDiffAndColor(
            aggregateGradeData.averageGPA,
            lastQuarterAggregateGradeData.averageGPA,
        );

        const formattedLastQuarter = shortenQuarter(lastQuarter);
        const formattedGpaDiff = Math.abs(gpaDiff).toFixed(1);

        const averageGPACard = (
            <Card variant="outlined" className="stat-card">
                <CardContent>
                    <Typography className="stat-label">Average GPA</Typography>
                    <div className="stat-value-row">
                        <Typography fontSize={32}>{aggregateGradeData.averageGPA}</Typography>
                        <Typography className="stat-unit" fontSize={20}>
                            {aggregateGradeData.averageGrade}
                        </Typography>
                    </div>
                    {selectedQuarter !== 'ALL' && selectedQuarter !== lastQuarter && (
                        <span className="stat-change-row">
                            <Typography color={gpaColor}>
                                {gpaDiff > 0 ? (
                                    <ArrowUpward fontSize="inherit" />
                                ) : gpaDiff < 0 ? (
                                    <ArrowDownward fontSize="inherit" />
                                ) : null}
                                {formattedGpaDiff}
                            </Typography>
                            <Typography color="textSecondary">from {formattedLastQuarter}</Typography>
                        </span>
                    )}
                </CardContent>
            </Card>
        );

        const filteredReviews =
            selectedQuarter === 'ALL'
                ? reviews
                : reviews.filter((r) => r.quarter === selectedQuarter.split(' ').reverse().join(' '));
        const lastQuarterReviews = reviews.filter((r) => r.quarter === lastQuarter.split(' ').reverse().join(' '));

        const currentAvgQuality = getAvgRating(filteredReviews);
        const lastAvgQuality = getAvgRating(lastQuarterReviews);

        const { diff: qualityDiff, color: qualityColor } = getDiffAndColor(currentAvgQuality, lastAvgQuality);
        const formattedQualityDiff = Math.abs(qualityDiff).toFixed(2);

        const averageQualityCard = (
            <Card variant="outlined" className="stat-card">
                <CardContent>
                    <Typography className="stat-label">Average Quality</Typography>
                    <div className="stat-value-row">
                        <Typography fontSize={32}>{currentAvgQuality ?? '—'}</Typography>
                        <Typography className="stat-unit stat-unit--baseline" fontSize={20}>
                            / 5
                        </Typography>
                    </div>
                    {currentAvgQuality &&
                        qualityDiff !== 0 &&
                        selectedQuarter !== 'ALL' &&
                        selectedQuarter !== lastQuarter &&
                        lastAvgQuality && (
                            <span className="stat-change-row">
                                <Typography color={qualityColor}>
                                    {qualityDiff > 0 ? (
                                        <ArrowUpward fontSize="inherit" />
                                    ) : qualityDiff < 0 ? (
                                        <ArrowDownward fontSize="inherit" />
                                    ) : null}
                                    {formattedQualityDiff}
                                </Typography>
                                <Typography color="textSecondary">from {formattedLastQuarter}</Typography>
                            </span>
                        )}
                </CardContent>
            </Card>
        );

        const currentAvgDifficulty = getAvgDifficulty(filteredReviews);

        const avgDifficultyCard = (
            <Card variant="outlined" className="stat-card">
                <CardContent>
                    <Typography className="stat-label">Average Difficulty</Typography>
                    <div className="stat-value-row">
                        <Typography fontSize={32}>{currentAvgDifficulty ?? '—'}</Typography>
                        <Typography className="stat-unit stat-unit--baseline" fontSize={20}>
                            / 5
                        </Typography>
                    </div>
                </CardContent>
            </Card>
        );

        return (
            <div className={`gradedist-module-container ${props.minify ? 'grade-dist-mini' : ''}`}>
                {optionsRow}
                <div className="gradedist-content">
                    <div className="gradedist-stats">
                        {averageGPACard}
                        {averageQualityCard}
                        {avgDifficultyCard}
                    </div>
                    {((props.minify && chartType == 'bar') || !props.minify) && (
                        <Card variant="outlined" className="grade-dist-chart-card">
                            <CardContent>
                                <div className="grade-dist-chart-container">
                                    <Chart {...graphProps} />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
                {reviews.length > 0 && <MostUsedTags reviews={reviews} />}
            </div>
        );
    } else if (stillFetching) {
        const skeletonStatCard = (
            <Card variant="outlined" className="stat-card">
                <CardContent>
                    <Skeleton width={90} height={20} />

                    <div className="stat-value-row">
                        <Skeleton width={70} height={50} />
                        <Skeleton width={40} height={30} />
                    </div>

                    <Skeleton width={120} height={20} />
                </CardContent>
            </Card>
        );

        const skeletonChartCard = (
            <Card variant="outlined" className="grade-dist-chart-card">
                <CardContent>
                    <Skeleton variant="rectangular" width="100%" height={300} />
                    <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={12}
                        style={{ marginTop: 12, borderRadius: 999 }}
                    />
                </CardContent>
            </Card>
        );

        const skeletonTagsCard = (
            <Card variant="outlined" className="most-used-tags">
                <CardContent>
                    <Skeleton width={140} height={28} />
                    <Skeleton width={96} height={18} style={{ marginBottom: 12 }} />
                    <Skeleton variant="rectangular" width="100%" height={54} style={{ marginBottom: 12 }} />
                    <Skeleton variant="rectangular" width="100%" height={54} style={{ marginBottom: 12 }} />
                    <Skeleton variant="rectangular" width="100%" height={54} />
                </CardContent>
            </Card>
        );

        return (
            <div className={`gradedist-module-container ${props.minify ? 'grade-dist-mini' : ''}`}>
                {optionsRow}
                <div className="gradedist-content">
                    <div className="gradedist-stats">
                        {skeletonStatCard}
                        {skeletonStatCard}
                        {skeletonStatCard}
                    </div>

                    {skeletonChartCard}
                </div>
                {skeletonTagsCard}
            </div>
        );
    } else {
        // gradeDistData is empty, did not receive any data from API call or received an error, display an error message
        return (
            <div className={`gradedist-module-container ${props.minify ? 'grade-dist-mini' : ''}`}>
                {optionsRow}
                <div className="gradedist-failed">
                    <p>
                        Grade distribution data is not available for this course. The course may not have been offered
                        recently.
                    </p>
                </div>
            </div>
        );
    }
};

export default GradeDist;
