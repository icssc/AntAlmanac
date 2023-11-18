import { ScheduleCourse } from '@packages/antalmanac-types';
import {
    DayOfWeek,
    HourMinute,
    WebsocSectionFinalExam,
    WebsocSectionMeeting,
    daysOfWeek,
} from 'peterportal-api-next-types';
import AppStore from '$stores/AppStore';

export function addSampleClasses() {
    if (AppStore.getAddedCourses().length > 0) return;

    const sampleClasses: Array<ScheduleCourse> = [
        {
            courseTitle: 'Nice',
            deptCode: 'GEN&SEX',
            courseNumber: '69',
            instructors: ['Your mother'],
            meetings: [
                {
                    bldg: ['DBH'],
                    days: 'MWF',
                    startTime: {
                        hour: 10,
                        minute: 0,
                    },
                    endTime: {
                        hour: 10,
                        minute: 50,
                    },
                    timeIsTBA: false,
                },
            ],
        },
        {
            meetings: [
                {
                    bldg: ['ELH 100'],
                    days: 'TuTh',
                    startTime: {
                        hour: 9,
                        minute: 30,
                    },
                    endTime: {
                        hour: 10,
                        minute: 50,
                    },
                    timeIsTBA: false,
                },
            ],
        },
    ].map(sampleClassFactory);

    sampleClasses.forEach((sampleClass) => {
        AppStore.addCourse(sampleClass);
    });
}

export function randint(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomWeekday(): DayOfWeek {
    return daysOfWeek[randint(0, 6)];
}

function randomClasstime(): HourMinute {
    return {
        hour: randint(8, 17),
        minute: randint(0, 5) * 10,
    };
}

export function sampleMeetingsFactory({
    bldg = ['DBH 1200'],
    days = 'MWF',
    startTime = {
        hour: 11,
        minute: 0,
    },
    endTime = {
        hour: 11,
        minute: 50,
    },
    timeIsTBA = false,
}: Partial<WebsocSectionMeeting>) {
    return [
        {
            bldg,
            days,
            startTime,
            endTime,
            timeIsTBA,
        },
    ];
}

export function sampleFinalExamFactory({
    examStatus = 'SCHEDULED_FINAL',
    dayOfWeek,
    month = 12,
    day = 12,
    startTime,
    endTime,
    bldg = [],
}: Partial<WebsocSectionFinalExam>): WebsocSectionFinalExam {
    if (examStatus == 'NO_FINAL')
        return {
            examStatus,
            dayOfWeek: 'Mon',
            month: 0,
            day: 0,
            startTime: {
                hour: 0,
                minute: 0,
            },
            endTime: {
                hour: 0,
                minute: 0,
            },
            bldg,
        };

    return {
        examStatus,
        dayOfWeek: dayOfWeek ?? randomWeekday(),
        month,
        day,
        startTime: startTime ?? randomClasstime(),
        endTime: endTime ?? randomClasstime(),
        bldg,
    };
}

interface sampleClassOptions {
    courseComment?: string;
    courseNumber?: string;
    courseTitle?: string;
    deptCode?: string;
    instructors?: string[];
    meetings?: Array<WebsocSectionMeeting>;
    finalExam?: WebsocSectionFinalExam;
}

export function sampleClassFactory({
    courseComment = '',
    courseNumber = '-1',
    courseTitle = 'Example class',
    deptCode = 'CS',
    instructors = ['Professor X'],
    meetings,
    finalExam,
}: sampleClassOptions): ScheduleCourse {
    return {
        courseComment: courseComment,
        courseNumber: courseNumber == '-1' ? randint(100, 199).toString() : courseNumber,
        courseTitle: courseTitle,
        deptCode: deptCode,
        prerequisiteLink: '',
        term: '2024 Winter', // TODO: Check the current term when that PR's in
        section: {
            color: '#FF0000',
            instructors: instructors,
            maxCapacity: '1000',
            meetings: meetings ?? sampleMeetingsFactory({}),
            finalExam: finalExam ?? sampleFinalExamFactory({}),
            numCurrentlyEnrolled: {
                sectionEnrolled: '100',
                totalEnrolled: '100',
            },
            numNewOnlyReserved: '0',
            numOnWaitlist: '0',
            numRequested: '0',
            numWaitlistCap: '0',
            restrictions: '',
            sectionCode: randint(10000, 99999).toString(),
            sectionComment: '',
            sectionNum: '1',
            sectionType: 'LEC',
            status: 'Waitl',
            units: '4',
        },
    };
}
