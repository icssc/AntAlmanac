import { ScheduleCourse } from '@packages/antalmanac-types';
import {
    DayOfWeek,
    HourMinute,
    WebsocSectionFinalExam,
    WebsocSectionMeeting,
    daysOfWeek,
} from 'peterportal-api-next-types';
import AppStore from '$stores/AppStore';

const CURRENT_TERM = '2024 Winter'; // TODO: Check the current term when that PR's in
let sampleClassesSectionCodes: Array<string> = [];

export function addSampleClasses() {
    if (AppStore.getAddedCourses().length > 0) return;

    const sampleClassesOptions: sampleClassOptions[] = [
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
        {
            meetings: [
                {
                    bldg: ['SSH 100'],
                    days: 'MWF',
                    startTime: {
                        hour: 11,
                        minute: 0,
                    },
                    endTime: {
                        hour: 12,
                        minute: 20,
                    },
                    timeIsTBA: false,
                },
            ],
        },
        {
            meetings: [
                {
                    bldg: ['ALP 100'],
                    days: 'TuTh',
                    startTime: {
                        hour: 11,
                        minute: 0,
                    },
                    endTime: {
                        hour: 11,
                        minute: 50,
                    },
                    timeIsTBA: false,
                },
            ],
        },
    ];

    const sampleClasses: Array<ScheduleCourse> = sampleClassesOptions.map(sampleClassFactory);

    sampleClasses.forEach((sampleClass) => {
        AppStore.addCourse(sampleClass);
        sampleClassesSectionCodes.push(sampleClass.section.sectionCode);
    });
}

export function removeSampleClasses() {
    AppStore.deleteCourses(sampleClassesSectionCodes, CURRENT_TERM, false);
    sampleClassesSectionCodes = [];
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

function randomStartEndTime(duration: number): [HourMinute, HourMinute] {
    const start = randomClasstime();
    const end = {
        hour: start.hour + duration / 60,
        minute: start.minute + (duration % 60),
    };
    return [start, end];
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
}: Partial<WebsocSectionMeeting>): WebsocSectionMeeting[] {
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
    month = 11,
    day = 12,
    startTime,
    endTime,
    bldg = ['DBH'],
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

    const [randomStartTime, randomEndTime] = randomStartEndTime(120);
    startTime = startTime ?? randomStartTime;
    endTime = endTime ?? randomEndTime;

    return {
        examStatus,
        dayOfWeek: dayOfWeek ?? randomWeekday(),
        month,
        day,
        startTime: startTime,
        endTime: endTime,
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
        term: CURRENT_TERM,
        section: {
            color: '#FF0000',
            instructors: instructors,
            maxCapacity: '500',
            meetings: meetings ?? sampleMeetingsFactory({}),
            finalExam: finalExam ?? sampleFinalExamFactory({}),
            numCurrentlyEnrolled: {
                sectionEnrolled: '500',
                totalEnrolled: '500',
            },
            numNewOnlyReserved: '0',
            numOnWaitlist: '99',
            numRequested: '0',
            numWaitlistCap: '100',
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
