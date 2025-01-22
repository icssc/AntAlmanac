import { SectionSearchResult } from "@packages/antalmanac-types";

interface SectionData {
    sectionCode: string;
    sectionType: string;
    sectionNum: string;
}

interface CourseData {
    courseTitle: string;
    courseNumber: string;
    sections: SectionData[];
}

interface DepartmentData {
    deptCode: string;
    courses: CourseData[];
}

export interface SectionCodesGraphQLResponse {
    data: {
        websoc: {
            schools: {
                departments: DepartmentData[]
            }[]
        }
    };
}

export function parseSectionCodes(response: SectionCodesGraphQLResponse): Record<string, SectionSearchResult> {
    const results: Record<string, SectionSearchResult> = {};

    response.data.websoc.schools.forEach(school => {
        school.departments.forEach(department => {
            department.courses.forEach(course => {
                course.sections.forEach(section => {
                    const sectionCode = section.sectionCode;
                    results[sectionCode] = {
                        type: 'SECTION',
                        department: department.deptCode,
                        courseNumber: course.courseNumber,
                        sectionCode: section.sectionCode,
                        sectionNum: section.sectionNum,
                        sectionType: section.sectionType,
                    };
                });
            });
        });
    });

    return results;
}

class Term {
    shortName: `${string} ${string}`;
    constructor(
        shortName: `${string} ${string}`,
    ) {
        this.shortName = shortName;
    }
}

/**
 * Quarterly Academic Calendar {@link https://www.reg.uci.edu/calendars/quarterly/2023-2024/quarterly23-24.html}
 * Quick Reference Ten Year Calendar {@link https://www.reg.uci.edu/calendars/academic/tenyr-19-29.html}
 * The `startDate`, if available, should correspond to the __instruction start date__ (not the quarter start date)
 * The `finalsStartDate`, if available, should correspond to the __final exams__ first date (should be a Saturday)
 * Months are 0-indexed
 */
export const termData = [ // Will be automatically fetched from Anteater API
    new Term('2025 Winter'),
    new Term('2024 Fall'),
    new Term('2024 Summer2'),
    new Term('2024 Summer10wk'),
    new Term('2024 Summer1'),
    new Term('2024 Spring'),
    new Term('2024 Winter'),
    new Term('2023 Fall'),
    new Term('2023 Summer2'),
    new Term('2023 Summer10wk'),
    new Term('2023 Summer1'),
    new Term('2023 Spring'),
    new Term('2023 Winter'),
    new Term('2022 Fall'),
    new Term('2022 Summer2'),
    new Term('2022 Summer10wk'), // nominal start date for SS1 and SS10wk
    new Term('2022 Summer1'), // since Juneteenth is observed 6/20/22
    new Term('2022 Spring'),
    new Term('2022 Winter'),
    new Term('2021 Fall'),
    new Term('2021 Summer2'),
    new Term('2021 Summer10wk'),
    new Term('2021 Summer1'),
    new Term('2021 Spring'),
    new Term('2021 Winter'),
    new Term('2020 Fall'),
    new Term('2020 Summer2'),
    new Term('2020 Summer10wk'),
    new Term('2020 Summer1'),
    new Term('2020 Spring'),
    new Term('2020 Winter'),
    new Term('2019 Fall'),
    new Term('2019 Summer2'),
    new Term('2019 Summer10wk'),
    new Term('2019 Summer1'),
    new Term('2019 Spring'),
    new Term('2019 Winter'),
    new Term('2018 Fall'),
    new Term('2018 Summer2'),
    new Term('2018 Summer10wk'),
    new Term('2018 Summer1'),
    new Term('2018 Spring'),
    new Term('2018 Winter'),
    new Term('2017 Fall'),
    new Term('2017 Summer2'),
    new Term('2017 Summer10wk'),
    new Term('2017 Summer1'),
    new Term('2017 Spring'),
    new Term('2017 Winter'),
    new Term('2016 Fall'),
    new Term('2016 Summer2'),
    new Term('2016 Summer10wk'),
    new Term('2016 Summer1'),
    new Term('2016 Spring'),
    new Term('2016 Winter'),
    new Term('2015 Fall'),
    new Term('2015 Summer2'),
    new Term('2015 Summer10wk'),
    new Term('2015 Summer1'),
    new Term('2015 Spring'),
    new Term('2015 Winter'),
    new Term('2014 Fall'),
];